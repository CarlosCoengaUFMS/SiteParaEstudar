// sidebar.js - Sidebar unificada para SiteParaEstudar
// Para usar: <script src="JS/sidebar.js"></script> antes de </body>
// Requer: CSS da sidebar já definido no <style> de cada página

(function() {
    // Verificar se a sidebar já foi carregada (evitar duplicação)
    if (document.getElementById('sidebar')) return;

    // ========== HAMBURGER MENU ==========
    const hamburgerHTML = `
        <button class="hamburger-btn" id="hamburger-btn" aria-label="Menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        </button>
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;
    document.body.insertAdjacentHTML('afterbegin', hamburgerHTML);

    // ========== SIDEBAR ==========
    const sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">SPE</div>
                <span class="sidebar-title">SiteParaEstudar</span>
            </div>
            <nav class="sidebar-nav">
                <a href="index.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(124,109,250,0.2);color:#7c6dfa;">🏠</span> Início
                </a>
                <a href="HomeMatematica.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(124,109,250,0.2);color:#7c6dfa;">📚</span> Matemática
                </a>
                <a href="HomeProgramacao.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(4, 245, 12, 0.2);color:#6dfabc;">💻</span> Programação em C
                </a>
                <a href="videos.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(250,109,138,0.15);color:#fa6d8a;">▶️</span> Videoaulas
                </a>
                <a href="livros.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(251, 42, 0, 0.15);color:#e62e00;">📚</span> Biblioteca
                </a>
                <a href="filmes.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(250,109,138,0.9);box-shadow: 0 8px 25px rgba(250,109,138,0.4);color:#9200e6;">🎬</span> Filmes
                </a>
                <hr style="border-color:#2a2a38;margin:8px 0;">
                <a href="ListaConjuntos.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(124,109,250,0.15);color:#a89fff;">∩</span> Conjuntos (21Q)
                </a>
                <a href="exercicios-relacoes.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(250,109,138,0.15);color:#ff9db5;">↔</span> Relações (11Q)
                </a>
                <a href="exercicios-funcoes.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(109,250,188,0.15);color:#6dfabc;">f(x)</span> Funções (10Q)
                </a>
                <a href="exercicios-combinatoria.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(250,220,109,0.15);color:#fadc6d;">C(n,k)</span> Combinatória (15Q)
                </a>
                <hr style="border-color:#2a2a38;margin:8px 0;">
                <a href="matematica.html" class="sidebar-link">
                    <span class="icon" style="background:linear-gradient(135deg,rgba(124,109,250,0.2),rgba(109,250,188,0.2));color:#fff;">📋</span> Prova Completa (24Q)
                </a>
                <a href="prova1Avaliativa.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(109,250,188,0.2);color:#6dfabc;">📋</span> Prova Avaliativa 1 (7Q)
                </a>
                <hr style="border-color:#2a2a38;margin:8px 0;">
                <a href="mapa_mental_Adm.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(250,109,138,0.15);color:#fa6d8a;">✏️</span> Mapa Mental ADM
                </a>
                <a href="casos.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(250,220,109,0.15);color:#fadc6d;">⚖</span> Casos ADM
                </a>
            </nav>
            <div class="sidebar-footer">UFMS · Campus Ponta Porã</div>
        </aside>
    `;
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // ========== LÓGICA DA SIDEBAR ==========
    let sidebarOpen = false;
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
        sidebar.classList.toggle('open', sidebarOpen);
        overlay.classList.toggle('show', sidebarOpen);
        hamburgerBtn.classList.toggle('open', sidebarOpen);
    }

    // Expor função globalmente
    window.toggleSidebar = toggleSidebar;

    // Event listeners
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);

    // Fechar sidebar ao pressionar ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebarOpen) {
            toggleSidebar();
        }
    });

    // ========== MARCAR LINK ATIVO ==========
    function markActiveLink() {
        const path = window.location.pathname;
        // Remove barra final se existir
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        // Pega o último segmento (nome do arquivo)
        const segments = cleanPath.split('/');
        let currentPage = segments[segments.length - 1];
        // Se estiver vazio (página raiz), assume index.html
        if (!currentPage || currentPage === '') {
            currentPage = 'index.html';
        }
        // Remove query strings e hash
        currentPage = currentPage.split('?')[0].split('#')[0];

        console.log('📄 Página atual detectada:', currentPage);

        document.querySelectorAll('.sidebar-link').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Extrai apenas o nome do arquivo do href
            const hrefFile = href.split('/').pop().split('?')[0].split('#')[0];

            if (hrefFile === currentPage) {
                link.classList.add('active');
                // Dar um destaque extra no ícone ativo
                const icon = link.querySelector('.icon');
                if (icon) {
                    icon.style.boxShadow = '0 0 12px currentColor';
                    icon.style.border = '1px solid currentColor';
                }
            }
        });
    }

    // Marcar link ativo quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', markActiveLink);
    } else {
        markActiveLink();
    }

    // Fechar sidebar ao clicar em links (mobile)
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 768 && sidebarOpen) {
                    toggleSidebar();
                }
            });
        });
    });

})();