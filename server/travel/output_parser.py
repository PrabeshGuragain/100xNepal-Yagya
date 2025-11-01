"""Output parser for travel itinerary using Pydantic"""
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from travel.schemas import ItineraryReport
from typing import Any
import json


class TravelItineraryParser:
    """Parser for travel itinerary output"""
    
    def __init__(self):
        self.parser = PydanticOutputParser(pydantic_object=ItineraryReport)
        self.format_instructions = self.parser.get_format_instructions()
    
    def get_format_instructions(self) -> str:
        """Get format instructions for the LLM"""
        return self.format_instructions
    
    def parse(self, text: str) -> ItineraryReport:
        """
        Parse LLM output into ItineraryReport
        
        Args:
            text: Raw text output from LLM
            
        Returns:
            ItineraryReport object
        """
        try:
            # Try to extract JSON from the text if it's wrapped in markdown or other formatting
            text = self._extract_json(text)
            
            # Parse JSON string to dict
            if isinstance(text, str):
                data = json.loads(text)
            else:
                data = text
            
            # Normalize ratings from 0-10 scale to 0-5 scale if needed
            data = self._normalize_ratings(data)
            
            # Validate and create ItineraryReport
            return ItineraryReport(**data)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to extract JSON from the text
            json_str = self._extract_json_from_text(text)
            if json_str:
                data = json.loads(json_str)
                data = self._normalize_ratings(data)
                return ItineraryReport(**data)
            raise ValueError(f"Failed to parse JSON from output: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to parse itinerary: {str(e)}")
    
    def _normalize_ratings(self, data: dict) -> dict:
        """
        Normalize ratings from 0-10 scale to 0-5 scale
        
        Args:
            data: Dictionary containing itinerary data
            
        Returns:
            Dictionary with normalized ratings
        """
        if not isinstance(data, dict):
            return data
        
        data = data.copy()
        
        # Normalize ratings in day_plans -> activities -> location
        if "day_plans" in data:
            for day_plan in data["day_plans"]:
                if "activities" in day_plan:
                    for activity in day_plan["activities"]:
                        if "location" in activity and activity["location"]:
                            if "rating" in activity["location"] and activity["location"]["rating"] is not None:
                                rating = activity["location"]["rating"]
                                if rating > 5:
                                    activity["location"]["rating"] = round(rating / 2, 1)
        
        # Normalize ratings in top_attractions
        if "top_attractions" in data and data["top_attractions"]:
            for attraction in data["top_attractions"]:
                if "rating" in attraction and attraction["rating"] is not None:
                    rating = attraction["rating"]
                    if rating > 5:
                        attraction["rating"] = round(rating / 2, 1)
        
        # Normalize ratings in must_visit_places
        if "must_visit_places" in data and data["must_visit_places"]:
            for place in data["must_visit_places"]:
                if "rating" in place and place["rating"] is not None:
                    rating = place["rating"]
                    if rating > 5:
                        place["rating"] = round(rating / 2, 1)
        
        # Normalize ratings in accommodation_recommendations
        if "accommodation_recommendations" in data and data["accommodation_recommendations"]:
            for acc in data["accommodation_recommendations"]:
                if "rating" in acc and acc["rating"] is not None:
                    rating = acc["rating"]
                    if rating > 5:
                        acc["rating"] = round(rating / 2, 1)
        
        return data
    
    def _extract_json(self, text: str) -> str:
        """Extract JSON from text that might have markdown formatting"""
        text = text.strip()
        
        # Remove markdown code blocks
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        
        if text.endswith("```"):
            text = text[:-3]
        
        text = text.strip()
        return text
    
    def _extract_json_from_text(self, text: str) -> str:
        """Try to extract JSON object from text"""
        # Look for JSON object boundaries
        start = text.find("{")
        end = text.rfind("}")
        
        if start != -1 and end != -1 and end > start:
            return text[start:end+1]
        
        return None


def get_itinerary_prompt_template(format_instructions: str) -> PromptTemplate:
    """Get the prompt template for itinerary generation"""
    template = """You are an expert travel planner AI assistant. Create a comprehensive travel itinerary.

User Requirements:
{destination}
{origin}
{days}
{travel_type}
{budget}
{preferences}
{date}

Instructions:
1. Create detailed day-by-day itinerary with specific activities
2. Include times, locations, and costs for each activity
3. Provide ratings and reviews for all recommended places
4. Include image URLs when available from search results
5. Add accommodation recommendations with details
6. Include transportation tips and local information
7. Provide cultural tips and best practices

IMPORTANT OUTPUT REQUIREMENTS:
- day_plans: REQUIRED - Must have at least one day plan with:
  - day_number: Sequential day number
  - title: Descriptive title for the day
  - description: Overview of the day
  - activities: List of activities, each with:
    - name: Activity name
    - description: Detailed description
    - location: Location object with name, address, rating, image_url, latitude, longitude
    - start_time and end_time: Time slots
    - cost_estimate: Estimated cost
    - image_url: Image URL if found from search

- top_attractions: List of top places with:
  - name, address, rating, review_count, latitude, longitude
  - image_url: Image URL from search results
  - category: Type of attraction

- must_visit_places: List with:
  - name, address, rating, latitude, longitude
  - image_url: Image URL if available

- accommodation_recommendations: List with:
  - name, type, location, price_range, rating
  - image_url: Image URL if available
  - amenities: List of amenities

- Include destination_image and cover_image URLs if found
- Include weather_info and cultural_notes
- Provide detailed general_tips and transportation_tips

CRITICAL RULES:
1. For all locations, places, and attractions, you MUST include latitude and longitude coordinates.
   Use the get_place_coordinates tool to get accurate coordinates for each place before finalizing the itinerary.

2. ALL RATINGS MUST BE ON A 0-5 SCALE (not 0-10). If you find ratings on a 0-10 scale, divide by 2.
   Example: If a place has 8.9/10 rating, convert it to 4.5/5.

Output Format:
{format_instructions}

Generate the itinerary in valid JSON format matching the schema exactly.
"""
    
    return PromptTemplate(
        template=template,
        input_variables=[
            "destination",
            "origin",
            "days",
            "travel_type",
            "budget",
            "preferences",
            "date"
        ],
        partial_variables={"format_instructions": format_instructions}
    )

