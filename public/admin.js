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
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No registrations found</td></tr>';
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