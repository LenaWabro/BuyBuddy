export class TagView {
    constructor(model) {
        this.model = model; // Speichert das Model, um auf die Tags zuzugreifen
    }

    /**
     * Aktualisiert die Dropdown-Menüs, in denen Tags ausgewählt werden können.
     * Diese Dropdowns befinden sich in verschiedenen Bereichen der Anwendung,
     * z. B. beim Hinzufügen oder Bearbeiten eines Artikels.
     */
    updateTagDropdowns() {
        // Aktualisiert das Dropdown für die Auswahl eines Tags beim Hinzufügen eines neuen Artikels
        const articleEntryTag = document.getElementById("articleEntryTag");
        if (articleEntryTag) {
            articleEntryTag.innerHTML = `<option value="">Wähle einen Tag</option>`; // Standardoption
            this.model.tags.forEach(tag => {
                articleEntryTag.innerHTML += `<option value="${tag}">${tag}</option>`; // Existierende Tags hinzufügen
            });
            articleEntryTag.innerHTML += `<option value="new">Neuen Tag erstellen...</option>`; // Option zum Erstellen eines neuen Tags
        }

        // Aktualisiert das Dropdown im Bearbeitungsmodus eines Artikels
        const editArticleTag = document.getElementById("editArticleTag");
        if (editArticleTag) {
            editArticleTag.innerHTML = `<option value="">Wähle einen Tag</option>`;
            this.model.tags.forEach(tag => {
                editArticleTag.innerHTML += `<option value="${tag}">${tag}</option>`;
            });
            editArticleTag.innerHTML += `<option value="new">Neuen Tag erstellen...</option>`;
        }

        // Aktualisiert das Dropdown für das Filtern nach Tags in der Artikelübersicht
        const newProductTag = document.getElementById("newProductTag");
        if (newProductTag) {
            newProductTag.innerHTML = `<option value="">Alle anzeigen</option>`; // Standardoption: Zeigt alle Artikel an
            this.model.tags.forEach(tag => {
                newProductTag.innerHTML += `<option value="${tag}">${tag}</option>`; // Existierende Tags hinzufügen
            });
        }
    }

    /**
     * Aktualisiert die Liste der verfügbaren Tags in der Tag-Verwaltung.
     * Jeder Tag wird als Listeneintrag mit einem Lösch-Button dargestellt.
     */
    updateTagList() {
        const tagList = document.getElementById("tagList");
        if (tagList) {
            tagList.innerHTML = ""; // Löscht die aktuelle Liste, um sie neu aufzubauen

            this.model.tags.forEach(tag => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.textContent = tag; // Zeigt den Namen des Tags an

                // Bootstrap-Button für das Löschen des Tags
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn btn-danger btn-sm";
                deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`; // Bootstrap Trash-Icon

                // Event-Listener für das Löschen eines Tags
                deleteBtn.addEventListener("click", () => {
                    document.dispatchEvent(new CustomEvent("deleteTag", { detail: { tagName: tag } }));
                    // Löst ein Event aus, das den TagController benachrichtigt, diesen Tag zu löschen
                });

                li.appendChild(deleteBtn); // Fügt den Button in das Listenelement ein
                tagList.appendChild(li); // Fügt den Listeneintrag zur Tag-Liste hinzu
            });
        }
    }
}
