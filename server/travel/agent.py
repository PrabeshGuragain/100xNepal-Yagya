"""LangChain agent setup with Gemini and tool calling"""
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

# Import agent components - handle different LangChain versions
AgentExecutor = None
create_react_agent = None

# Try importing AgentExecutor
try:
    from langchain.agents import AgentExecutor
except ImportError:
    try:
        from langchain.agents.agent_executor import AgentExecutor
    except ImportError:
        pass

# Try importing create_react_agent
if AgentExecutor:
    try:
        from langchain.agents import create_react_agent
    except ImportError:
        try:
            from langchain.agents.agent import create_react_agent
        except ImportError:
            try:
                from langchain.agents.react.agent import create_react_agent
            except ImportError:
                pass

# Fallback imports
if not create_react_agent:
    try:
        from langchain.agents import initialize_agent, AgentType
    except ImportError:
        pass
from core.config import settings
from travel.tools import (
    search_travel_information,
    get_place_ratings,
    compare_prices,
    rank_attractions_by_category,
    get_weather_info,
    get_local_customs_tips,
    get_place_coordinates
)
from travel.output_parser import TravelItineraryParser, get_itinerary_prompt_template
import os
from typing import Optional


def get_gemini_llm(api_key: Optional[str] = None, model: str = "gemini-2.5-flash") -> ChatGoogleGenerativeAI:
    """
    Initialize Gemini LLM
    
    Args:
        api_key: Google API key (if None, uses GOOGLE_API_KEY from env)
        model: Model name (default: gemini-pro)
    
    Returns:
        ChatGoogleGenerativeAI instance
    """
    api_key = api_key or os.getenv("GOOGLE_API_KEY") or getattr(settings, "GOOGLE_API_KEY", None)
    
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is required. Set it in environment variables or settings.")
    
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
        temperature=0.7,
        convert_system_message_to_human=True
    )


class SimpleToolAgent:
    """Simple agent that uses LLM with tools - manually executes tools"""
    
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = {tool.name: tool for tool in tools}
    
    def _execute_tool(self, tool_name: str, *args) -> str:
        """Execute a tool by name with arguments"""
        if tool_name in self.tools:
            try:
                tool = self.tools[tool_name]
                # Call tool with arguments
                if len(args) == 1:
                    result = tool.invoke(args[0])
                elif len(args) > 1:
                    # For tools that take multiple parameters, pass as tuple/dict
                    # Most tools take a single string, so combine args
                    combined_input = " ".join(str(arg) for arg in args)
                    result = tool.invoke(combined_input)
                else:
                    result = tool.invoke("")
                return str(result) if result else "No result"
            except Exception as e:
                return f"Tool error: {str(e)}"
        return f"Tool {tool_name} not found"
    
    def invoke(self, input_dict: dict) -> dict:
        """
        Execute agent with input - uses tools to gather information
        Returns dict with 'output' key
        """
        query = input_dict.get("input", "")
        
        # Extract destination from query if possible
        destination = query
        if "destination" in query.lower() or "in " in query.lower():
            # Try to extract location
            parts = query.split("in ")
            if len(parts) > 1:
                destination = parts[-1].split()[0] if parts[-1] else query
        
        # Execute tools to gather information
        tool_results = []
        
        # 1. Search for general information
        try:
            search_query = f"{destination} travel guide attractions"
            search_result = self._execute_tool("search_travel_information", search_query)
            tool_results.append(f"Search Results: {search_result[:800]}")
        except Exception as e:
            tool_results.append(f"Search error: {str(e)}")
        
        # 2. Get top attractions (this tool takes category and location as separate params)
        try:
            # rank_attractions_by_category takes (category, location)
            tool = self.tools.get("rank_attractions_by_category")
            if tool:
                result = tool.invoke({"category": "attractions", "location": destination})
                tool_results.append(f"\nTop Attractions: {str(result)[:600]}")
        except Exception as e:
            try:
                # Fallback: try as string query
                attractions_result = self._execute_tool("rank_attractions_by_category", f"attractions {destination}")
                tool_results.append(f"\nTop Attractions: {attractions_result[:600]}")
            except:
                pass
        
        # 3. Get weather info
        try:
            weather_result = self._execute_tool("get_weather_info", destination)
            tool_results.append(f"\nWeather: {weather_result[:400]}")
        except:
            pass
        
        # 4. Get cultural tips
        try:
            cultural_result = self._execute_tool("get_local_customs_tips", destination)
            tool_results.append(f"\nCultural Tips: {cultural_result[:400]}")
        except:
            pass
        
        # 5. Note about coordinates - will be added post-processing
        tool_results.append("\nNote: Coordinates will be automatically fetched for all places in the final itinerary.")
        
        # Combine tool results
        tool_output = "\n".join(tool_results)
        
        # Build final prompt with tool results
        prompt = f"""You are an expert travel planner AI. Based on the research findings below, provide a comprehensive summary.

Research Findings:
{tool_output}

User Query: {query}

Provide a well-structured summary including:
1. Top attractions and must-visit places
2. Ratings and reviews when mentioned
3. Price information if available
4. Weather and best time to visit
5. Cultural tips and local customs
6. General recommendations

Comprehensive Summary:"""
        
        # Get response from LLM
        try:
            response = self.llm.invoke(prompt)
            output = response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            output = f"Error generating summary: {str(e)}\n\nTool Results:\n{tool_output[:1000]}"
        
        return {"output": output}


def create_travel_agent(llm: Optional[ChatGoogleGenerativeAI] = None):
    """
    Create a travel planning agent with tools
    
    Args:
        llm: Optional LLM instance (creates new one if not provided)
    
    Returns:
        Agent instance (SimpleToolAgent or AgentExecutor)
    """
    if llm is None:
        llm = get_gemini_llm()
    
    # Define available tools
    tools = [
        search_travel_information,
        get_place_ratings,
        compare_prices,
        rank_attractions_by_category,
        get_weather_info,
        get_local_customs_tips,
        get_place_coordinates
    ]
    
    # Try to use AgentExecutor if available
    if create_react_agent and AgentExecutor:
        try:
            prompt = PromptTemplate.from_template("""
You are an expert travel planner AI. Your task is to help users create comprehensive travel itineraries.

You have access to the following tools:
{tools}

Use the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}
""")
            
            agent = create_react_agent(llm, tools, prompt)
            
            agent_executor = AgentExecutor(
                agent=agent,
                tools=tools,
                verbose=True,
                handle_parsing_errors=True,
                max_iterations=15,
                max_execution_time=300
            )
            
            return agent_executor
        except Exception:
            pass
    
    # Fallback to simple agent that uses LLM directly with tools
    return SimpleToolAgent(llm, tools)


def create_itinerary_agent_with_parser(
    llm: Optional[ChatGoogleGenerativeAI] = None,
    format_instructions: Optional[str] = None
) -> tuple:
    """
    Create agent with itinerary output parser
    
    Args:
        llm: Optional LLM instance
        format_instructions: Optional format instructions (uses parser default if None)
    
    Returns:
        Tuple of (AgentExecutor, TravelItineraryParser)
    """
    parser = TravelItineraryParser()
    
    if format_instructions is None:
        format_instructions = parser.get_format_instructions()
    
    if llm is None:
        llm = get_gemini_llm()
    
    # Create agent with tools
    agent_executor = create_travel_agent(llm)
    
    return agent_executor, parser

