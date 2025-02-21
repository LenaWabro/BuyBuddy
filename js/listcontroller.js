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

                // Listenelement (Checkbox)
                // Controller-Teil fürs Anklicken der Listen-Checkbox
                if (target.classList.contains("list-completed")) {
                    const id = parseInt(target.dataset.id);
                    const list = this.model.getListById(id);

                    if (list) {
                        const isChecked = target.checked;

                        // Liste auf checked setzen
                        list.completed = isChecked;  // Falls du “list.completed” beibehalten willst
                        // oder list.checked = isChecked;  // Wenn du’s auch bei der Liste so nennen möchtest

                        // Alle Artikel in der Liste auch entsprechend setzen
                        list.items.forEach(item => {
                            // Hier bitte ebenfalls `checked` statt `completed`
                            item.checked = isChecked;
                        });

                        // Speichern
                        this.model.updateList(list);
                        // Wenn du die Items im Model führst, ggf. updaten:
                        // this.model.updateItems(list.items);

                        // View aktualisieren
                        this.listView.renderLists(this.model.getLists());
                        this.listView.showListDetails(list, this.model.getItems());
                    }
                }





                const deleteBtn = target.closest('.delete-list');
                if (deleteBtn) {
                    const id = parseInt(deleteBtn.dataset.id);
                    document.getElementById("deleteListId").value = id;
                    const deleteModal = new bootstrap.Modal(document.getElementById("deleteListModal"));
                    deleteModal.show();
                }

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

                if (event.target.dataset.id) {
                    const id = parseInt(event.target.dataset.id);
                    const list = this.model.getListById(id);
                    this.listView.showListDetails(list, this.model.getItems());
                }
            });

            const confirmDeleteListBtn = document.getElementById("confirmDeleteList");
            if (confirmDeleteListBtn) {
                confirmDeleteListBtn.addEventListener("click", () => {
                    const listId = parseInt(document.getElementById("deleteListId").value);
                    this.model.deleteList(listId);
                    this.listView.renderLists(this.model.getLists());

                    const deleteModalEl = document.getElementById("deleteListModal");
                    const deleteModal = bootstrap.Modal.getInstance(deleteModalEl);
                    deleteModal.hide();
                });
            }
        }
    }
}
