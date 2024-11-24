from datetime import datetime
from pathlib import Path
import json
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class ReportGenerator:
    def __init__(self, output_dir: str = "reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    async def generate_report(self, stats: 'ScrapingStats', data: List[Dict], filename: str) -> str:
        report = {
            "estatisticas": stats.to_dict(),
            "resumo_dados": {
                "total_items": len(data),
                "preco_medio": self._calculate_average_price(data),
                "distribuicao_vendedores": self._get_seller_distribution(data)
            }
        }
        
        report_path = self.output_dir / f"report_{filename}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return str(report_path)
    
    def _calculate_average_price(self, data: List[Dict]) -> float:
        prices = []
        for item in data:
            try:
                price = float(str(item.get('preco', '0')).replace('R$', '').replace('.', '').replace(',', '.').strip())
                prices.append(price)
            except ValueError:
                continue
        return sum(prices) / len(prices) if prices else 0
    
    def _get_seller_distribution(self, data: List[Dict]) -> Dict[str, int]:
        distribution = {}
        for item in data:
            seller = item.get('vendedor', 'Não especificado')
            distribution[seller] = distribution.get(seller, 0) + 1
        return distribution