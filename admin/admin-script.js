// ============================================
// SISTEMA DE ADMINISTRAÇÃO DO TEMPLATESHOP
// ============================================
class AdminSystem {
    constructor() {
        this.currentProductId = null;
        this.currentPromotionId = null;
        this.confirmAction = null;
        this.confirmCallback = null;
        
        this.init();
    }
    
    init() {
        // Carregar dados iniciais
        this.loadDashboard();
        this.loadProductsSection();
        this.loadPromotionsSection();
        this.loadPaymentLinksSection();
        
        // Configurar navegação
        this.setupNavigation();
        
        // Configurar modais
        this.setupModals();
        
        // Configurar eventos
        this.setupEvents();
        
        // Atualizar status
        this.updateStatus();
    }
    
    // ============================================
    // FUNÇÕES DE NAVEGAÇÃO
    // ============================================
    setupNavigation() {
        // Alternar entre seções
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover active de todos os links
                document.querySelectorAll('.nav-link').forEach(l => {
                    l.classList.remove('active');
                });
                
                // Adicionar active ao link clicado
                link.classList.add('active');
                
                // Mostrar seção correspondente
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
        
        // Botão de logout
        document.getElementById('logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.showConfirm('Sair do Sistema', 'Deseja realmente sair do painel administrativo?', () => {
                window.location.href = 'index.html';
            });
        });
    }
    
    showSection(sectionId) {
        // Esconder todas as seções
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar seção selecionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
    
    // ============================================
    // DASHBOARD
    // ============================================
    loadDashboard() {
        const products = this.loadProducts();
        const promotions = this.loadPromotions();
        const paymentLinks = this.loadPaymentLinks();
        
        // Atualizar estatísticas
        document.getElementById('statProducts').textContent = products.length;
        document.getElementById('statPromotions').textContent = promotions.filter(p => p.active).length;
        document.getElementById('statLinks').textContent = Object.keys(paymentLinks).length;
        document.getElementById('statFeatured').textContent = products.filter(p => p.featured).length;
        
        // Carregar produtos recentes
        this.loadRecentProducts();
        
        // Configurar ações rápidas
        this.setupQuickActions();
    }
    
    loadRecentProducts() {
        const products = this.loadProducts();
        const container = document.getElementById('recentProductsList');
        
        if (products.length === 0) {
            container.innerHTML = '<p class="no-products">Nenhum produto cadastrado.</p>';
            return;
        }
        
        // Ordenar por data de criação (mais recentes primeiro)
        const recentProducts = [...products]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        container.innerHTML = recentProducts.map(product => `
            <div class="product-mini-item">
                <div class="product-mini-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}">` :
                        `<i class="fas fa-laptop-code"></i>`
                    }
                </div>
                <div class="product-mini-info">
                    <h4>${product.name}</h4>
                    <div class="product-mini-price">R$ ${this.formatPrice(product.price)}</div>
                </div>
            </div>
        `).join('');
    }
    
    setupQuickActions() {
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                
                switch(action) {
                    case 'add-product':
                        this.openProductModal();
                        break;
                    case 'add-promotion':
                        this.openPromotionModal();
                        break;
                    case 'view-site':
                        window.open('index.html', '_blank');
                        break;
                    case 'export-data':
                        this.exportData();
                        break;
                }
            });
        });
    }
    
    // ============================================
    // GESTÃO DE PRODUTOS
    // ============================================
    loadProductsSection() {
        this.refreshProductsList();
        
        // Configurar botões da seção de produtos
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.openProductModal();
        });
        
        document.getElementById('refreshProductsBtn').addEventListener('click', () => {
            this.refreshProductsList();
            this.showNotification('Lista de produtos atualizada!', 'success');
        });
    }
    
    refreshProductsList() {
        const products = this.loadProducts();
        const container = document.getElementById('productsList');
        
        if (products.length === 0) {
            container.innerHTML = '<div class="no-data"><p>Nenhum produto cadastrado. Clique em "Adicionar Novo Produto" para começar.</p></div>';
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="product-item" data-id="${product.id}">
                <div class="product-image-small">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}">` :
                        `<i class="fas fa-laptop-code"></i>`
                    }
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <div class="product-category-badge">${this.getCategoryName(product.category)}</div>
                    <p class="product-description-short">${product.description}</p>
                    <div class="product-price-info">
                        <span class="product-price">R$ ${this.formatPrice(product.price)}</span>
                        ${product.originalPrice ? 
                            `<span class="product-original-price">R$ ${this.formatPrice(product.originalPrice)}</span>` : 
                            ''
                        }
                        ${product.featured ? '<span class="featured-badge">⭐ Destaque</span>' : ''}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="action-btn-small edit" onclick="admin.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn-small delete" onclick="admin.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        this.updateStatus();
    }
    
    openProductModal(productId = null) {
        this.currentProductId = productId;
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        
        // Limpar formulário
        form.reset();
        document.getElementById('imagePreview').innerHTML = `
            <i class="fas fa-image"></i>
            <span>Nenhuma imagem selecionada</span>
        `;
        document.getElementById('productImageBase64').value = '';
        
        if (productId) {
            // Modo edição
            document.getElementById('modalProductTitle').textContent = 'Editar Produto';
            this.loadProductData(productId);
        } else {
            // Modo adição
            document.getElementById('modalProductTitle').textContent = 'Adicionar Novo Produto';
        }
        
        modal.classList.add('active');
    }
    
    loadProductData(productId) {
        const products = this.loadProducts();
        const product = products.find(p => p.id == productId);
        
        if (!product) return;
        
        // Preencher formulário
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productLongDescription').value = product.longDescription || '';
        document.getElementById('productOriginalPrice').value = product.originalPrice || '';
        document.getElementById('productTags').value = product.tags ? product.tags.join(', ') : '';
        document.getElementById('productFeatured').checked = product.featured || false;
        
        // Carregar imagem
        if (product.image) {
            document.getElementById('productImageBase64').value = product.image;
            document.getElementById('imagePreview').innerHTML = `
                <img src="${product.image}" alt="${product.name}">
            `;
        }
    }
    
    saveProduct() {
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            this.showNotification('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        const products = this.loadProducts();
        const productData = {
            id: this.currentProductId || this.generateId(),
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            longDescription: document.getElementById('productLongDescription').value || '',
            originalPrice: document.getElementById('productOriginalPrice').value ? 
                parseFloat(document.getElementById('productOriginalPrice').value) : null,
            tags: document.getElementById('productTags').value ? 
                document.getElementById('productTags').value.split(',').map(tag => tag.trim()) : [],
            image: document.getElementById('productImageBase64').value || null,
            featured: document.getElementById('productFeatured').checked,
            createdAt: this.currentProductId ? 
                products.find(p => p.id == this.currentProductId)?.createdAt || new Date().toISOString() : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentProductId) {
            // Atualizar produto existente
            const index = products.findIndex(p => p.id == this.currentProductId);
            if (index !== -1) {
                products[index] = productData;
            }
        } else {
            // Adicionar novo produto
            products.push(productData);
        }
        
        this.saveProducts(products);
        this.closeModal('productModal');
        this.refreshProductsList();
        this.loadDashboard();
        this.showNotification('Produto salvo com sucesso!', 'success');
    }
    
    editProduct(productId) {
        this.openProductModal(productId);
    }
    
    deleteProduct(productId) {
        this.showConfirm(
            'Excluir Produto', 
            'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
            () => {
                const products = this.loadProducts();
                const filteredProducts = products.filter(p => p.id != productId);
                this.saveProducts(filteredProducts);
                this.refreshProductsList();
                this.loadDashboard();
                this.showNotification('Produto excluído com sucesso!', 'success');
            }
        );
    }
    
    // ============================================
    // GESTÃO DE PROMOÇÕES
    // ============================================
    loadPromotionsSection() {
        this.refreshPromotionsList();
        
        document.getElementById('addPromotionBtn').addEventListener('click', () => {
            this.openPromotionModal();
        });
    }
    
    refreshPromotionsList() {
        const promotions = this.loadPromotions();
        const container = document.getElementById('promotionsList');
        
        if (promotions.length === 0) {
            container.innerHTML = '<div class="no-data"><p>Nenhuma promoção cadastrada.</p></div>';
            return;
        }
        
        // Carregar produtos para exibir nomes
        const products = this.loadProducts();
        
        container.innerHTML = promotions.map(promo => {
            const now = new Date();
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            const isActive = promo.active && now >= startDate && now <= endDate;
            
            // Obter nomes dos produtos
            let productNames = [];
            if (promo.products.includes('all')) {
                productNames = ['Todos os Produtos'];
            } else {
                productNames = promo.products.map(productId => {
                    const product = products.find(p => p.id == productId);
                    return product ? product.name : `Produto #${productId}`;
                });
            }
            
            return `
                <div class="promotion-item">
                    <div class="promotion-header">
                        <div class="promotion-title">${promo.name}</div>
                        <div class="promotion-status ${isActive ? 'active' : 'inactive'}">
                            ${isActive ? 'Ativa' : 'Inativa'}
                        </div>
                    </div>
                    <div class="promotion-details">
                        <div class="promotion-detail">
                            <span class="promotion-label">Tipo</span>
                            <span class="promotion-value">${promo.type === 'percentage' ? `${promo.value}%` : `R$ ${this.formatPrice(promo.value)}`}</span>
                        </div>
                        <div class="promotion-detail">
                            <span class="promotion-label">Início</span>
                            <span class="promotion-value">${this.formatDate(promo.startDate)}</span>
                        </div>
                        <div class="promotion-detail">
                            <span class="promotion-label">Término</span>
                            <span class="promotion-value">${this.formatDate(promo.endDate)}</span>
                        </div>
                    </div>
                    ${promo.description ? `<p>${promo.description}</p>` : ''}
                    <div class="promotion-products">
                        ${productNames.map(name => `
                            <span class="promotion-product-tag">${name}</span>
                        `).join('')}
                    </div>
                    <div class="promotion-actions">
                        <button class="btn btn-small" onclick="admin.editPromotion(${promo.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-small btn-danger" onclick="admin.deletePromotion(${promo.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.updateStatus();
    }
    
    openPromotionModal(promotionId = null) {
        this.currentPromotionId = promotionId;
        const modal = document.getElementById('promotionModal');
        const form = document.getElementById('promotionForm');
        const productsSelect = document.getElementById('promotionProducts');
        
        // Limpar formulário
        form.reset();
        
        // Preencher select de produtos
        const products = this.loadProducts();
        productsSelect.innerHTML = `
            <option value="all">Todos os Produtos</option>
            ${products.map(product => `
                <option value="${product.id}">${product.name}</option>
            `).join('')}
        `;
        
        if (promotionId) {
            // Modo edição
            document.getElementById('modalPromotionTitle').textContent = 'Editar Promoção';
            this.loadPromotionData(promotionId);
        } else {
            // Modo adição - definir datas padrão
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            document.getElementById('modalPromotionTitle').textContent = 'Nova Promoção';
            document.getElementById('promotionStart').value = this.formatDateTimeLocal(now);
            document.getElementById('promotionEnd').value = this.formatDateTimeLocal(tomorrow);
        }
        
        modal.classList.add('active');
    }
    
    loadPromotionData(promotionId) {
        const promotions = this.loadPromotions();
        const promotion = promotions.find(p => p.id == promotionId);
        
        if (!promotion) return;
        
        document.getElementById('promotionId').value = promotion.id;
        document.getElementById('promotionName').value = promotion.name;
        document.getElementById('promotionType').value = promotion.type;
        document.getElementById('promotionValue').value = promotion.value;
        document.getElementById('promotionDescription').value = promotion.description || '';
        document.getElementById('promotionActive').checked = promotion.active;
        document.getElementById('promotionStart').value = this.formatDateTimeLocal(new Date(promotion.startDate));
        document.getElementById('promotionEnd').value = this.formatDateTimeLocal(new Date(promotion.endDate));
        
        // Selecionar produtos
        const productsSelect = document.getElementById('promotionProducts');
        promotion.products.forEach(productId => {
            const option = Array.from(productsSelect.options).find(opt => opt.value == productId);
            if (option) option.selected = true;
        });
    }
    
    savePromotion() {
        const form = document.getElementById('promotionForm');
        if (!form.checkValidity()) {
            this.showNotification('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        const promotions = this.loadPromotions();
        const promotionData = {
            id: this.currentPromotionId || this.generateId(),
            name: document.getElementById('promotionName').value,
            type: document.getElementById('promotionType').value,
            value: parseFloat(document.getElementById('promotionValue').value),
            description: document.getElementById('promotionDescription').value,
            active: document.getElementById('promotionActive').checked,
            startDate: document.getElementById('promotionStart').value,
            endDate: document.getElementById('promotionEnd').value,
            products: Array.from(document.getElementById('promotionProducts').selectedOptions)
                .map(option => option.value),
            createdAt: this.currentPromotionId ? 
                promotions.find(p => p.id == this.currentPromotionId)?.createdAt || new Date().toISOString() : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentPromotionId) {
            // Atualizar promoção existente
            const index = promotions.findIndex(p => p.id == this.currentPromotionId);
            if (index !== -1) {
                promotions[index] = promotionData;
            }
        } else {
            // Adicionar nova promoção
            promotions.push(promotionData);
        }
        
        this.savePromotions(promotions);
        this.closeModal('promotionModal');
        this.refreshPromotionsList();
        this.loadDashboard();
        this.showNotification('Promoção salva com sucesso!', 'success');
    }
    
    editPromotion(promotionId) {
        this.openPromotionModal(promotionId);
    }
    
    deletePromotion(promotionId) {
        this.showConfirm(
            'Excluir Promoção', 
            'Tem certeza que deseja excluir esta promoção?',
            () => {
                const promotions = this.loadPromotions();
                const filteredPromotions = promotions.filter(p => p.id != promotionId);
                this.savePromotions(filteredPromotions);
                this.refreshPromotionsList();
                this.loadDashboard();
                this.showNotification('Promoção excluída com sucesso!', 'success');
            }
        );
    }
    
    // ============================================
    // LINKS DE PAGAMENTO
    // ============================================
    loadPaymentLinksSection() {
        this.refreshPaymentLinksList();
    }
    
    refreshPaymentLinksList() {
        const products = this.loadProducts();
        const paymentLinks = this.loadPaymentLinks();
        const container = document.getElementById('paymentLinksList');
        
        if (products.length === 0) {
            container.innerHTML = '<div class="no-data"><p>Nenhum produto cadastrado para configurar links.</p></div>';
            return;
        }
        
        container.innerHTML = products.map(product => {
            const currentLink = paymentLinks[product.id] || '';
            
            return `
                <div class="payment-link-item" data-product-id="${product.id}">
                    <div class="payment-link-info">
                        <h4>${product.name}</h4>
                        <div class="payment-link">
                            <i class="fas fa-link"></i>
                            <input type="text" class="link-input" value="${currentLink}" 
                                   placeholder="https://suaplataforma.com/pagamento/${product.id}"
                                   data-product-id="${product.id}">
                        </div>
                    </div>
                    <div class="payment-link-actions">
                        <button class="btn btn-small" onclick="admin.testPaymentLink(${product.id})">
                            <i class="fas fa-external-link-alt"></i> Testar
                        </button>
                        <button class="btn btn-small btn-primary" onclick="admin.savePaymentLink(${product.id})">
                            <i class="fas fa-save"></i> Salvar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    savePaymentLink(productId) {
        const input = document.querySelector(`.link-input[data-product-id="${productId}"]`);
        const link = input.value.trim();
        
        if (!link) {
            this.showNotification('Insira um link válido!', 'error');
            return;
        }
        
        const paymentLinks = this.loadPaymentLinks();
        paymentLinks[productId] = link;
        this.savePaymentLinks(paymentLinks);
        
        this.showNotification('Link de pagamento salvo com sucesso!', 'success');
    }
    
    testPaymentLink(productId) {
        const paymentLinks = this.loadPaymentLinks();
        const link = paymentLinks[productId];
        
        if (!link) {
            this.showNotification('Nenhum link configurado para este produto!', 'error');
            return;
        }
        
        if (link.startsWith('http')) {
            window.open(link, '_blank');
        } else {
            this.showNotification('Link inválido! Certifique-se de que começa com http:// ou https://', 'error');
        }
    }
    
    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    setupSettings() {
        // Configurar botões de configurações
        document.getElementById('backupBtn').addEventListener('click', () => {
            this.createBackup();
        });
        
        document.getElementById('restoreBtn').addEventListener('click', () => {
            this.restoreBackup();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.showConfirm(
                'Limpar Todos os Dados',
                'ATENÇÃO: Esta ação irá remover TODOS os produtos, promoções e configurações. Esta ação não pode ser desfeita. Tem certeza?',
                () => {
                    localStorage.clear();
                    this.showNotification('Todos os dados foram removidos!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            );
        });
        
        // Atualizar informações do sistema
        this.updateSystemInfo();
    }
    
    updateSystemInfo() {
        const products = this.loadProducts();
        const promotions = this.loadPromotions();
        
        document.getElementById('systemProducts').textContent = products.length;
        document.getElementById('systemPromotions').textContent = promotions.length;
        
        const lastBackup = localStorage.getItem('lastBackup');
        document.getElementById('lastBackup').textContent = lastBackup ? 
            this.formatDate(lastBackup) : 'Nunca';
    }
    
    createBackup() {
        const backup = {
            products: this.loadProducts(),
            promotions: this.loadPromotions(),
            paymentLinks: this.loadPaymentLinks(),
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const backupStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `templateShop-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        localStorage.setItem('lastBackup', new Date().toISOString());
        this.updateSystemInfo();
        this.showNotification('Backup criado com sucesso!', 'success');
    }
    
    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // Validar backup
                    if (!backup.products || !backup.promotions || !backup.paymentLinks) {
                        throw new Error('Arquivo de backup inválido');
                    }
                    
                    this.showConfirm(
                        'Restaurar Backup',
                        'Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.',
                        () => {
                            this.saveProducts(backup.products);
                            this.savePromotions(backup.promotions);
                            this.savePaymentLinks(backup.paymentLinks);
                            
                            this.showNotification('Backup restaurado com sucesso!', 'success');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        }
                    );
                } catch (error) {
                    this.showNotification('Erro ao ler arquivo de backup!', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    exportData() {
        const data = {
            products: this.loadProducts(),
            promotions: this.loadPromotions(),
            paymentLinks: this.loadPaymentLinks()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `templateShop-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Dados exportados com sucesso!', 'success');
    }
    
    // ============================================
    // FUNÇÕES UTILITÁRIAS
    // ============================================
    updateStatus() {
        const products = this.loadProducts();
        const promotions = this.loadPromotions();
        
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('activePromotions').textContent = promotions.filter(p => p.active).length;
    }
    
    formatPrice(price) {
        return parseFloat(price).toFixed(2).replace('.', ',');
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatDateTimeLocal(date) {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    }
    
    getCategoryName(category) {
        const categories = {
            'portfolio': 'Portfólio',
            'landing': 'Landing Page',
            'blog': 'Blog',
            'negocio': 'Negócios'
        };
        return categories[category] || category;
    }
    
    generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    showConfirm(title, message, callback) {
        this.confirmCallback = callback;
        
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        const modal = document.getElementById('confirmModal');
        modal.classList.add('active');
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // ============================================
    // GERENCIAMENTO DE DADOS (localStorage)
    // ============================================
    loadProducts() {
        const stored = localStorage.getItem('templateShopProducts');
        return stored ? JSON.parse(stored) : [];
    }
    
    saveProducts(products) {
        localStorage.setItem('templateShopProducts', JSON.stringify(products));
    }
    
    loadPromotions() {
        const stored = localStorage.getItem('templateShopPromotions');
        return stored ? JSON.parse(stored) : [];
    }
    
    savePromotions(promotions) {
        localStorage.setItem('templateShopPromotions', JSON.stringify(promotions));
    }
    
    loadPaymentLinks() {
        const stored = localStorage.getItem('templateShopPaymentLinks');
        return stored ? JSON.parse(stored) : {};
    }
    
    savePaymentLinks(links) {
        localStorage.setItem('templateShopPaymentLinks', JSON.stringify(links));
    }
    
    // ============================================
    // CONFIGURAÇÃO DE EVENTOS
    // ============================================
    setupModals() {
        // Fechar modais ao clicar no X ou fora
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Fechar modais ao clicar fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Configurar botões de salvar
        document.getElementById('saveProductBtn').addEventListener('click', () => {
            this.saveProduct();
        });
        
        document.getElementById('savePromotionBtn').addEventListener('click', () => {
            this.savePromotion();
        });
        
        document.getElementById('confirmActionBtn').addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.confirmCallback = null;
            }
            this.closeModal('confirmModal');
        });
    }
    
    setupEvents() {
        // Configurar upload de imagem
        this.setupImageUpload();
        
        // Configurar colar imagem
        this.setupPasteImage();
        
        // Configurar salvar link ao pressionar Enter
        document.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('link-input') && e.key === 'Enter') {
                const productId = e.target.getAttribute('data-product-id');
                this.savePaymentLink(productId);
            }
        });
        
        // Configurar configurações
        this.setupSettings();
    }
    
    setupImageUpload() {
        const imageFile = document.getElementById('imageFile');
        const imagePreview = document.getElementById('imagePreview');
        const base64Input = document.getElementById('productImageBase64');
        const clearImageBtn = document.getElementById('clearImageBtn');
        
        imageFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                this.showNotification('Selecione apenas arquivos de imagem!', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                base64Input.value = e.target.result;
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        });
        
        clearImageBtn.addEventListener('click', () => {
            base64Input.value = '';
            imagePreview.innerHTML = `
                <i class="fas fa-image"></i>
                <span>Nenhuma imagem selecionada</span>
            `;
            imageFile.value = '';
        });
    }
    
    setupPasteImage() {
        const pasteImageBtn = document.getElementById('pasteImageBtn');
        const pasteModal = document.getElementById('pasteImageModal');
        const pasteInput = document.getElementById('pasteImageInput');
        const pastePreview = document.getElementById('pastePreview');
        const confirmPasteBtn = document.getElementById('confirmPasteBtn');
        
        pasteImageBtn.addEventListener('click', () => {
            pasteModal.classList.add('active');
            pasteInput.value = '';
            pastePreview.innerHTML = '<span>Preview da imagem aparecerá aqui</span>';
        });
        
        pasteInput.addEventListener('input', () => {
            const value = pasteInput.value.trim();
            
            if (value.startsWith('http')) {
                // É uma URL
                pastePreview.innerHTML = `
                    <img src="${value}" alt="Preview" onerror="this.style.display='none'; document.getElementById('pastePreview').innerHTML='<span>Erro ao carregar imagem da URL</span>'">
                `;
            } else if (value.startsWith('data:image')) {
                // É base64
                pastePreview.innerHTML = `<img src="${value}" alt="Preview">`;
            } else {
                pastePreview.innerHTML = '<span>Cole uma URL ou Base64 válida</span>';
            }
        });
        
        confirmPasteBtn.addEventListener('click', () => {
            const value = pasteInput.value.trim();
            
            if (!value) {
                this.showNotification('Insira uma URL ou Base64 válida!', 'error');
                return;
            }
            
            if (!value.startsWith('http') && !value.startsWith('data:image')) {
                this.showNotification('Formato inválido! Use uma URL de imagem ou Base64.', 'error');
                return;
            }
            
            document.getElementById('productImageBase64').value = value;
            document.getElementById('imagePreview').innerHTML = `<img src="${value}" alt="Preview">`;
            pasteModal.classList.remove('active');
            this.showNotification('Imagem inserida com sucesso!', 'success');
        });
    }
}

// Inicializar sistema de admin quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminSystem();
});