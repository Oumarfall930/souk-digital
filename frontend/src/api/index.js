// ── API base URL ──
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('souk_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

// ── Auth ──
export const login = (email, password) =>
  request('POST', '/auth/login', { email, password });

// ── Shops ──
export const getShops       = ()          => request('GET', '/shops');
export const getAllShops     = ()          => request('GET', '/shops/all');
export const getShop        = (id)        => request('GET', `/shops/${id}`);
export const getMyShop      = ()          => request('GET', '/shops/mine/info');
export const createShop     = (data)      => request('POST', '/shops', data);
export const updateShop     = (id, data)  => request('PUT', `/shops/${id}`, data);
export const updatePayments = (id, payments) => request('PUT', `/shops/${id}/payments`, { payments });
export const deleteShop     = (id)        => request('DELETE', `/shops/${id}`);

// ── Products ──
export const getProducts   = (shop_id)    => request('GET', `/products?shop_id=${shop_id}`);
export const createProduct = (data)       => request('POST', '/products', data);
export const updateProduct = (id, data)   => request('PUT', `/products/${id}`, data);
export const deleteProduct = (id)         => request('DELETE', `/products/${id}`);

// ── Sales ──
export const getMySales    = ()           => request('GET', '/sales');
export const getAllSales    = ()           => request('GET', '/sales/all');
export const getSalesStats = ()           => request('GET', '/sales/stats');
export const createSale    = (data)       => request('POST', '/sales', data);
export const deleteSale    = (id)         => request('DELETE', `/sales/${id}`);

// ── Users ──
export const getUsers       = ()          => request('GET', '/users');
export const changePassword = (id, password) => request('PUT', `/users/${id}/password`, { password });
export const deleteUser     = (id)        => request('DELETE', `/users/${id}`);

// ── Upload ──
export const uploadImage = (base64, filename, folder) =>
  request('POST', '/upload', { base64, filename, folder });
