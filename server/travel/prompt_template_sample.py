"""
Sample prompt template for itinerary generation.
You can edit this file to customize the prompt sent to the LLM.

The template uses placeholders that will be filled from the request:
- {destination}: Destination location
- {origin}: Origin location (or "not specified")
- {days}: Number of days (or "not specified")
- {travel_type}: Type of travel (or "not specified")
- {budget}: Budget information (or "not specified")
- {preferences}: Preferences/requirements (or "not specified")
- {date}: Date information (or "not specified")
- {format_instructions}: Pydantic format instructions (auto-generated)
"""

SAMPLE_PROMPT_TEMPLATE = """You are an expert travel planner AI assistant. Create a comprehensive travel itinerary.

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

# To use this template, copy it to output_parser.py and replace the template in get_itinerary_prompt_template()

