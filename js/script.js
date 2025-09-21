// EmailJS Configuration - Replace these with your actual values from EmailJS dashboard
emailjs.init("c0p5fGe9Kg_XFb5r2"); // Your Public Key

// EmailJS Configuration
const EMAILJS_SERVICE_ID = "bridge_123"; // Your Service ID
const EMAILJS_TEMPLATE_ID = "template_arbtbov"; // Your Template ID

// Modal functionality
function openModal(type) {
    const modal = document.getElementById('contactModal');
    const title = document.getElementById('modalTitle');
    const description = document.getElementById('modalDescription');
    const demoSpecific = document.getElementById('demoSpecific');
    const submitText = document.getElementById('submitText');
    
    if (type === 'demo') {
        title.textContent = 'Schedule Your Demo';
        description.textContent = 'Let us show you how Bridge Interactive can transform your agile workflow. Schedule a personalized demo with our team.';
        demoSpecific.style.display = 'block';
        submitText.textContent = 'Schedule Demo';
    } else {
        title.textContent = 'Start Your Free Trial';
        description.textContent = 'Get started with Bridge Interactive today. Tell us about your team and we\'ll set up your free trial.';
        demoSpecific.style.display = 'none';
        submitText.textContent = 'Start Free Trial';
    }
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForm();
    }, 300);
}

function resetForm() {
    document.getElementById('contactForm').reset();
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal with escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

function submitForm(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    // Show loading state
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Determine request type
    const isDemo = document.getElementById('demoSpecific').style.display !== 'none';
    const requestType = isDemo ? 'Demo Request' : 'Free Trial Request';
    
    // Prepare template parameters for EmailJS
    const templateParams = {
        to_email: 'dror@bridge-interactive.com',
        full_name: data.fullName,
        email: data.email,
        company: data.company,
        role: data.role || 'Not specified',
        team_size: data.teamSize || 'Not specified',
        preferred_time: data.preferredTime || '',
        message: data.message || 'None specified',
        request_type: requestType,
        submission_date: new Date().toLocaleString()
    };
    
    // Send email using EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            
            // Show success message
            alert(`Thank you! Your ${requestType.toLowerCase()} has been sent to our team. We'll get back to you within 24 hours.`);
            
            // Reset form and close modal
            submitText.style.display = 'inline-block';
            submitLoader.style.display = 'none';
            submitBtn.disabled = false;
            closeModal();
            
        }, function(error) {
            console.error('EmailJS Error:', error);
            
            // Fallback to mailto if EmailJS fails
            const emailContent = `
New ${requestType} from Bridge Interactive Website

Contact Information:
- Name: ${data.fullName}
- Email: ${data.email}
- Company: ${data.company}
- Role: ${data.role || 'Not specified'}
- Team Size: ${data.teamSize || 'Not specified'}

${isDemo ? `Preferred Demo Time: ${data.preferredTime || 'Not specified'}\n` : ''}
Current Challenges:
${data.message || 'None specified'}

Request Type: ${requestType}
Submitted: ${new Date().toLocaleString()}
            `.trim();
            
            const subject = encodeURIComponent(`${requestType} - ${data.company}`);
            const body = encodeURIComponent(emailContent);
            const mailtoLink = `mailto:dror@bridge-interactive.com?subject=${subject}&body=${body}`;
            
            // Open email client as fallback
            window.location.href = mailtoLink;
            
            alert(`There was an issue sending the email directly. Your email client will open with a pre-filled message.`);
            
            // Reset form and close modal
            submitText.style.display = 'inline-block';
            submitLoader.style.display = 'none';
            submitBtn.disabled = false;
            closeModal();
        });
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add scroll transition to header
    header.style.transition = 'transform 0.3s ease-in-out';
    
    // Button click handlers
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
            
            // Handle specific button actions
            const buttonText = this.textContent.trim();
            
            switch(buttonText) {
                case 'Get Started':
                    console.log('Getting started...');
                    // Scroll to CTA section
                    document.querySelector('#contact').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    break;
                    
                case 'Learn More':
                    console.log('Learning more...');
                    alert('Product details page would be implemented here');
                    break;
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll('.feature-item, .section-header');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Counter animation for stats
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Always add % symbol for our stats
            element.textContent = Math.floor(current) + '%';
        }, 16);
    }
    
    // Animate stats when they come into view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number');
                const text = statNumber.textContent;
                
                if (text.includes('75') || text === '75') {
                    animateCounter(statNumber, 75);
                    setTimeout(() => {
                        statNumber.textContent = '75%';
                    }, 2000);
                } else if (text.includes('50') || text === '50') {
                    animateCounter(statNumber, 50);
                    setTimeout(() => {
                        statNumber.textContent = '50%';
                    }, 2000);
                } else if (text.includes('100') || text === '100') {
                    animateCounter(statNumber, 100);
                    setTimeout(() => {
                        statNumber.textContent = '100%';
                    }, 2000);
                }
                
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
    
    // Mobile menu toggle (for future enhancement)
    function createMobileMenu() {
        const nav = document.querySelector('.nav-container');
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.style.display = 'none';
        
        // Add mobile menu styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .mobile-menu-btn {
                    display: block !important;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #4a5568;
                    cursor: pointer;
                }
            }
        `;
        document.head.appendChild(style);
        
        nav.appendChild(mobileMenuBtn);
    }
    
    createMobileMenu();
    
    // Form validation (for future contact forms)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Utility function for future API calls
    async function makeAPICall(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Initialize any third-party widgets (placeholder)
    console.log('Bridge Interactive website loaded successfully');
}); 

// Add this JavaScript to your script.js file

// Image Carousel functionality
function initImageCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let autoSlideInterval;

    // Function to show a specific slide
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentSlide = index;
    }

    // Function to go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Auto-advance slides every 3 seconds
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 3000);
    }

    // Stop auto-advance
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Add click listeners to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            // Restart auto-slide after 5 seconds of inactivity
            setTimeout(startAutoSlide, 5000);
        });
    });

    // Pause carousel on hover, resume on mouse leave
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);
    }

    // Start the carousel
    startAutoSlide();
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Your existing DOMContentLoaded code...
    
    // Add carousel initialization
    initImageCarousel();
});

