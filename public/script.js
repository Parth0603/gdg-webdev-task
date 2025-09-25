document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('regForm');
    const phoneInput = document.getElementById('phone');
    const enrollmentInput = document.getElementById('enrollment');
    const collegeSelect = document.getElementById('college');
    const otherCollegeGroup = document.getElementById('other-college-group');

    
    // Phone number validation - only allow digits
    phoneInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    
    // Enrollment number validation - allow alphanumeric
    enrollmentInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    });
    
    // College selection handler
    collegeSelect.addEventListener('change', function(e) {
        if (e.target.value === 'Other') {
            otherCollegeGroup.style.display = 'block';
            document.getElementById('otherCollege').required = true;
        } else {
            otherCollegeGroup.style.display = 'none';
            document.getElementById('otherCollege').required = false;
            document.getElementById('otherCollege').value = '';
        }
    });
    
    // Real-time validation feedback
    addRealTimeValidation();
    

    

    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Handle multiple interests
        const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked'))
            .map(cb => cb.value);
        data.interests = interests;
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                window.location.href = `/registered?email=${encodeURIComponent(data.email)}`;
            } else {
                showError(result.error || 'Registration failed');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        }
    });
});

function validateBasicForm() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(error => error.textContent = '');
    
    // Name validation
    const name = document.getElementById('name').value.trim();
    if (name.length < 3) {
        document.getElementById('name-error').textContent = 'Name must be at least 3 characters';
        isValid = false;
    }
    
    // Gender validation
    if (!document.getElementById('gender').value) {
        document.getElementById('gender-error').textContent = 'Please select your gender';
        isValid = false;
    }
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address';
        isValid = false;
    }
    
    // Phone validation
    const phone = document.getElementById('phone').value.trim();
    if (!/^\d{10}$/.test(phone)) {
        document.getElementById('phone-error').textContent = 'Phone must be exactly 10 digits';
        isValid = false;
    }
    
    // Enrollment validation
    const enrollment = document.getElementById('enrollment').value.trim();
    if (enrollment.length < 8) {
        document.getElementById('enrollment-error').textContent = 'Enrollment number must be at least 8 characters';
        isValid = false;
    }
    
    // College validation
    const college = document.getElementById('college').value;
    if (!college) {
        document.getElementById('college-error').textContent = 'Please select your college';
        isValid = false;
    } else if (college === 'Other') {
        const otherCollege = document.getElementById('otherCollege').value.trim();
        if (otherCollege.length < 3) {
            document.getElementById('other-college-error').textContent = 'Please specify your college name';
            isValid = false;
        }
    }
    
    // Year validation
    if (!document.getElementById('year').value) {
        document.getElementById('year-error').textContent = 'Please select your current year';
        isValid = false;
    }
    
    // Branch validation
    if (!document.getElementById('branch').value) {
        document.getElementById('branch-error').textContent = 'Please select your branch';
        isValid = false;
    }
    
    // Experience validation
    if (!document.getElementById('experience').value) {
        document.getElementById('experience-error').textContent = 'Please select your programming experience';
        isValid = false;
    }
    
    return isValid;
}

function validateForm() {
    return validateBasicForm();
}

function showSuccess(email) {
    document.getElementById('registration-form').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';
    
    // Add email-specific content
    const emailSpan = document.getElementById('registered-email');
    if (emailSpan) {
        emailSpan.textContent = email;
    }
    
    // Show next steps
    setTimeout(() => {
        showToast('Check your email for event updates!', 'success');
    }, 1000);
}

function showForm() {
    document.getElementById('registration-form').style.display = 'block';
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('regForm').reset();
}

function showError(message) {
    showToast(message, 'error');
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function addRealTimeValidation() {
    // Add real-time validation for key fields
    const fields = [
        { id: 'name', validator: (val) => val.length >= 3, message: 'Name must be at least 3 characters' },
        { id: 'email', validator: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), message: 'Please enter a valid email' },
        { id: 'phone', validator: (val) => /^\d{10}$/.test(val), message: 'Phone must be exactly 10 digits' },
        { id: 'enrollment', validator: (val) => val.length >= 8, message: 'Enrollment number must be at least 8 characters' }
    ];
    
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorSpan = document.getElementById(field.id + '-error');
        
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value && !field.validator(value)) {
                errorSpan.textContent = field.message;
                this.style.borderColor = '#ef4444';
            } else if (value) {
                errorSpan.textContent = '';
                this.style.borderColor = '#10b981';
            }
        });
        
        input.addEventListener('input', function() {
            if (errorSpan.textContent) {
                const value = this.value.trim();
                if (field.validator(value)) {
                    errorSpan.textContent = '';
                    this.style.borderColor = '#10b981';
                }
            }
        });
    });
}