// Portfolio Module - Handles portfolio management and tracking

class PortfolioManager {
    constructor() {
        this.positions = this.loadPositions();
        this.stockData = {};
        this.initializeEventListeners();
        this.updateUI();
        this.refreshPrices();
    }

    initializeEventListeners() {
        // Add position form submission
        document.getElementById('addPositionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPosition();
        });

        // Refresh prices button
        document.getElementById('refreshPricesBtn').addEventListener('click', () => {
            this.refreshPrices();
        });

        // Auto-refresh prices every 5 minutes
        setInterval(() => this.refreshPrices(), 300000);
    }

    async addPosition() {
        const symbol = document.getElementById('tickerSymbol').value.toUpperCase();
        const shares = parseFloat(document.getElementById('numberOfShares').value);
        const avgCost = parseFloat(document.getElementById('averageCost').value) || 0;

        try {
            // Fetch stock data to validate symbol and get company name
            const stockInfo = await this.fetchStockData(symbol);
            
            if (!stockInfo) {
                alert('Invalid ticker symbol. Please check and try again.');
                return;
            }

            const position = {
                id: Date.now(),
                symbol,
                companyName: stockInfo.companyName || symbol,
                shares,
                avgCost,
                currentPrice: stockInfo.price || 0,
                lastUpdated: new Date().toISOString()
            };

            this.positions.push(position);
            this.savePositions();
            this.updateUI();
            document.getElementById('addPositionForm').reset();
            
        } catch (error) {
            console.error('Error adding position:', error);
            alert('Error adding position. Please try again.');
        }
    }

    deletePosition(id) {
        if (confirm('Are you sure you want to delete this position?')) {
            this.positions = this.positions.filter(p => p.id !== id);
            this.savePositions();
            this.updateUI();
        }
    }

    async refreshPrices() {
        const refreshBtn = document.getElementById('refreshPricesBtn');
        const btnText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Updating...';
        refreshBtn.disabled = true;

        try {
            const symbols = [...new Set(this.positions.map(p => p.symbol))];
            const promises = symbols.map(symbol => this.fetchStockData(symbol));
            const results = await Promise.all(promises);

            // Update stock data cache
            results.forEach((data, index) => {
                if (data) {
                    this.stockData[symbols[index]] = data;
                }
            });

            // Update positions with new prices
            this.positions = this.positions.map(position => ({
                ...position,
                currentPrice: this.stockData[position.symbol]?.price || position.currentPrice,
                lastUpdated: new Date().toISOString()
            }));

            this.savePositions();
            this.updateUI();

        } catch (error) {
            console.error('Error refreshing prices:', error);
            alert('Error updating prices. Please try again.');
        } finally {
            refreshBtn.innerHTML = btnText;
            refreshBtn.disabled = false;
        }
    }

    async fetchStockData(symbol) {
        try {
            // This is a placeholder for actual API call
            // In production, you would use a real stock market API
            const response = await fetch(`https://api.example.com/stocks/${symbol}`);
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            return {
                symbol: data.symbol,
                companyName: data.companyName,
                price: data.price,
                change: data.change,
                changePercent: data.changePercent
            };
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            // Return mock data for demonstration
            return {
                symbol: symbol,
                companyName: `${symbol} Inc.`,
                price: Math.random() * 1000,
                change: Math.random() * 10 - 5,
                changePercent: Math.random() * 5 - 2.5
            };
        }
    }

    loadPositions() {
        const savedPositions = localStorage.getItem('portfolio_positions');
        return savedPositions ? JSON.parse(savedPositions) : [];
    }

    savePositions() {
        localStorage.setItem('portfolio_positions', JSON.stringify(this.positions));
    }

    updateUI() {
        this.updateSummary();
        this.updatePositionsTable();
    }

    updateSummary() {
        const summary = this.calculateSummary();

        document.getElementById('totalPositions').textContent = this.positions.length;
        document.getElementById('totalValue').textContent = this.formatCurrency(summary.totalValue);
        document.getElementById('totalCost').textContent = this.formatCurrency(summary.totalCost);
        document.getElementById('totalGainLoss').textContent = this.formatCurrency(summary.totalGainLoss);

        // Update gain/loss color
        const gainLossElement = document.getElementById('totalGainLoss');
        gainLossElement.className = 'summary-value ' + 
            (summary.totalGainLoss > 0 ? 'positive' : summary.totalGainLoss < 0 ? 'negative' : '');
    }

    updatePositionsTable() {
        const tableContainer = document.getElementById('positionsTableContainer');
        const emptyState = document.getElementById('positionsEmpty');
        const tableBody = document.getElementById('positionsTableBody');

        if (this.positions.length === 0) {
            tableContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        emptyState.style.display = 'none';

        tableBody.innerHTML = this.positions.map(position => {
            const marketValue = position.shares * position.currentPrice;
            const totalCost = position.shares * position.avgCost;
            const gainLoss = marketValue - totalCost;
            const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

            const gainLossClass = gainLoss > 0 ? 'positive' : gainLoss < 0 ? 'negative' : '';

            return `
                <tr>
                    <td><strong>${position.symbol}</strong></td>
                    <td>${position.companyName}</td>
                    <td>${position.shares.toFixed(3)}</td>
                    <td>${this.formatCurrency(position.avgCost)}</td>
                    <td>${this.formatCurrency(position.currentPrice)}</td>
                    <td>${this.formatCurrency(marketValue)}</td>
                    <td>${this.formatCurrency(totalCost)}</td>
                    <td class="${gainLossClass}">${this.formatCurrency(gainLoss)}</td>
                    <td class="${gainLossClass}">${gainLossPercent.toFixed(2)}%</td>
                    <td>
                        <button class="btn btn--icon btn--delete" onclick="portfolioManager.deletePosition(${position.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    calculateSummary() {
        return this.positions.reduce((summary, position) => {
            const marketValue = position.shares * position.currentPrice;
            const totalCost = position.shares * position.avgCost;

            summary.totalValue += marketValue;
            summary.totalCost += totalCost;
            summary.totalGainLoss = summary.totalValue - summary.totalCost;

            return summary;
        }, {
            totalValue: 0,
            totalCost: 0,
            totalGainLoss: 0
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}

// Initialize the manager when the DOM is loaded
let portfolioManager;
document.addEventListener('DOMContentLoaded', () => {
    portfolioManager = new PortfolioManager();
}); 