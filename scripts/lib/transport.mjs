// HTTPS checks outside the browser: does http:// redirect to https://, is HSTS set.

const TIMEOUT_MS = 15_000;
const USER_AGENT = 'website-legal-check-de (technical website check)';

async function probe(url) {
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT },
    });
    await response.body?.cancel();
    return {
      status: response.status,
      location: response.headers.get('location'),
      hsts: response.headers.get('strict-transport-security'),
    };
  } catch (error) {
    return { error: error.cause?.code ?? error.name ?? 'fetch failed' };
  }
}

/**
 * @param {URL} start
 * @returns {Promise<{http: object, https: object, httpRedirectsToHttps: boolean|null}>}
 */
export async function checkTransport(start) {
  const httpUrl = new URL(start);
  httpUrl.protocol = 'http:';
  const httpsUrl = new URL(start);
  httpsUrl.protocol = 'https:';
  const [http, https] = await Promise.all([probe(httpUrl.toString()), probe(httpsUrl.toString())]);
  let httpRedirectsToHttps = null;
  if (!http.error) {
    const isRedirect = http.status >= 300 && http.status < 400;
    httpRedirectsToHttps = isRedirect && /^https:\/\//i.test(http.location ?? '');
  }
  return { http, https, httpRedirectsToHttps };
}
