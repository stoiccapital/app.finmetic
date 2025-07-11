// Utilities Module - Shared helper functions and utilities
import { APP_SETTINGS, STORAGE_KEYS, UI_CONFIG } from './constants.js';

// Component loader utility
class ComponentLoader {
    static async loadComponent(componentPath) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath}`);
            }
            return await response.text();
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
}

// Theme utilities
class ThemeManager {
    static getCurrentTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || APP_SETTINGS.DEFAULT_THEME;
    }
    
    static setTheme(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        document.body.classList.remove(`theme-${UI_CONFIG.THEMES.LIGHT}`, `theme-${UI_CONFIG.THEMES.DARK}`);
        document.body.classList.add(`theme-${theme}`);
    }
    
    static initTheme() {
        const savedTheme = this.getCurrentTheme();
        this.setTheme(savedTheme);
    }
}

// User Profile utilities
class UserProfile {
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
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
            return saved ? { ...this.getDefaultSettings(), ...JSON.parse(saved) } : this.getDefaultSettings();
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
        
        const nameParts = fullName.trim().split(' ');
        if (nameParts.length >= 2) {
            return nameParts[0][0] + nameParts[1][0];
        } else if (nameParts.length === 1) {
            return nameParts[0][0] + (nameParts[0][1] || nameParts[0][0]);
        }
        return 'JD';
    }
    
    static updateHeaderUserInfo() {
        const settings = this.getUserSettings();
        
        // Update user name
        const userNameElement = document.querySelector('.nav__user-name');
        if (userNameElement) {
            userNameElement.textContent = settings.account.fullName;
        }
        
        // Update user avatar
        const avatarElement = document.querySelector('.nav__user-avatar');
        if (avatarElement) {
            avatarElement.textContent = this.getUserInitials(settings.account.fullName).toUpperCase();
        }
    }
    
    static initUserProfile() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateHeaderUserInfo();
            });
        } else {
            this.updateHeaderUserInfo();
        }
    }
}

// Currency utilities
class CurrencyFormatter {
    static formatCurrency(amount, currency = APP_SETTINGS.DEFAULT_CURRENCY) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
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

// Date utilities
class DateUtilities {
    static formatDate(date, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        return date.toLocaleDateString('en-US', options);
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

// Local storage utilities
class StorageManager {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
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
}

// Validation utilities
class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static isValidNumber(value, min = null, max = null) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        
        return true;
    }
    
    static isValidDate(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }
    
    static validateRequired(value) {
        return value !== null && value !== undefined && value !== '';
    }
}

// Animation utilities
class AnimationUtils {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const fade = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(fade);
            }
        };
        
        requestAnimationFrame(fade);
    }
    
    static fadeOut(element, duration = 300) {
        let start = null;
        const fade = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(fade);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(fade);
    }
    
    static slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        
        let start = null;
        const slide = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const height = Math.min((progress / duration) * targetHeight, targetHeight);
            
            element.style.height = `${height}px`;
            
            if (progress < duration) {
                requestAnimationFrame(slide);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        };
        
        requestAnimationFrame(slide);
    }
}

// Export utilities
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