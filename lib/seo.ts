type SoftwareApplicationJsonLdInput = {
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  featureList: string[];
  keywords?: string[];
};

export function buildSoftwareApplicationJsonLd({
  name,
  url,
  description,
  applicationCategory,
  featureList,
  keywords = [],
}: SoftwareApplicationJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    url,
    description,
    applicationCategory,
    operatingSystem: "Web",
    isAccessibleForFree: true,
    featureList,
    keywords: keywords.join(", "),
    publisher: {
      "@type": "Organization",
      name: "Tools App",
      url: "https://tools.toolrouteai.com",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
