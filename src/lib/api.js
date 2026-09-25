const BASE = import.meta.env.BASE_URL;
const API = 'https://api.github.com';
const REPO = 'GhostAlone17/dbz_ttt_mods_git';
const BRANCH = 'main';
const DATA_PATH = 'public/data/mods.json';
const IMAGE_FIELDS = ['image', 'image_attack1', 'image_attack2', 'image_attack3'];
const TOKEN_KEY = 'gh_token';

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
  return `${BASE}${value.replace(/^\//, '')}`;
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

async function writeDataset(mods, message) {
  const ordered = [...mods].sort(
    (a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0)
  );
  const payload = JSON.stringify(ordered, null, 2) + '\n';

  let attempt = 0;
  while (attempt < 2) {
    attempt += 1;
    const { sha } = await readDataset();
    try {
      const res = await github(`/repos/${REPO}/contents/${DATA_PATH}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          content: toBase64(new TextEncoder().encode(payload)),
          sha,
          branch: BRANCH,
        }),
      });
      return await res.json();
    } catch (error) {
      if (error.status !== 409 || attempt === 2) throw error;
    }
  }
}

export async function fetchMods() {
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

export async function createMod(input) {
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
  await writeDataset(mods, `feat: publicar mod "${mod.title}"`);
}

export async function updateMod(id, input) {
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

  await writeDataset(mods, `feat: actualizar mod "${mods[index].title}"`);
}

export async function deleteMod(id) {
  const { mods } = await readDataset();
  const target = mods.find((m) => Number(m.id) === Number(id));
  if (!target) throw new Error(`No existe el mod con id ${id}`);

  const remaining = mods.filter((m) => Number(m.id) !== Number(id));
  await writeDataset(remaining, `feat: eliminar mod "${target.title}"`);
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
  const chosen = webp && webp.type === 'image/webp' ? webp : blob;
  return { bytes: new Uint8Array(await chosen.arrayBuffer()), ext: chosen.type === 'image/webp' ? 'webp' : 'img' };
}

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

  return resolveImage(storagePath);
}
