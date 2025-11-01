from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from core.config import settings
from db.database import init_db
from auth.router import router as auth_router
from ArLocation.router import router as ar_location_router

app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## 100xHack API Server
    
    A comprehensive FastAPI server with authentication and user management.
    
    ### Features:
    - 🔐 Email/Password Authentication
    - 🔗 Google OAuth Integration
    - 👤 User Management
    - 🔒 JWT Token-based Authorization
    
    ### Authentication:
    All protected endpoints require a Bearer token in the Authorization header.
    Get your token by registering or logging in through the `/auth` endpoints.
    
    ### Documentation:
    - **Swagger UI**: Interactive API documentation (this page)
    - **ReDoc**: Alternative API documentation at `/redoc`
    - **OpenAPI Schema**: Available at `/openapi.json`
    """,
    version=settings.APP_VERSION,
    contact={
        "name": "100xHack API Support",
        "email": "support@100xhack.com",
    },
    license_info={
        "name": "MIT",
    },
    openapi_tags=[
        {
            "name": "authentication",
            "description": "User authentication endpoints. Register, login, and manage user sessions.",
        },
        {
            "name": "general",
            "description": "General application endpoints.",
        },
        {
            "name": "ar-locations",
            "description": "AR Location endpoints.",
        },
    ],
)



app.openapi_schema = None  # Clear the default schema to rebuild it

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token. Get one by registering or logging in through the /auth endpoints."
        }
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "http://localhost:5173", "https://qqp5w08x-5173.inc1.devtunnels.ms"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(ar_location_router)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()


@app.get(
    "/",
    tags=["general"],
    summary="Root endpoint",
    description="Welcome endpoint that provides API information",
    response_description="Welcome message and API status"
)
async def root():
    """
    Root endpoint for the API.
    
    Returns a welcome message indicating the API is running.
    """
    return {
        "message": "Welcome to 100xHack API",
        "status": "ok",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get(
    "/health",
    tags=["general"],
    summary="Health check",
    description="Check if the API server is running and healthy",
    response_description="Health status of the server"
)
async def health_check():
    """
    Health check endpoint.
    
    Use this endpoint to verify that the server is running correctly.
    Useful for monitoring and load balancer health checks.
    
    **Returns:**
    - `status`: "healthy" if the server is running correctly
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
