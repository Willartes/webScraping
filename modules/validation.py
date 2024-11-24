from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict

@dataclass
class ScrapingStats:
    start_time: datetime
    end_time: Optional[datetime] = None
    total_items: int = 0
    total_pages: int = 0
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def to_dict(self):
        return {
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "total_items": self.total_items,
            "total_pages": self.total_pages,
            "errors": self.errors,
            "warnings": self.warnings
        }

class DataValidator:
    def __init__(self):
        self.required_fields = {'titulo', 'url'}
        self.price_threshold = 10000
    
    def validate_item(self, item: Dict) -> List[str]:
        errors = []
        
        for field in self.required_fields:
            if field not in item or not item[field]:
                errors.append(f"Campo obrigatório '{field}' ausente ou vazio")
        
        if 'preco' in item and item['preco']:
            try:
                preco = float(str(item['preco']).replace('R$', '').replace('.', '').replace(',', '.').strip())
                if preco < 0 or preco > self.price_threshold:
                    errors.append(f"Preço inválido: {preco}")
            except ValueError:
                errors.append(f"Formato de preço inválido: {item['preco']}")
        
        return errors