// compiler-c.js - Compilador C Online (Frontend GitHub Pages + Backend Render)
// Backend: https://siteparaestudar.onrender.com

(function() {
    'use strict';

    // ✅ URL DO BACKEND NO RENDER
    const BACKEND_URL = 'https://siteparaestudar.onrender.com';

    // Exemplos de código C
    const examples = {
        hello: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    printf("SiteParaEstudar © 2026\\n");\n    return 0;\n}`,
        
        menorNumero: `#include <stdio.h>\n\nint main() {\n    int x, i, menor;\n    \n    printf("Digite o 1o numero: ");\n    scanf("%d", &x);\n    menor = x;\n    \n    for(i = 2; i <= 5; i++) {\n        printf("Digite o %do numero: ", i);\n        scanf("%d", &x);\n        if(x < menor) menor = x;\n    }\n    \n    printf("\\nO menor numero foi: %d\\n", menor);\n    return 0;\n}`,
        
        calculadora: `#include <stdio.h>\n\nint main() {\n    int a, b;\n    char op;\n    \n    printf("Digite a operacao (ex: 5+3): ");\n    scanf("%d%c%d", &a, &op, &b);\n    \n    switch(op) {\n        case '+': printf("%d + %d = %d\\n", a, b, a + b); break;\n        case '-': printf("%d - %d = %d\\n", a, b, a - b); break;\n        case '*': printf("%d * %d = %d\\n", a, b, a * b); break;\n        case '/': \n            if(b != 0) printf("%d / %d = %d\\n", a, b, a / b);\n            else printf("Erro: divisao por zero!\\n");\n            break;\n        default: printf("Operador invalido!\\n");\n    }\n    return 0;\n}`,
        
        fatorial: `#include <stdio.h>\n\nint main() {\n    int num, i;\n    long long fat = 1;\n    \n    printf("Digite um numero: ");\n    scanf("%d", &num);\n    \n    for(i = 1; i <= num; i++) fat *= i;\n    \n    printf("%d! = %lld\\n", num, fat);\n    return 0;\n}`,
        
        tabuada: `#include <stdio.h>\n\nint main() {\n    int num, i;\n    printf("Digite um numero: ");\n    scanf("%d", &num);\n    printf("\\nTabuada do %d:\\n", num);\n    for(i = 1; i <= 10; i++)\n        printf("%d x %2d = %3d\\n", num, i, num * i);\n    return 0;\n}`
    };

    /**
     * Compila e executa o código C via backend
     */
    async function compileAndRun() {
        const codeArea = document.getElementById('code-area');
        const inputArea = document.getElementById('input-area');
        const outputArea = document.getElementById('output-area');
        const runBtn = document.getElementById('run-btn');
        const spinner = document.getElementById('spinner');
        const statusText = document.getElementById('status-text');

        if (!codeArea || !outputArea) {
            console.error('❌ Elementos da interface não encontrados!');
            return;
        }

        const code = codeArea.value.trim();
        const input = inputArea ? inputArea.value : '';

        if (!code) {
            outputArea.textContent = '⚠️ Digite um código C!';
            return;
        }

        // Ativa estado de loading
        if (runBtn) runBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        outputArea.textContent = '🔄 Compilando com GCC (Render)...\n⏳ Aguarde a resposta do servidor...\n\n💡 Dica: O Render pode demorar até 50 segundos\npara iniciar se estiver em cold start.';
        if (statusText) {
            statusText.textContent = '⏳ Compilando...';
            statusText.style.color = '#fadc6d';
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos de timeout

            const response = await fetch(`${BACKEND_URL}/compilar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, input }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText.substring(0, 100)}`);
            }

            const result = await response.json();

            let output = '';

            // Erros de compilação
            if (result.error) {
                output += '══════════════════════\n';
                output += '  ❌ ERROS:\n';
                output += '══════════════════════\n\n';
                output += result.error + '\n';
            }

            // Saída do programa
            if (result.output) {
                if (result.error) output += '\n';
                output += '══════════════════════\n';
                output += '  📤 SAÍDA:\n';
                output += '══════════════════════\n\n';
                output += result.output;
            }

            // Caso não tenha saída nem erro
            if (!result.output && !result.error) {
                output = '✅ Programa executado com sucesso!\n(Sem saída de texto)';
            }

            outputArea.textContent = output;

            if (statusText) {
                statusText.textContent = result.success ? '✅ GCC: Sucesso!' : '❌ GCC: Erro de compilação';
                statusText.style.color = result.success ? '#2ecc71' : '#e74c3c';
            }

        } catch (error) {
            let errorMessage = '❌ ERRO DE CONEXÃO\n\n';
            
            if (error.name === 'AbortError') {
                errorMessage += '⏱️ Timeout (60s): O servidor demorou muito para responder.\n\n';
                errorMessage += '📋 Possíveis causas:\n';
                errorMessage += '• Render está em cold start (pode levar até 50s)\n';
                errorMessage += '• Tente novamente em alguns segundos\n';
            } else {
                errorMessage += '━━━━━━━━━━━━━━━━━━━━━━━\n';
                errorMessage += '📋 Verifique:\n';
                errorMessage += '━━━━━━━━━━━━━━━━━━━━━━━\n\n';
                errorMessage += `1. Backend Render está online?\n`;
                errorMessage += `   🔗 ${BACKEND_URL}/ping\n\n`;
                errorMessage += '2. O Render gratuito desliga após 15min\n';
                errorMessage += '   de inatividade (cold start)\n\n';
                errorMessage += '3. Tente novamente em 30-50 segundos\n\n';
                errorMessage += `Erro técnico: ${error.message}`;
            }

            outputArea.textContent = errorMessage;

            if (statusText) {
                statusText.textContent = '❌ Erro de conexão';
                statusText.style.color = '#e74c3c';
            }
        } finally {
            if (runBtn) runBtn.disabled = false;
            if (spinner) spinner.style.display = 'none';
        }
    }

    /**
     * Carrega um exemplo de código C
     */
    function loadExample(name) {
        const codeArea = document.getElementById('code-area');
        const outputArea = document.getElementById('output-area');
        const statusText = document.getElementById('status-text');

        if (!codeArea) return;

        if (examples[name]) {
            codeArea.value = examples[name];

            // Define inputs para cada exemplo
            const inputArea = document.getElementById('input-area');
            if (inputArea) {
                const inputs = {
                    menorNumero: '45\n23\n67\n12\n89\n34\n56\n78\n90\n15',
                    fatorial: '5',
                    calculadora: '5+3',
                    tabuada: '7'
                };
                inputArea.value = inputs[name] || '';
            }

            if (outputArea) outputArea.textContent = '✅ Exemplo carregado! Ctrl+Enter para executar.\n\n📝 Código pronto. Clique em "Compilar e Executar" ou\npressione Ctrl+Enter para rodar no servidor Render.';
            if (statusText) {
                statusText.textContent = '📝 ' + name;
                statusText.style.color = '#fadc6d';
            }
        }
    }

    /**
     * Limpa o editor e áreas
     */
    function clearCode() {
        const codeArea = document.getElementById('code-area');
        const inputArea = document.getElementById('input-area');
        const outputArea = document.getElementById('output-area');
        const statusText = document.getElementById('status-text');

        if (codeArea) codeArea.value = '';
        if (inputArea) inputArea.value = '';
        if (outputArea) outputArea.textContent = '// Digite seu código C e pressione Ctrl+Enter';
        if (statusText) {
            statusText.textContent = 'Pronto';
            statusText.style.color = '#7878a0';
        }
    }

    // ========== EVENT LISTENERS ==========
    
    // Ctrl+Enter para compilar
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            compileAndRun();
        }
    });

    // Tab para indentar
    const codeArea = document.getElementById('code-area');
    if (codeArea) {
        codeArea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const s = this.selectionStart;
                this.value = this.value.substring(0, s) + '    ' + this.value.substring(this.selectionEnd);
                this.selectionStart = this.selectionEnd = s + 4;
            }
        });
    }

    // Verifica conexão com o backend ao carregar
    async function checkBackendConnection() {
        const statusText = document.getElementById('status-text');
        
        try {
            const response = await fetch(`${BACKEND_URL}/ping`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend Render online:', data);
                if (statusText) {
                    statusText.textContent = '🟢 GCC Online (Render)';
                    statusText.style.color = '#2ecc71';
                }
            } else {
                throw new Error('Status: ' + response.status);
            }
        } catch (error) {
            console.warn('⚠️ Backend Render offline ou em cold start');
            if (statusText) {
                statusText.textContent = '🟡 GCC Iniciando... (Render)';
                statusText.style.color = '#fadc6d';
            }
        }
    }

    // Verificar conexão periodicamente
    checkBackendConnection();
    setInterval(checkBackendConnection, 30000); // A cada 30 segundos

    // ========== EXPORTAÇÃO PARA ESCOPO GLOBAL ==========
    window.compileAndRun = compileAndRun;
    window.loadExample = loadExample;
    window.clearCode = clearCode;
    window.compilerExamples = examples;

    console.log('✅ Compilador C carregado!');
    console.log('🔗 Backend:', BACKEND_URL);
    console.log('⌨️  Ctrl+Enter para executar');
    console.log('💡 Cold start pode levar até 50 segundos');
})();
function toggleExpand(e) {
    if (e) {
        e.stopPropagation(); // impede fechar imediatamente
    }

    const wrapper = document.getElementById('code-editor-wrapper');
    const overlay = document.getElementById('code-overlay');
    const btn = document.querySelector('.btn-expand');

    const isExpanded = wrapper.classList.contains('expanded');

    if (!isExpanded) {
        wrapper.classList.add('expanded');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        if (btn) btn.innerHTML = '⛶ Recolher';
    } else {
        wrapper.classList.remove('expanded');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        if (btn) btn.innerHTML = '⛶ Expandir';
    }
}
document.addEventListener('click', function(e) {
    const wrapper = document.getElementById('code-editor-wrapper');
    const overlay = document.getElementById('code-overlay');

    if (!wrapper.classList.contains('expanded')) return;

    // Só fecha se clicar no overlay
    if (e.target === overlay) {
        toggleExpand();
    }
});