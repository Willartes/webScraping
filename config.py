# config.py
SCRAPING_CONFIG = {
    "search_term": "linguagem C",
    "max_pages": 2
}

# No arquivo principal
from config import SCRAPING_CONFIG

@app.post("/scraping")
async def scrape_estante_virtual(
    request: ScrapingRequest = SCRAPING_CONFIG
) -> List[ScrapingResult]:
    ...