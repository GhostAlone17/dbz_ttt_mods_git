const BASE = import.meta.env.BASE_URL;
const API = 'https://api.github.com';
const REPO = 'GhostAlone17/dbz_ttt_mods_git';
const BRANCH = 'main';
const DATA_PATH = 'public/data/mods.json';
const IMAGE_FIELDS = ['image', 'image_attack1', 'image_attack2', 'image_attack3'];
const TOKEN_KEY = 'gh_token';

// Imágenes subidas en esta pestaña: se muestran al instante sin esperar al deploy
const sessionImages = new Map();

const toBase64 = (bytes) => {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const fromBase64 = (b64) =>
  Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0));

const slugify = (value) =>
  (value || 'imagen')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '') || 'imagen';

export const getGithubToken = () => sessionStorage.getItem(TOKEN_KEY) || '';
export const setGithubToken = (token) => sessionStorage.setItem(TOKEN_KEY, token.trim());
export const clearGithubToken = () => sessionStorage.removeItem(TOKEN_KEY);
export const hasGithubToken = () => Boolean(sessionStorage.getItem(TOKEN_KEY));

export const resolveImage = (value) => {
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return value;
  const path = value.replace(/^\//, '');
  const local = sessionImages.get(path);
  if (local) return local;
  return `${BASE}${path}`;
};

export const toStoragePath = (value) => {
  if (!value) return null;
  if (value.startsWith(BASE)) return value.slice(BASE.length);
  return value;
};

const resolveMod = (mod) => {
  const copy = { ...mod };
  for (const field of IMAGE_FIELDS) {
    if (copy[field]) copy[field] = resolveImage(copy[field]);
  }
  return copy;
};

const serializeMod = (input) => {
  const out = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = IMAGE_FIELDS.includes(key) ? toStoragePath(value) : value;
  }
  return out;
};

function requireToken() {
  const token = getGithubToken();
  if (!token) {
    throw new Error('Falta el token de GitHub. Vuelve a iniciar sesión en el panel.');
  }
  return token;
}

async function github(pathOrUrl, init = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API}${pathOrUrl}`;
  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${requireToken()}`,
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      if (body.message) detail = `: ${body.message}`;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    if (res.status === 401) detail += ' (token inválido o expirado)';
    if (res.status === 403) detail += ' (sin permisos: el token necesita Contents: Read and write)';
    if (res.status === 404) detail += ' (¿repositorio o archivo inexistente?)';
    if (res.status === 409) detail += ' (conflicto de versión: se reintenta)';
    const error = new Error(`GitHub ${res.status}${detail}`);
    error.status = res.status;
    throw error;
  }
  return res;
}

async function readDataset() {
  const res = await github(`/repos/${REPO}/contents/${DATA_PATH}?ref=${BRANCH}`);
  const meta = await res.json();
  const text = new TextDecoder().decode(fromBase64(meta.content));
  const mods = JSON.parse(text);
  if (!Array.isArray(mods)) throw new Error('data/mods.json no contiene una lista de mods');
  return { mods, sha: meta.sha };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function writeDataset(mods, message) {
  const ordered = [...mods].sort(
    (a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0)
  );
  const payload = JSON.stringify(ordered, null, 2) + '\n';
  const content = toBase64(new TextEncoder().encode(payload));
  const MAX_ATTEMPTS = 4;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    // sha fresco en cada intento (sin caché del navegador)
    const { sha } = await readDataset();
    try {
      const res = await github(`/repos/${REPO}/contents/${DATA_PATH}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, content, sha, branch: BRANCH }),
      });
      await res.json();
      return ordered;
    } catch (error) {
      if (error.status !== 409 || attempt === MAX_ATTEMPTS) throw error;
      await wait(400 * attempt);
    }
  }
}

// Serializa las escrituras para que dos acciones simultáneas no se pisen el sha
let writeQueue = Promise.resolve();
function withLock(task) {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => {});
  return run;
}

export async function fetchMods() {
  // Panel con token: lee directo del repo (siempre al día, sin esperar al deploy)
  if (hasGithubToken()) {
    try {
      const { mods } = await readDataset();
      return mods.map(resolveMod);
    } catch (err) {
      console.warn('GitHub no disponible, usando el JSON publicado:', err.message);
    }
  }

  try {
    const res = await fetch(`${BASE}data/mods.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const mods = await res.json();
    return Array.isArray(mods) ? mods.map(resolveMod) : [];
  } catch (err) {
    console.warn('No se pudo cargar data/mods.json:', err.message);
    return [];
  }
}

export function createMod(input) {
  return withLock(async () => {
    const { mods } = await readDataset();
    const nextId = mods.length
      ? Math.max(...mods.map((m) => Number(m.id) || 0)) + 1
      : 1;
    const now = new Date();

    const mod = {
      id: nextId,
      created_at: now.toISOString(),
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      image: toStoragePath(input.image) || null,
      image_attack1: toStoragePath(input.image_attack1) || null,
      image_attack2: toStoragePath(input.image_attack2) || null,
      image_attack3: toStoragePath(input.image_attack3) || null,
      download_link: input.download_link || null,
      youtube_link: input.youtube_link || null,
      date: input.date || now.toISOString().slice(0, 10),
      version: input.version || null,
      platform: input.platform || null,
    };

    mods.push(mod);
    const ordered = await writeDataset(mods, `feat: publicar mod "${mod.title}"`);
    return ordered.map(resolveMod);
  });
}

export function updateMod(id, input) {
  return withLock(async () => {
    const { mods } = await readDataset();
    const index = mods.findIndex((m) => Number(m.id) === Number(id));
    if (index === -1) throw new Error(`No existe el mod con id ${id}`);

    mods[index] = {
      ...mods[index],
      ...serializeMod({
        title: input.title,
        description: input.description || null,
        category: input.category || null,
        version: input.version || null,
        platform: input.platform || null,
        image: input.image || null,
        image_attack1: input.image_attack1 || null,
        image_attack2: input.image_attack2 || null,
        image_attack3: input.image_attack3 || null,
        download_link: input.download_link || null,
        youtube_link: input.youtube_link || null,
      }),
    };

    const ordered = await writeDataset(mods, `feat: actualizar mod "${mods[index].title}"`);
    return ordered.map(resolveMod);
  });
}

export function deleteMod(id) {
  return withLock(async () => {
    const { mods } = await readDataset();
    const target = mods.find((m) => Number(m.id) === Number(id));
    if (!target) throw new Error(`No existe el mod con id ${id}`);

    const remaining = mods.filter((m) => Number(m.id) !== Number(id));
    const ordered = await writeDataset(remaining, `feat: eliminar mod "${target.title}"`);
    return ordered.map(resolveMod);
  });
}

async function optimizeForUpload(blob, originalName) {
  if (blob.type === 'image/gif' || /\.gif$/i.test(originalName || '')) {
    return { bytes: new Uint8Array(await blob.arrayBuffer()), ext: 'gif' };
  }

  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
  if (webp && webp.type === 'image/webp') {
    return { bytes: new Uint8Array(await webp.arrayBuffer()), ext: 'webp' };
  }

  // Si el navegador no sabe hacer webp, subimos el original con su extensión real
  const extFromName = (originalName.match(/\.([a-z0-9]{2,5})$/i) || [])[1];
  const extFromType = (blob.type.split('/')[1] || '').replace('jpeg', 'jpg');
  const safe = ['png', 'jpg', 'jpeg', 'avif', 'svg'];
  const ext =
    safe.includes((extFromName || '').toLowerCase()) ? extFromName.toLowerCase()
      : safe.includes(extFromType) ? extFromType
      : 'png';
  return { bytes: new Uint8Array(await blob.arrayBuffer()), ext: ext.replace('jpeg', 'jpg') };
}

const MIME_BY_EXT = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' };

export async function uploadImage(blob, originalName = '') {
  const { bytes, ext } = await optimizeForUpload(blob, originalName);
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 8);
  const name = `${slugify(originalName.replace(/\.[^.]+$/, '')) || 'imagen'}-${hash}.${ext}`;
  const storagePath = `images/${name}`;

  const res = await github(`/repos/${REPO}/contents/public/${storagePath}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `assets: subir imagen ${name}`,
      content: toBase64(bytes),
      branch: BRANCH,
    }),
  });
  await res.json();

  // Preview inmediato mientras GitHub Pages termina el deploy
  sessionImages.set(storagePath, URL.createObjectURL(new Blob([bytes], { type: MIME_BY_EXT[ext] || 'image/webp' })));

  return resolveImage(storagePath);
}
