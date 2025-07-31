import { Helmet } from 'react-helmet-async';

interface SEOMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'organization';
  author?: string;
  siteName?: string;
  twitterHandle?: string;
  structuredData?: Record<string, any>[];
  // Enhanced props
  locale?: string;
  alternateLocales?: string[];
  publishDate?: string;
  modifiedDate?: string;
  section?: string;
  tags?: string[];
  videoUrl?: string;
  audioUrl?: string;
  breadcrumbs?: Array<{name: string, url: string}>;
  faqData?: Array<{question: string, answer: string}>;
  priceRange?: string;
  currency?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
}

export default function SEOMetadata({
  title = 'Grab Me A Slice - The First Creator & Non-Profit Crypto Support Platform',
  description = 'The world\'s first creator and non-profit oriented platform for raising support and donations in pure cryptocurrency. Dynamic, secure, and built for the future of digital giving.',
  keywords = [],
  image = '/images/gmas-og-image.png',
  url = 'https://grabmeaslice.com',
  type = 'website',
  author = 'Grab Me A Slice',
  siteName = 'Grab Me A Slice',
  twitterHandle = '@grabmeaslice',
  structuredData = [],
  locale = 'en_US',
  alternateLocales = [],
  publishDate,
  modifiedDate,
  section = 'Home',
  tags = [],
  videoUrl,
  audioUrl,
  breadcrumbs = [],
  faqData = [],
  priceRange = '$0-$∞',
  currency = 'USD',
  availability = 'InStock',
  rating,
  reviewCount
}: SEOMetadataProps) {
  
  // Elite keyword optimization
  const defaultKeywords = [
    'crypto donations',
    'creator support', 
    'non-profit platform',
    'cryptocurrency giving',
    'web3 donations',
    'blockchain donations',
    'digital fundraising',
    'crypto philanthropy',
    'decentralized donations',
    'creator economy',
    'influencer support',
    'first crypto donation platform',
    'bitcoin donations',
    'ethereum donations',
    'multi-chain payments',
    'crypto tipping',
    'web3 creator platform',
    'blockchain philanthropy',
    'cryptocurrency charity',
    'digital giving',
    'crypto payments',
    'usd1 payments',
    'usd1 donations',
    'stablecoin donations',
    'defi donations',
    'nft creator support',
    'dao donations',
    'crypto fundraising',
    'digital creator economy',
    'web3 social impact'
  ];

  const allKeywords = [...defaultKeywords, ...keywords, ...tags].join(', ');
  const currentDate = new Date().toISOString();
  const imageUrl = image.startsWith('http') ? image : `${url}${image}`;
  const publishDateTime = publishDate || currentDate;
  const modifiedDateTime = modifiedDate || currentDate;

  // Voice search optimization
  const voiceSearchKeywords = [
    'how to donate crypto',
    'best crypto donation platform',
    'support creators with cryptocurrency',
    'crypto tipping platform',
    'web3 donation site',
    'blockchain giving platform',
    'first crypto donation platform',
    'grab me a slice crypto',
    'cryptocurrency charity platform',
    'donate bitcoin to creators'
  ].join(', ');

  // Enhanced structured data
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": url,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": `${url}/images/gmas-app-square.png`
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": url,
    "logo": `${url}/images/gmas-app-square.png`,
    "description": description,
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": author
    },
    "sameAs": [
      "https://twitter.com/grabmeaslice",
      "https://github.com/grabmeaslice",
      "https://t.me/grabmeaslice"
    ],
    "knowsAbout": [
      "Cryptocurrency",
      "Blockchain Technology", 
      "Digital Payments",
      "Creator Economy",
      "Non-profit Support",
      "Web3 Technology",
      "Decentralized Finance"
    ],
    "areaServed": "Worldwide",
    "serviceType": "Cryptocurrency Donation Platform"
  };

  // FAQ Schema for homepage
  const faqSchema = faqData.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  } : null;

  // Service schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Cryptocurrency Donation Platform",
    "description": description,
    "provider": organizationSchema,
    "areaServed": "Worldwide",
    "serviceType": "Financial Technology",
    "category": "Cryptocurrency Services",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": currency,
      "availability": `https://schema.org/${availability}`,
      "validFrom": publishDateTime
    }
  };

  // All schemas
  const allSchemas = [
    websiteSchema,
    organizationSchema,
    serviceSchema,
    ...structuredData
  ];

  if (faqSchema) allSchemas.push(faqSchema);
  if (breadcrumbSchema) allSchemas.push(breadcrumbSchema);

  // DNS prefetch optimization
  const dnsPrefetches = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://connect.facebook.net',
    'https://platform.twitter.com',
    'https://cdn.jsdelivr.net'
  ];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={url} />
      
      {/* Enhanced Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${siteName} - Crypto Donation Platform`} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map(loc => (
        <meta key={loc} property="og:locale:alternate" content={loc} />
      ))}
      
      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={`${siteName} - Crypto Donation Platform`} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:label1" content="Platform Type" />
      <meta name="twitter:data1" content="Crypto Donations" />
      <meta name="twitter:label2" content="Supported" />
      <meta name="twitter:data2" content="Creators & Non-Profits" />
      
      {/* WhatsApp & Telegram Optimization */}
      <meta property="whatsapp:title" content={title} />
      <meta property="whatsapp:description" content={description} />
      <meta property="whatsapp:url" content={url} />
      <meta property="whatsapp:image" content={imageUrl} />
      <meta name="telegram:channel" content="grabmeaslice" />
      <meta name="telegram:title" content={title} />
      <meta name="telegram:description" content={description} />
      
      {/* Enhanced SEO Meta */}
      <meta name="author" content={author} />
      <meta name="publisher" content={siteName} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large" />
      <meta name="bingbot" content="index, follow" />
      <meta name="date" content={publishDateTime} />
      <meta name="last-modified" content={modifiedDateTime} />
      <meta name="revisit-after" content="1 day" />
      
      {/* Web3/Crypto Specific Meta */}
      <meta name="web3:platform" content="Grab Me A Slice" />
      <meta name="crypto:donations" content="enabled" />
      <meta name="blockchain:payments" content="supported" />
      <meta name="crypto:currencies" content="Bitcoin, Ethereum, USD Coin, Tether, Polygon" />
      <meta name="web3:wallet" content="supported" />
      <meta name="defi:protocol" content="multi-chain" />
      
      {/* Voice Search Optimization */}
      <meta name="voice-search" content={voiceSearchKeywords} />
      <meta name="search-intent" content="informational, transactional" />
      <meta name="semantic-keywords" content={allKeywords} />
      
      {/* Performance & Security */}
      <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Progressive Web App */}
      <meta name="theme-color" content="#6442d6" />
      <meta name="msapplication-TileColor" content="#6442d6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Geographic & Language */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <meta name="language" content="English" />
      <meta name="content-language" content="en" />
      
      {/* Business & Category */}
      <meta name="category" content="Technology, Finance, Cryptocurrency, Creator Economy" />
      <meta name="classification" content="Cryptocurrency Platform" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="target" content="Creators, Non-profits, Crypto Users" />
      
      {/* DNS Prefetch for Performance */}
      {dnsPrefetches.map(domain => (
        <link key={domain} rel="dns-prefetch" href={domain} />
      ))}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Video/Audio Meta */}
      {videoUrl && (
        <>
          <meta property="og:video" content={videoUrl} />
          <meta property="og:video:type" content="video/mp4" />
          <meta name="twitter:player" content={videoUrl} />
        </>
      )}
      {audioUrl && (
        <meta property="og:audio" content={audioUrl} />
      )}
      
      {/* Rich Snippets */}
      {rating && (
        <>
          <meta name="rating" content={rating.toString()} />
          <meta property="og:rating" content={rating.toString()} />
        </>
      )}
      {reviewCount && (
        <meta name="review_count" content={reviewCount.toString()} />
      )}
      
      {/* Structured Data */}
      {allSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}