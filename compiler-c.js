// compiler-c.js - Compilador C Online para SiteParaEstudar
// Para usar: <script src="compiler-c.js"></script>
// Requer elementos HTML com os IDs: code-area, input-area, output-area, run-btn, spinner, status-text

(function() {
    'use strict';

    // ========== EXEMPLOS DE CÓDIGO ==========
    const examples = {
        hello: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Bem-vindo ao compilador C!\\n");
    printf("SiteParaEstudar © 2026\\n");
    return 0;
}`,
        loop: `#include <stdio.h>

int main() {
    int i, soma = 0;
    printf("Loop for de 1 a 10:\\n");
    for (i = 1; i <= 10; i++) {
        printf("%d ", i);
        soma += i;
    }
    printf("\\n\\nSoma total: %d\\n", soma);
    printf("Média: %.2f\\n", soma / 10.0);
    return 0;
}`,
        array: `#include <stdio.h>

int main() {
    int numeros[5] = {10, 20, 30, 40, 50};
    int soma = 0;
    float media;
    
    printf("Elementos do array:\\n");
    printf("--------------------\\n");
    
    for (int i = 0; i < 5; i++) {
        printf("numeros[%d] = %d\\n", i, numeros[i]);
        soma += numeros[i];
    }
    
    media = (float)soma / 5;
    
    printf("--------------------\\n");
    printf("Soma total: %d\\n", soma);
    printf("Média: %.2f\\n", media);
    
    return 0;
}`,
        function: `#include <stdio.h>

// Função recursiva para calcular fatorial
int fatorial(int n) {
    if (n <= 1) return 1;
    return n * fatorial(n - 1);
}

// Função para verificar se é par
int ehPar(int n) {
    return n % 2 == 0;
}

int main() {
    int num = 5;
    
    printf("Fatorial de %d = %d\\n", num, fatorial(num));
    printf("\\nNúmeros pares de 1 a 10:\\n");
    
    for (int i = 1; i <= 10; i++) {
        if (ehPar(i)) {
            printf("%d é par\\n", i);
        }
    }
    
    return 0;
}`,
        pointer: `#include <stdio.h>

void troca(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    
    printf("Antes da troca:\\n");
    printf("x = %d, y = %d\\n", x, y);
    printf("Endereços: &x = %p, &y = %p\\n", (void*)&x, (void*)&y);
    
    troca(&x, &y);
    
    printf("\\nDepois da troca:\\n");
    printf("x = %d, y = %d\\n", x, y);
    
    return 0;
}`,
        structs: `#include <stdio.h>
#include <string.h>

struct Aluno {
    char nome[50];
    int idade;
    float nota;
};

int main() {
    struct Aluno aluno1;
    
    strcpy(aluno1.nome, "João Silva");
    aluno1.idade = 20;
    aluno1.nota = 8.5;
    
    printf("Dados do Aluno:\\n");
    printf("Nome: %s\\n", aluno1.nome);
    printf("Idade: %d anos\\n", aluno1.idade);
    printf("Nota: %.2f\\n", aluno1.nota);
    
    if (aluno1.nota >= 7.0) {
        printf("Status: Aprovado! ✅\\n");
    } else {
        printf("Status: Recuperação 📚\\n");
    }
    
    return 0;
}`,
        files: `#include <stdio.h>

int main() {
    FILE *arquivo;
    char texto[100];
    
    // Escrevendo em arquivo
    arquivo = fopen("exemplo.txt", "w");
    if (arquivo != NULL) {
        fprintf(arquivo, "SiteParaEstudar\\n");
        fprintf(arquivo, "Compilador C Online\\n");
        fclose(arquivo);
        printf("✅ Arquivo criado com sucesso!\\n");
    }
    
    // Lendo arquivo
    arquivo = fopen("exemplo.txt", "r");
    if (arquivo != NULL) {
        printf("\\n📄 Conteúdo do arquivo:\\n");
        while (fgets(texto, sizeof(texto), arquivo) != NULL) {
            printf("%s", texto);
        }
        fclose(arquivo);
    }
    
    return 0;
}`
    };

    // ========== APIS DE COMPILAÇÃO ==========
    const COMPILER_APIS = [
        {
            name: 'Glot.io',
            url: 'https://glot.io/api/run/c/latest',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 01234567-89ab-cdef-0123-456789abcdef'
            },
            buildBody: (code, input) => ({
                files: [{ name: 'main.c', content: code }],
                stdin: input,
                command: ''
            }),
            parseResponse: (result) => ({
                output: result.stdout || '',
                error: result.stderr || result.error || '',
                success: !result.stderr && !result.error
            })
        },
        {
            name: 'OneCompiler',
            url: 'https://onecompiler.com/api/code/exec',
            headers: { 'Content-Type': 'application/json' },
            buildBody: (code, input) => ({
                language: 'c',
                code: code,
                input: input
            }),
            parseResponse: (result) => ({
                output: result.output || result.stdout || '',
                error: result.stderr || result.error || '',
                success: !result.stderr && !result.error
            })
        }
    ];

    // ========== SIMULADOR LOCAL (FALLBACK) ==========
    function simulateCompiler(code, input) {
        let output = '';
        let inputValues = input ? input.split(/[\s,\n]+/).filter(v => v.length > 0) : [];
        let inputIndex = 0;
        
        // Processa o código linha por linha
        const lines = code.split('\n');
        let inMain = false;
        let braceCount = 0;
        
        for (let line of lines) {
            const trimmed = line.trim();
            
            // Detecta início da main
            if (trimmed.includes('int main')) {
                inMain = true;
                continue;
            }
            
            if (!inMain) continue;
            
            // Conta chaves para saber quando sai da main
            braceCount += (trimmed.match(/\{/g) || []).length;
            braceCount -= (trimmed.match(/\}/g) || []).length;
            
            if (braceCount < 0) break;
            
            // Processa printf
            const printfMatch = trimmed.match(/printf\s*\(\s*"([^"]*)"\s*(?:,\s*(.+?))?\s*\)\s*;/);
            if (printfMatch) {
                let str = printfMatch[1];
                let args = printfMatch[2] ? printfMatch[2].split(',').map(a => a.trim()) : [];
                
                // Substitui caracteres especiais
                str = str.replace(/\\n/g, '\n');
                str = str.replace(/\\t/g, '\t');
                str = str.replace(/\\\\/g, '\\');
                
                // Substitui placeholders %d, %f, %s, %p
                let argIndex = 0;
                str = str.replace(/%[dfsplu]|%\.\d+f/g, (match) => {
                    if (match.includes('p')) return '0x' + Math.random().toString(16).substr(2, 8);
                    if (inputIndex < inputValues.length && !args[argIndex]) {
                        return inputValues[inputIndex++];
                    }
                    if (argIndex < args.length) {
                        return args[argIndex++].replace(/"/g, '').trim();
                    }
                    return '?';
                });
                
                output += str;
                continue;
            }
            
            // Processa scanf (simulado)
            if (trimmed.includes('scanf')) {
                if (inputIndex < inputValues.length) {
                    output += `[scanf: usando valor "${inputValues[inputIndex]}"]\n`;
                } else {
                    output += '[scanf: use o campo "Entrada" acima]\n';
                }
                continue;
            }
        }
        
        if (!output) {
            output = '[⚠️ Código executado em modo simulação]\n';
            output += '[Apenas printf() e scanf() são simulados]\n';
            output += '[Para loops, arrays e funções complexas, a API real é necessária]\n';
        }
        
        return output;
    }

    // ========== FUNÇÃO PRINCIPAL DE COMPILAÇÃO ==========
    async function compileAndRun() {
        const codeArea = document.getElementById('code-area');
        const inputArea = document.getElementById('input-area');
        const outputArea = document.getElementById('output-area');
        const runBtn = document.getElementById('run-btn');
        const spinner = document.getElementById('spinner');
        const statusText = document.getElementById('status-text');
        
        if (!codeArea || !outputArea) {
            console.error('Elementos necessários não encontrados!');
            alert('Erro: Elementos do compilador não encontrados na página.');
            return;
        }
        
        const code = codeArea.value;
        const input = inputArea ? inputArea.value : '';
        
        if (!code.trim()) {
            alert('Por favor, digite algum código C!');
            return;
        }
        
        // UI de loading
        if (runBtn) runBtn.disabled = true;
        if (spinner) spinner.classList.add('show');
        outputArea.textContent = '🔄 Compilando...';
        if (statusText) {
            statusText.textContent = '⏳ Conectando às APIs...';
            statusText.className = '';
        }
        
        let compiled = false;
        
        // Tenta cada API em sequência
        for (const api of COMPILER_APIS) {
            try {
                if (statusText) statusText.textContent = `⏳ Tentando ${api.name}...`;
                
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);
                
                const response = await fetch(api.url, {
                    method: 'POST',
                    headers: api.headers,
                    body: JSON.stringify(api.buildBody(code, input)),
                    signal: controller.signal
                });
                
                clearTimeout(timeout);
                
                if (!response.ok) continue;
                
                const result = await response.json();
                const parsed = api.parseResponse(result);
                
                let finalOutput = '';
                
                if (parsed.error) {
                    finalOutput = '❌ Erros:\n' + parsed.error + '\n';
                }
                if (parsed.output) {
                    finalOutput += parsed.output;
                }
                
                outputArea.textContent = finalOutput || '(Sem saída)';
                
                if (statusText) {
                    if (parsed.success) {
                        statusText.textContent = `✅ Executado com sucesso (${api.name})`;
                        statusText.className = 'success';
                    } else {
                        statusText.textContent = `⚠️ Executado com erros (${api.name})`;
                        statusText.className = 'error';
                    }
                }
                
                compiled = true;
                break;
                
            } catch (error) {
                console.warn(`${api.name} falhou:`, error.message);
                continue;
            }
        }
        
        // Fallback para simulador local
        if (!compiled) {
            if (statusText) {
                statusText.textContent = '⚠️ Modo simulação (APIs offline)';
                statusText.className = '';
            }
            
            try {
                const simulatedOutput = simulateCompiler(code, input);
                outputArea.textContent = simulatedOutput;
            } catch (simError) {
                outputArea.textContent = '❌ Erro crítico: Nenhuma API disponível.\n' + simError.message;
                if (statusText) {
                    statusText.textContent = '❌ Todas as APIs falharam';
                    statusText.className = 'error';
                }
            }
        }
        
        // Restaura UI
        if (runBtn) runBtn.disabled = false;
        if (spinner) spinner.classList.remove('show');
    }

    // ========== FUNÇÕES AUXILIARES ==========
    function loadExample(name) {
        const codeArea = document.getElementById('code-area');
        const outputArea = document.getElementById('output-area');
        const statusText = document.getElementById('status-text');
        
        if (!codeArea) return;
        
        if (examples[name]) {
            codeArea.value = examples[name];
            if (outputArea) outputArea.textContent = '// Exemplo carregado. Clique em "Executar" ou pressione Ctrl+Enter!';
            if (statusText) {
                statusText.textContent = '📝 Exemplo carregado: ' + name;
                statusText.className = '';
            }
        }
    }

    function clearCode() {
        const codeArea = document.getElementById('code-area');
        const inputArea = document.getElementById('input-area');
        const outputArea = document.getElementById('output-area');
        const statusText = document.getElementById('status-text');
        
        if (codeArea) codeArea.value = '';
        if (inputArea) inputArea.value = '';
        if (outputArea) outputArea.textContent = '// O resultado aparecerá aqui...';
        if (statusText) {
            statusText.textContent = 'Pronto para compilar';
            statusText.className = '';
        }
    }

    // ========== ATALHOS DE TECLADO ==========
    document.addEventListener('keydown', function(e) {
        // Ctrl + Enter para executar
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            compileAndRun();
        }
    });

    // Suporte a TAB no textarea de código
    const codeArea = document.getElementById('code-area');
    if (codeArea) {
        codeArea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
    }

    // ========== EXPORTAR FUNÇÕES GLOBALMENTE ==========
    window.compileAndRun = compileAndRun;
    window.loadExample = loadExample;
    window.clearCode = clearCode;
    window.compilerExamples = examples;

    console.log('✅ Compilador C carregado com sucesso!');
    console.log('📝 APIs disponíveis:', COMPILER_APIS.map(a => a.name).join(', '));
    console.log('⌨️  Ctrl+Enter para executar');
    console.log('💡 Use loadExample("hello"), loadExample("loop"), etc.');
})();