// Environment Variables Loader
// This script loads environment variables from .env.local and makes them available globally

class EnvLoader {
    static async loadEnvVariables() {
        try {
            // Try to fetch the .env.local file
            const response = await fetch('/.env.local');
            if (!response.ok) {
                console.warn('Could not load .env.local file, using fallback values');
                return this.getFallbackValues();
            }
            
            const envContent = await response.text();
            const envVars = this.parseEnvFile(envContent);
            
            // Make environment variables available globally
            window.ENV = envVars;
            
            console.log('Environment variables loaded successfully');
            return envVars;
            
        } catch (error) {
            console.warn('Error loading environment variables:', error);
            return this.getFallbackValues();
        }
    }
    
    static parseEnvFile(content) {
        const vars = {};
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip comments and empty lines
            if (trimmedLine.startsWith('#') || trimmedLine === '') {
                continue;
            }
            
            // Parse KEY=value format
            const equalIndex = trimmedLine.indexOf('=');
            if (equalIndex > 0) {
                const key = trimmedLine.substring(0, equalIndex).trim();
                const value = trimmedLine.substring(equalIndex + 1).trim();
                vars[key] = value;
            }
        }
        
        return vars;
    }
    
    static getFallbackValues() {
        // Return fallback values if .env.local is not available
        return {
            SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
            SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
        };
    }
}

// Export for use in other files
window.EnvLoader = EnvLoader; 