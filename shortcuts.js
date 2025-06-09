document.addEventListener("keydown", function(event) {
  

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


  // F2 → Toggle Search Bar
  if (event.code === "F2") {
    event.preventDefault();
    toggleSearchBar();
    showShortcutFeedback("Search Bar (F2)");
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
    showShortcutFeedback("Tags (F8)");
    return;
  }

  // F9 → Toggle Compact Mode
  if (event.code === "F9") {
    event.preventDefault();
    compactMode = !compactMode;
    displayShortcuts();
    showShortcutFeedback("Compact Mode (F9)");
    return;
  }


// Avoid shortcuts while typing in input/textarea or contentEditable
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
    return;
  }

  // E → Toggle Edit Mode
  if (event.key.toLowerCase() === "e") {
    const editToggle = document.getElementById("editToggle");
    if (editToggle) {
      editToggle.checked = !editToggle.checked;
      toggleEditMode();
      showShortcutFeedback("Edit Mode (E)");
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
    showShortcutFeedback("Info Modal (I)");
    return;
  }

  // M → Toggle Tag Filter Mode
  if (event.key.toLowerCase() === "m") {
    const toggle = document.getElementById("tagFilterModeToggle");
    if (toggle) {
      toggle.checked = !toggle.checked;
      displayShortcuts();
      showShortcutFeedback("Tag Filter Mode (M)");
    }
    return;
  }

  // L → Import File Dialog
  if (event.key.toLowerCase() === "l") {
    document.getElementById('importFile').click();
    showShortcutFeedback("Import (L)");
    return;
  }

  // S → Export Shortcuts
  if (event.key.toLowerCase() === "s") {
    exportShortcuts();
    showShortcutFeedback("Export (S)");
    return;
  }

  // N → New List
  if (event.key.toLowerCase() === "n") {
    clearShortcuts();
    showShortcutFeedback("New List (N)");
    return;
  }

  // A → Add Item
  if (event.key.toLowerCase() === "a") {
    openAddModal();
    showShortcutFeedback("Add Item (A)");
    return;
  }

  // T → Toggle Sorting
  if (event.key.toLowerCase() === "t") {
    toggleSorting();
    showShortcutFeedback("Sort (T)");
    return;
  }

  // O → Options Panel
  if (event.key.toLowerCase() === "o") {
    toggleButtonGroup();
    importBtn.focus();
    showShortcutFeedback("Options (O)");
    return;
  }
});
