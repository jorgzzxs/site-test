/**
 * Arquivo de dados dos produtos
 * Contém a lista de produtos e funções para gerenciá-los
 */

// Lista de produtos (dados iniciais)
let products = JSON.parse(localStorage.getItem('templateStoreProducts')) || [
    {
        id: 1,
        name: "Template Moderno para Negócios",
        shortDescription: "Design limpo e profissional para empresas que buscam destaque online.",
        fullDescription: "Este template moderno oferece um design limpo e profissional ideal para empresas que desejam se destacar online. Com layout responsivo, otimização para SEO e código bem estruturado, é perfeito para apresentar seus serviços de forma elegante.",
        price: 149.90,
        category: "business",
        images: [
            "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        paymentLink: "https://exemplo.com/comprar/template-1",
        features: [
            "Design 100% responsivo",
            "Código limpo e comentado",
            "Otimizado para SEO",
            "Compatível com todos os navegadores",
            "Fácil personalização"
        ],
        rating: 4.8,
        reviewCount: 15,
        isNew: true,
        isPopular: true,
        status: "active"
    },
    {
        id: 2,
        name: "Template de E-commerce Completo",
        shortDescription: "Loja virtual completa com carrinho de compras e integração de pagamentos.",
        fullDescription: "Template completo para loja virtual com todas as funcionalidades necessárias: catálogo de produtos, carrinho de compras, página de checkout e integração com gateways de pagamento. Design moderno e intuitivo para maximizar conversões.",
        price: 299.90,
        category: "ecommerce",
        images: [
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
        ],
        paymentLink: "https://exemplo.com/comprar/template-2",
        features: [
            "Carrinho de compras funcional",
            "Páginas de produto e checkout",
            "Integração com gateways de pagamento",
            "Dashboard administrativo",
            "Gestão de inventário"
        ],
        rating: 4.9,
        reviewCount: 23,
        isNew: false,
        isPopular: true,
        status: "active"
    },
    {
        id: 3,
        name: "Template para Portfólio Criativo",
        shortDescription: "Apresente seu trabalho de forma impressionante com este template visual.",
        fullDescription: "Template ideal para criativos que desejam mostrar seu trabalho de forma impactante. Com galeria de projetos, animações sutis e design que prioriza o conteúdo visual, perfeito para designers, fotógrafos e artistas.",
        price: 179.90,
        category: "portfolio",
        images: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
        ],
        paymentLink: "https://exemplo.com/comprar/template-3",
        features: [
            "Galeria de projetos",
            "Design visual impressionante",
            "Animações CSS3",
            "Blog integrado",
            "Formulário de contato"
        ],
        rating: 4.7,
        reviewCount: 9,
        isNew: true,
        isPopular: false,
        status: "active"
    },
    {
        id: 4,
        name: "Template para Blog Moderno",
        shortDescription: "Plataforma de blog com design elegante e funcionalidades avançadas.",
        fullDescription: "Template especializado para blogs com design elegante, sistema de comentários, categorias, tags e otimização para leitura. Perfeito para escritores, jornalistas e especialistas que desejam compartilhar conteúdo de qualidade.",
        price: 129.90,
        category: "blog",
        images: [
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
        ],
        paymentLink: "https://exemplo.com/comprar/template-4",
        features: [
            "Sistema de comentários",
            "Organização por categorias e tags",
            "Pesquisa de conteúdo",
            "Design otimizado para leitura",
            "Integração com redes sociais"
        ],
        rating: 4.5,
        reviewCount: 11,
        isNew: false,
        isPopular: true,
        status: "active"
    },
    {
        id: 5,
        name: "Template de Landing Page para SaaS",
        shortDescription: "Página de vendas otimizada para conversão de produtos digitais e SaaS.",
        fullDescription: "Landing page projetada especificamente para produtos SaaS e digitais. Com elementos de conversão estrategicamente posicionados, testimonials, tabela de preços e call-to-action claros para maximizar conversões.",
        price: 199.90,
        category: "landing",
        images: [
            "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
        ],
        paymentLink: "https://exemplo.com/comprar/template-5",
        features: [
            "Foco máximo em conversão",
            "Elementos de prova social",
            "Tabela de preços comparativa",
            "Formulário de captura otimizado",
            "Design baseado em princípios de UX"
        ],
        rating: 4.8,
        reviewCount: 18,
        isNew: false,
        isPopular: true,
        status: "active"
    },
    {
        id: 6,
        name: "Template para Agência Digital",
        shortDescription: "Site profissional para agências de marketing e desenvolvimento web.",
        fullDescription: "Template completo para agências digitais que desejam apresentar seus serviços de forma profissional. Inclui seções para portfólio, serviços, equipe, depoimentos e formulário de contato. Design moderno que transmite confiança e expertise.",
        price: 249.90,
        category: "business",
        images: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
        ],
        paymentLink: "https://exemplo.com/comprar/template-6",
        features: [
            "Apresentação de serviços",
            "Portfólio de cases",
            "Apresentação da equipe",
            "Depoimentos de clientes",
            "Formulário de orçamento"
        ],
        rating: 4.6,
        reviewCount: 7,
        isNew: true,
        isPopular: false,
        status: "active"
    }
];

// Chave de acesso administrativo padrão
const DEFAULT_ADMIN_KEY = "admin123";

/**
 * Salva os produtos no localStorage
 */
function saveProducts() {
    localStorage.setItem('templateStoreProducts', JSON.stringify(products));
    // Disparar evento personalizado para notificar outras partes do sistema
    window.dispatchEvent(new CustomEvent('productsUpdated'));
}

/**
 * Obtém todos os produtos ativos
 * @returns {Array} Lista de produtos ativos
 */
function getActiveProducts() {
    return products.filter(product => product.status === 'active');
}

/**
 * Obtém um produto por ID
 * @param {number} id - ID do produto
 * @returns {Object|null} Produto encontrado ou null
 */
function getProductById(id) {
    return products.find(product => product.id === id) || null;
}

/**
 * Adiciona um novo produto
 * @param {Object} productData - Dados do produto
 * @returns {Object} Produto criado com ID
 */
function addProduct(productData) {
    // Gerar novo ID
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    // Criar objeto do produto
    const newProduct = {
        id: newId,
        name: productData.name,
        shortDescription: productData.shortDescription,
        fullDescription: productData.fullDescription,
        price: parseFloat(productData.price),
        category: productData.category,
        images: productData.images || [],
        paymentLink: productData.paymentLink,
        features: productData.features || [],
        rating: productData.rating || 4.5,
        reviewCount: productData.reviewCount || 0,
        isNew: productData.isNew || true,
        isPopular: productData.isPopular || false,
        status: productData.status || 'active'
    };
    
    // Adicionar à lista
    products.push(newProduct);
    
    // Salvar no localStorage
    saveProducts();
    
    return newProduct;
}

/**
 * Atualiza um produto existente
 * @param {number} id - ID do produto
 * @param {Object} productData - Dados atualizados do produto
 * @returns {Object|null} Produto atualizado ou null se não encontrado
 */
function updateProduct(id, productData) {
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) {
        return null;
    }
    
    // Atualizar produto
    products[index] = {
        ...products[index],
        ...productData,
        id: id, // Garantir que o ID não seja alterado
        price: parseFloat(productData.price)
    };
    
    // Salvar no localStorage
    saveProducts();
    
    return products[index];
}

/**
 * Remove um produto
 * @param {number} id - ID do produto
 * @returns {boolean} True se removido com sucesso
 */
function deleteProduct(id) {
    const initialLength = products.length;
    products = products.filter(product => product.id !== id);
    
    if (products.length < initialLength) {
        saveProducts();
        return true;
    }
    
    return false;
}

/**
 * Filtra produtos por categoria
 * @param {string} category - Categoria para filtrar
 * @returns {Array} Produtos da categoria especificada
 */
function getProductsByCategory(category) {
    if (category === 'all') {
        return getActiveProducts();
    }
    
    return getActiveProducts().filter(product => product.category === category);
}

/**
 * Busca produtos por termo
 * @param {string} term - Termo de busca
 * @returns {Array} Produtos que correspondem ao termo
 */
function searchProducts(term) {
    if (!term) {
        return getActiveProducts();
    }
    
    const searchTerm = term.toLowerCase();
    return getActiveProducts().filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.shortDescription.toLowerCase().includes(searchTerm) ||
        product.fullDescription.toLowerCase().includes(searchTerm) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
    );
}

/**
 * Obtém produtos em destaque (novos e populares)
 * @param {number} limit - Número máximo de produtos a retornar
 * @returns {Array} Produtos em destaque
 */
function getFeaturedProducts(limit = 3) {
    const featured = getActiveProducts().filter(product => product.isNew || product.isPopular);
    
    // Ordenar: primeiro novos, depois populares, depois por ID (mais recentes primeiro)
    featured.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return b.id - a.id;
    });
    
    return featured.slice(0, limit);
}

// Inicializar dados se não existirem
if (!localStorage.getItem('templateStoreProducts')) {
    saveProducts();
}

// Configurar chave de acesso administrativo se não existir
if (!localStorage.getItem('adminAccessKey')) {
    localStorage.setItem('adminAccessKey', DEFAULT_ADMIN_KEY);
}

// Exportar funções para uso global
window.productsData = {
    products,
    getActiveProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    searchProducts,
    getFeaturedProducts,
    saveProducts
};