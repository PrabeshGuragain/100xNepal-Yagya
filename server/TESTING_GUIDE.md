

### Step 5: Test the API

You have several options to test:

#### Option A: Using Swagger UI (Recommended - Easiest)

1. Open browser and go to: **http://localhost:8000/docs**
2. Find the **`POST /travel/plan`** endpoint
3. Click "Try it out"
4. Use this sample request body:

```json
{
  "destination": "Paris, France",
  "days": 3,
  "origin": "New York",
  "travel_type": "cultural",
  "budget": "medium",
  "preferences": "museums, food, historic sites",
  "date": "June 2024"
}
```

5. Click "Execute"
6. Wait for the response (may take 30-60 seconds as the agent uses tools)

#### Option B: Using curl (Command Line)

```bash
curl -X POST "http://localhost:8000/travel/plan" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo, Japan",
    "days": 5,
    "travel_type": "cultural",
    "budget": "medium",
    "preferences": "temples, food, technology"
  }'
```

#### Option C: Using Python requests

Create `test_travel_api.py`:

```python
import requests
import json

url = "http://localhost:8000/travel/plan"

payload = {
    "destination": "Bali, Indonesia",
    "days": 4,
    "travel_type": "adventure",
    "budget": "low to medium",
    "preferences": "beaches, temples, water sports"
}

response = requests.post(url, json=payload)
print("Status:", response.status_code)
print("\nResponse:")
print(json.dumps(response.json(), indent=2))
```

Run it:
```bash
python test_travel_api.py
```

#### Option D: Using Postman/Insomnia

1. Create new POST request
2. URL: `http://localhost:8000/travel/plan`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "destination": "Rome, Italy",
  "days": 7,
  "travel_type": "cultural",
  "preferences": "ancient history, food, art"
}
```

---

### Step 6: Check Health Endpoint

Test if the service is ready:

```bash
curl http://localhost:8000/travel/health
```

Or visit: http://localhost:8000/travel/health

Should return:
```json
{
  "status": "healthy",
  "service": "travel_planning",
  "agent_initialized": true
}
```

---

### Step 7: Verify Response

A successful response should include:

```json
{
  "success": true,
  "itinerary": {
    "summary": "...",
    "destination": "Paris",
    "total_days": 3,
    "day_plans": [
      {
        "day_number": 1,
        "title": "...",
        "description": "...",
        "activities": [...]
      }
    ],
    "top_attractions": [...],
    "accommodation_recommendations": [...],
    "general_tips": [...]
  },
  "processing_time": 45.2
}
```

---

## Troubleshooting

### Error: "GOOGLE_API_KEY is required"

**Solution:**
- Make sure `.env` file exists in `server/` directory
- Check that `GOOGLE_API_KEY=your-actual-key` is in the file
- Restart the server after adding the key

### Error: Import errors (langchain, etc.)

**Solution:**
```bash
# Reinstall dependencies
uv sync
# or
pip install -e . --force-reinstall
```

### Error: "No module named 'duckduckgo_search'"

**Solution:**
```bash
pip install duckduckgo-search beautifulsoup4
```

### Server won't start

**Check:**
1. Port 8000 is not already in use
2. All dependencies are installed
3. Python version is 3.11+

### Agent takes too long / timeout

**Normal behavior:**
- First request may take 1-2 minutes (agent initialization)
- Subsequent requests: 30-60 seconds
- The agent uses multiple tools which takes time

**If timeout:**
- Check internet connection (agent needs to search)
- Verify Gemini API key is valid
- Check server logs for errors

---

## Sample Test Cases

### Minimal Request (Just Destination)
```json
{
  "destination": "London"
}
```

### Full Request
```json
{
  "destination": "New York City",
  "days": 5,
  "origin": "Los Angeles",
  "travel_type": "mixed",
  "budget": "high budget $5000",
  "preferences": "nightlife, shopping, Broadway shows",
  "date": "December 2024",
  "notes": "First time visit, prefer walking"
}
```

### Different Travel Types
```json
{
  "destination": "Jerusalem",
  "days": 4,
  "travel_type": "religious"
}
```

---

## Expected Response Time

- **First request:** 60-120 seconds (agent initialization)
- **Subsequent requests:** 30-90 seconds
- **Simple destinations:** 30-45 seconds
- **Complex multi-day plans:** 60-120 seconds

This is normal - the agent is:
1. Searching for information
2. Getting ratings and reviews
3. Comparing prices
4. Ranking attractions
5. Generating detailed itinerary
6. Validating output

---

## Next Steps

1. ✅ Test with different destinations
2. ✅ Try different travel types
3. ✅ Test with various preferences
4. ✅ Check response includes images (when available)
5. ✅ Verify day_plans have detailed activities
6. ✅ Confirm ratings and costs are included

Happy Testing! 🚀

