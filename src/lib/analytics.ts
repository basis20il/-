// Loads third-party analytics/tracking scripts — only called after explicit user consent.
export const loadAnalytics = () => {
  if ((window as any).__migdanotAnalyticsLoaded) return;
  (window as any).__migdanotAnalyticsLoaded = true;

  // Google Tag Manager
  (function (w: any, d: Document, s: string, l: string, i: string) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s) as HTMLScriptElement;
    const dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode?.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-TMZKBN7P');

  // Google Analytics (GA4)
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-R8L6X35W99';
  document.head.appendChild(gaScript);
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-R8L6X35W99');

  // Microsoft Clarity
  (function (c: any, l: Document, a: string, r: string, i: string) {
    c[a] = c[a] || function (...args: any[]) { (c[a].q = c[a].q || []).push(args); };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'x0gt4ojcne');

  // ContentSquare
  (function (s: Document, q: string, u: string, a: string) {
    const e = s.createElement(q) as HTMLScriptElement;
    e.async = true;
    e.src = u + a;
    const f = s.getElementsByTagName(q)[0];
    f.parentNode?.insertBefore(e, f);
  })(document, 'script', 'https://t.contentsquare.net/uxa/', '87d9fcfdc7781.js');

  // Cloudflare Web Analytics
  const cf = document.createElement('script');
  cf.defer = true;
  cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  cf.setAttribute('data-cf-beacon', JSON.stringify({ token: '09c81cedac034cf091ec4c38785f47a7' }));
  document.head.appendChild(cf);
};
