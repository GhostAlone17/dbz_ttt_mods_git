import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);
const ROOT = process.cwd();
const SOURCE_DIR = path.resolve(ROOT, '..', 'Blog_Mods_TTT');
const SOURCE_ENV = process.env.SOURCE_ENV || path.join(SOURCE_DIR, '.env');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const DATA_FILE = path.join(DATA_DIR, 'mods.json');

const MAX_TARGET_BYTES = 3 * 1024 * 1024;
const ANIMATED_LIMIT_BYTES = 2 * 1024 * 1024;
const ROLES = [
  ['image', 'cover'],
  ['image_attack1', 'atk1'],
  ['image_attack2', 'atk2'],
  ['image_attack3', 'atk3'],
];

function readEnvFile(file) {
  return file
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((acc, line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) acc[m[1]] = m[2].replace(/^["']|["']$/g, '');
      return acc;
    }, {});
}

function slugify(value, max = 48) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '') || 'imagen';
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const ANIMATED_VARIANTS = [
  ['640-15fps-q55', ['-vf', "scale='min(640,iw)':-2:flags=lanczos,fps=15", '-c:v', 'libwebp', '-loop', '0', '-q:v', '55', '-preset', 'picture', '-an']],
  ['560-12fps-q45', ['-vf', "scale='min(560,iw)':-2:flags=lanczos,fps=12", '-c:v', 'libwebp', '-loop', '0', '-q:v', '45', '-preset', 'picture', '-an']],
];

async function encodeAnimatedWithFfmpeg(input, hash) {
  let ffmpeg;
  try {
    ffmpeg = (await import('ffmpeg-static')).default;
  } catch {
    return null;
  }
  if (!ffmpeg) return null;

  const tmpIn = path.join(os.tmpdir(), `mig-${hash}.gif`);
  await fs.writeFile(tmpIn, input);
  try {
    for (const [name, args] of ANIMATED_VARIANTS) {
      const tmpOut = path.join(os.tmpdir(), `mig-${hash}-${name}.webp`);
      await run(ffmpeg, ['-y', '-i', tmpIn, ...args, tmpOut]);
      const out = await fs.readFile(tmpOut);
      await fs.unlink(tmpOut).catch(() => {});
      if (out.length <= ANIMATED_LIMIT_BYTES || name === ANIMATED_VARIANTS.at(-1)[0]) {
        console.log(`    ffmpeg (${name})`);
        return out;
      }
    }
  } catch (err) {
    console.warn(`    ffmpeg falló (${err.message.split('\n')[0]}); se usa sharp`);
  } finally {
    await fs.unlink(tmpIn).catch(() => {});
  }
  return null;
}

async function optimize(url, slug, role) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  const input = Buffer.from(await res.arrayBuffer());
  const hash = crypto.createHash('sha1').update(input).digest('hex').slice(0, 8);

  const looksGif =
    input.subarray(0, 6).toString('ascii').startsWith('GIF') ||
    url.split('?')[0].toLowerCase().endsWith('.gif');

  const meta = await sharp(input, { animated: true }).metadata();
  const animated = Boolean(meta.pages && meta.pages > 1);

  let output = null;
  let encoder = 'sharp';
  if (animated || looksGif) {
    output = await encodeAnimatedWithFfmpeg(input, hash);
    if (output) encoder = 'ffmpeg';
  }
  if (!output) {
    output = await sharp(input, { animated: true })
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: animated || looksGif ? 72 : 80, effort: 5 })
      .toBuffer();
  }

  const filename = `${slug}-${role}.${hash}.webp`;
  await fs.writeFile(path.join(IMAGES_DIR, filename), output);

  return {
    filename,
    inputBytes: input.length,
    outputBytes: output.length,
    animated: animated || looksGif,
    encoder,
    oversized: output.length > MAX_TARGET_BYTES,
  };
}

async function main() {
  let env;
  try {
    env = readEnvFile(await fs.readFile(SOURCE_ENV, 'utf8'));
  } catch {
    console.error(`No se pudo leer el .env del proyecto fuente: ${SOURCE_ENV}`);
    process.exit(1);
  }

  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('El .env del fuente no contiene VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log(`Leyendo ${url} (solo lectura) ...`);
  const res = await fetch(`${url}/rest/v1/mods?select=*&order=id.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.error(`Supabase respondió ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const mods = await res.json();
  if (!Array.isArray(mods)) {
    console.error('Respuesta inesperada de Supabase:', mods);
    process.exit(1);
  }

  await fs.mkdir(IMAGES_DIR, { recursive: true });
  await fs.mkdir(DATA_DIR, { recursive: true });

  const report = [];
  let totalIn = 0;
  let totalOut = 0;

  for (const mod of mods) {
    const slug = slugify(mod.title || `mod-${mod.id}`);
    for (const [field, role] of ROLES) {
      const value = mod[field];
      if (!value || !/^https?:\/\//i.test(value)) continue;
      try {
        const result = await optimize(value, slug, role);
        mod[field] = `images/${result.filename}`;
        totalIn += result.inputBytes;
        totalOut += result.outputBytes;
        report.push({
          archivo: result.filename,
          entrada: result.inputBytes,
          salida: result.outputBytes,
          animada: result.animated,
          encoder: result.encoder,
          oversized: result.oversized,
        });
        console.log(
          `  ${result.filename.padEnd(58)} ${kb(result.inputBytes).padStart(10)} -> ${kb(result.outputBytes).padStart(10)}`
        );
      } catch (err) {
        console.warn(`  WARN ${field} de "${mod.title}": ${err.message} (se conserva la URL original)`);
      }
    }
  }

  mods.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  await fs.writeFile(DATA_FILE, JSON.stringify(mods, null, 2) + '\n', 'utf8');

  console.log('\n===== INFORME DE MIGRACIÓN =====');
  console.log(`Mods exportados        : ${mods.length}`);
  console.log(`Imágenes migradas      : ${report.length}`);
  console.log(`Peso original total    : ${kb(totalIn)}`);
  console.log(`Peso optimizado total  : ${kb(totalOut)}`);
  console.log(`Reducción              : ${totalIn ? ((1 - totalOut / totalIn) * 100).toFixed(1) : 0} %`);
  console.log(`data/mods.json         : ${kb((await fs.stat(DATA_FILE)).size)}`);

  const animated = report.filter((r) => r.animada);
  if (animated.length) {
    console.log('\nImágenes animadas:');
    for (const r of animated) {
      const flag = r.oversized ? '  <-- >3 MB, candidata a <video>' : '';
      console.log(`  ${r.archivo.padEnd(58)} ${kb(r.entrada).padStart(10)} -> ${kb(r.salida).padStart(10)}${flag}`);
    }
  }
}

main().catch((err) => {
  console.error('Fallo en la migración:', err);
  process.exit(1);
});
