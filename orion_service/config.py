import os
import random

# --- Concurrency and Timeout Settings ---

# The maximum number of concurrent scraping requests.
# This is crucial to avoid overwhelming external services and getting IP-banned.
SEMAPHORE_LIMIT: int = int(os.getenv("SEMAPHORE_LIMIT", "8"))

# The timeout in seconds for each external network request.
REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "10"))


# --- User-Agent Rotation Settings ---

# A list of user agents to rotate through for scraping requests.
# This helps mimic different browsers and reduces the chance of being blocked.
DEFAULT_USER_AGENTS: list[str] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
]

# Load user agents from environment variable if available, otherwise use default.
# The variable should be a comma-separated string.
_user_agents_str = os.getenv("USER_AGENTS")
USER_AGENTS: list[str] = [agent.strip() for agent in _user_agents_str.split(",")] if _user_agents_str else DEFAULT_USER_AGENTS

def get_random_user_agent() -> str:
    """Returns a random user agent from the list."""
    if not USER_AGENTS:
        # Fallback in case the list is empty for some reason
        return DEFAULT_USER_AGENTS[0]
    return random.choice(USER_AGENTS)
