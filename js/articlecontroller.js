export class ArtikelController {
    constructor(model, artikelView, listView) {
        this.model = model;
        this.artikelView = artikelView;
        this.listView = listView;
        this.selectedItems = {}; // Speichert die ausgewählten Artikel (ID: Menge)
        // Initialisiert alle Events
        this.setupModalEvents();
        this.setupModalEventsForNewArticle();
        this.setupArticleEditAndDeleteEvents(); // Neu: Event Delegation für Edit & Delete
        this.setupEditArticleSave();
    }

    setupArticleEditAndDeleteEvents() {
        const articleList = document.getElementById("articleList");
        if (!articleList) return;

        articleList.addEventListener("click", (event) => {
            const editBtn = event.target.closest(".edit-article");
            if (editBtn) {
                const articleId = parseInt(editBtn.getAttribute("data-id"));
                this.openEditArticleModal(articleId);
            }
            const deleteBtn = event.target.closest(".delete-article");
            if (deleteBtn) {
                const articleId = parseInt(deleteBtn.getAttribute("data-id"));
                this.deleteArticleWithConfirmation(articleId);
            }
        });
    }

    openEditArticleModal(articleId) {
        const article = this.model.getItems().find(item => item.id === articleId);
        if (!article) return;
        // Vorbefüllung der Edit-Felder
        document.getElementById("editArticleId").value = article.id;
        document.getElementById("editArticleName").value = article.title;
        document.getElementById("editArticleDescription").value = article.description;
        document.getElementById("editArticleImage").value = article.image;
        const preview = document.getElementById("editArticleImagePreview");
        preview.src = article.image;
        preview.style.display = article.image ? "block" : "none";
        document.getElementById("editArticleTag").value = article.tag;
        document.getElementById("editNewTagContainer").style.display = "none";

        // Öffnen des Edit-Modals
        const modalEl = document.getElementById("articleEditModal");
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }

    deleteArticleWithConfirmation(articleId) {
        // Prüfen, ob der Artikel in irgendeiner Liste verwendet wird
        const isUsed = this.model.lists.some(list => list.items.some(item => item.id === articleId));
        if (isUsed) {
            alert("Dieser Artikel wird noch in einer Liste verwendet und kann daher nicht gelöscht werden.");
            return;
        }
        if (confirm("Möchtest du diesen Artikel wirklich löschen?")) {
            this.model.deleteArticle(articleId);
            this.artikelView.renderItemsInModal(this.model.getItems());
        }
    }

    // Eventlistener für den "Speichern"-Button im Edit-Modal
    setupEditArticleSave() {
        // Eventlistener für den "Neuen Tag bestätigen"-Button im Bearbeitungsmodal
        const confirmEditNewTagBtn = document.getElementById("confirmEditNewTag");
        const editNewTagInput = document.getElementById("editNewTagInput");
        if (confirmEditNewTagBtn) {
            confirmEditNewTagBtn.addEventListener("click", () => {
                const newTag = editNewTagInput.value.trim();
                if (!newTag) {
                    alert("Bitte neuen Tag eingeben.");
                    return;
                }
                // Neuen Tag im Model anlegen
                this.model.addTag(newTag);

                // Neuen Option-Element im Select hinzufügen
                const editArticleTagSelect = document.getElementById("editArticleTag");
                const newOption = document.createElement("option");
                newOption.value = newTag;
                newOption.textContent = newTag;
                // Füge den neuen Tag vor der "new"-Option ein
                const newTagOption = editArticleTagSelect.querySelector('option[value="new"]');
                editArticleTagSelect.insertBefore(newOption, newTagOption);
                // Setze den Select-Wert auf den neuen Tag
                editArticleTagSelect.value = newTag;

                // Eingabefeld zurücksetzen und Container ausblenden
                editNewTagInput.value = "";
                document.getElementById("editNewTagContainer").style.display = "none";
            });
        }

        const saveEditArticleBtn = document.getElementById("saveEditArticle");
        saveEditArticleBtn.addEventListener("click", () => {
            const id = parseInt(document.getElementById("editArticleId").value);
            const title = document.getElementById("editArticleName").value.trim();
            const description = document.getElementById("editArticleDescription").value.trim();
            const image = document.getElementById("editArticleImage").value.trim();
            let tag = document.getElementById("editArticleTag").value;
            if (tag === "new") {
                const newTag = document.getElementById("editNewTagInput").value.trim();
                if (!newTag) {
                    alert("Bitte neuen Tag eingeben.");
                    return;
                }
                tag = newTag;
                this.model.addTag(newTag);
            }
            if (!title || !description || !image || !tag) {
                alert("Bitte alle Felder ausfüllen.");
                return;
            }
            const updatedArticle = { id, title, description, image, tag };
            this.model.updateArticle(updatedArticle);
            this.artikelView.renderItemsInModal(this.model.getItems());
            const modalEl = document.getElementById("articleEditModal");
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();
        });

        // Zeige/neuer Tag-Eingabebereich im Edit-Modal
        const editArticleTagSelect = document.getElementById("editArticleTag");
        editArticleTagSelect.addEventListener("change", () => {
            if (editArticleTagSelect.value === "new") {
                document.getElementById("editNewTagContainer").style.display = "block";
                document.getElementById("editNewTagInput").focus();
            } else {
                document.getElementById("editNewTagContainer").style.display = "none";
            }
        });
    }





    setupModalEventsForNewArticle() {
        const modal = document.getElementById("articleEntryModal");
        if (!modal) return;

        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();
        });

        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("add-article-entry").focus();
            document.getElementById("articleEntryName").value = "";
            document.getElementById("articleEntryTag").value = "";
            document.getElementById("articleEntryDescription").value = "";
            document.getElementById("articleEntryImage").value = "";
            document.getElementById("newTagContainer").style.display = "none"; // Eingabefeld für neuen Tag verstecken
        });

        // Elemente für das Tag-Dropdown und die neue Tag-Eingabe
        const tagSelect = document.getElementById("articleEntryTag");
        const filterDropdown = document.getElementById("newProductTag");
        const newTagContainer = document.getElementById("newTagContainer");
        const newTagInput = document.getElementById("newTagInput");
        const confirmNewTagBtn = document.getElementById("confirmNewTag");

        // Wenn der Benutzer "Neuen Tag" auswählt
        tagSelect.addEventListener("change", () => {
            if (tagSelect.value === "new") {
                newTagContainer.style.display = "block";
                newTagInput.focus();
            } else {
                newTagContainer.style.display = "none";
            }
        });

        // Bestätigen eines neuen Tags
        confirmNewTagBtn.addEventListener("click", () => {
            const newTag = newTagInput.value.trim();
            if (newTag) {
                // Tag im Model anlegen
                this.model.addTag(newTag);

                // Tag im Dropdown sichtbar machen
                const newOption = document.createElement("option");
                newOption.value = newTag;
                newOption.textContent = newTag;
                const newTagOption = tagSelect.querySelector('option[value="new"]');
                tagSelect.insertBefore(newOption, newTagOption);
                tagSelect.value = newTag;

                // Dasselbe für den Filter-Dropdown
                const filterOption = document.createElement("option");
                filterOption.value = newTag;
                filterOption.textContent = newTag;
                const filterNewTagOption = filterDropdown.querySelector('option[value="new"]');
                filterDropdown.insertBefore(filterOption, filterNewTagOption);

                // Eingabefeld zurücksetzen
                newTagInput.value = "";
                newTagContainer.style.display = "none";

                // Gleich nach dem neuen Tag filtern
                this.filterArticlesByTag(newTag);
            }
        });

        // Klick-Event für den "Eintrag hinzufügen"-Button
        const addBtn = document.getElementById("addArticleEntry");
        if (addBtn) {
            // Entferne den automatischen Schließmechanismus, falls er im HTML gesetzt wurde
            addBtn.removeAttribute("data-bs-dismiss");

            addBtn.addEventListener("click", (event) => {
                // Eingabefelder auslesen
                const nameInput = document.getElementById("articleEntryName").value.trim();
                const tagInput = document.getElementById("articleEntryTag").value;
                const descriptionInput = document.getElementById("articleEntryDescription").value.trim();
                const imageInput = document.getElementById("articleEntryImage").value.trim();
                const newTagInput = document.getElementById("newTagInput").value.trim();

                // Validierung der Eingaben
                if (!nameInput) {
                    alert("Bitte Namen eingeben.");
                    return; // Modal bleibt offen
                }
                if (!tagInput) {
                    alert("Bitte Tag auswählen.");
                    return;
                }
                // Falls "Neuen Tag erstellen..." gewählt wurde, muss ein neuer Tag-Titel eingegeben werden.
                if (tagInput === "new" && !newTagInput) {
                    alert("Falls gewünschter Tag nicht gefunden, neuen Tag Titel bitte eingeben.");
                    return;
                }
                if (!descriptionInput) {
                    alert("Bitte Beschreibung eingeben.");
                    return;
                }
                if (!imageInput) {
                    alert("Bitte Bild auswählen.");
                    return;
                }

                // Falls Validierung erfolgreich – ggf. neuen Tag verwenden
                const finalTag = tagInput === "new" ? newTagInput : tagInput;

                // Neues Artikelobjekt erstellen
                const newArticle = {
                    id: Date.now(),
                    title: nameInput,
                    description: descriptionInput,
                    image: imageInput,
                    tag: finalTag
                };

                // Artikel dem Model hinzufügen
                this.model.addArticle(newArticle);

                // Daten-Event auslösen
                document.dispatchEvent(new Event("dataLoaded"));

                // Gesamte Artikelübersicht aktualisieren
                this.showAllArticles();

                // Modal manuell schließen (Hole die Bootstrap-Instanz und schließe das Modal)
                const modal = document.getElementById("articleEntryModal");
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
                // Artikelübersichtsmodal automatisch öffnen
                const overviewModalElement = document.getElementById("articleModal");
                const overviewModalInstance = new bootstrap.Modal(overviewModalElement);
                overviewModalInstance.show();
            });

        }
    }

    showAllArticles() {
        const items = this.model.getItems();
        this.artikelView.renderItemsInModal(items);
    }

    setupModalEvents() {
        const modal = document.getElementById("articleModal");
        if (!modal) return;

        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();
        });

        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("add-list").focus();
            // Alle Checkboxen deaktivieren
            modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            // Alle Mengenfelder auf "1" zurücksetzen
            modal.querySelectorAll('input[type="number"]').forEach(input => input.value = "1");

            // Tag-Filter zurücksetzen
            const tagSelect = modal.querySelector('#newProductTag');
            if (tagSelect) {
                tagSelect.value = '';
            }

            // Auswahl leeren
            this.selectedItems = {};

            // Erneut alle Artikel anzeigen
            this.filterArticlesByTag('');
        });

        // Klick-Event: Artikel zur Liste hinzufügen
        const addToListBtn = document.getElementById("addToListBtn");
        if (addToListBtn) {
            // Entferne das automatische Schließen, falls im HTML gesetzt
            addToListBtn.removeAttribute("data-bs-dismiss");

            addToListBtn.addEventListener("click", (event) => {
                event.preventDefault(); // Standardverhalten verhindern

                const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
                const selectedItems = [];

                checkboxes.forEach(cb => {
                    const itemId = parseInt(cb.value);
                    const quantityInput = modal.querySelector(`#quantity-${itemId}`);
                    const quantity = parseInt(quantityInput.value);

                    if (!isNaN(quantity) && quantity > 0) {
                        selectedItems.push({ id: itemId, quantity });
                    }
                });

                if (selectedItems.length === 0) {
                    alert("Bitte wählen Sie Artikel aus und geben Sie eine Menge an.");
                    return; // Modal bleibt offen
                }

                const detailContainer = document.getElementById("detail-container");
                const listId = parseInt(detailContainer.dataset.currentlistid);
                const list = this.model.getListById(listId);

                if (!list) {
                    alert("Liste nicht gefunden.");
                    return;
                }

                // Artikel hinzufügen / Menge erhöhen
                selectedItems.forEach(item => {
                    const existingItem = list.items.find(i => i.id === item.id);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                        // Wichtige Änderung: Artikel wird bei Mengenänderung wieder enthakt
                        existingItem.checked = false;
                    } else {
                        const newItem = this.model.getItems().find(i => i.id === item.id);
                        if (newItem) {
                            // Neu hinzugefügte Artikel sind immer erstmal enthakt
                            list.items.push({ ...newItem, quantity: item.quantity, checked: false });
                        }
                    }
                });

                // Falls die Liste vorher als abgeschlossen markiert war, jetzt zurücksetzen:
                if (list.completed) {
                    list.completed = false;
                }

                // Liste aktualisieren und View neu rendern
                this.model.updateList(list);
                this.listView.renderLists(this.model.getLists());
                this.listView.showListDetails(list, this.model.getItems());

                // Modal manuell schließen, wenn alles erfolgreich war
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }

        // Tag-Filter im Modal
        const tagSelect = modal.querySelector('#newProductTag');
        if (tagSelect) {
            tagSelect.addEventListener('change', (event) => {
                this.filterArticlesByTag(event.target.value);
            });
        }

        // Filter-Methode für die Artikel im Modal
        this.filterArticlesByTag = (tag) => {
            const articleList = modal.querySelector('#articleList');
            articleList.innerHTML = ''; // Alte Inhalte löschen

            let filteredItems;
            if (!tag) {
                filteredItems = this.model.getItems();
            } else {
                filteredItems = this.model.getItemsByTag(tag);
            }

            filteredItems.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'align-items-center');

                const currentQuantity = this.selectedItems[item.id] || 1;
                const isChecked = !!this.selectedItems[item.id];

                li.innerHTML = `
  <div class="me-2">
      <input type="checkbox" value="${item.id}" id="item-${item.id}"
          ${isChecked ? 'checked' : ''}>
  </div>
  <img src="${item.image}" alt="${item.title}"
       class="img-thumbnail me-2"
       style="max-width: 70px; max-height: 70px;">
  <div class="flex-grow-1">
      <label for="item-${item.id}" class="fw-bold mb-0">${item.title}</label>
      <div class="text-muted">${item.description}</div>
      <small class="text-muted">${item.tag}</small>
  </div>
  <div class="ms-3">
      <input type="number" id="quantity-${item.id}"
             value="${currentQuantity}" min="1"
             class="form-control form-control-sm"
             style="width:60px;">
  </div>
  <div class="ms-3 d-flex flex-column">
      <button class="btn btn-warning btn-sm edit-article mb-1" data-id="${item.id}" title="Artikel bearbeiten">
          <i class="bi bi-pencil"></i>
      </button>
      <button class="btn btn-danger btn-sm delete-article" data-id="${item.id}" title="Artikel löschen">
          <i class="bi bi-trash"></i>
      </button>
  </div>
`;

                articleList.appendChild(li);

                // Menge ändern
                const quantityInput = li.querySelector(`#quantity-${item.id}`);
                quantityInput.addEventListener('change', (event) => {
                    this.selectedItems[item.id] = parseInt(event.target.value);
                });

                // Checkbox-Status
                const checkbox = li.querySelector(`#item-${item.id}`);
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        this.selectedItems[item.id] = parseInt(quantityInput.value);
                    } else {
                        delete this.selectedItems[item.id];
                    }
                });
            });
        };
    }
}