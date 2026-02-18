const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const getToken = () => {
  return localStorage.getItem("authToken");
};

export async function apiRequest(
  path,
  { method = "GET", body, auth = false } = {},
) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }
  return data;
}
