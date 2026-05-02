// compiler-c.js - Compilador C Online (Frontend GitHub Pages + Backend Railway)
// Backend: https://siteparaestudar-production.up.railway.app

(function() {
    'use strict';

    // ✅ URL CORRETA DO BACKEND
    const BACKEND_URL = 'https://siteparaestudar-production.up.railway.app';

    const examples = {
        hello: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    printf("SiteParaEstudar © 2026\\n");\n    return 0;\n}`,
        
        menorNumero: `#include <stdio.h>\n\nint main() {\n    int x, i, menor;\n    \n    printf("Digite o 1o numero: ");\n    scanf("%d", &x);\n    menor = x;\n    \n    for(i = 2; i <= 5; i++) {\n        printf("Digite o %do numero: ", i);\n        scanf("%d", &x);\n        if(x < menor) menor = x;\n    }\n    \n    printf("\\nO menor numero foi: %d\\n", menor);\n    return 0;\n}`,
        
        calculadora: `#include <stdio.h>\n\nint main() {\n    int a, b;\n    char op;\n    \n    printf("Digite a operacao (ex: 5+3): ");\n    scanf("%d%c%d", &a, &op, &b);\n    \n    switch(op) {\n        case '+': printf("%d + %d = %d\\n", a, b, a + b); break;\n        case '-': printf("%d - %d = %d\\n", a, b, a - b); break;\n        case '*': printf("%d * %d = %d\\n", a, b, a * b); break;\n        case '/': \n            if(b != 0) printf("%d / %d = %d\\n", a, b, a / b);\n            else printf("Erro: divisao por zero!\\n");\n            break;\n        default: printf("Operador invalido!\\n");\n    }\n    return 0;\n}`,
        
        fatorial: `#include <stdio.h>\n\nint main() {\n    int num, i;\n    long long fat = 1;\n    \n    printf("Digite um numero: ");\n    scanf("%d", &num);\n    \n    for(i = 1; i <= num; i++) fat *= i;\n    \n    printf("%d! = %lld\\n", num, fat);\n    return 0;\n}`,
        
        tabuada: `#include <stdio.h>\n\nint main() {\n    int num, i;\n    printf("Digite um numero: ");\n    scanf("%d", &num);\n    printf("\\nTabuada do %d:\\n", num);\n    for(i = 1; i <= 10; i++)\n        printf("%d x %2d = %3d\\n", num, i, num * i);\n    return 0;\n}`
    };

    async function compileAndRun() {
        const codeArea = document.getElementById('code-area');
        const inputArea = document.getElementById('input-area');
        const outputArea = document.getElementById('output-area');
        const runBtn = document.getElementById('run-btn');
        const spinner = document.getElementById('spinner');
        const statusText = document.getElementById('status-text');

        if (!codeArea || !outputArea) return;

        const code = codeArea.value.trim();
        const input = inputArea ? inputArea.value : '';

        if (!code) {
            outputArea.textContent = '⚠️ Digite um código C!';
            return;
        }

        if (runBtn) runBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        outputArea.textContent = '🔄 Compilando com GCC...\n⏳ Enviando para ' + BACKEND_URL;
        if (statusText) {
            statusText.textContent = '⏳ Compilando...';
            statusText.style.color = '#fadc6d';
        }

        try {
            const response = await fetch(`${BACKEND_URL}/compilar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, input })
            });

            if (response.status === 405) {
                throw new Error('Método não permitido (405). O backend pode estar reiniciando.');
            }
            if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
            }

            const result = await response.json();

            let output = '';

            if (result.error) {
                output += '══════════════════════\n';
                output += '  ❌ ERROS:\n';
                output += '══════════════════════\n\n';
                output += result.error + '\n';
            }

            if (result.output) {
                if (result.error) output += '\n';
                output += '══════════════════════\n';
                output += '  📤 SAÍDA:\n';
                output += '══════════════════════\n\n';
                output += result.output;
            }

            if (!result.output && !result.error) {
                output = '✅ Programa executado com sucesso!\n(Sem saída de texto)';
            }

            outputArea.textContent = output;

            if (statusText) {
                statusText.textContent = result.success ? '✅ GCC: Sucesso!' : '❌ GCC: Erro';
                statusText.style.color = result.success ? '#2ecc71' : '#e74c3c';
            }

        } catch (error) {
            outputArea.textContent = '❌ ERRO DE CONEXÃO\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━\n' +
                '📋 Verifique:\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                '1. Railway está online?\n' +
                '   ✅ ' + BACKEND_URL + '/ping\n\n' +
                '2. Tente novamente em alguns segundos\n\n' +
                'Erro: ' + error.message;

            if (statusText) {
                statusText.textContent = '❌ Erro de conexão';
                statusText.style.color = '#e74c3c';
            }
        } finally {
            if (runBtn) runBtn.disabled = false;
            if (spinner) spinner.style.display = 'none';
        }
    }

    function loadExample(name) {
        const codeArea = document.getElementById('code-area');
        const outputArea = document.getElementById('output-area');
        const statusText = document.getElementById('status-text');

        if (!codeArea) return;

        if (examples[name]) {
            codeArea.value = examples[name];

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

            if (outputArea) outputArea.textContent = '✅ Exemplo carregado! Ctrl+Enter para executar.';
            if (statusText) {
                statusText.textContent = '📝 ' + name;
                statusText.style.color = '#fadc6d';
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
        if (outputArea) outputArea.textContent = '// Digite seu código C e pressione Ctrl+Enter';
        if (statusText) {
            statusText.textContent = 'Pronto';
            statusText.style.color = '#7878a0';
        }
    }

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            compileAndRun();
        }
    });

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

    // Verifica conexão ao carregar
    fetch(`${BACKEND_URL}/ping`)
        .then(r => r.json())
        .then(d => {
            console.log('✅ Backend online:', d);
            const st = document.getElementById('status-text');
            if (st) { st.textContent = '🟢 GCC Online'; st.style.color = '#2ecc71'; }
        })
        .catch(e => {
            console.warn('⚠️ Backend offline');
            const st = document.getElementById('status-text');
            if (st) { st.textContent = '🔴 GCC Offline'; st.style.color = '#e74c3c'; }
        });

    window.compileAndRun = compileAndRun;
    window.loadExample = loadExample;
    window.clearCode = clearCode;
    window.compilerExamples = examples;

    console.log('✅ Compilador C carregado!');
    console.log('🔗 Backend:', BACKEND_URL);
    console.log('⌨️  Ctrl+Enter para executar');
})();