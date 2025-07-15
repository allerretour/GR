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
  

// 🎨 Shift + F1 → pick title color
  if (event.code === "F1" && event.shiftKey) {
    event.preventDefault();
    hideOptionsAndScrollTop();
    openAppTitleColorPicker();
    showShortcutFeedback("Couleur de titre (Maj+F1)");
    return;
  }

  // 🎨 Alt + F1 → reset title color
  if (event.code === "F1" && event.altKey) {
    event.preventDefault();
    const titleEl = document.getElementById("appTitle");
    if (titleEl) {
      titleEl.style.color = "#000000";
      localStorage.setItem("appTitleColor", "#000000");
      showToast("🎨 Titre réinitialisé en noir");
    }
    return;
  }

  // 🎨 Shift + F2 → pick background color
  if (event.code === "F2" && event.shiftKey) {
    event.preventDefault();
    hideOptionsAndScrollTop();
    openBackgroundColorPicker();
    showShortcutFeedback("Couleur de fond (Maj+F2)");
    return;
  }

  if ((event.code === "F2" || event.key === "F2") && event.altKey) {
  event.preventDefault();
  const defaultBg = "#f9f9f9";
  localStorage.setItem("appBackgroundColor", defaultBg);
  applyGradientBackground(defaultBg); // 🔁 regenerate the gradient
  showToast("🖼️ Fond réinitialisé");
  return;
}


  // 🔍 F2 → toggle search bar (only if no modifier key)
  if (event.code === "F2" && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    toggleSearchBar();
    saveUIState();
    setExportNeeded(true);
    showShortcutFeedback("Bar recherche (F2)");
    return;
  }


// F3 → open visible
if (event.code === "F3") {
  event.preventDefault();
  openVisibleShortcutsInTabs();
  showShortcutFeedback("Ouvrir raccourcis (F3)");
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
    openExportFormatModal();
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
