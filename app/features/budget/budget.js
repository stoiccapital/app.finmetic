// Budget Planner JavaScript
class BudgetPlanner {
    constructor() {
        this.chart = null;
        
        // Get current date for initial month/year
        const now = new Date();
        this.currentMonth = now.getMonth();
        this.currentYear = now.getFullYear();
        
        // Initialize empty arrays
        this.incomeItems = [];
        this.expenseItems = [];
        
        // Make instance globally available
        window.budgetPlanner = this;
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Set current month in the UI first
        this.setCurrentMonth();
        
        // Load saved data for current month
        this.loadCurrentBudget();
        
        // Then set up event listeners
        this.setupEventListeners();
        
        // Update calculations and display
        this.updateCalculations();
    }

    setupEventListeners() {
        // Form submission listeners
        document.getElementById('income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncomeItem();
        });

        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpenseItem();
        });

        // Month/Year change listeners
        document.getElementById('month-select').addEventListener('change', () => {
            this.loadCurrentBudget();
        });

        document.getElementById('year-select').addEventListener('change', () => {
            this.loadCurrentBudget();
        });

        // Button listeners
        document.getElementById('save-budget').addEventListener('click', () => {
            this.saveBudget();
        });

        document.getElementById('reset-budget').addEventListener('click', () => {
            this.resetBudget();
        });

        // Auto-save when window is closed
        window.addEventListener('beforeunload', () => {
            this.saveCurrentBudget();
        });
    }

    setCurrentMonth() {
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        monthSelect.value = months[this.currentMonth];
        yearSelect.value = this.currentYear;
    }

    getCurrentBudgetKey() {
        const month = document.getElementById('month-select').value;
        const year = document.getElementById('year-select').value;
        return `budget-${month}-${year}`;
    }

    addIncomeItem() {
        const description = document.getElementById('income-description').value.trim();
        const category = document.getElementById('income-category').value;
        const amount = parseFloat(document.getElementById('income-amount').value);

        if (!description || !category || !amount || amount <= 0) {
            alert('Please fill in all fields with valid values.');
            return;
        }

        const item = {
            id: Date.now(),
            description,
            category,
            amount,
            date: new Date().toISOString(),
            type: 'income'
        };

        this.incomeItems.push(item);
        this.saveCurrentBudget();
        this.renderIncomeItems();
        this.updateCalculations();
        this.clearIncomeForm();
    }

    addExpenseItem() {
        const description = document.getElementById('expense-description').value.trim();
        const category = document.getElementById('expense-category').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);

        if (!description || !category || !amount || amount <= 0) {
            alert('Please fill in all fields with valid values.');
            return;
        }

        const item = {
            id: Date.now(),
            description,
            category,
            amount,
            date: new Date().toISOString(),
            type: 'expense'
        };

        this.expenseItems.push(item);
        this.saveCurrentBudget();
        this.renderExpenseItems();
        this.updateCalculations();
        this.clearExpenseForm();
    }

    removeIncomeItem(id) {
        this.incomeItems = this.incomeItems.filter(item => item.id !== id);
        this.saveCurrentBudget();
        this.renderIncomeItems();
        this.updateCalculations();
    }

    removeExpenseItem(id) {
        this.expenseItems = this.expenseItems.filter(item => item.id !== id);
        this.saveCurrentBudget();
        this.renderExpenseItems();
        this.updateCalculations();
    }

    clearIncomeForm() {
        document.getElementById('income-description').value = '';
        document.getElementById('income-category').value = '';
        document.getElementById('income-amount').value = '';
        document.getElementById('income-description').focus();
    }

    clearExpenseForm() {
        document.getElementById('expense-description').value = '';
        document.getElementById('expense-category').value = '';
        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-description').focus();
    }

    renderIncomeItems() {
        const container = document.getElementById('income-items');
        
        if (this.incomeItems.length === 0) {
            container.innerHTML = '<div class="empty-message">No income items added yet</div>';
            return;
        }

        container.innerHTML = this.incomeItems.map(item => `
            <div class="item">
                <div class="item-info">
                    <div class="item-description">${item.description}</div>
                    <div class="item-category">${this.getCategoryDisplayName(item.category)}</div>
                </div>
                <div class="item-amount">$${item.amount.toFixed(2)}</div>
                <div class="item-actions">
                    <button class="btn-remove" onclick="budgetPlanner.removeIncomeItem(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    renderExpenseItems() {
        const container = document.getElementById('expense-items');
        
        if (this.expenseItems.length === 0) {
            container.innerHTML = '<div class="empty-message">No expense items added yet</div>';
            return;
        }

        container.innerHTML = this.expenseItems.map(item => `
            <div class="item">
                <div class="item-info">
                    <div class="item-description">${item.description}</div>
                    <div class="item-category">${this.getCategoryDisplayName(item.category)}</div>
                </div>
                <div class="item-amount">$${item.amount.toFixed(2)}</div>
                <div class="item-actions">
                    <button class="btn-remove" onclick="budgetPlanner.removeExpenseItem(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            // Income categories
            salary: 'Salary/Wages',
            freelance: 'Freelance/Side Income',
            investments: 'Investment Income',
            business: 'Business Income',
            rental: 'Rental Income',
            other: 'Other Income',
            
            // Expense categories
            housing: 'Housing',
            transportation: 'Transportation',
            food: 'Food & Dining',
            entertainment: 'Entertainment',
            healthcare: 'Healthcare',
            utilities: 'Utilities',
            insurance: 'Insurance',
            debt: 'Debt Payments',
            savings: 'Savings & Investments',
            education: 'Education',
            clothing: 'Clothing',
            personal: 'Personal Care',
            other: 'Other'
        };
        
        return categoryNames[category] || category;
    }

    updateCalculations() {
        const { totalIncome, totalExpenses } = this.calculateTotals();
        this.updateSummary(totalIncome, totalExpenses);
        this.updateVisualization(totalIncome, totalExpenses);
    }

    calculateTotals() {
        const totalIncome = this.incomeItems.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = this.expenseItems.reduce((sum, item) => sum + item.amount, 0);
        
        document.getElementById('total-income').textContent = totalIncome.toFixed(2);
        document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
        
        return { totalIncome, totalExpenses };
    }

    updateSummary(totalIncome, totalExpenses) {
        document.getElementById('summary-income').textContent = totalIncome.toFixed(2);
        document.getElementById('summary-expenses').textContent = totalExpenses.toFixed(2);
        
        const remainingBudget = totalIncome - totalExpenses;
        document.getElementById('remaining-budget').textContent = remainingBudget.toFixed(2);
        
        // Update remaining budget color based on value
        const remainingElement = document.querySelector('.remaining-budget');
        if (remainingElement) {
            remainingElement.className = 'summary-item remaining-budget ' + 
                (remainingBudget >= 0 ? 'positive' : 'negative');
        }
    }

    updateVisualization(totalIncome, totalExpenses) {
        this.createChart(totalIncome, totalExpenses);
        this.createTable(totalIncome, totalExpenses);
    }

    createChart(totalIncome, totalExpenses) {
        const ctx = document.getElementById('budgetChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        // Prepare data for income by category
        const incomeByCategory = {};
        this.incomeItems.forEach(item => {
            incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount;
        });

        // Prepare data for expenses by category
        const expensesByCategory = {};
        this.expenseItems.forEach(item => {
            expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
        });

        // Create datasets
        const datasets = [];

        // Add income dataset if there's income
        if (totalIncome > 0) {
            datasets.push({
                label: 'Income',
                data: Object.values(incomeByCategory),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            });
        }

        // Add expenses dataset if there's expenses
        if (totalExpenses > 0) {
            datasets.push({
                label: 'Expenses',
                data: Object.values(expensesByCategory),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            });
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [...new Set([
                    ...Object.keys(incomeByCategory),
                    ...Object.keys(expensesByCategory)
                ])].map(cat => this.getCategoryDisplayName(cat)),
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + value.toFixed(2)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y || 0;
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    createTable(totalIncome, totalExpenses) {
        const tbody = document.getElementById('budget-table-body');
        const rows = [];

        // Add income categories
        if (totalIncome > 0) {
            const incomeByCategory = {};
            this.incomeItems.forEach(item => {
                incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount;
            });

            Object.entries(incomeByCategory).forEach(([category, amount]) => {
                const percentage = ((amount / totalIncome) * 100).toFixed(1);
                rows.push(`
                    <tr class="income-row">
                        <td>${this.getCategoryDisplayName(category)} (Income)</td>
                        <td>$${amount.toFixed(2)}</td>
                        <td>${percentage}%</td>
                    </tr>
                `);
            });
        }

        // Add expense categories
        if (totalExpenses > 0) {
            const expensesByCategory = {};
            this.expenseItems.forEach(item => {
                expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
            });

            Object.entries(expensesByCategory).forEach(([category, amount]) => {
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                rows.push(`
                    <tr class="expense-row">
                        <td>${this.getCategoryDisplayName(category)} (Expense)</td>
                        <td>$${amount.toFixed(2)}</td>
                        <td>${percentage}%</td>
                    </tr>
                `);
            });
        }

        tbody.innerHTML = rows.join('');
    }

    getCurrentBudgetData() {
        return {
            month: document.getElementById('month-select').value,
            year: document.getElementById('year-select').value,
            incomeItems: this.incomeItems,
            expenseItems: this.expenseItems,
            timestamp: new Date().toISOString(),
            summary: {
                totalIncome: this.incomeItems.reduce((sum, item) => sum + item.amount, 0),
                totalExpenses: this.expenseItems.reduce((sum, item) => sum + item.amount, 0)
            }
        };
    }

    loadBudgetData() {
        try {
            const currentKey = this.getCurrentBudgetKey();
            const storedData = localStorage.getItem(currentKey);
            console.log('Loading budget data for:', currentKey);
            return storedData ? JSON.parse(storedData) : null;
        } catch (error) {
            console.error('Error loading budget data:', error);
            return null;
        }
    }

    saveBudgetData(data) {
        try {
            const currentKey = this.getCurrentBudgetKey();
            localStorage.setItem(currentKey, JSON.stringify(data));
            console.log('Saved budget data for:', currentKey);
        } catch (error) {
            console.error('Error saving budget data:', error);
        }
    }

    saveCurrentBudget() {
        const currentData = this.getCurrentBudgetData();
        this.saveBudgetData(currentData);
    }

    loadCurrentBudget() {
        const savedData = this.loadBudgetData();
        console.log('Loaded budget data:', savedData);
        
        if (savedData) {
            this.incomeItems = savedData.incomeItems || [];
            this.expenseItems = savedData.expenseItems || [];
            
            // Render the loaded data
            this.renderIncomeItems();
            this.renderExpenseItems();
            this.updateCalculations();
        }
    }

    saveBudget() {
        this.saveCurrentBudget();
        
        const savedAt = new Date().toLocaleString();
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = `Budget saved successfully at ${savedAt}`;
        
        document.querySelector('.budget-actions').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    resetBudget() {
        if (confirm('Are you sure you want to clear all budget items for this month? This cannot be undone.')) {
            this.incomeItems = [];
            this.expenseItems = [];
            
            this.renderIncomeItems();
            this.renderExpenseItems();
            this.updateCalculations();
            
            // Save the empty state
            this.saveCurrentBudget();
        }
    }
}

// Create instance when script loads
new BudgetPlanner();
