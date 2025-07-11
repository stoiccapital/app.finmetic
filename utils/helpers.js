// Utilities Module - Shared helper functions and utilities
import { APP_SETTINGS, STORAGE_KEYS, UI_CONFIG } from './constants.js';

// Component loader utility with caching
class ComponentLoader {
    static cache = new Map();
    
    static async loadComponent(componentPath) {
        // Check cache first
        if (this.cache.has(componentPath)) {
            return this.cache.get(componentPath);
        }
        
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath} (${response.status})`);
            }
            const content = await response.text();
            
            // Cache the result
            this.cache.set(componentPath, content);
            return content;
        } catch (error) {
            console.error('Error loading component:', error);
            return null;
        }
    }
    
    static async loadComponents(components) {
        const loadPromises = components.map(component => 
            this.loadComponent(component.path).then(content => ({
                ...component,
                content
            }))
        );
        
        return Promise.all(loadPromises);
    }
    
    static injectComponent(targetSelector, content) {
        const target = document.querySelector(targetSelector);
        if (target && content) {
            target.innerHTML = content;
        }
    }
    
    // Clear cache when needed
    static clearCache() {
        this.cache.clear();
    }
}

// Theme utilities with performance improvements
class ThemeManager {
    static getCurrentTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || APP_SETTINGS.DEFAULT_THEME;
    }
    
    static setTheme(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        // Use classList.toggle for better performance
        document.body.classList.remove(`theme-${UI_CONFIG.THEMES.LIGHT}`, `theme-${UI_CONFIG.THEMES.DARK}`);
        document.body.classList.add(`theme-${theme}`);
        
        // Dispatch custom event for theme change
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    static initTheme() {
        const savedTheme = this.getCurrentTheme();
        this.setTheme(savedTheme);
    }
}

// User Profile utilities with memoization
class UserProfile {
    static _settingsCache = null;
    static _lastCacheTime = 0;
    static CACHE_DURATION = 5000; // 5 seconds
    
    static getDefaultSettings() {
        return {
            account: {
                emailAddress: 'john.doe@example.com',
                fullName: 'John Doe',
                phoneNumber: ''
            },
            preferences: {
                theme: APP_SETTINGS.DEFAULT_THEME,
                currency: APP_SETTINGS.DEFAULT_CURRENCY,
                language: APP_SETTINGS.DEFAULT_LANGUAGE
            }
        };
    }
    
    static getUserSettings() {
        const now = Date.now();
        
        // Return cached settings if still valid
        if (this._settingsCache && (now - this._lastCacheTime) < this.CACHE_DURATION) {
            return this._settingsCache;
        }
        
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
            const settings = saved ? { ...this.getDefaultSettings(), ...JSON.parse(saved) } : this.getDefaultSettings();
            
            // Update cache
            this._settingsCache = settings;
            this._lastCacheTime = now;
            
            return settings;
        } catch (error) {
            console.error('Error loading user settings:', error);
            return this.getDefaultSettings();
        }
    }
    
    static getUserInitials(fullName) {
        if (!fullName) {
            const settings = this.getUserSettings();
            fullName = settings.account.fullName || 'John Doe';
        }
        
        const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
        if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        } else if (nameParts.length === 1) {
            return (nameParts[0][0] + (nameParts[0][1] || nameParts[0][0])).toUpperCase();
        }
        return 'JD';
    }
    
    static updateHeaderUserInfo() {
        const settings = this.getUserSettings();
        
        // Batch DOM updates for better performance
        const updates = [
            { selector: '.nav__user-name', value: settings.account.fullName },
            { selector: '.nav__user-avatar', value: this.getUserInitials(settings.account.fullName) }
        ];
        
        updates.forEach(({ selector, value }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    static initUserProfile() {
        // Use requestAnimationFrame for better performance
        const init = () => this.updateHeaderUserInfo();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            requestAnimationFrame(init);
        }
    }
    
    // Clear cache when settings change
    static clearCache() {
        this._settingsCache = null;
        this._lastCacheTime = 0;
    }
}

// Currency utilities with memoization
class CurrencyFormatter {
    static _formatters = new Map();
    
    static getFormatter(currency = APP_SETTINGS.DEFAULT_CURRENCY) {
        if (!this._formatters.has(currency)) {
            this._formatters.set(currency, new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }));
        }
        return this._formatters.get(currency);
    }
    
    static formatCurrency(amount, currency = APP_SETTINGS.DEFAULT_CURRENCY) {
        const formatter = this.getFormatter(currency);
        return formatter.format(amount);
    }
    
    static formatPercentage(value, decimalPlaces = 2) {
        return `${value.toFixed(decimalPlaces)}%`;
    }
    
    static formatNumber(value, decimalPlaces = 2) {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        });
    }
}

// Date utilities with performance improvements
class DateUtilities {
    static _dateCache = new Map();
    
    static formatDate(date, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const key = `${date.getTime()}-${JSON.stringify(options)}`;
        if (this._dateCache.has(key)) {
            return this._dateCache.get(key);
        }
        
        const formatted = date.toLocaleDateString('en-US', options);
        this._dateCache.set(key, formatted);
        
        // Limit cache size
        if (this._dateCache.size > 100) {
            const firstKey = this._dateCache.keys().next().value;
            this._dateCache.delete(firstKey);
        }
        
        return formatted;
    }
    
    static calculateDateDifference(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
            days: diffDays,
            months: Math.ceil(diffDays / 30),
            years: Math.ceil(diffDays / 365)
        };
    }
    
    static isDateInFuture(date) {
        const targetDate = new Date(date);
        const today = new Date();
        return targetDate > today;
    }
}

// Local storage utilities with better error handling
class StorageManager {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            // Try to clear some space if quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.clearOldData();
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (retryError) {
                    console.error('Failed to save after cleanup:', retryError);
                    return false;
                }
            }
            return false;
        }
    }
    
    static get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }
    
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
    
    // Clear old data to free up space
    static clearOldData() {
        const keysToKeep = ['finmetic_user', 'finmetic_user_settings', 'theme'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                try {
                    localStorage.removeItem(key);
                } catch (error) {
                    console.warn('Failed to remove old data:', key, error);
                }
            }
        });
    }
}

// Validation utilities with improved performance
class ValidationUtils {
    static _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    static _numberRegex = /^-?\d*\.?\d+$/;
    
    static isValidEmail(email) {
        return this._emailRegex.test(email);
    }
    
    static isValidNumber(value, min = null, max = null) {
        if (!this._numberRegex.test(value)) return false;
        const num = parseFloat(value);
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    }
    
    static isValidDate(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }
    
    static validateRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }
}

// Animation utilities with performance improvements
class AnimationUtils {
    static fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const startTime = performance.now();
        
        const fade = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };
        
        requestAnimationFrame(fade);
    }
    
    static fadeOut(element, duration = 300) {
        if (!element) return;
        
        const startTime = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
        
        const fade = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(fade);
    }
    
    static slideDown(element, duration = 300) {
        if (!element) return;
        
        element.style.display = 'block';
        element.style.height = '0';
        element.style.overflow = 'hidden';
        
        const targetHeight = element.scrollHeight;
        const startTime = performance.now();
        
        const slide = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = `${targetHeight * progress}px`;
            
            if (progress < 1) {
                requestAnimationFrame(slide);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        };
        
        requestAnimationFrame(slide);
    }
}

// Export all utilities
export {
    ComponentLoader,
    ThemeManager,
    UserProfile,
    CurrencyFormatter,
    DateUtilities,
    StorageManager,
    ValidationUtils,
    AnimationUtils
}; 