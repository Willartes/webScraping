# test_api.py
import requests
import pandas as pd
from datetime import datetime

def test_scraping():
    response = requests.post(
        "http://localhost:8000/scraping",
        json={
            "search_term": "linguagem C",
            "max_pages": 2
        }
    )
    
    if response.status_code == 200:
        results = response.json()
        print("Scraping realizado com sucesso!")
        print(f"Número de resultados encontrados: {len(results)}")
        
        # Converte os resultados para DataFrame
        df = pd.DataFrame(results)
        
        # Gera nome do arquivo com timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"resultados_scraping_{timestamp}.xlsx"
        
        # Salva no Excel
        df.to_excel(filename, index=False, engine='openpyxl')
        print(f"\nResultados salvos em: {filename}")
        
        # Imprime os detalhes de cada livro encontrado
        for i, book in enumerate(results, 1):
            print(f"\nLivro {i}:")
            print(f"Título: {book['titulo']}")
            print(f"Autor: {book['autor']}")
            print(f"Preço: R$ {book['preco']}")
            print(f"Editora: {book['editora']}")
            print(f"Ano: {book['ano']}")
            print(f"Estado: {book['estado']}")
            print(f"URL: {book['url']}")
    else:
        print(f"Erro: {response.status_code}")
        print(f"Detalhes: {response.text}")

if __name__ == "__main__":
    test_scraping()