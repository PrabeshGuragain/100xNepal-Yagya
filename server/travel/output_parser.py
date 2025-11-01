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
            
            # Validate and create ItineraryReport
            return ItineraryReport(**data)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to extract JSON from the text
            json_str = self._extract_json_from_text(text)
            if json_str:
                data = json.loads(json_str)
                return ItineraryReport(**data)
            raise ValueError(f"Failed to parse JSON from output: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to parse itinerary: {str(e)}")
    
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
    - location: Location object with name, address, rating, image_url
    - start_time and end_time: Time slots
    - cost_estimate: Estimated cost
    - image_url: Image URL if found from search

- top_attractions: List of top places with:
  - name, address, rating, review_count
  - image_url: Image URL from search results
  - category: Type of attraction

- accommodation_recommendations: List with:
  - name, type, location, price_range, rating
  - image_url: Image URL if available
  - amenities: List of amenities

- Include destination_image and cover_image URLs if found
- Include weather_info and cultural_notes
- Provide detailed general_tips and transportation_tips

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

