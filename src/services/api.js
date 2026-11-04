export class ApiError extends Error {
  constructor(status, body) {
    super(body?.detail ?? `Error HTTP ${status}`);
    this.status = status; // 0: no hubo respuesta
    this.fieldErrors = body?.errores ?? [];
  }
}

const cache = new Map();

export async function api(url, { method = 'GET', body, signal, retries = 3, timeout = 5000 } = {}) {
  let attempt = 0;

  while (attempt < retries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    let res;
    try {
      res = await fetch(url, { 
        method, 
        signal: signal || controller.signal, 
        body: body && JSON.stringify(body),
        headers: body ? { 'Content-Type': 'application/json' } : undefined 
      });
      clearTimeout(timer);
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw err;

      if (attempt === retries) {
        throw new ApiError(0, { detail: 'No se pudo contactar al servidor' });
      }

      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      continue;
    }

    const data = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status >= 500 && attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        continue; 
      }
      throw new ApiError(res.status, data);
    }

    return data;
  }
}