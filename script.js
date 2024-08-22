document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const expenseList = document.getElementById('expenseList');
    const totalAmount = document.getElementById('totalAmount');
    const shopkeeperSelect = document.getElementById('shopkeeper');
    const addExpenseButton = document.getElementById('addExpense');
    const addShopkeeperButton = document.getElementById('addShopkeeper');
    const deleteShopkeeperIcon = document.getElementById('deleteShopkeeper');
    const shopkeeperModal = document.getElementById('shopkeeperModal');
    const deleteShopkeeperModal = document.getElementById('deleteShopkeeperModal');
    const monthlyExpenseModal = document.getElementById('monthlyExpenseModal');
    const dailyExpenseModal = document.getElementById('dailyExpenseModal');
    const saveShopkeeperButton = document.getElementById('saveShopkeeper');
    const confirmDeleteShopkeeperButton = document.getElementById('confirmDeleteShopkeeper');
    const closeModalButtons = document.getElementsByClassName('close');
    const selectedDateText = document.getElementById('selectedDate');
    const viewMonthlyExpensesButton = document.getElementById('viewMonthlyExpenses');
    const viewDailyExpensesButton = document.getElementById('viewDailyExpenses');
    const monthlyExpenseList = document.getElementById('monthlyExpenseList');

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let shopkeepers = JSON.parse(localStorage.getItem('shopkeepers')) || [];
    let currentExpenseIndex = null; // Track the index of the expense being edited
    let selectedShopkeeper = null; // To track which shopkeeper is selected for deletion

    // Initialize Flatpickr on the date input
    flatpickr("#date", {
        dateFormat: "Y-m-d",
        onChange: function (selectedDates, dateStr, instance) {
            updateExpenseList(dateStr); // Update the expense list when a new date is selected
        }
    });
// Function to format date to DD-MM-YYYY
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
} 
    // Update expense list based on selected date
    function updateExpenseList(date) {
        expenseList.innerHTML = '';
        let total = 0;
      
      // Create table elements
    const table = document.createElement('table');
      table.className = 'styled-table';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);
      
      thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Payment-Mode</th>
            <th>Cost</th>
            <th>Store</th>
            <th>Actions</th>
        </tr>
    `;
        const selectedDate = new Date(date);
      const selectedMonth = selectedDate.getMonth();
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        const selectedMonthName = selectedDate.toLocaleDateString('en-US', { month: 'long' }); // Get the month name
        selectedDateText.textContent = ` ${selectedMonthName}`;
expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === selectedMonth; // Filter by month
  }).forEach((expense, index) => {
    const tr = document.createElement('tr');
        tr.innerHTML = `
           <td>${formatDate(expense.date)}</td>
            <td>${expense.description}</td>
            <td>$${expense.amount}</td>
            <td>${expense.shopkeeper}</td>
            <td>
                <i class="fas fa-edit edit-icon" data-index="${index}"></i>
                <i class="fas fa-trash delete-icon" data-index="${index}"></i>
            </td>
        `;
  tbody.appendChild(tr);
        total += parseFloat(expense.amount);
  }); 
        totalAmount.textContent = `Total: $${total.toFixed(2)}`;
       expenseList.appendChild(table);

        // Add event listeners for edit and delete icons
        document.querySelectorAll('.edit-icon').forEach(icon => {
            icon.addEventListener('click', editExpense);
        });

        document.querySelectorAll('.delete-icon').forEach(icon => {
            icon.addEventListener('click', deleteExpense);
        });
    }

    // Update shopkeeper list in the select dropdown
    function updateShopkeeperList() {
        shopkeeperSelect.innerHTML = '';
        shopkeepers.sort().forEach(shopkeeper => {
            const option = document.createElement('option');
            option.value = shopkeeper;
            option.textContent = shopkeeper;
            shopkeeperSelect.appendChild(option);
        });
    }

    // Clear the expense form fields
    function clearExpenseForm() {
        document.getElementById('date').value = '';
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
        shopkeeperSelect.value = ''; // Clear selection
    }

    // Add or update an expense
    addExpenseButton.addEventListener('click', () => {
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const shopkeeper = shopkeeperSelect.value;

        if (date && description && amount && shopkeeper) {
            if (currentExpenseIndex !== null) {
                // Edit existing expense
                expenses[currentExpenseIndex] = { date, description, amount, shopkeeper };
                currentExpenseIndex = null;
            } else {
                // Add new expense
                expenses.push({ date, description, amount, shopkeeper });
            }
            localStorage.setItem('expenses', JSON.stringify(expenses));
            updateExpenseList(date);
            clearExpenseForm();
        }
    });

    // Edit an expense
    function editExpense(event) {
        currentExpenseIndex = event.target.dataset.index;
        const expense = expenses[currentExpenseIndex];

        document.getElementById('date').value = expense.date;
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        shopkeeperSelect.value = expense.shopkeeper;
    }

    // Delete an expense
    function deleteExpense(event) {
        const index = event.target.dataset.index;
        expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Re-update the list with the currently selected date
        const date = document.getElementById('date').value;
        updateExpenseList(date);
    }

    // Show Add Shopkeeper Modal
    addShopkeeperButton.addEventListener('click', () => {
        shopkeeperModal.style.display = 'block';
    });

    // Hide modals
    Array.from(closeModalButtons).forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Save new shopkeeper
    saveShopkeeperButton.addEventListener('click', () => {
        const newShopkeeper = document.getElementById('newShopkeeper').value;
        if (newShopkeeper && !shopkeepers.includes(newShopkeeper)) {
            shopkeepers.push(newShopkeeper);
            localStorage.setItem('shopkeepers', JSON.stringify(shopkeepers));
            updateShopkeeperList();
            shopkeeperModal.style.display = 'none';
        }
    });

    // Show Delete Shopkeeper Modal
    deleteShopkeeperIcon.addEventListener('click', () => {
        selectedShopkeeper = shopkeeperSelect.value;
        if (selectedShopkeeper) {
            deleteShopkeeperModal.style.display = 'block';
        }
    });

    // Confirm delete shopkeeper
    confirmDeleteShopkeeperButton.addEventListener('click', () => {
        if (selectedShopkeeper !== null) {
            shopkeepers = shopkeepers.filter(shopkeeper => shopkeeper !== selectedShopkeeper);
            localStorage.setItem('shopkeepers', JSON.stringify(shopkeepers));
            updateShopkeeperList();
            deleteShopkeeperModal.style.display = 'none';
            selectedShopkeeper = null;
        }
    });

       // View Monthly Expenses Modal
    viewMonthlyExpensesButton.addEventListener('click', () => {
        const monthlyExpenses = getMonthlyExpenses();
        if (monthlyExpenses.length > 0) {
            drawMonthlyExpenseChart(monthlyExpenses);
        }
        monthlyExpenseModal.style.display = 'block';
    });

    // View Daily Expenses Modal for the selected month
    viewDailyExpensesButton.addEventListener('click', () => {
        const monthlyExpenses = getMonthlyExpenses();
        if (monthlyExpenses.length > 0) {
            updateDailyExpenseList(monthlyExpenses);
        }
        dailyExpenseModal.style.display = 'block';
    });

    // Get all expenses for the currently selected month
    function getMonthlyExpenses() {
        const selectedDate = document.getElementById('date').value;
        if (!selectedDate) return [];

        const selectedMonth = new Date(selectedDate).getMonth();
        const selectedYear = new Date(selectedDate).getFullYear();

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
        });
    }

    // Draw the pie chart for monthly expenses
    function drawMonthlyExpenseChart(monthlyExpenses) {
        const shopkeeperTotals = {};

        monthlyExpenses.forEach(expense => {
            if (!shopkeeperTotals[expense.shopkeeper]) {
                shopkeeperTotals[expense.shopkeeper] = 0;
            }
            shopkeeperTotals[expense.shopkeeper] += parseFloat(expense.amount);
        });

        const shopkeepers = Object.keys(shopkeeperTotals);
        const totals = Object.values(shopkeeperTotals);

        new Chart(expenseChart, {
            type: 'pie',
            data: {
                labels: shopkeepers,
                datasets: [{
                    data: totals,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                    ]
                }]
            }
        });
    }

    // Update the list of daily expenses for the selected month
    function updateDailyExpenseList(monthlyExpenses) {
        monthlyExpenseList.innerHTML = '';

        const dailyExpenses = {};
        monthlyExpenses.forEach(expense => {
            if (!dailyExpenses[expense.date]) {
                dailyExpenses[expense.date] = 0;
            }
            dailyExpenses[expense.date] += parseFloat(expense.amount);
        });

        Object.keys(dailyExpenses).forEach(date => {
            const li = document.createElement('li');
            li.textContent = `${date}: $${dailyExpenses[date].toFixed(2)}`;
            monthlyExpenseList.appendChild(li);
        });
    }


    // Initialize shopkeeper list
    updateShopkeeperList();

    // Initialize the expense list if a date is already selected
    const selectedDate = document.getElementById('date').value;
    if (selectedDate) {
        updateExpenseList(selectedDate);
    }
});
