from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, time
from enum import Enum


class TravelType(str, Enum):
    """Travel type categories"""
    RELIGIOUS = "religious"
    CULTURAL = "cultural"
    NIGHTLIFE = "nightlife"
    ADVENTURE = "adventure"
    FAMILY = "family"
    ROMANTIC = "romantic"
    BUSINESS = "business"
    BUDGET = "budget"
    LUXURY = "luxury"
    MIXED = "mixed"


class TravelPlanRequest(BaseModel):
    """Request schema for travel planning - Flexible input with placeholders"""
    # Simple required fields
    destination: str = Field(..., description="Destination (city, country, or any text)")
    days: Optional[int] = Field(None, description="Number of days (optional)")
    
    # Optional flexible fields - accept any string values
    origin: Optional[str] = Field(None, description="Origin location (optional)")
    travel_type: Optional[str] = Field(None, description="Type of travel (any string)")
    budget: Optional[str] = Field(None, description="Budget information (any format)")
    preferences: Optional[str] = Field(None, description="Preferences or requirements (any text)")
    date: Optional[str] = Field(None, description="Date information (any format)")
    notes: Optional[str] = Field(None, description="Additional notes or requirements")
    
    # Allow any additional fields
    class Config:
        extra = "allow"  # Allow extra fields from frontend
        json_schema_extra = {
            "example": {
                "destination": "Paris, France",
                "days": 5,
                "origin": "New York",
                "travel_type": "cultural tour",
                "budget": "medium budget around $2000",
                "preferences": "museums, food, historic sites",
                "date": "June 2024",
                "notes": "First time visiting, prefer walking tours"
            }
        }


class Location(BaseModel):
    """Location information"""
    name: str = Field(..., description="Name of the location")
    address: Optional[str] = Field(None, description="Address of the location")
    latitude: Optional[float] = Field(None, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, description="Longitude coordinate")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Average rating (0-5)")
    review_count: Optional[int] = Field(None, description="Number of reviews")
    category: Optional[str] = Field(None, description="Category of the location")
    image_url: Optional[str] = Field(None, description="Image URL for the location (from search)")
    image_alt: Optional[str] = Field(None, description="Alt text for the image")


class Activity(BaseModel):
    """Activity information"""
    name: str = Field(..., description="Name of the activity")
    description: Optional[str] = Field(None, description="Detailed description of the activity")
    location: Location = Field(..., description="Location details")
    start_time: Optional[str] = Field(None, description="Start time (HH:MM format)")
    end_time: Optional[str] = Field(None, description="End time (HH:MM format)")
    duration_hours: Optional[float] = Field(None, description="Duration in hours")
    cost_estimate: Optional[str] = Field(None, description="Estimated cost")
    tips: Optional[List[str]] = Field(None, description="Tips or recommendations")
    priority: Optional[int] = Field(None, ge=1, le=5, description="Priority ranking (1-5)")
    image_url: Optional[str] = Field(None, description="Image URL for the activity")
    booking_info: Optional[str] = Field(None, description="Booking information or website")


class DayPlan(BaseModel):
    """Daily itinerary plan"""
    day_number: int = Field(..., ge=1, description="Day number")
    date: Optional[str] = Field(None, description="Date for this day (string format)")
    title: str = Field(..., description="Title or theme for the day")
    description: Optional[str] = Field(None, description="Day overview description")
    theme: Optional[str] = Field(None, description="Theme or focus of the day")
    activities: List[Activity] = Field(default_factory=list, description="List of activities for the day")
    estimated_cost: Optional[str] = Field(None, description="Estimated cost for the day")
    notes: Optional[str] = Field(None, description="Additional notes, tips, or recommendations for the day")
    highlights: Optional[List[str]] = Field(None, description="Key highlights of the day")


class Accommodation(BaseModel):
    """Accommodation recommendation"""
    name: str = Field(..., description="Name of accommodation")
    type: Optional[str] = Field(None, description="Type (hotel, hostel, Airbnb, etc.)")
    location: Optional[str] = Field(None, description="Location")
    address: Optional[str] = Field(None, description="Full address")
    price_range: Optional[str] = Field(None, description="Price range per night")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Rating")
    review_count: Optional[int] = Field(None, description="Number of reviews")
    recommendation_reason: Optional[str] = Field(None, description="Why this is recommended")
    image_url: Optional[str] = Field(None, description="Image URL for the accommodation")
    amenities: Optional[List[str]] = Field(None, description="List of amenities")
    booking_url: Optional[str] = Field(None, description="Booking website URL")


class Transportation(BaseModel):
    """Transportation information"""
    type: str = Field(..., description="Type of transportation")
    route: Optional[str] = Field(None, description="Route description")
    estimated_cost: Optional[str] = Field(None, description="Estimated cost")
    duration: Optional[str] = Field(None, description="Estimated duration")
    tips: Optional[List[str]] = Field(None, description="Tips for transportation")


class ItineraryReport(BaseModel):
    """Complete itinerary report - Strictly validated output"""
    summary: str = Field(..., description="Comprehensive summary of the travel plan")
    destination: str = Field(..., description="Destination name")
    total_days: int = Field(..., ge=1, description="Total number of days")
    travel_type: Optional[str] = Field(None, description="Type of travel")
    budget_estimate: Optional[str] = Field(None, description="Total estimated budget")
    
    # Detailed day plans - required and validated
    day_plans: List[DayPlan] = Field(..., min_length=1, description="Detailed daily itinerary plans")
    
    # Attractions and locations
    top_attractions: Optional[List[Location]] = Field(None, description="Top ranked attractions with details")
    must_visit_places: Optional[List[Location]] = Field(None, description="Must-visit places")
    
    # Accommodation
    accommodation_recommendations: Optional[List[Accommodation]] = Field(None, description="Accommodation suggestions with details")
    
    # Transportation
    transportation_tips: Optional[List[Transportation]] = Field(None, description="Transportation recommendations")
    local_transport: Optional[str] = Field(None, description="Information about local transportation")
    
    # Additional information
    general_tips: Optional[List[str]] = Field(None, description="General travel tips and advice")
    cultural_notes: Optional[List[str]] = Field(None, description="Cultural information and customs")
    best_time_to_visit: Optional[str] = Field(None, description="Best time to visit")
    weather_info: Optional[str] = Field(None, description="Weather information for the destination")
    
    # Images and media
    destination_image: Optional[str] = Field(None, description="Main destination image URL")
    cover_image: Optional[str] = Field(None, description="Cover image URL for the itinerary")
    
    # Metadata
    created_at: Optional[str] = Field(None, description="Report creation timestamp")
    last_updated: Optional[str] = Field(None, description="Last update timestamp")
    
    # Markdown description for frontend rendering
    markdown_description: Optional[str] = Field(None, description="Formatted markdown description of the itinerary for frontend display")
    
    class Config:
        json_schema_extra = {
            "example": {
                "summary": "A comprehensive 5-day cultural journey through Paris, France",
                "destination": "Paris",
                "total_days": 5,
                "travel_type": "cultural",
                "budget_estimate": "€800-1200",
                "day_plans": [
                    {
                        "day_number": 1,
                        "title": "Arrival and City Introduction",
                        "description": "Explore the historic heart of Paris",
                        "activities": []
                    }
                ],
                "top_attractions": [],
                "general_tips": ["Learn basic French phrases", "Get a Paris Museum Pass"]
            }
        }


class TravelPlanResponse(BaseModel):
    """Response schema for travel planning"""
    success: bool = Field(..., description="Whether the plan generation was successful")
    itinerary: Optional[ItineraryReport] = Field(None, description="Generated itinerary")
    message: Optional[str] = Field(None, description="Status message")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")

