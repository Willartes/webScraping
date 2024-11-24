import json
from typing import List, Dict
from datetime import datetime

ARQUIVO_HISTORICO = "historico.json"

def adicionar_historico(nome_arquivo: str, caminho_arquivo: str, total_itens: int):
    novo_item = {
        "nome_arquivo": nome_arquivo,
        "caminho_arquivo": caminho_arquivo,
        "total_itens": total_itens,
        "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    historico = carregar_historico()
    historico.insert(0, novo_item)
    salvar_historico(historico)

def obter_historico() -> List[Dict]:
    return carregar_historico()

def carregar_historico() -> List[Dict]:
    try:
        with open(ARQUIVO_HISTORICO, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def salvar_historico(historico: List[Dict]):
    with open(ARQUIVO_HISTORICO, "w") as f:
        json.dump(historico, f, indent=2)