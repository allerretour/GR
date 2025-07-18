// couleurs.js

function populateColorSuggestions() {
  const container = document.getElementById("colorSuggestions");
  container.innerHTML = "";

  colorNames.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = " ";
    btn.title = name;
    btn.style.background = name;
    btn.style.width = "100%";
    btn.style.aspectRatio = "1";
    btn.style.border = "1px solid #ccc";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      document.getElementById("hexColorInput").value = name;
      applyHexColor(); // auto apply
    };

    container.appendChild(btn);
  });
}



// Convert rgb to hex
function rgbToHex(rgb) {
  const parts = rgb.match(/\d+/g);
  if (!parts) return "#000000";
  return "#" + parts.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

// When user selects a color
document.getElementById("appTitleColorPicker").addEventListener("input", function () {
  const selectedColor = this.value;
  const titleEl = document.getElementById("appTitle");
  if (titleEl) {
    titleEl.style.color = selectedColor;
    localStorage.setItem("appTitleColor", selectedColor);
  }
});

// Manual hex input for title color
document.getElementById("appTitleColorHex").addEventListener("change", function () {
  const hex = this.value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    const titleEl = document.getElementById("appTitle");
    titleEl.style.color = hex;
    localStorage.setItem("appTitleColor", hex);
  } else {
    alert("Hex invalide. Ex: #ff8800");
  }
  this.style.visibility = "hidden";
});

// Manual hex input for background color
document.getElementById("backgroundColorHex").addEventListener("change", function () {
  const hex = this.value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    applyGradientBackground(hex);
    localStorage.setItem("appBackgroundColor", hex);
  } else {
    alert("Hex invalide. Ex: #f0f0f0");
  }
  this.style.visibility = "hidden";
});


function openBackgroundColorPicker() {
  const savedColor = localStorage.getItem("appBackgroundColor") || "#ffffff";
  openHexColorModal("background", savedColor);
}


document.getElementById("backgroundColorPicker").addEventListener("input", (e) => {
  const hex = e.target.value;
  localStorage.setItem("appBackgroundColor", hex);
  applyGradientBackground(hex);
});



function applyGradientBackground(colorInput) {
  const rgb = parseAnyColorToRGB(colorInput);
  if (!rgb) return;

  const lighten = (v, amt) => Math.min(255, Math.round(v + amt));
  const darken = (v, amt) => Math.max(0, Math.round(v - amt));

  const lightRGB = `rgb(${lighten(rgb.r, 60)}, ${lighten(rgb.g, 60)}, ${lighten(rgb.b, 60)})`;
  const darkRGB = `rgb(${darken(rgb.r, 40)}, ${darken(rgb.g, 40)}, ${darken(rgb.b, 40)})`;

  const baseRGB = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  document.body.style.background = `linear-gradient(to bottom, ${darkRGB}, ${baseRGB}, ${lightRGB})`;
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundSize = "cover";
  document.body.style.height = "100vh";

// Apply lightRGB color to #authStatusIcon text/icon color
  const authIcon = document.getElementById("authStatusIcon");
  if (authIcon) {
    authIcon.style.color = lightRGB.replace('rgb(', 'rgba(').replace(')', ', 0.5)');

  }

}

function parseAnyColorToRGB(colorStr) {
  const temp = document.createElement("div");
  temp.style.color = colorStr;
  document.body.appendChild(temp);

  const computed = getComputedStyle(temp).color;
  document.body.removeChild(temp);

  const rgbMatch = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!rgbMatch) return null;

  return {
    r: parseInt(rgbMatch[1]),
    g: parseInt(rgbMatch[2]),
    b: parseInt(rgbMatch[3])
  };
}



function hexToRgb(hex) {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  };
}



function openAppTitleColorPicker() {
  const savedColor = localStorage.getItem("appTitleColor") || "#000000"; // fallback black
  openHexColorModal("title", savedColor);
}



function openHexColorModal(target, currentColor = "") {
  hexTarget = target;

  const modal = document.getElementById("hexColorModal");
  const input = document.getElementById("hexColorInput");
  const title = document.getElementById("hexColorModalTitle");

  input.value = currentColor;

  // ✅ Update title
  if (target === "title") {
    title.textContent = "🎨 Couleur TITRE";
  } else if (target === "background") {
    title.textContent = "🎨 Couleur FOND";
  } else {
    title.textContent = "🎨 Couleur";
  }

  populateColorSuggestions();
  modal.style.display = "flex";
  setTimeout(() => input.focus(), 50);
}


function closeHexColorModal() {
  document.getElementById("hexColorModal").style.display = "none";
  hexTarget = null;
}

function applyHexColor() {
  const input = document.getElementById("hexColorInput");
  const color = input.value.trim();

  // Validate CSS color (accepts hex or named colors)
  const testEl = document.createElement("div");
  testEl.style.color = "";
  testEl.style.color = color;

  if (testEl.style.color === "") {
    alert("Couleur invalide. Essayez un nom de couleur ou un code hex (#ff8800).");
    return;
  }

  if (hexTarget === "title") {
    document.getElementById("appTitle").style.color = color;
    localStorage.setItem("appTitleColor", color);
    showToast("Couleur du titre modifiée !", "success");
  } else if (hexTarget === "background") {
    applyGradientBackground(color); // ✅ handles both hex and named colors
    localStorage.setItem("appBackgroundColor", color);
    showToast("Couleur du fond modifiée !", "success");
  }

  closeHexColorModal();
}

