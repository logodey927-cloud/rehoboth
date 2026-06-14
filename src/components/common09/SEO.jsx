import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Rehoboth Health & Wellness Clinic";
const DEFAULT_DESCRIPTION = "Relax • Revive • Reconnect. Your premier destination for health and wellness in Rochdale, Greater Manchester, United Kingdom.";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://rehobothhealthmassage.com";
const DEFAULT_OG_IMAGE = "https://rehobothhealthmassage.com/assets/logo-BUSwqRuK.webp";

export default function SEO({ 
  title, 
  description = DEFAULT_DESCRIPTION, 
  image, 
  type = "website",
  keywords 
}) {
  const location = useLocation();
  const currentUrl = `${BASE_URL}${location.pathname}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const ogImage = image || DEFAULT_OG_IMAGE;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", description);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    // Open Graph tags for social sharing
    updateMetaTag("og:title", fullTitle, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:image", ogImage, "property");
    updateMetaTag("og:image:secure_url", ogImage, "property");
    updateMetaTag("og:image:type", "image/webp", "property");
    updateMetaTag("og:url", currentUrl, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", SITE_NAME, "property");
    updateMetaTag("og:locale", "en_GB", "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", ogImage);

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);
  }, [title, description, image, type, keywords, currentUrl, fullTitle, ogImage]);

  return null;
}

