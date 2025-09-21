# Bridge Interactive Website

A professional SaaS website for Bridge Interactive's AI-powered agile management platform.

## Features

- **Modern Design**: Professional SaaS design with clean typography and sophisticated styling
- **Responsive**: Fully responsive across all devices
- **Contact Forms**: Professional modal forms for demo requests and free trial signups
- **Email Integration**: Automated email sending to dror@bridge-interactive.com
- **Interactive Elements**: Smooth animations, hover effects, and professional transitions

## Repository Structure

```
/
├── assets/              # Images and media files
│   └── bridge-logo.jpeg # Company logo
├── css/                 # Stylesheets  
│   └── styles.css      # Main CSS file
├── js/                  # JavaScript files
│   └── script.js       # Main JavaScript functionality
├── pages/               # HTML pages
│   ├── privacy.html    # Privacy policy
│   └── terms.html      # Terms of service
├── index.html          # Main homepage
├── README.md           # Project documentation
└── .gitignore         # Git ignore rules
```

## Files

- `index.html` - Main website homepage
- `css/styles.css` - All styling and responsive design
- `js/script.js` - JavaScript functionality including modal and email handling
- `pages/privacy.html` - Privacy policy page
- `pages/terms.html` - Terms of service page
- `assets/bridge-logo.jpeg` - Company logo (bridge image)

## Email Setup

The website currently uses a mailto fallback system that opens the user's email client with pre-filled information. For a more professional experience, you can set up EmailJS:

### Option 1: Current Setup (Mailto)
- No additional setup required
- Opens user's email client with pre-filled message
- User must manually send the email

### Option 2: EmailJS Integration (Recommended)
1. Go to [EmailJS.com](https://www.emailjs.com/) and create a free account
2. Set up an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Get your User ID, Service ID, and Template ID
5. Replace the EmailJS configuration in `script.js`:

```javascript
// Replace this line in script.js:
emailjs.init("YOUR_EMAILJS_USER_ID");

// With your actual User ID:
emailjs.init("your_actual_user_id");

// Update the submitForm function to use EmailJS instead of mailto
```

## Customization

### Contact Email
To change the contact email from `dror@bridge-interactive.com`:
1. Open `script.js`
2. Find the line with `mailto:dror@bridge-interactive.com`
3. Replace with your desired email address

### Content Updates
- Update company information in `index.html`
- Modify styling in `styles.css`
- Add or remove form fields in the modal section of `index.html`

### Color Scheme
The website uses a professional purple color scheme. Main colors:
- Primary Purple: `#8b5cf6`
- Dark Purple: `#7c3aed`
- Text: `#0f172a`
- Light Gray: `#64748b`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Getting Started

1. Open `index.html` in your web browser
2. Test the contact forms by clicking "Start Free Trial" or "Schedule Demo"
3. Customize the content and styling as needed

## Support

For questions about the website setup, contact the development team. 