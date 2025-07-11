// Load components
async function loadComponents() {
    // Load app header
    const headerContainer = document.getElementById('app-header-container');
    if (headerContainer) {
        const headerResponse = await fetch('components/navbar.html');
        headerContainer.innerHTML = await headerResponse.text();
    }
}

// Load feature content
async function loadFeatureContent(feature) {
    const contentContainer = document.getElementById('content');
    try {
        const response = await fetch(`features/${feature}/index.html`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        contentContainer.innerHTML = await response.text();

        // Load and execute feature's JavaScript
        const script = document.createElement('script');
        script.src = `features/${feature}/index.js`;
        document.body.appendChild(script);

        // Load feature's CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `features/${feature}/index.css`;
        document.head.appendChild(link);
    } catch (error) {
        console.error('Error loading feature:', error);
        contentContainer.innerHTML = '<div class="error">Feature not found</div>';
    }
}

// Router function
function router() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    loadFeatureContent(hash);
}

// Initialize app
async function initializeApp() {
    try {
        // Check authentication first
        if (window.appAuth) {
            const isAuthenticated = await window.appAuth.requireAuth();
            if (!isAuthenticated) {
                // User will be redirected to login by requireAuth()
                return;
            }
        }
        
        // Load components first (only if containers exist)
        await loadComponents();
        
        // Initialize navigation (only if AppNavigation exists)
        if (typeof AppNavigation !== 'undefined') {
            const navigation = new AppNavigation();
        }
        
        // Load initial route (only if content container exists)
        const contentContainer = document.getElementById('content');
        if (contentContainer) {
            router();
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Event listeners
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', initializeApp);

// Handle search events
document.addEventListener('app:search', (event) => {
    const query = event.detail.query;
    // Implement your search logic here
    console.log('Searching for:', query);
}); 