export class ListController {
    constructor(model, listView) {
        this.model = model;
        this.listView = listView;
        this.setupListEvents();
    }

    setupListEvents() {
        // Neuer Listen-Button: Modal öffnen
        const addListBtn = document.getElementById("add-list");
        if (addListBtn) {
            addListBtn.addEventListener("click", () => {
                const modal = new bootstrap.Modal(document.getElementById("addListModal"));
                modal.show();
            });
        }

        // Beim Klick auf „Erstellen“
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

                    this.model.lists.push(newList);
                    this.listView.renderLists(this.model.lists);

                    // Eingabe leeren & Modal schließen
                    nameInput.value = "";
                    document.getElementById("addListModal").classList.remove("show");
                    document.getElementById("addListModal").setAttribute("aria-hidden", "true");
                    document.body.classList.remove("modal-open");
                    document.querySelector(".modal-backdrop").remove();
                }
            });
        }

        // Delegierter Klick-Event auf den Listen-Container
        const listContainer = document.getElementById("list-container");
        if (listContainer) {
            listContainer.addEventListener("click", (event) => {
                const target = event.target;

                // 1) Liste als (un-)completed setzen (Checkbox):
                if (target.classList.contains("list-completed")) {
                    const id = parseInt(target.dataset.id);
                    const list = this.model.lists.find(list => list.id === id);

                    if (list) {
                        list.completed = target.checked;
                        list.items.forEach(itemRef => itemRef.checked = list.completed);
                    }

                    this.listView.renderLists(this.model.lists);
                    this.listView.showListDetails(list, this.model.items);
                    return;
                }

                // 2) Liste löschen:
                const deleteBtn = target.closest('.delete-list');
                if (deleteBtn) {
                    const id = parseInt(deleteBtn.dataset.id);
                    document.getElementById("deleteListId").value = id;  // Setze die ID in das versteckte Eingabefeld

                    // Hole das Modal-Element und zeige es an
                    const deleteModalElement = document.getElementById("deleteListModal");
                    const deleteModal = new bootstrap.Modal(deleteModalElement);

                    deleteModal.show();
                }

                // 3) Liste bearbeiten:
                const editBtn = target.closest('.edit-list');
                if (editBtn) {
                    const id = parseInt(editBtn.dataset.id);
                    const list = this.model.lists.find(list => list.id === id);

                    // Füllen des Modals mit den aktuellen Listendaten
                    const modal = new bootstrap.Modal(document.getElementById('editListModal'));
                    document.getElementById('editListId').value = list.id;  // ID speichern
                    document.getElementById('editListName').value = list.name;  // aktuellen Namen eintragen

                    // Modal anzeigen
                    modal.show();

                    // Event für den "Speichern"-Button
                    const saveBtn = document.getElementById('saveEditList');
                    saveBtn.onclick = () => {
                        const newName = document.getElementById('editListName').value.trim();

                        if (newName !== "") {
                            // Listenname aktualisieren
                            list.name = newName;

                            // Liste rendern
                            this.listView.renderLists(this.model.lists);

                            // Modal schließen
                            modal.hide();
                        } else {
                            alert("Bitte einen gültigen Namen eingeben.");
                        }
                    };
                }




                // 5) Klick auf einen Listeneintrag (Liste öffnen):
                if (event.target.dataset.id) {
                    const id = parseInt(event.target.dataset.id);
                    const list = this.model.lists.find(list => list.id === id);
                    this.listView.showListDetails(list, this.model.items);
                }
            });

            // Löschen der Liste bestätigen
            const confirmDeleteListBtn = document.getElementById("confirmDeleteList");
            if (confirmDeleteListBtn) {
                confirmDeleteListBtn.addEventListener("click", () => {
                    const listId = parseInt(document.getElementById("deleteListId").value);

                    // Liste aus dem Modell löschen
                    this.model.lists = this.model.lists.filter(list => list.id !== listId);

                    // Listenansicht neu rendern
                    this.listView.renderLists(this.model.lists);



                    // Optional: Entfernen des Modals aus dem DOM, um eine saubere Anzeige zu gewährleisten
                    document.getElementById("deleteListModal").classList.remove("show");
                    document.getElementById("deleteListModal").setAttribute("aria-hidden", "true");
                    document.body.classList.remove("modal-open");
                    const backdrop = document.querySelector(".modal-backdrop");
                    if (backdrop) backdrop.remove();
                });
            }

        }
    }
}
