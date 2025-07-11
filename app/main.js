// Main Application Module
class AppManager {
    constructor() {
        this.isInitialized = false;
        this.featureCache = new Map();
        this.loadingPromises = new Map();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            // Check authentication first
            if (window.appAuth) {
                const isAuthenticated = await window.appAuth.requireAuth();
                if (!isAuthenticated) {
                    return; // User will be redirected to login by requireAuth()
                }
            }
            
            // Load components
            await this.loadComponents();
            
            // Initialize navigation
            if (typeof AppNavigation !== 'undefined') {
                this.navigation = new AppNavigation();
            }
            
            // Load initial route
            this.router();
            
            this.isInitialized = true;
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    async loadComponents() {
        const headerContainer = document.getElementById('app-header-container');
        if (headerContainer) {
            try {
                const headerResponse = await fetch('components/navbar.html');
                if (!headerResponse.ok) {
                    throw new Error(`Failed to load navbar: ${headerResponse.status}`);
                }
                headerContainer.innerHTML = await headerResponse.text();
            } catch (error) {
                console.error('Error loading navbar:', error);
                headerContainer.innerHTML = '<div class="error">Failed to load navigation</div>';
            }
        }
    }

    async loadFeatureContent(feature) {
        const contentContainer = document.getElementById('content');
        if (!contentContainer) {
            console.error('Content container not found');
            return;
        }

        // Check if already loading this feature
        if (this.loadingPromises.has(feature)) {
            await this.loadingPromises.get(feature);
            return;
        }

        // Create loading promise
        const loadingPromise = this._loadFeature(feature, contentContainer);
        this.loadingPromises.set(feature, loadingPromise);

        try {
            await loadingPromise;
        } finally {
            this.loadingPromises.delete(feature);
        }
    }

    async _loadFeature(feature, contentContainer) {
        try {
            // Check cache first
            if (this.featureCache.has(feature)) {
                const cached = this.featureCache.get(feature);
                contentContainer.innerHTML = cached.html;
                this._loadFeatureAssets(feature);
                return;
            }

            const response = await fetch(`features/${feature}/index.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            
            // Cache the HTML
            this.featureCache.set(feature, { html });
            
            contentContainer.innerHTML = html;
            this._loadFeatureAssets(feature);

        } catch (error) {
            console.error('Error loading feature:', error);
            contentContainer.innerHTML = `
                <div class="error">
                    <h3>Feature Not Found</h3>
                    <p>The requested feature "${feature}" could not be loaded.</p>
                    <button onclick="window.location.hash = 'dashboard'">Go to Dashboard</button>
                </div>
            `;
        }
    }

    _loadFeatureAssets(feature) {
        // Load JavaScript
        const script = document.createElement('script');
        script.src = `features/${feature}/index.js`;
        script.onerror = () => console.error(`Failed to load script for feature: ${feature}`);
        document.body.appendChild(script);

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `features/${feature}/index.css`;
        link.onerror = () => console.error(`Failed to load CSS for feature: ${feature}`);
        document.head.appendChild(link);
    }

    router() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.loadFeatureContent(hash);
    }

    // Clear cache when needed
    clearCache() {
        this.featureCache.clear();
    }

    // Clear specific feature cache
    clearFeatureCache(feature) {
        this.featureCache.delete(feature);
    }
}

// Initialize app manager
const appManager = new AppManager();

// Event listeners
window.addEventListener('hashchange', () => appManager.router());
window.addEventListener('DOMContentLoaded', () => appManager.init());

// Handle search events
document.addEventListener('app:search', (event) => {
    const query = event.detail.query;
    console.log('Searching for:', query);
    // Implement search logic here
});

// Handle cache clearing events
document.addEventListener('app:clearCache', () => {
    appManager.clearCache();
});

// Export for global access
window.AppManager = appManager; 