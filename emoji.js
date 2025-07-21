function promptEmojiChange(index) {
  const currentEmoji = shortcuts[index].emoji || "";
  const recent = JSON.parse(localStorage.getItem("recentEmojis") || "[]");

  const overlay = createOverlay();
  const picker = createPickerContainer();

  const title = createTitle("🧩 Choisissez un emoji");
  picker.appendChild(title);

  if (recent.length > 0) {
    createRecentSection(picker, recent, currentEmoji, index, overlay);
  } else if (currentEmoji) {
    createCurrentEmojiSection(picker, currentEmoji);
  }

  createEmojiGrid(picker, index, overlay);
  createFooterButtons(picker, index, overlay);

  enableCloseOnOutsideClick(picker, overlay);
  enableCloseOnEscape(picker, overlay);

  document.body.appendChild(overlay);
  document.body.appendChild(picker);

  setTimeout(() => {
    picker.style.opacity = "1";
  }, 0);
}

// Utilitaires
function createOverlay() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0, 0, 0, 0.4)";
  overlay.style.zIndex = 9998;
  return overlay;
}

function createPickerContainer() {
  const picker = document.createElement("div");
  picker.setAttribute("role", "dialog");
  picker.style.position = "fixed";
  picker.style.top = "50%";
  picker.style.left = "50%";
  picker.style.transform = "translate(-50%, -50%)";
  picker.style.background = "white";
  picker.style.padding = "16px";
  picker.style.border = "1px solid #ccc";
  picker.style.borderRadius = "14px";
  picker.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
  picker.style.zIndex = 9999;
  picker.style.display = "flex";
  picker.style.flexDirection = "column";
  picker.style.alignItems = "center";
  picker.style.minWidth = "260px";
  picker.style.opacity = "0";
  picker.style.transition = "opacity 0.2s ease";
  return picker;
}

function createTitle(text) {
  const title = document.createElement("div");
  title.textContent = text;
  title.style.fontSize = "1.1rem";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "12px";
  return title;
}

function createRecentSection(picker, recent, currentEmoji, index, overlay) {
  const sectionTop = document.createElement("div");
  sectionTop.style.display = "flex";
  sectionTop.style.justifyContent = "space-between";
  sectionTop.style.alignItems = "center";
  sectionTop.style.width = "100%";
  sectionTop.style.marginBottom = "6px";

  const label = document.createElement("div");
  label.textContent = "🕘 Récents";
  label.style.fontWeight = "bold";
  label.style.fontSize = "0.9rem";

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "🧹 Effacer";
  clearBtn.title = "Effacer les emojis récents";
  clearBtn.style.fontSize = "0.8rem";
  clearBtn.style.border = "none";
  clearBtn.style.background = "transparent";
  clearBtn.style.color = "#555";
  clearBtn.style.cursor = "pointer";
  clearBtn.onclick = () => {
    localStorage.removeItem("recentEmojis");
    picker.remove();
    overlay.remove();
    promptEmojiChange(index);
  };

  sectionTop.appendChild(label);
  sectionTop.appendChild(clearBtn);
  picker.appendChild(sectionTop);

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.flexWrap = "wrap";
  row.style.justifyContent = "center";
  row.style.gap = "8px";
  row.style.marginBottom = "8px";

  recent.forEach(emoji => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";

    const btn = document.createElement("button");
    btn.textContent = emoji;
    btn.style.fontSize = "1.6rem";
    btn.style.padding = "6px 10px";
    btn.style.border = emoji === currentEmoji ? "2px solid #007bff" : "none";
    btn.style.borderRadius = "6px";
    btn.style.background = "transparent";
    btn.style.cursor = "pointer";
    btn.title = emoji === currentEmoji ? "Emoji actuel" : "";

    btn.onclick = () => {
      shortcuts[index].emoji = emoji;
      saveRecentEmoji(emoji);
      saveShortcuts();
      displayShortcuts();
      picker.remove();
      overlay.remove();
    };

    wrapper.appendChild(btn);

    if (emoji === currentEmoji) {
      const label = document.createElement("div");
      label.textContent = "(actuel)";
      label.style.fontSize = "0.75rem";
      label.style.color = "#007bff";
      label.style.marginTop = "2px";
      wrapper.appendChild(label);
    }

    row.appendChild(wrapper);
  });

  picker.appendChild(row);
  appendSeparator(picker);
}

function createCurrentEmojiSection(picker, currentEmoji) {
  const section = document.createElement("div");
  section.style.textAlign = "center";
  section.style.marginBottom = "12px";

  const label = document.createElement("div");
  label.textContent = "🟢 Emoji actuel";
  label.style.fontWeight = "bold";
  label.style.fontSize = "0.9rem";
  label.style.marginBottom = "4px";

  const display = document.createElement("div");
  display.textContent = currentEmoji;
  display.style.fontSize = "2rem";
  display.style.border = "2px solid #007bff";
  display.style.borderRadius = "6px";
  display.style.padding = "4px 10px";
  display.style.display = "inline-block";

  const note = document.createElement("div");
  note.textContent = "(actuel)";
  note.style.fontSize = "0.75rem";
  note.style.color = "#007bff";
  note.style.marginTop = "2px";

  section.appendChild(label);
  section.appendChild(display);
  section.appendChild(note);

  picker.appendChild(section);
  appendSeparator(picker);
}

function createEmojiGrid(picker, index, overlay) {
  const grid = document.createElement("div");
  grid.style.maxHeight = "200px";
  grid.style.overflowY = "auto";
  grid.style.display = "flex";
  grid.style.flexWrap = "wrap";
  grid.style.justifyContent = "center";
  grid.style.gap = "6px";
  grid.style.marginBottom = "12px";

  EMOJI_CHOICES.forEach(emoji => {
    const btn = document.createElement("button");
    btn.textContent = emoji;
    btn.style.fontSize = "1.6rem";
    btn.style.padding = "6px 10px";
    btn.style.border = "none";
    btn.style.background = "transparent";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      shortcuts[index].emoji = emoji;
      saveRecentEmoji(emoji);
      saveShortcuts();
      displayShortcuts();
      picker.remove();
      overlay.remove();
    };

    grid.appendChild(btn);
  });

  picker.appendChild(grid);
}

function createFooterButtons(picker, index, overlay) {
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.justifyContent = "center";
  row.style.gap = "10px";
  row.style.marginTop = "6px";

  const customBtn = document.createElement("button");
  customBtn.textContent = "🔧 Personnalisé…";
  customBtn.style.color = "black";
  customBtn.style.padding = "6px 12px";
  customBtn.style.fontSize = "0.75rem";
  customBtn.style.borderRadius = "8px";
  customBtn.style.border = "1px solid #ccc";
  customBtn.style.cursor = "pointer";
  customBtn.style.background = "#f9f9f9";

  customBtn.onclick = () => {
    const inputDiv = document.createElement("div");
    inputDiv.style.display = "flex";
    inputDiv.style.flexDirection = "column";
    inputDiv.style.alignItems = "center";
    inputDiv.style.gap = "8px";
    inputDiv.style.marginTop = "16px";

    const input = document.createElement("input");
    input.placeholder = "Entrez un emoji…";
    input.style.fontSize = "1rem";
    input.style.textAlign = "center";
    input.style.width = "150px";
    input.maxLength = 2;

    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.style.padding = "4px 10px";
    okBtn.style.borderRadius = "6px";
    okBtn.style.border = "1px solid #ccc";
    okBtn.style.cursor = "pointer";

    okBtn.onclick = () => {
      const emoji = input.value.trim();
      if (emoji) {
        shortcuts[index].emoji = emoji;
        saveRecentEmoji(emoji);
        saveShortcuts();
        displayShortcuts();
      }
      picker.remove();
      overlay.remove();
    };

    inputDiv.appendChild(input);
    inputDiv.appendChild(okBtn);
    picker.appendChild(inputDiv);
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "❌ Annuler";
  cancelBtn.style.color = "black";
  cancelBtn.style.padding = "6px 12px";
  cancelBtn.style.fontSize = "0.95rem";
  cancelBtn.style.borderRadius = "8px";
  cancelBtn.style.border = "1px solid #ccc";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.style.background = "#f9f9f9";
  cancelBtn.onclick = () => {
    picker.remove();
    overlay.remove();
  };

  row.appendChild(customBtn);
  row.appendChild(cancelBtn);
  picker.appendChild(row);
}

function appendSeparator(picker) {
  const sep = document.createElement("div");
  sep.style.width = "100%";
  sep.style.height = "1px";
  sep.style.backgroundColor = "#ddd";
  sep.style.margin = "12px 0";
  picker.appendChild(sep);
}

function enableCloseOnOutsideClick(picker, overlay) {
  setTimeout(() => {
    document.addEventListener("click", function handleClickOutside(e) {
      if (!picker.contains(e.target)) {
        picker.remove();
        overlay.remove();
        document.removeEventListener("click", handleClickOutside);
      }
    });
  }, 0);
}

function enableCloseOnEscape(picker, overlay) {
  document.addEventListener("keydown", function handleKey(e) {
    if (e.key === "Escape") {
      picker.remove();
      overlay.remove();
      document.removeEventListener("keydown", handleKey);
    }
  });
}

// Déjà présente dans ton code
function saveRecentEmoji(emoji) {
  let recent = JSON.parse(localStorage.getItem("recentEmojis") || "[]");
  recent = [emoji, ...recent.filter(e => e !== emoji)].slice(0, 5);
  localStorage.setItem("recentEmojis", JSON.stringify(recent));
}
