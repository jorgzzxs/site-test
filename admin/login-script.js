// Sistema de Autenticação para Painel Admin
class AdminAuth {
    constructor() {
        this.init();
    }
    
    init() {
        // Configurar credenciais padrão (altere estas!)
        const defaultCredentials = {
            username: 'admin',
            password: 'template123', // ALTERE ESTA SENHA!
            token: this.generateToken()
        };
        
        // Salvar credenciais se não existirem
        if (!localStorage.getItem('adminCredentials')) {
            localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
        }
        
        // Configurar formulário de login
        this.setupLoginForm();
        
        // Verificar se já está logado
        this.checkAuth();
    }
    
    generateToken() {
        return 'ts_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');
        
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (this.authenticate(username, password)) {
                this.loginSuccess();
            } else {
                this.showError('Credenciais inválidas');
            }
        });
        
        // Limpar erro ao digitar
        ['username', 'password'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                loginError.classList.remove('show');
            });
        });
        
        // Proteção contra tentativas
        this.setupLoginProtection();
    }
    
    setupLoginProtection() {
        // Limitar tentativas de login
        let attempts = localStorage.getItem('loginAttempts') || 0;
        const lastAttempt = localStorage.getItem('lastLoginAttempt');
        const now = Date.now();
        
        // Resetar tentativas após 15 minutos
        if (lastAttempt && now - lastAttempt > 15 * 60 * 1000) {
            attempts = 0;
            localStorage.setItem('loginAttempts', 0);
        }
        
        // Bloquear após 5 tentativas
        if (attempts >= 5) {
            const btn = document.querySelector('.login-btn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-lock"></i> Acesso bloqueado (15min)';
            this.showError('Muitas tentativas falhas. Tente novamente em 15 minutos.');
            return;
        }
    }
    
    authenticate(username, password) {
        const stored = localStorage.getItem('adminCredentials');
        if (!stored) return false;
        
        try {
            const credentials = JSON.parse(stored);
            
            // Registar tentativa
            let attempts = parseInt(localStorage.getItem('loginAttempts') || 0);
            localStorage.setItem('loginAttempts', attempts + 1);
            localStorage.setItem('lastLoginAttempt', Date.now());
            
            return username === credentials.username && password === credentials.password;
        } catch (error) {
            return false;
        }
    }
    
    loginSuccess() {
        // Criar sessão
        const sessionToken = this.generateToken();
        const sessionData = {
            token: sessionToken,
            expires: Date.now() + (8 * 60 * 60 * 1000), // 8 horas
            userAgent: navigator.userAgent
        };
        
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        localStorage.setItem('loginAttempts', 0); // Resetar tentativas
        
        // Redirecionar para o painel
        window.location.href = 'admin-panel.html'; // Mudamos o nome do arquivo
    }
    
    showError(message) {
        const errorElement = document.getElementById('loginError');
        const messageElement = document.getElementById('errorMessage');
        
        if (errorElement && messageElement) {
            messageElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        // Adicionar efeito de shake
        const form = document.getElementById('loginForm');
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
        
        // Adicionar estilo de shake
        if (!document.getElementById('shakeStyle')) {
            const style = document.createElement('style');
            style.id = 'shakeStyle';
            style.textContent = `
                .shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    checkAuth() {
        // Se já está no login, não redirecionar
        if (window.location.pathname.includes('login.html')) {
            return;
        }
        
        // Se está no admin e não tem sessão, redirecionar para login
        if (window.location.pathname.includes('admin-panel.html')) {
            if (!this.isAuthenticated()) {
                window.location.href = 'login.html';
            }
        }
    }
    
    isAuthenticated() {
        const session = localStorage.getItem('adminSession');
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            const now = Date.now();
            
            // Verificar expiração
            if (now > sessionData.expires) {
                localStorage.removeItem('adminSession');
                return false;
            }
            
            // Verificar user agent (proteção básica)
            if (sessionData.userAgent !== navigator.userAgent) {
                localStorage.removeItem('adminSession');
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    logout() {
        localStorage.removeItem('adminSession');
        window.location.href = 'login.html';
    }
}

// Inicializar autenticação
document.addEventListener('DOMContentLoaded', () => {
    window.adminAuth = new AdminAuth();
});