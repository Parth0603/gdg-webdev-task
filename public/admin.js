document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'block';
    loadRegistrations();
}

function handleLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    
    if (password === 'gdg-admin') {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        alert('Invalid password');
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    showLogin();
}

async function loadRegistrations() {
    try {
        const response = await fetch('/api/registrations', {
            headers: {
                'x-admin-auth': 'true'
            }
        });
        const registrations = await response.json();
        
        displayRegistrations(registrations);
        updateStats(registrations.length);
    } catch (error) {
        console.error('Error loading registrations:', error);
        document.getElementById('registrations-body').innerHTML = 
            '<tr><td colspan="6" class="loading">Error loading data</td></tr>';
    }
}

function displayRegistrations(registrations) {
    const tbody = document.getElementById('registrations-body');
    
    if (registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No registrations found</td></tr>';
        return;
    }
    
    tbody.innerHTML = registrations.map(reg => `
        <tr>
            <td>${reg.name}</td>
            <td>${reg.email}</td>
            <td>${reg.phone}</td>
            <td>${reg.year}</td>
            <td>${reg.branch}</td>
            <td>${new Date(reg.registeredAt).toLocaleString()}</td>
            <td><button onclick="deleteUser('${reg._id}', '${reg.name}')" class="btn btn-reset" style="padding: 6px 12px; font-size: 12px;">Delete</button></td>
        </tr>
    `).join('');
}

function updateStats(count) {
    document.getElementById('total-count').textContent = count;
}

async function exportData() {
    try {
        const response = await fetch('/api/export', {
            headers: {
                'x-admin-auth': 'true'
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gdg-aitr-registrations.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Export failed');
    }
}

function confirmClearData() {
    showCustomPopup(
        '⚠️ Warning',
        'This will permanently delete ALL registration data. Are you sure?',
        'Confirm',
        () => {
            showCustomPopup(
                '🚨 Final Confirmation',
                'Type "DELETE ALL" to confirm (case sensitive):',
                'Delete All Data',
                (inputValue) => {
                    if (inputValue === 'DELETE ALL') {
                        clearAllData();
                    } else {
                        showNotification('Deletion cancelled - incorrect confirmation text', 'error');
                    }
                },
                true,
                'DELETE ALL'
            );
        },
        false,
        '',
        'danger'
    );
}

async function clearAllData() {
    try {
        const response = await fetch('/api/clear-data', {
            method: 'DELETE',
            headers: {
                'x-admin-auth': 'true'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(`Success: ${result.message}`, 'success');
            loadRegistrations();
        } else {
            showNotification(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Clear data error:', error);
        showNotification('Failed to clear data', 'error');
    }
}

function deleteUser(userId, userName) {
    showCustomPopup(
        'Delete User',
        `Are you sure you want to delete registration for "${userName}"?`,
        'Delete',
        () => performDeleteUser(userId, userName),
        false,
        '',
        'danger'
    );
}

async function performDeleteUser(userId, userName) {
    try {
        const response = await fetch(`/api/delete-user/${userId}`, {
            method: 'DELETE',
            headers: {
                'x-admin-auth': 'true'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(`Successfully deleted registration for "${userName}"`, 'success');
            loadRegistrations();
        } else {
            showNotification(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Delete user error:', error);
        showNotification('Failed to delete user', 'error');
    }
}

// Custom Popup Functions
function showCustomPopup(title, message, confirmText, onConfirm, requireInput = false, placeholder = '', buttonType = 'normal') {
    const overlay = document.getElementById('popup-overlay');
    const modal = document.getElementById('popup-modal');
    const titleEl = document.getElementById('popup-title');
    const messageEl = document.getElementById('popup-message');
    const inputEl = document.getElementById('popup-input');
    const cancelBtn = document.getElementById('popup-cancel');
    const confirmBtn = document.getElementById('popup-confirm');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    confirmBtn.textContent = confirmText;
    
    if (requireInput) {
        inputEl.style.display = 'block';
        inputEl.placeholder = placeholder;
        inputEl.value = '';
        inputEl.focus();
    } else {
        inputEl.style.display = 'none';
    }
    
    // Set button style
    confirmBtn.className = buttonType === 'danger' ? 'btn btn-register danger' : 'btn btn-register';
    
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Event handlers
    const handleConfirm = () => {
        const inputValue = requireInput ? inputEl.value : null;
        closePopup();
        onConfirm(inputValue);
    };
    
    const handleCancel = () => {
        closePopup();
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleConfirm();
        if (e.key === 'Escape') handleCancel();
    };
    
    // Remove existing listeners
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    
    // Add new listeners
    document.getElementById('popup-confirm').addEventListener('click', handleConfirm);
    document.getElementById('popup-cancel').addEventListener('click', handleCancel);
    document.addEventListener('keydown', handleKeyPress);
    
    // Store cleanup function
    overlay.cleanup = () => {
        document.removeEventListener('keydown', handleKeyPress);
    };
}

function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    if (overlay.cleanup) {
        overlay.cleanup();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        font-weight: 500;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);