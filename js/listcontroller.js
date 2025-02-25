export class ListController {
    constructor(model, listView) {
        this.model = model;
        this.listView = listView;
        this.setupListEvents();
    }

    setupListEvents() {
        // Öffnen des "Neue Liste erstellen"-Modals
        const addListBtn = document.getElementById("add-list");
        if (addListBtn) {
            addListBtn.addEventListener("click", () => {
                const modalEl = document.getElementById("addListModal");
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
                console.log("Add-List-Modal geöffnet.");
            });
        }

        // Erstellen einer neuen Liste und Schließen des Modals via Bootstrap
        const createListBtn = document.getElementById("createList");
        if (createListBtn) {
            createListBtn.addEventListener("click", () => {
                const nameInput = document.getElementById("newListName");
                const name = nameInput.value.trim();

                if (name) {
                    const newList = {
                        id: Date.now(),
                        name,
                        active: true,
                        items: [],
                        completed: false
                    };

                    this.model.addList(newList);
                    this.listView.renderLists(this.model.getLists());
                    console.log("Neue Liste erstellt:", newList);

                    nameInput.value = "";
                    // Schließen des Modals via Bootstrap
                    const addListModalEl = document.getElementById("addListModal");
                    const addListModalInstance = bootstrap.Modal.getOrCreateInstance(addListModalEl);
                    addListModalInstance.hide();
                }
            });
        }

        // Event Delegation im Listenbereich
        const listContainer = document.getElementById("list-container");
        if (listContainer) {
            listContainer.addEventListener("click", (event) => {
                const target = event.target;

                // Liste als abgeschlossen markieren
                if (target.classList.contains("list-completed")) {
                    const id = parseInt(target.dataset.id);
                    const list = this.model.getListById(id);

                    if (list) {
                        const isChecked = target.checked;
                        list.completed = isChecked;

                        list.items.forEach(item => {
                            item.checked = isChecked;
                        });

                        this.model.updateList(list);
                        this.listView.renderLists(this.model.getLists());
                        console.log("Liste abgeschlossen geändert:", list);
                    }
                }

                // Teilen einer Liste
                if (target.classList.contains("share-list")) {
                    const id = parseInt(target.dataset.id);
                    document.getElementById("shareListId").value = id;

                    const shareModalEl = document.getElementById("shareListModal");
                    const shareModal = bootstrap.Modal.getOrCreateInstance(shareModalEl);
                    shareModal.show();
                    console.log("Share-Modal für Liste ID", id, "geöffnet.");
                }

                // Löschen einer Liste
                const deleteBtn = target.closest('.delete-list');
                if (deleteBtn) {
                    const id = parseInt(deleteBtn.dataset.id);
                    document.getElementById("deleteListId").value = id;
                    const deleteModalEl = document.getElementById("deleteListModal");
                    const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
                    deleteModal.show();
                    console.log("Delete-Modal für Liste ID", id, "geöffnet.");
                }

                // Bearbeiten einer Liste
                const editBtn = target.closest('.edit-list');
                if (editBtn) {
                    const id = parseInt(editBtn.dataset.id);
                    const list = this.model.getListById(id);

                    const editModalEl = document.getElementById('editListModal');
                    const modal = bootstrap.Modal.getOrCreateInstance(editModalEl);
                    document.getElementById('editListId').value = list.id;
                    document.getElementById('editListName').value = list.name;

                    modal.show();
                    console.log("Edit-Modal für Liste geöffnet:", list);

                    const saveBtn = document.getElementById('saveEditList');
                    saveBtn.onclick = () => {
                        const newName = document.getElementById('editListName').value.trim();
                        if (newName !== "") {
                            list.name = newName;
                            this.model.updateList(list);
                            this.listView.renderLists(this.model.getLists());
                            console.log("Liste aktualisiert (Name geändert):", list);

                            // **Hier** prüfen wir, ob diese Liste aktuell in der Detailansicht ist.
                            if (this.listView.detailContainer.dataset.currentlistid === list.id.toString()) {
                                this.listView.showListDetails(list, this.model.getItems());
                            }

                            modal.hide();
                        } else {
                            alert("Bitte einen gültigen Namen eingeben.");
                        }
                    };
                }

                // Anzeigen der Listen-Details
                if (event.target.dataset.id) {
                    const id = parseInt(event.target.dataset.id);
                    const list = this.model.getListById(id);
                    console.log("Liste ausgewählt:", list);
                    this.listView.showListDetails(list, this.model.getItems());
                }
            });

            // Bestätigung des Löschens einer Liste
            const confirmDeleteListBtn = document.getElementById("confirmDeleteList");
            if (confirmDeleteListBtn) {
                confirmDeleteListBtn.addEventListener("click", () => {
                    const listId = parseInt(document.getElementById("deleteListId").value);
                    this.model.deleteList(listId);
                    this.listView.renderLists(this.model.getLists());
                    console.log("Liste gelöscht: ID", listId);

                    // Wenn die gelöschte Liste gerade in der Detailansicht angezeigt wird, zeige die Standardansicht an:
                    if (this.listView.detailContainer.dataset.currentlistid === listId.toString()) {
                        this.listView.showListOverview();
                        console.log("Detailansicht zurückgesetzt, da gelöschte Liste angezeigt wurde.");
                    }

                    const deleteModalEl = document.getElementById("deleteListModal");
                    const deleteModalInstance = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
                    deleteModalInstance.hide();
                });
            }
        }

        // Bestätigung des Teilens einer Liste
        const confirmShareListBtn = document.getElementById("confirmShareList");
        if (confirmShareListBtn) {
            confirmShareListBtn.addEventListener("click", () => {
                const listId = parseInt(document.getElementById("shareListId").value);
                const list = this.model.getListById(listId);

                if (list) {
                    alert(`Die Liste "${list.name}" wurde erfolgreich geteilt!`);
                    console.log("Liste geteilt:", list);
                    const shareModalEl = document.getElementById("shareListModal");
                    const shareModalInstance = bootstrap.Modal.getOrCreateInstance(shareModalEl);
                    shareModalInstance.hide();
                }
            });
        }

        // Neuen Artikel hinzufügen bzw. Menge aktualisieren, falls der Artikel bereits vorhanden ist.
        const confirmAddArticleBtn = document.getElementById("confirmAddArticle");
        if (confirmAddArticleBtn) {
            confirmAddArticleBtn.addEventListener("click", () => {
                const currentListId = this.listView.detailContainer.dataset.currentlistid;
                if (!currentListId) {
                    console.log("Keine Liste ausgewählt, um Artikel hinzuzufügen.");
                    return;
                }
                const list = this.model.getListById(parseInt(currentListId));
                if (!list) {
                    console.log("Liste nicht gefunden.");
                    return;
                }
                // Annahme: Im Artikel‑Modal gibt es zwei Inputfelder mit den IDs "articleId" und "articleQuantity"
                const articleIdInput = document.getElementById("articleId");
                const articleQuantityInput = document.getElementById("articleQuantity");
                const articleId = parseInt(articleIdInput.value);
                const articleQuantity = parseInt(articleQuantityInput.value);

                // Suche den Artikel im globalen Artikel-Array (Model)
                const article = this.model.getItems().find(a => a.id === articleId);
                if (!article) {
                    console.log("Artikel nicht gefunden in model.items.");
                    return;
                }
                // Prüfen, ob der Artikel bereits in der Liste existiert
                let itemRef = list.items.find(item => item.id === articleId);
                if (itemRef) {
                    const oldQuantity = itemRef.quantity;
                    itemRef.quantity = parseInt(itemRef.quantity) + articleQuantity;
                    // Beim Update soll der Artikel wieder enthakt werden:
                    itemRef.checked = false;
                    console.log(`Artikel "${article.title}" bereits vorhanden. Menge aktualisiert: ${oldQuantity} + ${articleQuantity} = ${itemRef.quantity}`);
                    console.log("Artikel wurde enthakt, da Menge verändert wurde:", itemRef);
                } else {
                    itemRef = { id: articleId, quantity: articleQuantity, checked: false };
                    list.items.push(itemRef);
                    console.log(`Neuer Artikel "${article.title}" hinzugefügt mit Menge ${articleQuantity}.`);
                }
                // Liste im Model updaten und Detailansicht neu rendern
                this.model.updateList(list);
                this.listView.showListDetails(list, this.model.getItems());

                // Felder leeren und Modal schließen
                articleIdInput.value = "";
                articleQuantityInput.value = "";
                const articleModalEl = document.getElementById("articleModal");
                const articleModalInstance = bootstrap.Modal.getOrCreateInstance(articleModalEl);
                articleModalInstance.hide();
            });
        }
    }
}