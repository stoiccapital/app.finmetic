// Analytics Page JavaScript

class Analytics {
    constructor() {
        this.transactions = this.loadTransactions();
        this.initializeCharts();
        this.updateAnalytics();
    }

    loadTransactions() {
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    }

    initializeCharts() {
        // Create charts for income and expense breakdowns
        this.incomeChart = new Chart(
            document.createElement('canvas'),
            {
                type: 'doughnut',
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            }
        );

        this.expenseChart = new Chart(
            document.createElement('canvas'),
            {
                type: 'doughnut',
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            }
        );

        // Add charts to the DOM
        document.getElementById('incomeBreakdown').appendChild(this.incomeChart.canvas);
        document.getElementById('expenseBreakdown').appendChild(this.expenseChart.canvas);
    }

    updateAnalytics() {
        if (this.transactions.length === 0) {
            document.getElementById('noDataMessage').style.display = 'block';
            return;
        }
        document.getElementById('noDataMessage').style.display = 'none';

        this.updateMonthlyAnalytics();
        this.updateCategoryBreakdown();
        this.updateKPIs();
    }

    updateMonthlyAnalytics() {
        // Group transactions by month
        const monthlyData = {};
        
        this.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    income: 0,
                    expenses: 0
                };
            }

            if (transaction.type === 'income') {
                monthlyData[monthKey].income += transaction.amount;
            } else {
                monthlyData[monthKey].expenses += Math.abs(transaction.amount);
            }
        });

        // Sort months and create table rows
        const sortedMonths = Object.keys(monthlyData).sort().reverse();
        const tableBody = document.getElementById('monthlyAnalyticsBody');
        tableBody.innerHTML = sortedMonths.map(month => {
            const data = monthlyData[month];
            const netIncome = data.income - data.expenses;
            const savingsRate = data.income > 0 ? ((data.income - data.expenses) / data.income * 100) : 0;
            
            return `
                <tr>
                    <td>${this.formatMonth(month)}</td>
                    <td class="amount positive">${this.formatCurrency(data.income)}</td>
                    <td class="amount negative">${this.formatCurrency(data.expenses)}</td>
                    <td class="amount ${netIncome >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(netIncome)}</td>
                    <td>${savingsRate.toFixed(1)}%</td>
                </tr>
            `;
        }).join('');
    }

    updateCategoryBreakdown() {
        // Process income categories
        const incomeByCategory = {};
        const expenseByCategory = {};

        this.transactions.forEach(transaction => {
            const amount = Math.abs(transaction.amount);
            if (transaction.type === 'income') {
                incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + amount;
            } else {
                expenseByCategory[transaction.category] = (expenseByCategory[transaction.category] || 0) + amount;
            }
        });

        // Update income chart
        this.updateChart(this.incomeChart, incomeByCategory, 'Income by Category', [
            '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9'
        ]);

        // Update expense chart
        this.updateChart(this.expenseChart, expenseByCategory, 'Expenses by Category', [
            '#F44336', '#E57373', '#EF9A9A', '#FFCDD2', '#FFEBEE'
        ]);
    }

    updateChart(chart, data, label, colorPalette) {
        const labels = Object.keys(data);
        const values = Object.values(data);
        const colors = colorPalette.slice(0, labels.length);

        chart.data = {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 1
            }]
        };
        chart.options.plugins.title = {
            display: true,
            text: label
        };
        chart.update();
    }

    updateKPIs() {
        let totalIncome = 0;
        let totalExpenses = 0;

        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += Math.abs(transaction.amount);
            }
        });

        const netIncome = totalIncome - totalExpenses;
        const avgSavingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

        document.getElementById('totalIncomeKPI').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpensesKPI').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('netIncomeKPI').textContent = this.formatCurrency(netIncome);
        document.getElementById('avgSavingsRateKPI').textContent = `${avgSavingsRate.toFixed(1)}%`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatMonth(monthKey) {
        const [year, month] = monthKey.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    }
}

// Initialize Analytics
const analytics = new Analytics(); 