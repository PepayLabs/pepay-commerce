import React from 'react';
import { Helmet } from 'react-helmet';

interface ProfileMetadataProps {
  profile: {
    account: {
      display_name: string;
      bio: string;
      short_bio: string;
      profile_image_signed_url: string;
      background_image_signed_url: string;
      background_color: string;
      background_text_color: string;
      account_type: string;
      is_verified: boolean;
      website_url: string;
      instagram_url: string;
      twitter_url: string;
      tiktok_url: string;
      youtube_url: string;
      farcaster_url: string;
    };
    links?: any[];
    media?: any[];
    goal?: any;
  };
  displayLink: string;
}

export default function ProfileMetadata({ profile, displayLink }: ProfileMetadataProps) {
  // Safely convert values to strings to avoid Symbol conversion errors
  const safeString = (value: any): string => {
    try {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      if (typeof value === 'boolean') return String(value);
      if (typeof value === 'symbol') return '';
      return '';
    } catch (e) {
      return '';
    }
  };

  // Enhanced metadata values
  const displayName = safeString(profile.account.display_name) || 'Profile';
  const bio = safeString(profile.account.bio) || '';
  const shortBio = safeString(profile.account.short_bio) || bio.substring(0, 160) || '';
  const profileImageUrl = safeString(profile.account.profile_image_signed_url) || '';
  const backgroundImageUrl = safeString(profile.account.background_image_signed_url) || '';
  const safeDisplayLink = safeString(displayLink) || '';
  const accountType = safeString(profile.account.account_type) || 'creator';
  const isVerified = profile.account.is_verified || false;
  const backgroundColor = safeString(profile.account.background_color) || '#da532c';
  const websiteUrl = safeString(profile.account.website_url) || '';
  const twitterUrl = safeString(profile.account.twitter_url) || '';
  const instagramUrl = safeString(profile.account.instagram_url) || '';
  const tiktokUrl = safeString(profile.account.tiktok_url) || '';
  const youtubeUrl = safeString(profile.account.youtube_url) || '';
  const farcasterUrl = safeString(profile.account.farcaster_url) || '';
  
  // URLs and metadata
  const profileUrl = 'https://grabmeaslice.com/i/' + safeDisplayLink;
  const pageTitle = displayName + ' - Crypto Donations & Support | Grab Me a Slice';
  const metaDescription = shortBio || bio || displayName + ' accepts crypto donations on Grab Me a Slice - Support creators and non-profits with cryptocurrency payments';
  const siteName = 'Grab Me a Slice';
  const imageAltText = displayName + "'s profile picture on Grab Me a Slice";
  const currentDate = new Date().toISOString();
  
  // Elite SEO Keywords for name-based searches
  const baseKeywords = [
    displayName.toLowerCase(),
    safeDisplayLink.toLowerCase(),
    displayName.toLowerCase() + ' crypto donations',
    displayName.toLowerCase() + ' support',
    displayName.toLowerCase() + ' grab me a slice',
    displayName.toLowerCase() + ' buy me a coffee',
    displayName.toLowerCase() + ' web3',
    displayName.toLowerCase() + 'payments',
    'crypto donations',
    'crypto pay USD1', 
    'multi-chain payments',
    'cryptocurrency payments',
    'web3 donations',
    'blockchain payments',
    'crypto support creators',
    'crypto non-profit donations',
    'bitcoin donations',
    'ethereum donations',
    'cryptocurrency charity',
    'decentralized donations',
    'content creator',
    'creator economy',
    'digital creator',
    'fan support',
    'tip creator',
    'support ' + displayName.toLowerCase(),
    accountType,
    accountType + ' crypto donations',
    'grab me a slice',
    'grabmeaslice'
  ];
  
  const creatorSpecificKeywords = accountType === 'artist' ? [
    displayName.toLowerCase() + ' artist',
    displayName.toLowerCase() + ' artwork',
    'crypto art donations',
    'support digital artist'
  ] : accountType === 'musician' ? [
    displayName.toLowerCase() + ' musician',
    displayName.toLowerCase() + ' music',
    'crypto music donations',
    'support musician'
  ] : accountType === 'nonprofit' ? [
    displayName.toLowerCase() + ' nonprofit',
    displayName.toLowerCase() + ' charity',
    'crypto charity donations',
    'cryptocurrency nonprofit'
  ] : [
    displayName.toLowerCase() + ' creator',
    'crypto creator support'
  ];
  
  const allKeywords = [...baseKeywords, ...creatorSpecificKeywords].join(', ');

  // Enhanced creator type classification
  const creatorType = accountType === 'artist' ? 'Digital Artist' : 
                     accountType === 'musician' ? 'Music Artist' :
                     accountType === 'writer' ? 'Author & Writer' :
                     accountType === 'educator' ? 'Educational Creator' :
                     accountType === 'nonprofit' ? 'Non-Profit Organization' :
                     'Content Creator';

  // All social links for structured data
  const socialLinks = [
    { platform: 'Instagram', url: instagramUrl },
    { platform: 'Twitter', url: twitterUrl },
    { platform: 'TikTok', url: tiktokUrl },
    { platform: 'YouTube', url: youtubeUrl },
    { platform: 'Farcaster', url: farcasterUrl },
    { platform: 'Website', url: websiteUrl }
  ].filter(link => link.url.length > 0);

  // Elite structured data for Google Knowledge Graph
  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": accountType === 'nonprofit' ? "Organization" : "Person",
    "name": displayName,
    "alternateName": [safeDisplayLink, displayName + " on Grab Me a Slice"],
    "description": metaDescription,
    "url": profileUrl,
    "image": profileImageUrl,
    "sameAs": socialLinks.map(link => link.url),
    "identifier": [
      {
        "@type": "PropertyValue",
        "name": "Grab Me a Slice Profile",
        "value": safeDisplayLink
      }
    ],
    "mainEntityOfPage": profileUrl,
    "knowsAbout": ["Cryptocurrency", "Digital Payments", "Creator Economy", "Blockchain Technology"],
    "hasOccupation": {
      "@type": "Occupation",
      "name": creatorType
    },
    "brand": {
      "@type": "Brand",
      "name": displayName,
      "url": profileUrl
    }
  };

  // Enhanced offer structured data for crypto donations
  const offerStructuredData = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": "Support " + displayName + " with Crypto Donations",
    "description": "Support " + displayName + " with cryptocurrency donations on Grab Me a Slice platform",
    "seller": personStructuredData,
    "url": profileUrl,
    "category": "Cryptocurrency Donations",
    "availability": "InStock",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "price": "0",
      "priceCurrency": "USD",
      "valueAddedTaxIncluded": false
    },
    "acceptedPaymentMethod": [
      "Bitcoin",
      "Ethereum", 
      "Cryptocurrency",
      "Digital Currency"
    ]
  };

  // FAQ structured data optimized for voice search
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How can I support " + displayName + " with cryptocurrency?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can support " + displayName + " with crypto donations through their Grab Me a Slice profile. The platform accepts various cryptocurrencies including Bitcoin and Ethereum for creator and non-profit support."
        }
      },
      {
        "@type": "Question", 
        "name": "What cryptocurrencies does " + displayName + " accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": displayName + " accepts cryptocurrency donations through Grab Me a Slice, which supports Bitcoin, Ethereum, and other digital currencies for secure, decentralized payments."
        }
      },
      {
        "@type": "Question",
        "name": "Is " + displayName + " verified on Grab Me a Slice?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": displayName + (isVerified ? " is a verified creator" : " is a creator") + " on Grab Me a Slice, a platform for cryptocurrency donations to creators and non-profits."
        }
      }
    ]
  };

  // Website structured data
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": "https://grabmeaslice.com",
    "description": "Cryptocurrency donations platform for creators and non-profits - Support with Bitcoin, Ethereum & more",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://grabmeaslice.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "about": [
      "Cryptocurrency Donations",
      "Creator Economy", 
      "Non-Profit Support",
      "Blockchain Payments",
      "Digital Currency"
    ]
  };

  // Breadcrumb for better navigation understanding
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Grab Me a Slice",
        "item": "https://grabmeaslice.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Creator Profiles",
        "item": "https://grabmeaslice.com/creators"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": displayName,
        "item": profileUrl
      }
    ]
  };

  // Enhanced image metadata
  const imageMetaTags = profileImageUrl.length > 0 ? [
    <meta key="og-image" property="og:image" content={profileImageUrl} />,
    <meta key="og-image-secure" property="og:image:secure_url" content={profileImageUrl} />,
    <meta key="og-image-alt" property="og:image:alt" content={imageAltText} />,
    <meta key="og-image-width" property="og:image:width" content="1200" />,
    <meta key="og-image-height" property="og:image:height" content="630" />,
    <meta key="og-image-type" property="og:image:type" content="image/jpeg" />,
    <meta key="twitter-image" name="twitter:image" content={profileImageUrl} />,
    <meta key="twitter-image-alt" name="twitter:image:alt" content={imageAltText} />,
    <meta key="whatsapp-image" property="og:image" content={profileImageUrl} />,
    <meta key="telegram-image" property="og:image" content={profileImageUrl} />
  ] : [];

  const verificationMetaTags = isVerified ? [
    <meta key="verified" name="verified" content="true" />,
    <meta key="og-verified" property="og:verified" content="true" />
  ] : [];

  const preloadTags = [
    profileImageUrl.length > 0 ? <link key="preload-profile" rel="preload" as="image" href={profileImageUrl} /> : null,
    backgroundImageUrl.length > 0 ? <link key="preload-bg" rel="preload" as="image" href={backgroundImageUrl} /> : null
  ].filter(tag => tag !== null);

  // Add these concise enhancements:
  
  // 1. Performance DNS prefetch for external domains
  const dnsPrefetchTags = [
    <link key="dns-prefetch-1" rel="dns-prefetch" href="//cdn.jsdelivr.net" />,
    <link key="dns-prefetch-2" rel="dns-prefetch" href="//fonts.googleapis.com" />,
    <link key="dns-prefetch-3" rel="dns-prefetch" href="//www.google-analytics.com" />,
    websiteUrl ? <link key="dns-prefetch-website" rel="dns-prefetch" href={new URL(websiteUrl).origin} /> : null,
    twitterUrl ? <link key="dns-prefetch-twitter" rel="dns-prefetch" href="//twitter.com" /> : null,
    instagramUrl ? <link key="dns-prefetch-instagram" rel="dns-prefetch" href="//instagram.com" /> : null
  ].filter(tag => tag !== null);

  // 2. Web Monetization for crypto payments
  const webMonetizationTag = <meta key="monetization" name="monetization" content={`$grabmeaslice.com/i/${safeDisplayLink}`} />;  // 3. Enhanced price/donation structured data
  const priceStructuredData = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "price": "5.00",
    "priceCurrency": "USD",
    "description": "Starting donation amount for " + displayName,
    "valueAddedTaxIncluded": false
  };

  // 4. Local SEO (helps with "near me" searches)
  const localSeoTags = [
    <meta key="geo-region" name="geo.region" content="US" />,
    <meta key="geo-country" name="geo.country" content="US" />,
    <meta key="geo-position" name="geo.position" content="39.8283;-98.5795" />, // US center
    <meta key="icbm" name="ICBM" content="39.8283, -98.5795" />
  ];

  // 5. Voice search optimization
  const voiceSearchKeywords = [
    "how to support " + displayName.toLowerCase(),
    "donate to " + displayName.toLowerCase(),
    displayName.toLowerCase() + " crypto donations",
    displayName.toLowerCase() + " bitcoin support"
  ].join(', ');

  return (
    <Helmet>
      {/* Core SEO Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={profileUrl} />
      
      {/* Open Graph Meta Tags - Enhanced for sharing */}
      <meta property="og:url" content={profileUrl} />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={profileUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:site" content="@grabmeaslice" />
      <meta name="twitter:creator" content={'@' + safeDisplayLink} />
      <meta name="twitter:label1" content="Creator Type" />
      <meta name="twitter:data1" content={creatorType} />
      <meta name="twitter:label2" content="Platform" />
      <meta name="twitter:data2" content="Crypto Donations" />
      
      {/* WhatsApp Optimization */}
      <meta property="whatsapp:title" content={displayName + " - Crypto Support"} />
      <meta property="whatsapp:description" content={metaDescription} />
      <meta property="whatsapp:url" content={profileUrl} />
      
      {/* Telegram Optimization */}
      <meta name="telegram:channel" content="grabmeaslice" />
      <meta name="telegram:title" content={displayName + " - Crypto Donations"} />
      <meta name="telegram:description" content={metaDescription} />
      
      {/* Enhanced Profile-specific Meta */}
      <meta property="profile:first_name" content={displayName.split(' ')[0]} />
      <meta property="profile:last_name" content={displayName.split(' ').slice(1).join(' ')} />
      <meta property="profile:username" content={safeDisplayLink} />
      
      {/* Business/Creator Meta */}
      <meta name="business:name" content={displayName} />
      <meta name="business:type" content={accountType} />
      <meta name="creator:name" content={displayName} />
      <meta name="creator:platform" content="Grab Me a Slice" />
      <meta name="creator:type" content={creatorType} />
      
      {/* Crypto/Web3 Specific Meta */}
      <meta name="web3:platform" content="Grab Me a Slice" />
      <meta name="crypto:donations" content="enabled" />
      <meta name="blockchain:payments" content="supported" />
      
      {/* Apple iOS */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={displayName + " - Crypto Support"} />
      
      {/* Microsoft */}
      <meta name="msapplication-TileColor" content={backgroundColor} />
      <meta name="theme-color" content={backgroundColor} />
      
      {/* Elite SEO Tags for Name-based Discovery */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="author" content={displayName} />
      <meta name="creator" content={displayName} />
      <meta name="publisher" content="Grab Me a Slice" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="1 days" />
      <meta name="page-topic" content="Creator Profile, Crypto Donations" />
      <meta name="page-type" content="Profile Page" />
      <meta name="audience" content="all" />
      <meta name="classification" content="Creator Platform, Cryptocurrency" />
      <meta name="category" content="Social Media, Creator Economy, Cryptocurrency, Non-Profit" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="all" />
      
      {/* Performance & Security */}
      <meta httpEquiv="Cache-Control" content="public, max-age=3600" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Render conditional arrays */}
      {imageMetaTags}
      {verificationMetaTags}
      {preloadTags}
      
      {/* Add voice search keywords */}
      <meta name="voice-search" content={voiceSearchKeywords} />
      
      {/* Web Monetization */}
      {webMonetizationTag}
      
      {/* Enhanced performance */}
      {dnsPrefetchTags}
      
      {/* Local SEO */}
      {localSeoTags}
      
      {/* Elite JSON-LD Structured Data for Google Knowledge Graph */}
      <script type="application/ld+json">
        {JSON.stringify(personStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(offerStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>
      
      {/* Add price structured data */}
      <script type="application/ld+json">
        {JSON.stringify(priceStructuredData)}
      </script>
    </Helmet>
  );
}
