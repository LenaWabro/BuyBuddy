export class ArtikelController {
    constructor(model, artikelView, listView) {
        this.model = model;
        this.artikelView = artikelView;
        this.listView = listView;
        this.selectedItems = {}; // Speichert die ausgewählten Artikel (ID: Menge)
        this.setupModalEvents(); // Initialisiert alle Events für das Artikelmodal
        this.setupModalEventsForNewArticle(); // Initialisiert die Events für das Modal zur Neuanlage eines Artikels
    }

    /**
     * setupModalEventsForNewArticle()
     * Konfiguriert die Events für das Modal, in dem neue Artikel angelegt werden.
     */
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

        // Event für Dropdown-Änderungen
        tagSelect.addEventListener("change", () => {
            if (tagSelect.value === "new") {
                newTagContainer.style.display = "block";
                newTagInput.focus();
            } else {
                newTagContainer.style.display = "none";
            }
        });

        confirmNewTagBtn.addEventListener("click", () => {
            const newTag = newTagInput.value.trim();
            if (newTag) {
                // Neues option-Element anlegen
                const newOption = document.createElement("option");
                newOption.value = newTag;
                newOption.textContent = newTag;

                // Passende Stelle im Dropdown finden
                const newTagOption = tagSelect.querySelector('option[value="new"]');
                // Vor der "Neuen Tag erstellen"-Option einfügen
                tagSelect.insertBefore(newOption, newTagOption);
                // Direkt den neuen Tag auswählen
                tagSelect.value = newTag;

                // Dasselbe ggf. für den Filter-Dropdown machen
                const filterOption = document.createElement("option");
                filterOption.value = newTag;
                filterOption.textContent = newTag;
                const filterNewTagOption = filterDropdown.querySelector('option[value="new"]');
                filterDropdown.insertBefore(filterOption, filterNewTagOption);

                // Input-Feld und Container zurücksetzen
                newTagInput.value = "";
                newTagContainer.style.display = "none";

                // Liste nach neuem Tag filtern
                this.filterArticlesByTag(newTag);
            }
        });


        // Klick-Event für den "Eintrag hinzufügen"-Button
        const addBtn = document.getElementById("addArticleEntry");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                const nameInput = document.getElementById("articleEntryName").value.trim();
                const tagInput = tagSelect.value;
                const descriptionInput = document.getElementById("articleEntryDescription").value.trim();
                const imageInput = document.getElementById("articleEntryImage").value.trim();

                if (!nameInput || !tagInput || !descriptionInput) {
                    alert("Bitte gib einen Namen, eine Beschreibung und einen Tag an.");
                    return;
                }

                const newArticle = {
                    id: Date.now(),
                    title: nameInput,
                    description: descriptionInput,
                    image: imageInput,
                    tag: tagInput
                };

                // neu hinzugefügten Artikel ganz oben hinzufügen
                this.model.items.unshift(newArticle);


                // Artikelübersicht aktualisieren
                document.dispatchEvent(new Event("dataLoaded"));

                // Gesamte Artikelübersicht aktualisieren
                this.showAllArticles();
            });

        }
    }

    /**
     * Zeigt alle Artikel in der Ansicht an.
     */
    showAllArticles() {
        this.artikelView.renderItemsInModal(this.model.items);
    }



    /**
     * setupModalEvents()
     * Konfiguriert die Events für das Modal, in dem Artikel zu einer Liste hinzugefügt werden.
     */
    setupModalEvents() {
        const modal = document.getElementById("articleModal");
        if (!modal) return;

        // Fokus setzen, wenn das Modal angezeigt wird
        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();
        });

        // Wenn das Modal geschlossen wird, alle Eingaben zurücksetzen
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

            // WICHTIG: Zuerst die gespeicherte Auswahl leeren, bevor die Liste neu gerendert wird
            this.selectedItems = {};

            // Erneut rendern – jetzt sind alle Mengen auf Standard (1)
            this.filterArticlesByTag('');
        });

        // Klick-Event für den Button "Zur Liste hinzufügen"
        const addToListBtn = document.getElementById("addToListBtn");
        if (addToListBtn) {
            addToListBtn.addEventListener("click", () => {
                const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
                const selectedItems = [];

                // Für jeden ausgewählten Artikel Menge ermitteln
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
                const list = this.model.lists.find(l => l.id === listId);

                if (!list) {
                    alert("Liste nicht gefunden.");
                    return;
                }

                // Artikel der Liste hinzufügen oder vorhandene Mengen erhöhen
                selectedItems.forEach(item => {
                    const existingItem = list.items.find(i => i.id === item.id);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                    } else {
                        const newItem = this.model.items.find(i => i.id === item.id);
                        if (newItem) {
                            list.items.push({ ...newItem, quantity: item.quantity, checked: false });
                        }
                    }
                });

                // Aktualisierte Liste anzeigen
                this.listView.showListDetails(list, this.model.items);
            });
        }

        // Event für das Dropdown zum Filtern nach Tag
        const tagSelect = modal.querySelector('#newProductTag');
        if (tagSelect) {
            tagSelect.addEventListener('change', (event) => {
                this.filterArticlesByTag(event.target.value);
            });
        }

        /**
         * filterArticlesByTag(tag)
         * Rendert die Artikelliste basierend auf dem gewählten Tag.
         */
        this.filterArticlesByTag = (tag) => {
            const articleList = modal.querySelector('#articleList');
            articleList.innerHTML = ''; // Alte Inhalte löschen

            // Artikel filtern (wenn kein Tag, dann alle anzeigen)
            const filteredItems = this.model.items.filter(item => !tag || item.tag === tag);

            filteredItems.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'align-items-center');

                // Wird hier anhand von selectedItems entweder der gespeicherte Wert oder 1 verwendet
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

                // Event, um die Menge zu speichern, wenn sie geändert wird
                const quantityInput = modal.querySelector(`#quantity-${item.id}`);
                quantityInput.addEventListener('change', (event) => {
                    this.selectedItems[item.id] = parseInt(event.target.value);
                });

                // Event, um den Checkbox-Status zu speichern
                const checkbox = modal.querySelector(`#item-${item.id}`);
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

    /**
     * restoreSelectedItems(modal)
     * Stellt sicher, dass die Checkboxen den ausgewählten Artikeln entsprechen.
     * (Wird hier nicht mehr verwendet, da beim Schließen das Modal vollständig zurückgesetzt wird.)
     */
    restoreSelectedItems(modal) {
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            const itemId = parseInt(cb.value);
            cb.checked = !!this.selectedItems[itemId];
        });
    }
}
