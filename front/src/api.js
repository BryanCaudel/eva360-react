// src/api.js
import { API_URL } from "./config";

//maneja los errores en caso de que el servidor este caido
async function req(path, opts = {}) {
  const url = `${API_URL}${path.startsWith("/") ? path : "/" + path}`;

  let r;
  try {
    r = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
      ...opts,
    });
  } catch (err) {
    console.error("Error de red llamando a", url, err);
    throw new Error(
      "No se pudo conectar con el servidor. Verifica tu conexión o que la API esté encendida."
    );
  }

  const contentType = r.headers.get("content-type") || "";
  let data = {};
  if (contentType.includes("application/json")) {
    data = await r.json().catch(() => ({}));
  } else {
    const text = await r.text().catch(() => "");
    if (text) data = { message: text };
  }

  if (!r.ok) {
    const message =
      data.error ||
      data.message ||
      data.detail ||
      `Error HTTP ${r.status}`;
    throw new Error(message);
  }

  return data;
}

// Ping
export function health() {
  return req("/health");
}


export function crearCodigo(evaluado_nombre, encuesta_id = 1) {
  return req("/admin/codigos", {
    method: "POST",
    body: JSON.stringify({ evaluado_nombre, encuesta_id }),
  });
}
export async function listarCodigos() {
  const rows = await req("/admin/codigos");
  if (!Array.isArray(rows)) return [];

  return rows.map((r) => ({
    ...r,
    codigo_acceso: r.codigo,
  }));
}
export function listarEvaluaciones() {
  return req("/admin/evaluaciones");
}
export function listarEvaluacionesPorEvaluado() {
  return req("/admin/evaluaciones-por-evaluado");
}

export function crearSesion(codigo) {
  return req("/captura/sesion", {
    method: "POST",
    body: JSON.stringify({ codigo }),
  });
}

export function enviarRespuestas(token_sesion, respuestas) {
  return req("/captura/respuestas", {
    method: "POST",
    body: JSON.stringify({ token_sesion, respuestas }),
  });
}

export function guardarRespuestas(token_sesion, respuestas) {
  return enviarRespuestas(token_sesion, respuestas);
}

export function finalizarSesion(token_sesion) {
  return req("/captura/finalizar", {
    method: "POST",
    body: JSON.stringify({ token_sesion }),
  });
}
