from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from auth.models import User, AuthProvider
from auth.schemas import UserCreate, UserLogin
from core.security import verify_password, get_password_hash, create_access_token
from datetime import timedelta
from core.config import settings
from authlib.integrations.requests_client import OAuth2Session
from typing import Optional
import json
import requests


class AuthService:
    """Authentication service"""
    
    @staticmethod
    def register_user(db: Session, user_create: UserCreate) -> User:
        """Register a new user with email/password"""
        print(f"DEBUG - Password length: {len(user_create.password)} chars, {len(user_create.password.encode('utf-8'))} bytes")
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_create.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_create.password)
        user = User(
            email=user_create.email,
            username=user_create.username,
            full_name=user_create.full_name,
            hashed_password=hashed_password,
            auth_provider=AuthProvider.EMAIL,
            is_active=True,
            is_verified=False  # In production, implement email verification
        )
        
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already exists"
            )
    
    @staticmethod
    def authenticate_user(db: Session, user_login: UserLogin) -> User:
        """Authenticate a user with email/password"""
        user = db.query(User).filter(User.email == user_login.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        if user.auth_provider != AuthProvider.EMAIL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please use the correct authentication method for this account"
            )
        
        if not user.hashed_password or not verify_password(user_login.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def create_token_for_user(user: User) -> str:
        """Create access token for user"""
        token_data = {"sub": str(user.id), "email": user.email}
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data=token_data, expires_delta=access_token_expires
        )
        return access_token
    
    @staticmethod
    async def authenticate_google_user(db: Session, token: str) -> User:
        """Authenticate user with Google ID token or access token"""
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )
        
        try:
            import requests
            
            # Verify Google ID token and get user info
            # For ID token verification, use Google's tokeninfo endpoint
            # In production, consider using google-auth library for proper verification
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            headers = {"Authorization": f"Bearer {token}"}
            resp = requests.get(user_info_url, headers=headers)
            
            if resp.status_code != 200:
                # Try with tokeninfo endpoint for ID tokens
                tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
                resp = requests.get(tokeninfo_url)
                
                if resp.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid Google token"
                    )
                
                token_info = resp.json()
                # Verify the token was issued for this app
                if token_info.get("aud") != settings.GOOGLE_CLIENT_ID:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token not issued for this application"
                    )
                
                google_user_data = {
                    "sub": token_info.get("sub"),
                    "email": token_info.get("email"),
                    "name": token_info.get("name"),
                    "picture": token_info.get("picture"),
                }
            else:
                google_user_data = resp.json()
            
            google_id = google_user_data.get("sub") or google_user_data.get("id")
            email = google_user_data.get("email")
            name = google_user_data.get("name")
            picture = google_user_data.get("picture")
            
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email not provided by Google"
                )
            
            if not google_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google ID not provided"
                )
            
            # Check if user exists
            user = db.query(User).filter(
                (User.email == email) | (User.google_id == google_id)
            ).first()
            
            if user:
                # Update user info if needed
                if user.google_id != google_id:
                    user.google_id = google_id
                if user.auth_provider != AuthProvider.GOOGLE:
                    user.auth_provider = AuthProvider.GOOGLE
                if picture and not user.avatar_url:
                    user.avatar_url = picture
                if name and not user.full_name:
                    user.full_name = name
                user.is_verified = True  # Google users are verified
                db.commit()
                db.refresh(user)
            else:
                # Create new user
                user = User(
                    email=email,
                    full_name=name,
                    google_id=google_id,
                    auth_provider=AuthProvider.GOOGLE,
                    avatar_url=picture,
                    is_active=True,
                    is_verified=True,  # Google users are verified
                    username=email.split("@")[0]  # Use email prefix as username
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            
            return user
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to authenticate with Google: {str(e)}"
            )
    
    @staticmethod
    def get_google_auth_url() -> dict:
        """Get Google OAuth authorization URL"""
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )
        
        from authlib.integrations.requests_client import OAuth2Session
        
        client = OAuth2Session(
            settings.GOOGLE_CLIENT_ID,
            settings.GOOGLE_CLIENT_SECRET,
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        
        authorization_url, state = client.authorization_url(
            "https://accounts.google.com/o/oauth2/v2/auth",
            scope="openid email profile"
        )
        
        return {
            "authorization_url": authorization_url,
            "state": state
        }

