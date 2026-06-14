# Pages

Page components (routes) for the Rehoboth frontend application.

## 📋 Overview

Page components represent different routes in the application. Each page is a top-level component that combines sections and components to create a complete page.

## 📁 Pages

- `Home.jsx` - Landing page
- `Services.jsx` - Services catalog
- `About.jsx` - About the clinic
- `Blog.jsx` - Blog listing
- `BlogDetails.jsx` - Individual blog post
- `Contact.jsx` - Contact page
- `Appointment.jsx` - Appointment booking
- `AppointmentSummary.jsx` - Appointment confirmation
- `Calender.jsx` - Interactive calendar
- `Gallery.jsx` - Photo gallery
- `Products.jsx` - Product showcase

## 🎯 Page Structure

Each page typically follows this structure:

```jsx
import React from 'react';
import { Box } from '@mui/material';
import SEO from '../components/common09/SEO';
import SectionComponent from '../components/sections/SectionComponent';

export default function PageName() {
  return (
    <Box>
      <SEO 
        title="Page Title"
        description="Page description"
        keywords="keyword1, keyword2"
      />
      <SectionComponent />
      {/* More sections */}
    </Box>
  );
}
```

## 📝 Page Details

### Home.jsx

Landing page with multiple sections:
- Hero section
- Service categories
- Services showcase
- About us
- Promo banners
- Products
- Testimonials
- Gallery
- Contact section

### Services.jsx

Services catalog page:
- Service listings
- Service details
- Booking CTAs

### About.jsx

About the clinic:
- Mission and vision
- Team members
- Values and philosophy

### Blog.jsx

Blog listing page:
- Blog post cards
- Categories
- Search functionality

### BlogDetails.jsx

Individual blog post:
- Full article content
- Author information
- Related posts
- SEO optimized

### Contact.jsx

Contact page:
- Contact form
- Contact information
- Map/location (if applicable)

### Appointment.jsx

Appointment booking page:
- Appointment form
- Date/time selection
- Service selection
- Google Calendar integration

### AppointmentSummary.jsx

Appointment confirmation:
- Appointment details
- Confirmation message
- Next steps

### Calender.jsx

Interactive calendar:
- Available dates
- Booked dates
- Date selection
- Real-time availability

### Gallery.jsx

Photo gallery:
- Image grid
- Lightbox/modal
- Category filters

### Products.jsx

Product showcase:
- Product grid
- Product details
- Categories

## 🔍 SEO Integration

All pages use the `SEO` component for:
- Dynamic page titles
- Meta descriptions
- Keywords
- Open Graph tags
- Twitter cards

### Example

```jsx
<SEO 
  title="Services - Rehoboth Spa"
  description="Explore our range of spa treatments and wellness services"
  keywords="spa, massage, wellness, treatments"
/>
```

## 🎨 Styling

Pages use:
- MUI `Box` for layout
- Responsive design
- Consistent spacing
- Theme colors

## 🔗 Routing

Pages are registered in `App.jsx`:

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/services" element={<Services />} />
  {/* More routes */}
</Routes>
```

## 📱 Responsive Design

All pages are responsive:
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions

## 🐛 Common Issues

### Page Not Rendering

- Check route is defined in `App.jsx`
- Verify component exports correctly
- Check for console errors

### SEO Not Working

- Verify `SEO` component is imported
- Check meta tags in browser dev tools
- Verify props are passed correctly

### Styling Issues

- Check MUI theme configuration
- Verify responsive breakpoints
- Check component imports

## 📚 Related Documentation

- [Components README](../components/README.md)
- [Frontend README](../../README.md)
- [React Router Docs](https://reactrouter.com/)

---

**For section components, see [../components/sections/README.md](../components/sections/README.md)**

