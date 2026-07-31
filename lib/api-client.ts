/**
 * Reads an API response safely. Hosting platforms sometimes return an HTML
 * error page (for example, a 404, proxy error, or function crash) instead of
 * the JSON returned by our route handlers. Do not pass that document to
 * JSON.parse, since it masks the underlying deployment problem.
 */
export async function readApiResponse<T = Record<string, unknown>>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(body) as T;
    } catch {
      throw new Error(`The server returned malformed JSON (HTTP ${response.status}).`);
    }
  }

  const title = body.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
  const detail = title || (body.trim().startsWith('<') ? 'an HTML error page' : 'a non-JSON response');
  throw new Error(`The API returned ${detail} (HTTP ${response.status}). Check that the /api routes are served by Next.js and review the host logs.`);
}
