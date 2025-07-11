// Navbar Component
class Navbar {
    constructor() {
        console.log('Navbar constructor called');
        this.profileContainer = null;
        this.isLoggedIn = false;
        this.userData = null;
        this.isInitialized = false;
        
        // Bind methods to preserve context
        this.handleProfileClick = this.handleProfileClick.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.logout = this.logout.bind(this);
        
        // Initialize when DOM is ready
        this.initWhenReady();
    }

    initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('Initializing navbar...');
        this.profileContainer = document.getElementById('profileContainer');
        console.log('Profile container found:', this.profileContainer);
        
        if (this.profileContainer) {
            this.setupEventListeners();
            this.checkAuthStatus();
            this.isInitialized = true;
        } else {
            console.log('Profile container not found, retrying in 100ms...');
            setTimeout(() => this.init(), 100);
        }
    }

    setupEventListeners() {
        // Add click handler for profile container
        this.profileContainer.addEventListener('click', this.handleProfileClick);
        
        // Close profile menu when clicking outside
        document.addEventListener('click', this.handleOutsideClick);
        
        // Listen for settings changes
        document.addEventListener('userSettingsChanged', () => {
            console.log('Settings changed, updating navbar...');
            this.checkAuthStatus();
        });
    }

    handleProfileClick(e) {
        console.log('Profile container clicked!');
        // Only prevent default if user is logged in (for profile menu)
        if (this.isLoggedIn) {
            e.preventDefault();
            e.stopPropagation();
            this.toggleProfileMenu();
        }
        // If not logged in, let the login link work normally
    }

    handleOutsideClick(e) {
        if (this.profileContainer && !this.profileContainer.contains(e.target)) {
            const menu = this.profileContainer.querySelector('.profile-menu');
            if (menu) {
                menu.classList.remove('active');
            }
        }
    }

    checkAuthStatus() {
        // Get user data from localStorage
        const userData = localStorage.getItem('finmetic_user');
        const userSettings = localStorage.getItem('finmetic_user_settings');
        
        console.log('User data from localStorage:', userData);
        console.log('User settings from localStorage:', userSettings);
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                const settings = userSettings ? JSON.parse(userSettings) : null;
                
                this.isLoggedIn = true;
                this.userData = {
                    name: settings?.account?.fullName || user.name || 'User'
                };
                console.log('User data set:', this.userData);
                this.renderProfile();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.clearUserData();
            }
        } else {
            this.clearUserData();
        }
    }

    clearUserData() {
        this.isLoggedIn = false;
        this.userData = null;
        this.renderLoginButton();
    }

    renderProfile() {
        if (!this.profileContainer) {
            console.log('Profile container not found!');
            return;
        }

        console.log('Rendering profile for:', this.userData.name);

        this.profileContainer.innerHTML = `
            <div class="profile-container">
                <span class="profile-name">${this.userData.name}</span>
                <div class="profile-menu">
                    <a href="/app/features/settings/settings.html" class="profile-menu-item">
                        <i class="fas fa-user-edit"></i> Edit Profile
                    </a>
                    <a href="#" class="profile-menu-item" onclick="navbar.logout(); event.preventDefault();">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;
        
        console.log('Profile rendered, HTML:', this.profileContainer.innerHTML);
    }

    renderLoginButton() {
        if (!this.profileContainer) return;

        this.profileContainer.innerHTML = `
            <a href="/login/login.html" class="navbar-login">Login</a>
        `;
    }

    toggleProfileMenu() {
        console.log('Toggle profile menu called, isLoggedIn:', this.isLoggedIn);
        
        if (!this.isLoggedIn) {
            console.log('User not logged in');
            return;
        }

        const menu = this.profileContainer.querySelector('.profile-menu');
        console.log('Menu element found:', menu);
        
        if (menu) {
            const isActive = menu.classList.contains('active');
            console.log('Menu currently active:', isActive);
            
            if (isActive) {
                menu.classList.remove('active');
                console.log('Menu deactivated');
            } else {
                menu.classList.add('active');
                console.log('Menu activated');
            }
        } else {
            console.log('Menu element not found!');
        }
    }

    async logout() {
        console.log('Logout called');
        console.log('Current window.location.href:', window.location.href);
        
        try {
            // Use AuthService to sign out from Supabase
            if (typeof AuthService !== 'undefined') {
                console.log('AuthService available, calling signOut...');
                await AuthService.signOut();
            } else {
                console.log('AuthService not available');
            }
            
            // Clear local storage
            this.clearLocalStorage();
            console.log('LocalStorage cleared');
            
            this.clearUserData();
            
            // Redirect to login page
            console.log('Redirecting to /login/login.html');
            window.location.href = '/login/login.html';
            
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local storage and redirect even if logout fails
            this.clearLocalStorage();
            this.clearUserData();
            console.log('Redirecting to /login/login.html (fallback)');
            window.location.href = '/login/login.html';
        }
    }

    clearLocalStorage() {
        try {
            localStorage.removeItem('finmetic_user');
            localStorage.removeItem('finmetic_user_settings');
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    // Cleanup method
    cleanup() {
        if (this.profileContainer) {
            this.profileContainer.removeEventListener('click', this.handleProfileClick);
        }
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('userSettingsChanged', this.checkAuthStatus);
    }
}

// Initialize the navbar
console.log('Navbar script loaded');
const navbar = new Navbar();

// Export for global access
window.navbar = navbar; 