/**
 * Sistema de autenticação para o painel administrativo
 * Baseado em chave única e localStorage
 */

// Chave de armazenamento para sessão
const SESSION_KEY = 'adminSession';

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} True se autenticado, false caso contrário
 */
function isAuthenticated() {
    const sessionData = getSessionData();
    
    if (!sessionData || !sessionData.authenticated) {
        return false;
    }
    
    // Verificar se a sessão expirou (24 horas)
    if (isSessionExpired(sessionData.timestamp)) {
        logout();
        return false;
    }
    
    return true;
}

/**
 * Autentica o usuário com uma chave de acesso
 * @param {string} accessKey - Chave de acesso fornecida pelo usuário
 * @returns {boolean} True se autenticação bem-sucedida
 */
function authenticate(accessKey) {
    // Obter chave armazenada
    const storedKey = localStorage.getItem('adminAccessKey') || 'admin123';
    
    if (accessKey === storedKey) {
        // Criar sessão
        createSession();
        return true;
    }
    
    return false;
}

/**
 * Cria uma nova sessão de administrador
 */
function createSession() {
    const sessionData = {
        authenticated: true,
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Obtém os dados da sessão atual
 * @returns {Object|null} Dados da sessão ou null
 */
function getSessionData() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (error) {
        console.error('Erro ao ler dados da sessão:', error);
        return null;
    }
}

/**
 * Verifica se a sessão expirou
 * @param {number} sessionTimestamp - Timestamp da criação da sessão
 * @returns {boolean} True se expirada
 */
function isSessionExpired(sessionTimestamp) {
    const now = new Date().getTime();
    const sessionAge = now - sessionTimestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    
    return sessionAge > maxAge;
}

/**
 * Renova a sessão atual (estende a validade)
 */
function renewSession() {
    if (isAuthenticated()) {
        createSession();
        return true;
    }
    return false;
}

/**
 * Encerra a sessão atual (logout)
 */
function logout() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Verifica autenticação e redireciona se necessário
 * @param {string} redirectUrl - URL para redirecionar se não autenticado
 */
function requireAuth(redirectUrl = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
    }
}

/**
 * Altera a chave de acesso administrativo
 * @param {string} newKey - Nova chave de acesso
 * @returns {boolean} True se alterada com sucesso
 */
function changeAdminKey(newKey) {
    if (!newKey || newKey.length < 4) {
        return false;
    }
    
    localStorage.setItem('adminAccessKey', newKey);
    return true;
}

/**
 * Obtém o tempo restante da sessão em minutos
 * @returns {number} Minutos restantes ou 0 se não autenticado
 */
function getSessionTimeRemaining() {
    const sessionData = getSessionData();
    
    if (!sessionData || !sessionData.authenticated) {
        return 0;
    }
    
    const now = new Date().getTime();
    const sessionAge = now - sessionData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    const remaining = maxAge - sessionAge;
    
    return Math.max(0, Math.floor(remaining / (60 * 1000))); // Converter para minutos
}

// Verificar e renovar sessão periodicamente (a cada 5 minutos)
setInterval(() => {
    if (isAuthenticated()) {
        renewSession();
    }
}, 5 * 60 * 1000);

// Exportar funções para uso global
window.auth = {
    isAuthenticated,
    authenticate,
    logout,
    requireAuth,
    changeAdminKey,
    getSessionTimeRemaining
};