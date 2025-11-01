"""Custom LangChain tools for travel planning"""
from langchain.tools import tool
from typing import Optional, Dict, Any
import requests
from bs4 import BeautifulSoup
import time


@tool
def search_travel_information(query: str) -> str:
    """
    Search for travel information using DuckDuckGo search.
    Includes images when available.
    
    Args:
        query: Search query string (e.g., "best restaurants in Paris", "Eiffel Tower images")
    
    Returns:
        Search results as a formatted string with image URLs if available
    """
    try:
        try:
            from ddgs import DDGS
        except ImportError:
            # Fallback for old package name
            from duckduckgo_search import DDGS
        
        with DDGS() as ddgs:
            # Get text results
            text_results = list(ddgs.text(query, max_results=5))
            
            # Try to get images if the query seems image-related
            image_results = []
            if any(keyword in query.lower() for keyword in ['image', 'photo', 'picture', 'view', 'looks like']):
                try:
                    image_results = list(ddgs.images(query, max_results=3))
                except:
                    pass
            
            formatted_results = []
            
            # Add text results
            for result in text_results:
                title = result.get('title', 'No title')
                snippet = result.get('body', 'No description')
                url = result.get('href', 'No URL')
                formatted_results.append(f"Title: {title}\nDescription: {snippet}\nSource: {url}\n")
            
            # Add image URLs if found
            if image_results:
                image_urls = []
                for img in image_results:
                    image_url = img.get('image', '')
                    if image_url:
                        image_urls.append(f"Image URL: {image_url}")
                if image_urls:
                    formatted_results.append("\nAvailable Images:\n" + "\n".join(image_urls))
            
            if not formatted_results:
                return "No search results found."
            
            return "\n---\n".join(formatted_results)
    except Exception as e:
        return f"Error searching: {str(e)}"


@tool
def get_place_ratings(place_name: str, location: str) -> str:
    """
    Get ratings and review information for a place.
    Uses search to find rating information.
    
    Args:
        place_name: Name of the place/attraction
        location: City or location where the place is
    
    Returns:
        Formatted string with rating and review information
    """
    try:
        from duckduckgo_search import DDGS
        
        query = f"{place_name} {location} rating reviews"
        
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            
            if not results:
                return f"Could not find rating information for {place_name}."
            
            info = []
            for result in results:
                body = result.get('body', '')
                if 'rating' in body.lower() or 'star' in body.lower() or 'review' in body.lower():
                    info.append(body)
            
            if info:
                return "\n".join(info[:2])  # Return top 2 relevant results
            else:
                return f"Rating information for {place_name} not readily available in search results."
    except Exception as e:
        return f"Error getting ratings: {str(e)}"


@tool
def compare_prices(item: str, location: str) -> str:
    """
    Compare prices for items/services in a location.
    Uses search to find price comparison information.
    
    Args:
        item: Item or service to compare (e.g., "hotels", "restaurants", "activities")
        location: Location to search in
    
    Returns:
        Formatted string with price comparison information
    """
    try:
        from duckduckgo_search import DDGS
        
        query = f"{item} prices {location} comparison budget"
        
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))
            
            if not results:
                return f"Could not find price information for {item} in {location}."
            
            price_info = []
            for result in results:
                title = result.get('title', '')
                body = result.get('body', '')
                if any(keyword in body.lower() for keyword in ['price', 'cost', '$', '€', '£', 'budget']):
                    price_info.append(f"{title}: {body}")
            
            if price_info:
                return "\n---\n".join(price_info[:3])  # Return top 3 results
            else:
                return f"Price comparison information for {item} in {location} not readily available."
    except Exception as e:
        return f"Error comparing prices: {str(e)}"


@tool
def rank_attractions_by_category(category: str, location: str) -> str:
    """
    Rank attractions or places by category in a location based on reviews and ratings.
    
    Args:
        category: Category of attractions (e.g., "museums", "restaurants", "monuments")
        location: Location to search in
    
    Returns:
        Formatted string with ranked attractions
    """
    try:
        from duckduckgo_search import DDGS
        
        query = f"top {category} {location} best rated reviews"
        
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=8))
            
            if not results:
                return f"Could not find {category} in {location}."
            
            ranked_list = []
            for i, result in enumerate(results, 1):
                title = result.get('title', '')
                body = result.get('body', '')
                ranked_list.append(f"{i}. {title}\n   {body}\n")
            
            return "\n".join(ranked_list)
    except Exception as e:
        return f"Error ranking attractions: {str(e)}"


@tool
def get_weather_info(location: str, month: Optional[str] = None) -> str:
    """
    Get weather information for a location.
    
    Args:
        location: Location to get weather for
        month: Optional month name
    
    Returns:
        Weather information as formatted string
    """
    try:
        from duckduckgo_search import DDGS
        
        query = f"weather {location}"
        if month:
            query += f" {month}"
        
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            
            if not results:
                return f"Weather information for {location} not available."
            
            weather_info = []
            for result in results:
                body = result.get('body', '')
                if any(keyword in body.lower() for keyword in ['temperature', 'weather', 'climate', '°c', '°f']):
                    weather_info.append(body)
            
            if weather_info:
                return "\n".join(weather_info[:2])
            else:
                return f"Weather information for {location} not readily available."
    except Exception as e:
        return f"Error getting weather: {str(e)}"


@tool
def get_local_customs_tips(location: str) -> str:
    """
    Get information about local customs, etiquette, and cultural tips for a location.
    
    Args:
        location: Location to get customs information for
    
    Returns:
        Formatted string with local customs and tips
    """
    try:
        from duckduckgo_search import DDGS
        
        query = f"{location} local customs etiquette culture tips travelers"
        
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))
            
            if not results:
                return f"Local customs information for {location} not available."
            
            tips = []
            for result in results:
                body = result.get('body', '')
                tips.append(body)
            
            return "\n---\n".join(tips[:3])
    except Exception as e:
        return f"Error getting local customs: {str(e)}"

