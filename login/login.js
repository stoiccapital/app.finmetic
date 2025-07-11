// Login Page JavaScript - Simplified and Clean

// Global variables
let isInitialized = false;

// Initialize login page
async function initializeLogin() {
    console.log('Initializing login page...');
    
    // Check if user is already logged in
    await checkAuthState();
    
    // Set up tab switching
    setupTabs();
    
    // Set up form validation
    setupValidation();
    
    console.log('Login page initialized successfully');
    isInitialized = true;
}

// Check if user is already authenticated
async function checkAuthState() {
    try {
        // Check localStorage first
        const userData = localStorage.getItem('finmetic_user');
        if (userData) {
            const user = JSON.parse(userData);
            if (user.isLoggedIn) {
                console.log('User already logged in, redirecting to app...');
                window.location.href = '/app/index.html';
                return;
            }
        }
        
        // Check Supabase session if available
        if (typeof AuthService !== 'undefined') {
            const { user } = await AuthService.getCurrentUser();
            if (user) {
                console.log('User session found, redirecting to app...');
                window.location.href = '/app/index.html';
                return;
            }
        }
    } catch (error) {
        console.log('No authenticated user found:', error);
    }
}

// Set up tab switching functionality
function setupTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and forms
            authTabs.forEach(t => t.classList.remove('auth-tab--active'));
            authForms.forEach(f => f.classList.remove('auth-form--active'));
            
            // Add active class to clicked tab and corresponding form
            this.classList.add('auth-tab--active');
            document.getElementById(targetTab + '-form').classList.add('auth-form--active');
        });
    });
}

// Set up form validation
function setupValidation() {
    const signupPassword = document.getElementById('signup-password');
    const signupConfirmPassword = document.getElementById('signup-confirm-password');
    
    if (signupConfirmPassword) {
        signupConfirmPassword.addEventListener('input', function() {
            if (this.value !== signupPassword.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

// Handle sign in
async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('.auth-btn');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;
        
        // Wait for AuthService to be available
        if (typeof AuthService === 'undefined') {
            showMessage('Authentication service is loading, please wait...', 'info');
            await waitForAuthService();
        }
        
        // Sign in with Supabase
        const { data, error } = await AuthService.signIn(email, password);
        
        if (error) {
            throw new Error(error.message || 'Sign in failed');
        }
        
        // Save user data
        const userData = {
            name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
            email: data.user.email,
            isLoggedIn: true,
            id: data.user.id
        };
        
        localStorage.setItem('finmetic_user', JSON.stringify(userData));
        
        // Show success message
        showMessage('Successfully signed in! Redirecting...', 'success');
        
        // Redirect to app
        setTimeout(() => {
            window.location.href = '/app/index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Sign in error:', error);
        showMessage(error.message || 'Sign in failed. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle sign up
async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showMessage('Password must be at least 8 characters', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('.auth-btn');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        // Wait for AuthService to be available
        if (typeof AuthService === 'undefined') {
            showMessage('Authentication service is loading, please wait...', 'info');
            await waitForAuthService();
        }
        
        // Sign up with Supabase
        const { data, error } = await AuthService.signUp(email, password, {
            full_name: name
        });
        
        if (error) {
            throw new Error(error.message || 'Sign up failed');
        }
        
        // Check if email confirmation is required
        if (data.user && !data.user.email_confirmed_at) {
            showMessage('Please check your email and click the confirmation link to complete your registration.', 'info');
        } else {
            // Save user data and redirect
            const userData = {
                name: name,
                email: email,
                isLoggedIn: true,
                id: data.user.id
            };
            
            localStorage.setItem('finmetic_user', JSON.stringify(userData));
            
            showMessage('Account created successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = '/app/index.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('Sign up error:', error);
        showMessage(error.message || 'Sign up failed. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Google authentication
async function handleGoogleAuth() {
    try {
        if (typeof AuthService === 'undefined') {
            showMessage('Authentication service is loading, please wait...', 'info');
            await waitForAuthService();
        }
        
        const { data, error } = await AuthService.signInWithGoogle();
        
        if (error) {
            throw new Error(error.message || 'Google sign in failed');
        }
        
        // Google OAuth will handle the redirect automatically
        showMessage('Redirecting to Google...', 'info');
        
    } catch (error) {
        console.error('Google auth error:', error);
        showMessage(error.message || 'Google sign in failed. Please try again.', 'error');
    }
}

// Handle GitHub authentication
async function handleGitHubAuth() {
    try {
        if (typeof AuthService === 'undefined') {
            showMessage('Authentication service is loading, please wait...', 'info');
            await waitForAuthService();
        }
        
        const { data, error } = await AuthService.signInWithGitHub();
        
        if (error) {
            throw new Error(error.message || 'GitHub sign in failed');
        }
        
        // GitHub OAuth will handle the redirect automatically
        showMessage('Redirecting to GitHub...', 'info');
        
    } catch (error) {
        console.error('GitHub auth error:', error);
        showMessage(error.message || 'GitHub sign in failed. Please try again.', 'error');
    }
}

// Handle forgot password
async function handleForgotPassword() {
    const email = document.getElementById('signin-email').value;
    
    if (!email) {
        showMessage('Please enter your email address first', 'error');
        document.getElementById('signin-email').focus();
        return;
    }
    
    try {
        if (typeof AuthService === 'undefined') {
            showMessage('Authentication service is loading, please wait...', 'info');
            await waitForAuthService();
        }
        
        const { error } = await AuthService.resetPassword(email);
        
        if (error) {
            throw new Error(error.message || 'Password reset failed');
        }
        
        showMessage('Password reset email sent! Please check your inbox.', 'success');
        
    } catch (error) {
        console.error('Password reset error:', error);
        showMessage(error.message || 'Password reset failed. Please try again.', 'error');
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('auth-message');
    if (!messageContainer) return;
    
    // Clear existing classes
    messageContainer.className = 'auth-message';
    
    // Add type-specific class
    messageContainer.classList.add(`auth-message--${type}`);
    
    // Set message text
    messageContainer.textContent = message;
    
    // Show message
    messageContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }
}

// Wait for AuthService to be available
function waitForAuthService(maxAttempts = 30) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const checkAuthService = () => {
            attempts++;
            
            if (typeof AuthService !== 'undefined') {
                console.log('AuthService is available');
                resolve(AuthService);
            } else if (attempts >= maxAttempts) {
                console.error('AuthService not available after maximum attempts');
                reject(new Error('Authentication service is not available. Please refresh the page.'));
            } else {
                setTimeout(checkAuthService, 200);
            }
        };
        
        checkAuthService();
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing login...');
    initializeLogin();
});

// Also initialize if the script loads after DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM already ready, initializing login...');
    initializeLogin();
} 