/**
 * Script principal do TemplateStore
 * Funções gerais usadas em todas as páginas
 */

// ============================================
// FUNÇÕES GERAIS
// ============================================

/**
 * Mostra uma mensagem de feedback para o usuário
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da mensagem (success, error, info, warning)
 * @param {number} duration - Duração em milissegundos (opcional)
 */
function showMessage(message, type = 'info', duration = 3000) {
    // Remover mensagens anteriores
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Criar elemento da mensagem
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Adicionar ao corpo
    document.body.appendChild(messageElement);
    
    // Remover após a duração especificada
    if (duration > 0) {
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, duration);
    }
    
    // Retornar elemento para controle manual
    return messageElement;
}

/**
 * Formata um valor como moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Gera estrelas de classificação
 * @param {number} rating - Classificação (0-5)
 * @returns {string} HTML das estrelas
 */
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

/**
 * Valida um email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se o email for válido
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida uma URL
 * @param {string} url - URL a ser validada
 * @returns {boolean} True se a URL for válida
 */
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Debounce function para otimizar eventos
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função com debounce aplicado
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para limitar a frequência de execução
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite de tempo em milissegundos
 * @returns {Function} Função com throttle aplicado
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// FUNÇÕES DE UI
// ============================================

/**
 * Inicializa o menu móvel
 */
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (event) => {
            if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

/**
 * Inicializa FAQs
 */
function initFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                // Fechar todas as outras respostas
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = '0';
                        }
                    }
                });
                
                // Alternar a resposta atual
                item.classList.toggle('active');
                
                if (item.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        }
    });
}

/**
 * Inicializa modais de imagem
 */
function initImageModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Fechar ao clicar fora
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    });
    
    // Abrir modal ao clicar em imagens com data-modal-target
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                const modalImg = modal.querySelector('img');
                if (modalImg && trigger.tagName === 'IMG') {
                    modalImg.src = trigger.src;
                    modalImg.alt = trigger.alt;
                }
                modal.style.display = 'flex';
            }
        });
    });
}

// ============================================
// FUNÇÕES DE PRODUTOS
// ============================================

/**
 * Carrega produtos em um container
 * @param {HTMLElement} container - Container onde os produtos serão renderizados
 * @param {Array} productsList - Lista de produtos (opcional, usa produtos globais se não fornecido)
 * @param {Object} options - Opções de renderização
 */
function loadProducts(container, productsList = null, options = {}) {
    if (!container) return;
    
    // Obter lista de produtos
    let productsToRender;
    if (productsList) {
        productsToRender = productsList;
    } else if (typeof window.productsData !== 'undefined') {
        productsToRender = window.productsData.getActiveProducts();
    } else {
        container.innerHTML = '<p class="no-products">Produtos não disponíveis no momento.</p>';
        return;
    }
    
    // Aplicar limite se especificado
    if (options.limit && options.limit > 0) {
        productsToRender = productsToRender.slice(0, options.limit);
    }
    
    // Verificar se há produtos
    if (productsToRender.length === 0) {
        container.innerHTML = '<p class="no-products">Nenhum produto encontrado.</p>';
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Determinar layout
    const layout = options.layout || 'grid'; // grid ou list
    
    // Renderizar cada produto
    productsToRender.forEach(product => {
        const productCard = createProductCard(product, layout);
        container.appendChild(productCard);
    });
}

/**
 * Cria um card de produto
 * @param {Object} product - Dados do produto
 * @param {string} layout - Layout do card (grid ou list)
 * @returns {HTMLElement} Elemento do card do produto
 */
function createProductCard(product, layout = 'grid') {
    const card = document.createElement('div');
    card.className = `product-card ${layout}-layout`;
    card.dataset.productId = product.id;
    
    // Determinar imagem principal
    const mainImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : getPlaceholderImage();
    
    // HTML do card
    card.innerHTML = `
        <div class="product-image">
            <img src="${mainImage}" alt="${product.name}" 
                 onerror="this.src='${getPlaceholderImage()}'">
            <div class="product-overlay">
                <a href="produto.html?id=${product.id}" class="btn btn-small">Ver Detalhes</a>
            </div>
            ${product.isNew ? '<span class="product-badge new">Novo</span>' : ''}
            ${product.isPopular ? '<span class="product-badge popular">Popular</span>' : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.shortDescription}</p>
            ${layout === 'list' ? `
                <div class="product-meta">
                    <span class="product-category">${product.category || 'Geral'}</span>
                    <span class="product-rating">
                        ${generateStars(product.rating || 4.5)}
                        <span class="rating-value">${product.rating || 4.5}</span>
                    </span>
                </div>
            ` : ''}
            <div class="product-footer">
                <div class="product-price">${formatCurrency(product.price)}</div>
                <a href="produto.html?id=${product.id}" class="btn btn-small ${layout === 'list' ? 'btn-primary' : 'btn-outline'}">
                    Ver Template
                </a>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Retorna uma imagem placeholder
 * @returns {string} URL da imagem placeholder
 */
function getPlaceholderImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmNWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJQb3BwaW5zIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIj5JbWFnZW0gZG8gUHJvZHV0bzwvdGV4dD48L3N2Zz4K';
}

/**
 * Carrega produtos relacionados
 * @param {number} currentProductId - ID do produto atual
 * @param {HTMLElement} container - Container para os produtos relacionados
 * @param {number} limit - Número máximo de produtos relacionados
 */
function loadRelatedProducts(currentProductId, container, limit = 4) {
    if (!container || !window.productsData) return;
    
    // Obter produto atual
    const currentProduct = window.productsData.getProductById(currentProductId);
    if (!currentProduct) return;
    
    // Obter todos os produtos ativos
    const allProducts = window.productsData.getActiveProducts();
    
    // Filtrar produtos relacionados (mesma categoria, excluindo o atual)
    let relatedProducts = allProducts.filter(product => 
        product.id !== currentProductId && 
        product.category === currentProduct.category
    );
    
    // Se não houver produtos da mesma categoria, pegar aleatórios
    if (relatedProducts.length < limit) {
        const otherProducts = allProducts.filter(p => p.id !== currentProductId);
        const needed = limit - relatedProducts.length;
        
        // Embaralhar produtos
        const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
        
        // Adicionar produtos aleatórios
        for (let i = 0; i < Math.min(needed, shuffled.length); i++) {
            if (!relatedProducts.some(p => p.id === shuffled[i].id)) {
                relatedProducts.push(shuffled[i]);
            }
        }
    }
    
    // Limitar ao número especificado
    relatedProducts = relatedProducts.slice(0, limit);
    
    // Limpar container
    container.innerHTML = '';
    
    // Adicionar produtos relacionados
    if (relatedProducts.length > 0) {
        relatedProducts.forEach(product => {
            const productCard = createProductCard(product);
            container.appendChild(productCard);
        });
    } else {
        container.innerHTML = '<p class="no-related">Nenhum produto relacionado encontrado.</p>';
    }
}

// ============================================
// FUNÇÕES DE FAVORITOS
// ============================================

/**
 * Adiciona um produto aos favoritos
 * @param {number} productId - ID do produto
 * @returns {boolean} True se adicionado com sucesso
 */
function addToFavorites(productId) {
    const favorites = getFavorites();
    
    // Verificar se já está nos favoritos
    if (favorites.includes(productId)) {
        return false;
    }
    
    // Adicionar aos favoritos
    favorites.push(productId);
    saveFavorites(favorites);
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    
    return true;
}

/**
 * Remove um produto dos favoritos
 * @param {number} productId - ID do produto
 * @returns {boolean} True se removido com sucesso
 */
function removeFromFavorites(productId) {
    let favorites = getFavorites();
    const initialLength = favorites.length;
    
    // Remover dos favoritos
    favorites = favorites.filter(id => id !== productId);
    
    if (favorites.length < initialLength) {
        saveFavorites(favorites);
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        
        return true;
    }
    
    return false;
}

/**
 * Verifica se um produto está nos favoritos
 * @param {number} productId - ID do produto
 * @returns {boolean} True se estiver nos favoritos
 */
function isFavorite(productId) {
    const favorites = getFavorites();
    return favorites.includes(productId);
}

/**
 * Obtém a lista de favoritos
 * @returns {Array} Lista de IDs de produtos favoritos
 */
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('templateStoreFavorites')) || [];
    } catch {
        return [];
    }
}

/**
 * Salva a lista de favoritos
 * @param {Array} favorites - Lista de IDs de produtos favoritos
 */
function saveFavorites(favorites) {
    localStorage.setItem('templateStoreFavorites', JSON.stringify(favorites));
}

/**
 * Obtém produtos favoritos completos
 * @returns {Array} Lista de objetos de produtos favoritos
 */
function getFavoriteProducts() {
    if (!window.productsData) return [];
    
    const favoriteIds = getFavorites();
    const allProducts = window.productsData.getActiveProducts();
    
    return allProducts.filter(product => favoriteIds.includes(product.id));
}

// ============================================
// FUNÇÕES DE CARRINHO (SIMULADO)
// ============================================

/**
 * Adiciona um produto ao carrinho (simulado)
 * @param {number} productId - ID do produto
 * @param {number} quantity - Quantidade (padrão: 1)
 * @returns {boolean} True se adicionado com sucesso
 */
function addToCart(productId, quantity = 1) {
    const cart = getCart();
    
    // Verificar se o produto já está no carrinho
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        // Atualizar quantidade
        existingItem.quantity += quantity;
    } else {
        // Adicionar novo item
        cart.push({
            productId,
            quantity,
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart(cart);
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    return true;
}

/**
 * Remove um produto do carrinho
 * @param {number} productId - ID do produto
 * @returns {boolean} True se removido com sucesso
 */
function removeFromCart(productId) {
    let cart = getCart();
    const initialLength = cart.length;
    
    // Remover do carrinho
    cart = cart.filter(item => item.productId !== productId);
    
    if (cart.length < initialLength) {
        saveCart(cart);
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        return true;
    }
    
    return false;
}

/**
 * Obtém o carrinho
 * @returns {Array} Lista de itens do carrinho
 */
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('templateStoreCart')) || [];
    } catch {
        return [];
    }
}

/**
 * Salva o carrinho
 * @param {Array} cart - Lista de itens do carrinho
 */
function saveCart(cart) {
    localStorage.setItem('templateStoreCart', JSON.stringify(cart));
}

/**
 * Obtém produtos do carrinho completos
 * @returns {Array} Lista de objetos de produtos no carrinho
 */
function getCartProducts() {
    if (!window.productsData) return [];
    
    const cart = getCart();
    const allProducts = window.productsData.getActiveProducts();
    
    // Combinar dados do carrinho com dados dos produtos
    return cart.map(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.productId);
        return product ? {
            ...product,
            cartQuantity: cartItem.quantity,
            cartAddedAt: cartItem.addedAt
        } : null;
    }).filter(item => item !== null);
}

/**
 * Calcula o total do carrinho
 * @returns {number} Valor total do carrinho
 */
function getCartTotal() {
    const cartProducts = getCartProducts();
    return cartProducts.reduce((total, product) => {
        return total + (product.price * product.cartQuantity);
    }, 0);
}

// ============================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================

/**
 * Inicializa funcionalidades comuns em todas as páginas
 */
function initCommonFeatures() {
    // Inicializar menu móvel
    initMobileMenu();
    
    // Inicializar FAQs
    initFAQs();
    
    // Inicializar modais de imagem
    initImageModals();
    
    // Atualizar ano no rodapé
    const yearElements = document.querySelectorAll('#current-year');
    yearElements.forEach(element => {
        if (element) {
            element.textContent = new Date().getFullYear();
        }
    });
    
    // Inicializar sistema de favoritos
    initFavoritesSystem();
    
    // Configurar eventos globais
    setupGlobalEvents();
}

/**
 * Inicializa o sistema de favoritos
 */
function initFavoritesSystem() {
    // Atualizar botões de favorito
    function updateFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('[data-favorite-btn]');
        
        favoriteButtons.forEach(button => {
            const productId = parseInt(button.dataset.productId);
            
            if (productId) {
                if (isFavorite(productId)) {
                    button.classList.add('favorited');
                    button.innerHTML = '<i class="fas fa-heart"></i> Favorito';
                } else {
                    button.classList.remove('favorited');
                    button.innerHTML = '<i class="far fa-heart"></i> Favoritar';
                }
            }
        });
    }
    
    // Atualizar botões inicialmente
    updateFavoriteButtons();
    
    // Atualizar quando os favoritos mudarem
    window.addEventListener('favoritesUpdated', updateFavoriteButtons);
    
    // Configurar clique nos botões de favorito
    document.addEventListener('click', (event) => {
        const favoriteBtn = event.target.closest('[data-favorite-btn]');
        
        if (favoriteBtn) {
            event.preventDefault();
            const productId = parseInt(favoriteBtn.dataset.productId);
            
            if (productId) {
                if (isFavorite(productId)) {
                    removeFromFavorites(productId);
                    showMessage('Removido dos favoritos', 'info');
                } else {
                    addToFavorites(productId);
                    showMessage('Adicionado aos favoritos', 'success');
                }
            }
        }
    });
}

/**
 * Configura eventos globais
 */
function setupGlobalEvents() {
    // Fechar mensagens ao clicar nelas
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('message')) {
            event.target.remove();
        }
    });
    
    // Manipular links de compra
    document.addEventListener('click', (event) => {
        const buyLink = event.target.closest('[data-buy-link]');
        
        if (buyLink) {
            event.preventDefault();
            const productId = buyLink.dataset.productId;
            
            // Em um sistema real, isso redirecionaria para o gateway de pagamento
            // Por enquanto, apenas mostra uma mensagem
            showMessage('Redirecionando para a página de pagamento...', 'info');
            
            // Simular redirecionamento após 1 segundo
            setTimeout(() => {
                if (productId && window.productsData) {
                    const product = window.productsData.getProductById(parseInt(productId));
                    if (product && product.paymentLink) {
                        window.open(product.paymentLink, '_blank');
                    }
                }
            }, 1000);
        }
    });
}

// ============================================
// EXPORTAR FUNÇÕES GLOBAIS
// ============================================

// Exportar funções para uso global
window.templateStore = {
    // Funções gerais
    showMessage,
    formatCurrency,
    generateStars,
    validateEmail,
    validateURL,
    
    // Funções de produtos
    loadProducts,
    createProductCard,
    loadRelatedProducts,
    
    // Funções de favoritos
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavorites,
    getFavoriteProducts,
    
    // Funções de carrinho
    addToCart,
    removeFromCart,
    getCart,
    getCartProducts,
    getCartTotal,
    
    // Inicialização
    initCommonFeatures
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.templateStore.initCommonFeatures();
});

// Inicializar quando a página estiver completamente carregada
window.addEventListener('load', () => {
    // Verificar se há produtos no localStorage
    if (localStorage.getItem('templateStoreProducts')) {
        console.log('TemplateStore: Produtos carregados do localStorage');
    }
    
    // Verificar se há favoritos
    const favorites = getFavorites();
    if (favorites.length > 0) {
        console.log(`TemplateStore: ${favorites.length} produto(s) favoritado(s)`);
    }
});