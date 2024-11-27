// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form handling
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const url = form.getAttribute('action');
        fetch(url, {
            method: form.getAttribute('method'),
            body: formData
        })
        .then(() => {
            const successMessage = document.createElement('p');
            successMessage.classList.add('success-message');
            successMessage.textContent = 'Message sent successfully!';
            form.insertAdjacentElement('beforebegin', successMessage);
            setTimeout(() => successMessage.remove(), 3000);
            form.reset();
        })
        .catch(() => {
            const errorMessage = document.createElement('p');
            errorMessage.classList.add('error-message');
            errorMessage.textContent = 'Error sending message!';
            form.insertAdjacentElement('beforebegin', errorMessage);
            setTimeout(() => errorMessage.remove(), 3000);
        });
    });
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