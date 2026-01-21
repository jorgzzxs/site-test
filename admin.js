/**
 * Script do painel administrativo do TemplateStore
 * Gerencia produtos e configurações do sistema
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let currentProductId = null;
let productImages = [];

// ============================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================

/**
 * Inicializa o painel administrativo
 */
function initAdminPanel() {
    // Verificar autenticação
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Inicializar componentes
    initNavigation();
    initProductModal();
    initImageUpload();
    initSettings();
    
    // Carregar dados iniciais
    loadStatistics();
    loadProductsTable();
    
    // Configurar eventos
    setupEventListeners();
    
    // Atualizar ano no rodapé
    updateCurrentYear();
    
    // Mostrar notificação de boas-vindas
    showNotification('Painel administrativo carregado com sucesso!', 'success');
}

/**
 * Verifica autenticação do administrador
 * @returns {boolean} True se autenticado
 */
function checkAuth() {
    // Verificar se há uma sessão ativa
    const session = localStorage.getItem('adminSession');
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        
        // Verificar se a sessão é válida e não expirou
        if (!sessionData.authenticated) return false;
        
        // Verificar expiração (24 horas)
        const sessionAge = Date.now() - sessionData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
        if (sessionAge > maxAge) {
            localStorage.removeItem('adminSession');
            return false;
        }
        
        return true;
    } catch {
        return false;
    }
}

/**
 * Inicializa a navegação entre seções
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Não processar logout aqui
            if (link.classList.contains('logout')) return;
            
            // Remover classe ativa de todos os links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Adicionar classe ativa ao link clicado
            link.classList.add('active');
            
            // Obter seção alvo
            const targetSection = link.dataset.section;
            
            // Esconder todas as seções
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Mostrar seção alvo
            const targetElement = document.getElementById(`${targetSection}-section`);
            if (targetElement) {
                targetElement.style.display = 'block';
            }
        });
    });
}

/**
 * Inicializa o modal de produto
 */
function initProductModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-form');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    
    // Fechar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeProductModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeProductModal();
        });
    }
    
    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', () => {
            resetSettingsForm();
        });
    }
    
    // Fechar ao clicar fora do modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProductModal();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeProductModal();
        }
    });
    
    // Configurar formulário
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }
}

/**
 * Inicializa o upload de imagens
 */
function initImageUpload() {
    const uploadArea = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('image-upload');
    
    if (!uploadArea || !fileInput) return;
    
    // Clicar na área de upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Alterar arquivo selecionado
    fileInput.addEventListener('change', handleImageUpload);
    
    // Arrastar e soltar
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleImageUpload();
        }
    });
}

/**
 * Inicializa as configurações
 */
function initSettings() {
    // Carregar configurações salvas
    loadSettings();
    
    // Configurar salvamento de configurações
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
}

/**
 * Configura os ouvintes de eventos
 */
function setupEventListeners() {
    // Botão para adicionar produto
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddProductModal);
    }
    
    // Botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Atualizar estatísticas periodicamente
    setInterval(loadStatistics, 30000); // A cada 30 segundos
    
    // Escutar atualizações de produtos
    window.addEventListener('productsUpdated', () => {
        loadStatistics();
        loadProductsTable();
    });
}

// ============================================
// FUNÇÕES DE PRODUTOS
// ============================================

/**
 * Carrega a tabela de produtos
 */
function loadProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;
    
    // Obter produtos
    const products = getProducts();
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    <i class="fas fa-box-open"></i>
                    <p>Nenhum produto cadastrado</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Adicionar produtos à tabela
    products.forEach(product => {
        const row = createProductTableRow(product);
        tableBody.appendChild(row);
    });
}

/**
 * Cria uma linha da tabela para um produto
 * @param {Object} product - Dados do produto
 * @returns {HTMLElement} Elemento da linha da tabela
 */
function createProductTableRow(product) {
    const row = document.createElement('tr');
    row.dataset.productId = product.id;
    
    // Imagem do produto
    const imageCell = document.createElement('td');
    const imageSrc = product.images && product.images.length > 0 
        ? product.images[0] 
        : getPlaceholderImage();
    
    imageCell.innerHTML = `
        <img src="${imageSrc}" alt="${product.name}" class="product-image-small"
             onerror="this.src='${getPlaceholderImage()}'">
    `;
    
    // Nome do produto
    const nameCell = document.createElement('td');
    nameCell.textContent = product.name;
    nameCell.style.fontWeight = '500';
    
    // Categoria
    const categoryCell = document.createElement('td');
    categoryCell.textContent = getCategoryName(product.category);
    
    // Preço
    const priceCell = document.createElement('td');
    priceCell.textContent = formatCurrency(product.price);
    
    // Status
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.textContent = getStatusName(product.status);
    statusBadge.className = `status-badge status-${product.status}`;
    statusCell.appendChild(statusBadge);
    
    // Ações
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    
    actionsCell.innerHTML = `
        <button class="action-btn edit" data-action="edit" data-product-id="${product.id}">
            <i class="fas fa-edit"></i> Editar
        </button>
        <button class="action-btn delete" data-action="delete" data-product-id="${product.id}">
            <i class="fas fa-trash"></i> Excluir
        </button>
    `;
    
    // Adicionar células à linha
    row.appendChild(imageCell);
    row.appendChild(nameCell);
    row.appendChild(categoryCell);
    row.appendChild(priceCell);
    row.appendChild(statusCell);
    row.appendChild(actionsCell);
    
    // Adicionar eventos aos botões de ação
    const editBtn = row.querySelector('[data-action="edit"]');
    const deleteBtn = row.querySelector('[data-action="delete"]');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => openEditProductModal(product.id));
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteProduct(product.id));
    }
    
    return row;
}

/**
 * Abre o modal para adicionar um novo produto
 */
function openAddProductModal() {
    currentProductId = null;
    productImages = [];
    
    // Atualizar título do modal
    document.getElementById('modal-title').textContent = 'Adicionar Novo Produto';
    
    // Limpar formulário
    resetProductForm();
    
    // Mostrar modal
    document.getElementById('product-modal').style.display = 'flex';
}

/**
 * Abre o modal para editar um produto existente
 * @param {number} productId - ID do produto
 */
function openEditProductModal(productId) {
    currentProductId = productId;
    
    // Obter produto
    const product = getProductById(productId);
    if (!product) {
        showNotification('Produto não encontrado', 'error');
        return;
    }
    
    // Atualizar título do modal
    document.getElementById('modal-title').textContent = 'Editar Produto';
    
    // Preencher formulário
    fillProductForm(product);
    
    // Mostrar modal
    document.getElementById('product-modal').style.display = 'flex';
}

/**
 * Preenche o formulário com dados do produto
 * @param {Object} product - Dados do produto
 */
function fillProductForm(product) {
    // Limpar imagens anteriores
    productImages = [...(product.images || [])];
    updateImagePreview();
    
    // Preencher campos do formulário
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-price').value = product.price.toFixed(2);
    document.getElementById('product-status').value = product.status || 'active';
    document.getElementById('product-short-desc').value = product.shortDescription || '';
    document.getElementById('product-full-desc').value = product.fullDescription || '';
    document.getElementById('product-payment-link').value = product.paymentLink || '';
    
    // Preencher características
    if (product.features && product.features.length > 0) {
        document.getElementById('product-features').value = product.features.join('\n');
    } else {
        document.getElementById('product-features').value = '';
    }
}

/**
 * Limpa o formulário de produto
 */
function resetProductForm() {
    productImages = [];
    updateImagePreview();
    
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-status').value = 'active';
    document.getElementById('image-upload').value = '';
}

/**
 * Fecha o modal de produto
 */
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    resetProductForm();
    currentProductId = null;
}

/**
 * Manipula o envio do formulário de produto
 * @param {Event} e - Evento de submit
 */
function handleProductFormSubmit(e) {
    e.preventDefault();
    
    // Validar formulário
    if (!validateProductForm()) {
        return;
    }
    
    // Coletar dados do formulário
    const productData = collectProductFormData();
    
    // Salvar produto
    if (currentProductId) {
        updateExistingProduct(productData);
    } else {
        createNewProduct(productData);
    }
}

/**
 * Valida o formulário de produto
 * @returns {boolean} True se válido
 */
function validateProductForm() {
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const shortDesc = document.getElementById('product-short-desc').value.trim();
    const fullDesc = document.getElementById('product-full-desc').value.trim();
    const paymentLink = document.getElementById('product-payment-link').value.trim();
    
    // Validar campos obrigatórios
    if (!name) {
        showNotification('O nome do produto é obrigatório', 'error');
        return false;
    }
    
    if (!category) {
        showNotification('A categoria é obrigatória', 'error');
        return false;
    }
    
    if (!price || parseFloat(price) <= 0) {
        showNotification('O preço deve ser maior que zero', 'error');
        return false;
    }
    
    if (!shortDesc) {
        showNotification('A descrição curta é obrigatória', 'error');
        return false;
    }
    
    if (!fullDesc) {
        showNotification('A descrição completa é obrigatória', 'error');
        return false;
    }
    
    if (!paymentLink) {
        showNotification('O link de pagamento é obrigatório', 'error');
        return false;
    }
    
    // Validar URL
    try {
        new URL(paymentLink);
    } catch {
        showNotification('O link de pagamento deve ser uma URL válida', 'error');
        return false;
    }
    
    return true;
}

/**
 * Coleta dados do formulário de produto
 * @returns {Object} Dados do produto
 */
function collectProductFormData() {
    return {
        name: document.getElementById('product-name').value.trim(),
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        status: document.getElementById('product-status').value,
        shortDescription: document.getElementById('product-short-desc').value.trim(),
        fullDescription: document.getElementById('product-full-desc').value.trim(),
        paymentLink: document.getElementById('product-payment-link').value.trim(),
        images: [...productImages],
        features: document.getElementById('product-features').value
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
    };
}

/**
 * Cria um novo produto
 * @param {Object} productData - Dados do produto
 */
function createNewProduct(productData) {
    try {
        // Em um sistema real, isso faria uma requisição para uma API
        // Aqui, estamos usando o localStorage
        addProduct(productData);
        
        showNotification('Produto criado com sucesso!', 'success');
        closeProductModal();
    } catch (error) {
        showNotification('Erro ao criar produto: ' + error.message, 'error');
    }
}

/**
 * Atualiza um produto existente
 * @param {Object} productData - Dados atualizados do produto
 */
function updateExistingProduct(productData) {
    try {
        // Em um sistema real, isso faria uma requisição para uma API
        updateProduct(currentProductId, productData);
        
        showNotification('Produto atualizado com sucesso!', 'success');
        closeProductModal();
    } catch (error) {
        showNotification('Erro ao atualizar produto: ' + error.message, 'error');
    }
}

/**
 * Exclui um produto
 * @param {number} productId - ID do produto
 */
function deleteProduct(productId) {
    // Confirmar exclusão
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }
    
    try {
        // Em um sistema real, isso faria uma requisição para uma API
        const success = deleteProductById(productId);
        
        if (success) {
            showNotification('Produto excluído com sucesso!', 'success');
            
            // Remover linha da tabela
            const row = document.querySelector(`tr[data-product-id="${productId}"]`);
            if (row) {
                row.remove();
            }
            
            // Atualizar estatísticas
            loadStatistics();
        } else {
            showNotification('Erro ao excluir produto', 'error');
        }
    } catch (error) {
        showNotification('Erro ao excluir produto: ' + error.message, 'error');
    }
}

// ============================================
// FUNÇÕES DE IMAGENS
// ============================================

/**
 * Manipula o upload de imagens
 */
function handleImageUpload() {
    const fileInput = document.getElementById('image-upload');
    const files = fileInput.files;
    
    if (!files || files.length === 0) return;
    
    // Processar cada arquivo
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            showNotification(`O arquivo "${file.name}" não é uma imagem`, 'error');
            continue;
        }
        
        // Validar tamanho (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            showNotification(`A imagem "${file.name}" é muito grande (máximo: 5MB)`, 'error');
            continue;
        }
        
        // Converter para URL de dados
        const reader = new FileReader();
        
        reader.onload = (e) => {
            productImages.push(e.target.result);
            updateImagePreview();
        };
        
        reader.onerror = () => {
            showNotification(`Erro ao ler a imagem "${file.name}"`, 'error');
        };
        
        reader.readAsDataURL(file);
    }
    
    // Limpar input de arquivo
    fileInput.value = '';
}

/**
 * Atualiza a prévia das imagens
 */
function updateImagePreview() {
    const previewContainer = document.getElementById('image-preview');
    if (!previewContainer) return;
    
    // Limpar prévia
    previewContainer.innerHTML = '';
    
    // Adicionar imagens
    productImages.forEach((image, index) => {
        const previewItem = document.createElement('div');
        previewItem.style.position = 'relative';
        previewItem.style.display = 'inline-block';
        previewItem.style.margin = '5px';
        
        previewItem.innerHTML = `
            <img src="${image}" alt="Prévia ${index + 1}" class="preview-image">
            <button type="button" class="remove-image" data-image-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        previewContainer.appendChild(previewItem);
    });
    
    // Adicionar eventos aos botões de remoção
    const removeButtons = previewContainer.querySelectorAll('.remove-image');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(button.dataset.imageIndex);
            removeImage(index);
        });
    });
}

/**
 * Remove uma imagem
 * @param {number} index - Índice da imagem
 */
function removeImage(index) {
    productImages.splice(index, 1);
    updateImagePreview();
}

// ============================================
// FUNÇÕES DE CONFIGURAÇÕES
// ============================================

/**
 * Carrega as configurações salvas
 */
function loadSettings() {
    // Carregar chave de acesso
    const adminKey = localStorage.getItem('adminAccessKey') || 'admin123';
    document.getElementById('admin-key').value = adminKey;
    
    // Carregar outras configurações do site
    const siteName = localStorage.getItem('siteName') || 'TemplateStore';
    document.getElementById('site-name').value = siteName;
    
    const contactEmail = localStorage.getItem('contactEmail') || 'suporte@templatestore.com';
    document.getElementById('contact-email').value = contactEmail;
}

/**
 * Salva as configurações
 */
function saveSettings() {
    // Obter valores
    const adminKey = document.getElementById('admin-key').value.trim();
    const siteName = document.getElementById('site-name').value.trim();
    const contactEmail = document.getElementById('contact-email').value.trim();
    
    // Validar
    if (!adminKey || adminKey.length < 4) {
        showNotification('A chave de acesso deve ter pelo menos 4 caracteres', 'error');
        return;
    }
    
    if (!siteName) {
        showNotification('O nome do site é obrigatório', 'error');
        return;
    }
    
    if (!contactEmail || !validateEmail(contactEmail)) {
        showNotification('E-mail de contato inválido', 'error');
        return;
    }
    
    // Salvar no localStorage
    localStorage.setItem('adminAccessKey', adminKey);
    localStorage.setItem('siteName', siteName);
    localStorage.setItem('contactEmail', contactEmail);
    
    showNotification('Configurações salvas com sucesso!', 'success');
}

/**
 * Reseta o formulário de configurações
 */
function resetSettingsForm() {
    loadSettings();
}

// ============================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================

/**
 * Carrega as estatísticas do painel
 */
function loadStatistics() {
    // Obter produtos
    const products = getProducts();
    const activeProducts = products.filter(p => p.status === 'active');
    
    // Atualizar estatísticas
    document.getElementById('total-products').textContent = activeProducts.length;
    document.getElementById('total-sales').textContent = calculateTotalSales();
    document.getElementById('total-revenue').textContent = formatCurrency(calculateTotalRevenue());
    document.getElementById('total-visitors').textContent = getVisitorCount();
}

/**
 * Calcula o total de vendas (simulado)
 * @returns {number} Total de vendas
 */
function calculateTotalSales() {
    // Em um sistema real, isso viria de um backend
    // Aqui, estamos simulando com base nos produtos
    const products = getProducts();
    return products.length * 3; // Simulação: 3 vendas por produto
}

/**
 * Calcula a receita total (simulado)
 * @returns {number} Receita total
 */
function calculateTotalRevenue() {
    const products = getProducts();
    const salesPerProduct = 3; // Simulação: 3 vendas por produto
    
    return products.reduce((total, product) => {
        return total + (product.price * salesPerProduct);
    }, 0);
}

/**
 * Obtém a contagem de visitantes (simulado)
 * @returns {number} Contagem de visitantes
 */
function getVisitorCount() {
    // Em um sistema real, isso viria de analytics
    // Aqui, estamos usando um valor armazenado no localStorage
    let visitors = localStorage.getItem('visitorCount');
    
    if (!visitors) {
        // Valor inicial baseado na data
        const baseDate = new Date('2024-01-01');
        const today = new Date();
        const daysDiff = Math.floor((today - baseDate) / (1000 * 60 * 60 * 24));
        visitors = 1000 + (daysDiff * 50); // Crescimento simulado
        localStorage.setItem('visitorCount', visitors);
    }
    
    return parseInt(visitors);
}

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================

/**
 * Mostra uma notificação
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo da notificação (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    // Remover notificações anteriores
    const existingNotifications = document.querySelectorAll('.admin-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Criar elemento da notificação
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    // Cores por tipo
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Adicionar ao corpo
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
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
 * Valida um email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Obtém o nome de uma categoria
 * @param {string} categoryKey - Chave da categoria
 * @returns {string} Nome da categoria
 */
function getCategoryName(categoryKey) {
    const categories = {
        'landing': 'Landing Page',
        'ecommerce': 'E-commerce',
        'portfolio': 'Portfólio',
        'blog': 'Blog',
        'business': 'Negócios',
        'creative': 'Criativo'
    };
    
    return categories[categoryKey] || categoryKey || 'Geral';
}

/**
 * Obtém o nome de um status
 * @param {string} statusKey - Chave do status
 * @returns {string} Nome do status
 */
function getStatusName(statusKey) {
    const statuses = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'draft': 'Rascunho'
    };
    
    return statuses[statusKey] || statusKey;
}

/**
 * Retorna uma imagem placeholder
 * @returns {string} URL da imagem placeholder
 */
function getPlaceholderImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmNWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJQb3BwaW5zIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIj5JbWFnZW0gZG8gUHJvZHV0bzwvdGV4dD48L3N2Zz4K';
}

/**
 * Atualiza o ano atual no rodapé
 */
function updateCurrentYear() {
    const yearElements = document.querySelectorAll('#current-year');
    yearElements.forEach(element => {
        element.textContent = new Date().getFullYear();
    });
}

/**
 * Manipula o logout
 */
function handleLogout() {
    if (confirm('Tem certeza que deseja sair do painel administrativo?')) {
        localStorage.removeItem('adminSession');
        window.location.href = 'login.html';
    }
}

// ============================================
// FUNÇÕES DE DADOS (simulação de API)
// ============================================

/**
 * Obtém todos os produtos
 * @returns {Array} Lista de produtos
 */
function getProducts() {
    try {
        const products = JSON.parse(localStorage.getItem('templateStoreProducts')) || [];
        return products;
    } catch {
        return [];
    }
}

/**
 * Obtém um produto por ID
 * @param {number} id - ID do produto
 * @returns {Object|null} Produto ou null
 */
function getProductById(id) {
    const products = getProducts();
    return products.find(product => product.id === id) || null;
}

/**
 * Adiciona um novo produto
 * @param {Object} productData - Dados do produto
 * @returns {Object} Produto criado
 */
function addProduct(productData) {
    const products = getProducts();
    
    // Gerar novo ID
    const newId = products.length > 0 
        ? Math.max(...products.map(p => p.id)) + 1 
        : 1;
    
    // Criar produto
    const newProduct = {
        id: newId,
        name: productData.name,
        shortDescription: productData.shortDescription,
        fullDescription: productData.fullDescription,
        price: productData.price,
        category: productData.category,
        images: productData.images || [],
        paymentLink: productData.paymentLink,
        features: productData.features || [],
        rating: 4.5,
        reviewCount: 0,
        isNew: true,
        isPopular: false,
        status: productData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Adicionar à lista
    products.push(newProduct);
    
    // Salvar
    localStorage.setItem('templateStoreProducts', JSON.stringify(products));
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('productsUpdated'));
    
    return newProduct;
}

/**
 * Atualiza um produto existente
 * @param {number} id - ID do produto
 * @param {Object} productData - Dados atualizados
 * @returns {Object} Produto atualizado
 */
function updateProduct(id, productData) {
    let products = getProducts();
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) {
        throw new Error('Produto não encontrado');
    }
    
    // Atualizar produto
    products[index] = {
        ...products[index],
        ...productData,
        id: id, // Garantir que o ID não mude
        updatedAt: new Date().toISOString()
    };
    
    // Salvar
    localStorage.setItem('templateStoreProducts', JSON.stringify(products));
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('productsUpdated'));
    
    return products[index];
}

/**
 * Exclui um produto
 * @param {number} id - ID do produto
 * @returns {boolean} True se excluído com sucesso
 */
function deleteProductById(id) {
    let products = getProducts();
    const initialLength = products.length;
    
    // Filtrar produto
    products = products.filter(product => product.id !== id);
    
    if (products.length < initialLength) {
        // Salvar
        localStorage.setItem('templateStoreProducts', JSON.stringify(products));
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('productsUpdated'));
        
        return true;
    }
    
    return false;
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initAdminPanel);