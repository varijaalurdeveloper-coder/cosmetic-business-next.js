import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  DEFAULT_OG_IMAGE,
  GOOGLE_ANALYTICS_ID,
  GOOGLE_SITE_VERIFICATION,
  SITE_URL,
} from "@/lib/seo";

export default function Head() {
  return (
    <>
      {GOOGLE_SITE_VERIFICATION && (
        <meta
          name="google-site-verification"
          content={GOOGLE_SITE_VERIFICATION}
        />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Rima Cosmetics",
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION,
            logo: `${SITE_URL}/assets/OrganicHairOil.webp`,
          }),
        }}
      />

      {GOOGLE_ANALYTICS_ID && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GOOGLE_ANALYTICS_ID}');`,
            }}
          />
        </>
      )}
    </>
  );
}
