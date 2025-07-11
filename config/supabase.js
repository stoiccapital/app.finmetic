// Supabase Configuration
// Load environment variables from .env.local
let ENV_VARS = {};
try {
    ENV_VARS = window.ENV || {};
} catch (error) {
    console.warn('Environment variables not loaded yet');
}

// Wait for Supabase to be available and initialize client
function initializeSupabase() {
    // Check if Supabase library is loaded from CDN
    if (typeof window.supabase === 'undefined') {
        console.log('Supabase library not loaded yet, waiting...');
        return null;
    }
    
    try {
        // Use environment variables first, then fall back to CONFIG
        const supabaseUrl = ENV_VARS.SUPABASE_URL || CONFIG.SUPABASE.URL;
        const supabaseKey = ENV_VARS.SUPABASE_ANON_KEY || CONFIG.SUPABASE.ANON_KEY;
        
        console.log('Initializing Supabase client with:', {
            url: supabaseUrl ? 'URL loaded' : 'URL missing',
            key: supabaseKey ? 'Key loaded' : 'Key missing'
        });
        
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        return null;
    }
}

// Initialize the client with retry mechanism
let supabaseClient = null;

function initializeWithRetry(maxAttempts = 20) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const tryInitialize = () => {
            attempts++;
            console.log(`Attempting to initialize Supabase client... attempt ${attempts}/${maxAttempts}`);
            
            supabaseClient = initializeSupabase();
            
            if (supabaseClient) {
                console.log('Supabase client initialized successfully');
                resolve(supabaseClient);
            } else if (attempts >= maxAttempts) {
                console.error('Failed to initialize Supabase client after maximum attempts');
                reject(new Error('Failed to initialize Supabase client'));
            } else {
                setTimeout(tryInitialize, 300);
            }
        };
        
        tryInitialize();
    });
}

// Try to initialize immediately
supabaseClient = initializeSupabase();

// If not available, set up retry mechanism
if (!supabaseClient) {
    // Add a small delay to ensure Supabase library is fully loaded
    setTimeout(() => {
        initializeWithRetry().then(client => {
            supabaseClient = client;
            console.log('Supabase client initialized via retry mechanism');
        }).catch(error => {
            console.error('Failed to initialize Supabase client:', error);
        });
    }, 100);
}

// Authentication utilities
class AuthService {
    // Check if client is available
    static _checkClient() {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
    }
    
    // Wait for client to be ready
    static async _waitForClient() {
        if (!supabaseClient) {
            console.log('Waiting for Supabase client to be ready...');
            try {
                supabaseClient = await initializeWithRetry();
            } catch (error) {
                throw new Error('Supabase client failed to initialize');
            }
        }
    }
    
    // Sign up with email and password
    static async signUp(email, password, userData = {}) {
        try {
            await this._waitForClient();
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { data: null, error };
        }
    }

    // Sign in with email and password
    static async signIn(email, password) {
        try {
            await this._waitForClient();
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        }
    }

    // Sign in with Google OAuth
    static async signInWithGoogle() {
        try {
            await this._waitForClient();
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/app/index.html'
                }
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { data: null, error };
        }
    }

    // Sign in with GitHub OAuth
    static async signInWithGitHub() {
        try {
            await this._waitForClient();
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin + '/app/index.html'
                }
            });

            return { data, error: null };
        } catch (error) {
            console.error('GitHub sign in error:', error);
            return { data: null, error };
        }
    }

    // Sign out
    static async signOut() {
        try {
            await this._waitForClient();
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;

            // Clear local storage
            localStorage.removeItem('finmetic_user');
            localStorage.removeItem('finmetic_user_settings');

            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { error };
        }
    }

    // Get current user
    static async getCurrentUser() {
        try {
            await this._waitForClient();
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            
            if (error) throw error;

            return { user, error: null };
        } catch (error) {
            console.error('Get current user error:', error);
            return { user: null, error };
        }
    }

    // Reset password
    static async resetPassword(email) {
        try {
            await this._waitForClient();
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/login/login.html'
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            console.error('Reset password error:', error);
            return { error };
        }
    }

    // Update user profile
    static async updateProfile(updates) {
        try {
            await this._waitForClient();
            const { data, error } = await supabaseClient.auth.updateUser(updates);
            
            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('Update profile error:', error);
            return { data: null, error };
        }
    }

    // Listen to auth state changes
    static onAuthStateChange(callback) {
        this._waitForClient().then(() => {
            return supabaseClient.auth.onAuthStateChange(callback);
        }).catch(error => {
            console.error('Failed to set up auth state listener:', error);
        });
    }
}

// Export for use in other files
window.AuthService = AuthService;
window.Supabase = supabaseClient; 