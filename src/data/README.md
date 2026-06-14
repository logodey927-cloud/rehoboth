# Data

Static data and content for the Rehoboth frontend application.

## 📋 Overview

Data files contain static content, configuration, and content used throughout the application. These files help maintain consistency and make content updates easier.

## 📁 Files

### Content Data
- `aboutContent.jsx` - About page content
- `heroContents.jsx` - Hero section content
- `bannerContents.jsx` - Banner content
- `footerData.jsx` - Footer links and information

### Navigation
- `NavigationData.jsx` - Navigation menu structure
- `navLinks.jsx` - Navigation links

### Services & Products
- `servicePage.jsx` - Service page content
- `serviceDetailsData.jsx` - Service details
- `ServicesHighlight.jsx` - Service highlights
- `ServicesHighlight02.jsx` - Additional service highlights
- `ProductDataSection.jsx` - Product data
- `products.jsx` - Products list
- `productsData.jsx` - Product details
- `newArrivalsData.jsx` - New arrivals

### Team & Testimonials
- `TeamDataSection.jsx` - Team member data
- `testimonials.jsx` - Testimonials list
- `testimonialsData.js` - Testimonial details

### Gallery & Images
- `GalleryData.jsx` - Gallery images
- `ImagesData01.jsx` - Image data
- `AboutImagedata.jsx` - About page images

### Features & Categories
- `features.jsx` - Feature list
- `categoryData.js` - Category information
- `MassageData.jsx` - Massage service data

### Blog
- `blogData.jsx` - Blog posts data

## 📝 Data Structure

### Example: Service Data

```javascript
export const serviceData = {
  id: "service-1",
  title: "Massage Therapy",
  description: "Relaxing massage treatment",
  image: "/path/to/image.jpg",
  price: 75,
  duration: "60 minutes"
};
```

### Example: Navigation Data

```javascript
export const navigationData = {
  brand: {
    name: "Rehoboth Health & Wellness",
    logo: "/logo.webp"
  },
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Services", href: "/services" }
  ]
};
```

## 🎯 Usage

### Importing Data

```javascript
import serviceData from '../data/servicePage';
import { navigationData } from '../data/NavigationData';
```

### Using in Components

```javascript
import { features } from '../data/features';

function FeaturesSection() {
  return (
    <div>
      {features.map(feature => (
        <FeatureCard key={feature.id} {...feature} />
      ))}
    </div>
  );
}
```

## 🔄 Content Management

### Updating Content

1. Locate the relevant data file
2. Update the data structure
3. Save the file
4. Changes reflect immediately (no rebuild needed in dev)

### Adding New Content

1. Create new data file or add to existing
2. Export the data
3. Import in component
4. Use in component

## 📊 Data Types

### Service Data
- Title, description, image
- Price, duration
- Category, tags

### Team Data
- Name, role, bio
- Image, social links

### Product Data
- Name, description, image
- Price, category
- Features, specifications

### Navigation Data
- Menu items, links
- Icons, descriptions
- Submenus

## 🎨 Content Guidelines

### Consistency
- Use consistent data structures
- Follow naming conventions
- Maintain image path consistency

### Organization
- Group related data together
- Use descriptive file names
- Export clearly named constants

## 🐛 Common Issues

### Data Not Loading

- Check import paths
- Verify export statements
- Check for syntax errors

### Missing Data

- Verify data file exists
- Check data structure matches usage
- Verify exports are correct

## 📚 Related Documentation

- [Components README](../components/README.md)
- [Pages README](../pages/README.md)
- [Frontend README](../../README.md)

---

**For component usage, see [../components/README.md](../components/README.md)**

