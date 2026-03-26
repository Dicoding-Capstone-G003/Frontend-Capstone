const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.detail === 'string') {
        message = errorBody.detail;
      }
    } catch {
      // Keep the fallback message when the error body is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function fetchHealth() {
  return request('/health');
}

export async function fetchRegions() {
  return request('/regions');
}

export async function fetchForecast(regionName) {
  return request('/forecast', {
    method: 'POST',
    body: JSON.stringify({ region_name: regionName }),
  });
}

export async function fetchLogs(regionName) {
  if (regionName) {
    try {
      return await request(`/logs/${encodeURIComponent(regionName)}`);
    } catch {
      return request('/logs');
    }
  }

  return request('/logs');
}

export { API_BASE_URL };
