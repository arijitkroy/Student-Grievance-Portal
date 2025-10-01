export const apiFetch = async (url, { method = "GET", body, headers = {}, json = true } = {}) => {
  const isJsonBody = body && json && !(body instanceof FormData);
  const finalHeaders = {
    ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isJsonBody ? JSON.stringify(body) : body,
    credentials: "include",
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const buildQueryString = (params = {}) => {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    urlParams.set(key, value);
  });
  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : "";
};
