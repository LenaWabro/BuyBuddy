export class ArtikelController {
    constructor(model, artikelView, listView) {
        this.model = model;
        this.artikelView = artikelView;
        this.listView = listView;
        this.selectedItems = {}; // Speichert die ausgewählten Artikel (ID: Menge)
        // Initialisiert alle Events
        this.setupModalEvents();
        this.setupModalEventsForNewArticle();
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
            addBtn.addEventListener("click", () => {
                const nameInput = document.getElementById("articleEntryName").value.trim();
                const tagInput = document.getElementById("articleEntryTag").value;
                const descriptionInput = document.getElementById("articleEntryDescription").value.trim();
                const imageInput = document.getElementById("articleEntryImage").value.trim();

                if (!nameInput || !tagInput || !descriptionInput) {
                    alert("Bitte gib einen Namen, eine Beschreibung und einen Tag an.");
                    return;
                }

                // Neues Artikelobjekt mit EINEM Tag
                const newArticle = {
                    id: Date.now(),
                    title: nameInput,
                    description: descriptionInput,
                    image: imageInput,
                    tag: tagInput
                };

                // Artikel dem Model hinzufügen
                this.model.addArticle(newArticle);

                // Daten-Event auslösen
                document.dispatchEvent(new Event("dataLoaded"));

                // Gesamte Artikelübersicht aktualisieren
                this.showAllArticles();
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
            addToListBtn.addEventListener("click", () => {
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
                    return;
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
