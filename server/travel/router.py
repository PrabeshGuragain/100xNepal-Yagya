"""Travel planning API router"""
from fastapi import APIRouter, HTTPException, status, Depends
from travel.schemas import TravelPlanRequest, TravelPlanResponse
from travel.service import travel_service
from auth.dependencies import get_current_active_user
from auth.models import User
from typing import Optional

router = APIRouter(
    prefix="/travel",
    tags=["travel-planning"],
    responses={
        400: {"description": "Bad Request - Invalid input data"},
        401: {"description": "Unauthorized - Authentication required"},
        500: {"description": "Internal Server Error"},
    },
)


@router.post(
    "/plan",
    response_model=TravelPlanResponse,
    summary="Generate travel itinerary",
    description="Generate a comprehensive travel itinerary using AI agent with tool calling",
    status_code=status.HTTP_200_OK
)
async def generate_travel_plan(
    request: TravelPlanRequest,
    # Authentication is optional - users can test without login
    # Uncomment the line below to require authentication
    # current_user: User = Depends(get_current_active_user)
):
    """
    Generate a comprehensive travel itinerary based on user requirements.
    
    **Authentication:** Optional (currently disabled for easier testing)
    
    **Request Body:**
    - `days`: Number of days (1-30)
    - `origin`: Origin city/country
    - `destination`: Destination city/country
    - `travel_type`: Type of travel (religious, cultural, nightlife, etc.)
    - `budget_range`: Optional budget range
    - `preferences`: Optional list of preferences
    - `start_date`: Optional start date
    
    **Returns:**
    - Complete itinerary report with:
      - Daily plans with activities
      - Top ranked attractions with ratings
      - Accommodation recommendations
      - Transportation tips
      - General travel tips
      - Cost estimates
    
    **Process:**
    1. Agent uses tools to research destination
    2. Compares prices and ranks attractions
    3. Generates structured itinerary
    4. Validates output with Pydantic
    
    **Example Request:**
    ```json
    {
        "days": 5,
        "origin": "New York",
        "destination": "Paris",
        "travel_type": "cultural",
        "budget_range": "medium",
        "preferences": ["museums", "historic sites"]
    }
    ```
    """
    try:
        response = await travel_service.generate_itinerary(request)
        
        if not response.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.message
            )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate itinerary: {str(e)}"
        )


@router.get(
    "/health",
    summary="Travel service health check",
    description="Check if the travel planning service is available"
)
async def travel_health_check():
    """
    Health check endpoint for travel planning service.
    
    **Returns:**
    - Status of the service
    """
    try:
        # Try to initialize agent to check if service is ready
        travel_service._initialize_agent()
        return {
            "status": "healthy",
            "service": "travel_planning",
            "agent_initialized": travel_service.agent_executor is not None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "travel_planning",
            "error": str(e)
        }

