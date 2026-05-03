// ========================================
// questoes.js - Sistema Unificado de Questões v2.0
// Compatível com todos os arquivos HTML
// ========================================

(function() {
    'use strict';
    
    // Estado global das questões
    const questionState = {};
    
    // ==================== INICIALIZAÇÃO ====================
    function initAll() {
        collectQuestions();
        updateScoreBar();
        initHamburgerMenu();
        console.log('✅ Sistema de questões inicializado!');
    }
    
    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
    
    // Coleta automaticamente todas as questões da página
    function collectQuestions() {
        const cards = document.querySelectorAll('.q-card');
        const totalSpan = document.getElementById('total-count');
        
        cards.forEach(card => {
            const id = card.id;
            if (!id) return;
            
            // Verifica se já existe estado
            if (!questionState[id]) {
                questionState[id] = {
                    type: 'unknown',
                    answered: false,
                    correct: false,
                    selected: null
                };
            }
            
            // Detecta tipo de questão
            if (card.querySelector('.text-answer')) {
                questionState[id].type = 'open';
            } else if (card.querySelector('.options') && card.querySelector('.options').children.length > 0) {
                const firstOption = card.querySelector('.option');
                if (firstOption && firstOption.getAttribute('onclick') && 
                    firstOption.getAttribute('onclick').includes('toggleMC')) {
                    questionState[id].type = 'multiple';
                    questionState[id].selected = [];
                } else {
                    questionState[id].type = 'single';
                }
            }
        });
        
        if (totalSpan) {
            totalSpan.textContent = cards.length;
        }
        
        console.log(`📋 ${cards.length} questões encontradas`);
    }
    
    // ==================== HAMBURGER MENU ====================
    function initHamburgerMenu() {
        // Cria o menu hamburger se ele não existir
        if (!document.querySelector('.hamburger-btn')) {
            createSidebar();
        }
        
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        if (!hamburgerBtn || !sidebar || !sidebarOverlay) return;
        
        // Remove eventos antigos e adiciona novos
        hamburgerBtn.replaceWith(hamburgerBtn.cloneNode(true));
        const newBtn = document.querySelector('.hamburger-btn');
        
        newBtn.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
        
        // Fecha sidebar com tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeSidebar();
        });
    }
    
    function createSidebar() {
        // Cria o botão hamburger
        const btn = document.createElement('div');
        btn.className = 'hamburger-btn';
        btn.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        document.body.insertBefore(btn, document.body.firstChild);
        
        // Cria o overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.insertBefore(overlay, document.body.firstChild);
        
        // Cria a sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-logo">SPE</div>
                <div class="sidebar-title">SiteParaEstudar</div>
            </div>
            <div class="sidebar-nav">
                <a href="index.html" class="sidebar-link">
                    <span class="icon">🏠</span> Início
                </a>
                <a href="HomeMatematica.html" class="sidebar-link">
                    <span class="icon">📐</span> Matemática
                </a>
                <a href="ListaConjuntos.html" class="sidebar-link">
                    <span class="icon">∩</span> Conjuntos
                </a>
                <a href="exercicios-relacoes.html" class="sidebar-link">
                    <span class="icon">↔</span> Relações
                </a>
                <a href="exercicios-funcoes.html" class="sidebar-link">
                    <span class="icon">f(x)</span> Funções
                </a>
                <a href="exercicios-combinatoria.html" class="sidebar-link">
                    <span class="icon">🎲</span> Combinatória
                </a>
                <a href="casos.html" class="sidebar-link">
                    <span class="icon">📋</span> Casos ADM
                </a>
                <a href="prova1Avaliativa.html" class="sidebar-link">
                    <span class="icon">📝</span> Prova 1
                </a>
            </div>
            <div class="sidebar-footer">© 2026 SiteParaEstudar</div>
        `;
        document.body.insertBefore(sidebar, document.body.firstChild);
        
        // Marca o link ativo
        markActiveLink();
    }
    
    function markActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.sidebar-link');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPage === href) {
                link.classList.add('active');
            } else if (href && currentPage.includes(href.replace('./', ''))) {
                link.classList.add('active');
            }
        });
    }
    
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const btn = document.querySelector('.hamburger-btn');
        
        if (!sidebar || !overlay || !btn) return;
        
        const isOpen = sidebar.classList.contains('open');
        
        if (isOpen) {
            closeSidebar();
        } else {
            sidebar.classList.add('open');
            overlay.classList.add('show');
            btn.classList.add('open');
        }
    }
    
    function closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const btn = document.querySelector('.hamburger-btn');
        
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        if (btn) btn.classList.remove('open');
    }
    
    // ==================== TAB NAVIGATION ====================
    window.showTab = function(tabId) {
        // Esconde todas as seções
        const sections = document.querySelectorAll('.section');
        sections.forEach(s => s.classList.remove('active'));
        
        // Mostra a seção selecionada
        const target = document.getElementById(tabId);
        if (target) {
            target.classList.add('active');
        }
        
        // Atualiza as tabs
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(t => t.classList.remove('active'));
        
        // Encontra e ativa a tab correta
        tabs.forEach(t => {
            const onclick = t.getAttribute('onclick');
            if (onclick && onclick.includes(tabId)) {
                t.classList.add('active');
            }
        });
        
        // Atualiza score após mudar de tab
        collectQuestions();
        updateScoreBar();
        
        // Scroll suave para o topo do conteúdo
        const content = document.querySelector('.content');
        if (content) {
            content.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    // ==================== SELEÇÃO DE OPÇÕES ====================
    window.selectOpt = function(questionId, optionValue) {
        const card = document.getElementById(questionId);
        if (!card) return;
        if (questionState[questionId] && questionState[questionId].answered) return;
        
        const options = card.querySelectorAll('.option');
        
        // Remove seleção anterior
        options.forEach(opt => opt.classList.remove('selected'));
        
        // Encontra e seleciona a opção clicada
        options.forEach(opt => {
            const onclick = opt.getAttribute('onclick');
            if (onclick) {
                // Extrai o valor da opção do onclick
                const match = onclick.match(/selectOpt\('([^']+)','([^']+)'\)/);
                if (match && match[2] === optionValue) {
                    opt.classList.add('selected');
                }
            }
        });
        
        // Atualiza estado
        if (!questionState[questionId]) {
            questionState[questionId] = { type: 'single', answered: false, correct: false, selected: null };
        }
        questionState[questionId].selected = optionValue;
    };
    
    window.toggleMC = function(questionId, optionValue) {
        const card = document.getElementById(questionId);
        if (!card) return;
        if (questionState[questionId] && questionState[questionId].answered) return;
        
        // Inicializa array se necessário
        if (!questionState[questionId]) {
            questionState[questionId] = { type: 'multiple', answered: false, correct: false, selected: [] };
        }
        if (!Array.isArray(questionState[questionId].selected)) {
            questionState[questionId].selected = [];
        }
        
        // Toggle da seleção
        const index = questionState[questionId].selected.indexOf(optionValue);
        if (index > -1) {
            questionState[questionId].selected.splice(index, 1);
        } else {
            questionState[questionId].selected.push(optionValue);
        }
        
        // Atualiza visual
        const options = card.querySelectorAll('.option');
        options.forEach(opt => {
            const onclick = opt.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/toggleMC\('([^']+)','([^']+)'\)/);
                if (match && questionState[questionId].selected.includes(match[2])) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
            }
        });
    };
    
    // ==================== VERIFICAÇÃO DE RESPOSTAS ====================
    window.checkSingle = function(questionId, correctAnswer) {
        const card = document.getElementById(questionId);
        if (!card) return;
        if (questionState[questionId] && questionState[questionId].answered) return;
        
        const feedback = document.getElementById('fb-' + questionId);
        const selected = questionState[questionId]?.selected;
        
        if (!selected) {
            showFeedback(feedback, 'info', '⚠️ Selecione uma opção antes de verificar!');
            return;
        }
        
        const isCorrect = selected === correctAnswer;
        markQuestion(questionId, isCorrect, selected, correctAnswer);
        
        if (isCorrect) {
            showFeedback(feedback, 'correct', '✅ <strong>Correto!</strong> Muito bem!');
        } else {
            showFeedback(feedback, 'wrong', `❌ <strong>Incorreto.</strong> A resposta correta é <strong>${correctAnswer}</strong>.`);
        }
        
        disableQuestion(card);
        updateScoreBar();
    };
    
    window.checkMC = function(questionId, correctAnswers) {
        const card = document.getElementById(questionId);
        if (!card) return;
        if (questionState[questionId] && questionState[questionId].answered) return;
        
        const feedback = document.getElementById('fb-' + questionId);
        const selected = questionState[questionId]?.selected || [];
        
        if (selected.length === 0) {
            showFeedback(feedback, 'info', '⚠️ Selecione pelo menos uma opção!');
            return;
        }
        
        // Verifica se as seleções correspondem exatamente às respostas corretas
        const sortedSelected = [...selected].sort();
        const sortedCorrect = [...correctAnswers].sort();
        
        const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
        markQuestion(questionId, isCorrect, selected.join(', '), correctAnswers);
        
        if (isCorrect) {
            showFeedback(feedback, 'correct', '✅ <strong>Todas corretas!</strong>');
        } else {
            showFeedback(feedback, 'wrong', `❌ <strong>Incorreto.</strong> As respostas corretas são: <strong>${correctAnswers.join(', ')}</strong>.`);
        }
        
        disableQuestion(card);
        updateScoreBar();
    };
    
    window.checkOpen = function(questionId, validAnswers) {
        const card = document.getElementById(questionId);
        if (!card) return;
        if (questionState[questionId] && questionState[questionId].answered) return;
        
        const feedback = document.getElementById('fb-' + questionId);
        const textarea = document.getElementById('ans-' + questionId);
        
        if (!textarea) return;
        
        const answer = textarea.value.trim().toLowerCase();
        
        if (!answer) {
            showFeedback(feedback, 'info', '⚠️ Escreva sua resposta antes de verificar!');
            return;
        }
        
        const isCorrect = validAnswers.some(valid => answer === valid.toLowerCase());
        markQuestion(questionId, isCorrect);
        
        if (isCorrect) {
            showFeedback(feedback, 'correct', '✅ <strong>Resposta correta!</strong>');
        } else {
            showFeedback(feedback, 'wrong', '❌ <strong>Resposta incorreta.</strong> Reveja o gabarito.');
        }
        
        disableQuestion(card);
        updateScoreBar();
    };
    
    // ==================== FEEDBACK E MARCAÇÃO ====================
    function showFeedback(feedbackElement, type, message) {
        if (!feedbackElement) return;
        
        feedbackElement.className = 'feedback show ' + type;
        feedbackElement.innerHTML = message;
        
        // Scroll suave para o feedback
        feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    function markQuestion(questionId, isCorrect, userAnswer, correctAnswer) {
        const card = document.getElementById(questionId);
        if (!card) return;
        
        // Atualiza estado
        questionState[questionId] = {
            ...questionState[questionId],
            answered: true,
            correct: isCorrect
        };
        
        // Marca visualmente
        card.classList.add(isCorrect ? 'answered-correct' : 'answered-wrong');
        
        // Destaca opções corretas e incorretas
        if (userAnswer && correctAnswer) {
            const options = card.querySelectorAll('.option');
            options.forEach(opt => {
                const onclick = opt.getAttribute('onclick');
                if (!onclick) return;
                
                // Extrai o valor da opção
                let match = onclick.match(/selectOpt\('([^']+)','([^']+)'\)/);
                if (!match) match = onclick.match(/toggleMC\('([^']+)','([^']+)'\)/);
                if (!match) return;
                
                const val = match[2];
                const correctArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
                const userArray = Array.isArray(userAnswer) ? userAnswer : userAnswer.split(', ');
                
                if (correctArray.includes(val)) {
                    opt.classList.add('correct-answer');
                } else if (userArray.includes(val)) {
                    opt.classList.add('wrong-answer');
                }
            });
        }
    }
    
    function disableQuestion(card) {
        const options = card.querySelectorAll('.option');
        options.forEach(opt => opt.classList.add('disabled'));
        
        const textarea = card.querySelector('.text-answer');
        if (textarea) textarea.disabled = true;
    }
    
    // ==================== BOTÕES DE AÇÃO ====================
    window.revealAnswer = function(questionId, answerText) {
        const feedback = document.getElementById('fb-' + questionId);
        if (feedback) {
            showFeedback(feedback, 'info', '📖 <strong>Gabarito:</strong><br>' + answerText);
        }
    };
    
    window.toggleHint = function(questionId) {
        const hint = document.getElementById('hint-' + questionId);
        if (!hint) return;
        
        hint.classList.toggle('show');
        
        // Scroll suave para a dica
        if (hint.classList.contains('show')) {
            hint.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    
    window.resetQ = function(questionId) {
        const card = document.getElementById(questionId);
        if (!card) return;
        
        // Remove classes de resposta
        card.classList.remove('answered-correct', 'answered-wrong');
        
        // Remove classes das opções
        const options = card.querySelectorAll('.option');
        options.forEach(opt => {
            opt.classList.remove('selected', 'correct-answer', 'wrong-answer', 'disabled');
        });
        
        // Esconde feedback e dicas
        const feedback = document.getElementById('fb-' + questionId);
        if (feedback) {
            feedback.className = 'feedback';
            feedback.innerHTML = '';
        }
        
        const hint = document.getElementById('hint-' + questionId);
        if (hint) hint.classList.remove('show');
        
        // Limpa textarea
        const textarea = document.getElementById('ans-' + questionId);
        if (textarea) {
            textarea.value = '';
            textarea.disabled = false;
        }
        
        // Reseta estado
        if (questionState[questionId]) {
            questionState[questionId] = {
                answered: false,
                correct: false,
                selected: questionState[questionId].type === 'multiple' ? [] : null,
                type: questionState[questionId].type
            };
        }
        
        updateScoreBar();
    };
    
    // ==================== PROGRESSO E PONTUAÇÃO ====================
    function updateScoreBar() {
        const answeredSpan = document.getElementById('answered-count');
        const correctSpan = document.getElementById('correct-count');
        const wrongSpan = document.getElementById('wrong-count');
        const progressFill = document.getElementById('progress-fill');
        
        let total = 0;
        let answered = 0;
        let correct = 0;
        let wrong = 0;
        
        // Conta questões
        for (const id in questionState) {
            total++;
            if (questionState[id].answered) {
                answered++;
                if (questionState[id].correct) {
                    correct++;
                } else {
                    wrong++;
                }
            }
        }
        
        // Atualiza displays
        if (answeredSpan) answeredSpan.textContent = answered;
        if (correctSpan) correctSpan.textContent = correct;
        if (wrongSpan) wrongSpan.textContent = wrong;
        
        // Atualiza barra de progresso
        if (progressFill && total > 0) {
            const percentage = (answered / total) * 100;
            progressFill.style.width = percentage + '%';
        }
        
        // Atualiza score final se existir
        updateFinalScore(total, answered, correct);
    }
    
    function updateFinalScore(total, answered, correct) {
        const finalSection = document.getElementById('final-score-section');
        const finalPct = document.getElementById('final-pct');
        const finalAnswered = document.getElementById('final-answered');
        
        if (!finalSection || !finalPct || !finalAnswered) return;
        
        if (answered > 0) {
            finalSection.classList.add('show');
            const percentage = Math.round((correct / total) * 100);
            finalPct.textContent = percentage + '%';
            finalAnswered.textContent = answered;
        }
    }
    
    window.checkAll = function() {
        let total = 0;
        let answered = 0;
        
        for (const id in questionState) {
            total++;
            if (questionState[id].answered) answered++;
        }
        
        const remaining = total - answered;
        
        if (remaining === 0) {
            const confirmed = confirm('✅ Todas as questões foram respondidas!\n\nDeseja ver o resultado final?');
            if (confirmed) {
                const finalSection = document.getElementById('final-score-section');
                if (finalSection) {
                    finalSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } else {
            alert(`📊 Progresso: ${answered} de ${total} questões respondidas.\n\n` +
                  `✅ Acertos: ${countCorrect()}\n` +
                  `❌ Erros: ${countWrong()}\n` +
                  `📝 Faltam: ${remaining} questões`);
        }
    };
    
    function countCorrect() {
        let count = 0;
        for (const id in questionState) {
            if (questionState[id].answered && questionState[id].correct) count++;
        }
        return count;
    }
    
    function countWrong() {
        let count = 0;
        for (const id in questionState) {
            if (questionState[id].answered && !questionState[id].correct) count++;
        }
        return count;
    }
    
    // ==================== GABARITOS ESPECÍFICOS ====================
    window.revealQ1 = function() {
        window.revealAnswer('q1', 
            '<strong>Resolução:</strong><br>' +
            'a) A ∪ C = {1,3,4,5,6,7}, B̄ = {1,2,4,5,7,8}<br>' +
            '(A ∪ C) ∩ B̄ = <strong>{1,4,5,7}</strong><br>' +
            'b) C − B = {4,7} − {3,6,9} = {4,7}<br>' +
            '|P(C-B)| = 2² = <strong>4</strong><br>' +
            'c) |A × C| = 5 × 3 = <strong>15</strong><br><br>' +
            '<strong>Gabarito: B</strong>'
        );
    };
    
    window.revealQ2 = function() {
        window.revealAnswer('q2',
            '<strong>Resolução:</strong><br>' +
            '|P(A)| = 64 → 2^|A| = 64 → |A| = <strong>6</strong><br>' +
            '|P(A∪B)| = 256 → 2^|A∪B| = 256 → |A∪B| = <strong>8</strong><br>' +
            '|A∪B| = |A| + |B| - |A∩B|<br>' +
            '8 = 6 + 2|A∩B| - |A∩B|<br>' +
            '8 = 6 + |A∩B| → |A∩B| = <strong>2</strong><br>' +
            '|B| = 2 × 2 = <strong>4</strong><br>' +
            'Fora de A∪B: 10 - 8 = <strong>2</strong><br><br>' +
            '<strong>Gabarito: A</strong>'
        );
    };
    
    window.revealQ3 = function() {
        window.revealAnswer('q3',
            '<strong>Análise:</strong><br>' +
            'R₁: Não reflexiva, simétrica, não transitiva<br>' +
            'R₂: Reflexiva, antissimétrica, transitiva ✓<br>' +
            'R₃: Reflexiva, simétrica, não transitiva<br>' +
            'R₄: Antissimétrica, transitiva (vacuosamente) ✓<br><br>' +
            '<strong>Gabarito: B</strong>'
        );
    };
    
    window.revealQ4 = function() {
        window.revealAnswer('q4',
            '<strong>Análise para relação de equivalência:</strong><br>' +
            'Reflexiva? (1,1),(2,2),(3,3) ∈ R, <strong>mas (4,4) ∉ R</strong> → Falta!<br>' +
            'Simétrica? ✓ (todos os pares têm seu simétrico)<br>' +
            'Transitiva? (1,2) e (2,3) ∈ R → precisa (1,3) e (3,1) ∈ R<br>' +
            '<strong>Faltam: (4,4), (1,3) e (3,1)</strong><br><br>' +
            '<strong>Gabarito: C</strong>'
        );
    };
    
    window.revealQ5 = function() {
        window.revealAnswer('q5',
            '<strong>Classificação:</strong><br>' +
            'a) B={0,1,2,3}, f bijetora ✓<br>' +
            'b) B={1,2,3}, f sobrejetora (não injetora: 3→1 e 5→1)<br>' +
            'c) B={0,1,2,3,4}, f injetora (não sobrejetora: 4 sem pré-imagem)<br>' +
            'd) B={0,1,2,3,4}, f não injetora e não sobrejetora<br><br>' +
            '<strong>Gabarito: A</strong>'
        );
    };
    
    window.revealQ6 = function() {
        window.revealAnswer('q6',
            '<strong>COCHILO:</strong><br>' +
            '7 letras, C (2×) e O (2×)<br>' +
            '7! / (2! × 2!) = 5040 / 4 = <strong>1260</strong><br><br>' +
            '<strong>Gabarito: C</strong>'
        );
    };
    
    window.revealQ7 = function() {
        window.revealAnswer('q7',
            '<strong>Senha:</strong> 1 letra + 4 dígitos distintos<br>' +
            'Letra: 26 possibilidades<br>' +
            'Dígitos: 10 × 9 × 8 × 7 = 5040 (arranjo)<br>' +
            'Total: 26 × 5040 = <strong>131.040</strong><br><br>' +
            '<strong>Gabarito: B</strong>'
        );
    };
    
    console.log('✅ Sistema de questões carregado com sucesso!');
})();