# Components Directory

Reusable React components for the Rehoboth frontend application.

## 📁 Structure

```
components/
├── common09/          # Common reusable components
├── sections/          # Page section components
├── ui/               # UI-specific components
├── layout/           # Layout components (navbar, footer, sidebar)
├── blog/             # Blog-related components
├── Services/         # Service-related components
└── pages/            # Page-level components (404, coming soon)
```

## 🧩 Component Categories

### Common Components (`common09/`)

Reusable UI components used throughout the application:

- **Form Components**
  - `ContactForm.jsx` - Contact form with validation
  - `AppointmentForm.jsx` - Appointment booking form
  - `UnderlinedInput.jsx` - Styled input field
  - `StyledButton.jsx` - Custom button component

- **Display Components**
  - `InfoSection.jsx` - Section header with title, subtitle, description
  - `ProductCard02.jsx` - Product card display
  - `SEO.jsx` - SEO meta tags component
  - `Preloader.jsx` - Loading spinner

- **Navigation**
  - `GlassNavbar.jsx` - Glassmorphism navigation bar
  - `Navbar.jsx` - Main navigation component

### Section Components (`sections/`)

Full-page sections used in various pages:

- `HeroSection.jsx` - Hero banner section
- `AboutUsSection.jsx` - About us content
- `OurServicesSection.jsx` - Services showcase
- `BookAppointmentSection.jsx` - Appointment booking section
- `TestimonialsSection.jsx` - Customer testimonials
- `GallerySection.jsx` - Photo gallery
- `ContactSection.jsx` - Contact information
- `ProductSection.jsx` - Product showcase
- `BlogSection.jsx` - Blog listing
- And more...

### UI Components (`ui/`)

Specialized UI components:

- `ProductUI.jsx` - Product grid layout
- `Bestsellers.jsx` - Bestseller products section
- `BestsellerUi.jsx` - Bestseller UI layout
- And other UI-specific components

### Layout Components (`layout/`)

- `Footer.jsx` - Site footer
- `Sidebar.jsx` - Sidebar navigation

## 📝 Component Guidelines

### Creating New Components

1. **File Naming**: Use PascalCase (e.g., `MyComponent.jsx`)
2. **Structure**: Functional components with hooks
3. **Styling**: Use MUI's `sx` prop or styled components
4. **Props**: Define prop types or use TypeScript
5. **Responsive**: Always implement mobile-first design

### Component Template

```jsx
import React from "react";
import { Box } from "@mui/material";

export default function MyComponent({ prop1, prop2 }) {
  return (
    <Box
      sx={{
        // Responsive styling
        width: { xs: "100%", md: "50%" },
      }}
    >
      {/* Component content */}
    </Box>
  );
}
```

### Best Practices

- **Reusability**: Make components reusable with props
- **Composition**: Compose smaller components into larger ones
- **Performance**: Use React.memo for expensive components
- **Accessibility**: Include proper ARIA labels and semantic HTML
- **Documentation**: Add JSDoc comments for complex components

## 🎨 Styling Guidelines

### MUI Theme

Use theme colors from `src/theme.js`:
```jsx
sx={{
  color: "primary.main",
  backgroundColor: "secondary.light",
}}
```

### Responsive Breakpoints

- `xs`: Mobile (< 600px)
- `sm`: Tablet (600px - 960px)
- `md`: Desktop (960px - 1280px)
- `lg`: Large Desktop (1280px - 1920px)
- `xl`: Extra Large (> 1920px)

### Common Patterns

```jsx
// Responsive spacing
sx={{ p: { xs: 2, sm: 4, md: 6 } }}

// Responsive typography
sx={{ fontSize: { xs: "1rem", md: "1.5rem" } }}

// Conditional styling
sx={{ display: { xs: "none", md: "block" } }}
```

## 🔗 Component Dependencies

### Common Dependencies

- `@mui/material` - UI components
- `@mui/icons-material` - Icons
- `react-router-dom` - Navigation
- `react-hook-form` - Form handling
- `yup` - Validation

### Data Sources

- Static data from `src/data/`
- API calls via `src/api/api.jsx`
- Props passed from parent components

## 📦 Key Components

### ContactForm

Contact form with validation:
- Uses `react-hook-form` and `yup`
- Validates email, name, message
- Submits to `/api/contact`
- Shows success/error messages

### AppointmentForm

Appointment booking form:
- Date and time selection
- Service selection
- Form validation
- Google Calendar integration
- Email confirmations

### InfoSection

Reusable section header:
- Title, subtitle, description
- Optional button
- Icon support
- Flexible alignment options

### ProductCard02

Product display card:
- Image with hover effects
- Title and description
- Responsive sizing
- Customizable height

## 🐛 Common Issues

### Styling Not Applied

- Check MUI theme configuration
- Verify `sx` prop syntax
- Ensure proper imports

### Component Not Rendering

- Check component exports
- Verify import paths
- Check for console errors

### Responsive Issues

- Test on different screen sizes
- Verify breakpoint values
- Check container widths

## 📚 Related Documentation

- [Frontend README](../README.md)
- [Pages README](../pages/README.md)
- [Data README](../data/README.md)

---

**For admin components, see [../admin/README.md](../admin/README.md)**

