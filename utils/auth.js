// Authentication Service
class AppAuth {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.isInitialized = false;
        this.authStateListeners = [];
        this.sessionCheckInterval = null;
    }

    // Initialize Supabase client
    async init() {
        if (this.isInitialized) return;

        try {
            // Load Supabase client
            if (typeof supabase === 'undefined') {
                await this.loadSupabaseScript();
            }

            // Initialize Supabase client
            this.supabase = supabase.createClient(
                CONFIG.SUPABASE.URL,
                CONFIG.SUPABASE.ANON_KEY
            );

            // Check current session
            await this.checkSession();
            
            // Set up session monitoring
            this.setupSessionMonitoring();
            
            this.isInitialized = true;
            console.log('AppAuth initialized');
        } catch (error) {
            console.error('Failed to initialize AppAuth:', error);
            throw error;
        }
    }

    // Load Supabase script with timeout
    async loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Supabase script load timeout'));
            }, 10000); // 10 second timeout

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2';
            script.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Failed to load Supabase script'));
            };
            document.head.appendChild(script);
        });
    }

    // Check current session with improved error handling
    async checkSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('Session check error:', error);
                return false;
            }

            if (session) {
                this.user = session.user;
                this.updateLocalStorage(session.user);
                this.notifyAuthStateChange('SIGNED_IN', session);
                return true;
            } else {
                // Check if we have user data in localStorage
                const localUser = localStorage.getItem('finmetic_user');
                if (localUser) {
                    const userData = JSON.parse(localUser);
                    if (userData.isLoggedIn) {
                        // User data exists but no session, clear it
                        this.clearLocalStorage();
                        this.notifyAuthStateChange('SIGNED_OUT', null);
                        return false;
                    }
                }
                return false;
            }
        } catch (error) {
            console.error('Session check failed:', error);
            return false;
        }
    }

    // Set up session monitoring
    setupSessionMonitoring() {
        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(() => {
            this.checkSession().catch(error => {
                console.error('Session monitoring error:', error);
            });
        }, 5 * 60 * 1000);

        // Listen to auth state changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.user = session.user;
                this.updateLocalStorage(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.clearLocalStorage();
            }
            
            this.notifyAuthStateChange(event, session);
        });
    }

    // Update localStorage with user data
    updateLocalStorage(user) {
        const userData = {
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            isLoggedIn: true,
            id: user.id,
            lastLogin: new Date().toISOString()
        };

        try {
            localStorage.setItem('finmetic_user', JSON.stringify(userData));

            // Create or update user settings
            const existingSettings = localStorage.getItem('finmetic_user_settings');
            if (!existingSettings) {
                const userSettings = {
                    account: {
                        emailAddress: user.email,
                        fullName: userData.name,
                        phoneNumber: user.phone || ''
                    }
                };
                localStorage.setItem('finmetic_user_settings', JSON.stringify(userSettings));
            }
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    }

    // Clear localStorage with error handling
    clearLocalStorage() {
        try {
            localStorage.removeItem('finmetic_user');
            localStorage.removeItem('finmetic_user_settings');
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    // Check if user is authenticated with caching
    async isAuthenticated() {
        console.log('isAuthenticated called');
        
        // First check localStorage for user data
        const localUser = localStorage.getItem('finmetic_user');
        if (localUser) {
            try {
                const userData = JSON.parse(localUser);
                if (userData.isLoggedIn) {
                    console.log('User found in localStorage, authenticated');
                    return true;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.clearLocalStorage();
            }
        }
        
        // If no local user data, try Supabase session
        if (!this.isInitialized) {
            console.log('AppAuth not initialized, initializing...');
            await this.init();
        }
        
        console.log('Current user:', this.user);
        const isAuth = this.user !== null;
        console.log('Authentication check result:', isAuth);
        return isAuth;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Sign out with improved error handling
    async signOut() {
        try {
            if (this.supabase) {
                const { error } = await this.supabase.auth.signOut();
                if (error) {
                    console.error('Supabase sign out error:', error);
                }
            }
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            this.user = null;
            this.clearLocalStorage();
            this.notifyAuthStateChange('SIGNED_OUT', null);
        }
    }

    // Add auth state change listener
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    // Notify all auth state change listeners
    notifyAuthStateChange(event, session) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(event, session);
            } catch (error) {
                console.error('Error in auth state change listener:', error);
            }
        });
    }

    // Require authentication - redirect to login if not authenticated
    async requireAuth() {
        console.log('requireAuth called - checking authentication...');
        const isAuth = await this.isAuthenticated();
        console.log('Authentication result:', isAuth);
        if (!isAuth) {
            console.log('User not authenticated, redirecting to login...');
            const loginUrl = window.CONFIG?.APP?.LOGIN_URL || '/login/login.html';
            window.location.href = loginUrl;
            return false;
        }
        console.log('User authenticated, allowing access');
        return true;
    }

    // Cleanup method
    cleanup() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
        this.authStateListeners = [];
    }
}

// Create global instance
window.appAuth = new AppAuth();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded - initializing AppAuth...');
    console.log('Auth.js loaded and executing...');
    
    try {
        await window.appAuth.init();
        console.log('AppAuth initialized successfully');
    } catch (error) {
        console.error('Error in auth initialization:', error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.appAuth) {
        window.appAuth.cleanup();
    }
}); 