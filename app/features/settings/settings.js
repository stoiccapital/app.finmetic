class SettingsManager {
    constructor() {
        console.log('Initializing SettingsManager...');
        this.settings = this.loadSettings();
        this.initializeEventListeners();
        this.populateFormFields();
        console.log('SettingsManager initialized with settings:', this.settings);
    }

    initializeEventListeners() {
        console.log('Setting up event listeners...');
        
        // Save settings button
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('Save button clicked');
                this.saveSettings();
            });
        } else {
            console.error('Save button not found in DOM');
        }

        // Form input changes
        const inputs = document.querySelectorAll('.settings-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                console.log('Input changed:', input.id);
                this.handleInputChange(input);
            });
        });

        console.log('Event listeners setup complete');
    }

    handleInputChange(input) {
        // Update the settings object as user types
        const value = input.value.trim();
        if (['emailAddress', 'fullName', 'phoneNumber'].includes(input.id)) {
            this.settings.account[input.id] = value;
        }
    }

    loadSettings() {
        console.log('Loading settings from storage...');
        
        try {
            // First check if user is logged in
            const userData = localStorage.getItem('finmetic_user');
            console.log('User data found:', userData);

            if (!userData) {
                return this.createInitialSettings();
            }

            const user = JSON.parse(userData);
            
            // Try to load existing settings
            const savedSettings = localStorage.getItem('finmetic_user_settings');
            console.log('Saved settings found:', savedSettings);
            
            if (!savedSettings) {
                console.log('No saved settings found, creating with user data');
                // Create initial settings with user data
                const initialSettings = {
                    ...this.createInitialSettings(),
                    account: {
                        emailAddress: user.email || '',
                        fullName: user.name || '',
                        phoneNumber: ''
                    }
                };
                // Save initial settings as JSON
                localStorage.setItem('finmetic_user_settings', JSON.stringify(initialSettings));
                return initialSettings;
            }

            // Parse and validate the JSON structure
            const parsedSettings = JSON.parse(savedSettings);
            console.log('Parsed settings:', parsedSettings);
            
            // Validate the structure
            if (!this.isValidSettingsStructure(parsedSettings)) {
                console.warn('Invalid settings structure found, creating new settings with user data');
                const newSettings = {
                    ...this.createInitialSettings(),
                    account: {
                        emailAddress: user.email || '',
                        fullName: user.name || '',
                        phoneNumber: ''
                    }
                };
                localStorage.setItem('finmetic_user_settings', JSON.stringify(newSettings));
                return newSettings;
            }

            // Ensure the settings have the user's current data
            if (user.name && parsedSettings.account.fullName !== user.name) {
                console.log('Updating settings with current user name');
                parsedSettings.account.fullName = user.name;
            }
            if (user.email && parsedSettings.account.emailAddress !== user.email) {
                console.log('Updating settings with current user email');
                parsedSettings.account.emailAddress = user.email;
                localStorage.setItem('finmetic_user_settings', JSON.stringify(parsedSettings));
            }

            return parsedSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.createInitialSettings();
        }
    }

    createInitialSettings(name = '', email = '') {
        return {
            account: {
                emailAddress: email,
                fullName: name,
                phoneNumber: ''
            }
        };
    }

    saveSettings() {
        try {
            // Get all current form values
            const formData = this.getFormData();
            
            // Validate email
            if (!this.isValidEmail(formData.account.emailAddress)) {
                throw new Error('Please enter a valid email address');
            }

            // Validate required fields
            if (!formData.account.fullName.trim()) {
                throw new Error('Please enter your full name');
            }

            // Update settings
            this.settings = formData;
            
            // Save to storage as JSON
            if (this.saveToStorage(this.settings)) {
                // Update user data in localStorage
                const userData = localStorage.getItem('finmetic_user');
                const user = userData ? JSON.parse(userData) : {
                    isLoggedIn: true
                };
                
                user.name = formData.account.fullName;
                user.email = formData.account.emailAddress;
                
                // Save updated user data as JSON
                localStorage.setItem('finmetic_user', JSON.stringify(user));
                
                this.showMessage('Settings saved successfully', 'success');
                
                // Dispatch event to update navbar
                document.dispatchEvent(new CustomEvent('userSettingsChanged'));
                
                // Update navbar immediately if it exists
                if (window.navbar) {
                    console.log('Updating navbar with new name:', formData.account.fullName);
                    window.navbar.checkAuthStatus();
                }
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    getFormData() {
        return {
            account: {
                emailAddress: document.getElementById('emailAddress').value.trim(),
                fullName: document.getElementById('fullName').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim()
            }
        };
    }

    populateFormFields() {
        // Populate account settings
        document.getElementById('emailAddress').value = this.settings.account.emailAddress;
        document.getElementById('fullName').value = this.settings.account.fullName;
        document.getElementById('phoneNumber').value = this.settings.account.phoneNumber;
    }

    saveToStorage(settings) {
        try {
            // Save settings as JSON
            localStorage.setItem('finmetic_user_settings', JSON.stringify(settings));
            console.log('Settings saved as JSON:', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    isValidSettingsStructure(settings) {
        return settings 
            && settings.account
            && typeof settings.account.emailAddress === 'string'
            && typeof settings.account.fullName === 'string'
            && typeof settings.account.phoneNumber === 'string';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showMessage(message, type = 'success') {
        const messageElement = document.getElementById('settingsMessage');
        const messageText = document.getElementById('settingsMessageText');
        
        if (messageElement && messageText) {
            messageElement.className = `settings-message ${type}`;
            messageText.textContent = message;
            messageElement.style.display = 'flex';
            
            // Hide message after 3 seconds
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        }
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
