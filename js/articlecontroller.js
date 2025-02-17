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

        // Fokus auf den ersten Button setzen, wenn das Modal angezeigt wird
        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();
        });

        // Eingabefelder zurücksetzen, wenn das Modal geschlossen wird
        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("add-article-entry").focus();
            document.getElementById("articleEntryName").value = "";
            document.getElementById("articleEntryTag").value = "";
            document.getElementById("articleEntryDescription").value = "";
            document.getElementById("articleEntryImage").value = "";
        });

        // Klick-Event für den "Eintrag hinzufügen"-Button
        const addBtn = document.getElementById("addArticleEntry");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                const nameInput = document.getElementById("articleEntryName").value;
                const tagInput = document.getElementById("articleEntryTag").value;
                const descriptionInput = document.getElementById("articleEntryDescription").value;
                const imageInput = document.getElementById("articleEntryImage").value;

                // Validierung der Eingabefelder
                if (nameInput.length === 0 || tagInput.length === 0 || descriptionInput.length === 0) {
                    alert("Bitte gib einen Namen und einen Tag an.");
                    return;
                }

                // Neuen Artikel erstellen
                const newArticle = {
                    id: Date.now(),
                    title: nameInput,
                    description: descriptionInput,
                    image: imageInput,
                    tag: tagInput
                };

                // Artikel zum Modell hinzufügen
                this.model.items.push(newArticle);
                // Event auslösen, um die Daten zu aktualisieren
                document.dispatchEvent(new Event("dataLoaded"));
            });
        }
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
