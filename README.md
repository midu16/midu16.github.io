# midu16.github.io - Enhanced Design

A modern, visually appealing personal tech blog focused on TelcoCloud Infrastructure and OpenShift.

## 🎨 Recent Design Improvements

### Visual Enhancements
- **Modern Color Scheme**: Indigo/purple gradient theme with improved contrast
- **Custom Typography**: Inter font family for better readability
- **Hero Section**: Eye-catching gradient hero with call-to-action buttons
- **Card-Based Layout**: Modern card design for blog posts with icons
- **Smooth Animations**: Fade-in effects and hover transitions
- **Enhanced Header**: Sticky navigation with gradient logo
- **Professional Footer**: Dark theme with organized sections

### Layout Improvements
- **Responsive Grid**: Auto-adjusting post cards for all screen sizes
- **Better Spacing**: Improved margins and padding throughout
- **Post Navigation**: Previous/Next post navigation cards
- **Enhanced About Page**: Structured sections with icons
- **Custom 404 Page**: Styled error page with helpful navigation

### Technical Features
- Modern CSS Grid and Flexbox layouts
- Font Awesome icons integration
- Google Fonts (Inter & JetBrains Mono)
- Improved SEO settings
- Better mobile responsiveness
- Smooth hover effects and transitions

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
bundle install

# Run Jekyll locally
bundle exec jekyll serve

# View at http://localhost:4000
```

### Building for Production

```bash
# Build the site
bundle exec jekyll build

# Output will be in _site directory
```

## 📁 Project Structure

```
.
├── _config.yml              # Site configuration
├── _includes/               # Custom includes (header, footer, social)
├── _layouts/                # Page layouts (default, home, post, page)
├── _posts/                  # Blog posts in Markdown
├── _sass/                   # SCSS stylesheets
│   └── minima/             # Theme SCSS files
├── assets/
│   ├── css/
│   │   └── custom.css      # Custom CSS enhancements
│   ├── images/             # Image assets
│   └── binaries/           # Binary files
├── about.markdown          # About page
├── index.markdown          # Homepage
└── 404.html               # Custom 404 page
```

## 🎯 Key Features

- **TelcoCloud Focus**: Specialized content on OpenShift and telecommunications infrastructure
- **Clean Design**: Modern, professional appearance
- **Easy Navigation**: Intuitive menu and post discovery
- **SEO Optimized**: Proper meta tags and structure
- **Social Links**: LinkedIn, GitHub, and email integration
- **Code Highlighting**: Styled code blocks for technical content

## 📝 Adding New Posts

Create a new file in `_posts/` with the format:

```markdown
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD
---

Your content here...
```

## 🎨 Customization

### Colors
Edit `/apps/midu16.github.io/_sass/minima.scss` to change the color scheme:
- `$brand-color`: Primary brand color
- `$text-color`: Main text color
- `$background-color`: Background color

### Content
- Update `_config.yml` for site-wide settings
- Modify `about.markdown` for your bio
- Edit layouts in `_layouts/` for structure changes

## 📦 Dependencies

- Jekyll 4.x
- Minima theme
- Font Awesome 6.4.0
- Google Fonts (Inter, JetBrains Mono)

## 🌐 Deployment

This site is automatically deployed via GitHub Pages when you push to the `main` branch.

## 📄 License

Content is copyright © Mihai Idu. All rights reserved.

## 🤝 Contributing

This is a personal blog, but if you find any issues, feel free to open an issue or submit a pull request.

---

**Built with ❤️ using Jekyll and modern web technologies**

