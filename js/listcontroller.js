export class ListController {
    constructor(model, listView) {
        this.model = model; // Speichert das Model, das die Daten verwaltet
        this.listView = listView; // Speichert die View, die für die Darstellung der Listen zuständig ist
        this.setupListEvents(); // Initialisiert die Event-Listener für die Listenverwaltung
    }

    /**
     * Setzt Event-Listener für die Verwaltung der Einkaufslisten.
     * Hier werden Events für das Erstellen, Bearbeiten, Löschen, Teilen
     * und Abschließen einer Liste gesetzt.
     */
    setupListEvents() {
        // Öffnet das Modal zum Erstellen einer neuen Liste
        const addListBtn = document.getElementById("add-list");
        if (addListBtn) {
            addListBtn.addEventListener("click", () => {
                const modalEl = document.getElementById("addListModal");
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show(); // Zeigt das Modal-Fenster an
            });
        }

        // Event für das Erstellen einer neuen Liste nach Eingabe eines Namens
        const createListBtn = document.getElementById("createList");
        if (createListBtn) {
            createListBtn.addEventListener("click", () => {
                const nameInput = document.getElementById("newListName");
                const name = nameInput.value.trim(); // Entfernt Leerzeichen vor und nach dem Namen

                if (name) {
                    // Speichert die aktuell aktive Liste, falls vorhanden
                    const currentActiveId = this.listView.detailContainer.dataset.currentlistid;

                    // Erstellt ein neues Listen-Objekt mit einer eindeutigen ID
                    const newList = {
                        id: Date.now(),
                        name,
                        active: true,
                        items: [], // Startet mit einer leeren Artikelliste
                        completed: false // Standardmäßig nicht abgeschlossen
                    };

                    // Neue Liste im Model speichern und UI aktualisieren
                    this.model.addList(newList);
                    this.listView.renderLists(this.model.getLists());

                    // Eingabefeld zurücksetzen
                    nameInput.value = "";

                    // Modal schließen
                    const addListModalEl = document.getElementById("addListModal");
                    const addListModalInstance = bootstrap.Modal.getOrCreateInstance(addListModalEl);
                    addListModalInstance.hide();

                    // Falls bereits eine Liste aktiv war, wird sie erneut geladen
                    if (currentActiveId) {
                        const activeList = this.model.getListById(currentActiveId);
                        if (activeList) {
                            this.listView.showListDetails(activeList, this.model.getItems());
                        }
                    }
                }
            });
        }

        // Event-Listener für Klicks innerhalb des Listen-Containers
        const listContainer = document.getElementById("list-container");
        if (listContainer) {
            listContainer.addEventListener("click", (event) => {
                const target = event.target;

                // Markiert eine Liste als abgeschlossen (Checkbox)
                if (target.classList.contains("list-completed")) {
                    const id = parseInt(target.dataset.id);
                    const list = this.model.getListById(id);
                    if (list) {
                        list.completed = target.checked; // Speichert, ob die Liste abgeschlossen ist
                        list.items.forEach(item => { item.checked = list.completed; }); // Markiert auch alle Artikel als abgeschlossen
                        this.model.updateList(list); // Aktualisiert die Liste im Model
                        this.listView.renderLists(this.model.getLists()); // UI aktualisieren
                    }
                }

                // Öffnet das Teilen-Modal für die Liste
                if (target.classList.contains("share-list")) {
                    const id = parseInt(target.dataset.id);
                    document.getElementById("shareListId").value = id;
                    const shareModalEl = document.getElementById("shareListModal");
                    const shareModal = bootstrap.Modal.getOrCreateInstance(shareModalEl);
                    shareModal.show();
                }

                // Öffnet das Modal zum Löschen einer Liste
                const deleteBtn = target.closest('.delete-list');
                if (deleteBtn) {
                    const id = parseInt(deleteBtn.dataset.id);
                    document.getElementById("deleteListId").value = id;
                    const deleteModalEl = document.getElementById("deleteListModal");
                    const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
                    deleteModal.show();
                }

                // Öffnet das Modal zum Bearbeiten einer Liste
                const editBtn = target.closest('.edit-list');
                if (editBtn) {
                    const id = parseInt(editBtn.dataset.id);
                    const list = this.model.getListById(id);
                    const editModalEl = document.getElementById("editListModal");
                    const modal = bootstrap.Modal.getOrCreateInstance(editModalEl);

                    // Setzt die aktuellen Listendaten in das Formular
                    document.getElementById("editListId").value = list.id;
                    document.getElementById("editListName").value = list.name;
                    modal.show();

                    // Event für das Speichern der Änderungen
                    const saveBtn = document.getElementById("saveEditList");
                    saveBtn.onclick = () => {
                        const newName = document.getElementById("editListName").value.trim();
                        if (newName) {
                            list.name = newName;
                            this.model.updateList(list);
                            this.listView.renderLists(this.model.getLists());

                            // Falls die bearbeitete Liste gerade angezeigt wird, wird sie neu geladen
                            if (this.listView.detailContainer.dataset.currentlistid === list.id.toString()) {
                                this.listView.showListDetails(list, this.model.getItems());
                            }
                            modal.hide();
                        } else {
                            alert("Bitte einen gültigen Namen eingeben.");
                        }
                    };
                }

                // Zeigt die Details einer angeklickten Liste an
                if (event.target.dataset.id) {
                    const id = parseInt(event.target.dataset.id);
                    const list = this.model.getListById(id);
                    this.listView.showListDetails(list, this.model.getItems());
                }
            });

            // Event für das endgültige Löschen einer Liste nach Bestätigung
            const confirmDeleteListBtn = document.getElementById("confirmDeleteList");
            if (confirmDeleteListBtn) {
                confirmDeleteListBtn.addEventListener("click", () => {
                    const listId = parseInt(document.getElementById("deleteListId").value);
                    this.model.deleteList(listId);
                    this.listView.renderLists(this.model.getLists());

                    // Falls die gelöschte Liste gerade aktiv war, wird die Übersicht angezeigt
                    if (this.listView.detailContainer.dataset.currentlistid === listId.toString()) {
                        this.listView.showListOverview();
                    }

                    // Modal schließen
                    const deleteModalEl = document.getElementById("deleteListModal");
                    const deleteModalInstance = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
                    deleteModalInstance.hide();
                });
            }
        }

        // Event für das Teilen einer Liste nach Bestätigung
        const confirmShareListBtn = document.getElementById("confirmShareList");
        if (confirmShareListBtn) {
            confirmShareListBtn.addEventListener("click", () => {
                const listId = parseInt(document.getElementById("shareListId").value);
                const list = this.model.getListById(listId);
                if (list) {
                    alert(`Die Liste "${list.name}" wurde erfolgreich geteilt!`);

                    // Modal schließen
                    const shareModalEl = document.getElementById("shareListModal");
                    const shareModalInstance = bootstrap.Modal.getOrCreateInstance(shareModalEl);
                    shareModalInstance.hide();
                }
            });
        }
    }
}
