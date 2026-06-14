# Rehoboth Frontend Application

React-based frontend application for Rehoboth Clinic.

## 📋 Overview

This is the client-facing frontend application built with React, Vite, and Material-UI. It provides a modern, responsive interface for users to explore services, book appointments, and interact with the spa.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── admin/              # Admin panel components and pages
│   ├── components/     # Reusable admin components
│   ├── layout/         # Admin layout components
│   └── pages/         # Admin page components
├── api/               # API client and utilities
├── assets/            # Static assets (images, icons)
│   ├── backgroundImg/ # Background images
│   ├── effectImag/    # Effect images and icons
│   └── images/        # General images
├── components/        # Reusable React components
│   ├── common09/      # Common UI components
│   ├── sections/      # Page sections
│   ├── ui/            # UI-specific components
│   └── layout/        # Layout components
├── data/              # Static data and content
├── pages/             # Page components (routes)
├── theme.js           # MUI theme configuration
└── utils/             # Utility functions
```

## 🎨 Key Features

### Components

- **Reusable Components**: Located in `components/common09/`
- **Section Components**: Page sections in `components/sections/`
- **UI Components**: Specialized UI elements in `components/ui/`
- **Layout Components**: Navigation, footer, sidebar

### Pages

- **Home** (`/`) - Landing page with hero, services, testimonials
- **Services** (`/services`) - Service catalog
- **About** (`/about`) - About the clinic
- **Blog** (`/blog`) - Blog listing and details
- **Contact** (`/contact`) - Contact form
- **Appointment** (`/appointment`) - Appointment booking
- **Calendar** (`/calendar`) - Interactive calendar view (shows blocked dates as unavailable)
- **Gallery** (`/gallery`) - Photo gallery
- **Products** (`/products`) - Product showcase

### Admin Panel

Access at `/admin` routes:

- **Dashboard** (`/admin`) - Overview statistics
- **Appointments** (`/admin/appointments`) - Manage appointments (with date filter)
- **Calendar** (`/admin/calendar`) - Calendar management (block/unblock dates)
- **Contact Messages** (`/admin/messages`) - View contact submissions
- **Subscribers** (`/admin/subscribers`) - Newsletter subscribers

## 🛠️ Technologies

- **React 19** - UI framework
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Yup** - Schema validation
- **Axios** - HTTP requests
- **AOS** - Scroll animations
- **Day.js** - Date utilities
- **Swiper** - Carousel components

## 🎯 Component Guidelines

### Creating New Components

1. Use functional components with hooks
2. Follow the existing folder structure
3. Use MUI components for consistency
4. Implement responsive design (mobile-first)
5. Add proper TypeScript types if migrating

### Styling

- Use MUI's `sx` prop for styling
- Theme colors defined in `theme.js`
- Responsive breakpoints: `xs`, `sm`, `md`, `lg`, `xl`
- Follow existing component patterns

### Forms

- Use `react-hook-form` for form management
- Validate with `yup` schemas
- Display errors using `UnderlinedInput` component
- Submit via API client in `api/api.jsx`

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **xs**: Mobile (< 600px)
- **sm**: Tablet (600px - 960px)
- **md**: Desktop (960px - 1280px)
- **lg**: Large Desktop (1280px - 1920px)
- **xl**: Extra Large (> 1920px)

## 🔌 API Integration

API calls are centralized in `src/api/api.jsx`. All endpoints:

- Use Axios for HTTP requests
- Handle errors consistently
- Return formatted responses

### Example Usage

```javascript
import { createAppointment, getAppointments } from "../api/api";

// Create appointment
const response = await createAppointment(appointmentData);

// Get appointments
const appointments = await getAppointments();
```

## 🎨 Theme Configuration

Theme colors and typography are defined in `src/theme.js`:

- Primary colors
- Secondary colors
- Typography settings
- Component overrides

## 📦 Dependencies

### Core Dependencies

- `react` & `react-dom` - React framework
- `@mui/material` & `@mui/icons-material` - UI components
- `react-router-dom` - Routing
- `axios` - HTTP client

### Form & Validation

- `react-hook-form` - Form management
- `yup` - Validation schemas
- `@hookform/resolvers` - Form resolvers

### Utilities

- `dayjs` - Date manipulation
- `aos` - Scroll animations
- `framer-motion` - Animations
- `swiper` - Carousel

## 🐛 Common Issues

### Build Errors

- Clear `node_modules` and reinstall
- Check Node.js version (v18+)
- Verify all dependencies are installed

### Routing Issues

- Ensure routes are defined in `App.jsx`
- Check route paths match navigation links
- Verify React Router version compatibility

### Styling Issues

- Check MUI theme configuration
- Verify responsive breakpoints
- Ensure proper import of MUI components

## 📚 Additional Documentation

- [Components README](./src/components/README.md)
- [Admin Panel README](./src/admin/README.md)
- [API Documentation](./src/api/README.md)

---

**For backend documentation, see [../server/README.md](../server/README.md)**
# rehoboth
