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
                const modalEl = document.getElementById("addListModal");
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
            });
        }

        const createListBtn = document.getElementById("createList");
        if (createListBtn) {
            createListBtn.addEventListener("click", () => {
                const nameInput = document.getElementById("newListName");
                const name = nameInput.value.trim();
                if (name) {
                    // Speichere die aktuell aktive Liste (falls vorhanden)
                    const currentActiveId = this.listView.detailContainer.dataset.currentlistid;
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
                    const addListModalEl = document.getElementById("addListModal");
                    const addListModalInstance = bootstrap.Modal.getOrCreateInstance(addListModalEl);
                    addListModalInstance.hide();

                    // Falls bereits eine aktive Liste vorhanden war, neu rendern:
                    if (currentActiveId) {
                        const activeList = this.model.getListById(currentActiveId);
                        if (activeList) {
                            this.listView.showListDetails(activeList, this.model.getItems());
                        }
                    }
                
                }
            });
        }

        const listContainer = document.getElementById("list-container");
        if (listContainer) {
            listContainer.addEventListener("click", (event) => {
                const target = event.target;
                if (target.classList.contains("list-completed")) {
                    const id = parseInt(target.dataset.id);
                    const list = this.model.getListById(id);
                    if (list) {
                        list.completed = target.checked;
                        list.items.forEach(item => { item.checked = list.completed; });
                        this.model.updateList(list);
                        this.listView.renderLists(this.model.getLists());
                    }
                }
                if (target.classList.contains("share-list")) {
                    const id = parseInt(target.dataset.id);
                    document.getElementById("shareListId").value = id;
                    const shareModalEl = document.getElementById("shareListModal");
                    const shareModal = bootstrap.Modal.getOrCreateInstance(shareModalEl);
                    shareModal.show();
                }
                const deleteBtn = target.closest('.delete-list');
                if (deleteBtn) {
                    const id = parseInt(deleteBtn.dataset.id);
                    document.getElementById("deleteListId").value = id;
                    const deleteModalEl = document.getElementById("deleteListModal");
                    const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
                    deleteModal.show();
                }
                const editBtn = target.closest('.edit-list');
                if (editBtn) {
                    const id = parseInt(editBtn.dataset.id);
                    const list = this.model.getListById(id);
                    const editModalEl = document.getElementById("editListModal");
                    const modal = bootstrap.Modal.getOrCreateInstance(editModalEl);
                    document.getElementById("editListId").value = list.id;
                    document.getElementById("editListName").value = list.name;
                    modal.show();
                    const saveBtn = document.getElementById("saveEditList");
                    saveBtn.onclick = () => {
                        const newName = document.getElementById("editListName").value.trim();
                        if (newName) {
                            list.name = newName;
                            this.model.updateList(list);
                            this.listView.renderLists(this.model.getLists());
                            if (this.listView.detailContainer.dataset.currentlistid === list.id.toString()) {
                                this.listView.showListDetails(list, this.model.getItems());
                            }
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
                    if (this.listView.detailContainer.dataset.currentlistid === listId.toString()) {
                        this.listView.showListOverview();
                    }
                    const deleteModalEl = document.getElementById("deleteListModal");
                    const deleteModalInstance = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
                    deleteModalInstance.hide();
                });
            }
        }

        const confirmShareListBtn = document.getElementById("confirmShareList");
        if (confirmShareListBtn) {
            confirmShareListBtn.addEventListener("click", () => {
                const listId = parseInt(document.getElementById("shareListId").value);
                const list = this.model.getListById(listId);
                if (list) {
                    alert(`Die Liste "${list.name}" wurde erfolgreich geteilt!`);
                    const shareModalEl = document.getElementById("shareListModal");
                    const shareModalInstance = bootstrap.Modal.getOrCreateInstance(shareModalEl);
                    shareModalInstance.hide();
                }
            });
        }
    }
}
