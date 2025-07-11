// Application Configuration
// Load environment variables first
let ENV = {};
try {
    ENV = window.ENV || {};
} catch (error) {
    console.warn('Environment variables not loaded yet');
}

const CONFIG = {
    // Supabase Configuration
    SUPABASE: {
        URL: ENV.SUPABASE_URL || 'https://jhmvqmwjalfifttdfzge.supabase.co',
        ANON_KEY: ENV.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpobXZxbXdqYWxmaWZ0dGRmemdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTkyMDcsImV4cCI6MjA2NzY3NTIwN30.YLrMPmtqrazbM77va-rB-SFpS4kY5ceCzGBcL31LLAU'
    },
    
    // Application Settings
    APP: {
        NAME: 'Finmetic',
        VERSION: '1.0.0',
        LOGIN_URL: '/login/login.html',
        DASHBOARD_URL: '/app/index.html'
    },
    
    // Authentication Settings
    AUTH: {
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    }
};

// Export configuration
window.CONFIG = CONFIG; 