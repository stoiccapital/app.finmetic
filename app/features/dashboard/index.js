// Dashboard Module
class Dashboard {
    constructor() {
        this.goalsKey = 'finmetic_goals';  // Same key as in Goals class
        this.init();
    }

    init() {
        this.loadDashboardData();
        // Update dashboard every minute
        setInterval(() => this.loadDashboardData(), 60000);
    }

    loadDashboardData() {
        // Load goals data
        const goalsData = this.getGoalsData();
        
        // Update Portfolio and Target Values
        this.updatePortfolioAndTarget(goalsData);
        
        // Update Current Savings
        this.updateCurrentSavings();
        
        // Update Monthly Savings Target
        this.updateMonthlySavingsTarget(goalsData);
        
        // Update Goal Progress
        this.updateGoalProgress(goalsData);
    }

    getGoalsData() {
        const goalData = localStorage.getItem(this.goalsKey);
        return goalData ? JSON.parse(goalData) : null;
    }

    getTransactions() {
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    }

    updateCurrentSavings() {
        const savingsElement = document.querySelector('.dashboard-card:nth-child(3) .dashboard-card__value');
        const savingsChangeElement = document.querySelector('.dashboard-card:nth-child(3) .dashboard-card__change');
        
        const transactions = this.getTransactions();
        
        if (transactions.length > 0) {
            const totalIncome = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalExpenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const netIncome = totalIncome - totalExpenses;
            
            // Calculate monthly average
            const dates = transactions.map(t => new Date(t.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                             (maxDate.getMonth() - minDate.getMonth()) + 1;
            const monthlyAverage = netIncome / monthsDiff;

            const formattedNetIncome = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(netIncome);

            const formattedMonthlyAvg = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(monthlyAverage);

            savingsElement.textContent = formattedNetIncome;
            savingsChangeElement.textContent = `Avg. ${formattedMonthlyAvg}/month`;
            savingsChangeElement.className = `dashboard-card__change dashboard-card__change--${netIncome >= 0 ? 'positive' : 'negative'}`;
        } else {
            savingsElement.textContent = '$0.00';
            savingsChangeElement.textContent = 'No transactions yet';
            savingsChangeElement.className = 'dashboard-card__change';
        }
    }

    updatePortfolioAndTarget(goalsData) {
        // Update Current Portfolio
        const portfolioValueElement = document.querySelector('.dashboard-card:nth-child(1) .dashboard-card__value');
        const portfolioChangeElement = document.querySelector('.dashboard-card:nth-child(1) .dashboard-card__change');
        const progressBarElement = document.querySelector('.progress-bar__fill');
        
        // Update Target Assets
        const targetValueElement = document.querySelector('.dashboard-card:nth-child(2) .dashboard-card__value');
        const targetChangeElement = document.querySelector('.dashboard-card:nth-child(2) .dashboard-card__change');
        
        if (goalsData && goalsData.currentAssets !== undefined && goalsData.targetAssets !== undefined) {
            // Format the current assets value
            const formattedCurrentValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(goalsData.currentAssets);
            
            // Format the target assets value
            const formattedTargetValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(goalsData.targetAssets);
            
            // Calculate progress percentage
            const progressPercentage = (goalsData.currentAssets / goalsData.targetAssets * 100).toFixed(1);
            
            // Update Current Portfolio
            portfolioValueElement.textContent = formattedCurrentValue;
            progressBarElement.style.width = `${Math.min(100, progressPercentage)}%`;
            portfolioChangeElement.textContent = `${progressPercentage}% of target`;
            portfolioChangeElement.className = 'dashboard-card__change dashboard-card__change--positive';
            
            // Update Target Assets
            targetValueElement.textContent = formattedTargetValue;
            
            // Calculate remaining amount
            const remaining = goalsData.targetAssets - goalsData.currentAssets;
            const formattedRemaining = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(remaining);
            
            targetChangeElement.textContent = `${remaining > 0 ? formattedRemaining + ' to go' : 'Target reached!'}`;
            targetChangeElement.className = `dashboard-card__change dashboard-card__change--${remaining > 0 ? 'neutral' : 'positive'}`;
        } else {
            // Reset to default values if no data
            portfolioValueElement.textContent = '$0.00';
            progressBarElement.style.width = '0%';
            portfolioChangeElement.textContent = 'No goal set';
            portfolioChangeElement.className = 'dashboard-card__change';
            
            targetValueElement.textContent = '$0.00';
            targetChangeElement.textContent = 'No target set';
            targetChangeElement.className = 'dashboard-card__change';
        }
    }

    updateMonthlySavingsTarget(goalsData) {
        const savingsElement = document.querySelector('.dashboard-card:nth-child(4) .dashboard-card__value');
        const savingsChangeElement = document.querySelector('.dashboard-card:nth-child(4) .dashboard-card__change');
        
        if (goalsData && goalsData.monthlySavings !== undefined) {
            const formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(goalsData.monthlySavings);
            
            savingsElement.textContent = formattedValue;
            savingsChangeElement.textContent = 'Monthly target';
            savingsChangeElement.className = 'dashboard-card__change dashboard-card__change--positive';
        } else {
            savingsElement.textContent = '$0.00';
            savingsChangeElement.textContent = 'No savings goal';
            savingsChangeElement.className = 'dashboard-card__change';
        }
    }

    updateGoalProgress(goalsData) {
        const progressElement = document.querySelector('.dashboard-card:nth-child(5) .dashboard-card__value');
        const progressChangeElement = document.querySelector('.dashboard-card:nth-child(5) .dashboard-card__change');
        
        if (goalsData && goalsData.progress !== undefined) {
            progressElement.textContent = `${goalsData.progress.toFixed(1)}%`;
            
            // Determine if on track based on progress and time remaining
            const today = new Date();
            const targetDate = new Date(goalsData.targetDate);
            const totalDays = (targetDate - new Date(goalsData.targetDate).setFullYear(targetDate.getFullYear() - 1)) / (1000 * 60 * 60 * 24);
            const daysRemaining = (targetDate - today) / (1000 * 60 * 60 * 24);
            const expectedProgress = ((totalDays - daysRemaining) / totalDays) * 100;
            
            if (goalsData.progress >= expectedProgress) {
                progressChangeElement.textContent = 'On track';
                progressChangeElement.className = 'dashboard-card__change dashboard-card__change--positive';
            } else {
                progressChangeElement.textContent = 'Behind schedule';
                progressChangeElement.className = 'dashboard-card__change dashboard-card__change--negative';
            }
        } else {
            progressElement.textContent = '0%';
            progressChangeElement.textContent = 'No goal set';
            progressChangeElement.className = 'dashboard-card__change';
        }
    }
}

// Check authentication before initializing dashboard
async function checkAuthAndInit() {
    console.log('Dashboard index.js - checking authentication...');
    
    // Check localStorage first
    const localUser = localStorage.getItem('finmetic_user');
    if (!localUser) {
        console.log('No user data found, redirecting to login...');
        window.location.href = '/login/login.html';
        return;
    }
    
    const userData = JSON.parse(localUser);
    if (!userData.isLoggedIn) {
        console.log('User not logged in, redirecting to login...');
        window.location.href = '/login/login.html';
        return;
    }
    
    console.log('Authentication passed, initializing dashboard...');
    // Initialize Dashboard when the script loads
    const dashboard = new Dashboard();
}

// Run authentication check and initialization
checkAuthAndInit(); 