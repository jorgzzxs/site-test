// Verificação de segurança para o painel admin
class SecurityCheck {
    constructor() {
        this.checkAuthentication();
        this.setupAutoLogout();
        this.setupActivityMonitor();
        this.setupSecurityHeaders();
    }
    
    checkAuthentication() {
        const session = localStorage.getItem('adminSession');
        
        if (!session) {
            this.redirectToLogin();
            return;
        }
        
        try {
            const sessionData = JSON.parse(session);
            const now = Date.now();
            
            // Verificar expiração
            if (now > sessionData.expires) {
                localStorage.removeItem('adminSession');
                this.redirectToLogin();
                return;
            }
            
            // Verificar user agent
            if (sessionData.userAgent !== navigator.userAgent) {
                localStorage.removeItem('adminSession');
                this.redirectToLogin();
                return;
            }
            
            // Atualizar tempo da sessão em atividade
            sessionData.lastActivity = now;
            localStorage.setItem('adminSession', JSON.stringify(sessionData));
            
        } catch (error) {
            this.redirectToLogin();
        }
    }
    
    redirectToLogin() {
        // Salvar URL atual para redirecionamento após login
        const currentUrl = window.location.href;
        sessionStorage.setItem('redirectAfterLogin', currentUrl);
        
        // Redirecionar para login
        window.location.href = 'login.html';
    }
    
    setupAutoLogout() {
        // Logout após 30 minutos de inatividade
        this.inactivityTime = 30 * 60 * 1000; // 30 minutos
        this.logoutTimer = setTimeout(() => {
            this.logout();
        }, this.inactivityTime);
        
        // Resetar timer em atividade
        document.addEventListener('click', () => this.resetLogoutTimer());
        document.addEventListener('keypress', () => this.resetLogoutTimer());
        document.addEventListener('mousemove', () => this.resetLogoutTimer());
    }
    
    resetLogoutTimer() {
        clearTimeout(this.logoutTimer);
        this.logoutTimer = setTimeout(() => {
            this.logout();
        }, this.inactivityTime);
        
        // Atualizar última atividade na sessão
        const session = localStorage.getItem('adminSession');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                sessionData.lastActivity = Date.now();
                localStorage.setItem('adminSession', JSON.stringify(sessionData));
            } catch (error) {
                // Ignorar erro
            }
        }
    }
    
    setupActivityMonitor() {
        // Verificar atividade a cada minuto
        setInterval(() => {
            this.checkAuthentication();
        }, 60 * 1000);
    }
    
    setupSecurityHeaders() {
        // Prevenir caching de páginas sensíveis
        const metaNoCache = document.createElement('meta');
        metaNoCache.httpEquiv = "Cache-Control";
        metaNoCache.content = "no-store, no-cache, must-revalidate";
        document.head.appendChild(metaNoCache);
        
        const metaPragma = document.createElement('meta');
        metaPragma.httpEquiv = "Pragma";
        metaPragma.content = "no-cache";
        document.head.appendChild(metaPragma);
        
        const metaExpires = document.createElement('meta');
        metaExpires.httpEquiv = "Expires";
        metaExpires.content = "0";
        document.head.appendChild(metaExpires);
    }
    
    logout() {
        localStorage.removeItem('adminSession');
        this.redirectToLogin();
    }
}

// Configurar logout nos botões
function setupLogoutButtons() {
    const logoutBtns = ['logoutBtn', 'sidebarLogout'];
    
    logoutBtns.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Confirmar logout
                if (confirm('Deseja realmente sair do painel administrativo?')) {
                    localStorage.removeItem('adminSession');
                    window.location.href = 'login.html';
                }
            });
        }
    });
}

// Configurar menu mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('adminSidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuToggle.innerHTML = sidebar.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar segurança
    if (window.location.pathname.includes('admin-panel.html')) {
        new SecurityCheck();
        setupLogoutButtons();
        setupMobileMenu();
    }
    
    // Remover link do admin do site principal
    const adminLink = document.querySelector('.admin-link');
    if (adminLink && !window.location.pathname.includes('admin')) {
        adminLink.style.display = 'none';
    }
});