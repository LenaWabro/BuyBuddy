export class ListController {
    constructor(model, listView) {
        this.model = model;
        this.listView = listView;
        this.setupListEvents();
    }

    setupListEvents() {
        const addListBtn = document.getElementById("add-list");
        if (addListBtn) {
            addListBtn.addEventListener("click", () => {
                const modal = new bootstrap.Modal(document.getElementById("addListModal"));
                modal.show();
            });
        }

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

                    nameInput.value = "";
                    document.getElementById("addListModal").classList.remove("show");
                    document.body.classList.remove("modal-open");
                    document.querySelector(".modal-backdrop").remove();
                }
            });
        }

        const listContainer = document.getElementById("list-container");
        if (listContainer) {
            listContainer.addEventListener("click", (event) => {
                const target = event.target;

                // Checkbox zum Abhaken der Liste
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
                    }
                    // Teilen einer Liste
                    if (target.classList.contains("share-list")) {
                        const id = parseInt(target.dataset.id);
                        document.getElementById("shareListId").value = id;

                        const shareModal = new bootstrap.Modal(document.getElementById("shareListModal"));
                        shareModal.show();
                    }
                }


                // Teilen einer Liste
                if (target.classList.contains("share-list")) {
                    const id = parseInt(target.dataset.id);
                    document.getElementById("shareListId").value = id;

                    const shareModal = new bootstrap.Modal(document.getElementById("shareListModal"));
                    shareModal.show();
                }

                // Löschen einer Liste
                const deleteBtn = target.closest('.delete-list');
                if (deleteBtn) {
                    const id = parseInt(deleteBtn.dataset.id);
                    document.getElementById("deleteListId").value = id;
                    const deleteModal = new bootstrap.Modal(document.getElementById("deleteListModal"));
                    deleteModal.show();
                }

                // Bearbeiten einer Liste
                const editBtn = target.closest('.edit-list');
                if (editBtn) {
                    const id = parseInt(editBtn.dataset.id);
                    const list = this.model.getListById(id);

                    const modal = new bootstrap.Modal(document.getElementById('editListModal'));
                    document.getElementById('editListId').value = list.id;
                    document.getElementById('editListName').value = list.name;

                    modal.show();

                    const saveBtn = document.getElementById('saveEditList');
                    saveBtn.onclick = () => {
                        const newName = document.getElementById('editListName').value.trim();

                        if (newName !== "") {
                            list.name = newName;
                            this.model.updateList(list);
                            this.listView.renderLists(this.model.getLists());
                            modal.hide();
                        } else {
                            alert("Bitte einen gültigen Namen eingeben.");
                        }
                    };
                }

                // Zeige Listen-Details an
                if (event.target.dataset.id) {
                    const id = parseInt(event.target.dataset.id);
                    const list = this.model.getListById(id);
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

                    const deleteModalEl = document.getElementById("deleteListModal");
                    const deleteModalInstance = bootstrap.Modal.getInstance(deleteModalEl);
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
                    // Hier kannst du die Logik zum Teilen der Liste einfügen
                    // Zum Beispiel API-Aufruf, oder Logik zum tatsächlichen Teilen

                    // Bestätigung durch ein Alert
                    alert(`Die Liste "${list.name}" wurde erfolgreich geteilt!`);

                    // Modal schließen
                    const shareModalEl = document.getElementById("shareListModal");
                    const shareModalInstance = bootstrap.Modal.getInstance(shareModalEl);
                    shareModalInstance.hide();
                }
            });
        }
    }
}