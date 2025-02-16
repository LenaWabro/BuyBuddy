export class ArtikelController {
    constructor(model, artikelView, listView) {
        this.model = model;
        this.artikelView = artikelView;
        this.listView = listView;
        this.setupModalEvents();
        this.setupModalEventsForNewArticle();

    }

    setupModalEventsForNewArticle() {
        const modal = document.getElementById("articleEntryModal");
        if (!modal) return;

        // Fokus nach dem Öffnen des Modals setzen
        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();  // Hier kannst du das gewünschte Element fokussieren
        });

        // Fokus zurücksetzen nach Schließen des Modals
        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("add-article-entry").focus();

            document.getElementById("articleEntryName").value = "";
            document.getElementById("articleEntryTag").value = "";
            document.getElementById("articleEntryDescription").value = "";
            document.getElementById("articleEntryImage").value = "";
        });


        const addBtn = document.getElementById("addArticleEntry");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                const nameInput = document.getElementById("articleEntryName").value;
                const tagInput = document.getElementById("articleEntryTag").value;
                const descriptionInput = document.getElementById("articleEntryDescription").value;
                const imageInput = document.getElementById("articleEntryImage").value;

                // Überprüfe, ob Artikel ausgewählt wurden
                if (nameInput.length === 0 || tagInput.length === 0 || descriptionInput.length === 0) {
                    alert("Bitte gib einen Namen und einen Tag an.");
                    return;
                }
                console.log(tagInput, nameInput, descriptionInput, imageInput);
                const newArticle = {
                    "id": Date.now(),
                    "title": nameInput,
                    "description": descriptionInput,
                    "image": imageInput,
                    "tag": tagInput
                };
                console.log(this.model.items);
                this.model.items.push(newArticle);
                console.log(this.model.items);
                document.dispatchEvent(new Event("dataLoaded"));
            });
        }
    }
    setupModalEvents() {
        const modal = document.getElementById("articleModal");
        if (!modal) return;

        // Fokus nach dem Öffnen des Modals setzen
        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();  // Hier kannst du das gewünschte Element fokussieren
        });

        // Fokus zurücksetzen nach Schließen des Modals
        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("add-list").focus();

            modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            modal.querySelectorAll('input[type="number"]').forEach(input => input.value = "1");

        });

        const addToListBtn = document.getElementById("addToListBtn");
        if (addToListBtn) {
            addToListBtn.addEventListener("click", () => {
                // Alle ausgewählten Artikel und deren Mengen erfassen
                const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
                const selectedItems = [];

                checkboxes.forEach(cb => {
                    const itemId = parseInt(cb.value);
                    const quantityInput = modal.querySelector(`#quantity-${itemId}`);
                    const quantity = parseInt(quantityInput.value);

                    if (!isNaN(quantity) && quantity > 0) {
                        selectedItems.push({id: itemId, quantity});
                    }
                });

                console.log("Ausgewählte Artikel mit Mengen:", selectedItems);

                // Überprüfe, ob Artikel ausgewählt wurden
                if (selectedItems.length === 0) {
                    alert("Bitte wählen Sie Artikel aus und geben Sie eine Menge an.");
                    return;
                }

                // Hole die aktuelle ListId aus dem Detailbereich
                const detailContainer = document.getElementById("detail-container");
                const listId = parseInt(detailContainer.dataset.currentlistid);
                console.log("Aktuelle ListId:", listId);

                // Prüfe, ob die ListId existiert
                const list = this.model.lists.find(l => l.id === listId);
                if (!list) {
                    console.log("Liste nicht gefunden. Available lists:", this.model.lists);
                    alert("Liste nicht gefunden.");
                    return;
                }

                // Füge die ausgewählten Artikel zur Liste hinzu oder erhöhe die Menge
                selectedItems.forEach(item => {
                    const existingItem = list.items.find(i => i.id === item.id);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;  // Menge erhöhen, falls der Artikel schon in der Liste ist
                    } else {
                        const newItem = this.model.items.find(i => i.id === item.id);
                        if (newItem) {
                            list.items.push({...newItem, quantity: item.quantity, checked: false});
                        }
                    }
                });

                // Aktualisiere die Anzeige der Liste
                this.listView.showListDetails(list, this.model.items);

                // Schließe das Modal nach dem Hinzufügen
                //const bootstrapModal = new bootstrap.Modal(modal);
                //bootstrapModal.hide();
            });


        }

    }

}
