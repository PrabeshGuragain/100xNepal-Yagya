"""
Travel itinerary generation prompt template.
This template uses placeholders that will be filled from the request.

Available variables from frontend:
- {destination}: Destination location
- {duration}: Number of days for the trip
- {start_date}: Start date of the trip (optional)
- {difficulty_level}: Difficulty level (easy, moderate, challenging, etc.)
- {budget_range}: Budget range (budget, moderate, luxury, etc.)
- {interests}: User interests (temples, trains, rivers, etc.)
- {group_size}: Number of people traveling
- {accommodation_type}: Preferred accommodation (hotel, guest house, mixed, etc.)
- {format_instructions}: Pydantic format instructions (auto-generated)
"""

SAMPLE_PROMPT_TEMPLATE = """You are an expert travel planner AI assistant. Create a comprehensive, personalized travel itinerary based on the user's specific requirements.

User Requirements:
Destination: {destination}
Duration: {duration}
Start Date: {start_date}
Difficulty Level: {difficulty_level}
Budget Range: {budget_range}
Interests: {interests}
Group Size: {group_size}
Accommodation Type: {accommodation_type}

Instructions:
1. Create a detailed day-by-day itinerary tailored to the specified difficulty level and interests
2. Ensure activities match the group size and are appropriate for the number of travelers
3. Recommend activities and places that align with the user's interests ({interests})
4. Keep all recommendations within the specified budget range ({budget_range})
5. Suggest accommodations matching the preferred type ({accommodation_type})
6. Include specific times, locations, and cost estimates for each activity
7. Provide ratings and reviews for all recommended places
8. Include image URLs when available from search results
9. Add transportation tips considering the group size
10. Provide cultural tips and best practices for the destination
11. Adjust the itinerary pace based on difficulty level (easy = relaxed, challenging = packed schedule)

IMPORTANT OUTPUT REQUIREMENTS:
- day_plans: REQUIRED - Must have at least one day plan for each day of the duration:
  - day_number: Sequential day number (1 to {duration})
  - title: Descriptive title for the day
  - description: Overview of the day's activities
  - activities: List of activities, each with:
    - name: Activity name
    - description: Detailed description matching user interests
    - location: Location object with name, address, rating, image_url
    - start_time and end_time: Time slots (adjust pace based on difficulty level)
    - cost_estimate: Estimated cost within budget range
    - image_url: Image URL if found from search
    - difficulty: Activity difficulty level

- top_attractions: List of top places matching user interests with:
  - name, address, rating, review_count
  - image_url: Image URL from search results
  - category: Type of attraction (should align with interests)
  - suitable_for_group_size: Boolean indicating if suitable for the group

- accommodation_recommendations: List matching accommodation type preference with:
  - name, type (hotel/guest house/hostel/etc.), location
  - price_range: Within specified budget range
  - rating, image_url
  - amenities: List of amenities
  - group_capacity: Maximum guests it can accommodate

- budget_breakdown: Estimated costs breakdown:
  - accommodation_cost: Total for {duration} days
  - activities_cost: Total for all activities
  - transportation_cost: Estimated transport costs
  - food_cost: Estimated daily food costs
  - total_estimate: Overall trip cost

- Include destination_image and cover_image URLs if found
- Include weather_info (especially if start_date is provided)
- Include cultural_notes relevant to the destination
- Provide detailed general_tips considering group size and interests
- Provide transportation_tips for moving the group around
- Include difficulty_notes explaining the physical demands of the itinerary
- Add group_travel_tips for managing a group of {group_size} people

Output Format:
{format_instructions}

Generate the itinerary in valid JSON format matching the schema exactly. Ensure the itinerary is cohesive, practical, and tailored to all specified requirements.
"""

# To use this template, copy it to output_parser.py and replace the template in get_itinerary_prompt_template()