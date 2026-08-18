/**
 * Base API utility — thin wrapper around fetch with error handling.
 */

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * Generic fetch wrapper.
 * @param {string}  url
 * @param {object}  options   – standard fetch init options
 * @returns {Promise<any>}    – parsed JSON body
 */
export async function request(url, options = {}) {
  const config = {
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    credentials: "include",   // send cookies for protected routes
    ...options,
  };

  // Remove Content-Type for requests without a body
  if (!config.body) {
    delete config.headers["Content-Type"];
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function get(url, options = {}) {
  return request(url, { ...options, method: "GET" });
}

export function post(url, body, options = {}) {
  return request(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patch(url, body, options = {}) {
  return request(url, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
