// =============================================================================
// Application Constants
// =============================================================================

/**
 * Core Application Settings
 */
export const APP_SETTINGS = {
    APP_NAME: 'Finmetic',
    APP_DESCRIPTION: 'Financial Arithmetic',
    DEFAULT_LANGUAGE: 'en',
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_THEME: 'light'
};

/**
 * Route Configuration
 */
export const ROUTES = {
    // Main application routes
    FEATURES: [
        'dashboard',
        'budget',
        'goals',
        'portfolio',
        'analytics',
        'reports',
        'income-expense',
        'settings'
    ],
    
    // Authentication routes
    AUTH: {
        LOGIN: '/login.html',
        SIGNUP: '/signup.html',
        DASHBOARD: '/app/index.html'
    },
    
    // Public routes
    PUBLIC: {
        HOME: '/index.html',
        BLOGS: '/blogs/blogs.html',
        FREE_TOOLS: '/free-tools/free-tools.html'
    }
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
    USER_SETTINGS: 'finmetic_user_settings',
    USER_DATA: 'finmetic_user',
    THEME: 'theme',
    AUTH_TOKEN: 'auth_token'
};

/**
 * UI Configuration
 */
export const UI_CONFIG = {
    // Theme configuration
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark'
    },
    
    // Chart colors
    CHART_COLORS: {
        PRIMARY: '#4F46E5',
        SECONDARY: '#10B981',
        ACCENT: '#F59E0B',
        DANGER: '#EF4444',
        NEUTRAL: '#6B7280',
        // Additional chart colors for data visualization
        PALETTE: [
            '#4F46E5', // Indigo
            '#10B981', // Emerald
            '#F59E0B', // Amber
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#06B6D4', // Cyan
            '#84CC16'  // Lime
        ]
    },
    
    // Animation durations (in ms)
    ANIMATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500
    }
};

/**
 * Default Values for Financial Calculations
 */
export const FINANCIAL_DEFAULTS = {
    DIVIDEND_YIELD: 4,      // Default dividend yield percentage
    DEPLETION_RATE: 4,      // Default asset depletion rate percentage
    BORROWING_RATE: 4,      // Default borrowing rate percentage
    INVESTMENT_PERIOD: 10,  // Default investment period in years
    MIN_INVESTMENT: 1000,   // Minimum investment amount
    MAX_INVESTMENT: 1000000 // Maximum investment amount
};

/**
 * API Configuration
 */
export const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',
    TIMEOUT: 5000, // 5 seconds
    RETRY_ATTEMPTS: 3,
    ENDPOINTS: {
        AUTH: '/api/auth',
        TRANSACTIONS: '/api/transactions',
        GOALS: '/api/goals',
        PORTFOLIO: '/api/portfolio'
    }
};

/**
 * Form Validation Rules
 */
export const VALIDATION_RULES = {
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL_CHARS: true
    },
    INVESTMENT: {
        MIN_AMOUNT: 0,
        MAX_AMOUNT: 1000000000
    },
    DATE: {
        MIN_YEAR: 1900,
        MAX_YEAR: 2100
    }
}; 