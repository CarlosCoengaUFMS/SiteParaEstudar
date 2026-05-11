// sidebar.js - Sidebar otimizada para mobile
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

    // ========== SIDEBAR OTIMIZADA PARA MOBILE ==========
    const sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">SPE</div>
                <span class="sidebar-title">SiteParaEstudar</span>
                <button class="sidebar-close" id="sidebar-close" aria-label="Fechar menu">✕</button>
            </div>
            <nav class="sidebar-nav">
                <a href="index.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(124,109,250,0.2);color:#7c6dfa;">🏠</span> 
                    <div class="link-content">
                        <span class="link-title">Início</span>
                        <span class="link-subtitle">Página principal</span>
                    </div>
                </a>
                <a href="HomeMatematica.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(124,109,250,0.2);color:#7c6dfa;">📚</span> 
                    <div class="link-content">
                        <span class="link-title">Matemática</span>
                        <span class="link-subtitle">Exercícios e conteúdo</span>
                    </div>
                </a>
                <a href="HomeProgramacao.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(4, 245, 12, 0.2);color:#6dfabc;">💻</span> 
                    <div class="link-content">
                        <span class="link-title">Programação em C</span>
                        <span class="link-subtitle">Códigos e tutoriais</span>
                    </div>
                </a>
                <a href="videos.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(250,109,138,0.15);color:#fa6d8a;">▶️</span> 
                    <div class="link-content">
                        <span class="link-title">Videoaulas</span>
                        <span class="link-subtitle">Aulas em vídeo</span>
                    </div>
                </a>
                <a href="livros.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(251, 42, 0, 0.15);color:#e62e00;">📚</span> 
                    <div class="link-content">
                        <span class="link-title">Biblioteca</span>
                        <span class="link-subtitle">Livros e materiais</span>
                    </div>
                </a>
                <a href="filmes.html" class="sidebar-link">
                    <span class="icon" style="background:rgba(250,109,138,0.9);color:#9200e6;">🎬</span> 
                    <div class="link-content">
                        <span class="link-title">Filmes</span>
                        <span class="link-subtitle">Conteúdo em vídeo</span>
                    </div>
                </a>
            </nav>
            <div class="sidebar-footer">
                <div class="footer-info">
                    <span class="footer-text">UFMS · Campus Ponta Porã</span>
                    <span class="footer-version">v1.2</span>
                </div>
            </div>
        </aside>
    `;
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // ========== LÓGICA DA SIDEBAR ==========
    let sidebarOpen = false;
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close');

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
        sidebar.classList.toggle('open', sidebarOpen);
        overlay.classList.toggle('show', sidebarOpen);
        hamburgerBtn.classList.toggle('open', sidebarOpen);
        
        // Prevenir scroll no body quando sidebar está aberta
        document.body.style.overflow = sidebarOpen ? 'hidden' : '';
        
        // Feedback tátil para mobile (se disponível)
        if (window.navigator.vibrate && sidebarOpen) {
            window.navigator.vibrate(10);
        }
    }

    // Expor função globalmente
    window.toggleSidebar = toggleSidebar;

    // Event listeners
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

    // Fechar sidebar ao pressionar ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebarOpen) {
            toggleSidebar();
        }
    });

    // Fechar sidebar com gesto de swipe para esquerda (mobile)
    let touchStartX = 0;
    
    sidebar.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    sidebar.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        
        // Swipe para esquerda (fechar)
        if (diff > 50 && sidebarOpen) {
            toggleSidebar();
        }
    });

    // ========== MARCAR LINK ATIVO ==========
    function markActiveLink() {
        const path = window.location.pathname;
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const segments = cleanPath.split('/');
        let currentPage = segments[segments.length - 1];
        
        if (!currentPage || currentPage === '') {
            currentPage = 'index.html';
        }
        currentPage = currentPage.split('?')[0].split('#')[0];

        document.querySelectorAll('.sidebar-link').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            const hrefFile = href.split('/').pop().split('?')[0].split('#')[0];

            if (hrefFile === currentPage) {
                link.classList.add('active');
                const icon = link.querySelector('.icon');
                if (icon) {
                    icon.style.boxShadow = '0 0 15px currentColor';
                    icon.style.transform = 'scale(1.1)';
                    icon.style.border = '2px solid currentColor';
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

    // ========== OTIMIZAÇÕES PARA MOBILE ==========
    
    // Fechar sidebar ao clicar em links
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', function(e) {
                if (sidebarOpen) {
                    // Pequeno delay para dar feedback visual antes de fechar
                    setTimeout(() => {
                        toggleSidebar();
                    }, 150);
                }
            });
        });
    });

    // Ajustar altura da sidebar em dispositivos com notch
    function adjustForSafeArea() {
        const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)'));
        if (safeAreaTop > 0) {
            document.querySelector('.sidebar-header').style.paddingTop = `${safeAreaTop + 20}px`;
        }
    }

    if (CSS.supports('padding-top', 'env(safe-area-inset-top)')) {
        adjustForSafeArea();
        window.addEventListener('resize', adjustForSafeArea);
    }

    // Melhorar performance com passive event listeners
    document.addEventListener('touchstart', function() {}, { passive: true });
    document.addEventListener('touchmove', function() {}, { passive: true });

})();