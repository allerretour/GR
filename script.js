let quill;
let activeTagFilter = [];
let shortcuts = [];
let alphabeticalSorting = false;
let manualOrder = [];
let editMode = false;
let compactMode = false;
const DEFAULT_EMOJI = () => EMOJI_CHOICES?.[0] || "🔗";
const storedFavoriteMode = localStorage.getItem("showOnlyFavorites");
let showOnlyFavorites = storedFavoriteMode === "false"; // ✅ restore as boolean



const icons = Quill.import('ui/icons');
icons['hr'] = '<span style="display:inline-block;width:100%;border-top:1px solid #888;margin-top:2px;"></span>';


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


function mergeShortcuts(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm("Souhaitez-vous fusionner cette liste avec la liste actuelle ?")) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (!Array.isArray(importedData.shortcuts)) {
                alert("Le fichier ne contient pas de raccourcis valides.");
                return;
            }

            const existingKeys = new Set(shortcuts.map(s => `${s.name}|||${s.url}`));
            let addedCount = 0;

            importedData.shortcuts.forEach(s => {
                const key = `${s.name}|||${s.url}`;
                if (!existingKeys.has(key)) {
                    shortcuts.push(s);
                    existingKeys.add(key);
                    addedCount++;
                }
            });

            // Merge tagOrder
            if (Array.isArray(importedData.tagOrder)) {
                tagOrder = Array.from(new Set([...tagOrder, ...importedData.tagOrder]));
            }

            

            if (importedData.uiToggleState) {
                uiToggleState = {
                    ...uiToggleState,
                    ...importedData.uiToggleState
                };
                saveUIState();
            }

            if (importedData.appTitle) {
                document.getElementById("appTitle").textContent = importedData.appTitle;
                localStorage.setItem("appTitle", importedData.appTitle);
            }

            setExportNeeded(true);
            saveShortcuts();
            displayShortcuts();

            // ✅ Show confirmation toast
            showToast(`✅ ${addedCount} raccourci${addedCount > 1 ? 's' : ''} ajouté${addedCount > 1 ? 's' : ''} à la liste`);

        } catch (err) {
            alert("Erreur lors de la fusion : " + err.message);
        }
    };

    reader.readAsText(file);
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




function toggleTags() {
    const tagContainer = document.getElementById("tagFilters");
    tagContainer.classList.toggle("hidden");
    const el = document.getElementById("tagFilters");
    uiToggleState.tagFilters = !uiToggleState.tagFilters;
    el.classList.toggle("hidden", !uiToggleState.tagFilters);
    saveUIState();
hideOptionsAndScrollTop()
}

function saveActiveTagFilter() {
    const current = localStorage.getItem("activeTagFilter");
    const serialized = JSON.stringify(activeTagFilter);

    if (current !== serialized) {
        localStorage.setItem("activeTagFilter", serialized);
        setExportNeeded(true);
    }
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
    if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
        shortcuts.push(
            {
                name: "Exemple",
                url: "https://google.com",
                info: "Clic de DROIT pour plus d'infos",
                emoji: DEFAULT_EMOJI(),
                favorite: false,
                tags: ["instruction"],
                tooltip: `<p>vous pouvez ajouter des raccourcis en appuyant sur l'engrenage puis le bouton +<br><br>pour charger une liste existante, utilisez le bouton avec la flèche vers le bas</p>`,
                tooltipPlain: "vous pouvez ajouter des raccourcis en appuyant sur l'engrenage puis le bouton +\n\npour charger une liste existante, utilisez le bouton avec la flèche vers le bas"
            },
            {
                name: "Site de test",
                url: "https://example.com",
                info: "Second raccourci de démonstration",
                emoji: DEFAULT_EMOJI(),
                favorite: false,
                tags: ["démo"],
                tooltip: `<p>Ceci est un deuxième raccourci pour tester le fonctionnement de l'application.</p>`,
                tooltipPlain: "Ceci est un deuxième raccourci pour tester le fonctionnement de l'application."
            }
        );
        if (!uiToggleState) {
            uiToggleState = {
                searchBar: true,
                tagFilters: true
            };
            saveUIState();
        }

        compactMode = false;
        localStorage.setItem("compactMode", "false");

        activeTagFilter = [];
        saveActiveTagFilter();

        saveShortcuts();
    }
}



function saveTitle() {
    const newTitle = document.getElementById("appTitle").textContent.trim();
    if (newTitle) {
        localStorage.setItem("appTitle", newTitle); // Save to localStorage
        setExportNeeded(true);
        showToast("✅ Titre modifié !");
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


let selectedTags = [];

function getAllExistingTags() {
    const tagSet = new Set();
    shortcuts.forEach(sc => (sc.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
}

function populateTagSuggestions() {
    const datalist = document.getElementById("tagSuggestions");
    datalist.innerHTML = "";
    getAllExistingTags().forEach(tag => {
        const option = document.createElement("option");
        option.value = tag;
        datalist.appendChild(option);
    });
}

function handleTagInput(event) {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
        event.preventDefault();
        const input = event.target;
        let tag = input.value.trim().replace(/,$/, "");
        if (tag && !selectedTags.includes(tag)) {
            selectedTags.push(tag);
            renderSelectedTags();
        }
        input.value = "";
    }
}


function exportVisibleShortcuts(format) {
  closeExportFormatModal();

  const visibleShortcuts = [];
  const shortcutElements = document.querySelectorAll("#shortcuts .shortcut");
  const listTitle = document.getElementById("appTitle").textContent.trim() || "Sans titre";

  shortcutElements.forEach(el => {
    const index = parseInt(el.getAttribute("data-index"));
    const shortcut = shortcuts[index];
    if (shortcut) {
      visibleShortcuts.push(shortcut);
    }
  });

  const count = visibleShortcuts.length;
  if (count === 0) {
    showToast("Aucun raccourci à exporter.");
    return;
  }

  const now = new Date();
  const timestamp = now.toLocaleString('sv-SE', {
    hour12: false,
    timeZone: 'America/Toronto'
  }).replace(' ', '_').replace(/:/g, '-');

  const safeTitle = listTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const baseFilename = `raccourcis_visible_${safeTitle}_${timestamp}`;

  if (format === "txt" || format === "both") {
    const textLines = visibleShortcuts.map(sc => {
      const name = sc.name || "Sans nom";
      const url = sc.url?.trim() === "?" ? "[ (i) INFORMATIONS SEULEMENT ]" : sc.url || "";
      return `${name}\n${url}\n---`;
    });

    const header = [
      `Liste : ${listTitle}`,
      `Nombre de raccourcis exportés : ${count}`,
      `===============================`,
      " "
    ].join("\n");

    const textContent = header + "\n" + textLines.join("\n\n");
    const textBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });

    const textLink = document.createElement("a");
    textLink.href = URL.createObjectURL(textBlob);
    textLink.download = `${baseFilename}.txt`;
    document.body.appendChild(textLink);
    textLink.click();
    document.body.removeChild(textLink);
  }

  if (format === "lst" || format === "both") {
    const jsonData = {
      title: listTitle,
      shortcuts: visibleShortcuts
    };
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 4)], { type: "application/octet-stream" });

    const jsonLink = document.createElement("a");
    jsonLink.href = URL.createObjectURL(jsonBlob);
    jsonLink.download = `${baseFilename}.lst`;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
  }

  hideOptionsAndScrollTop();
  showToast("Exportation réussie !");
}

function openExportFormatModal() {
  const shortcutsEls = [...document.querySelectorAll("#shortcuts .shortcut")];
  let total = 0;
  let infoOnly = 0;

  shortcutsEls.forEach(el => {
    const index = parseInt(el.getAttribute("data-index"));
    const shortcut = shortcuts[index];
    if (shortcut) {
      total++;
      if (shortcut.url.trim() === "?") {
        infoOnly++;
      }
    }
  });

  let label = "";

  if (total === 0) {
    label = "Aucun raccourci à exporter.";
  } else {
    label = `${total} raccourci${total > 1 ? "s" : ""} seront exporté${total > 1 ? "s" : ""}`;
    if (infoOnly > 0) {
      label += `, dont ${infoOnly} "informations seulement"`;
    }
    label += ".";
  }

  document.getElementById("exportCount").textContent = label;
  document.getElementById("exportFormatModal").classList.add("show");
}




function closeExportFormatModal() {
  document.getElementById("exportFormatModal").classList.remove("show");
}




function renderSelectedTags() {
    const container = document.getElementById("editTagsContainer");
    container.innerHTML = "";
    selectedTags.forEach((tag, index) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.style = `
      background: #444;
      color: white;
      padding: 3px 8px;
      border-radius: 12px;
      margin: 2px;
      cursor: default;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    `;
        const tagText = document.createElement("span");
        tagText.textContent = tag;
        const closeBtn = document.createElement("span");
        closeBtn.textContent = "×";
        closeBtn.style = `
      margin-left: 4px;
      cursor: pointer;
      font-weight: bold;
    `;
        closeBtn.title = "Retirer ce tag";
        closeBtn.onclick = () => {
            selectedTags.splice(index, 1);
            renderSelectedTags();
        };
        span.appendChild(tagText);
        span.appendChild(closeBtn);
        container.appendChild(span);
    });
    // Keep hidden input in sync
    document.getElementById("editTags").value = selectedTags.join(",");
}

function toggleButtonGroup() {
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

function getTagColor(tag) {
    const colors = [
    "#d32f2f", // vivid red
    "#1976d2", // bold blue
    "#388e3c", // rich green
    "#fbc02d", // vibrant yellow (on black text)
    "#7b1fa2", // deep purple
    "#f57c00", // bright orange
    "#00796b", // teal green
    "#c2185b", // raspberry
    "#512da8", // indigo
    "#0288d1", // sky blue
    "#c62828", // crimson
    "#2e7d32", // forest green
    "#ff5722", // neon orange
    "#5d4037", // chocolate
    "#0097a7", // deep cyan
    "#303f9f"  // dark indigo
];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}



function showToast(message) {
    const toast = document.getElementById("copyToast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}


function getTooltipText(text) {
    return text && text.trim() !== "" ? text.trim() : "Aucune info disponible.";
}

function displayShortcuts() {
    
    // ✅ Auto-switch off Favoris mode if needed
    if (showOnlyFavorites && !shortcuts.some(s => s.favorite)) {
    showOnlyFavorites = false;
    localStorage.setItem("showOnlyFavorites", false);
    showToast("🚫 Aucun favori — retour à Tous");
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
        const namePrefix = isInfoOnly ? '<i class="fa-solid fa-circle-info" style="margin-right: 2px;color: #0079fa;"></i>' : "";



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
                        showToast("Lien copié!");
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
  <div style="display: flex; align-items: center; gap: 6px;">
    <span class="emoji-display" style="
      font-size: 2rem;
      width: 38px;
      height: 38px;
      
      display: flex;
      align-items: center;
      justify-content: center;
      
      flex-shrink: 0;
    ">
      ${escapeHTML(shortcut.emoji || DEFAULT_EMOJI)}
    </span>
    <div style="font-weight: bold; color: ${nameColor};">
      ${namePrefix}${escapeHTML(shortcut.name)}
    </div>
  </div>


` : `
  <span class="move-handle" style="display: flex; flex-direction: column; align-items: center; gap: 14px;">
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
  <span class="icon" onclick="editShortcut(${trueIndex}); event.stopPropagation();">
    <i class="fas fa-edit"></i>
  </span>
  <span class="icon" onclick="deleteShortcut(${trueIndex}); event.stopPropagation();">
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



function displayTagFilters() {
  const tagContainer = document.getElementById("tagFilters");
  tagContainer.innerHTML = "";

  const tagSet = new Set();
  shortcuts.forEach(s => (s.tags || []).forEach(t => tagSet.add(t)));
  if (tagSet.size === 0) return;

  const allTags = Array.from(tagSet);

  // Maintain tag order with new/removed tags
  tagOrder = tagOrder.filter(t => allTags.includes(t)).concat(
    allTags.filter(t => !tagOrder.includes(t))
  );


// Check if any favorites exist
const hasFavorites = shortcuts.some(s => s.favorite);

if (hasFavorites) {
  // "Favoris" button
  const favBtn = document.createElement("span");
  favBtn.className = "tag-filter" + (showOnlyFavorites ? " active" : "");
  favBtn.textContent = "⭐";
  favBtn.title = "Afficher uniquement les raccourcis favoris";

  favBtn.onclick = () => {
    activeTagFilter = [];
    showOnlyFavorites = true;
    localStorage.setItem("showOnlyFavorites", true);
    displayShortcuts();
    showToast("⭐ Mode favoris uniquement");
  };

  tagContainer.appendChild(favBtn);
}




// "Tous" (All) button
const clearBtn = document.createElement("span");
clearBtn.className = "tag-filter" + ((activeTagFilter.length === 0 && !showOnlyFavorites) ? " active" : "");
clearBtn.textContent = "Tous";
clearBtn.title = "Afficher tous les raccourcis";

clearBtn.onclick = () => {
  activeTagFilter = [];
  showOnlyFavorites = false;
  localStorage.setItem("showOnlyFavorites", false); // ✅ Save
  displayShortcuts();
  showToast("📁 Tous les raccourcis");
};

tagContainer.appendChild(clearBtn);







  // Render each tag button
  tagOrder.forEach(tag => {
    const btn = document.createElement("span");
    btn.className = "tag-filter" + (activeTagFilter.includes(tag) ? " active" : "");
    btn.textContent = tag;
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.gap = "6px";

    btn.title = activeTagFilter.includes(tag)
      ? `Filtre déjà sélectionné\nCliquez 👈 pour le retirer\nCliquez 👉 pour filtre unique`
      : `Cliquez 👈 pour filtrer par « ${tag} »\nCliquez 👉 pour filtre unique`;

    const moveIcon = document.createElement("i");
    moveIcon.className = "fas fa-arrows-alt";
    moveIcon.style.color = "#999";
    moveIcon.style.cursor = "grab";
    moveIcon.style.display = editMode ? "inline-block" : "none";

    // Drag-and-drop behavior
    if (editMode) {
      btn.draggable = true;
      btn.ondragstart = e => {
        e.dataTransfer.setData("text/plain", tag);
        e.dataTransfer.effectAllowed = "move";
      };
      btn.ondragover = e => e.preventDefault();
      btn.ondrop = e => {
        e.preventDefault();
        const fromTag = e.dataTransfer.getData("text/plain");
        const toTag = tag;
        const fromIndex = tagOrder.indexOf(fromTag);
        const toIndex = tagOrder.indexOf(toTag);
        if (fromIndex > -1 && toIndex > -1 && fromIndex !== toIndex) {
          const reordered = [...tagOrder];
          const [moved] = reordered.splice(fromIndex, 1);
          reordered.splice(toIndex, 0, moved);
          tagOrder = reordered;
          saveTagOrder(tagOrder);
          displayTagFilters();
        }
      };
    } else {
      btn.draggable = false;
    }

    btn.insertBefore(moveIcon, btn.firstChild);

    // Left click: toggle
    btn.onclick = (e) => {
      if (e.button === 2) return; // skip right click
      showOnlyFavorites = false;
      localStorage.setItem("showOnlyFavorites", showOnlyFavorites); // ✅ Save it too

      if (activeTagFilter.includes(tag)) {
        activeTagFilter = activeTagFilter.filter(t => t !== tag);
      } else {
        activeTagFilter.push(tag);
      }
      displayShortcuts();
    };

    // Right click: single filter
    btn.oncontextmenu = (e) => {
      e.preventDefault();
      showOnlyFavorites = false;
      localStorage.setItem("showOnlyFavorites", showOnlyFavorites); // ✅ Save it
      activeTagFilter = [tag];
      displayShortcuts();
      showToast(`🔎 Filtré uniquement par "${tag}"`);
    };

    tagContainer.appendChild(btn);
  });

  // Apply AND/OR mode classes
  const isAndMode = document.getElementById("tagFilterModeToggle").checked;
  document.querySelectorAll(".tag-filter").forEach(el => {
    el.classList.remove("and-mode", "or-mode");
    el.classList.add(isAndMode ? "and-mode" : "or-mode");
  });
}


function toggleFavorite(index) {
  shortcuts[index].favorite = !shortcuts[index].favorite;
  saveShortcuts();
  displayShortcuts();
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
       const titleHtml = `<div style="color: #333; text-align: center;">💡 Info du raccourci : <strong>${escapeHTML(shortcutName)}</strong>
</div>
<hr style="border: none; border-top: 1px solid #ccc; " />
`;
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
                showToast("Lien copié !");
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
    document.querySelector("#editModal h3").textContent = "Ajouter un nouveau raccourci";
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
    document.querySelector("#editModal h3").textContent = "Modifier le raccourci";
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

function saveShortcuts() {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    setExportNeeded(true);
}

function exportShortcuts() {
    const title = document.getElementById("appTitle").textContent.trim();
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const now = new Date();
    const timestamp = now.toLocaleString('sv-SE', {
        hour12: false,
        timeZone: 'America/Toronto'
    }).replace(' ', '_').replace(/:/g, '-');

    const baseFilename = `GDR_${sanitizedTitle || "shortcuts"}_${timestamp}`;
    const lstFilename = `${baseFilename}.lst`;

    const data = {
    title: title,
    shortcuts: shortcuts,
    tagOrder: tagOrder,
    uiToggleState: uiToggleState,
    compactMode: compactMode,
    activeTagFilter: activeTagFilter,
    showOnlyFavorites: showOnlyFavorites // ✅ NEW: include favorite mode flag
};
    const dataStr = JSON.stringify(data, null, 4);

    const blob = new Blob([dataStr], {
        type: "application/octet-stream"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = lstFilename;

    document.body.appendChild(a);
    requestAnimationFrame(() => {
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);
    });

    localStorage.setItem("lastExportFilename", lstFilename);
    setExportNeeded(false);
    updateLastExportDisplay();
    hideOptionsAndScrollTop();
    showToast("Exportation réussie !");

}




function importShortcuts(event) {
    const file = event.target.files[0];
    if (!file) return;

    // ✅ Only accept .lst files
    if (!file.name.toLowerCase().endsWith(".lst")) {
        alert("Seuls les fichiers .lst sont autorisés.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Reset defaults
            activeTagFilter = [];

            if (Array.isArray(importedData)) {
                shortcuts = importedData;
            } else if (importedData.shortcuts && Array.isArray(importedData.shortcuts)) {
                shortcuts = importedData.shortcuts;

                // Restore title
                if (importedData.title) {
                    document.getElementById("appTitle").textContent = importedData.title;
                    localStorage.setItem("appTitle", importedData.title);
                }

                // Restore tag order
                if (Array.isArray(importedData.tagOrder)) {
                    tagOrder = importedData.tagOrder;
                    localStorage.setItem("tagOrder", JSON.stringify(tagOrder));
                }

                // ✅ Restore selected tag filters
                if (Array.isArray(importedData.activeTagFilter)) {
                    activeTagFilter = importedData.activeTagFilter;
                }

                // ✅ Restore UI toggle state
                if (importedData.uiToggleState) {
                    uiToggleState = {
                        ...uiToggleState,
                        ...importedData.uiToggleState
                    };
                    saveUIState();
                }

                // ✅ Restore compact mode
                if (typeof importedData.compactMode === "boolean") {
                    compactMode = importedData.compactMode;
                    localStorage.setItem("compactMode", compactMode);
                }

                // ✅ Restore favorite mode
if (typeof importedData.showOnlyFavorites === "boolean") {
    showOnlyFavorites = importedData.showOnlyFavorites;
}


            } else {
                alert("Format JSON invalide.");
                return;
            }

displayTagFilters(); // ✅ Ensures "⭐ Tous" is correct if favorites mode is active



            // ✅ Clear search input
            document.getElementById("searchInput").value = "";

            // ✅ Apply UI state to DOM
            document.getElementById("searchContainer").style.display = uiToggleState.searchBar ? "flex" : "none";
            document.getElementById("tagFilters").classList.toggle("hidden", !uiToggleState.tagFilters);

            // ✅ Save & re-render everything
            saveShortcuts();
            displayShortcuts();

            // ✅ Reset export flag
            setExportNeeded(false);
            localStorage.setItem("lastExportFilename", "");
            updateLastExportDisplay();

            hideOptionsAndScrollTop(); 

// ✅ Réinitialise le champ fichier pour permettre une nouvelle importation du même fichier
event.target.value = "";

// ✅ Affiche une confirmation
showToast("Importation réussie !");



        } catch {
            alert("Erreur de lecture du fichier. Veuillez importer un fichier .lst valide.");
        }
    };

    reader.readAsText(file);
}



const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#9966ff";
    dropZone.style.color = "#9966ff";
});

dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#eee";
    dropZone.style.color = "#ddd";
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#eee";
    dropZone.style.color = "#ddd";

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
    if (confirm("Voulez vous réinitialiser la liste?")) {
        shortcuts = [];
        ensureDefaultShortcut();  // ✅ add fallback
        saveShortcuts();
        localStorage.removeItem("manualOrder");
        // Reset the title
        const defaultTitle = "nouvelle liste";
        document.getElementById("appTitle").textContent = defaultTitle;
        localStorage.setItem("appTitle", defaultTitle);
        setExportNeeded(true);
        displayShortcuts();
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
    loadUIState();

    // Search Bar
    document.getElementById("searchContainer").style.display = uiToggleState.searchBar ? "flex" : "none";

    // Tag Filters
    document.getElementById("tagFilters").classList.toggle("hidden", !uiToggleState.tagFilters);


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
    ['bold', 'italic', 'underline', 'strike', 'code'],
    [{ 'header': [1, 2, 3, false] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'blockquote'],
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
