// Income and Expense Module - Handles financial tracking

class IncomeExpenseManager {
    constructor() {
        this.transactions = this.loadTransactions();
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        // Transaction form submission
        document.getElementById('addTransactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Transaction type toggle
        document.getElementById('typeIncome').addEventListener('change', () => this.updateCategoryVisibility());
        document.getElementById('typeExpense').addEventListener('change', () => this.updateCategoryVisibility());

        // Import/Export buttons
        document.getElementById('importCsvBtn').addEventListener('click', () => {
            document.getElementById('csvImportInput').click();
        });
        document.getElementById('csvImportInput').addEventListener('change', (e) => {
            this.importFromCsv(e.target.files[0]);
        });
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            this.exportToCsv();
        });

        // Filter and clear buttons
        document.getElementById('filterCategory').addEventListener('change', () => {
            this.updateTransactionsTable();
        });
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
                this.clearAllTransactions();
            }
        });

        // Set default date to today
        document.getElementById('transactionDate').valueAsDate = new Date();
    }

    updateCategoryVisibility() {
        const isIncome = document.getElementById('typeIncome').checked;
        const incomeCategoriesGroup = document.getElementById('incomeCategoriesGroup');
        const expenseCategoriesGroup = document.getElementById('expenseCategoriesGroup');
        
        if (isIncome) {
            incomeCategoriesGroup.style.display = '';
            expenseCategoriesGroup.style.display = 'none';
            // Select first income category
            const firstIncomeOption = incomeCategoriesGroup.querySelector('option');
            if (firstIncomeOption) firstIncomeOption.selected = true;
        } else {
            incomeCategoriesGroup.style.display = 'none';
            expenseCategoriesGroup.style.display = '';
            // Select first expense category
            const firstExpenseOption = expenseCategoriesGroup.querySelector('option');
            if (firstExpenseOption) firstExpenseOption.selected = true;
        }
    }

    addTransaction() {
        const type = document.getElementById('typeIncome').checked ? 'income' : 'expense';
        const description = document.getElementById('transactionDescription').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const category = document.getElementById('transactionCategory').value;
        const date = document.getElementById('transactionDate').value;

        const transaction = {
            id: Date.now(),
            date,
            description: description || `Unnamed ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            category,
            type,
            amount: type === 'expense' ? -amount : amount
        };

        this.transactions.push(transaction);
        this.saveTransactions();
        this.updateUI();
        document.getElementById('addTransactionForm').reset();
        // Reset date to today and category visibility
        document.getElementById('transactionDate').valueAsDate = new Date();
        document.getElementById('typeIncome').checked = true;
        this.updateCategoryVisibility();
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.updateUI();
    }

    clearAllTransactions() {
        this.transactions = [];
        this.saveTransactions();
        this.updateUI();
    }

    loadTransactions() {
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    updateUI() {
        this.updateSummary();
        this.updateTransactionsTable();
    }

    updateSummary() {
        // Calculate total income (positive amounts)
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Calculate total expenses (positive amounts for display)
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Calculate net income (income minus expenses)
        const netIncome = totalIncome - totalExpenses;

        // Calculate monthly average based on transaction dates
        let monthlyAverage = 0;
        if (this.transactions.length > 0) {
            const dates = this.transactions.map(t => new Date(t.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                             (maxDate.getMonth() - minDate.getMonth()) + 1;
            monthlyAverage = netIncome / monthsDiff;
        }

        // Update the UI with formatted values
        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(-totalExpenses); // Show as negative
        document.getElementById('netIncome').textContent = this.formatCurrency(netIncome);
        document.getElementById('monthlyAverage').textContent = this.formatCurrency(monthlyAverage);

        // Update classes based on values
        document.getElementById('totalIncome').className = 'summary-value summary-value--income';
        document.getElementById('totalExpenses').className = 'summary-value summary-value--expense';
        document.getElementById('netIncome').className = `summary-value ${netIncome >= 0 ? 'summary-value--income' : 'summary-value--expense'}`;
        document.getElementById('monthlyAverage').className = `summary-value ${monthlyAverage >= 0 ? 'summary-value--income' : 'summary-value--expense'}`;
    }

    updateTransactionsTable() {
        const filterValue = document.getElementById('filterCategory').value;
        const filteredTransactions = this.transactions
            .filter(t => !filterValue || t.type === filterValue)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const tableContainer = document.getElementById('transactionsTableContainer');
        const emptyState = document.getElementById('transactionsEmpty');
        const tableBody = document.getElementById('transactionsTableBody');

        if (filteredTransactions.length === 0) {
            tableContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        emptyState.style.display = 'none';
        
        tableBody.innerHTML = filteredTransactions.map(t => `
            <tr class="transaction-row ${t.type}">
                <td>${this.formatDate(t.date)}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td>${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                <td class="amount ${t.type}">${this.formatCurrency(t.amount)}</td>
                <td>
                    <button class="btn btn--icon btn--delete" onclick="incomeExpenseManager.deleteTransaction(${t.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    async importFromCsv(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const rows = text.split('\n').map(row => row.split(','));
            const headers = rows[0];
            
            const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
            const descriptionIndex = headers.findIndex(h => h.toLowerCase().includes('description'));
            const amountIndex = headers.findIndex(h => h.toLowerCase().includes('amount'));
            const typeIndex = headers.findIndex(h => h.toLowerCase().includes('type'));
            const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('category'));

            if (dateIndex === -1 || amountIndex === -1 || typeIndex === -1) {
                throw new Error('CSV must contain date, amount, and type columns');
            }

            const newTransactions = rows.slice(1)
                .filter(row => row.length >= Math.max(dateIndex, amountIndex, typeIndex))
                .map(row => ({
                    id: Date.now() + Math.random(),
                    date: row[dateIndex].trim(),
                    description: descriptionIndex !== -1 ? row[descriptionIndex].trim() : '',
                    amount: parseFloat(row[amountIndex].trim()),
                    type: row[typeIndex].trim().toLowerCase(),
                    category: categoryIndex !== -1 ? row[categoryIndex].trim() : 'other'
                }))
                .filter(t => !isNaN(t.amount) && ['income', 'expense'].includes(t.type));

            this.transactions = [...this.transactions, ...newTransactions];
            this.saveTransactions();
            this.updateUI();
            alert(`Successfully imported ${newTransactions.length} transactions`);
        } catch (error) {
            console.error('Error importing CSV:', error);
            alert('Error importing CSV. Please check the file format.');
        }
    }

    exportToCsv() {
        if (this.transactions.length === 0) {
            alert('No transactions to export');
            return;
        }

        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...this.transactions.map(t => [
                t.date,
                `"${t.description}"`,
                t.category,
                t.type,
                t.amount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// Initialize when the script loads
const incomeExpenseManager = new IncomeExpenseManager(); 