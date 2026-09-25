# DBZ TTT Mods

Blog de mods de *Dragon Ball Z: Tenkaichi Tag Team* / *Budokai Tenkaichi 3*.
Clon del proyecto `Blog_Mods_TTT` original sin Supabase: los datos viven en un JSON
versionado en el repo y el sitio se despliega en **GitHub Pages**.

- **URL**: https://ghostalone17.github.io/dbz_ttt_mods_git/
- **Repo**: https://github.com/GhostAlone17/dbz_ttt_mods_git

## Stack

| Capa | Implementación |
|------|----------------|
| Frontend | React 19 + Vite 7 + react-router-dom 7 |
| Datos | `public/data/mods.json` (archivado en git, desplegado como está) |
| Imágenes | `public/images/*.webp` (optimizadas, con hash de contenido) |
| Escrituras del admin | GitHub Contents API (PAT fine-grained) |
| Despliegue | GitHub Actions → GitHub Pages |

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Home (pública) |
| `/dbz-control-master` | Login del admin (oculta en la navegación) |
| `/panel-privado-gestion` | Panel de gestión. Sin sesión devuelve 404 |
| `/admin`, `/login` | Redirigen al Home |

## Scripts

```bash
npm install      # dependencias
npm run dev      # desarrollo
npm run build    # build de producción (+ dist/404.html como fallback SPA)
npm run lint     # eslint
npm run preview  # sirve dist/ en local
npm run migrate  # migra Supabase → mods.json + public/images (solo lectura)
```

## Variables de entorno

`.env` (no se versiona):

```bash
VITE_ADMIN_PASSWORD=tu-clave-maestra   # clave maestra del panel
```

## Publicar desde el panel

1. GitHub → Settings → Developer settings → **Personal access tokens → Fine-grained tokens**.
2. Repo: `GhostAlone17/dbz_ttt_mods_git`, permiso **Contents: Read and write**.
3. Entra en `/dbz-control-master` con la master key **y** pega el token.
4. El token se guarda solo en la pestaña (`sessionStorage`): sirve para crear/editar/borrar
   mods y subir imágenes.
5. Cada escritura hace un commit en `main`, lo que dispara un build (~1-2 min) y actualiza
   la web automáticamente.

> Si publicas desde otro sitio (o el token caduca), sube/edita `public/data/mods.json`
> y las imágenes a mano: el build publicará el contenido actual.

## Activación inicial en GitHub

1. Repo → Settings → Pages → **Source: GitHub Actions**.
2. Push a `main`: el workflow `Deploy to GitHub Pages` hace lint + build + deploy.
3. El sitio queda en `https://ghostalone17.github.io/dbz_ttt_mods_git/`.

## Estructura

```
public/
  data/mods.json      # la "base de datos"
  images/             # 37 imágenes webp (77 MB → 7.8 MB tras migrar)
src/
  lib/api.js          # lectura JSON + escritura vía GitHub API
  pages/              # Home, Admin, Login, NotFound, ...
  components/admin/   # ModForm, ModTable, ImageUploader, ImageCropper
scripts/migrate.mjs   # una sola vez: Supabase → repo
```
