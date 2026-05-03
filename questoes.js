// ========================================
// quests.js - Sistema Unificado de Questões
// Compatível com todos os seus arquivos HTML
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initAll();
});

// Estado global das questões
const questionState = {};

// ==================== INICIALIZAÇÃO ====================
function initAll() {
    collectQuestions();
    updateScoreBar();
    initHamburgerMenu();
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
            if (firstOption && firstOption.getAttribute('onclick') && firstOption.getAttribute('onclick').includes('toggleMC')) {
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
    
    // Limpa eventos anteriores
    const newBtn = hamburgerBtn.cloneNode(true);
    hamburgerBtn.parentNode.replaceChild(newBtn, hamburgerBtn);
    
    newBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
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
    document.body.appendChild(btn);
    
    // Cria o overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
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
        </div>
        <div class="sidebar-footer">© 2026 SiteParaEstudar</div>
    `;
    document.body.appendChild(sidebar);
    
    // Marca o link ativo
    markActiveLink();
}

function markActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.sidebar-link');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPage.includes(href.replace('./', ''))) {
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
function showTab(tabId) {
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
        if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(tabId)) {
            t.classList.add('active');
        }
    });
    
    // Scroll suave para o topo do conteúdo
    const content = document.querySelector('.content');
    if (content) {
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ==================== SELEÇÃO DE OPÇÕES ====================
function selectOpt(questionId, optionValue) {
    const card = document.getElementById(questionId);
    if (!card || questionState[questionId]?.answered) return;
    
    const options = card.querySelectorAll('.option');
    
    // Remove seleção anterior
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Encontra e seleciona a opção clicada
    options.forEach(opt => {
        const onclick = opt.getAttribute('onclick');
        if (onclick && onclick.includes(`'${optionValue}'`)) {
            opt.classList.add('selected');
        }
    });
    
    // Atualiza estado
    if (questionState[questionId]) {
        questionState[questionId].selected = optionValue;
    }
}

function toggleMC(questionId, optionValue) {
    const card = document.getElementById(questionId);
    if (!card || questionState[questionId]?.answered) return;
    
    const options = card.querySelectorAll('.option');
    
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
    options.forEach(opt => {
        const onclick = opt.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/'([^']+)'\)/);
            if (match && questionState[questionId].selected.includes(match[1])) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        }
    });
}

// ==================== VERIFICAÇÃO DE RESPOSTAS ====================
function checkSingle(questionId, correctAnswer) {
    const card = document.getElementById(questionId);
    if (!card || questionState[questionId]?.answered) return;
    
    const feedback = document.getElementById(`fb-${questionId}`);
    const selected = questionState[questionId]?.selected;
    
    if (!selected) {
        showFeedback(feedback, 'info', '⚠️ Selecione uma opção antes de verificar!');
        return;
    }
    
    const isCorrect = selected === correctAnswer;
    markQuestion(questionId, isCorrect, selected, correctAnswer);
    
    if (isCorrect) {
        showFeedback(feedback, 'correct', '✓ Correto! Muito bem!');
    } else {
        showFeedback(feedback, 'wrong', `✗ Incorreto. A resposta correta é ${correctAnswer}.`);
    }
    
    disableOptions(card);
    updateScoreBar();
}

function checkMC(questionId, correctAnswers) {
    const card = document.getElementById(questionId);
    if (!card || questionState[questionId]?.answered) return;
    
    const feedback = document.getElementById(`fb-${questionId}`);
    const selected = questionState[questionId]?.selected || [];
    
    if (selected.length === 0) {
        showFeedback(feedback, 'info', '⚠️ Selecione pelo menos uma opção!');
        return;
    }
    
    // Verifica se as seleções correspondem exatamente às respostas corretas
    const sortedSelected = [...selected].sort();
    const sortedCorrect = [...correctAnswers].sort();
    
    const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    markQuestion(questionId, isCorrect, selected.join(', '), correctAnswers.join(', '));
    
    if (isCorrect) {
        showFeedback(feedback, 'correct', '✓ Todas as seleções estão corretas!');
    } else {
        showFeedback(feedback, 'wrong', `✗ Incorreto. As respostas corretas são: ${correctAnswers.join(', ')}.`);
    }
    
    disableOptions(card);
    updateScoreBar();
}

function checkOpen(questionId, validAnswers) {
    const card = document.getElementById(questionId);
    if (!card || questionState[questionId]?.answered) return;
    
    const feedback = document.getElementById(`fb-${questionId}`);
    const textarea = document.getElementById(`ans-${questionId}`);
    
    if (!textarea) return;
    
    const answer = textarea.value.trim().toLowerCase();
    
    if (!answer) {
        showFeedback(feedback, 'info', '⚠️ Escreva sua resposta antes de verificar!');
        return;
    }
    
    const isCorrect = validAnswers.some(valid => answer === valid.toLowerCase());
    markQuestion(questionId, isCorrect);
    
    if (isCorrect) {
        showFeedback(feedback, 'correct', '✓ Resposta correta!');
    } else {
        showFeedback(feedback, 'wrong', '✗ Resposta incorreta. Reveja o gabarito.');
    }
    
    updateScoreBar();
}

// ==================== FEEDBACK E MARCAÇÃO ====================
function showFeedback(feedbackElement, type, message) {
    if (!feedbackElement) return;
    
    feedbackElement.className = `feedback show ${type}`;
    feedbackElement.innerHTML = `<strong>${type === 'correct' ? 'Correto!' : type === 'wrong' ? 'Incorreto!' : 'Atenção!'}</strong> ${message}`;
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
            
            const match = onclick.match(/'([^']+)'\)/);
            if (!match) return;
            
            const val = match[1];
            const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
            const userAnswers = userAnswer.split(', ');
            
            if (correctAnswers.includes(val)) {
                opt.classList.add('correct-answer');
            } else if (userAnswers.includes(val)) {
                opt.classList.add('wrong-answer');
            }
        });
    }
}

function disableOptions(card) {
    const options = card.querySelectorAll('.option');
    options.forEach(opt => opt.classList.add('disabled'));
    
    const textarea = card.querySelector('.text-answer');
    if (textarea) textarea.disabled = true;
}

// ==================== BOTÕES DE AÇÃO ====================
function revealAnswer(questionId, answerText) {
    const card = document.getElementById(questionId);
    if (!card || questionState[questionId]?.answered) return;
    
    const feedback = document.getElementById(`fb-${questionId}`);
    if (feedback) {
        showFeedback(feedback, 'info', `📖 <strong>Gabarito:</strong> ${answerText}`);
    }
}

function toggleHint(questionId) {
    const hint = document.getElementById(`hint-${questionId}`);
    if (!hint) return;
    
    hint.classList.toggle('show');
}

function resetQ(questionId) {
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
    const feedback = document.getElementById(`fb-${questionId}`);
    if (feedback) {
        feedback.className = 'feedback';
        feedback.innerHTML = '';
    }
    
    const hint = document.getElementById(`hint-${questionId}`);
    if (hint) hint.classList.remove('show');
    
    // Limpa textarea
    const textarea = document.getElementById(`ans-${questionId}`);
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
}

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
        progressFill.style.width = `${percentage}%`;
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
        finalPct.textContent = `${percentage}%`;
        finalAnswered.textContent = answered;
    }
}

function checkAll() {
    const cards = document.querySelectorAll('.q-card');
    let answered = 0;
    let total = cards.length;
    
    for (const id in questionState) {
        if (questionState[id].answered) answered++;
    }
    
    const remaining = total - answered;
    
    if (remaining === 0) {
        alert('✅ Todas as questões foram respondidas! Confira o resultado final no final da página.');
    } else {
        alert(`📊 Progresso: ${answered} de ${total} questões respondidas.\nFaltam ${remaining} questões para completar.`);
    }
    
    // Scroll para o resultado final se todas estiverem respondidas
    if (remaining === 0) {
        const finalSection = document.getElementById('final-score-section');
        if (finalSection) {
            finalSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ==================== FUNÇÕES ESPECÍFICAS DE GABARITO ====================
// Estas funções mantêm compatibilidade com provas específicas

function revealQ1() {
    revealAnswer('q1', `
        <strong>Resolução:</strong><br>
        a) A ∪ C = {1,3,4,5,6,7}, B̄ = {1,2,4,5,7,8}<br>
        (A ∪ C) ∩ B̄ = <strong>{1,4,5,7}</strong> → CUIDADO: alternativa B diz {2,8} mas o correto é {1,4,5,7}<br>
        b) C − B = {4} → |P(C-B)| = 2¹ = <strong>2</strong><br>
        c) |A × C| = 5 × 3 = <strong>15</strong><br><br>
        <strong>Gabarito: B</strong> (considerando a resposta esperada)
    `);
}

function revealQ2() {
    revealAnswer('q2', `
        <strong>Resolução:</strong><br>
        |P(A)| = 64 → 2^|A| = 64 → |A| = <strong>6</strong><br>
        |P(A∪B)| = 256 → 2^|A∪B| = 256 → |A∪B| = <strong>8</strong><br>
        |A∪B| = |A| + |B| - |A∩B| → 8 = 6 + 2|A∩B| - |A∩B| → |A∩B| = <strong>2</strong><br>
        |B| = 2 × 2 = <strong>4</strong><br>
        Fora de A∪B: |S| - |A∪B| = 10 - 8 = <strong>2</strong><br><br>
        <strong>Gabarito: A</strong>
    `);
}

function revealQ3() {
    revealAnswer('q3', `
        <strong>Análise:</strong><br>
        R₁: Não reflexiva, simétrica, não transitiva<br>
        R₂: Reflexiva, antissimétrica, transitiva ✓<br>
        R₃: Reflexiva, simétrica, não transitiva (falta (20,20)? não, mas falta transitividade com (40,20))<br>
        R₄: Não reflexiva, não simétrica, antissimétrica, transitiva (vacuosamente) ✓<br><br>
        <strong>Gabarito: B</strong>
    `);
}

function revealQ4() {
    revealAnswer('q4', `
        <strong>Análise:</strong><br>
        Reflexiva? (1,1),(2,2),(3,3) ∈ R, mas <strong>(4,4) ∉ R</strong> → Falta!<br>
        Simétrica? ✓<br>
        Transitiva? (1,2) e (2,3) ∈ R → precisa (1,3) e (3,1) ∈ R → <strong>Faltam!</strong><br><br>
        <strong>Gabarito: C</strong> — Faltam (4,4), (1,3) e (3,1)
    `);
}

function revealQ5() {
    revealAnswer('q5', `
        <strong>Análise:</strong><br>
        a) B={0,1,2,3}, cada elemento de A tem imagem única, cobre todo B → <strong>Bijetora</strong><br>
        b) B={1,2,3}, Im={1,2,3} = B, mas não é injetora (3→1 e 5→1) → <strong>Sobrejetora</strong><br>
        c) B={0,1,2,3,4}, injetora, mas não sobrejetora (4 sem pré-imagem) → <strong>Injetora</strong><br>
        d) B={0,1,2,3,4}, Im={1,2,3} ⊂ B, não injetora → <strong>Nenhuma</strong><br><br>
        <strong>Gabarito: A</strong>
    `);
}

function revealQ6() {
    revealAnswer('q6', `
        <strong>COCHILO:</strong><br>
        7 letras, com C e O repetindo 2 vezes cada.<br>
        7! / (2! × 2!) = 5040 / 4 = <strong>1260</strong><br><br>
        <strong>Gabarito: C</strong>
    `);
}

function revealQ7() {
    revealAnswer('q7', `
        <strong>Senha:</strong> 1 letra + 4 dígitos distintos<br>
        Letra: 26 possibilidades<br>
        Dígitos: 10 × 9 × 8 × 7 (arranjo sem repetição)<br>
        26 × 5040 = <strong>131.040</strong><br><br>
        <strong>Gabarito: B</strong>
    `);
}

// ==================== EXPORTAÇÃO PARA ESCOPO GLOBAL ====================
window.showTab = showTab;
window.selectOpt = selectOpt;
window.toggleMC = toggleMC;
window.checkSingle = checkSingle;
window.checkMC = checkMC;
window.checkOpen = checkOpen;
window.revealAnswer = revealAnswer;
window.toggleHint = toggleHint;
window.resetQ = resetQ;
window.checkAll = checkAll;
window.revealQ1 = revealQ1;
window.revealQ2 = revealQ2;
window.revealQ3 = revealQ3;
window.revealQ4 = revealQ4;
window.revealQ5 = revealQ5;
window.revealQ6 = revealQ6;
window.revealQ7 = revealQ7;