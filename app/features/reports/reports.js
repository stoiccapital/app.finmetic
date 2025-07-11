class ReportsManager {
    constructor() {
        this.currentPeriod = 'current-month';
        this.reportData = null;
        this.chart = null;
        this.initializeEventListeners();
        this.setInitialDates();
    }

    initializeEventListeners() {
        // Time frame buttons
        document.querySelectorAll('.time-frame-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleTimeFrameChange(e.target.dataset.period);
            });
        });

        // Custom date inputs
        document.getElementById('startDate').addEventListener('change', () => this.handleCustomDateChange());
        document.getElementById('endDate').addEventListener('change', () => this.handleCustomDateChange());

        // Generate report button
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());

        // Export button
        document.getElementById('exportReportBtn').addEventListener('click', () => this.exportToCSV());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    setInitialDates() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        document.getElementById('startDate').value = this.formatDate(firstDay);
        document.getElementById('endDate').value = this.formatDate(lastDay);
    }

    handleTimeFrameChange(period) {
        // Update active button
        document.querySelectorAll('.time-frame-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });

        // Show/hide custom date range
        const customDateRange = document.getElementById('customDateRange');
        customDateRange.style.display = period === 'custom' ? 'block' : 'none';

        this.currentPeriod = period;
        this.updateSelectedPeriodText();
        this.updateDateInputs(period);
    }

    updateDateInputs(period) {
        const today = new Date();
        let startDate, endDate;

        switch (period) {
            case 'current-month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'last-month':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'last-3-months':
                startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                endDate = today;
                break;
            case 'last-6-months':
                startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
                endDate = today;
                break;
            case 'current-year':
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                break;
            default:
                return; // Don't update for custom range
        }

        document.getElementById('startDate').value = this.formatDate(startDate);
        document.getElementById('endDate').value = this.formatDate(endDate);
    }

    handleCustomDateChange() {
        this.updateSelectedPeriodText();
    }

    updateSelectedPeriodText() {
        const selectedPeriodText = document.getElementById('selectedPeriodText');
        if (this.currentPeriod === 'custom') {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            selectedPeriodText.textContent = `${startDate} to ${endDate}`;
        } else {
            const periodTexts = {
                'current-month': 'Current Month',
                'last-month': 'Last Month',
                'last-3-months': 'Last 3 Months',
                'last-6-months': 'Last 6 Months',
                'current-year': 'Current Year'
            };
            selectedPeriodText.textContent = periodTexts[this.currentPeriod];
        }
    }

    async generateReport() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        // Get report configuration
        const config = {
            includeIncome: document.getElementById('includeIncome').checked,
            includeExpenses: document.getElementById('includeExpenses').checked,
            includeSummary: document.getElementById('includeSummary').checked,
            includeCategories: document.getElementById('includeCategories').checked
        };

        try {
            // Show loading state
            document.getElementById('generateReportBtn').disabled = true;
            
            // Get transactions for the period
            this.reportData = await this.fetchTransactionsForPeriod(startDate, endDate);
            
            // Update report sections based on configuration
            if (config.includeSummary) {
                this.updateSummarySection();
            }
            
            if (config.includeIncome || config.includeExpenses) {
                this.updateTransactionTables();
            }
            
            if (config.includeCategories) {
                this.updateCategoriesSection();
            }

            // Show report preview
            document.getElementById('reportPreviewSection').style.display = 'block';
            document.getElementById('reportDate').textContent = new Date().toLocaleString();
            
        } catch (error) {
            console.error('Error generating report:', error);
            // Show error message
        } finally {
            document.getElementById('generateReportBtn').disabled = false;
        }
    }

    async fetchTransactionsForPeriod(startDate, endDate) {
        // Get transactions from localStorage
        const savedTransactions = localStorage.getItem('transactions');
        let transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        
        // Filter transactions by date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        transactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= start && transactionDate <= end;
        });

        return {
            transactions: transactions
        };
    }

    updateSummarySection() {
        const summary = this.calculateSummary();
        const summaryHTML = `
            <div class="summary-grid">
                <div class="summary-card">
                    <h4>Total Income</h4>
                    <p class="amount positive">$${summary.totalIncome.toFixed(2)}</p>
                </div>
                <div class="summary-card">
                    <h4>Total Expenses</h4>
                    <p class="amount negative">$${Math.abs(summary.totalExpenses).toFixed(2)}</p>
                </div>
                <div class="summary-card">
                    <h4>Net Change</h4>
                    <p class="amount ${summary.netChange >= 0 ? 'positive' : 'negative'}">
                        $${summary.netChange.toFixed(2)}
                    </p>
                </div>
            </div>
        `;
        document.getElementById('reportSummary').innerHTML = summaryHTML;
    }

    updateTransactionTables() {
        // Update All Transactions table
        const transactionsHTML = this.reportData.transactions
            .map(t => `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.description}</td>
                    <td>${t.category}</td>
                    <td>${t.type}</td>
                    <td class="${t.amount >= 0 ? 'positive' : 'negative'}">
                        $${Math.abs(t.amount).toFixed(2)}
                    </td>
                </tr>
            `)
            .join('');
        document.getElementById('transactionsTableBody').innerHTML = transactionsHTML;

        // Update Income table
        const incomeHTML = this.reportData.transactions
            .filter(t => t.type === 'income')
            .map(t => `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.description}</td>
                    <td>${t.category}</td>
                    <td class="positive">$${t.amount.toFixed(2)}</td>
                </tr>
            `)
            .join('');
        document.getElementById('incomeTableBody').innerHTML = incomeHTML;

        // Update Expenses table
        const expensesHTML = this.reportData.transactions
            .filter(t => t.type === 'expense')
            .map(t => `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.description}</td>
                    <td>${t.category}</td>
                    <td class="negative">$${Math.abs(t.amount).toFixed(2)}</td>
                </tr>
            `)
            .join('');
        document.getElementById('expensesTableBody').innerHTML = expensesHTML;
    }

    updateCategoriesSection() {
        const categories = this.calculateCategoryBreakdown();
        
        // Update categories table
        const categoriesHTML = Object.entries(categories)
            .map(([category, data]) => `
                <tr>
                    <td>${category}</td>
                    <td class="${data.amount >= 0 ? 'positive' : 'negative'}">
                        $${Math.abs(data.amount).toFixed(2)}
                    </td>
                    <td>${data.percentage.toFixed(1)}%</td>
                </tr>
            `)
            .join('');
        document.getElementById('categoriesTableBody').innerHTML = categoriesHTML;

        // Update chart
        this.updateCategoryChart(categories);
    }

    updateCategoryChart(categories) {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const chartData = {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories).map(c => Math.abs(c.amount)),
                backgroundColor: this.generateChartColors(Object.keys(categories).length)
            }]
        };

        this.chart = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    calculateSummary() {
        const summary = this.reportData.transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.totalIncome += t.amount;
            } else {
                acc.totalExpenses += t.amount;
            }
            return acc;
        }, { totalIncome: 0, totalExpenses: 0 });

        summary.netChange = summary.totalIncome + summary.totalExpenses;
        return summary;
    }

    calculateCategoryBreakdown() {
        const categories = {};
        const total = this.reportData.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        this.reportData.transactions.forEach(t => {
            if (!categories[t.category]) {
                categories[t.category] = { amount: 0, percentage: 0 };
            }
            categories[t.category].amount += t.amount;
        });

        // Calculate percentages
        Object.values(categories).forEach(cat => {
            cat.percentage = (Math.abs(cat.amount) / total) * 100;
        });

        return categories;
    }

    generateChartColors(count) {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
        ];
        return colors.slice(0, count);
    }

    switchTab(tabId) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update visible tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabId}Tab`);
        });
    }

    exportToCSV() {
        const transactions = this.reportData.transactions;
        if (!transactions.length) return;

        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                t.date,
                `"${t.description}"`,
                t.category,
                t.type,
                t.amount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_report_${this.formatDate(new Date())}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
}

// Initialize the reports manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
}); 