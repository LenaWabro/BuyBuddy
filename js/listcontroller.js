// listcontroller.js
export class ListController {
    constructor(model, listView) {
        this.model = model;
        this.listView = listView;
        this.setupListEvents();
    }

    setupListEvents() {
        // Neuer Listen-Button:
        const addListBtn = document.getElementById("add-list");
        if (addListBtn) {
            addListBtn.addEventListener("click", () => {
                const name = prompt("Name der neuen Liste:");
                if (name) {
                    const newList = {
                        id: Date.now(),
                        name,
                        active: true,
                        items: [],
                        completed: false  // optional: gleich mitführen
                    };
                    this.model.lists.push(newList);
                    this.listView.renderLists(this.model.lists);
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
                        // Auch alle Artikel in der Liste auf den gleichen Status setzen
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
                    if (confirm("Bist du sicher, dass du diese Liste löschen möchtest?")) {
                        this.model.lists = this.model.lists.filter(list => list.id !== id);
                        this.listView.renderLists(this.model.lists);
                    }
                    return;
                }

                // 3) Liste bearbeiten:
                const editBtn = target.closest('.edit-list');
                if (editBtn) {
                    const id = parseInt(editBtn.dataset.id);
                    const list = this.model.lists.find(list => list.id === id);
                    const newName = prompt("Neuen Namen der Liste eingeben:", list.name);
                    if (newName && newName.trim() !== "") {
                        list.name = newName.trim();
                        this.listView.renderLists(this.model.lists);
                    }
                    return;
                }

                // 4) Neuen Artikel hinzufügen
                const addItemBtn = target.closest('.add-item');
                if (addItemBtn) {
                    const id = parseInt(addItemBtn.dataset.id);
                    const list = this.model.lists.find(list => list.id === id);

                    if (list) {
                        const itemName = prompt("Name des neuen Artikels:");
                        if (itemName && itemName.trim() !== "") {
                            // Artikel hinzufügen
                            list.items.push({
                                id: Date.now(),
                                name: itemName.trim(),
                                checked: false
                            });
                            // Liste auf "in Bearbeitung" setzen
                            list.completed = false;
                            // Neu rendern
                            this.listView.renderLists(this.model.lists);
                            this.listView.showListDetails(list, this.model.items);
                        }
                    }
                    return;
                }

                // 5) Klick auf einen Listeneintrag (Liste öffnen):
                if (target.dataset.id) {
                    const id = parseInt(target.dataset.id);
                    const list = this.model.lists.find(list => list.id === id);
                    this.listView.showListDetails(list, this.model.items);
                }
            });
        }
    }
}
