document.addEventListener("keydown", function(event) {
  // F2 → Toggle Search Bar
  if (event.code === "F2") {
    event.preventDefault();
    toggleSearchBar();
    return;
  }
  // Avoid shortcuts while typing in input/textarea or contentEditable
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
    return;
  }
  // E → Toggle edit mode
  if (event.key.toLowerCase() === "e") {
    const editToggle = document.getElementById("editToggle");
    if (editToggle) {
      editToggle.checked = !editToggle.checked;
      toggleEditMode();
    }
    return;
  }
  if (event.key.toLowerCase() === "i") {
    const modal = document.getElementById("infoModal");
    if (modal.style.display === "none" || modal.style.display === "") {
      showInfoModal();
    } else {
      closeInfoModal();
    }
    return;
  }
  if (event.key.toLowerCase() === "m") {
    const toggle = document.getElementById("tagFilterModeToggle");
    if (toggle) {
      toggle.checked = !toggle.checked;
      displayShortcuts(); // re-filter the list
    }
    return;
  }
  // L → Trigger import file dialog
  if (event.key.toLowerCase() === "l") {
    document.getElementById('importFile').click();
    return;
  }
  // S → Export
  if (event.key.toLowerCase() === "s") {
    exportShortcuts();
    return;
  }
  // N → New list
  if (event.key.toLowerCase() === "n") {
    clearShortcuts();
    return;
  }
  // A → Add item
  if (event.key.toLowerCase() === "a") {
    openAddModal();
    return;
  }
  // T → Sort
  if (event.key.toLowerCase() === "t") {
    toggleSorting();
    return;
  }
  // O → Options panel
  if (event.key.toLowerCase() === "o") {
    toggleButtonGroup();
    importBtn.focus();
    return;
  }
});