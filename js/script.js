"use strict";

// ---------------------------------------------------------------------------
// MODEL FILES — change these two paths if your filenames are different.
// Example: "./assets/melp-aircond.glb"
// ---------------------------------------------------------------------------
const GLB_MODEL_PATH = "./assets/model.glb";
const USDZ_MODEL_PATH = "./assets/model.usdz";

// Viewer controls. Matching HTML attributes are documented in index.html.
const DEFAULT_CAMERA_ORBIT = "25deg 72deg 105%"; // Change initial camera angle.
const AUTO_ROTATE_SPEED = "18deg"; // Change automatic rotation speed.
const AR_BUTTON_LABEL = "View in Your Space"; // Change the AR button label.

const viewer = document.querySelector("#product-viewer");
const arButton = document.querySelector("#ar-button");
const resetButton = document.querySelector("#reset-view");
const emptyState = document.querySelector("#empty-state");
const loadingOverlay = document.querySelector("#loading-overlay");
const progressBar = document.querySelector("#progress-bar");
const progressTrack = document.querySelector(".progress-track");
const progressValue = document.querySelector("#progress-value");
const interactionHint = document.querySelector("#interaction-hint");
const statusPanel = document.querySelector(".status-panel");
const statusTitle = document.querySelector("#status-title");
const statusMessage = document.querySelector("#status-message");
const iosNote = document.querySelector("#ios-note");

let glbExists = false;
let modelLoaded = false;
let slowLoadTimer;

function setStatus(state, title, message) {
  statusPanel.dataset.state = state;
  statusTitle.textContent = title;
  statusMessage.innerHTML = message;
}

function setProgress(fraction) {
  const percentage = Math.max(0, Math.min(100, Math.round(fraction * 100)));
  progressBar.style.width = `${percentage}%`;
  progressTrack.setAttribute("aria-valuenow", String(percentage));
  progressValue.textContent = `${percentage}%`;
}

async function fileExists(path) {
  try {
    const response = await fetch(path, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

function showMissingGlbMessage() {
  emptyState.hidden = false;
  loadingOverlay.hidden = true;
  interactionHint.hidden = true;
  arButton.disabled = true;
  setStatus(
    "error",
    "GLB file is missing",
    `Place <code>model.glb</code> in the <code>assets</code> folder. If the file has another name, update <code>GLB_MODEL_PATH</code> in <code>js/script.js</code>.`
  );
}

function showBrowserCompatibilityMessage() {
  emptyState.hidden = false;
  loadingOverlay.hidden = true;
  arButton.disabled = true;
  setStatus(
    "error",
    "3D viewer could not start",
    "This browser may be unsupported, or the model-viewer library could not load. Try a current Chrome, Edge, Firefox or Safari browser with an internet connection."
  );
}

async function initialiseViewer() {
  arButton.textContent = AR_BUTTON_LABEL;

  if (window.location.protocol === "file:") {
    showMissingGlbMessage();
    setStatus(
      "error",
      "Open this page through a local server",
      "Direct file access cannot reliably check or load model files. Run <code>python -m http.server 8000</code>, then open <code>http://localhost:8000</code>."
    );
    return;
  }

  try {
    await Promise.race([
      customElements.whenDefined("model-viewer"),
      new Promise((_, reject) => {
        window.setTimeout(
          () => reject(new Error("model-viewer load timed out")),
          10000
        );
      }),
    ]);
  } catch {
    showBrowserCompatibilityMessage();
    return;
  }

  // Avoid waiting indefinitely when the external component is unavailable.
  if (!customElements.get("model-viewer")) {
    showBrowserCompatibilityMessage();
    return;
  }

  const [hasGlb, hasUsdz] = await Promise.all([
    fileExists(GLB_MODEL_PATH),
    fileExists(USDZ_MODEL_PATH),
  ]);

  glbExists = hasGlb;

  if (hasUsdz) {
    viewer.setAttribute("ios-src", USDZ_MODEL_PATH);
    iosNote.innerHTML =
      '<span aria-hidden="true">✓</span> USDZ file found. iPhone/iPad Quick Look is ready for device testing.';
  } else {
    // The GLB viewer and Android AR remain available without this optional file.
    viewer.removeAttribute("ios-src");
    iosNote.innerHTML =
      '<span aria-hidden="true">ⓘ</span> USDZ file is missing. Add <code>./assets/model.usdz</code> for explicit iPhone/iPad Quick Look testing.';
  }

  if (!hasGlb) {
    showMissingGlbMessage();
    return;
  }

  emptyState.hidden = true;
  loadingOverlay.hidden = false;
  setProgress(0);
  setStatus(
    "pending",
    "Model is loading",
    `Loading <code>${GLB_MODEL_PATH}</code>. Large models or textures may take a moment.`
  );

  slowLoadTimer = window.setTimeout(() => {
    if (!modelLoaded) {
      setStatus(
        "pending",
        "The model is taking longer than expected",
        "The file is still loading. Check its file size, texture sizes and your connection if this continues."
      );
    }
  }, 15000);

  viewer.src = GLB_MODEL_PATH;
}

viewer.addEventListener("progress", (event) => {
  setProgress(event.detail.totalProgress || 0);
});

viewer.addEventListener("load", () => {
  modelLoaded = true;
  window.clearTimeout(slowLoadTimer);
  loadingOverlay.hidden = true;
  interactionHint.hidden = false;
  arButton.disabled = false;
  setProgress(1);
  setStatus(
    "success",
    "Model loaded successfully",
    "Drag to rotate, scroll or pinch to zoom, or use a supported mobile device to launch AR."
  );
});

viewer.addEventListener("error", () => {
  window.clearTimeout(slowLoadTimer);
  loadingOverlay.hidden = true;
  interactionHint.hidden = true;
  arButton.disabled = true;

  if (!glbExists) {
    showMissingGlbMessage();
    return;
  }

  setStatus(
    "error",
    "Model failed to load",
    `The file was found at <code>${GLB_MODEL_PATH}</code>, but it could not be displayed. Confirm it is a valid GLB with embedded or correctly linked textures.`
  );
});

viewer.addEventListener("ar-status", (event) => {
  const status = event.detail.status;

  if (status === "session-started") {
    setStatus(
      "success",
      "AR session started",
      "Move your phone slowly to detect a wall, then position the model."
    );
  } else if (status === "failed") {
    setStatus(
      "error",
      "AR is unavailable on this device",
      "AR requires a supported mobile device, camera permission and usually HTTPS. You can still inspect the model in the 3D viewer."
    );
  } else if (status === "not-presenting") {
    setStatus(
      modelLoaded ? "success" : "pending",
      modelLoaded ? "Model ready" : "AR session closed",
      modelLoaded
        ? "The interactive 3D viewer remains available."
        : "Return to the viewer after checking the model file."
    );
  }
});

arButton.addEventListener("click", () => {
  if (!modelLoaded) return;

  if (!window.isSecureContext && window.location.hostname !== "localhost") {
    setStatus(
      "error",
      "HTTPS is required for mobile AR",
      "The 3D viewer will still work, but AR should be tested from an HTTPS-hosted version on a supported phone."
    );
  } else {
    setStatus(
      "pending",
      "Checking AR support",
      "Allow camera permission if prompted. If nothing opens, this device or browser may not support the selected AR mode."
    );
  }
});

resetButton.addEventListener("click", () => {
  viewer.cameraOrbit = DEFAULT_CAMERA_ORBIT;
  viewer.fieldOfView = "auto";
  viewer.jumpCameraToGoal();
});

viewer.setAttribute("rotation-per-second", AUTO_ROTATE_SPEED);
initialiseViewer();
