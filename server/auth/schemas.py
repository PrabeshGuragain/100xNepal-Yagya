from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from auth.models import AuthProvider


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot exceed 72 bytes')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "username": "johndoe",
                "full_name": "John Doe"
            }
        }

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class GoogleAuthRequest(BaseModel):
    """Schema for Google OAuth token"""
    token: str = Field(..., description="Google ID token or access token")
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
            }
        }


class Token(BaseModel):
    """Token response schema"""
    access_token: str = Field(..., description="JWT access token for authenticated requests")
    token_type: str = Field(default="bearer", description="Token type")
    user: "UserResponse"
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": "user@example.com",
                    "username": "johndoe",
                    "full_name": "John Doe",
                    "is_active": True,
                    "is_verified": False,
                    "auth_provider": "email",
                    "avatar_url": None,
                    "created_at": "2024-01-01T00:00:00"
                }
            }
        }


class TokenData(BaseModel):
    """Token data schema"""
    user_id: Optional[int] = None
    email: Optional[str] = None


class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_active: bool
    is_verified: bool
    auth_provider: AuthProvider
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "is_active": True,
                "is_verified": False,
                "auth_provider": "email",
                "avatar_url": None,
                "created_at": "2024-01-01T00:00:00"
            }
        }


class UserUpdate(BaseModel):
    """Schema for updating user"""
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


# Update forward references
UserResponse.model_rebuild()

