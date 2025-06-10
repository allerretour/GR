let quill;
let activeTagFilter = [];
let shortcuts = [];
let alphabeticalSorting = false;
let manualOrder = [];
let editMode = false;
let compactMode = false;




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

function toggleTags() {
    const tagContainer = document.getElementById("tagFilters");
    tagContainer.classList.toggle("hidden");
    const el = document.getElementById("tagFilters");
    uiToggleState.tagFilters = !uiToggleState.tagFilters;
    el.classList.toggle("hidden", !uiToggleState.tagFilters);
    saveUIState();
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
    if (shortcuts.length === 0) {
        shortcuts.push({
            name: "Exemple",
            url: "https://google.com",
            info: "Ceci est un raccourci par défaut.",
            tags: ["exemple"],
            tooltip: "<p>Voici une info-bulle HTML <strong>éditable</strong>.</p>",
            tooltipPlain: "Voici une info-bulle HTML éditable."
        });
        saveShortcuts();
    }
}



function saveTitle() {
    const newTitle = document.getElementById("appTitle").textContent.trim();
    if (newTitle) {
        localStorage.setItem("appTitle", newTitle); // Save to localStorage
        setExportNeeded(true);
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
        if (sc.tooltip && !sc.tooltipPlain) {
            // Strip HTML tags for plain text
            const temp = document.createElement("div");
            temp.innerHTML = sc.tooltip;
            sc.tooltipPlain = temp.textContent.trim();
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
        "#1f77b4", // strong blue
        "#2ca02c", // green
        "#d62728", // red
        "#9467bd", // purple
        "#ff7f0e", // orange
        "#17becf", // cyan
        "#7f7f7f", // gray
        "#bcbd22", // olive
        "#8c564b", // brown
        "#e377c2", // pink
        "#393b79", // deep blue
        "#637939", // moss green
        "#843c39", // brick red
        "#6b6ecf", // violet
        "#9c9ede", // steel blue
        "#17a2b8" // teal blue
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}



function showCopyToast() {
    const toast = document.getElementById("copyToast");
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}

function getTooltipText(text) {
    return text && text.trim() !== "" ? text.trim() : "Aucune info disponible.";
}

function displayShortcuts() {
    const container = document.getElementById("shortcuts");
    container.innerHTML = "";
    const searchTerm = document.getElementById("searchInput")?.value?.toLowerCase() || "";
    let list = [...shortcuts];

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
        
        const trimmedUrl = shortcut.url.trim();
        const isInfoOnly = trimmedUrl === "?";
        const isFileUrl = trimmedUrl.toLowerCase().startsWith("file://");

        if (isInfoOnly) {
          shortcutElement.style.backgroundColor = "#e7f1fb"; // Info-only blue
        } else if (isFileUrl) {
          shortcutElement.style.backgroundColor = "#fff4e5"; // File URL orange
        }


        shortcutElement.className = "shortcut" + (compactMode ? " compact" : "");

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

                const tooltip = shortcut.tooltip ? `<br><br>${shortcut.tooltip}` : "";
                showTooltipModal(`${base}${tooltip}`, true); // true = isHtml
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
                        showCopyToast();
                    });
                }, 1000); // hold for 1s to trigger copy
            }
        });

        shortcutElement.addEventListener("mouseup", (e) => {
            clearTimeout(holdTimer);
            shortcutElement.classList.remove("hold-pop");

            if (e.button !== 0 || heldTriggered || editMode) return;

            let url = shortcut.url.trim();

            if (url === "?") {
                const tooltip = shortcut.tooltip || "Aucune info disponible.";
                showTooltipModal(tooltip);
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

                const base = url === "?" ?
                    "" :
                    `<a href="${url}" target="_blank" rel="noopener noreferrer">Lien du raccourci</a>`;
                const tooltip = shortcut.tooltip ? `<br><br>${shortcut.tooltip}` : "";

                showTooltipModal(`${base}${tooltip}`, true);

                // Delay restoring styles
                setTimeout(() => {
                    shortcutElement.style.userSelect = "";
                    shortcutElement.style.webkitUserSelect = "";
                    shortcutElement.style.webkitTouchCallout = "";
                    shortcutElement.style.touchAction = "";
                }, 1000);
            }, 700);
        });


        shortcutElement.addEventListener("touchend", () => {
            clearTimeout(touchHoldTimer);
        });

        shortcutElement.addEventListener("touchcancel", () => {
            clearTimeout(touchHoldTimer);
        });




        // --- HTML CONTENT ---
shortcutElement.innerHTML = compactMode ? `
  <div style="font-weight: bold;">${escapeHTML(shortcut.name)}</div>
` : `
  <span class="move-handle" style="${editMode ? '' : 'visibility:hidden'}">
    <i class="fas fa-arrows-alt"></i>
  </span>
  <div style="text-align: left; flex-grow: 1;">
    <div style="display: flex; align-items: center; font-weight: bold; gap: 6px;">
      ${escapeHTML(shortcut.name)}
    </div>
    <div class="info" style="font-size: 0.75em; color: #B3B3B3;">
      ${escapeHTML(shortcut.info || "")}
    </div>
    <div class="tags">${tagsHTML}</div>
  </div>
  <div class="icons" style="${editMode ? '' : 'visibility:hidden'}">
    <span class="icon" onclick="editShortcut(${trueIndex}); event.stopPropagation();">
      <i class="fas fa-edit"></i>
    </span>
    <span class="icon" onclick="deleteShortcut(${trueIndex}); event.stopPropagation();">
      <i class="fas fa-trash-alt"></i>
    </span>
  </div>
`;


        container.appendChild(shortcutElement);
    });

    if (!alphabeticalSorting && editMode) {
        addDragAndDropEvents();
    }

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

  // "Tous" (All) clear button
  const clearBtn = document.createElement("span");
  clearBtn.className = "tag-filter" + (activeTagFilter.length === 0 ? " active" : "");
  clearBtn.textContent = "Tous";
  clearBtn.onclick = () => {
    activeTagFilter = [];
    displayShortcuts();
  };
  tagContainer.appendChild(clearBtn);

  tagOrder.forEach(tag => {
    const btn = document.createElement("span");
    btn.className = "tag-filter" + (activeTagFilter.includes(tag) ? " active" : "");
    btn.textContent = tag;
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.gap = "6px";

    // Move icon
    const moveIcon = document.createElement("i");
    moveIcon.className = "fas fa-arrows-alt";
    moveIcon.style.color = "#999";
    moveIcon.style.cursor = "grab";
    moveIcon.style.display = editMode ? "inline-block" : "none";

    // Drag-and-drop behavior in edit mode
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

    btn.onclick = () => {
      if (activeTagFilter.includes(tag)) {
        activeTagFilter = activeTagFilter.filter(t => t !== tag);
      } else {
        activeTagFilter.push(tag);
      }
      displayShortcuts();
    };

    tagContainer.appendChild(btn);
  });

  // Apply AND/OR mode class
  const isAndMode = document.getElementById("tagFilterModeToggle").checked;
  document.querySelectorAll(".tag-filter").forEach(el => {
    el.classList.remove("and-mode", "or-mode");
    el.classList.add(isAndMode ? "and-mode" : "or-mode");
  });
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

function showTooltipModal(text) {
    const tooltipContent = document.getElementById("tooltipContent");
    const parts = (text || "Aucune info disponible.").split("\n\n");
    tooltipContent.innerHTML = text || "<em>Aucune info disponible.</em>";

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
            info
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
            info
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
        tagOrder: tagOrder
    };
    const dataStr = JSON.stringify(data, null, 4);

    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

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

    // Save export info
    localStorage.setItem("lastExportFilename", lstFilename);
    setExportNeeded(false);
    updateLastExportDisplay();
}




function importShortcuts(event) {
    
    
    const file = event.target.files[0];
    if (!file) return;

    // ✅ Only allow .lst files
    if (!file.name.toLowerCase().endsWith(".lst")) {
        alert("Seuls les fichiers .lst sont autorisés.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                shortcuts = importedData;
            } else if (importedData.shortcuts && Array.isArray(importedData.shortcuts)) {
                shortcuts = importedData.shortcuts;
                if (importedData.title) {
                    document.getElementById("appTitle").textContent = importedData.title;
                    localStorage.setItem("appTitle", importedData.title);
                }
                if (Array.isArray(importedData.tagOrder)) {
                    tagOrder = importedData.tagOrder;
                    localStorage.setItem("tagOrder", JSON.stringify(tagOrder));
                }
            } else {
                alert("Format JSON invalide.");
                return;
            }
            
            
            saveShortcuts();
            displayShortcuts();
            setExportNeeded(false);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            
            
        } catch {
            alert("Erreur de lecture du fichier. Veuillez importer un fichier .lst valide.");
        }
    };
    reader.readAsText(file);
}


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

    loadShortcuts();

    const savedTitle = localStorage.getItem("appTitle");
    if (savedTitle) {
        document.getElementById("appTitle").textContent = savedTitle;
    }
    updateLastExportDisplay();
    isExportNeeded = false;
    updateExportStatusDot();

    // ✅ Initialize Quill
    quill = new Quill('#editTooltip', {
        theme: 'snow',
        placeholder: 'Saisissez du texte enrichi...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],

                [{
                    'size': ['small', false, 'large', 'huge']
                }],
                [{
                    'color': []
                }, {
                    'background': []
                }],
                [{
                    'align': []
                }],
                ['link'],
                ['clean']
            ]
        }
    });

};