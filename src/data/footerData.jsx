const footerData = {
  brand: {
    name: "Rehoboth Health & Wellness Clinic",
    tagline: "RELAX, REVIVE, RECONNECT",
    description:
      "A trusted destination for therapeutic massage, skin therapy and holistic wellness. We help you relax, heal and rejuvenate your mind and body.",
  },

  contact: {
    phone: "07759221176",
    phoneLandline: "",
    email: "rehobothwellnessclinic@gmail.com",
    address: "Rochdale, Greater Manchester, United Kingdom",
  },

  links: [
    { label: "Home", route: "/" },
    { label: "Services", route: "/services" },
    // { label: "Products", route: "/products" },
    { label: "About Us", route: "/about" },
    { label: "Contact", route: "/contact" },
    { label: "Blog", route: "/blog" },
  ],

  /** Fallback if API unavailable — managed in admin: /admin/social-links */
  socials: [
    { icon: "Instagram", icon_type: "Instagram", url: "https://www.instagram.com/", label: "Instagram" },
    { icon: "Facebook", icon_type: "Facebook", url: "https://www.facebook.com/", label: "Facebook" },
    { icon: "LinkedIn", icon_type: "LinkedIn", url: "https://linkedin.com/", label: "LinkedIn" },
    {
      icon: "Faces",
      icon_type: "Faces",
      url: "https://facesconsent.com/bookings/REHOBOTHWELLNESSCLINIC",
      label: "Book on Faces Consent",
      image_url: "/faces-business.png",
      invert_logo: true,
    },
  ],

  copyright: "© 2025 Rehoboth Health and Wellness Clinic. All Rights Reserved.",
};

export default footerData;
