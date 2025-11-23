import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  keywords?: string;
}

export function Seo({ title, description, keywords }: SeoProps) {
  useEffect(() => {
    // Update page title
    document.title = title;

    // Update meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);

      // Update Open Graph description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute("content", description);
      }

      // Update Twitter description
      let twitterDesc = document.querySelector(
        'meta[name="twitter:description"]'
      );
      if (twitterDesc) {
        twitterDesc.setAttribute("content", description);
      }
    }

    // Update Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }

    // Update Twitter title
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", title);
    }

    // Update keywords if provided
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute("content", keywords);
      }
    }
  }, [title, description, keywords]);

  return null;
}
