// inputoutput.js

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
    showToast("Aucun raccourci à exporter.", "info");
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
  showToast("Exportation réussie !", "success");
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

    // 🔐 Ask user for a password
    let password = prompt("Entrez un mot de passe pour l'export (laisser vide pour aucun mot de passe) :");
    if (password === null) {
        showToast("Export annulé.", "error");
        return;
    }

    password = password.trim();
    if (password === "") {
        password = null;
    }

    const data = {
        title,
        shortcuts,
        tagOrder,
        uiToggleState,
        compactMode,
        activeTagFilter,
        appTitleColor: localStorage.getItem("appTitleColor") || null,
        appBackgroundColor: localStorage.getItem("appBackgroundColor") || null,
        showOnlyFavorites,
        leftLogo: localStorage.getItem("leftLogo") || null,
        rightLogo: localStorage.getItem("rightLogo") || null,
        password  // ✅ include password (null or string)
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
    showToast("Exportation réussie !", "success");
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

                if (importedData.appBackgroundColor) {
                   localStorage.setItem("appBackgroundColor", importedData.appBackgroundColor);
                   applyGradientBackground(importedData.appBackgroundColor || "#f9f9f9");
                }

                if (importedData.appTitleColor) {
                   localStorage.setItem("appTitleColor", importedData.appTitleColor);
                   document.getElementById("appTitle").style.color = importedData.appTitleColor;
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


             if (importedData.leftLogo) {
  localStorage.setItem("leftLogo", importedData.leftLogo);
  document.getElementById("leftLogo").src = importedData.leftLogo;
  document.getElementById("leftLogo").style.display = "block";
} else {
  localStorage.removeItem("leftLogo");
  document.getElementById("leftLogo").style.display = "none";
}

if (importedData.rightLogo) {
  localStorage.setItem("rightLogo", importedData.rightLogo);
  document.getElementById("rightLogo").src = importedData.rightLogo;
  document.getElementById("rightLogo").style.display = "block";
} else {
  localStorage.removeItem("rightLogo");
  document.getElementById("rightLogo").style.display = "none";
}



if (importedData.password !== undefined) {
  GLOBAL_PASSWORD = importedData.password || "";
  localStorage.setItem("globalPassword", GLOBAL_PASSWORD);

  if (GLOBAL_PASSWORD) {
    sessionStorage.removeItem("authenticated"); // Require login next time
  }
updateAuthStatusIcon(); // 🔐 Refresh the icon based on new password/auth state
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




loadLogos(); // 🟢 Reload and update logos


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
showToast("Importation réussie !", "success");



        } catch {
            alert("Erreur de lecture du fichier. Veuillez importer un fichier .lst valide.");
        }
    };

    reader.readAsText(file);
}
