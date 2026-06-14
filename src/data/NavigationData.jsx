// NavigationData.jsx - Comprehensive navigation data for the spa website
export const navigationData = {
  brand: {
    name: "Rehoboth Health & Wellness Clinic",
    nameSubtitle: "RELAX, REVIVE, RECONNECT",
    logo: "/assets/images/logo.webp",
    tagline: "RELAX, REVIVE, RECONNECT",
  },
  mainNav: [
    {
      title: "Home",
      href: "/",
      slug: "home",
      icon: "home",
      description: "Welcome to our spa",
    },
    {
      title: "Services",
      href: "/services",
      slug: "services",
      icon: "spa",
      description: "Our spa treatments",
      submenu: [
        { title: "Facial Treatments", href: "/services/facials" },
        { title: "Body Massages", href: "/services/massages" },
        { title: "Wellness Packages", href: "/services/wellness" },
        { title: "Beauty Services", href: "/services/beauty" },
      ],
    },
    // {
    //   title: "Products",
    //   href: "/products",
    //   slug: "products",
    //   icon: "shopping_bag",
    //   description: "Premium spa products",
    //   submenu: [
    //     { title: "Skincare", href: "/products/skincare" },
    //     { title: "Fragrances", href: "/products/fragrances" },
    //     { title: "Haircare", href: "/products/haircare" },
    //     { title: "Wellness", href: "/products/wellness" },
    //   ],
    // },
    {
      title: "About",
      href: "/about",
      slug: "about",
      icon: "info",
      description: "Learn about us",
    },
    {
      title: "Blog",
      href: "/blog",
      slug: "blog",
      icon: "article",
      description: "Wellness tips & news",
    },
    {
      title: "Vouchers",
      href: "/vouchers",
      slug: "vouchers",
      icon: "card_giftcard",
      description: "Gift cards & special offers",
    },
    {
      title: "Testimonials",
      href: "/testimonials",
      slug: "testimonials",
      icon: "star",
      description: "Client reviews",
    },
    {
      title: "Contact",
      href: "/contact",
      slug: "contact",
      icon: "contact_phone",
      description: "Get in touch",
    },
  ],
  ctaButtons: [
    {
      text: "Book Appointment",
      href: "/book-appointment",
      variant: "primary",
      icon: "calendar_today",
    },
  ],
  socialLinks: [
    { platform: "Facebook", href: "#", icon: "facebook" },
    { platform: "Instagram", href: "#", icon: "instagram" },
    { platform: "Twitter", href: "#", icon: "twitter" },
    { platform: "YouTube", href: "#", icon: "youtube" },
  ],
  contactInfo: {
    phone: "07759221176",
    email: "rehobothwellnessclinic@gmail.com",
    address: "Rochdale, Greater Manchester, United Kingdom",
    hours: "Mon-Sat: 9AM-8PM, Sun: 10AM-6PM",
  },
};

export default navigationData;
