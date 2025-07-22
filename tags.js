// tags.js
function toggleTags() {
  const tagContainer = document.getElementById("tagFilters");
  tagContainer.classList.toggle("hidden");
  const el = document.getElementById("tagFilters");
  uiToggleState.tagFilters = !uiToggleState.tagFilters;
  el.classList.toggle("hidden", !uiToggleState.tagFilters);
  saveUIState();
  hideOptionsAndScrollTop();
}

function saveActiveTagFilter() {
  const current = localStorage.getItem("activeTagFilter");
  const serialized = JSON.stringify(activeTagFilter);
  if (current !== serialized) {
    localStorage.setItem("activeTagFilter", serialized);
    setExportNeeded(true);
  }
}
let selectedTags = [];

function getAllExistingTags() {
  const tagSet = new Set();
  shortcuts.forEach((sc) => (sc.tags || []).forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

function populateTagSuggestions() {
  const datalist = document.getElementById("tagSuggestions");
  datalist.innerHTML = "";
  getAllExistingTags().forEach((tag) => {
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

function getTagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tagcolors[Math.abs(hash) % tagcolors.length];
}

function displayTagFilters() {
  const tagContainer = document.getElementById("tagFilters");
  tagContainer.innerHTML = "";
  const tagSet = new Set();
  shortcuts.forEach((s) => (s.tags || []).forEach((t) => tagSet.add(t)));
  if (tagSet.size === 0) return;
  const allTags = Array.from(tagSet);
  // Maintain tag order with new/removed tags
  tagOrder = tagOrder
    .filter((t) => allTags.includes(t))
    .concat(allTags.filter((t) => !tagOrder.includes(t)));
  // Check if any favorites exist
  const hasFavorites = shortcuts.some((s) => s.favorite);
  if (hasFavorites) {
    // "Favoris" button
    const favBtn = document.createElement("span");
    favBtn.className = "tag-filter" + (showOnlyFavorites ? " active" : "");
    favBtn.textContent = "⭐ Favoris";
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
  clearBtn.className =
    "tag-filter" +
    (activeTagFilter.length === 0 && !showOnlyFavorites ? " active" : "");
  clearBtn.textContent = "📁 Tous";
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
  tagOrder.forEach((tag) => {
    const btn = document.createElement("span");
    btn.className =
      "tag-filter" + (activeTagFilter.includes(tag) ? " active" : "");
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
      btn.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", tag);
        e.dataTransfer.effectAllowed = "move";
      };
      btn.ondragover = (e) => e.preventDefault();
      btn.ondrop = (e) => {
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
        activeTagFilter = activeTagFilter.filter((t) => t !== tag);
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
  document.querySelectorAll(".tag-filter").forEach((el) => {
    el.classList.remove("and-mode", "or-mode");
    el.classList.add(isAndMode ? "and-mode" : "or-mode");
  });
}

function toggleFavorite(index) {
  shortcuts[index].favorite = !shortcuts[index].favorite;
  saveShortcuts();
  displayShortcuts();
}
