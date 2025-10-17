export async function apiFetch(url, method = "GET", data = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };

  const res = await fetch(url, options);
  if (!res.ok) throw new Error((await res.json()).detail || "Request failed");
  return res.json();
}

//you can call this anywhere:
//const items = await apiFetch(`${apiBaseUrl}/api/items`, "GET", null, token);
