// src/services/auth.ts

export const API_URL = "http://127.0.0.1:8000"; // URL completa de tu backend

// LOGIN
export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(errorData.detail || "Error en las credenciales");
  }

  return response.json(); // { access_token, token_type }
}

// REGISTER
export async function register(formData: FormData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData, // enviar FormData directamente para fotos y campos
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(errorData.detail || "Error en el registro");
  }

  return response.json(); // { usuario_id, mensaje }
}
