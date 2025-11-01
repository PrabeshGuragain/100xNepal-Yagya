"""
Quick test script for Travel Planner API
Run this after starting the server: python test_travel_api.py
"""
import requests
import json
import sys


def test_travel_api():
    """Test the travel planning API"""
    
    url = "http://localhost:8000/travel/plan"
    
    # Sample request - edit this as needed
    payload = {
        "destination": "Paris, France",
        "days": 3,
        "origin": "New York",
        "travel_type": "cultural",
        "budget": "medium",
        "preferences": "museums, food, historic sites",
        "date": "June 2024"
    }
    
    print("=" * 60)
    print("Testing Travel Planner API")
    print("=" * 60)
    print(f"\nRequest URL: {url}")
    print(f"\nRequest Payload:")
    print(json.dumps(payload, indent=2))
    print("\n" + "-" * 60)
    print("Sending request... (this may take 30-90 seconds)")
    print("-" * 60 + "\n")
    
    try:
        response = requests.post(url, json=payload, timeout=180)
        
        print(f"Status Code: {response.status_code}\n")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success"):
                print("✅ SUCCESS! Itinerary generated.\n")
                print("=" * 60)
                print("RESPONSE SUMMARY")
                print("=" * 60)
                
                itinerary = data.get("itinerary", {})
                print(f"\n📌 Destination: {itinerary.get('destination')}")
                print(f"📅 Days: {itinerary.get('total_days')}")
                print(f"💰 Budget: {itinerary.get('budget_estimate', 'Not specified')}")
                print(f"⏱️  Processing Time: {data.get('processing_time')} seconds")
                
                day_plans = itinerary.get('day_plans', [])
                print(f"\n📋 Day Plans: {len(day_plans)} days planned")
                
                for day in day_plans[:3]:  # Show first 3 days
                    print(f"\n  Day {day.get('day_number')}: {day.get('title')}")
                    activities = day.get('activities', [])
                    print(f"    Activities: {len(activities)}")
                
                attractions = itinerary.get('top_attractions', [])
                if attractions:
                    print(f"\n⭐ Top Attractions: {len(attractions)} listed")
                
                accommodations = itinerary.get('accommodation_recommendations', [])
                if accommodations:
                    print(f"🏨 Accommodations: {len(accommodations)} recommendations")
                
                print("\n" + "=" * 60)
                print("Full Response (first 2000 chars):")
                print("=" * 60)
                response_text = json.dumps(data, indent=2)
                print(response_text[:2000])
                if len(response_text) > 2000:
                    print(f"\n... (truncated, total length: {len(response_text)} chars)")
                
            else:
                print("❌ FAILED! Error generating itinerary.")
                print(f"Message: {data.get('message')}")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to server.")
        print("Make sure the server is running on http://localhost:8000")
        print("\nStart the server with: python main.py")
        
    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out.")
        print("The agent may be taking longer than expected.")
        print("Try a simpler request or check server logs.")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print(f"Error Type: {type(e).__name__}")


if __name__ == "__main__":
    print("\n🚀 Travel Planner API Test Script\n")
    test_travel_api()
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60 + "\n")

