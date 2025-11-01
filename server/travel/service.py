"""Travel planning service with LangChain agent"""
from travel.schemas import TravelPlanRequest, ItineraryReport, TravelPlanResponse
from travel.agent import create_itinerary_agent_with_parser, get_gemini_llm
from travel.output_parser import get_itinerary_prompt_template
import time
from typing import Optional, Tuple
import json


class TravelPlanningService:
    """Service for generating travel itineraries using LangChain agent"""
    
    def __init__(self):
        self.agent_executor = None
        self.parser = None
    
    def _initialize_agent(self):
        """Lazy initialization of agent"""
        if self.agent_executor is None or self.parser is None:
            self.agent_executor, self.parser = create_itinerary_agent_with_parser()
    
    async def generate_itinerary(self, request: TravelPlanRequest) -> TravelPlanResponse:
        """
        Generate travel itinerary using LangChain agent
        
        Args:
            request: TravelPlanRequest with user requirements
            
        Returns:
            TravelPlanResponse with generated itinerary
        """
        start_time = time.time()
        
        try:
            # Initialize agent if needed
            self._initialize_agent()
            
            # Prepare input for the agent
            agent_input = self._prepare_agent_input(request)
            
            # Execute agent to gather information
            agent_result = self.agent_executor.invoke({"input": agent_input})
            agent_output = agent_result.get("output", "")
            
            # Prepare final prompt with gathered information
            llm = get_gemini_llm()
            format_instructions = self.parser.get_format_instructions()
            
            prompt_template = get_itinerary_prompt_template(format_instructions)
            
            # Prepare prompt variables from request - matching new schema
            destination_text = f"Destination: {request.destination}"
            duration_text = f"Duration: {request.duration} days"
            start_date_text = f"Start Date: {request.start_date}" if request.start_date else "Start Date: not specified"
            difficulty_text = f"Difficulty Level: {request.difficulty_level}" if request.difficulty_level else "Difficulty Level: not specified"
            budget_text = f"Budget Range: {request.budget_range}" if request.budget_range else "Budget Range: not specified"
            interests_text = f"Interests: {request.interests}" if request.interests else "Interests: not specified"
            group_size_text = f"Group Size: {request.group_size} people"
            accommodation_text = f"Accommodation Type: {request.accommodation_type}" if request.accommodation_type else "Accommodation Type: not specified"
            
            # Create final prompt
            final_prompt = prompt_template.format(
                destination=destination_text,
                duration=duration_text,
                start_date=start_date_text,
                difficulty_level=difficulty_text,
                budget_range=budget_text,
                interests=interests_text,
                group_size=group_size_text,
                accommodation_type=accommodation_text
            )
            
            # Add agent's research findings to the prompt
            enhanced_prompt = f"""
{final_prompt}

Research Findings from Agent:
{agent_output}

Based on the research findings above and the user requirements, generate a comprehensive itinerary report in the exact JSON format specified in the format instructions.
Make sure to:
1. Create exactly {request.duration} day plans
2. Match activities to the {request.difficulty_level or 'moderate'} difficulty level
3. Keep recommendations within the {request.budget_range or 'moderate'} budget range
4. Focus on interests: {request.interests or 'general tourism'}
5. Ensure activities are suitable for a group of {request.group_size}
6. Recommend {request.accommodation_type or 'various'} accommodation types
7. Use the information gathered from the tools to create accurate and detailed plans
"""
            
            # Get structured output from LLM
            response = await llm.ainvoke(enhanced_prompt)
            llm_output = response.content
            
            # Parse the output
            itinerary = self.parser.parse(llm_output)
            
            # Enrich locations with coordinates if missing
            itinerary = await self._enrich_with_coordinates(itinerary, request.destination)
            
            # Generate markdown description using rule-based method
            itinerary.markdown_description = self._generate_markdown_description(itinerary)
            
            # Enhance itinerary with metadata
            itinerary.created_at = time.strftime("%Y-%m-%d %H:%M:%S")
            
            processing_time = time.time() - start_time
            
            return TravelPlanResponse(
                success=True,
                itinerary=itinerary,
                message="Itinerary generated successfully",
                processing_time=round(processing_time, 2)
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            return TravelPlanResponse(
                success=False,
                itinerary=None,
                message=f"Error generating itinerary: {str(e)}",
                processing_time=round(processing_time, 2)
            )
    
    def _prepare_agent_input(self, request: TravelPlanRequest) -> str:
        """
        Prepare input string for the agent - matching new frontend schema
        
        Args:
            request: TravelPlanRequest with new schema
            
        Returns:
            Formatted input string
        """
        # Extract values from new schema
        destination = request.destination
        duration = request.duration
        start_date = request.start_date or "not specified"
        difficulty_level = request.difficulty_level or "moderate"
        budget_range = request.budget_range or "moderate"
        interests = request.interests or "general sightseeing"
        group_size = request.group_size or 1
        accommodation_type = request.accommodation_type or "mixed"
        notes = request.notes or ""
        
        # Build structured input text
        input_text = f"""Plan a {duration}-day trip to {destination}

Trip Details:
- Duration: {duration} days
- Start Date: {start_date}
- Difficulty Level: {difficulty_level}
- Budget Range: {budget_range}
- Interests: {interests}
- Group Size: {group_size} people
- Accommodation Preference: {accommodation_type}
"""
        
        if notes:
            input_text += f"- Additional Notes: {notes}\n"
        
        input_text += f"""
Research Requirements:
1. Search for top attractions and activities in {destination} that match interests: {interests}
2. Find places suitable for groups of {group_size} people
3. Get ratings and reviews for recommended places
4. Find {accommodation_type} accommodation options within {budget_range} budget range
5. Research activities matching {difficulty_level} difficulty level
6. Compare prices for accommodations, food, and activities in the {budget_range} range
7. Get weather information"""
        
        if start_date != "not specified":
            input_text += f" for {start_date}"
        
        input_text += f"""
8. Get local customs and cultural tips for {destination}
9. Research transportation options suitable for {group_size} travelers
10. Find image URLs from search results for:
    - Destination cover image
    - Attraction/location images matching interests ({interests})
    - Activity images suitable for {difficulty_level} level
    - {accommodation_type} accommodation images

IMPORTANT: 
- Focus on activities and places that align with: {interests}
- Ensure all recommendations fit the {budget_range} budget range
- Activities should match {difficulty_level} difficulty level
- Consider group size of {group_size} for all recommendations
- Prioritize {accommodation_type} accommodation types

Use all available tools to gather comprehensive information about {destination}.
"""
        
        return input_text.strip()
    
    def _generate_markdown_description(self, itinerary: ItineraryReport) -> str:
        """
        Generate markdown description from itinerary using rule-based approach
        
        Args:
            itinerary: ItineraryReport object
            
        Returns:
            Formatted markdown string
        """
        md_parts = []
        
        # Title
        md_parts.append(f"# {itinerary.destination} Travel Itinerary\n")
        
        # Overview section
        md_parts.append("## Overview\n")
        md_parts.append(f"{itinerary.summary}\n")
        md_parts.append("\n---\n")
        
        # Travel Details
        md_parts.append("## Travel Details\n")
        md_parts.append(f"- **Duration:** {itinerary.total_days} days\n")
        if itinerary.travel_type:
            md_parts.append(f"- **Travel Type:** {itinerary.travel_type}\n")
        if itinerary.budget_estimate:
            md_parts.append(f"- **Estimated Budget:** {itinerary.budget_estimate}\n")
        if itinerary.best_time_to_visit:
            md_parts.append(f"- **Best Time to Visit:** {itinerary.best_time_to_visit}\n")
        md_parts.append("\n")
        
        # Day Plans
        if itinerary.day_plans:
            md_parts.append("## Day-by-Day Itinerary\n\n")
            for day_plan in itinerary.day_plans:
                md_parts.append(f"### Day {day_plan.day_number}: {day_plan.title}\n\n")
                if day_plan.description:
                    md_parts.append(f"*{day_plan.description}*\n\n")
                
                if day_plan.activities:
                    md_parts.append("#### Activities\n\n")
                    for i, activity in enumerate(day_plan.activities, 1):
                        md_parts.append(f"**{i}. {activity.name}**\n\n")
                        if activity.description:
                            md_parts.append(f"{activity.description}\n\n")
                        if activity.location:
                            md_parts.append(f"- **Location:** {activity.location.name}")
                            if activity.location.address:
                                md_parts.append(f" ({activity.location.address})")
                            if activity.location.rating:
                                md_parts.append(f" ⭐ {activity.location.rating}/5")
                            md_parts.append("\n")
                        if activity.start_time and activity.end_time:
                            md_parts.append(f"- **Time:** {activity.start_time} - {activity.end_time}\n")
                        if activity.cost_estimate:
                            md_parts.append(f"- **Cost:** {activity.cost_estimate}\n")
                        if activity.tips:
                            md_parts.append(f"- **Tips:** {', '.join(activity.tips)}\n")
                        md_parts.append("\n")
                
                if day_plan.highlights:
                    md_parts.append(f"**Highlights:** {', '.join(day_plan.highlights)}\n\n")
                if day_plan.estimated_cost:
                    md_parts.append(f"**Estimated Cost:** {day_plan.estimated_cost}\n\n")
                if day_plan.notes:
                    md_parts.append(f"*Note: {day_plan.notes}*\n\n")
                md_parts.append("---\n\n")
        
        # Top Attractions
        if itinerary.top_attractions:
            md_parts.append("## Top Attractions\n\n")
            for i, attraction in enumerate(itinerary.top_attractions[:10], 1):
                md_parts.append(f"{i}. **{attraction.name}**")
                if attraction.rating:
                    md_parts.append(f" ⭐ {attraction.rating}/5")
                if attraction.address:
                    md_parts.append(f"\n   - {attraction.address}")
                if attraction.category:
                    md_parts.append(f"\n   - Category: {attraction.category}")
                md_parts.append("\n\n")
        
        # Must Visit Places
        if itinerary.must_visit_places:
            md_parts.append("## Must-Visit Places\n\n")
            for place in itinerary.must_visit_places[:10]:
                md_parts.append(f"- **{place.name}**")
                if place.rating:
                    md_parts.append(f" ⭐ {place.rating}/5")
                md_parts.append("\n")
            md_parts.append("\n")
        
        # Accommodation Recommendations
        if itinerary.accommodation_recommendations:
            md_parts.append("## Accommodation Recommendations\n\n")
            for acc in itinerary.accommodation_recommendations:
                md_parts.append(f"### {acc.name}\n\n")
                md_parts.append(f"- **Type:** {acc.type or 'Not specified'}\n")
                if acc.location:
                    md_parts.append(f"- **Location:** {acc.location}\n")
                if acc.price_range:
                    md_parts.append(f"- **Price Range:** {acc.price_range}\n")
                if acc.rating:
                    md_parts.append(f"- **Rating:** ⭐ {acc.rating}/5")
                    if acc.review_count:
                        md_parts.append(f" ({acc.review_count} reviews)")
                    md_parts.append("\n")
                if acc.recommendation_reason:
                    md_parts.append(f"- **Why:** {acc.recommendation_reason}\n")
                if acc.amenities:
                    md_parts.append(f"- **Amenities:** {', '.join(acc.amenities)}\n")
                md_parts.append("\n")
        
        # Transportation Tips
        if itinerary.transportation_tips:
            md_parts.append("## Transportation\n\n")
            for transport in itinerary.transportation_tips:
                md_parts.append(f"### {transport.type}\n\n")
                if transport.route:
                    md_parts.append(f"- **Route:** {transport.route}\n")
                if transport.estimated_cost:
                    md_parts.append(f"- **Cost:** {transport.estimated_cost}\n")
                if transport.duration:
                    md_parts.append(f"- **Duration:** {transport.duration}\n")
                if transport.tips:
                    md_parts.append("**Tips:**\n")
                    for tip in transport.tips:
                        md_parts.append(f"- {tip}\n")
                md_parts.append("\n")
        
        if itinerary.local_transport:
            md_parts.append(f"### Local Transportation\n\n{itinerary.local_transport}\n\n")
        
        # General Tips
        if itinerary.general_tips:
            md_parts.append("## General Travel Tips\n\n")
            for tip in itinerary.general_tips:
                md_parts.append(f"- {tip}\n")
            md_parts.append("\n")
        
        # Cultural Notes
        if itinerary.cultural_notes:
            md_parts.append("## Cultural Information\n\n")
            for note in itinerary.cultural_notes:
                md_parts.append(f"- {note}\n")
            md_parts.append("\n")
        
        # Weather Info
        if itinerary.weather_info:
            md_parts.append("## Weather Information\n\n")
            md_parts.append(f"{itinerary.weather_info}\n\n")
        
        # Best Time to Visit
        if itinerary.best_time_to_visit:
            md_parts.append("## Best Time to Visit\n\n")
            md_parts.append(f"{itinerary.best_time_to_visit}\n\n")
        
        return "".join(md_parts)
    
    async def _enrich_with_coordinates(self, itinerary: ItineraryReport, destination: str) -> ItineraryReport:
        """
        Enrich itinerary locations with coordinates if missing
        
        Args:
            itinerary: ItineraryReport object
            destination: Destination city for context
            
        Returns:
            Enriched ItineraryReport
        """
        from travel.tools import get_place_coordinates
        import time
        
        # Helper function to get coordinates
        def get_coords(place_name: str, address: Optional[str] = None) -> Tuple[Optional[float], Optional[float]]:
            """Get coordinates for a place"""
            try:
                query = place_name
                if address and destination:
                    query = f"{place_name}, {destination}"
                
                coords_str = get_place_coordinates.invoke(query)
                if coords_str and "," in coords_str:
                    try:
                        lat, lon = coords_str.split(",")
                        return float(lat.strip()), float(lon.strip())
                    except ValueError:
                        pass
            except Exception:
                pass
            return None, None
        
        # Enrich day plans activities
        for day_plan in itinerary.day_plans:
            for activity in day_plan.activities:
                if activity.location and not activity.location.latitude:
                    lat, lon = get_coords(activity.location.name, activity.location.address)
                    if lat and lon:
                        activity.location.latitude = lat
                        activity.location.longitude = lon
                    time.sleep(0.5)  # Rate limiting
        
        # Enrich top attractions
        for attraction in (itinerary.top_attractions or []):
            if not attraction.latitude:
                lat, lon = get_coords(attraction.name, attraction.address)
                if lat and lon:
                    attraction.latitude = lat
                    attraction.longitude = lon
                time.sleep(0.5)
        
        # Enrich must visit places
        for place in (itinerary.must_visit_places or []):
            if not place.latitude:
                lat, lon = get_coords(place.name, place.address)
                if lat and lon:
                    place.latitude = lat
                    place.longitude = lon
                time.sleep(0.5)
        
        return itinerary


# Singleton instance
travel_service = TravelPlanningService()