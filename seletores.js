// Definição dos exemplos de sites
const EXEMPLOS = {
    mercadolivre: {
        url: "https://lista.mercadolivre.com.br/informatica/notebooks",
        seletores: {
            container: "div.ui-search-result",
            titulo: "h2.ui-search-item__title",
            preco: "span.andes-money-amount__fraction",
            vendedor: "p.ui-search-official-store-label"
        },
        seletorProximaPagina: "a.andes-pagination__link[title='Seguinte']"
    },
    tabela_alunos: {
        url: "https://sed.educacao.sp.gov.br/MinhasTurmas/GridAcesso",
        seletores: {
            container: "table#tbAlunos tbody tr",
            numero: "td:nth-child(1)",
            nome: "td:nth-child(2)",
            situacao: "td:nth-child(8)"
        },
        seletorProximaPagina: "",
        credenciais: {
            usuario: "rg264091681sp",
            senha: "Willm@tic@2226"
        }
    },
    amazon: {
        url: "https://www.amazon.com.br/s?k=livros+python",
        seletores: {
            container: "div.s-result-item[data-component-type='s-search-result']",
            titulo: "h2 span.a-text-normal",
            preco: "span.a-price-whole",
            rating: "span.a-icon-alt",
            vendedor: "span.a-size-small.a-color-secondary"
        },
        seletorProximaPagina: "a.s-pagination-next"
    },
    estantevirtual: {
        url: "https://www.estantevirtual.com.br/busca?q=linguagem%20C",
        seletores: {
            container: "div.product-item",
            titulo: "h2.product-item__title",
            preco: "span[data-auto='price']",
            autor: "p.product-item__author",
            editora: "p.product-item__publishing",
            ano: "p.product-item__year",
            estado: "p.product-item__variations__text",
            url: "a.product-item__link"
        },
        seletorProximaPagina: "a.pagination__next"
    },
    kabum: {
        url: "https://www.kabum.com.br/computadores/notebooks",
        seletores: {
            container: "div.productCard",
            titulo: "span.nameCard",
            preco: "span.priceCard",
            avaliacao: "div.starsCard"
        },
        seletorProximaPagina: "a.nextPage"
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const form = document.getElementById('scrapingForm');
    const startButton = document.getElementById('startScrapingBtn');
    const addButton = document.getElementById('addSelector');
    const removeButton = document.getElementById('removeSelector');
    const selectorsDiv = document.getElementById('selectors');
    const status = document.getElementById('status');
    const statusMessage = document.getElementById('statusMessage');
    const statsInfo = document.getElementById('statsInfo');
    const totalItems = document.getElementById('totalItems');
    const totalPages = document.getElementById('totalPages');
    const fileHistory = document.getElementById('fileHistory');
    const examplesSelect = document.getElementById('examples');

    // Função para inicializar o formulário com valores padrão
    function initializeForm() {
        // Limpar valores anteriores
        document.getElementById('url').value = '';
        document.getElementById('fileName').value = '';
        document.getElementById('seletorProximaPagina').value = '';
        document.getElementById('limiteItens').value = '100';
        document.getElementById('limitePaginas').value = '5';
        document.getElementById('delayPaginas').value = '2.0';
        examplesSelect.value = ''; // Resetar select de exemplos
        
        // Limpar e inicializar seletores
        selectorsDiv.innerHTML = '';
        initializeContainerSelector();

        // Limpar status e histórico
        status.classList.add('hidden');
        statsInfo.classList.add('hidden');
        statusMessage.textContent = '';
    }

    // Função para inicializar seletor container
    function initializeContainerSelector() {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'selector-row flex items-center';
        containerDiv.innerHTML = `
            <div class="w-1/3 mr-2">
                <input type="text" 
                    value="container" 
                    class="selector-name w-full px-4 py-2 border rounded-lg" 
                    readonly 
                    required>
            </div>
            <div class="w-1/2">
                <input type="text" 
                    value=""
                    placeholder="Seletor container (ex: div.item)" 
                    class="selector-value w-full px-4 py-2 border rounded-lg" 
                    required>
            </div>
        `;
        selectorsDiv.appendChild(containerDiv);
    }

    // Função para download de arquivo
    async function downloadFile(filePath, fileName) {
        try {
            const response = await fetch(`http://localhost:8000/download/${fileName}`);
            if (!response.ok) throw new Error('Erro ao baixar arquivo');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro no download:', error);
            alert('Erro ao baixar o arquivo: ' + error.message);
        }
    }

    // Função para adicionar ao histórico
    function addToHistory(fileName, items, pages) {
        const historyItem = document.createElement('div');
        historyItem.className = 'bg-white p-3 rounded-lg shadow';
        historyItem.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium">${fileName}</span>
                <button class="download-btn text-blue-500 hover:text-blue-700">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
            <div class="text-sm text-gray-500 mt-1">
                Itens: ${items} | Páginas: ${pages}
            </div>
        `;
        
        const downloadBtn = historyItem.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => {
            downloadFile(`exports/${fileName}`, fileName);
        });

        fileHistory.insertBefore(historyItem, fileHistory.firstChild);
    }

    // Inicializar formulário quando a página carregar
    initializeForm();

    // Prevenir submissão do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        return false;
    });

    // Carregar exemplo selecionado
    examplesSelect.addEventListener('change', (e) => {
        const exemplo = EXEMPLOS[e.target.value];
        if (!exemplo) {
            initializeForm();
            return;
        }

        // Popular campos com dados do exemplo
        document.getElementById('url').value = exemplo.url;
        document.getElementById('seletorProximaPagina').value = exemplo.seletorProximaPagina || '';
        
        selectorsDiv.innerHTML = '';
        
        // Adicionar container e outros seletores
        Object.entries(exemplo.seletores).forEach(([nome, valor], index) => {
            const newRow = document.createElement('div');
            newRow.className = 'selector-row flex items-center' + (index > 0 ? ' mt-2' : '');
            newRow.innerHTML = `
                <div class="w-1/3 mr-2">
                    <input type="text" 
                        value="${nome}" 
                        class="selector-name w-full px-4 py-2 border rounded-lg" 
                        ${nome === 'container' ? 'readonly' : ''}
                        required>
                </div>
                <div class="w-1/2">
                    <input type="text" 
                        value="${valor}" 
                        class="selector-value w-full px-4 py-2 border rounded-lg" 
                        required>
                </div>
            `;
            selectorsDiv.appendChild(newRow);
        });
    });

    // Adicionar novo seletor
    addButton.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.className = 'selector-row flex items-center mt-2';
        newRow.innerHTML = `
            <div class="w-1/3 mr-2">
                <input type="text" 
                    placeholder="Nome do seletor" 
                    class="selector-name w-full px-4 py-2 border rounded-lg" 
                    required>
            </div>
            <div class="w-1/2">
                <input type="text" 
                    placeholder="Seletor CSS (ex: div.item)" 
                    class="selector-value w-full px-4 py-2 border rounded-lg" 
                    required>
            </div>
        `;
        selectorsDiv.appendChild(newRow);
    });

    // Remover último seletor
    removeButton.addEventListener('click', () => {
        const rows = selectorsDiv.getElementsByClassName('selector-row');
        if (rows.length > 1) {
            const lastRow = rows[rows.length - 1];
            const selectorName = lastRow.querySelector('.selector-name').value;
            if (selectorName !== 'container') {
                selectorsDiv.removeChild(lastRow);
            } else {
                alert("O seletor 'container' não pode ser removido!");
            }
        } else {
            alert("É necessário manter pelo menos um seletor!");
        }
    });

    // Processar scraping
    startButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            // Validar formulário
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Atualizar status
            status.classList.remove('hidden');
            statsInfo.classList.add('hidden');
            statusMessage.textContent = 'Iniciando processo de scraping...';

            // Coletar seletores
            const selectors = {};
            let hasContainer = false;

            selectorsDiv.querySelectorAll('.selector-row').forEach(row => {
                const nameInput = row.querySelector('.selector-name');
                const valueInput = row.querySelector('.selector-value');
                
                if (nameInput && valueInput) {
                    const name = nameInput.value.trim();
                    const value = valueInput.value.trim();
                    
                    if (name === 'container') hasContainer = true;
                    if (name && value) selectors[name] = value;
                }
            });

            if (!hasContainer) {
                throw new Error("Seletor 'container' é obrigatório");
            }

            // Preparar dados da requisição
            const data = {
                url: document.getElementById('url').value,
                seletores: selectors,
                nome_arquivo: document.getElementById('fileName').value || 'scraping_result',
                formato_arquivo: document.getElementById('fileFormat').value,
                limite_itens: parseInt(document.getElementById('limiteItens').value) || 100,
                limite_paginas: parseInt(document.getElementById('limitePaginas').value) || 5,
                delay_entre_paginas: parseFloat(document.getElementById('delayPaginas').value) || 2.0,
                seletor_proxima_pagina: document.getElementById('seletorProximaPagina').value || null,
            };

            // Adicionar credenciais se necessário
            const exemplo = EXEMPLOS[examplesSelect.value];
            if (exemplo?.credenciais) {
                data.credenciais = exemplo.credenciais;
                data.delay_entre_paginas = Math.max(data.delay_entre_paginas, 5.0);
            }

            console.log('Enviando requisição com dados:', data);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000);

            const response = await fetch('http://localhost:8000/scraping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);

            if (!response.ok) {
                throw new Error(
                    typeof responseData.detail === 'object' 
                        ? responseData.detail.message || JSON.stringify(responseData.detail)
                        : responseData.detail || 'Erro durante o scraping'
                );
            }

            // Atualizar status com sucesso
            statusMessage.textContent = `Dados extraídos com sucesso! Arquivo gerado: ${responseData.arquivo}`;
            
            if (responseData.total_itens) {
                statsInfo.classList.remove('hidden');
                totalItems.textContent = responseData.total_itens;
                totalPages.textContent = responseData.total_paginas;
                
                // Adicionar ao histórico
                addToHistory(
                    responseData.arquivo,
                    responseData.total_itens,
                    responseData.total_paginas
                );
            }

        } catch (error) {
            console.error('Erro:', error);
            statusMessage.textContent = error.name === 'AbortError' 
                ? 'A operação excedeu o tempo limite de 5 minutos.'
                : error.message.includes('Failed to fetch')
                    ? 'Erro de conexão com o servidor. Verifique se o servidor está rodando.'
                    : `Erro: ${error.message}`;
        }
        
    });
});