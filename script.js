// ATUALIZADO: Importando funções de Storage e WriteBatch
import { 
    auth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    db,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    where,
    onSnapshot,
    writeBatch, 
    storage, 
    ref,       
    uploadBytes, 
    getDownloadURL 
} from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    
    console.log("DOM carregado. Pronto para começar!");

    // --- VARIÁVEIS DE CONTROLE ---
    let currentUser = null; 
    let editingClientId = null;
    let editingProductId = null;
    let editingServiceId = null;
    let editingOrderId = null;
    let editingSaleId = null; 
    let currentOsImageUrls = { entrada: [], saida: [] }; 
    let currentReportData = { head: [], body: [], title: "" }; 

    // --- VARIÁVEIS DE LISTENERS (para parar de ouvir) ---
    let unsubscribeClients = () => {};
    let unsubscribeProducts = () => {};
    let unsubscribeServices = () => {};
    let unsubscribeOrders = () => {};
    let unsubscribeSales = () => {};
    let unsubscribeLancamentos = () => {};
    let unsubscribeCategorias = () => {};

    // --- Seletores de Autenticação ---
    const loginModal = document.getElementById('login-modal');
    const loginBox = document.querySelector('.login-box');
    const loginHeaderBtn = document.getElementById('login-header-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const profileInfo = document.getElementById('profile-info');
    const userNameDisplay = document.getElementById('user-name-display');
    const logoutBtn = document.getElementById('logout-btn');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const resetView = document.getElementById('reset-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-form');
    const loginErrorMessage = document.getElementById('login-error-message');
    const registerErrorMessage = document.getElementById('register-error-message');
    const passwordRequirements = document.getElementById('password-requirements');
    const resetSuccessMessage = document.getElementById('reset-success-message');
    const resetErrorMessage = document.getElementById('reset-error-message');
    const showRegisterLink = document.getElementById('show-register-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const showLoginLinkFromRegister = document.getElementById('show-login-link-from-register');
    const showLoginLinkFromReset = document.getElementById('show-login-link-from-reset');

    // --- Seletores da Aplicação ---
    const sidebar = document.querySelector('aside');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const mainSections = document.querySelectorAll('main section');

    // --- Seletores dos Atalhos do Dashboard ---
    const dashClientesBtn = document.getElementById('dash-clientes-btn');
    const dashProdutosBtn = document.getElementById('dash-produtos-btn');
    const dashServicosBtn = document.getElementById('dash-servicos-btn');
    const dashOrdensBtn = document.getElementById('dash-ordens-btn');
    const dashVendasBtn = document.getElementById('dash-vendas-btn');
    const dashLancamentosBtn = document.getElementById('dash-lancamentos-btn');

    // --- Seletores dos Menus (para simular clique) ---
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuClientes = document.getElementById('menu-clientes');
    const menuProdutos = document.getElementById('menu-produtos');
    const menuServicos = document.getElementById('menu-servicos');
    const menuOrdens = document.getElementById('menu-ordens');
    const menuVendas = document.getElementById('menu-vendas');
    const menuLancamentos = document.getElementById('menu-lancamentos');
    const menuRelatorios = document.getElementById('menu-relatorios'); 

    // --- Seletores Modais GERAL ---
    const addClientBtn = document.getElementById('add-client-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    const addServiceBtn = document.getElementById('add-service-btn');
    const addOsBtn = document.getElementById('add-os-btn');
    const addVendaBtn = document.getElementById('add-venda-btn');
    
    // --- Seletores Modal Cliente ---
    const clientModal = document.getElementById('add-client-modal');
    const closeClientModalBtn = document.getElementById('close-client-modal-btn');
    const cancelClientModalBtn = document.getElementById('cancel-client-modal-btn');
    const addClientForm = document.getElementById('add-client-form');
    const clientModalTitle = document.getElementById('client-modal-title');
    const clientTableBody = document.getElementById('client-table-body');

    // --- Seletores Modal Produto ---
    const productModal = document.getElementById('add-product-modal');
    const closeProductModalBtn = document.getElementById('close-product-modal-btn');
    const cancelProductModalBtn = document.getElementById('cancel-product-modal-btn');
    const addProductForm = document.getElementById('add-product-form');
    const productModalTitle = document.getElementById('product-modal-title');
    const productTableBody = document.getElementById('product-table-body');
    const productIsinsumo = document.getElementById('product-is-insumo');

    // --- Seletores Modal Serviço ---
    const serviceModal = document.getElementById('add-service-modal');
    const closeServiceModalBtn = document.getElementById('close-service-modal-btn');
    const cancelServiceModalBtn = document.getElementById('cancel-service-modal-btn');
    const addServiceForm = document.getElementById('add-service-form');
    const serviceModalTitle = document.getElementById('service-modal-title');
    const serviceTableBody = document.getElementById('service-table-body');
    
    // --- Seletores Modal OS ---
    const osModal = document.getElementById('add-os-modal');
    const closeOsModalBtn = document.getElementById('close-os-modal-btn');
    const cancelOsModalBtn = document.getElementById('cancel-os-modal-btn');
    const addOsForm = document.getElementById('add-os-form');
    const osModalTitle = document.getElementById('os-modal-title');
    const osTableBody = document.getElementById('os-table-body');
    const osClientSelect = document.getElementById('os-client');
    const osItensContainer = document.getElementById('os-itens-container');
    const osAddProdutoBtn = document.getElementById('os-add-produto');
    const osAddServicoBtn = document.getElementById('os-add-servico');
    const osProdutosSelect = document.getElementById('os-produtos-select');
    const osServicosSelect = document.getElementById('os-servicos-select');
    const osValorTotalInput = document.getElementById('os-valor-total');
    const osItensServicosContainer = document.getElementById('os-itens-servicos-container');
    const osDataSaida = document.getElementById('os-data-saida');
    const osImagensEntrada = document.getElementById('os-imagens-entrada');
    const osImagensEntradaPreview = document.getElementById('os-imagens-entrada-preview');
    const osImagensSaida = document.getElementById('os-imagens-saida');
    const osImagensSaidaPreview = document.getElementById('os-imagens-saida-preview');
    // (Seletores de NFe e Garantia pegos direto na função)

    // --- Seletores Modal Venda ---
    const vendaModal = document.getElementById('add-venda-modal');
    const closeVendaModalBtn = document.getElementById('close-venda-modal-btn');
    const cancelVendaModalBtn = document.getElementById('cancel-venda-modal-btn');
    const addVendaForm = document.getElementById('add-venda-form');
    const vendaModalTitle = document.getElementById('venda-modal-title');
    const vendaTableBody = document.getElementById('venda-table-body');
    const vendaClienteSelect = document.getElementById('venda-cliente');
    const vendaItensContainer = document.getElementById('venda-itens-container');
    const vendaAddProdutoBtn = document.getElementById('venda-add-produto');
    const vendaProdutosSelect = document.getElementById('venda-produtos-select');
    const vendaValorTotalInput = document.getElementById('venda-valor-total');
    
    // --- Seletores Modal Lançamentos ---
    const addLancamentoInsideBtn = document.getElementById('add-lancamento-inside-btn');
    const lancamentoModal = document.getElementById('add-lancamento-modal');
    const closeLancamentoModalBtn = document.getElementById('close-lancamento-modal-btn');
    const cancelLancamentoModalBtn = document.getElementById('cancel-lancamento-modal-btn');
    const addLancamentoForm = document.getElementById('add-lancamento-form');
    const lancamentosTableBody = document.getElementById('lancamentos-table-body');
    const lancamentoCategoriaSelect = document.getElementById('lancamento-categoria'); 
    const addCategoriaShortcutBtn = document.getElementById('add-categoria-shortcut-btn'); 

    // --- Seletores Configurações ---
    const configContaBtn = document.getElementById('config-conta-btn');
    const configLojaBtn = document.getElementById('config-loja-btn');
    const configContaModal = document.getElementById('config-conta-modal');
    const closeConfigContaBtn = document.getElementById('close-config-conta-btn');
    const cancelConfigContaBtn = document.getElementById('cancel-config-conta-btn');
    const configContaForm = document.getElementById('config-conta-form');
    const configLojaModal = document.getElementById('config-loja-modal');
    const closeConfigLojaBtn = document.getElementById('close-config-loja-btn');
    const cancelConfigLojaBtn = document.getElementById('cancel-config-loja-btn');
    const configLojaForm = document.getElementById('config-loja-form');
    const configImpressaoBtn = document.getElementById('config-impressao-btn');
    const configImpressaoModal = document.getElementById('config-impressao-modal');
    const closeConfigImpressaoBtn = document.getElementById('close-config-impressao-btn');
    const cancelConfigImpressaoBtn = document.getElementById('cancel-config-impressao-btn');
    const configImpressaoForm = document.getElementById('config-impressao-form');
    const configLayoutBtn = document.getElementById('config-layout-btn');
    const configLayoutModal = document.getElementById('config-layout-modal');
    const closeConfigLayoutBtn = document.getElementById('close-config-layout-btn');
    const cancelConfigLayoutBtn = document.getElementById('cancel-config-layout-btn');
    const configLayoutForm = document.getElementById('config-layout-form');
    const configCategoriasBtn = document.getElementById('config-categorias-btn');
    const configCategoriasModal = document.getElementById('config-categorias-modal');
    const closeConfigCategoriasBtn = document.getElementById('close-config-categorias-btn');
    const cancelConfigCategoriasBtn = document.getElementById('cancel-config-categorias-btn');
    const addCategoriaForm = document.getElementById('add-categoria-form');
    const categoriaNameInput = document.getElementById('categoria-name');
    const categoryListContainer = document.getElementById('category-list');

    // --- SELETORES (Relatórios) ---
    const reportDataInicio = document.getElementById('report-data-inicio');
    const reportDataFim = document.getElementById('report-data-fim');
    const gerarRelatorioBtn = document.getElementById('gerar-relatorio-btn');
    const relatorioVendasBtn = document.getElementById('relatorio-vendas-btn');
    const relatorioServicosBtn = document.getElementById('relatorio-servicos-btn');
    const reportDisplayArea = document.getElementById('report-display-area');
    const reportTitle = document.getElementById('report-title');
    const reportTableHead = document.getElementById('report-table-head');
    const reportTableBody = document.getElementById('report-table-body');
    const exportPdfBtn = document.getElementById('export-pdf-btn'); 

    // --- SELETORES (Modal de Detalhes) ---
    const detailsModal = document.getElementById('details-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
    const cancelDetailsModalBtn = document.getElementById('cancel-details-modal-btn');
    const detailsModalTitle = document.getElementById('details-modal-title');
    const detailsModalBody = document.getElementById('details-modal-body');


    // --- FUNÇÕES GERAIS DE CARREGAMENTO (LOADERS) ---
    
    function stopAllListeners() {
        if (typeof unsubscribeClients === 'function') unsubscribeClients();
        if (typeof unsubscribeProducts === 'function') unsubscribeProducts();
        if (typeof unsubscribeServices === 'function') unsubscribeServices();
        if (typeof unsubscribeOrders === 'function') unsubscribeOrders();
        if (typeof unsubscribeSales === 'function') unsubscribeSales();
        if (typeof unsubscribeLancamentos === 'function') unsubscribeLancamentos();
        if (typeof unsubscribeCategorias === 'function') unsubscribeCategorias(); 
    }
    
    function formatCurrency(value) {
        if (typeof value !== 'number') {
            value = parseFloat(value) || 0;
        }
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const [year, month, day] = dateString.split('-');
            if (!year || !month || !day) return dateString; 
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.warn("Erro ao formatar data:", dateString, e);
            return dateString;
        }
    }


    // --- LÓGICA DE AUTENTICAÇÃO ---
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user; 
            console.log("Usuário logado:", user.email);
            if (profileInfo) profileInfo.classList.remove('hidden');
            if (loginHeaderBtn) loginHeaderBtn.classList.add('hidden');
            if (userNameDisplay) userNameDisplay.textContent = user.email.split('@')[0];
            if (loginModal) loginModal.classList.add('hidden');
            
            stopAllListeners(); 
            
            loadClients();
            loadProducts();
            loadServices();
            loadOrders();
            loadSales();
            loadLancamentos();
            loadCategorias(); 
            loadConfigLoja(); 
            loadConfigImpressao();
            loadConfigLayout(); 

        } else {
            currentUser = null;
            console.log("Usuário deslogado.");
            if (profileInfo) profileInfo.classList.add('hidden');
            if (loginHeaderBtn) loginHeaderBtn.classList.remove('hidden');
            if (userNameDisplay) userNameDisplay.textContent = "Usuário";
            
            stopAllListeners(); 
            
            // Limpa tabelas
            if (clientTableBody) clientTableBody.innerHTML = '<tr><td colspan="5">Faça login para ver os clientes.</td></tr>';
            if (productTableBody) productTableBody.innerHTML = '<tr><td colspan="5">Faça login para ver os produtos.</td></tr>';
            if (serviceTableBody) serviceTableBody.innerHTML = '<tr><td colspan="3">Faça login para ver os serviços.</td></tr>';
            if (osTableBody) osTableBody.innerHTML = '<tr><td colspan="7">Faça login para ver as ordens.</td></tr>';
            if (vendaTableBody) vendaTableBody.innerHTML = '<tr><td colspan="5">Faça login para ver as vendas.</td></tr>';
            if (lancamentosTableBody) lancamentosTableBody.innerHTML = '<tr><td colspan="4">Faça login para ver os lançamentos.</td></tr>';
            
            // Limpa dados de config
            if (lancamentoCategoriaSelect) lancamentoCategoriaSelect.innerHTML = '<option value="">Carregue categorias...</option>';
            if (categoryListContainer) categoryListContainer.innerHTML = '<p class="text-muted">Faça login para ver as categorias.</p>';
        }
    });

    if (loginHeaderBtn) {
        loginHeaderBtn.addEventListener('click', () => {
            if (loginModal) loginModal.classList.remove('hidden');
            if (loginBox) loginBox.classList.remove('is-register-view', 'is-reset-view');
            [loginErrorMessage, registerErrorMessage, resetSuccessMessage, resetErrorMessage, passwordRequirements].forEach(el => {
                if(el) el.classList.add('hidden');
            });
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).catch((error) => console.error("Erro ao fazer logout:", error));
        });
    }

    // --- Navegação da Modal de Login ---
    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loginBox.classList.add('is-register-view'); loginBox.classList.remove('is-reset-view'); });
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); loginBox.classList.add('is-reset-view'); loginBox.classList.remove('is-register-view'); });
    if (showLoginLinkFromRegister) showLoginLinkFromRegister.addEventListener('click', (e) => { e.preventDefault(); loginBox.classList.remove('is-register-view'); });
    if (showLoginLinkFromReset) showLoginLinkFromReset.addEventListener('click', (e) => { e.preventDefault(); loginBox.classList.remove('is-reset-view'); });

    // --- Lógica dos Formulários de Auth ---

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginErrorMessage.classList.add('hidden');
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            signInWithEmailAndPassword(auth, email, password)
                .catch((error) => {
                    console.error("Erro no login:", error.message);
                    loginErrorMessage.classList.remove('hidden');
                });
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .catch((error) => {
                    console.error("Erro no login com Google:", error.message);
                    alert("Erro ao logar com Google: " + error.message);
                });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerErrorMessage.classList.add('hidden');
            passwordRequirements.classList.add('hidden');

            const email = document.getElementById('register-email').value;
            const pass1 = document.getElementById('register-password').value;
            const pass2 = document.getElementById('register-confirm-password').value;

            if (pass1 !== pass2) {
                registerErrorMessage.innerText = "As senhas não conferem.";
                registerErrorMessage.classList.remove('hidden');
                return;
            }
            
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passRegex.test(pass1)) {
                registerErrorMessage.innerText = "A senha não atende aos requisitos.";
                registerErrorMessage.classList.remove('hidden');
                passwordRequirements.classList.remove('hidden');
                return;
            }

            createUserWithEmailAndPassword(auth, email, pass1)
                .catch((error) => {
                    console.error("Erro ao criar conta:", error.message);
                    if (error.code === 'auth/email-already-in-use') {
                        registerErrorMessage.innerText = "Este email já está em uso.";
                    } else {
                        registerErrorMessage.innerText = "Erro ao criar conta.";
                    }
                    registerErrorMessage.classList.remove('hidden');
                });
        });
    }

    if (resetForm) {
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            resetSuccessMessage.classList.add('hidden');
            resetErrorMessage.classList.add('hidden');
            const email = document.getElementById('reset-email').value;

            sendPasswordResetEmail(auth, email)
                .then(() => {
                    resetSuccessMessage.classList.remove('hidden');
                })
                .catch((error) => {
                    console.error("Erro ao enviar email:", error.message);
                    if (error.code === 'auth/user-not-found') {
                        resetErrorMessage.innerText = "Este email não foi encontrado.";
                    } else {
                        resetErrorMessage.innerText = "Erro ao enviar email.";
                    }
                    resetErrorMessage.classList.remove('hidden');
                });
        });
    }


    // --- Lógica da Sidebar Mobile ---
    if (menuBtn) { menuBtn.addEventListener('click', () => sidebar.classList.add('show')); }
    if (closeBtn) { closeBtn.addEventListener('click', () => sidebar.classList.remove('show')); }

    // --- Lógica de Navegação (SPA) ---
    const sectionMapping = {
        'menu-dashboard': 'dashboard-section',
        'menu-clientes': 'clientes-section',
        'menu-produtos': 'produtos-section',
        'menu-servicos': 'servicos-section',
        'menu-ordens': 'ordens-section',
        'menu-vendas': 'vendas-section',
        'menu-lancamentos': 'lancamentos-section',
        'menu-relatorios': 'relatorios-section', 
        'menu-assinatura': 'assinatura-section',
        'menu-config': 'config-section'
    };
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = sectionMapping[link.id];
            
            if (link.id === 'logout-btn') return; 

            if (targetSectionId) {
                mainSections.forEach(section => section.classList.add('hidden'));
                sidebarLinks.forEach(s_link => s_link.classList.remove('active'));
                
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) targetSection.classList.remove('hidden');
                
                link.classList.add('active');
                sidebar.classList.remove('show');
            }
        });
    });

    // --- Lógica dos Atalhos do Dashboard ---
    function addDashboardLink(button, menuLink) {
        if (button && menuLink) {
            button.addEventListener('click', () => menuLink.click());
        }
    }
    addDashboardLink(dashClientesBtn, menuClientes);
    addDashboardLink(dashProdutosBtn, menuProdutos);
    addDashboardLink(dashServicosBtn, menuServicos);
    addDashboardLink(dashOrdensBtn, menuOrdens);
    addDashboardLink(dashVendasBtn, menuVendas);
    addDashboardLink(dashLancamentosBtn, menuLancamentos);
    
    
    // --- LÓGICA DE CLIENTES (CRUD) ---

    function openClientModal(clientId = null) {
        addClientForm.reset();
        editingClientId = clientId;
        if (clientId) {
            clientModalTitle.textContent = "Editar Cliente";
            const clientRef = doc(db, 'usuarios', currentUser.uid, 'clientes', clientId);
            getDoc(clientRef).then(docSnap => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById('client-name').value = data.nome;
                    document.getElementById('client-email').value = data.email || '';
                    document.getElementById('client-phone').value = data.telefone;
                    document.getElementById('client-address').value = data.endereco || '';
                }
            });
        } else {
            clientModalTitle.textContent = "Cadastrar Novo Cliente";
        }
        clientModal.classList.remove('hidden');
    }

    function closeClientModal() { clientModal.classList.add('hidden'); editingClientId = null; }

    if (addClientBtn) addClientBtn.addEventListener('click', () => openClientModal());
    if (closeClientModalBtn) closeClientModalBtn.addEventListener('click', closeClientModal);
    if (cancelClientModalBtn) cancelClientModalBtn.addEventListener('click', closeClientModal);

    const handleClientFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const clientData = {
            nome: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            telefone: document.getElementById('client-phone').value,
            endereco: document.getElementById('client-address').value,
            timestamp: Date.now()
        };

        try {
            if (editingClientId) {
                const clientRef = doc(db, 'usuarios', currentUser.uid, 'clientes', editingClientId);
                await updateDoc(clientRef, clientData);
            } else {
                await addDoc(collection(db, 'usuarios', currentUser.uid, 'clientes'), clientData);
            }
            closeClientModal();
        } catch (error) {
            console.error('Erro ao salvar cliente: ', error);
        }
    };

    if (addClientForm) addClientForm.addEventListener('submit', handleClientFormSubmit);
    
    async function deleteClient(clientId) {
        if (!currentUser || !clientId) return;
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        
        try {
            await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'clientes', clientId));
        } catch (error) {
            console.error('Erro ao excluir cliente: ', error);
        }
    }

    function loadClients() {
        if (!currentUser) return;
        
        const q = query(collection(db, 'usuarios', currentUser.uid, 'clientes'), orderBy('nome'));
        
        unsubscribeClients = onSnapshot(q, (snapshot) => {
            if (clientTableBody) clientTableBody.innerHTML = '';
            if (osClientSelect) osClientSelect.innerHTML = '<option value="">Selecione um cliente...</option>';
            if (vendaClienteSelect) vendaClienteSelect.innerHTML = '<option value="">Selecione um cliente...</option>';

            if (snapshot.empty) {
                if (clientTableBody) clientTableBody.innerHTML = '<tr><td colspan="5">Nenhum cliente cadastrado.</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const client = doc.data();
                const clientId = doc.id;
                
                if (clientTableBody) {
                    const row = `
                        <tr>
                            <td>${client.nome}</td>
                            <td>${client.email || 'N/A'}</td>
                            <td>${client.telefone}</td>
                            <td>${client.endereco || 'N/A'}</td>
                            <td class="actions">
                                <span class="material-icons-sharp edit" data-id="${clientId}">edit</span>
                                <span class="material-icons-sharp delete" data-id="${clientId}">delete</span>
                            </td>
                        </tr>
                    `;
                    clientTableBody.innerHTML += row;
                }
                
                const option = `<option value="${clientId}" data-nome="${client.nome}">${client.nome}</option>`;
                if (osClientSelect) osClientSelect.innerHTML += option;
                if (vendaClienteSelect) vendaClienteSelect.innerHTML += option;
            });
            
            document.querySelectorAll('#client-table-body .edit').forEach(btn => btn.addEventListener('click', (e) => openClientModal(e.target.dataset.id)));
            document.querySelectorAll('#client-table-body .delete').forEach(btn => btn.addEventListener('click', (e) => deleteClient(e.target.dataset.id)));

        }, (error) => console.error("Erro ao carregar clientes: ", error));
    }


    // --- LÓGICA DE PRODUTOS (CRUD) ---

    function openProductModal(productId = null) {
        addProductForm.reset();
        editingProductId = productId;
        
        if (productId) {
            productModalTitle.textContent = "Editar Produto";
            const productRef = doc(db, 'usuarios', currentUser.uid, 'produtos', productId);
            getDoc(productRef).then(docSnap => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById('product-name').value = data.nome;
                    document.getElementById('product-code').value = data.codigo || '';
                    document.getElementById('product-stock').value = data.estoque || 0;
                    document.getElementById('product-price').value = (data.precoVenda || 0).toFixed(2).replace('.', ',');
                    document.getElementById('product-cost').value = (data.precoCusto || 0).toFixed(2).replace('.', ',');
                    productIsinsumo.checked = data.isInsumo || false;
                }
            });
        } else {
            productModalTitle.textContent = "Cadastrar Novo Produto";
            productIsinsumo.checked = false; 
        }
        productModal.classList.remove('hidden');
    }
    
    function closeProductModal() { productModal.classList.add('hidden'); editingProductId = null; }
    
    if (addProductBtn) addProductBtn.addEventListener('click', () => openProductModal());
    if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
    if (cancelProductModalBtn) cancelProductModalBtn.addEventListener('click', closeProductModal);

    const handleProductFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const productData = {
            nome: document.getElementById('product-name').value,
            codigo: document.getElementById('product-code').value,
            estoque: parseInt(document.getElementById('product-stock').value) || 0,
            precoVenda: parseFloat(document.getElementById('product-price').value.replace(',', '.')) || 0,
            precoCusto: parseFloat(document.getElementById('product-cost').value.replace(',', '.')) || 0,
            isInsumo: productIsinsumo.checked, 
            timestamp: Date.now()
        };

        const batch = writeBatch(db);
        let productRef;
        let oldStock = 0;

        try {
            if (editingProductId) {
                productRef = doc(db, 'usuarios', currentUser.uid, 'produtos', editingProductId);
                const docSnap = await getDoc(productRef);
                if (docSnap.exists()) {
                    oldStock = docSnap.data().estoque || 0;
                }
                batch.update(productRef, productData);
            } else {
                productRef = doc(collection(db, 'usuarios', currentUser.uid, 'produtos'));
                batch.set(productRef, productData);
            }

            const stockDifference = productData.estoque - oldStock;
            
            if (stockDifference > 0 && productData.precoCusto > 0) {
                const valorDespesa = productData.precoCusto * stockDifference;
                
                const lancamentoData = {
                    tipo: 'saida',
                    valor: valorDespesa * -1, 
                    descricao: `Compra: ${productData.nome} (${stockDifference} un.)`,
                    data: new Date().toISOString().split('T')[0],
                    categoria: productData.isInsumo ? 'compra_insumo' : 'compra_produto', 
                    origemId: productRef.id,
                    timestamp: Date.now()
                };
                
                const lancamentoRef = doc(collection(db, 'usuarios', currentUser.uid, 'lancamentos'));
                batch.set(lancamentoRef, lancamentoData);
                console.log(`Lançamento de despesa de ${formatCurrency(valorDespesa)} criado.`);
            }

            await batch.commit(); 
            closeProductModal();

        } catch (error) {
            console.error('Erro ao salvar produto e lançamento: ', error);
        }
    };

    if (addProductForm) addProductForm.addEventListener('submit', handleProductFormSubmit);

    async function deleteProduct(productId) {
        if (!currentUser || !productId) return;
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        
        try {
            await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'produtos', productId));
        } catch (error) {
            console.error('Erro ao excluir produto: ', error);
        }
    }

    function loadProducts() {
        if (!currentUser) return;
        
        const q = query(collection(db, 'usuarios', currentUser.uid, 'produtos'), orderBy('nome'));
        
        unsubscribeProducts = onSnapshot(q, (snapshot) => {
            if (productTableBody) productTableBody.innerHTML = '';
            if (osProdutosSelect) osProdutosSelect.innerHTML = '<option value="">Selecione um produto...</option>';
            if (vendaProdutosSelect) vendaProdutosSelect.innerHTML = '<option value="">Selecione um produto...</option>';

            if (snapshot.empty) {
                if (productTableBody) productTableBody.innerHTML = '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const prod = doc.data();
                const prodId = doc.id;
                
                const isVendaText = prod.isInsumo ? '<span class="text-info">Insumo</span>' : '<span class="text-success">Venda</span>';

                if (productTableBody) {
                    const row = `
                        <tr>
                            <td class="col-small">${prod.codigo || 'N/A'}</td>
                            <td>${prod.nome}</td>
                            <td class="col-medium">${prod.estoque} un. (${isVendaText})</td>
                            <td class="col-medium">${formatCurrency(prod.precoVenda)}</td>
                            <td class="actions">
                                <span class="material-icons-sharp edit" data-id="${prodId}">edit</span>
                                <span class="material-icons-sharp delete" data-id="${prodId}">delete</span>
                            </td>
                        </tr>
                    `;
                    productTableBody.innerHTML += row;
                }
                
                if (!prod.isInsumo) {
                    const option = `<option value="${prodId}" data-nome="${prod.nome}" data-preco="${prod.precoVenda}">${prod.nome} (${formatCurrency(prod.precoVenda)})</option>`;
                    if (osProdutosSelect) osProdutosSelect.innerHTML += option;
                    if (vendaProdutosSelect) vendaProdutosSelect.innerHTML += option;
                }
            });

            document.querySelectorAll('#product-table-body .edit').forEach(btn => btn.addEventListener('click', (e) => openProductModal(e.target.dataset.id)));
            document.querySelectorAll('#product-table-body .delete').forEach(btn => btn.addEventListener('click', (e) => deleteProduct(e.target.dataset.id)));

        }, (error) => console.error("Erro ao carregar produtos: ", error));
    }


    // --- LÓGICA DE SERVIÇOS (CRUD) ---

    function openServiceModal(serviceId = null) {
        addServiceForm.reset();
        editingServiceId = serviceId;
        if (serviceId) {
            serviceModalTitle.textContent = "Editar Serviço";
            const serviceRef = doc(db, 'usuarios', currentUser.uid, 'servicos', serviceId);
            getDoc(serviceRef).then(docSnap => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById('service-name').value = data.nome;
                    document.getElementById('service-price').value = (data.preco || 0).toFixed(2).replace('.', ',');
                }
            });
        } else {
            serviceModalTitle.textContent = "Cadastrar Novo Serviço";
        }
        serviceModal.classList.remove('hidden');
    }
    
    function closeServiceModal() { serviceModal.classList.add('hidden'); editingServiceId = null; }

    if (addServiceBtn) addServiceBtn.addEventListener('click', () => openServiceModal());
    if (closeServiceModalBtn) closeServiceModalBtn.addEventListener('click', closeServiceModal);
    if (cancelServiceModalBtn) cancelServiceModalBtn.addEventListener('click', closeServiceModal);

    const handleServiceFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const serviceData = {
            nome: document.getElementById('service-name').value,
            preco: parseFloat(document.getElementById('service-price').value.replace(',', '.')) || 0,
            timestamp: Date.now()
        };

        try {
            if (editingServiceId) {
                const serviceRef = doc(db, 'usuarios', currentUser.uid, 'servicos', editingServiceId);
                await updateDoc(serviceRef, serviceData);
            } else {
                await addDoc(collection(db, 'usuarios', currentUser.uid, 'servicos'), serviceData);
            }
            closeServiceModal();
        } catch (error) {
            console.error('Erro ao salvar serviço: ', error);
        }
    };

    if (addServiceForm) addServiceForm.addEventListener('submit', handleServiceFormSubmit);
    
    async function deleteService(serviceId) {
        if (!currentUser || !serviceId) return;
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        
        try {
            await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'servicos', serviceId));
        } catch (error) {
            console.error('Erro ao excluir serviço: ', error);
        }
    }

    function loadServices() {
        if (!currentUser) return;
        
        const q = query(collection(db, 'usuarios', currentUser.uid, 'servicos'), orderBy('nome'));
        
        unsubscribeServices = onSnapshot(q, (snapshot) => {
            if (serviceTableBody) serviceTableBody.innerHTML = '';
            if (osServicosSelect) osServicosSelect.innerHTML = '<option value="">Selecione um serviço...</option>';

            if (snapshot.empty) {
                if (serviceTableBody) serviceTableBody.innerHTML = '<tr><td colspan="3">Nenhum serviço cadastrado.</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const serv = doc.data();
                const servId = doc.id;
                
                if (serviceTableBody) {
                    const row = `
                        <tr>
                            <td>${serv.nome}</td>
                            <td class="col-medium">${formatCurrency(serv.preco)}</td>
                            <td class="actions">
                                <span class="material-icons-sharp edit" data-id="${servId}">edit</span>
                                <span class="material-icons-sharp delete" data-id="${servId}">delete</span>
                            </td>
                        </tr>
                    `;
                    serviceTableBody.innerHTML += row;
                }
                
                const option = `<option value="${servId}" data-nome="${serv.nome}" data-preco="${serv.preco}">${serv.nome} (${formatCurrency(serv.preco)})</option>`;
                if (osServicosSelect) osServicosSelect.innerHTML += option;
            });

            document.querySelectorAll('#service-table-body .edit').forEach(btn => btn.addEventListener('click', (e) => openServiceModal(e.target.dataset.id)));
            document.querySelectorAll('#service-table-body .delete').forEach(btn => btn.addEventListener('click', (e) => deleteService(e.target.dataset.id)));

        }, (error) => console.error("Erro ao carregar serviços: ", error));
    }


    // --- LÓGICA DE ITENS (OS e Vendas) ---
    
    let osItens = []; 
    let vendaItens = []; 

    function setupItemManager(container, select, addButton, itemsArray, isService = false) {
        
        function renderItems() {
            if (!container) return; 
            container.innerHTML = '';
            let total = 0;
            
            const itemsParaRenderizar = itemsArray.filter(item => (isService ? item.tipo === 'servico' : item.tipo === 'produto'));
            
            itemsParaRenderizar.forEach(item => {
                const itemIndex = itemsArray.indexOf(item); 
                const itemEl = document.createElement('div');
                itemEl.className = 'item-tag';
                itemEl.innerHTML = `
                    <span>${item.nome} (Qtd: ${item.qtd} | Vl: ${formatCurrency(item.preco * item.qtd)})</span>
                    <span class="material-icons-sharp delete-item" data-index="${itemIndex}">close</span>
                `;
                container.appendChild(itemEl);
            });
            
            if (container.id.startsWith('venda-')) {
                itemsArray.forEach(item => { total += item.preco * item.qtd; });
                if (vendaValorTotalInput) vendaValorTotalInput.value = formatCurrency(total);
            } else if (container.id.startsWith('os-')) {
                updateOsTotal();
            }
        }

        if (addButton) {
            addButton.addEventListener('click', () => {
                if (!select) return;
                const selected = select.options[select.selectedIndex];
                if (!selected || !selected.value) {
                    alert('Selecione um item para adicionar.');
                    return;
                }

                const qtd = parseInt(prompt('Quantidade:', '1')) || 1;
                
                itemsArray.push({
                    id: selected.value,
                    nome: selected.dataset.nome,
                    preco: parseFloat(selected.dataset.preco) || 0,
                    qtd: qtd,
                    tipo: isService ? 'servico' : 'produto' 
                });
                
                renderItems();
                select.selectedIndex = 0; 
            });
        }
        
        if (container) {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-item')) {
                    const index = parseInt(e.target.dataset.index);
                    itemsArray.splice(index, 1);
                    
                    if (container.id.startsWith('os-')) {
                        if (osProdutosManager) osProdutosManager.renderItems();
                        if (osServicosManager) osServicosManager.renderItems();
                    } else {
                        renderItems(); 
                    }
                }
            });
        }
        
        return { renderItems }; 
    }
    
    let osProdutosManager = setupItemManager(osItensContainer, osProdutosSelect, osAddProdutoBtn, osItens, false);
    let osServicosManager = setupItemManager(osItensServicosContainer, osServicosSelect, osAddServicoBtn, osItens, true); 
    let vendaProdutosManager = setupItemManager(vendaItensContainer, vendaProdutosSelect, vendaAddProdutoBtn, vendaItens, false);

    function updateOsTotal() {
        if (!osValorTotalInput) return;
        let total = 0;
        osItens.forEach(item => {
            total += item.preco * item.qtd;
        });
        osValorTotalInput.value = total.toFixed(2).replace('.', ','); 
    }


    // --- LÓGICA DE IMAGENS (OS) ---

    function renderImagePreviews(fileInput, previewContainer) {
        if (!fileInput || !previewContainer) return;
        
        previewContainer.querySelectorAll('.local-preview').forEach(el => el.remove());

        for (const file of fileInput.files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'image-preview-item local-preview'; 
                item.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
                previewContainer.appendChild(item);
            };
            reader.readAsDataURL(file);
        }
    }

    if (osImagensEntrada) osImagensEntrada.addEventListener('change', () => renderImagePreviews(osImagensEntrada, osImagensEntradaPreview));
    if (osImagensSaida) osImagensSaida.addEventListener('change', () => renderImagePreviews(osImagensSaida, osImagensSaidaPreview));

    async function uploadOsImages(files, osId, pathType, userId) {
        if (!files || files.length === 0) {
            return [];
        }

        const urlPromises = [];
        for (const file of files) {
            const fileName = `${Date.now()}-${file.name}`;
            const storageRef = ref(storage, `usuarios/${userId}/os/${osId}/${pathType}/${fileName}`);
            
            const uploadTask = uploadBytes(storageRef, file).then(snapshot => {
                return getDownloadURL(snapshot.ref);
            });
            urlPromises.push(uploadTask);
        }

        return await Promise.all(urlPromises);
    }


    // --- LÓGICA DE ORDENS DE SERVIÇO (OS) ---

    // ==================================================================
    // =========== ATUALIZAÇÃO 1: Abrir Modal de OS (Carregar Garantia) ===========
    // ==================================================================
    function openOsModal(orderId = null) {
        addOsForm.reset(); // Limpa todos os campos (NFe e Garantia incluídos)
        osItens = []; 
        currentOsImageUrls = { entrada: [], saida: [] }; 
        if (osImagensEntradaPreview) osImagensEntradaPreview.innerHTML = '';
        if (osImagensSaidaPreview) osImagensSaidaPreview.innerHTML = '';
        
        editingOrderId = orderId;
        
        document.getElementById('os-data-entrada').value = new Date().toISOString().split('T')[0];
        
        if (orderId) {
            osModalTitle.textContent = "Editar Ordem de Serviço";
            const orderRef = doc(db, 'usuarios', currentUser.uid, 'ordens', orderId);
            getDoc(orderRef).then(docSnap => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById('os-client').value = data.clienteId;
                    document.getElementById('os-data-entrada').value = data.dataEntrada;
                    document.getElementById('os-equipamento').value = data.equipamento || '';
                    document.getElementById('os-defeito').value = data.defeito || '';
                    document.getElementById('os-laudo').value = data.laudo || '';
                    document.getElementById('os-nfe').value = data.nfe || ''; 
                    
                    // ATUALIZADO: Carrega dados da Garantia
                    document.getElementById('os-garantia-prazo').value = data.prazoGarantia || '';
                    document.getElementById('os-garantia-termos').value = data.termosGarantia || '';

                    document.getElementById('os-status').value = data.status || 'Em Andamento';
                    document.getElementById('os-data-saida').value = data.dataSaida || '';

                    osItens = data.itens || [];
                    
                    currentOsImageUrls.entrada = data.urlsImagensEntrada || [];
                    if (osImagensEntradaPreview) {
                        currentOsImageUrls.entrada.forEach(url => {
                            osImagensEntradaPreview.innerHTML += `
                                <div class="image-preview-item" data-url="${url}">
                                    <img src="${url}" alt="Imagem Salva">
                                </div>
                            `;
                        });
                    }
                    
                    currentOsImageUrls.saida = data.urlsImagensSaida || [];
                     if (osImagensSaidaPreview) {
                        currentOsImageUrls.saida.forEach(url => {
                            osImagensSaidaPreview.innerHTML += `
                                <div class="image-preview-item" data-url="${url}">
                                    <img src="${url}" alt="Imagem Salva">
                                </div>
                            `;
                        });
                    }

                    if (osProdutosManager) osProdutosManager.renderItems();
                    if (osServicosManager) osServicosManager.renderItems();
                    updateOsTotal(); 
                }
            });
        } else {
            osModalTitle.textContent = "Criar Nova Ordem de Serviço";
            document.getElementById('os-status').value = 'Em Andamento';
            document.getElementById('os-data-saida').value = '';
            
            // TODO: Carregar termos de garantia padrão aqui (da config da loja)
            document.getElementById('os-garantia-prazo').value = "90 dias"; // Exemplo
            document.getElementById('os-garantia-termos').value = "Garantia cobre apenas o serviço/peça listado. Não cobre mau uso, oxidação ou queda."; // Exemplo

            if (osProdutosManager) osProdutosManager.renderItems();
            if (osServicosManager) osServicosManager.renderItems();
            updateOsTotal();
        }
        osModal.classList.remove('hidden');
    }
    
    function closeOsModal() { osModal.classList.add('hidden'); editingOrderId = null; }

    if (addOsBtn) addOsBtn.addEventListener('click', () => openOsModal());
    if (closeOsModalBtn) closeOsModalBtn.addEventListener('click', closeOsModal);
    if (cancelOsModalBtn) cancelOsModalBtn.addEventListener('click', closeOsModal);

    // ==================================================================
    // =========== ATUALIZAÇÃO 2: Salvar OS (Salvar Garantia) ===========
    // ==================================================================
    const handleOrderFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const dataSaidaInput = document.getElementById('os-data-saida').value;
        const clienteIdInput = document.getElementById('os-client').value;
        const dataEntradaInput = document.getElementById('os-data-entrada').value;
        const statusAtual = document.getElementById('os-status').value;
        
        if (!clienteIdInput || !dataEntradaInput) {
            alert("Por favor, preencha os campos obrigatórios (*): Cliente e Data de Entrada.");
            return;
        }

        if ((statusAtual === 'Concluído' || statusAtual === 'Aprovado') && !dataSaidaInput) {
             alert("Para status 'Concluído' ou 'Aprovado', a Data de Saída é obrigatória.");
             return;
        }

        const dataEntradaTimestamp = new Date(dataEntradaInput + 'T12:00:00').getTime();
        let dataSaidaTimestamp = null;
        if (dataSaidaInput) {
            dataSaidaTimestamp = new Date(dataSaidaInput + 'T12:00:00').getTime();
        }

        const orderData = {
            clienteId: clienteIdInput,
            clienteNome: document.getElementById('os-client').options[document.getElementById('os-client').selectedIndex].text,
            dataEntrada: dataEntradaInput,
            dataSaida: dataSaidaInput, 
            equipamento: document.getElementById('os-equipamento').value,
            defeito: document.getElementById('os-defeito').value,
            laudo: document.getElementById('os-laudo').value,
            nfe: document.getElementById('os-nfe').value.trim(), 
            
            // ATUALIZADO: Salva dados da Garantia
            prazoGarantia: document.getElementById('os-garantia-prazo').value.trim(),
            termosGarantia: document.getElementById('os-garantia-termos').value.trim(),

            status: statusAtual,
            itens: osItens,
            valorTotal: parseFloat(document.getElementById('os-valor-total').value.replace(',', '.')) || 0,
            timestampEntrada: dataEntradaTimestamp,
            timestampSaida: dataSaidaTimestamp
        };
        
        const filesEntrada = document.getElementById('os-imagens-entrada').files;
        const filesSaida = document.getElementById('os-imagens-saida').files;

        const isConcluding = (orderData.status === 'Concluído' || orderData.status === 'Aprovado');
        let batch = writeBatch(db);

        try {
            let orderRef;
            if (editingOrderId) {
                orderRef = doc(db, 'usuarios', currentUser.uid, 'ordens', editingOrderId);
                
                const newUrlsEntrada = await uploadOsImages(filesEntrada, editingOrderId, 'entrada', currentUser.uid);
                const newUrlsSaida = await uploadOsImages(filesSaida, editingOrderId, 'saida', currentUser.uid);
                
                orderData.urlsImagensEntrada = [...currentOsImageUrls.entrada, ...newUrlsEntrada];
                orderData.urlsImagensSaida = [...currentOsImageUrls.saida, ...newUrlsSaida];

                batch.update(orderRef, orderData);
                
            } else {
                orderRef = doc(collection(db, 'usuarios', currentUser.uid, 'ordens'));
                const newOsId = orderRef.id;

                const urlsEntrada = await uploadOsImages(filesEntrada, newOsId, 'entrada', currentUser.uid);
                const urlsSaida = await uploadOsImages(filesSaida, newOsId, 'saida', currentUser.uid);
                
                orderData.urlsImagensEntrada = urlsEntrada;
                orderData.urlsImagensSaida = urlsSaida;

                batch.set(orderRef, orderData);
            }

            if (isConcluding && orderData.valorTotal > 0) {
                const lancamentoData = {
                    tipo: 'entrada',
                    descricao: `Recebimento - OS (Cliente: ${orderData.clienteNome})`,
                    valor: orderData.valorTotal, 
                    data: orderData.dataSaida, 
                    categoria: 'servico_os',
                    origemId: orderRef.id,
                    timestamp: orderData.timestampSaida
                };
                const lancamentoRef = doc(collection(db, 'usuarios', currentUser.uid, 'lancamentos'));
                batch.set(lancamentoRef, lancamentoData);
            }
            
            if (isConcluding && osItens.length > 0) {
                for (const item of osItens) {
                    if (item.tipo === 'produto') {
                        const productRef = doc(db, 'usuarios', currentUser.uid, 'produtos', item.id);
                        const productSnap = await getDoc(productRef);
                        
                        if (productSnap.exists()) {
                            const currentStock = productSnap.data().estoque || 0;
                            const newStock = currentStock - item.qtd;
                            batch.update(productRef, { estoque: newStock });
                        } else {
                            console.warn(`Produto ID ${item.id} não encontrado para abater estoque.`);
                        }
                    }
                }
            }

            await batch.commit(); 
            closeOsModal();

        } catch (error) {
            console.error('Erro ao salvar OS e operações em lote: ', error);
            alert('Erro ao salvar Ordem de Serviço: ' + error.message);
        }
    };
    
    if (addOsForm) addOsForm.addEventListener('submit', handleOrderFormSubmit);
    
    async function deleteOrder(orderId) {
        if (!currentUser || !orderId) return;
        if (!confirm('Tem certeza que deseja excluir esta Ordem de Serviço? ATENÇÃO: Lançamentos financeiros e estoque associados a ela NÃO serão revertidos automaticamente.')) return;
        
        try {
            await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'ordens', orderId));
        } catch (error) {
            console.error('Erro ao excluir OS: ', error);
        }
    }

    function loadOrders() {
        if (!currentUser) return;
        
        const q = query(collection(db, 'usuarios', currentUser.uid, 'ordens'), orderBy('timestampEntrada', 'desc'));
        
        unsubscribeOrders = onSnapshot(q, (snapshot) => {
            if (osTableBody) osTableBody.innerHTML = '';
            
            if (snapshot.empty) {
                if (osTableBody) osTableBody.innerHTML = '<tr><td colspan="7">Nenhuma Ordem de Serviço registrada.</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const os = doc.data();
                const osId = doc.id;
                
                let statusClass = '';
                switch(os.status) {
                    case 'Em Andamento': statusClass = 'warning'; break;
                    case 'Concluído': statusClass = 'success'; break;
                    case 'Cancelado': statusClass = 'danger'; break;
                    case 'Aprovado': statusClass = 'info'; break;
                    default: statusClass = 'info';
                }
                
                const row = `
                    <tr>
                        <td class="col-small">${osId.substring(0, 5)}...</td>
                        <td>${os.clienteNome}</td>
                        <td>${os.equipamento || 'N/A'}</td>
                        <td class="col-medium"><span class="status-chip ${statusClass}">${os.status}</span></td>
                        <td class="col-medium">${formatDate(os.dataSaida)}</td>
                        <td class="col-medium">${formatCurrency(os.valorTotal)}</td>
                        <td class="actions">
                            <span class="material-icons-sharp view" data-id="${osId}">visibility</span>
                            <span class="material-icons-sharp edit" data-id="${osId}">edit</span>
                            <span class="material-icons-sharp delete" data-id="${osId}">delete</span>
                        </td>
                    </tr>
                `;
                if (osTableBody) osTableBody.innerHTML += row;
            });
            
            document.querySelectorAll('#os-table-body .edit').forEach(btn => btn.addEventListener('click', (e) => openOsModal(e.target.dataset.id)));
            document.querySelectorAll('#os-table-body .delete').forEach(btn => btn.addEventListener('click', (e) => deleteOrder(e.target.dataset.id)));
            document.querySelectorAll('#os-table-body .view').forEach(btn => btn.addEventListener('click', (e) => showOsDetails(e.target.dataset.id)));

        }, (error) => console.error("Erro ao carregar OS: ", error));
    }


    // --- LÓGICA DE VENDAS (CRUD) ---

    function openVendaModal(saleId = null) {
        addVendaForm.reset();
        vendaItens = []; 
        
        editingSaleId = saleId;
        
        document.getElementById('venda-data').value = new Date().toISOString().split('T')[0];
        
        if (saleId) {
            vendaModalTitle.textContent = "Editar Venda";
            const saleRef = doc(db, 'usuarios', currentUser.uid, 'vendas', saleId);
            getDoc(saleRef).then(docSnap => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById('venda-cliente').value = data.clienteId;
                    document.getElementById('venda-data').value = data.data;
                    
                    vendaItens = data.itens || [];
                    if (vendaProdutosManager) vendaProdutosManager.renderItems(); 
                }
            });
        } else {
            vendaModalTitle.textContent = "Registrar Nova Venda";
            if (vendaProdutosManager) vendaProdutosManager.renderItems(); 
        }
        vendaModal.classList.remove('hidden');
    }

    function closeVendaModal() { vendaModal.classList.add('hidden'); editingSaleId = null; }
    
    if (addVendaBtn) addVendaBtn.addEventListener('click', () => openVendaModal());
    if (closeVendaModalBtn) closeVendaModalBtn.addEventListener('click', closeVendaModal);
    if (cancelVendaModalBtn) cancelVendaModalBtn.addEventListener('click', closeVendaModal);

    const handleVendaFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const dataInput = document.getElementById('venda-data').value || new Date().toISOString().split('T')[0];
        const dataTimestamp = new Date(dataInput + 'T12:00:00').getTime();
        
        const valorTotalString = (vendaValorTotalInput.value || "R$ 0,00").replace('R$', '').replace('.', '').replace(',', '.').trim();
        const valorTotalVenda = parseFloat(valorTotalString) || 0;

        const saleData = {
            clienteId: document.getElementById('venda-cliente').value,
            clienteNome: document.getElementById('venda-cliente').options[document.getElementById('venda-cliente').selectedIndex].text,
            data: dataInput,
            itens: vendaItens,
            valorTotal: valorTotalVenda,
            status: 'Concluída',
            timestamp: dataTimestamp
        };

        const batch = writeBatch(db);

        try {
            let saleRef;
            if (editingSaleId) {
                saleRef = doc(db, 'usuarios', currentUser.uid, 'vendas', editingSaleId);
                batch.update(saleRef, saleData);
                
            } else {
                saleRef = doc(collection(db, 'usuarios', currentUser.uid, 'vendas'));
                batch.set(saleRef, saleData);

                if (saleData.valorTotal > 0) {
                    const lancamentoData = {
                        tipo: 'entrada',
                        descricao: `Recebimento - Venda (Cliente: ${saleData.clienteNome})`,
                        valor: saleData.valorTotal, 
                        data: saleData.data,
                        categoria: 'venda',
                        origemId: saleRef.id, 
                        timestamp: saleData.timestamp 
                    };
                    const lancamentoRef = doc(collection(db, 'usuarios', currentUser.uid, 'lancamentos'));
                    batch.set(lancamentoRef, lancamentoData);
                }

                if (vendaItens.length > 0) {
                    for (const item of vendaItens) {
                        const productRef = doc(db, 'usuarios', currentUser.uid, 'produtos', item.id);
                        const productSnap = await getDoc(productRef);
                        
                        if (productSnap.exists()) {
                            const currentStock = productSnap.data().estoque || 0;
                            const newStock = currentStock - item.qtd;
                            batch.update(productRef, { estoque: newStock });
                        } else {
                            console.warn(`Produto ID ${item.id} não encontrado para abater estoque.`);
                        }
                    }
                }
            }
            
            await batch.commit(); 
            closeVendaModal();

        } catch (error) {
            console.error('Erro ao salvar venda e operações em lote: ', error);
            alert('Erro ao salvar venda: ' + error.message);
        }
    };
    
    if (addVendaForm) addVendaForm.addEventListener('submit', handleVendaFormSubmit);

    async function deleteSale(saleId) {
        if (!currentUser || !saleId) return;
        if (!confirm('Tem certeza que deseja excluir esta Venda? ATENÇÃO: Lançamentos financeiros e estoque associados a ela NÃO serão revertidos automaticamente.')) return;
        
        try {
            await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'vendas', saleId));
        } catch (error) {
            console.error('Erro ao excluir Venda: ', error);
        }
    }

    function loadSales() {
        if (!currentUser) return;
        
        const q = query(collection(db, 'usuarios', currentUser.uid, 'vendas'), orderBy('timestamp', 'desc'));
        
        unsubscribeSales = onSnapshot(q, (snapshot) => {
            if (vendaTableBody) vendaTableBody.innerHTML = '';
            
            if (snapshot.empty) {
                if (vendaTableBody) vendaTableBody.innerHTML = '<tr><td colspan="5">Nenhuma venda registrada.</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const venda = doc.data();
                const vendaId = doc.id;
                
                const row = `
                    <tr>
                        <td class="col-small">${vendaId.substring(0, 5)}...</td>
                        <td>${venda.clienteNome}</td>
                        <td class="col-medium">${formatDate(venda.data)}</td>
                        <td class="col-medium">${formatCurrency(venda.valorTotal)}</td>
                        <td class="actions">
                            <span class="material-icons-sharp view" data-id="${vendaId}">visibility</span>
                            <span class="material-icons-sharp edit" data-id="${vendaId}">edit</span>
                            <span class="material-icons-sharp delete" data-id="${vendaId}">delete</span>
                        </td>
                    </tr>
                `;
                if (vendaTableBody) vendaTableBody.innerHTML += row;
            });
            
            document.querySelectorAll('#venda-table-body .edit').forEach(btn => btn.addEventListener('click', (e) => openVendaModal(e.target.dataset.id)));
            document.querySelectorAll('#venda-table-body .delete').forEach(btn => btn.addEventListener('click', (e) => deleteSale(e.target.dataset.id)));
            document.querySelectorAll('#venda-table-body .view').forEach(btn => btn.addEventListener('click', (e) => showSaleDetails(e.target.dataset.id)));

        }, (error) => console.error("Erro ao carregar Vendas: ", error));
    }


    // --- LÓGICA DE LANÇAMENTOS (MANUAL/DESPESAS) ---

    function openLancamentoModal() {
        addLancamentoForm.reset();
        document.getElementById('lancamento-data').value = new Date().toISOString().split('T')[0];
        document.getElementById('lancamento-tipo').value = 'saida'; 
        lancamentoModal.classList.remove('hidden');
    }

    function closeLancamentoModal() { lancamentoModal.classList.add('hidden'); }
    
    if (addLancamentoInsideBtn) addLancamentoInsideBtn.addEventListener('click', openLancamentoModal);
    
    if (closeLancamentoModalBtn) closeLancamentoModalBtn.addEventListener('click', closeLancamentoModal);
    if (cancelLancamentoModalBtn) cancelLancamentoModalBtn.addEventListener('click', closeLancamentoModal);

    if (addCategoriaShortcutBtn) {
        addCategoriaShortcutBtn.addEventListener('click', () => {
            openConfigCategoriasModal();
        });
    }

    const handleLancamentoFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const dataInput = document.getElementById('lancamento-data').value || new Date().toISOString().split('T')[0];
        const dataTimestamp = new Date(dataInput + 'T12:00:00').getTime();
        let valorInput = parseFloat(document.getElementById('lancamento-valor').value.replace(',', '.')) || 0;
        const categoriaInput = lancamentoCategoriaSelect.value; 
        const tipoInput = document.getElementById('lancamento-tipo').value; 

        if (valorInput <= 0) {
            alert('O valor deve ser maior que zero.');
            return;
        }
        
        if (!categoriaInput) {
            alert('Por favor, selecione uma categoria.');
            return;
        }
        
        if (tipoInput === 'saida' && valorInput > 0) {
             valorInput = valorInput * -1; 
        } else if (tipoInput === 'entrada' && valorInput < 0) {
             valorInput = Math.abs(valorInput); 
        }

        const lancamentoData = {
            tipo: tipoInput, 
            descricao: document.getElementById('lancamento-descricao').value,
            valor: valorInput, 
            data: dataInput,
            categoria: categoriaInput, 
            timestamp: dataTimestamp
        };

        try {
            await addDoc(collection(db, 'usuarios', currentUser.uid, 'lancamentos'), lancamentoData);
            closeLancamentoModal();
        } catch (error) {
            console.error('Erro ao salvar lançamento: ', error);
        }
    };
    
    if (addLancamentoForm) addLancamentoForm.addEventListener('submit', handleLancamentoFormSubmit);


    function loadLancamentos() {
        if (!currentUser) return;
        
        const q = query(collection(db, 'usuarios', currentUser.uid, 'lancamentos'), orderBy('timestamp', 'desc'));
        
        unsubscribeLancamentos = onSnapshot(q, (snapshot) => {
            if (lancamentosTableBody) lancamentosTableBody.innerHTML = '';
            
            if (snapshot.empty) {
                if (lancamentosTableBody) lancamentosTableBody.innerHTML = '<tr><td colspan="4">Nenhum lançamento registrado.</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const lanc = doc.data();
                
                const tipoClasse = lanc.tipo === 'entrada' ? 'text-success' : 'text-danger';
                const tipoTexto = lanc.tipo === 'entrada' ? 'Entrada' : 'Saída';
                
                const row = `
                    <tr>
                        <td class="col-medium">${formatDate(lanc.data)}</td>
                        <td>${lanc.descricao}</td>
                        <td class="col-medium"><span class="${tipoClasse}">${tipoTexto}</span></td>
                        <td class="col-medium ${tipoClasse}">${formatCurrency(lanc.valor)}</td>
                    </tr>
                `;
                if (lancamentosTableBody) lancamentosTableBody.innerHTML += row;
            });

        }, (error) => console.error("Erro ao carregar lançamentos: ", error));
    }


    // --- LÓGICA DE CONFIGURAÇÕES ---

    // --- Configuração Conta ---
    function openConfigContaModal() { configContaModal.classList.remove('hidden'); }
    function closeConfigContaModal() { configContaModal.classList.add('hidden'); }
    if (configContaBtn) configContaBtn.addEventListener('click', openConfigContaModal);
    if (closeConfigContaBtn) closeConfigContaBtn.addEventListener('click', closeConfigContaModal);
    if (cancelConfigContaBtn) cancelConfigContaBtn.addEventListener('click', closeConfigContaModal);
    
    if (configContaForm) {
        configContaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Salvando Configurações da Conta...");
            closeConfigContaModal();
        });
    }

    // --- Configuração Loja ---
    function openConfigLojaModal() {
        loadConfigLoja(); 
        configLojaModal.classList.remove('hidden');
    }
    function closeConfigLojaModal() { configLojaModal.classList.add('hidden'); }
    if (configLojaBtn) configLojaBtn.addEventListener('click', openConfigLojaModal);
    if (closeConfigLojaBtn) closeConfigLojaBtn.addEventListener('click', closeConfigLojaModal);
    if (cancelConfigLojaBtn) cancelConfigLojaBtn.addEventListener('click', closeConfigLojaModal);

    const handleConfigLojaFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const lojaData = {
            nomeCompleto: document.getElementById('loja-nome-completo').value,
            cpf: document.getElementById('loja-cpf').value,
            celular: document.getElementById('loja-celular').value,
            nacionalidade: document.getElementById('loja-nacionalidade').value,
            pessoalEstado: document.getElementById('loja-pessoal-estado').value,
            pessoalRua: document.getElementById('loja-pessoal-rua').value,
            pessoalNumero: document.getElementById('loja-pessoal-numero').value,
            pessoalBairro: document.getElementById('loja-pessoal-bairro').value,
            pessoalCidade: document.getElementById('loja-pessoal-cidade').value,
            
            nomeLoja: document.getElementById('loja-nome').value,
            cnpj: document.getElementById('loja-cnpj').value,
            contatoLoja: document.getElementById('loja-contato').value,
            lojaRua: document.getElementById('loja-rua').value,
            lojaBairro: document.getElementById('loja-bairro').value,
            lojaCidade: document.getElementById('loja-cidade').value,
            lojaEstado: document.getElementById('loja-estado').value
        };

        try {
            const docRef = doc(db, 'usuarios', currentUser.uid, 'configLoja', 'dados');
            await setDoc(docRef, lojaData); 
            
            console.log("Dados da Loja salvos com sucesso!");
            alert("Dados da loja salvos com sucesso!");
            closeConfigLojaModal();

        } catch (error) {
            console.error("Erro ao salvar dados da loja: ", error);
            alert("Erro ao salvar dados: " + error.message);
        }
    };
    
    if (configLojaForm) configLojaForm.addEventListener('submit', handleConfigLojaFormSubmit);

    async function loadConfigLoja() {
        if (!currentUser) return;
        
        const docRef = doc(db, 'usuarios', currentUser.uid, 'configLoja', 'dados');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('loja-nome-completo').value = data.nomeCompleto || '';
            document.getElementById('loja-cpf').value = data.cpf || '';
            document.getElementById('loja-celular').value = data.celular || '';
            document.getElementById('loja-nacionalidade').value = data.nacionalidade || 'Brasileiro(a)';
            document.getElementById('loja-pessoal-estado').value = data.pessoalEstado || '';
            document.getElementById('loja-pessoal-rua').value = data.pessoalRua || '';
            document.getElementById('loja-pessoal-numero').value = data.pessoalNumero || '';
            document.getElementById('loja-pessoal-bairro').value = data.pessoalBairro || '';
            document.getElementById('loja-pessoal-cidade').value = data.pessoalCidade || '';
            
            document.getElementById('loja-nome').value = data.nomeLoja || '';
            document.getElementById('loja-cnpj').value = data.cnpj || '';
            document.getElementById('loja-contato').value = data.contatoLoja || '';
            document.getElementById('loja-rua').value = data.lojaRua || '';
            document.getElementById('loja-bairro').value = data.lojaBairro || '';
            document.getElementById('loja-cidade').value = data.lojaCidade || '';
            document.getElementById('loja-estado').value = data.lojaEstado || '';
        } else {
            console.log("Nenhum dado de loja encontrado. Formulário em branco.");
        }
    }

    // --- Lógica Configuração Impressão (Seleção de Formato) ---

    function openConfigImpressaoModal() {
        loadConfigImpressao();
        configImpressaoModal.classList.remove('hidden');
    }
    function closeConfigImpressaoModal() { configImpressaoModal.classList.add('hidden'); }

    if (configImpressaoBtn) configImpressaoBtn.addEventListener('click', openConfigImpressaoModal);
    if (closeConfigImpressaoBtn) closeConfigImpressaoBtn.addEventListener('click', closeConfigImpressaoModal);
    if (cancelConfigImpressaoBtn) cancelConfigImpressaoBtn.addEventListener('click', closeConfigImpressaoModal);

    const handleConfigImpressaoFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const impressaoData = {
            formatoDireto: document.getElementById('config-impressao-direta').value,
            formatoEnvio: document.getElementById('config-impressao-envio').value
        };

        try {
            const docRef = doc(db, 'usuarios', currentUser.uid, 'configImpressao', 'dados');
            await setDoc(docRef, impressaoData); 
            
            console.log("Configurações de Impressão salvas!");
            alert("Configurações de Impressão salvas com sucesso!");
            closeConfigImpressaoModal();

        } catch (error) {
            console.error("Erro ao salvar config. de impressão: ", error);
            alert("Erro ao salvar configurações: " + error.message);
        }
    };
    
    if (configImpressaoForm) configImpressaoForm.addEventListener('submit', handleConfigImpressaoFormSubmit);

    async function loadConfigImpressao() {
        if (!currentUser) return;
        
        const docRef = doc(db, 'usuarios', currentUser.uid, 'configImpressao', 'dados');
        const docSnap = await getDoc(docRef);
        
        const selectDireto = document.getElementById('config-impressao-direta');
        const selectEnvio = document.getElementById('config-impressao-envio');

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (selectDireto) selectDireto.value = data.formatoDireto || 'ter-80mm';
            if (selectEnvio) selectEnvio.value = data.formatoEnvio || 'a4';
        } else {
            if (selectDireto) selectDireto.value = 'ter-80mm';
            if (selectEnvio) selectEnvio.value = 'a4';
        }
    }

    // --- Lógica Personalizar Layout (Checkboxes) ---

    function openConfigLayoutModal() {
        loadConfigLayout(); 
        configLayoutModal.classList.remove('hidden');
    }
    function closeConfigLayoutModal() { configLayoutModal.classList.add('hidden'); }

    if (configLayoutBtn) configLayoutBtn.addEventListener('click', openConfigLayoutModal);
    if (closeConfigLayoutBtn) closeConfigLayoutBtn.addEventListener('click', closeConfigLayoutModal);
    if (cancelConfigLayoutBtn) cancelConfigLayoutBtn.addEventListener('click', closeConfigLayoutModal);

    const layoutLargeIds = [
        'show-logo', 'show-loja-nome', 'show-loja-endereco', 'show-loja-contato', 'show-loja-cnpj',
        'show-cliente-nome', 'show-cliente-telefone', 'show-cliente-email', 'show-cliente-endereco',
        'show-os-numero', 'show-os-datas', 'show-os-status', 'show-os-equipamento', 'show-os-defeito', 'show-os-laudo',
        'show-itens-tabela', 'show-valor-total', 'show-imagens', 'show-garantia', 'show-assinatura'
    ];
    
    const layoutTermIds = [
        'show-logo', 'show-loja-nome', 'show-loja-endereco', 'show-loja-contato',
        'show-cliente-nome', 'show-cliente-telefone',
        'show-os-numero', 'show-os-datas', 'show-os-status', 'show-os-equipamento', 'show-os-defeito', 'show-os-laudo',
        'show-itens-lista', 'show-valor-total', 'show-garantia', 'show-assinatura'
    ];

    const handleConfigLayoutFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const layoutLargeData = {};
        for (const id of layoutLargeIds) {
            const element = document.getElementById(`layout-large-${id}`);
            if (element) layoutLargeData[id] = element.checked;
        }
        
        const layoutTermData = {};
        for (const id of layoutTermIds) {
            const element = document.getElementById(`layout-term-${id}`);
            if (element) layoutTermData[id] = element.checked;
        }

        try {
            const docLargeRef = doc(db, 'usuarios', currentUser.uid, 'configImpressao', 'layoutLarge');
            await setDoc(docLargeRef, layoutLargeData);
            
            const docTermRef = doc(db, 'usuarios', currentUser.uid, 'configImpressao', 'layoutThermal');
            await setDoc(docTermRef, layoutTermData);

            alert("Personalização salva com sucesso!");
            closeConfigLayoutModal();

        } catch (error) {
            console.error("Erro ao salvar personalização: ", error);
            alert("Erro ao salvar personalização: " + error.message);
        }
    };
    
    if (configLayoutForm) configLayoutForm.addEventListener('submit', handleConfigLayoutFormSubmit);

    async function loadConfigLayout() {
        if (!currentUser) return;

        const largeDefaults = {
            'show-logo': true, 'show-loja-nome': true, 'show-loja-endereco': true, 'show-loja-contato': true, 'show-loja-cnpj': false,
            'show-cliente-nome': true, 'show-cliente-telefone': true, 'show-cliente-email': true, 'show-cliente-endereco': true,
            'show-os-numero': true, 'show-os-datas': true, 'show-os-status': true, 'show-os-equipamento': true, 'show-os-defeito': true, 'show-os-laudo': true,
            'show-itens-tabela': true, 'show-valor-total': true, 'show-imagens': false, 'show-garantia': true, 'show-assinatura': true
        };
        const termDefaults = {
            'show-logo': false, 'show-loja-nome': true, 'show-loja-endereco': false, 'show-loja-contato': true,
            'show-cliente-nome': true, 'show-cliente-telefone': true,
            'show-os-numero': true, 'show-os-datas': true, 'show-os-status': false, 'show-os-equipamento': true, 'show-os-defeito': true, 'show-os-laudo': false,
            'show-itens-lista': true, 'show-valor-total': true, 'show-garantia': true, 'show-assinatura': false
        };

        const loadAndApply = async (docId, defaults, ids, prefix) => {
            const docRef = doc(db, 'usuarios', currentUser.uid, 'configImpressao', docId);
            const docSnap = await getDoc(docRef);
            
            let data = defaults;
            if (docSnap.exists()) {
                data = { ...defaults, ...docSnap.data() };
            }
            
            for (const id of ids) {
                const element = document.getElementById(`${prefix}-${id}`);
                if (element) element.checked = data[id];
            }
        };

        await loadAndApply('layoutLarge', largeDefaults, layoutLargeIds, 'layout-large');
        await loadAndApply('layoutThermal', termDefaults, layoutTermIds, 'layout-term');
    }

    
    // --- Lógica de Categorias de Despesa ---

    function openConfigCategoriasModal() { configCategoriasModal.classList.remove('hidden'); }
    function closeConfigCategoriasModal() { configCategoriasModal.classList.add('hidden'); }

    if (configCategoriasBtn) configCategoriasBtn.addEventListener('click', openConfigCategoriasModal);
    if (closeConfigCategoriasBtn) closeConfigCategoriasBtn.addEventListener('click', closeConfigCategoriasModal);
    if (cancelConfigCategoriasBtn) cancelConfigCategoriasBtn.addEventListener('click', closeConfigCategoriasModal);

    const handleAddCategoriaFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const nomeCategoria = categoriaNameInput.value.trim();
        if (!nomeCategoria) {
            alert('Por favor, insira um nome para a categoria.');
            return;
        }

        try {
            await addDoc(collection(db, 'usuarios', currentUser.uid, 'categorias'), {
                nome: nomeCategoria,
                timestamp: Date.now()
            });
            categoriaNameInput.value = ''; 
        } catch (error) {
            console.error("Erro ao adicionar categoria: ", error);
            alert('Erro ao salvar categoria.');
        }
    };
    
    if (addCategoriaForm) addCategoriaForm.addEventListener('submit', handleAddCategoriaFormSubmit);

    async function deleteCategoria(categoriaId) {
        if (!currentUser || !categoriaId) return;
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
        
        try {
            await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'categorias', categoriaId));
        } catch (error) {
            console.error('Erro ao excluir categoria: ', error);
        }
    }

    function loadCategorias() {
        if (!currentUser) return;

        const q = query(collection(db, 'usuarios', currentUser.uid, 'categorias'), orderBy('nome'));
        
        unsubscribeCategorias = onSnapshot(q, (snapshot) => {
            
            if (lancamentoCategoriaSelect) {
                lancamentoCategoriaSelect.innerHTML = '<option value="">Selecione uma categoria...</option>';
            }
            
            if (categoryListContainer) {
                categoryListContainer.innerHTML = '';
            }

            const categoriasSistema = [
                { id: 'venda', nome: 'Venda (Automático)' },
                { id: 'servico_os', nome: 'Ordem de Serviço (Automático)' },
                { id: 'compra_produto', nome: 'Compra de Produto (Automático)' },
                { id: 'compra_insumo', nome: 'Compra de Insumo (Automático)' }
            ];

            categoriasSistema.forEach(cat => {
                if (lancamentoCategoriaSelect) {
                    const option = `<option value="${cat.id}">${cat.nome}</option>`;
                    lancamentoCategoriaSelect.innerHTML += option;
                }
            });


            if (snapshot.empty && categoryListContainer) {
                categoryListContainer.innerHTML = '<p class="text-muted">Nenhuma categoria personalizada cadastrada.</p>';
            }

            snapshot.forEach(doc => {
                const categoria = doc.data();
                const categoriaId = doc.id;
                
                if (categoryListContainer) {
                    const item = document.createElement('div');
                    item.className = 'category-list-item';
                    item.innerHTML = `
                        <span>${categoria.nome}</span>
                        <span class="material-icons-sharp delete" data-id="${categoriaId}">delete</span>
                    `;
                    categoryListContainer.appendChild(item);
                }
                
                if (lancamentoCategoriaSelect) {
                    const option = `<option value="${categoria.nome}">${categoria.nome}</option>`;
                    lancamentoCategoriaSelect.innerHTML += option;
                }
            });

            document.querySelectorAll('#category-list .delete').forEach(btn => {
                btn.addEventListener('click', (e) => deleteCategoria(e.target.dataset.id));
            });

        }, (error) => {
            console.error("Erro ao carregar categorias: ", error);
            if (categoryListContainer) categoryListContainer.innerHTML = '<p class="text-danger">Erro ao carregar categorias.</p>';
        });
    }

    
    // --- LÓGICA DE RELATÓRIOS ---

    function setDefaultDates() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        
        if(reportDataInicio) reportDataInicio.value = firstDay;
        if(reportDataFim) reportDataFim.value = lastDay;
    }
    setDefaultDates(); 

    if (gerarRelatorioBtn) {
        gerarRelatorioBtn.addEventListener('click', () => {
            alert("Por favor, clique em 'Relatório de Vendas' ou 'Relatório de Serviços' para gerar um relatório específico com o período selecionado.");
        });
    }

    if (relatorioVendasBtn) relatorioVendasBtn.addEventListener('click', () => gerarRelatorioVendas());
    if (relatorioServicosBtn) relatorioServicosBtn.addEventListener('click', () => gerarRelatorioServicos());
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', () => exportReportToPDF());


    async function gerarRelatorioVendas() {
        if (!currentUser) return;
        
        const dataInicio = reportDataInicio.value;
        const dataFim = reportDataFim.value;

        if (!dataInicio || !dataFim) {
            alert("Por favor, selecione data de início e fim.");
            return;
        }

        const reportName = `Relatório de Vendas (${formatDate(dataInicio)} - ${formatDate(dataFim)})`;
        reportTitle.textContent = reportName;
        reportTableHead.innerHTML = `
            <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Nº Itens</th>
                <th>Valor Total</th>
            </tr>
        `;
        reportTableBody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
        
        currentReportData = { head: [], body: [], title: "" };
        reportDisplayArea.classList.remove('hidden');

        try {
            const q = query(collection(db, 'usuarios', currentUser.uid, 'vendas'),
                where('data', '>=', dataInicio),
                where('data', '<=', dataFim),
                orderBy('data', 'desc')
            );
            
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                reportTableBody.innerHTML = '<tr><td colspan="4">Nenhuma venda encontrada neste período.</td></tr>';
                return;
            }

            let totalVendas = 0;
            let html = '';
            let pdfBody = []; 

            snapshot.forEach(doc => {
                const venda = doc.data();
                const numItens = venda.itens ? venda.itens.reduce((acc, item) => acc + item.qtd, 0) : 0;
                const valorFormatado = formatCurrency(venda.valorTotal);
                const dataFormatada = formatDate(venda.data);

                html += `
                    <tr>
                        <td>${dataFormatada}</td>
                        <td>${venda.clienteNome}</td>
                        <td>${numItens}</td>
                        <td>${valorFormatado}</td>
                    </tr>
                `;
                pdfBody.push([dataFormatada, venda.clienteNome, numItens, valorFormatado]);
                
                totalVendas += venda.valorTotal;
            });

            const totalFormatado = formatCurrency(totalVendas);
            
            html += `
                <tr style="font-weight: 600; background: #f9f9f9;">
                    <td colspan="3" style="text-align: right; padding-right: 1rem;">Total no Período</td>
                    <td>${totalFormatado}</td>
                </tr>
            `;
            
            pdfBody.push([
                { content: 'Total no Período', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: totalFormatado, styles: { fontStyle: 'bold' } }
            ]);
            
            reportTableBody.innerHTML = html;

            currentReportData.title = reportName;
            currentReportData.head = [['Data', 'Cliente', 'Nº Itens', 'Valor Total']];
            currentReportData.body = pdfBody;

        } catch (error) {
            console.error("Erro ao gerar relatório de vendas:", error);
            reportTableBody.innerHTML = `<tr><td colspan="4">Erro ao carregar dados: ${error.message}</td></tr>`;
        }
    }

    async function gerarRelatorioServicos() {
        if (!currentUser) return;

        const dataInicio = reportDataInicio.value;
        const dataFim = reportDataFim.value;

        if (!dataInicio || !dataFim) {
            alert("Por favor, selecione data de início e fim.");
            return;
        }

        const reportName = `Relatório de Serviços (${formatDate(dataInicio)} - ${formatDate(dataFim)})`;
        reportTitle.textContent = reportName;
        reportTableHead.innerHTML = `
            <tr>
                <th>Serviço</th>
                <th>Qtd. Realizada</th>
                <th>Faturamento Total</th>
            </tr>
        `;
        reportTableBody.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';
        
        currentReportData = { head: [], body: [], title: "" };
        reportDisplayArea.classList.remove('hidden');

        try {
            const q = query(collection(db, 'usuarios', currentUser.uid, 'ordens'),
                where('status', 'in', ['Concluído', 'Aprovado']),
                where('dataSaida', '>=', dataInicio),
                where('dataSaida', '<=', dataFim)
            );
            
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                reportTableBody.innerHTML = '<tr><td colspan="3">Nenhuma O.S. concluída/aprovada foi encontrada neste período.</td></tr>';
                return;
            }

            const servicosAgregados = new Map();

            snapshot.forEach(doc => {
                const os = doc.data();
                if (os.itens && Array.isArray(os.itens)) {
                    os.itens.forEach(item => {
                        if (item.tipo === 'servico') {
                            if (!servicosAgregados.has(item.nome)) {
                                servicosAgregados.set(item.nome, { qtd: 0, total: 0 });
                            }
                            const servico = servicosAgregados.get(item.nome);
                            servico.qtd += (item.qtd || 1);
                            servico.total += (item.preco || 0) * (item.qtd || 1);
                        }
                    });
                }
            });
            

            if (servicosAgregados.size === 0) {
                reportTableBody.innerHTML = '<tr><td colspan="3">Nenhum serviço encontrado nas O.S. deste período.</td></tr>';
                return;
            }

            let html = '';
            let pdfBody = [];
            let faturamentoTotal = 0;
            
            const servicosOrdenados = [...servicosAgregados.entries()].sort((a, b) => b[1].total - a[1].total);

            for (const [nome, dados] of servicosOrdenados) {
                const totalFormatado = formatCurrency(dados.total);
                html += `
                    <tr>
                        <td>${nome}</td>
                        <td>${dados.qtd}</td>
                        <td>${totalFormatado}</td>
                    </tr>
                `;
                pdfBody.push([nome, dados.qtd, totalFormatado]);
                faturamentoTotal += dados.total;
            }
            
            const faturamentoTotalFormatado = formatCurrency(faturamentoTotal);

            html += `
                <tr style="font-weight: 600; background: #f9f9f9;">
                    <td colspan="2" style="text-align: right; padding-right: 1rem;">Faturamento Total em Serviços</td>
                    <td>${faturamentoTotalFormatado}</td>
                </tr>
            `;

            pdfBody.push([
                { content: 'Faturamento Total em Serviços', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: faturamentoTotalFormatado, styles: { fontStyle: 'bold' } }
            ]);

            reportTableBody.innerHTML = html;

            currentReportData.title = reportName;
            currentReportData.head = [['Serviço', 'Qtd. Realizada', 'Faturamento Total']];
            currentReportData.body = pdfBody;

        } catch (error) {
            console.error("Erro ao gerar relatório de serviços:", error);
            reportTableBody.innerHTML = `<tr><td colspan="3">Erro ao carregar dados: ${error.message}</td></tr>`;
        }
    }

    // --- FUNÇÃO: Exportar PDF ---
    function exportReportToPDF() {
        if (!currentReportData.body.length) {
            alert('Nenhum dado para exportar. Gere um relatório primeiro.');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.text(currentReportData.title, 14, 20);
            
            doc.autoTable({
                head: currentReportData.head,
                body: currentReportData.body,
                startY: 25, 
                theme: 'striped', 
                styles: {
                    font: 'Poppins',
                    fontSize: 10
                },
                headStyles: {
                    fillColor: [10, 37, 64] 
                }
            });
            
            doc.save('relatorio-mapos.pdf');

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Verifique o console.");
        }
    }
    
    // --- LÓGICA DO MODAL DE DETALHES (OS e Vendas) ---
    
    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', () => detailsModal.classList.add('hidden'));
    if (cancelDetailsModalBtn) cancelDetailsModalBtn.addEventListener('click', () => detailsModal.classList.add('hidden'));
    
    function formatDetailsItems(items) {
        if (!items || items.length === 0) {
            return '<p>Nenhum item.</p>';
        }
        return `
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qtd.</th>
                        <th>Vl. Unit.</th>
                        <th>Vl. Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.nome}</td>
                            <td>${item.qtd}</td>
                            <td>${formatCurrency(item.preco)}</td>
                            <td>${formatCurrency(item.preco * item.qtd)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    function formatDetailsImages(urls) {
        if (!urls || urls.length === 0) {
            return '<p>Nenhuma imagem.</p>';
        }
        return urls.map(url => `
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="details-image-item">
                <img src="${url}" alt="Imagem do item">
            </a>
        `).join('');
    }

    async function showSaleDetails(saleId) {
        if (!currentUser || !saleId) return;
        
        detailsModalTitle.textContent = `Detalhes da Venda (Cód: ${saleId.substring(0, 5)}...)`;
        detailsModalBody.innerHTML = '<p>Carregando...</p>';
        detailsModal.classList.remove('hidden');

        try {
            const saleRef = doc(db, 'usuarios', currentUser.uid, 'vendas', saleId);
            const docSnap = await getDoc(saleRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                const itemsHtml = formatDetailsItems(data.itens);
                
                const html = `
                    <div class="details-grid">
                        <div class="details-item">
                            <span>Cliente</span>
                            <p>${data.clienteNome}</p>
                        </div>
                        <div class="details-item">
                            <span>Data</span>
                            <p>${formatDate(data.data)}</p>
                        </div>
                        <div class="details-item">
                            <span>Status</span>
                            <p><span class="status-chip success">${data.status}</span></p>
                        </div>
                        <div class="details-item">
                            <span>Valor Total</span>
                            <p><strong>${formatCurrency(data.valorTotal)}</strong></p>
                        </div>
                    </div>
                    <div class="details-group">
                        <h3>Itens da Venda</h3>
                        ${itemsHtml}
                    </div>
                `;
                detailsModalBody.innerHTML = html;
            } else {
                detailsModalBody.innerHTML = '<p class="text-danger">Venda não encontrada.</p>';
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da Venda: ", error);
            detailsModalBody.innerHTML = `<p class="text-danger">Erro ao carregar: ${error.message}</p>`;
        }
    }

    // ==================================================================
    // =========== ATUALIZAÇÃO 3: Exibir Garantia nos Detalhes da OS ===========
    // ==================================================================
    async function showOsDetails(orderId) {
        if (!currentUser || !orderId) return;
        
        detailsModalTitle.textContent = `Detalhes da O.S. (Nº: ${orderId.substring(0, 5)}...)`;
        detailsModalBody.innerHTML = '<p>Carregando...</p>';
        detailsModal.classList.remove('hidden');
        
        try {
            const osRef = doc(db, 'usuarios', currentUser.uid, 'ordens', orderId);
            const docSnap = await getDoc(osRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                const itemsHtml = formatDetailsItems(data.itens);
                const imagesEntradaHtml = formatDetailsImages(data.urlsImagensEntrada);
                const imagesSaidaHtml = formatDetailsImages(data.urlsImagensSaida);

                let statusClass = '';
                switch(data.status) {
                    case 'Em Andamento': statusClass = 'warning'; break;
                    case 'Concluído': statusClass = 'success'; break;
                    case 'Cancelado': statusClass = 'danger'; break;
                    case 'Aprovado': statusClass = 'info'; break;
                    default: statusClass = 'info';
                }
                
                const html = `
                    <div class="details-grid">
                        <div class="details-item">
                            <span>Cliente</span>
                            <p>${data.clienteNome}</p>
                        </div>
                        <div class="details-item">
                            <span>Equipamento</span>
                            <p>${data.equipamento || 'N/A'}</p>
                        </div>
                        <div class="details-item">
                            <span>Data Entrada</span>
                            <p>${formatDate(data.dataEntrada)}</p>
                        </div>
                        <div class="details-item">
                            <span>Data Saída</span>
                            <p>${formatDate(data.dataSaida)}</p>
                        </div>
                        <div class="details-item">
                            <span>Status</span>
                            <p><span class="status-chip ${statusClass}">${data.status}</span></p>
                        </div>
                        <div class="details-item">
                            <span>Valor Total</span>
                            <p><strong>${formatCurrency(data.valorTotal)}</strong></p>
                        </div>
                    </div>

                    <div class="details-grid">
                        <div class="details-item-full">
                            <span>Defeito Reclamado</span>
                            <p>${data.defeito || 'N/A'}</p>
                        </div>
                        <div class="details-item-full">
                            <span>Laudo Técnico</span>
                            <p>${data.laudo || 'N/A'}</p>
                        </div>
                        
                        <div class="details-item-full">
                            <span>Chave NFe (44 dígitos)</span>
                            <p>${data.nfe || 'N/A'}</p>
                        </div>

                        <div class="details-item-full">
                            <span>Prazo da Garantia</span>
                            <p>${data.prazoGarantia || 'N/A'}</p>
                        </div>
                        <div class="details-item-full">
                            <span>Termos da Garantia</span>
                            <p>${data.termosGarantia || 'N/A'}</p>
                        </div>
                    </div>

                    <div class="details-group">
                        <h3>Itens (Produtos e Serviços)</h3>
                        ${itemsHtml}
                    </div>

                    <div class="details-group">
                        <h3>Imagens</h3>
                        <div class="details-item-full">
                            <span>Imagens de Entrada</span>
                            <div class="details-image-container">${imagesEntradaHtml}</div>
                        </div>
                        <div class="details-item-full">
                            <span>Imagens de Saída</span>
                            <div class="details-image-container">${imagesSaidaHtml}</div>
                        </div>
                    </div>
                `;
                detailsModalBody.innerHTML = html;
            } else {
                detailsModalBody.innerHTML = '<p class="text-danger">Ordem de Serviço não encontrada.</p>';
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da O.S.: ", error);
            detailsModalBody.innerHTML = `<p class="text-danger">Erro ao carregar: ${error.message}</p>`;
        }
    }

});