function showShortcutFeedback(keyLabel) {
  const feedback = document.createElement("div");
  feedback.className = "shortcut-feedback";
  feedback.textContent = keyLabel;
  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.classList.add("fade-out");
    setTimeout(() => feedback.remove(), 500);
  }, 1000);
}


document.addEventListener("keydown", function(event) {
  




  // F2 → Toggle Search Bar
if (event.code === "F2") {
  event.preventDefault();
  toggleSearchBar();
  saveUIState();                        // ✅ Persist
  setExportNeeded(true);               // ✅ Export tracking
  showShortcutFeedback("Bar recherche (F2)");
  return;
}

// F4 → Toggle Option
if (event.code === "F4") {
  event.preventDefault();
  toggleButtonGroup();
  importBtn.focus();
  showShortcutFeedback("Options (F4)");
  return;
}

// F8 → Toggle Tags
if (event.code === "F8") {
  event.preventDefault();
  toggleTags();
  saveUIState();                        // ✅ Persist
  setExportNeeded(true);               // ✅ Export tracking
  showShortcutFeedback("Cacher étiquettes (F8)");
  return;
}

// F9 → Toggle Compact Mode
if (event.code === "F9") {
  event.preventDefault();
  compactMode = !compactMode;
  localStorage.setItem("compactMode", compactMode); // ✅ Persist
  setExportNeeded(true);                             // ✅ Export tracking
  displayShortcuts();
  showShortcutFeedback("Mode compact (F9)");
  return;
}



// Avoid shortcuts while typing in input/textarea or contentEditable
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
    return;
  }


if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "r") {
    event.preventDefault();
    if (confirm("Voulez vous vraiment réinitialiser la page ?")) {
        localStorage.clear();
        showShortcutFeedback("LocalStorage Reset (Ctrl + Shift + R)");
        location.reload();
    }
    return;
}




  // E → Toggle Edit Mode
  if (event.key.toLowerCase() === "e") {
    const editToggle = document.getElementById("editToggle");
    if (editToggle) {
      editToggle.checked = !editToggle.checked;
      toggleEditMode();
      showShortcutFeedback("Mode édition (E)");
    }
    return;
  }

  // I → Toggle Info Modal
  if (event.key.toLowerCase() === "i") {
    const modal = document.getElementById("infoModal");
    if (modal.style.display === "none" || modal.style.display === "") {
      showInfoModal();
    } else {
      closeInfoModal();
    }
    showShortcutFeedback("Info aide (I)");
    return;
  }

  // M → Toggle Tag Filter Mode
  if (event.key.toLowerCase() === "m") {
    const toggle = document.getElementById("tagFilterModeToggle");
    if (toggle) {
      toggle.checked = !toggle.checked;
      displayShortcuts();
      showShortcutFeedback("Mode A/O étiquette (M)");
    }
    return;
  }

  // L → Import File Dialog
  if (event.key.toLowerCase() === "l") {
    document.getElementById('importFile').click();
    showShortcutFeedback("Charger liste (L)");
    return;
  }

  // S → Export Shortcuts
  if (event.key.toLowerCase() === "s") {
    exportShortcuts();
    showShortcutFeedback("Sauvegarder liste (S)");
    return;
  }

// V → Export Shortcuts visible
  if (event.key.toLowerCase() === "v") {
    exportVisibleShortcutsAsText();
    showShortcutFeedback("Exporter raccourcis visibles (V)");
    return;
  }


  // N → New List
  if (event.key.toLowerCase() === "n") {
    clearShortcuts();
    showShortcutFeedback("Nouvelle liste (N)");
    return;
  }

  // A → Add Item
  if (event.key.toLowerCase() === "a") {
    openAddModal();
    showShortcutFeedback("Ajouter (A)");
    return;
  }

  // T → Toggle Sorting
  if (event.key.toLowerCase() === "t") {
    toggleSorting();
    showShortcutFeedback("Mode tri (T)");
    return;
  }

  
});
