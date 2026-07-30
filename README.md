# MELP AR Prototype

A standalone, framework-free static website for testing a wall-mounted air
conditioner as an interactive GLB model and, on supported mobile devices, in
augmented reality.

This prototype does not need a backend, database, CMS, API, login or native app.

## Add your model first

Place your GLB file here:

```text
melp-ar-prototype/assets/model.glb
```

- The folder is `melp-ar-prototype/assets/`.
- The default filename must be `model.glb`.
- Do not open `index.html` directly. Run a local server as described below.
- The `assets` folder is intentionally empty until you add your own model.

The GLB is used by the normal website viewer and Android AR. For explicit
iPhone/iPad Quick Look testing, also place a USDZ file here:

```text
melp-ar-prototype/assets/model.usdz
```

The USDZ file is optional for the normal 3D viewer and Android testing. The page
continues to work without it and shows a note explaining that it is missing.
`<model-viewer>` can sometimes generate USDZ from GLB automatically, but a
tested, purpose-made USDZ is recommended for dependable client testing.

## Start the prototype

Follow this order:

1. Open the `melp-ar-prototype` project folder.
2. Open the `assets` folder.
3. Place your GLB file inside it.
4. Rename it to `model.glb`, or update the path if keeping its original name.
5. Optionally place `model.usdz` in the same folder.
6. Start a local server from the `melp-ar-prototype` folder.
7. Open the local URL.
8. Confirm the model appears and the status reads **Model loaded successfully**.

Using Python:

```bash
cd melp-ar-prototype
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Or, using Node.js:

```bash
cd melp-ar-prototype
npx serve
```

Open the local URL printed by `serve`.

After adding or replacing a model, the server does not normally need to be
restarted. Refresh the browser; use a hard refresh (`Ctrl+F5` on Windows) if the
old model remains cached.

## Confirm the model path

When the path is correct:

- the browser network request for `assets/model.glb` returns HTTP `200`;
- the page status changes from **Model is loading** to
  **Model loaded successfully**; and
- the model becomes visible and interactive.

You can also open this URL directly while the local server is running:

```text
http://localhost:8000/assets/model.glb
```

A download or binary response confirms the file is reachable. A `404 Not Found`
response means the file is missing, misnamed or in the wrong folder.

## Use a different filename

The model paths are at the top of:

```text
js/script.js
```

For a GLB named `melp-aircond.glb`, change:

```javascript
const GLB_MODEL_PATH = "./assets/model.glb";
```

to:

```javascript
const GLB_MODEL_PATH = "./assets/melp-aircond.glb";
```

If the USDZ has a different name, change `USDZ_MODEL_PATH` immediately below it
in the same way. Refresh the browser after saving.

## Controls and configuration

Important settings are intentionally easy to find:

- **GLB and USDZ filenames:** top of `js/script.js`
- **Camera angle and auto-rotation speed:** top of `js/script.js`
- **AR button label:** top of `js/script.js`
- **Wall/floor placement:** `ar-placement="wall"` in `index.html`
- **Fixed/adjustable AR scale:** `ar-scale="fixed"` in `index.html`
- **Lighting and shadows:** `exposure`, `environment-image`,
  `shadow-intensity` and `shadow-softness` in `index.html`
- **Viewer height:** `--viewer-height` near the top of `css/style.css`
- **Viewer background:** the `model-viewer` rule in `css/style.css`

The current AR configuration is:

```html
ar
ar-modes="webxr scene-viewer quick-look"
ar-placement="wall"
ar-scale="fixed"
```

Keep fixed scale only when the GLB was authored in real-world units and its
physical dimensions have been checked.

## Mobile AR testing

The normal 3D viewer can be tested at `localhost` on the computer.

A phone cannot normally open the laptop's `localhost`. A local-network address,
such as `http://192.168.x.x:8000`, may let the phone open the page when both
devices are on the same Wi-Fi network and the firewall permits it. However,
WebXR generally requires a secure HTTPS context, so AR may not work from a plain
HTTP local-network address.

For reliable testing:

1. Deploy the folder to a temporary HTTPS host.
2. Open the HTTPS URL on the phone itself.
3. Test Android and iPhone/iPad separately.
4. Allow camera permission when AR launches.
5. On Android, test Chrome with WebXR or Scene Viewer.
6. On iPhone/iPad, test Safari and confirm the USDZ launches in Quick Look.
7. Scan a well-lit, uncluttered wall and confirm placement behaves correctly.

If AR is unavailable, the normal interactive 3D viewer remains visible.

## Temporary HTTPS deployment

No MELP backend access is needed. Deploy the contents of
`melp-ar-prototype` as a static site.

### GitHub Pages

1. Push the project to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Deploy from the branch and folder containing `index.html`.
4. Wait for the HTTPS Pages URL, then open it on each phone.

### Netlify

1. Sign in to Netlify.
2. Drag the entire `melp-ar-prototype` folder into Netlify's manual deploy page,
   or connect the repository.
3. Use the generated HTTPS URL for device testing.

### Vercel

1. Import a repository containing the folder.
2. Set `melp-ar-prototype` as the root directory.
3. Use the default static configuration and deploy.
4. Open the generated HTTPS URL on each device.

Large GLB/USDZ files may exceed a host's file-size or repository limit. Optimise
the model and textures before client deployment if necessary.

## Browser and device testing checklist

- [ ] GLB is in `melp-ar-prototype/assets/`.
- [ ] GLB filename matches `GLB_MODEL_PATH`.
- [ ] GLB loads successfully.
- [ ] Textures display correctly.
- [ ] Model orientation is correct.
- [ ] Model scale is realistic and uses correct real-world units.
- [ ] Model centre/origin gives a sensible camera and wall placement.
- [ ] Mouse drag rotation works.
- [ ] Mouse-wheel zoom works.
- [ ] Touch rotation and pinch zoom work.
- [ ] Desktop layout works at common widths.
- [ ] Mobile layout works in portrait and landscape.
- [ ] Android AR launches.
- [ ] iPhone/iPad Quick Look launches.
- [ ] Wall placement works.
- [ ] Fixed scale is physically accurate.
- [ ] Loading time is acceptable on mobile data.
- [ ] Unsupported devices receive a normal 3D fallback and helpful message.
- [ ] HTTPS-hosted version works correctly.
- [ ] Camera permission prompt appears and permission can be granted.

## Troubleshooting

**The page says the GLB is missing**

Confirm the file is exactly `assets/model.glb`, including letter case on a
hosted server. If it has another name, update `GLB_MODEL_PATH`.

**The file is found but fails to display**

Validate the GLB, check that textures are embedded or correctly referenced, and
reduce very large texture dimensions. Check the browser developer console for
technical details after reading the page's user-friendly status.

**The model loads slowly**

Reduce polygon count, compress textures, consider KTX2 texture compression and
use Draco or Meshopt geometry compression compatible with your export pipeline.
Test visual quality after every optimisation.

**AR does not open**

Use a supported phone and current browser, serve the page over HTTPS, allow
camera access and test outside an in-app browser. Android and Apple use
different AR paths and must be tested independently.

**iPhone Quick Look does not open**

Add and validate `assets/model.usdz`, use Safari on a supported iPhone/iPad and
serve the page over HTTPS.

## Future MELP website integration

The MELP developer can copy the viewer markup from `index.html`, the relevant
styles from `css/style.css`, and the file/status logic from `js/script.js` into
the production page or CMS component. During integration they will need to:

1. Host the GLB and USDZ on HTTPS with correct `model/gltf-binary` and
   `model/vnd.usdz+zip` MIME types.
2. Replace the relative model paths with production asset URLs.
3. Load the pinned `<model-viewer>` script once in the website.
4. Preserve the AR attributes, custom AR button slot and accessible text.
5. Confirm the site security policy allows the model-viewer CDN and model URLs.
6. If embedded in an iframe, allow the `xr-spatial-tracking` permission policy.
7. Test performance, scale, wall placement, camera permission and analytics on
   real Android and Apple devices.
8. Integrate approved MELP branding, consent/privacy copy and production
   analytics without hiding the non-AR fallback.

## Current verification scope

The static page can be verified without model binaries: it loads normally,
checks both expected paths and shows a clear missing-model state. Full model and
AR verification is only possible after you provide a real GLB, optionally a
USDZ, and test the HTTPS version on supported physical devices.
