from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from db.database import get_db
from auth.schemas import (
    UserCreate,
    UserResponse,
    Token,
    UserLogin,
    GoogleAuthRequest
)
from auth.service import AuthService
from auth.dependencies import get_current_active_user
from auth.models import User

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={
        401: {"description": "Unauthorized - Invalid credentials or token"},
        403: {"description": "Forbidden - Account inactive"},
        400: {"description": "Bad Request - Invalid input data"},
    },
)


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password",
    responses={
        201: {"description": "User successfully created"},
        400: {"description": "Email already registered or invalid data"},
    }
)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with email and password.
    
    **Request Body:**
    - `email`: Valid email address (must be unique)
    - `password`: Password (minimum 8 characters)
    - `username`: Optional username (must be unique if provided)
    - `full_name`: Optional full name
    
    **Returns:**
    - `access_token`: JWT token for authenticated requests
    - `token_type`: Token type (always "bearer")
    - `user`: User information object
    
    **Example Request:**
    ```json
    {
        "email": "user@example.com",
        "password": "securepassword123",
        "username": "johndoe",
        "full_name": "John Doe"
    }
    ```
    """
    user = AuthService.register_user(db, user_create)
    access_token = AuthService.create_token_for_user(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post(
    "/login",
    response_model=Token,
    summary="Login with email/password",
    description="Authenticate user with email and password credentials",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid email or password"},
        403: {"description": "Account is inactive"},
    }
)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    
    **Request Body:**
    - `email`: Registered email address
    - `password`: User's password
    
    **Returns:**
    - `access_token`: JWT token for authenticated requests
    - `token_type`: Token type (always "bearer")
    - `user`: User information object
    
    **Note:** Use the `access_token` in the Authorization header for protected endpoints:
    ```
    Authorization: Bearer <access_token>
    ```
    
    **Example Request:**
    ```json
    {
        "email": "user@example.com",
        "password": "securepassword123"
    }
    ```
    """
    user = AuthService.authenticate_user(db, user_login)
    access_token = AuthService.create_token_for_user(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post(
    "/login/form",
    response_model=Token,
    summary="Login with form data (OAuth2 compatible)",
    description="Login endpoint compatible with OAuth2 password grant flow using form data",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
    }
)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with OAuth2PasswordRequestForm (for compatibility with OAuth2 clients).
    
    This endpoint accepts form-encoded data instead of JSON.
    Uses the `username` field as the email address.
    
    **Form Data:**
    - `username`: Email address
    - `password`: User's password
    
    **Returns:**
    - `access_token`: JWT token for authenticated requests
    - `token_type`: Token type (always "bearer")
    - `user`: User information object
    """
    user_login = UserLogin(email=form_data.username, password=form_data.password)
    user = AuthService.authenticate_user(db, user_login)
    access_token = AuthService.create_token_for_user(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user information",
    description="Retrieve information about the currently authenticated user",
    responses={
        200: {"description": "User information retrieved successfully"},
        401: {"description": "Authentication required - Invalid or missing token"},
    }
)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user information.
    
    **Authentication Required:** Yes (Bearer token)
    
    **Headers:**
    - `Authorization`: Bearer `<access_token>`
    
    **Returns:**
    - User object with all user information including:
      - id, email, username, full_name
      - is_active, is_verified, auth_provider
      - avatar_url, created_at
    
    **Use this endpoint to:**
    - Verify authentication status
    - Get user profile information
    - Check user account status
    """
    return current_user


@router.post(
    "/google",
    response_model=Token,
    summary="Authenticate with Google OAuth",
    description="Authenticate user using Google OAuth ID token or access token",
    responses={
        200: {"description": "Google authentication successful"},
        401: {"description": "Invalid Google token"},
        500: {"description": "Google OAuth not configured"},
    }
)
async def google_auth(
    google_request: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate with Google OAuth token.
    
    This endpoint accepts either:
    - Google ID token (from client-side Google Sign-In)
    - Google access token (from OAuth2 flow)
    
    **Request Body:**
    - `token`: Google ID token or access token
    
    **Returns:**
    - `access_token`: JWT token for authenticated requests
    - `token_type`: Token type (always "bearer")
    - `user`: User information object
    
    **Note:** If the user doesn't exist, a new account will be created automatically.
    If the user exists, their profile information will be updated from Google.
    
    **Example Request:**
    ```json
    {
        "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
    }
    ```
    
    **Setup Required:**
    - Configure `GOOGLE_CLIENT_ID` in environment variables
    - Configure `GOOGLE_CLIENT_SECRET` for OAuth2 flow (optional for ID tokens)
    """
    user = await AuthService.authenticate_google_user(db, google_request.token)
    access_token = AuthService.create_token_for_user(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get(
    "/google/url",
    summary="Get Google OAuth authorization URL",
    description="Get the authorization URL for initiating Google OAuth flow",
    responses={
        200: {"description": "Authorization URL generated"},
        500: {"description": "Google OAuth not configured"},
    }
)
async def get_google_auth_url():
    """
    Get Google OAuth authorization URL.
    
    Returns the URL where users should be redirected to initiate the Google OAuth flow.
    
    **Returns:**
    - `authorization_url`: URL to redirect user to for Google authentication
    - `state`: OAuth state parameter for CSRF protection
    
    **Flow:**
    1. Call this endpoint to get the authorization URL
    2. Redirect user to the `authorization_url`
    3. User authorizes on Google
    4. Google redirects back with an authorization code
    5. Exchange the code for a token (client-side or server-side)
    6. Use the token with `/auth/google` endpoint
    
    **Setup Required:**
    - Configure `GOOGLE_CLIENT_ID` in environment variables
    - Configure `GOOGLE_CLIENT_SECRET` in environment variables
    - Configure `GOOGLE_REDIRECT_URI` to match your OAuth redirect URI
    """
    return AuthService.get_google_auth_url()

