
        let activeTagFilter = [];
        
        
        let shortcuts = [];
          let alphabeticalSorting = false;
          let manualOrder = [];
          let editMode = false;
        
          function escapeHTML(str) {
            return str.replace(/[&<>"']/g, (m) => ({
              '&': '&amp;', '<': '&lt;', '>': '&gt;',
              '"': '&quot;', "'": '&#039;'
            }[m]));
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
    icon.classList.remove("fa-solid", "fa-magnifying-glass");
    icon.classList.add("fa-solid", "fa-chevron-up");
    searchInput.focus();  // <-- focus here
  } else {
    searchInput.value = "";
    clearBtn.style.display = "none";
    handleSearchInput();
    searchContainer.style.display = "none";
    icon.classList.remove("fa-solid", "fa-chevron-up");
    icon.classList.add("fa-solid", "fa-magnifying-glass");
  }
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
          group.classList.toggle("hidden");
          group.classList.toggle("visible");
        
          // Optionally change the icon/text on the toggle button
          const toggleBtn = document.getElementById("toggleBtnGroup");
          if (group.classList.contains("hidden")) {
            toggleBtn.innerHTML = '<i class="fas fa-cog"></i>';
          } else {
            toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
          }
        }
        
          function loadShortcuts() {
            const savedData = localStorage.getItem("shortcuts");
            const savedOrder = localStorage.getItem("manualOrder");
const savedTagOrder = localStorage.getItem("tagOrder");
tagOrder = savedTagOrder ? JSON.parse(savedTagOrder) : [];
            shortcuts = savedData ? JSON.parse(savedData) : [];
            manualOrder = savedOrder ? JSON.parse(savedOrder) : [...shortcuts];
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
        
          document.getElementById("sortStatus").textContent =
            alphabeticalSorting ? "Tri: Alphabétique" : "Tri: Manuel";
        
          displayShortcuts();
        }
        

          function toggleEditMode() {
            editMode = document.getElementById("editToggle").checked;
            document.getElementById("editStatus").textContent =
              `Mode édition: ${editMode ? 'Oui' : 'Non'}`;
            displayShortcuts();
          }
        
        function getTagColor(tag) {
          const colors = [
            "#007bff", "#28a745", "#ffc107", "#dc3545",
            "#17a2b8", "#6610f2", "#fd7e14", "#6f42c1",
            "#20c997", "#e83e8c"
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
  return text && text.trim() !== "" 
    ? text.trim() 
    : "Aucune info disponible.";
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
      return useAndMode
        ? activeTagFilter.every(tag => shortcutTags.includes(tag))
        : activeTagFilter.some(tag => shortcutTags.includes(tag));
    });
  }

  if (searchTerm) {
    list = list.filter(shortcut => {
      return shortcut.name.toLowerCase().includes(searchTerm) ||
             shortcut.url.toLowerCase().includes(searchTerm) ||
             (shortcut.tooltip && shortcut.tooltip.toLowerCase().includes(searchTerm)) ||
             (shortcut.info && shortcut.info.toLowerCase().includes(searchTerm));
    });
  }

  document.getElementById("filterModeLabel").textContent =
    document.getElementById("tagFilterModeToggle").checked ? "ET" : "OU";

  list.forEach((shortcut) => {
    const trueIndex = shortcuts.indexOf(shortcut);
    const tagsHTML = (shortcut.tags || [])
      .sort((a, b) => a.localeCompare(b))
      .map(tag => `<span class="tag" style="background-color:${getTagColor(tag)}">${escapeHTML(tag)}</span>`)
      .join(" ");

    const shortcutElement = document.createElement("div");
    shortcutElement.className = "shortcut";
    shortcutElement.setAttribute("title", escapeHTML(getTooltipText(shortcut.tooltip)));
    shortcutElement.setAttribute("data-index", trueIndex);
    shortcutElement.style.cursor = editMode ? 'default' : 'pointer';

    if (!alphabeticalSorting && editMode) {
      shortcutElement.setAttribute("draggable", "true");
      shortcutElement.setAttribute("ondragstart", "drag(event)");
    }

    let holdTimer;
    let heldTriggered = false;
    let justTouched = false;

    // --- CONTEXT MENU ---
    shortcutElement.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // --- MOUSE SUPPORT ---
    shortcutElement.addEventListener("mousedown", (e) => {
      if (!editMode) {
        if (e.button === 0) {
          heldTriggered = false;
          holdTimer = setTimeout(() => {
            heldTriggered = true;
            showTooltipModal(shortcut.tooltip || "Aucune info disponible.");
          }, 1000);
        } else if (e.button === 2) {
          navigator.clipboard.writeText(shortcut.url).then(() => {
            shortcutElement.style.backgroundColor = "#d4edda";
            setTimeout(() => {
              shortcutElement.style.backgroundColor = "";
            }, 800);
            showCopyToast();
          });
        }
      }
    });

    shortcutElement.addEventListener("mouseup", (e) => {
      clearTimeout(holdTimer);
      if (e.button === 0 && !heldTriggered && !editMode) {
        window.open(shortcut.url, "_blank");
      }
    });

    shortcutElement.addEventListener("mouseleave", () => {
      clearTimeout(holdTimer);
    });

    // --- TOUCH SUPPORT ---
    shortcutElement.addEventListener("touchstart", () => {
      if (!editMode) {
        heldTriggered = false;
        holdTimer = setTimeout(() => {
          heldTriggered = true;
          showTooltipModal(shortcut.tooltip || "Aucune info disponible.");
          navigator.clipboard.writeText(shortcut.url).then(() => {
            showCopyToast();
            shortcutElement.style.backgroundColor = "#d4edda";
            setTimeout(() => {
              shortcutElement.style.backgroundColor = "";
            }, 800);
          });
        }, 1000);
      }
    });

    shortcutElement.addEventListener("touchend", (e) => {
      clearTimeout(holdTimer);
      if (!heldTriggered && !editMode) {
        e.preventDefault();
        justTouched = true;
        setTimeout(() => justTouched = false, 300);
        window.open(shortcut.url, "_blank");
      }
    });

    shortcutElement.addEventListener("touchmove", () => {
      clearTimeout(holdTimer);
    });

    // Prevent click firing after touch
    shortcutElement.addEventListener("click", (e) => {
      if (justTouched) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // --- HTML CONTENT ---
    shortcutElement.innerHTML = `
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
  document.getElementById("shortcutCount").textContent =
    `Affichés: ${list.length} / Total: ${shortcuts.length}`;
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
    if (tagOrder.length === 0) tagOrder = [...allTags];
    else tagOrder = tagOrder.filter(t => allTags.includes(t)).concat(allTags.filter(t => !tagOrder.includes(t)));

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

      const moveIcon = document.createElement("i");
      moveIcon.className = "fas fa-arrows-alt";
      moveIcon.style.color = "#999";
      moveIcon.style.cursor = "grab";
      moveIcon.style.display = editMode ? "inline-block" : "none";

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
        btn.ondragstart = null;
        btn.ondragover = null;
        btn.ondrop = null;
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
  document.getElementById("tooltipContent").textContent = text || "Aucune info disponible.";
  document.getElementById("tooltipModal").style.display = "flex";
}

function closeTooltipModal() {
  document.getElementById("tooltipModal").style.display = "none";
}


        
       
function openAddModal() {
  // Clear all fields
  document.getElementById("editName").value = "";
  document.getElementById("editUrl").value = "";
  document.getElementById("editTags").value = "";
  document.getElementById("editTooltip").value = "";
  document.getElementById("editInfo").value = "";
  document.getElementById('editTagsInput').value = '';

selectedTags = []; // reset
populateTagSuggestions(); // get latest list
renderSelectedTags();     // show nothing initially


  // Reset index to indicate "new" shortcut
  editIndex = null;

  // Set modal title
  document.querySelector("#editModal h3").textContent = "Ajouter un nouveau raccourci";

  // Set up confirmation button
  const confirmBtn = document.getElementById("confirmBtn");
  confirmBtn.textContent = "✅ Ajouter";
  confirmBtn.onclick = confirmAdd;

  // Show modal
  document.getElementById("editModal").style.display = "flex";
}


function confirmAdd() {
  const name = document.getElementById("editName").value.trim();
  const url = document.getElementById("editUrl").value.trim();
  const tags = document.getElementById("editTags").value.split(",").map(t => t.trim()).filter(Boolean);
  const tooltip = document.getElementById("editTooltip").value.trim();
  const info = document.getElementById("editInfo").value.trim();

  if (name && url) {
    const newShortcut = { name, url, tags, tooltip, info };

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
  document.getElementById("editTooltip").value = shortcut.tooltip || "";
  document.getElementById("editInfo").value = shortcut.info || "";
  document.getElementById('editTagsInput').value = '';

  // Prepare tags
  selectedTags = [...(shortcut.tags || [])];
  populateTagSuggestions();  // Get updated list of all tags
  renderSelectedTags();      // Display current tags in chip format

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
  const tooltip = document.getElementById("editTooltip").value.trim();
  const info = document.getElementById("editInfo").value.trim();

  if (name && url && editIndex !== null) {
    shortcuts[editIndex] = { name, url, tags, tooltip, info };

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
  const timestamp = now.toLocaleString('sv-SE', { hour12: false }).replace(' ', '_').replace(/:/g, '-');
  const filename = `${sanitizedTitle || "shortcuts"}_${timestamp}.json`;

  const data = {
    title: title,
    shortcuts: shortcuts,
    tagOrder: tagOrder
  };

  const dataStr = JSON.stringify(data, null, 4);
  const blob = new Blob([dataStr], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();

  // ✅ Show and save the last export filename
  localStorage.setItem("lastExportFilename", filename);

setExportNeeded(false);

updateLastExportDisplay(); 
  
} 

function importShortcuts(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);

      if (Array.isArray(importedData)) {
        // Old format: just shortcuts
        shortcuts = importedData;
      } else if (importedData.shortcuts && Array.isArray(importedData.shortcuts)) {
        // New format: contains title and shortcuts
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
        alert("Invalid JSON format.");
        return;
      }

      saveShortcuts();
      displayShortcuts();
setExportNeeded(false);
    } catch {
      alert("Error reading file. Please upload a valid JSON.");
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
        
        window.onload = function() {
          document.getElementById("buttonGroupWrapper").classList.add("hidden");  
          loadShortcuts();
          const savedTitle = localStorage.getItem("appTitle");
          if (savedTitle) {
            document.getElementById("appTitle").textContent = savedTitle;
          }
updateLastExportDisplay(); 

  // ✅ Force green dot
  isExportNeeded = false;
  updateExportStatusDot();

 };