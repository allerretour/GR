let quill;
let activeTagFilter = [];
let shortcuts = [];
let alphabeticalSorting = false;
let manualOrder = [];
let editMode = false;
let compactMode = false;
let hexTarget = null;


const storedFavoriteMode = localStorage.getItem("showOnlyFavorites");
let showOnlyFavorites = storedFavoriteMode === "false"; // ✅ restore as boolean

const icons = Quill.import('ui/icons');
icons['hr'] = '<span style="display:inline-block;width:100%;border-top:1px solid #888;margin-top:2px;"></span>';


function updateAuthStatusIcon() {
  const icon = document.querySelector("#authStatusIcon i");
  const container = document.getElementById("authStatusIcon");
  if (!icon || !container) return;

  if (!GLOBAL_PASSWORD) {
    icon.className = "fas fa-expand";
    container.title = "🔓 Accès libre (non sécurisé)";
  } else if (sessionStorage.getItem("authenticated") === "true") {
    icon.className = "fas fa-lock-open";
    container.title = "🔓 Authentifié (sécurisé)";
  } else {
    icon.className = "fas fa-lock";
    container.title = "🔒 Protégé par mot de passe (non authentifié)";
  }
}

document.getElementById("authStatusIcon").addEventListener("click", () => {
  if (!GLOBAL_PASSWORD) return; // No password, nothing to do

  const isAuthenticated = sessionStorage.getItem("authenticated") === "true";

  if (isAuthenticated) {
    // 🔒 Authenticated → clicking will lock
    if (confirm("🔒 Voulez-vous verrouiller l'accès ?")) {
      sessionStorage.removeItem("authenticated");
      showToast("Accès verrouillé.🔒", "info");
      updateAuthStatusIcon();
    }
  } else {
    // 🔓 Not authenticated → ask for password
    const input = prompt("🔐 Entrez le mot de passe pour déverrouiller :");
    if (input === GLOBAL_PASSWORD) {
      sessionStorage.setItem("authenticated", "true");
      showToast("Accès déverrouillé.🔓", "success");
      updateAuthStatusIcon();
    } else if (input !== null) {
      showToast("Mot de passe incorrect.", "error");
    }
  }
});



function ensureAuthenticated() {
  if (!GLOBAL_PASSWORD) {
    updateAuthStatusIcon();
    return true;
  }

  const ok = sessionStorage.getItem("authenticated") === "true";
  if (ok) {
    updateAuthStatusIcon();
    return true;
  }

  const input = prompt("🔒 Entrez le mot de passe pour accéder à cette fonction :");
  if (input === GLOBAL_PASSWORD) {
    sessionStorage.setItem("authenticated", "true");
    updateAuthStatusIcon();
    return true;
  } else {
    showToast("Mot de passe incorrect.", "error");
    updateAuthStatusIcon();
    return false;
  }
}


function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}


function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    } [m]));
}

const appTitle = document.getElementById("appTitle");
const titleLockBtn = document.getElementById("titleLockBtn");
const lockIcon = titleLockBtn.querySelector("i");

let titleLocked = true;

function toggleTitleLock() {
    titleLocked = !titleLocked;
    appTitle.contentEditable = !titleLocked;

    if (titleLocked) {
        lockIcon.classList.replace("fa-lock-open", "fa-lock");
    } else {
        lockIcon.classList.replace("fa-lock", "fa-lock-open");
        appTitle.focus();
        placeCaretAtEnd(appTitle);
    }
}

titleLockBtn.addEventListener("click", toggleTitleLock);

function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}


window.addEventListener("DOMContentLoaded", () => {
  GLOBAL_PASSWORD = localStorage.getItem("globalPassword") || "";
  updateAuthStatusIcon();

  const saved = localStorage.getItem("appTitleColor");
  if (saved) document.getElementById("appTitle").style.color = saved;
});


function promptEmojiChange(index) {
  function saveRecentEmoji(emoji) {
    let recent = JSON.parse(localStorage.getItem("recentEmojis") || "[]");
    recent = [emoji, ...recent.filter(e => e !== emoji)].slice(0, 5);
    localStorage.setItem("recentEmojis", JSON.stringify(recent));
  }

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0, 0, 0, 0.4)";
  overlay.style.zIndex = 9998;
  document.body.appendChild(overlay);

  const picker = document.createElement("div");
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

  const title = document.createElement("div");
  title.textContent = "🧩 Choisissez un emoji";
  title.style.fontSize = "1.1rem";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "12px";
  picker.appendChild(title);

  const recent = JSON.parse(localStorage.getItem("recentEmojis") || "[]");
  const currentEmoji = shortcuts[index].emoji || "";

  // 🕘 Section récents (si disponible)
  if (recent.length) {
    const sectionTop = document.createElement("div");
    sectionTop.style.width = "100%";
    sectionTop.style.display = "flex";
    sectionTop.style.justifyContent = "space-between";
    sectionTop.style.alignItems = "center";
    sectionTop.style.marginBottom = "6px";

    const recentLabel = document.createElement("div");
    recentLabel.textContent = "🕘 Récents";
    recentLabel.style.fontWeight = "bold";
    recentLabel.style.fontSize = "0.9rem";
    sectionTop.appendChild(recentLabel);

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
      promptEmojiChange(index); // Recharge
    };
    sectionTop.appendChild(clearBtn);
    picker.appendChild(sectionTop);

    const recentRow = document.createElement("div");
    recentRow.style.display = "flex";
    recentRow.style.justifyContent = "center";
    recentRow.style.flexWrap = "wrap";
    recentRow.style.gap = "8px";
    recentRow.style.marginBottom = "8px";

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
        document.body.removeChild(picker);
        document.body.removeChild(overlay);
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

      recentRow.appendChild(wrapper);
    });

    picker.appendChild(recentRow);

    const separator = document.createElement("div");
    separator.style.width = "100%";
    separator.style.height = "1px";
    separator.style.backgroundColor = "#ddd";
    separator.style.margin = "12px 0";
    picker.appendChild(separator);
  }

  // Si aucun récent mais emoji actuel : afficher quand même
  else if (currentEmoji) {
    const currentSection = document.createElement("div");
    currentSection.style.textAlign = "center";
    currentSection.style.marginBottom = "12px";

    const label = document.createElement("div");
    label.textContent = "🟢 Emoji actuel";
    label.style.fontWeight = "bold";
    label.style.fontSize = "0.9rem";
    label.style.marginBottom = "4px";
    currentSection.appendChild(label);

    const emojiDisplay = document.createElement("div");
    emojiDisplay.textContent = currentEmoji;
    emojiDisplay.style.fontSize = "2rem";
    emojiDisplay.style.border = "2px solid #007bff";
    emojiDisplay.style.borderRadius = "6px";
    emojiDisplay.style.display = "inline-block";
    emojiDisplay.style.padding = "4px 10px";
    currentSection.appendChild(emojiDisplay);

    const labelText = document.createElement("div");
    labelText.textContent = "(actuel)";
    labelText.style.fontSize = "0.75rem";
    labelText.style.color = "#007bff";
    labelText.style.marginTop = "2px";
    currentSection.appendChild(labelText);

    picker.appendChild(currentSection);

    const separator = document.createElement("div");
    separator.style.width = "100%";
    separator.style.height = "1px";
    separator.style.backgroundColor = "#ddd";
    separator.style.margin = "12px 0";
    picker.appendChild(separator);
  }

  // Liste principale
  const emojiGrid = document.createElement("div");
  emojiGrid.style.maxHeight = "200px";
  emojiGrid.style.overflowY = "auto";
  emojiGrid.style.display = "flex";
  emojiGrid.style.flexWrap = "wrap";
  emojiGrid.style.justifyContent = "center";
  emojiGrid.style.gap = "6px";
  emojiGrid.style.marginBottom = "12px";

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
      document.body.removeChild(picker);
      document.body.removeChild(overlay);
    };
    emojiGrid.appendChild(btn);
  });

  picker.appendChild(emojiGrid);

  // Boutons bas
  const buttonRow = document.createElement("div");
  buttonRow.style.display = "flex";
  buttonRow.style.justifyContent = "center";
  buttonRow.style.gap = "10px";
  buttonRow.style.marginTop = "6px";
  buttonRow.style.width = "100%";

  const customBtn = document.createElement("button");
  customBtn.textContent = "🔧 Personnalisé…";
  customBtn.style.padding = "6px 12px";
  customBtn.style.fontSize = "0.75rem";
  customBtn.style.borderRadius = "8px";
  customBtn.style.border = "1px solid #ccc";
  customBtn.style.cursor = "pointer";
  customBtn.style.color = "black";
  customBtn.style.background = "#f9f9f9";
  customBtn.onclick = () => {
  const inputDiv = document.createElement("div");
  const input = document.createElement("input");
  input.placeholder = "Entrez un emoji…";
  input.style.fontSize = "1.5rem";
  input.style.textAlign = "center";
  input.style.marginTop = "20px";
  input.maxLength = 2;

  const okBtn = document.createElement("button");
  okBtn.textContent = "OK";
  okBtn.onclick = () => {
    const customEmoji = input.value.trim();
    if (customEmoji) {
      shortcuts[index].emoji = customEmoji;
      saveRecentEmoji(customEmoji);
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
  cancelBtn.style.padding = "6px 12px";
  cancelBtn.style.fontSize = "0.95rem";
  cancelBtn.style.borderRadius = "8px";
  cancelBtn.style.border = "1px solid #ccc";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.style.color = "black";
  cancelBtn.style.background = "#f9f9f9";
  cancelBtn.onclick = () => {
    document.body.removeChild(picker);
    document.body.removeChild(overlay);
  };

  buttonRow.appendChild(customBtn);
  buttonRow.appendChild(cancelBtn);
  picker.appendChild(buttonRow);

  setTimeout(() => {
    document.addEventListener("click", function handleOutsideClick(e) {
      if (!picker.contains(e.target)) {
        picker.remove();
        overlay.remove();
        document.removeEventListener("click", handleOutsideClick);
      }
    });
  }, 0);

  document.body.appendChild(picker);
}


function saveRecentEmoji(emoji) {
  let recent = JSON.parse(localStorage.getItem("recentEmojis") || "[]");
  // Supprimer doublons + remettre en haut
  recent = [emoji, ...recent.filter(e => e !== emoji)];
  // Limiter à 5
  recent = recent.slice(0, 5);
  localStorage.setItem("recentEmojis", JSON.stringify(recent));
}


async function pasteFromClipboard(targetId) {
  const input = document.getElementById(targetId);
  try {
    const text = await navigator.clipboard.readText();
    if (input) {
      input.value = text;
      input.focus();
    }
  } catch (err) {
    alert("⚠️ Autorisation refusée. Utilisez Ctrl+V pour coller manuellement.");
    console.warn("Clipboard paste failed:", err);
  }
}


function openVisibleShortcutsInTabs() {
  const visibleCards = Array.from(document.querySelectorAll("#shortcuts .shortcut"))
    .filter(card => card.offsetParent !== null);

  const urls = visibleCards.map(card => {
    const index = parseInt(card.getAttribute("data-index"));
    const shortcut = shortcuts[index];
    if (!shortcut || !shortcut.url || shortcut.url.trim() === "?") return null;

    let url = shortcut.url.trim();
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
      url = "https://" + url;
    }

    try {
      return new URL(url).href;
    } catch {
      return null;
    }
  }).filter(Boolean);

  if (urls.length === 0) {
    showToast("Aucun lien valide à ouvrir.");
    return;
  }

  if (!confirm(`⚠️ Ouvrir ${urls.length} lien(s) dans de nouveaux onglets ?`)) return;

  const MAX_TABS = 10;
  const slice = urls.slice(0, MAX_TABS);

  if (urls.length > MAX_TABS) {
    alert(`Seuls les ${MAX_TABS} premiers liens seront ouverts pour éviter les blocages navigateur.`);
  }

  slice.forEach(url => window.open(url, "_blank"));
}



function hideOptionsAndScrollTop() {
    const group = document.getElementById("buttonGroupWrapper");
    const toggleBtn = document.getElementById("toggleBtnGroup");

    if (group) {
        group.classList.add("hidden");

        // ✅ Reset icon
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-cog"></i>';
        }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}


const UI_STATE_KEY = "uiToggleState";

let uiToggleState = {
    searchBar: true,
    tagFilters: true,
    
};

function saveUIState() {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiToggleState));
}

function loadUIState() {
    const saved = localStorage.getItem(UI_STATE_KEY);
    if (saved) {
        uiToggleState = {
            ...uiToggleState,
            ...JSON.parse(saved)
        };
    }
}

function ensureDefaultShortcut() {
  const isFreshInstall = !Array.isArray(shortcuts) || shortcuts.length === 0;

  if (isFreshInstall) {
    // Insert defaults
    shortcuts.push(...DEFAULT_SHORTCUTS);
    saveShortcuts();

    manualOrder = [...shortcuts];
    localStorage.setItem("manualOrder", JSON.stringify(manualOrder));

    uiToggleState = { ...DEFAULT_UI_TOGGLE_STATE };
    saveUIState();

    compactMode = false;
    localStorage.setItem("compactMode", "false");

    activeTagFilter = [];
    saveActiveTagFilter();

    localStorage.setItem("appTitleColor", DEFAULT_TITLE_COLOR);
    localStorage.setItem("appBackgroundColor", DEFAULT_BG_COLOR);

    const titleEl = document.getElementById("appTitle");
    if (titleEl) {
      titleEl.style.color = DEFAULT_TITLE_COLOR;
    }

    applyGradientBackground(DEFAULT_BG_COLOR);
  }
}

function resetLogos() {
  localStorage.removeItem("leftLogo");
  localStorage.removeItem("rightLogo");

  const leftImg = document.getElementById("leftLogo");
  const rightImg = document.getElementById("rightLogo");

  if (leftImg) leftImg.style.display = "none";
  if (rightImg) rightImg.style.display = "none";

  setExportNeeded(true); // Mark state as changed
  showToast("Logos supprimés🧹", "success");
}



function saveTitle() {
    const newTitle = document.getElementById("appTitle").textContent.trim();
    if (newTitle) {
        localStorage.setItem("appTitle", newTitle); // Save to localStorage
        setExportNeeded(true);
        showToast("Titre modifié !", "success");
    }
}
let isExportNeeded = false;

function setExportNeeded(flag) {
    isExportNeeded = flag;
    updateExportStatusDot();
}

function updateExportStatusDot() {
    const dot = document.getElementById('exportStatusDot');
    dot.textContent = isExportNeeded ? 'modifié' : 'non-modifié';
    dot.className = 'status-dot ' + (isExportNeeded ? 'modifie' : 'non-modifie');
}

function updateLastExportDisplay() {
    const lastExport = localStorage.getItem("lastExportFilename");
    const label = document.getElementById("lastExport");
    label.textContent = lastExport ? `Dernier export : ${lastExport}` : "Dernier export : aucun";
}

function toggleSearchBar() {
    const searchContainer = document.getElementById("searchContainer");
    const icon = document.getElementById("searchToggleIcon");
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const isHidden = searchContainer.style.display === "none" || searchContainer.style.display === "";
    if (isHidden) {
        searchContainer.style.display = "flex";

        searchInput.focus(); // <-- focus here
    } else {
        searchInput.value = "";
        clearBtn.style.display = "none";
        handleSearchInput();
        searchContainer.style.display = "none";

    }
    const el = document.getElementById("searchContainer");
    uiToggleState.searchBar = !uiToggleState.searchBar;
    el.style.display = uiToggleState.searchBar ? "flex" : "none";
    saveUIState();
}



function toggleButtonGroup() {
    
if (!ensureAuthenticated()) return;

    const group = document.getElementById("buttonGroupWrapper");
    const toggleBtn = document.getElementById("toggleBtnGroup");

    group.classList.toggle("hidden");
    group.classList.toggle("visible");

    

    if (group.classList.contains("hidden")) {
        toggleBtn.innerHTML = '<i class="fas fa-cog"></i>';
    } else {
        toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';

        // Scroll the button group into view smoothly
        setTimeout(() => {
            group.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 100);
    }


}


function loadShortcuts() {
    const savedData = localStorage.getItem("shortcuts");
    const savedOrder = localStorage.getItem("manualOrder");
    const savedTagOrder = localStorage.getItem("tagOrder");
    tagOrder = savedTagOrder ? JSON.parse(savedTagOrder) : [];
    shortcuts = savedData ? JSON.parse(savedData) : [];
    manualOrder = savedOrder ? JSON.parse(savedOrder) : [...shortcuts];

    // ✅ MIGRATION: Add tooltipPlain if missing
    let updated = false;
    shortcuts.forEach(sc => {
  if (!sc.tooltipPlain && sc.tooltip) {
    const temp = document.createElement("div");
    temp.innerHTML = sc.tooltip;
    sc.tooltipPlain = temp.textContent.trim();
    updated = true;
  }
  if (sc.favorite === undefined) {
    sc.favorite = false;
    updated = true;
  }
  // ✅ Add emoji if missing
  if (!sc.emoji) {
    sc.emoji = DEFAULT_EMOJI;
    updated = true;
  }
});

    if (updated) {
        saveShortcuts(); // Resave only if we made changes
    }
    ensureDefaultShortcut();  // ✅ inject default if needed
    displayShortcuts();
}


function toggleAddSection() {
    const section = document.getElementById("addSection");
    const isHidden = section.style.display === "none";
    section.style.display = isHidden ? "block" : "none";
    if (isHidden) {
        setTimeout(() => {
            document.getElementById("name").focus();
        }, 100); // slight delay ensures visibility before focus
    }
}

function toggleSorting() {
    const sortBtn = document.getElementById("sortButton");
    const sortIcon = document.getElementById("sortIcon");
    if (!alphabeticalSorting) {
        manualOrder = [...shortcuts];
        localStorage.setItem("manualOrder", JSON.stringify(manualOrder));
        setExportNeeded(true);
    } else {
        const savedOrder = localStorage.getItem("manualOrder");
        if (savedOrder) {
            shortcuts = JSON.parse(savedOrder);
        }
    }
    alphabeticalSorting = !alphabeticalSorting;
    if (alphabeticalSorting) {
        // Sorting is ON – blue theme
        sortBtn.style.backgroundColor = "#007bff";
        sortBtn.style.color = "white";
        sortIcon.style.color = "white";
    } else {
        // Sorting is OFF – gray theme
        sortBtn.style.backgroundColor = "lightgray";
        sortBtn.style.color = "gray";
        sortIcon.style.color = "gray";
    }
    document.getElementById("sortStatus").textContent = alphabeticalSorting ? "Tri: Alphabétique" : "Tri: Manuel";
    displayShortcuts();
}

function toggleEditMode() {

       

    editMode = document.getElementById("editToggle").checked;
    document.getElementById("editStatus").textContent = `Mode édition: ${editMode ? 'Oui' : 'Non'}`;
    displayShortcuts();
}

function showToast(message, type = "default", duration = 3000) {
  const container = document.getElementById("toastContainer");

  if (!container) {
    alert(message);
    return;
  }

  // Icon map per type
  const icons = {
    success: "✔️",
    error: "❗",
    info: "ℹ️",
    default: "🔔"
  };

  const bgColors = {
    success: "#28a745",
    error: "#dc3545",
    info: "#17a2b8",
    default: "rgba(0, 0, 0, 0.8)"
  };

  const icon = icons[type] || icons.default;
  const bgColor = bgColors[type] || bgColors.default;

  const toast = document.createElement("div");
  toast.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;
  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 10px 16px;
    margin-top: 8px;
    border-radius: 6px;
    font-size: 20px;
    max-width: 80vw;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: fadeInOut ${duration + 1000}ms forwards;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  container.appendChild(toast);

  // Force reflow to trigger transition
  requestAnimationFrame(() => {
    toast.style.opacity = 1;
  });

  setTimeout(() => {
    toast.style.opacity = 0;
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}

function getTooltipText(text) {
    return text && text.trim() !== "" ? text.trim() : "Aucune info disponible.";
}

function displayShortcuts() {
    
    // ✅ Auto-switch off Favoris mode if needed
    if (showOnlyFavorites && !shortcuts.some(s => s.favorite)) {
    showOnlyFavorites = false;
    localStorage.setItem("showOnlyFavorites", false);
    showToast("Aucun favori — retour à Tous");
    }

    const container = document.getElementById("shortcuts");
    container.innerHTML = "";
    const searchTerm = document.getElementById("searchInput")?.value?.toLowerCase() || "";
    let list = [...shortcuts];
    
    if (showOnlyFavorites) {
      list = list.filter(sc => sc.favorite);
    }


    if (alphabeticalSorting) {
        list.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (activeTagFilter.length > 0) {
        const useAndMode = document.getElementById("tagFilterModeToggle").checked;
        list = list.filter(shortcut => {
            const shortcutTags = shortcut.tags || [];
            return useAndMode ?
                activeTagFilter.every(tag => shortcutTags.includes(tag)) :
                activeTagFilter.some(tag => shortcutTags.includes(tag));
        });
    }

    if (searchTerm) {
        list = list.filter(shortcut => {
            return shortcut.name.toLowerCase().includes(searchTerm) ||
                shortcut.url.toLowerCase().includes(searchTerm) ||
                (shortcut.tooltip && shortcut.tooltip.toLowerCase().includes(searchTerm)) ||
                (shortcut.tooltipPlain && shortcut.tooltipPlain.toLowerCase().includes(searchTerm)) ||
                (shortcut.info && shortcut.info.toLowerCase().includes(searchTerm));
        });
    }

    const isAndMode = document.getElementById("tagFilterModeToggle").checked;
    document.getElementById("filterModeLabel").textContent = isAndMode ? "ET" : "OU";

if (list.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.textContent = "😢 Aucun raccourci à afficher.";

    Object.assign(emptyMessage.style, {
        gridColumn: "1 / -1",          // spans full row
        justifySelf: "center",         // center in grid
        textAlign: "center",
        padding: "20px",
        color: "#666",
        fontSize: "1.5rem"
    });

    container.appendChild(emptyMessage);

    document.getElementById("shortcutCount").textContent = `Affichés: 0 / Total: ${shortcuts.length}`;
    saveActiveTagFilter();
    displayTagFilters();
    return;
}



    document.querySelectorAll(".tag-filter").forEach(el => {
        el.classList.remove("and-mode", "or-mode");
        el.classList.add(isAndMode ? "and-mode" : "or-mode");
    });

    list.forEach((shortcut) => {
        const trueIndex = shortcuts.indexOf(shortcut);
        const tagsHTML = (shortcut.tags || []).sort((a, b) => a.localeCompare(b))
            .map(tag => `<span class="tag" style="background-color:${getTagColor(tag)}">${escapeHTML(tag)}</span>`).join(" ");

        const shortcutElement = document.createElement("div");
        shortcutElement.style.position = "relative";
        
        const trimmedUrl = shortcut.url.trim();
        const isInfoOnly = trimmedUrl === "?";
        const isFileUrl = trimmedUrl.toLowerCase().startsWith("file://");
        
        const nameColor = isInfoOnly ? "#0079fa" : "inherit";
        const namePrefix = isInfoOnly ? '<i class="fa-solid fa-lightbulb" style=" margin-right: 2px;color: gold;"></i>' : "";



        shortcutElement.className =
  "shortcut" +
  (compactMode ? " compact" : "") +
  (editMode ? " editmode" : "");


        const baseText = isInfoOnly ? "Appuyez pour les infos" : shortcut.url;
        const tooltipContent = shortcut.tooltipPlain ? `\n\n${shortcut.tooltipPlain}` : "";
        shortcutElement.setAttribute("title", escapeHTML(`${baseText}${tooltipContent}`));
        shortcutElement.setAttribute("data-index", trueIndex);
        shortcutElement.style.cursor = editMode ? 'default' : 'pointer';

        if (!alphabeticalSorting && editMode) {
            shortcutElement.setAttribute("draggable", "true");
            shortcutElement.setAttribute("ondragstart", "drag(event)");
        }

        // --- HOLD & CLICK HANDLING ---
        let holdTimer;
        let heldTriggered = false;

        shortcutElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            if (!editMode) {
                let url = shortcut.url.trim();

                // Auto-prepend https:// if no scheme and not "?" placeholder
                if (url !== "?" && !/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
                    url = "https://" + url;
                }

                const base = url === "?" ?
                    "" :
                    `<a href="${url}" target="_blank" rel="noopener noreferrer">Lien du raccourci</a>`;

                const tooltip = shortcut.tooltip ? `<br>${shortcut.tooltip}` : "";
                showTooltipModal(`${base}${tooltip}`, true, shortcut.name);

            }
        });


        shortcutElement.addEventListener("mousedown", (e) => {
            if (!editMode && e.button === 0) {
                heldTriggered = false;
                shortcutElement.classList.add("hold-pop");

                holdTimer = setTimeout(() => {
                    heldTriggered = true;
                    navigator.clipboard.writeText(shortcut.url).then(() => {
                        const originalBg = shortcutElement.style.backgroundColor;
                        shortcutElement.style.backgroundColor = "#d4edda";
                        setTimeout(() => {
                            shortcutElement.style.backgroundColor = originalBg || "";
                        }, 800);
                        if (navigator.vibrate) navigator.vibrate(50);
                        showToast("Lien copié!", "success");
                    });
                }, 1000); // hold for 1s to trigger copy
            }
        });

        shortcutElement.addEventListener("mouseup", (e) => {
            clearTimeout(holdTimer);
            shortcutElement.classList.remove("hold-pop");

            if (e.button !== 0 || heldTriggered || editMode) return;
            if (e.target.classList.contains("favorite-toggle")) return;


            let url = shortcut.url.trim();

            if (url === "?") {
                const tooltip = shortcut.tooltip || "Aucune info disponible.";
                showTooltipModal(tooltip, true, shortcut.name);

                return;
            }

            // Auto-prepend https:// if no scheme
            if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
                url = "https://" + url;
            }

            // Validate and open
            try {
                const parsed = new URL(url);
                window.open(parsed.href, "_blank");
            } catch (err) {
                alert("URL invalide : " + url);
            }
        });



        shortcutElement.addEventListener("mouseleave", () => {
            clearTimeout(holdTimer);
            shortcutElement.classList.remove("hold-pop");
        });



        shortcutElement.addEventListener("touchstart", (e) => {
            if (editMode || e.touches.length !== 1) return;

            // Prevent default touch interactions
            shortcutElement.style.userSelect = "none";
            shortcutElement.style.webkitUserSelect = "none";
            shortcutElement.style.webkitTouchCallout = "none";
            shortcutElement.style.touchAction = "manipulation";

            touchHoldTimer = setTimeout(() => {
    let url = shortcut.url.trim();

    // Normalize URL if not "?" and no scheme present
    if (url !== "?" && !/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
        url = "https://" + url;
    }

    const base = (url === "?")
        ? ""
        : `<a href="${url}" target="_blank" rel="noopener noreferrer">Lien du raccourci</a>`;

    const tooltip = shortcut.tooltip?.trim() ? `<br>${shortcut.tooltip}` : "";

    showTooltipModal(`${base}${tooltip}`, true, shortcut.name);


    // Restore touch interaction styles after delay
    setTimeout(() => {
        shortcutElement.style.userSelect = "";
        shortcutElement.style.webkitUserSelect = "";
        shortcutElement.style.webkitTouchCallout = "";
        shortcutElement.style.touchAction = "";
    }, 1000);

}, 1000); // Long press duration
        });


        shortcutElement.addEventListener("touchend", () => {
            
        clearTimeout(touchHoldTimer);
          if (e.target.classList.contains("favorite-toggle")) return;
        });

        shortcutElement.addEventListener("touchcancel", () => {
            clearTimeout(touchHoldTimer);
        });






        // --- HTML CONTENT ---
shortcutElement.innerHTML = compactMode ? `
  <div style="display: flex; align-items: center; width: 100%;">
  <!-- Emoji pinned 4px from the left -->
  <span class="emoji-display" style="
    font-size: 2.3rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 4px;
    margin-right: 4px
  ">
    ${escapeHTML(shortcut.emoji || DEFAULT_EMOJI)}
  </span>

  <!-- Centered name -->
  <div style="
    flex: 1;
    text-align: center;
    font-weight: bold;
    color: ${nameColor};
    font-size: 1.5rem;
    line-height: 1.2;
    word-break: break-word;
    margin-right: 15px; /* space to balance emoji width */
    
  ">
    ${namePrefix}${escapeHTML(shortcut.name)}
  </div>
</div>



` : `
  <span class="move-handle" title="Déplacer raccourci" style="display: flex; flex-direction: column; align-items: center; gap: 14px;">
  <div
  class="emoji-display"
  onclick="${editMode ? `promptEmojiChange(${trueIndex})` : ''}"
  title="${editMode ? 'Changer l’emoji' : ''}"
>

    ${escapeHTML(shortcut.emoji || DEFAULT_EMOJI)}
  </div>
  <i class="fas fa-arrows-alt" style="${editMode ? '' : 'visibility:hidden'}"></i>
</span>
  <div style="text-align: left; flex-grow: 1;">
    <div style="display: flex; align-items: center; font-weight: bold; gap: 4px; color: ${nameColor};">
      ${namePrefix}${escapeHTML(shortcut.name)}
    </div>
    <div class="info">${escapeHTML(shortcut.info || "")}</div>
    <div class="tags">${tagsHTML}</div>
  </div>

<div class="favorite-toggle" style="position: absolute; top: 6px; right: 8px; font-size: 20px; cursor: pointer;" 
     onclick="toggleFavorite(${trueIndex}); event.stopPropagation();" 
     title="${shortcut.favorite ? 'Favori' : 'Marquer comme favori'}">
  ${shortcut.favorite ? "⭐" : "☆"}
</div>



  <div class="icons" style="display: flex; flex-direction: column; gap: 24px; ${editMode ? '' : 'visibility:hidden'}">
  <span class="icon" title="✏️ Modifier" onclick="editShortcut(${trueIndex}); event.stopPropagation();">
    <i class="fas fa-edit"></i>
  </span>
  <span class="icon" title="🗑️ Supprimer" onclick="deleteShortcut(${trueIndex}); event.stopPropagation();">
    <i class="fas fa-trash-alt"></i>
  </span>
</div>

`;

if (!editMode) {
  const favBtn = document.createElement("div");
  favBtn.className = "favorite-toggle";
  favBtn.innerHTML = shortcut.favorite ? "⭐" : "☆";
  favBtn.title = shortcut.favorite ? "Favori" : "Marquer comme favori";

  favBtn.style.position = "absolute";
  favBtn.style.top = "6px";
  favBtn.style.right = "8px";
  favBtn.style.fontSize = "20px";
  favBtn.style.cursor = "pointer";
  favBtn.style.zIndex = "2";
  favBtn.style.color = shortcut.favorite ? "gold" : "#aaa";  // ✅ Gold or grey
  favBtn.style.textShadow = "none";                          // ✅ No glow

  favBtn.onclick = (e) => {
    e.stopPropagation(); // ✅ prevent opening the URL
    toggleFavorite(trueIndex);
  };

  shortcutElement.appendChild(favBtn);
}



        container.appendChild(shortcutElement);
    });

    if (!alphabeticalSorting && editMode) {
        addDragAndDropEvents();
    }
    saveActiveTagFilter(); // ✅ Save filter every time it’s applied
    displayTagFilters();
    document.getElementById("shortcutCount").textContent = `Affichés: ${list.length} / Total: ${shortcuts.length}`;
}


function clearSearch() {
    const input = document.getElementById("searchInput");
    input.value = "";
    document.getElementById("clearSearchBtn").style.display = "none";
    displayShortcuts();
}

function handleSearchInput() {
    const input = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    if (input.value.trim() !== "") {
        clearBtn.style.display = "inline";
    } else {
        clearBtn.style.display = "none";
    }
    displayShortcuts();
}
// Enable manual sorting of tags
let tagOrder = JSON.parse(localStorage.getItem("tagOrder")) || [];

function saveTagOrder(order) {
    localStorage.setItem("tagOrder", JSON.stringify(order));
    setExportNeeded(true);
}


function deleteShortcut(index) {
    const shortcut = shortcuts[index];
    const confirmMsg = `Supprimer le raccourci "${shortcut.name}" ?`;
    if (confirm(confirmMsg)) {
        shortcuts.splice(index, 1);
        saveShortcuts();
        manualOrder = [...shortcuts];
        localStorage.setItem("manualOrder", JSON.stringify(manualOrder));
        setExportNeeded(true);
        displayShortcuts();
    }
}

function showTooltipModal(text, isHtml = false, shortcutName = "") {
    const tooltipContent = document.getElementById("tooltipContent");

    const safeText = text?.trim() || "Aucune info disponible.";

    let finalContent = safeText;

    if (shortcutName) {
       const titleHtml = `<div style="color: #222; text-align: center; font-size: 1.3rem;">💡 Info du raccourci : <strong>${escapeHTML(shortcutName)}</strong></div>
<hr style="border: none; border-top: 1px solid #ccc;" />`;

        finalContent = titleHtml + finalContent;
    }

    tooltipContent.innerHTML = isHtml ? finalContent : escapeHTML(finalContent);

    // Ajout des boutons "copier" pour chaque lien
    const links = tooltipContent.querySelectorAll("a[href]");
    links.forEach(linkEl => {
        const url = linkEl.getAttribute("href");

        const wrapper = document.createElement("span");
        wrapper.className = "link-with-copy";
        linkEl.parentNode.insertBefore(wrapper, linkEl);
        wrapper.appendChild(linkEl);

        const copyBtn = document.createElement("span");
        copyBtn.textContent = "📋";
        copyBtn.title = "Copier le lien";
        copyBtn.className = "copy-icon";

        copyBtn.onclick = () => {
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.textContent = "✅";
                showToast("Lien copié !", "success");
                setTimeout(() => {
                    copyBtn.textContent = "📋";
                }, 1500);
            });
        };

        wrapper.appendChild(copyBtn);
    });

    document.getElementById("tooltipModal").style.display = "flex";
}




function closeTooltipModal() {
    document.getElementById("tooltipModal").style.display = "none";
}

function openAddModal() {
     
    

    document.getElementById("editName").value = "";
    document.getElementById("editUrl").value = "";
    document.getElementById("editTags").value = "";
    document.getElementById("editInfo").value = "";
    document.getElementById('editTagsInput').value = '';
    if (quill) quill.root.innerHTML = ""; // ✅ Reset tooltip editor
    selectedTags = [];
    populateTagSuggestions();
    renderSelectedTags();
    editIndex = null;
    document.querySelector("#editModal h3").textContent = "➕Ajouter un nouveau raccourci";
    const confirmBtn = document.getElementById("confirmBtn");
    confirmBtn.textContent = "✅ Ajouter";
    confirmBtn.onclick = confirmAdd;
    document.getElementById("editModal").style.display = "flex";
}


function confirmAdd() {
    const tooltipHtml = quill.root.innerHTML.trim();
    const tooltipText = quill.getText().trim(); // plain text fallback

    const name = document.getElementById("editName").value.trim();
    const url = document.getElementById("editUrl").value.trim();
    const tags = document.getElementById("editTags").value.split(",").map(t => t.trim()).filter(Boolean);

    const info = document.getElementById("editInfo").value.trim();
    if (name && url) {
        const newShortcut = {
            name,
            url,
            tags,
            tooltip: tooltipHtml,
            tooltipPlain: tooltipText,
            info,
            emoji: DEFAULT_EMOJI(),
            favorite: false  // ✅ default to false
            
        };
        // Add to shortcuts
        shortcuts.push(newShortcut);
        // Save and update display
        saveShortcuts();
        displayShortcuts();
        // Close modal
        closeEditModal();
    } else {
        alert("Veuillez remplir au moins le nom et l'URL.");
    }
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}
let editIndex = null;

function editShortcut(index) {
    const shortcut = shortcuts[index];
    // Fill form fields
    document.getElementById("editName").value = shortcut.name;
    document.getElementById("editUrl").value = shortcut.url;
    quill.root.innerHTML = shortcut.tooltip || "";
    document.getElementById("editInfo").value = shortcut.info || "";
    document.getElementById('editTagsInput').value = '';
    // Prepare tags
    selectedTags = [...(shortcut.tags || [])];
    populateTagSuggestions(); // Get updated list of all tags
    renderSelectedTags(); // Display current tags in chip format
    // Set index
    editIndex = index;
    // Set up modal title and confirm button
    document.querySelector("#editModal h3").textContent = "✏️Modifier le raccourci";
    const confirmBtn = document.getElementById("confirmBtn");
    confirmBtn.textContent = "✅ Sauvegarder";
    confirmBtn.onclick = confirmEdit;
    // Show modal
    document.getElementById("editModal").style.display = "flex";
}

function confirmEdit() {
    const name = document.getElementById("editName").value.trim();
    const url = document.getElementById("editUrl").value.trim();
    const tags = document.getElementById("editTags").value.split(",").map(t => t.trim()).filter(Boolean);
    const tooltipHtml = quill.root.innerHTML.trim();
    const tooltipText = quill.getText().trim();

    const info = document.getElementById("editInfo").value.trim();
    if (name && url && editIndex !== null) {
        shortcuts[editIndex] = {
            name,
            url,
            tags,
            tooltip: tooltipHtml,
            tooltipPlain: tooltipText,
            info,
            emoji: shortcuts[editIndex].emoji || DEFAULT_EMOJI,
            favorite: shortcuts[editIndex].favorite || false  // ✅ preserve or fallback
        };
        saveShortcuts();
        displayShortcuts();
        closeEditModal();
    } else {
        alert("Veuillez remplir tous les champs requis.");
    }
}


function handleLogoUpload(event, side) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const MAX_SIZE = 300 * 1024; // 300 KB
  if (file.size > MAX_SIZE) {
    alert("❌ L’image dépasse 300 Ko. Veuillez en choisir une plus petite.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;

    const key = side === "left" ? "leftLogo" : "rightLogo";
    const imgId = side === "left" ? "leftLogo" : "rightLogo";
    const toastMessage = side === "left" ? "Logo gauche modifié !" : "Logo droit modifié !";

    localStorage.setItem(key, base64);

    const img = document.getElementById(imgId);
    if (img) {
      img.src = base64;
      img.style.display = "block";
      showToast(toastMessage, "success");
    }

    hideOptionsAndScrollTop();
    setExportNeeded(true); // Mark change
  };

  reader.readAsDataURL(file);
}



function loadLogos() {
  const left = localStorage.getItem("leftLogo");
  const right = localStorage.getItem("rightLogo");

  const leftImg = document.getElementById("leftLogo");
  const rightImg = document.getElementById("rightLogo");

  if (left) leftImg.src = left;
  else leftImg.style.display = "none";

  if (right) rightImg.src = right;
  else rightImg.style.display = "none";
}








const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#9966ff";
    dropZone.style.color = "#9966ff";
});

dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#eee";
    dropZone.style.color = "#eee";
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#eee";
    dropZone.style.color = "#eee";

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Trigger import using your existing logic
    const fakeEvent = { target: { files: [file] } };
    importShortcuts(fakeEvent);
});






function showInfoModal() {
    const modal = document.getElementById("infoModal");
    if (modal) {
        modal.style.display = "block";
    }
}

function closeInfoModal() {
    const modal = document.getElementById("infoModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function clearShortcuts() {
  if (confirm("Voulez-vous réinitialiser la liste ?")) {
    // 🧹 Reset shortcuts
    shortcuts = [];
    ensureDefaultShortcut(); // ✅ Add fallback examples
    saveShortcuts();
    localStorage.removeItem("manualOrder");

    // 🧹 Reset title
    const defaultTitle = "nouvelle liste";
    document.getElementById("appTitle").textContent = defaultTitle;
    localStorage.setItem("appTitle", defaultTitle);

    // 🎨 Reset title color to black
    localStorage.setItem("appTitleColor", "#000000");
    document.getElementById("appTitle").style.color = "#000000";

    // 🧼 Reset tag order
    localStorage.removeItem("tagOrder");
    tagOrder = [];

    // 🔁 Reset UI state
    uiToggleState = {
      searchBar: true,
      tagFilters: true
    };
    saveUIState();

    // 📦 Reset view mode and filters
    compactMode = false;
    localStorage.setItem("compactMode", "false");

    activeTagFilter = [];
    saveActiveTagFilter();

    showOnlyFavorites = false;
    localStorage.setItem("showOnlyFavorites", "false");

    // 🖼️ Reset logos
    localStorage.removeItem("leftLogo");
    localStorage.removeItem("rightLogo");

    const leftLogo = document.getElementById("leftLogo");
    const rightLogo = document.getElementById("rightLogo");

    if (leftLogo) leftLogo.style.display = "none";
    if (rightLogo) rightLogo.style.display = "none";

    // 📝 Update display
    setExportNeeded(true);
    displayShortcuts();

    // ✅ Optional feedback
    showToast("Liste réinitialisée 🔄");
  }
}


let draggedElement = null;

function drag(event) {
    draggedElement = event.currentTarget;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedElement.dataset.index);
    setTimeout(() => {
        draggedElement.classList.add("dragging");
    }, 0);
}

function drop(event) {
    event.preventDefault();
    const target = event.currentTarget;
    target.classList.remove("drag-over");
    const fromIndex = parseInt(draggedElement.dataset.index);
    const toIndex = parseInt(target.dataset.index);
    if (fromIndex !== toIndex) {
        const movedItem = shortcuts.splice(fromIndex, 1)[0];
        shortcuts.splice(toIndex, 0, movedItem);
        saveShortcuts();
        displayShortcuts();
    }
}

function allowDrop(event) {
    event.preventDefault();
    const target = event.currentTarget;
    if (target && target !== draggedElement) {
        target.classList.add("drag-over");
    }
}

function addDragAndDropEvents() {
    document.querySelectorAll(".shortcut").forEach((el) => {
        el.addEventListener("dragstart", drag);
        el.addEventListener("dragover", allowDrop);
        el.addEventListener("drop", drop);
        el.addEventListener("dragend", dragEnd);
    });
}

function dragEnd() {
    if (draggedElement) {
        draggedElement.classList.remove("dragging");
        draggedElement = null;
    }
    document.querySelectorAll(".shortcut").forEach(el => el.classList.remove("drag-over"));
}
document.querySelectorAll(".shortcut").forEach((el) => {
    el.addEventListener("dragend", dragEnd);
});

window.addEventListener("scroll", () => {
    const btn = document.getElementById("backToTopBtn");
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (scrollTop > 100) {
        btn.classList.add("show");
    } else {
        btn.classList.remove("show");
    }
});





document.getElementById("backToTopBtn").addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});



document.addEventListener("DOMContentLoaded", () => {
    
    document.getElementById("leftLogoInput").addEventListener("change", e => handleLogoUpload(e, "left"));
    document.getElementById("rightLogoInput").addEventListener("change", e => handleLogoUpload(e, "right"));

    loadUIState();

    // Search Bar
    document.getElementById("searchContainer").style.display = uiToggleState.searchBar ? "flex" : "none";

    // Tag Filters
    document.getElementById("tagFilters").classList.toggle("hidden", !uiToggleState.tagFilters);

const savedColor = localStorage.getItem("appBackgroundColor");
if (savedColor) {
  applyGradientBackground(savedColor);
}

loadLogos();

populateColorSuggestions(); // optional pre-fill

});




window.onload = function() {
    document.getElementById("buttonGroupWrapper").classList.add("hidden");

    const savedCompact = localStorage.getItem("compactMode");  // ✅ Restore compact
    compactMode = savedCompact === "true";

showOnlyFavorites = localStorage.getItem("showOnlyFavorites") === "true";


const savedFilter = localStorage.getItem("activeTagFilter");
if (savedFilter) {
    try {
        const parsed = JSON.parse(savedFilter);
        if (Array.isArray(parsed)) {
            activeTagFilter = parsed;
        }
    } catch (e) {
        console.warn("Erreur parsing activeTagFilter:", e);
    }
}



    loadShortcuts();

    const savedTitle = localStorage.getItem("appTitle");
    if (savedTitle) {
        document.getElementById("appTitle").textContent = savedTitle;
    }

    updateLastExportDisplay();
    isExportNeeded = false;
    updateExportStatusDot();


const BlockEmbed = Quill.import('blots/block/embed');

  class HorizontalRule extends BlockEmbed {
    static create() {
      const node = super.create();
      return node;
    }
  }

  HorizontalRule.blotName = 'hr';
  HorizontalRule.tagName = 'hr';

  Quill.register(HorizontalRule);



    quill = new Quill('#editTooltip', {
    theme: 'snow',
    placeholder: 'Saisissez du texte enrichi...',
    modules: {
  toolbar: {
  container: [
    ['bold', 'italic', 'underline'],
    [{ 'header': [1, 2, 3, false] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'list': 'bullet' }],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['hr'],
    ['clean']
  ],
    handlers: {
      hr: function () {
        const range = this.quill.getSelection(true);
        if (range) {
          this.quill.insertEmbed(range.index, 'hr', true, Quill.sources.USER);
          this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
        }
      }
    }
  }
}
});

};
