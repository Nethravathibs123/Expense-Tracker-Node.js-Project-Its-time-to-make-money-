
const amountInput = document.getElementById('amount-input');
const descriptionInput = document.getElementById('description-input');
const categorySelect = document.getElementById('category-select');
const addExpenseButton = document.getElementById('add-expense');
const expenseList = document.getElementById('expense-list');
const purchasePremiumButton = document.getElementById('purchase-premium');


let expenses = [];
let editingIndex = -1;

function renderExpenses() {
    expenseList.innerHTML = '';
    expenses.forEach((expense, index) => {
        const newli = document.createElement('li');
        newli.className = 'expense-content';
        newli.textContent = `${expense.amount} - ${expense.description || 'No description'} - ${expense.category}`;

        const dltButton = document.createElement('button');
        dltButton.textContent = 'Delete';
        dltButton.classList.add('delete-btn');
        dltButton.setAttribute('data-id', expense.id);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-btn');
        editButton.setAttribute('data-index', index);

        newli.appendChild(dltButton);
        newli.appendChild(editButton);
        expenseList.appendChild(newli);
    });
}

async function fetchExpenses() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/expenses', {
            headers: { Authorization: `Bearer ${token}` }
        });
        expenses = response.data;
        renderExpenses();
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}

addExpenseButton.addEventListener('click', async () => {
    const amount = amountInput.value;
    const description = descriptionInput.value;
    const category = categorySelect.value;

    if (amount && description && category) {
        const token = localStorage.getItem('token');
        const newExpense = { amount, description, category };

        if (editingIndex === -1) {  // Add new expense
            try {
                const response = await axios.post('http://localhost:3000/expenses', newExpense, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                expenses.push(response.data);
                fetchExpenses();
            } catch (error) {
                console.error('Error adding expense:', error);
            }
        } else {  // Update existing expense
            try {
                const id = expenses[editingIndex].id;
                await axios.put(`http://localhost:3000/expenses/${id}`, newExpense, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                expenses[editingIndex] = newExpense;
                editingIndex = -1;  // Reset editing index
                fetchExpenses();  // Re-fetch updated expenses
            } catch (error) {
                console.error('Error updating expense:', error);
            }
        }

        amountInput.value = '';
        descriptionInput.value = '';
        categorySelect.value = 'Food & Beverage';  // Reset to default category
    } else {
        alert('Please fill in all the details');
    }
});

expenseList.addEventListener('click', async (event) => {
    const token = localStorage.getItem('token');
    
    if (event.target.classList.contains('delete-btn')) {
        const id = event.target.getAttribute('data-id');
        try {
            await axios.delete(`http://localhost:3000/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expenses = expenses.filter(expense => expense.id !== parseInt(id));
            renderExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    }

    if (event.target.classList.contains('edit-btn')) {
        const index = event.target.getAttribute('data-index');
        const expense = expenses[index];

        amountInput.value = expense.amount;
        descriptionInput.value = expense.description;
        categorySelect.value = expense.category;

        editingIndex = index;  
    }
});


purchasePremiumButton.addEventListener('click', handlePurchase);  // Attach the purchase event to the button

async function handlePurchase(e) {
    e.preventDefault();

    const token = localStorage.getItem('jwt');
    if (!token) {
        alert('You need to be logged in to make a purchase');
        return;
    }
    
    try {
        // Step 1: Initiate purchase - request to create a new premium membership order
        const response = await axios.get('http://localhost:3000/premium/premiummembership', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const orderId = response.data.order.id;
        const key_id = response.data.key_id;

        // Step 2: Configure the Razorpay options with necessary information
        const options = {
            "key": key_id,
            "order_id": orderId,
            "handler": async function(paymentResponse) {
                // Step 3: Handle payment success
                const payment = {
                    msg: "successful",
                    paymentId: paymentResponse.razorpay_payment_id,
                    orderId: paymentResponse.razorpay_order_id
                };

                try {
                    // Verify payment with the backend
                    await axios.post('http://localhost:3000/premium/transactionstatus', payment, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    alert("Payment successful! You are now a premium member.");
                    window.location.reload();
                } catch (error) {
                    console.error('Error verifying payment:', error);
                    alert("Payment verification failed, please contact support.");
                }
            },
            "modal": {
                "ondismiss": function() {
                    alert("Payment was cancelled. Please try again.");
                }
            }
        };

        // Step 4: Initialize Razorpay with the configured options and open payment modal
        const rzp1 = new Razorpay(options);
        rzp1.open();
    } catch (error) {
        console.error('Error initiating purchase:', error);
        alert('Error starting the premium purchase process. Please try again later.');
    }
}

function updatePremiumStatusUI(isPremium) {
    const premiumStatusText = document.getElementById('premium-status-text');
    if (isPremium) {
        premiumStatusText.textContent = "You are a Premium Member!";
        premiumStatusText.style.color = 'green';
    } else {
        premiumStatusText.textContent = "You are not a Premium Member.";
        premiumStatusText.style.color = 'red';
    }
}

// Call the updatePremiumStatusUI function on page load if the user is already premium
window.onload = function() {
    const isPremium = localStorage.getItem('ispremium') === 'true';
    updatePremiumStatusUI(isPremium);
};

fetchExpenses();
