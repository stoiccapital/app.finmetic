// Goals Module - Handles financial goals management
class Goals {
    constructor() {
        this.goalsKey = 'finmetic_goals';
        this.init();
    }
    
    init() {
        this.setupGoalsForm();
        this.loadGoals();
    }
    
    setupGoalsForm() {
        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleGoalSubmit();
            });
        }
    }
    
    handleGoalSubmit() {
        const formData = this.getFormData();
        if (this.validateFormData(formData)) {
            const goal = this.createGoal(formData);
            this.saveGoal(goal);
            this.displayGoals();
            alert('Goal saved successfully!');
        }
    }
    
    getFormData() {
        return {
            currentAssets: parseFloat(document.getElementById('currentAssets').value) || 0,
            targetAssets: parseFloat(document.getElementById('targetAssets').value) || 0,
            targetDate: document.getElementById('targetDate').value,
            monthlySavings: parseFloat(document.getElementById('monthlySavings').value) || 0,
            yearlyIncome: parseFloat(document.getElementById('yearlyIncome').value) || 0,
            compoundingRate: parseFloat(document.getElementById('compoundingRate').value) || 0
        };
    }
    
    validateFormData(data) {
        if (data.currentAssets < 0 || data.targetAssets <= 0 || data.monthlySavings < 0 || 
            data.yearlyIncome < 0 || data.compoundingRate < 0 || data.compoundingRate > 100 || !data.targetDate) {
            alert('Please check your input values');
            return false;
        }
        return true;
    }
    
    createGoal(formData) {
        const targetDate = new Date(formData.targetDate);
        const today = new Date();
        const monthsToTarget = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24 * 30));
        
        return {
            currentAssets: formData.currentAssets,
            targetAssets: formData.targetAssets,
            targetDate: formData.targetDate,
            monthlySavings: formData.monthlySavings,
            yearlyIncome: formData.yearlyIncome,
            compoundingRate: formData.compoundingRate,
            monthsToTarget: monthsToTarget,
            progress: (formData.currentAssets / formData.targetAssets) * 100
        };
    }
    
    saveGoal(goal) {
        localStorage.setItem(this.goalsKey, JSON.stringify(goal));
    }
    
    getGoal() {
        const goalData = localStorage.getItem(this.goalsKey);
        return goalData ? JSON.parse(goalData) : null;
    }
    
    loadGoals() {
        this.displayGoals();
    }
    
    displayGoals() {
        const goalsDisplay = document.getElementById('goalsDisplay');
        const goal = this.getGoal();
        
        if (!goal) {
            goalsDisplay.innerHTML = '<p>No goal created yet. Create your financial goal using the form.</p>';
            return;
        }
        
        const targetDate = new Date(goal.targetDate);
        const formattedDate = targetDate.toLocaleDateString();
        
        goalsDisplay.innerHTML = `
            <div>
                <p><strong>Current Assets:</strong> $${goal.currentAssets}</p>
                <p><strong>Target Assets:</strong> $${goal.targetAssets}</p>
                <p><strong>Target Date:</strong> ${formattedDate}</p>
                <p><strong>Monthly Savings:</strong> $${goal.monthlySavings}</p>
                <p><strong>Yearly Income:</strong> $${goal.yearlyIncome}</p>
                <p><strong>Compounding Rate:</strong> ${goal.compoundingRate}%</p>
                <p><strong>Progress:</strong> ${goal.progress.toFixed(1)}%</p>
                <p><strong>Months to Target:</strong> ${goal.monthsToTarget}</p>
            </div>
        `;
        
        // Populate form fields with existing goal data
        document.getElementById('currentAssets').value = goal.currentAssets;
        document.getElementById('targetAssets').value = goal.targetAssets;
        document.getElementById('targetDate').value = goal.targetDate;
        document.getElementById('monthlySavings').value = goal.monthlySavings;
        document.getElementById('yearlyIncome').value = goal.yearlyIncome;
        document.getElementById('compoundingRate').value = goal.compoundingRate;
    }
    
    clearForm() {
        document.getElementById('goalForm').reset();
    }
    
    downloadGoalAsJson() {
        const goal = this.getGoal();
        if (!goal) {
            alert('No goal data to download');
            return;
        }

        const jsonData = JSON.stringify(goal, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial_goal_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

function clearGoalForm() {
    goalsInstance.clearForm();
} 