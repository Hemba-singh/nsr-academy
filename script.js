// Mobile menu toggle with animation
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    body.classList.toggle('menu-open');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
    }
});

// Close menu when clicking a nav link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
    });
});

// Close menu on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Form handling
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    // Add input validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('invalid', (e) => {
            e.preventDefault();
            input.classList.add('invalid');
        });
        
        input.addEventListener('input', () => {
            input.classList.remove('invalid');
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate required fields
        const isValid = form.checkValidity();
        if (!isValid) {
            form.reportValidity();
            return;
        }

        // Disable form while submitting
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const formData = new FormData(form);
        const url = form.getAttribute('action');

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            createPopup('success', 'Success!', 'Your form has been submitted successfully.');
            form.reset();
        } catch (error) {
            console.error('Error:', error);
            createPopup('error', 'Error!', 'There was a problem submitting your form. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
});

// Create popup elements
const createPopup = (type, title, message) => {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const content = document.createElement('div');
    content.className = `popup-content ${type}`;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };
    
    const svg = type === 'success' 
        ? '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
        : '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
    
    content.innerHTML = `
        ${svg}
        <h3>${title}</h3>
        <p>${message}</p>
        <button class="popup-button" onclick="this.closest('.popup-overlay').querySelector('.popup-close').click()">
            ${type === 'success' ? 'Great!' : 'Try Again'}
        </button>
    `;
    
    content.appendChild(closeBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.add('show');
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            closeBtn.click();
        }
    }, 5000);
};

// Enrollment form handling
function handleEnrollment(event) {
    event.preventDefault();
    const form = event.target;
    
    // Clear previous validation messages
    form.querySelectorAll('.validation-message').forEach(msg => msg.remove());
    form.querySelectorAll('.invalid').forEach(field => field.classList.remove('invalid'));
    
    // Validate form fields
    let isValid = true;
    
    // Full Name validation
    const fullName = form.fullName.value.trim();
    if (fullName.length < 2) {
        showValidationError(form.fullName, 'Please enter your full name (minimum 2 characters)');
        isValid = false;
    }
    
    // Email validation
    const email = form.email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showValidationError(form.email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    const phone = form.phone.value.trim();
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    if (!phoneRegex.test(phone)) {
        showValidationError(form.phone, 'Please enter a valid phone number (minimum 10 digits)');
        isValid = false;
    }
    
    // Date of Birth validation
    const dob = new Date(form.dob.value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (isNaN(dob.getTime()) || age < 4 || age > 100) {
        showValidationError(form.dob, 'Please enter a valid date of birth (age must be between 4 and 100)');
        isValid = false;
    }
    
    // Program validation
    if (!form.program.value) {
        showValidationError(form.program, 'Please select a program');
        isValid = false;
    }
    
    if (!isValid) {
        return false;
    }
    
    // Disable submit button and show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        createPopup('success', 'Enrollment Submitted!', 'Thank you for enrolling with NSR Sport Academy. We will contact you shortly to confirm your enrollment.');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Enrollment';
    }, 1500);
    
    return false;
}

function showValidationError(field, message) {
    field.classList.add('invalid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-message';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
}

// Handle program selection from URL
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the enrollment page
    const programSelect = document.getElementById('program');
    if (programSelect) {
        // Get the program from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const selectedProgram = urlParams.get('program');
        
        // If a program was specified, select it in the dropdown
        if (selectedProgram) {
            programSelect.value = selectedProgram;
            
            // Scroll to the form
            const enrollmentForm = document.getElementById('enrollmentForm');
            if (enrollmentForm) {
                enrollmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
});

// Add animation on scroll for features
const featureCards = document.querySelectorAll('.feature-card');

const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

featureCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s, transform 0.5s';
    observer.observe(card);
}); 

// Scroll Animation Observer
const scrollElements = document.querySelectorAll('.scroll-fade, .scroll-fade-left, .scroll-fade-right');

const elementInView = (el, offset = 0) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
        elementTop <= (window.innerHeight || document.documentElement.clientHeight) * (1 - offset)
    );
};

const displayScrollElement = (element) => {
    element.classList.add('visible');
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 0.25)) {
            displayScrollElement(el);
        }
    });
};

// Add event listener for scroll
window.addEventListener('scroll', () => {
    handleScrollAnimation();
});

// Trigger on page load
window.addEventListener('load', () => {
    handleScrollAnimation();
});