// views/listView.js
export class ListView {
    constructor(model) {
        this.model = model;
        this.listContainer = document.getElementById("list-container");
        this.detailContainer = document.getElementById("detail-container");
    }

    renderLists(lists) {
        this.listContainer.innerHTML = "";
        // Lese die aktuell aktive Liste (falls vorhanden) aus dem Detailcontainer
        const currentActiveId = this.detailContainer.dataset.currentlistid;
        lists.forEach(list => {
            const div = document.createElement("div");
            div.className = "list-group-item d-flex justify-content-between align-items-center";
            div.dataset.id = list.id;
            // Falls diese Liste aktiv ist, füge die active-Klasse hinzu
            if (currentActiveId && currentActiveId === list.id.toString()) {
                div.classList.add("active");
            }
            const listClass = list.completed ? 'strikethrough' : '';
            div.innerHTML = `
            <span class="${listClass}">
              <input type="checkbox" class="list-completed" data-id="${list.id}" ${list.completed ? 'checked' : ''}>
              <span class="list-name">${list.name}</span>
            </span>
            <span class="list-actions d-flex gap-2 flex-md-column flex-sm-row align-items-end">
              <button class="btn btn-info btn-sm share-list" data-id="${list.id}" title="Liste teilen">
                <i class="bi bi-share"></i>
              </button>
              <button class="btn btn-warning btn-sm edit-list" data-id="${list.id}" title="Liste bearbeiten">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-list" data-id="${list.id}" title="Liste löschen">
                <i class="bi bi-trash"></i>
              </button>
            </span>
        `;
            this.listContainer.appendChild(div);

            const listCheckbox = div.querySelector('.list-completed');
            listCheckbox.addEventListener('change', (e) => {
                list.completed = e.target.checked;
                list.items.forEach(itemRef => {
                    itemRef.checked = list.completed;
                });
                if (list.items.length === 0 && list.completed) {
                    list.completed = true;
                }
            });
        });
    }


    showListOverview() {
        this.detailContainer.innerHTML = "<p class='text-overlay'>Bitte wähle eine Liste aus, um Details anzuzeigen.</p>";
        delete this.detailContainer.dataset.currentlistid;
    }

    showListDetails(list, items) {
        if (!list) {
            this.detailContainer.innerHTML = "<p>Liste nicht gefunden.</p>";
            return;
        }

        // Entferne die .active-Klasse von allen Listeneinträgen
        const listItems = document.querySelectorAll("#list-container .list-group-item");
        listItems.forEach(item => item.classList.remove("active"));

        // Füge die .active-Klasse zum aktuellen Listeneintrag hinzu
        const currentItem = document.querySelector(`#list-container .list-group-item[data-id="${list.id}"]`);
        if (currentItem) {
            currentItem.classList.add("active");
        }

        // Rest deines Codes, um die Detailansicht zu rendern:
        const hasItems = list.items.length > 0;
        const allItemsChecked = list.items.every(itemRef => itemRef.checked);
        list.completed = hasItems ? allItemsChecked : (list.completed || list.checked);
        const listCompletionStatus = list.completed ? 'Abgeschlossen' : 'In Bearbeitung';

        this.detailContainer.dataset.currentlistid = list.id;
        this.detailContainer.innerHTML = `
    <h2>${list.name} - Status: ${listCompletionStatus}</h2>
    <ul class="list-group">
      ${list.items.map(itemRef => {
            const item = items.find(i => i.id === itemRef.id);
            if (!item) return "";
            return `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <label>
              <input type="checkbox" data-id="${itemRef.id}" ${itemRef.checked ? 'checked' : ''}>
              ${item.title} - Menge: ${itemRef.quantity}
            </label>
            <button class="btn btn-danger btn-sm delete-article-from-list" data-id="${itemRef.id}" title="Artikel aus Liste entfernen">
              <i class="bi bi-trash"></i>
            </button>
          </li>
        `;
        }).join("")}
    </ul>
    <button id="openModalBtn" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#articleModal">
      Neuen Artikel hinzufügen <i class="bi bi-bag-plus-fill"></i>
    </button>
  `;

        // Restlicher Code zur Event-Bindung an Checkboxes etc.
        list.items.forEach(itemRef => {
            const checkbox = this.detailContainer.querySelector(`input[data-id="${itemRef.id}"]`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    itemRef.checked = checkbox.checked;
                    list.completed = list.items.every(i => i.checked);
                    this.model.updateList(list);
                    this.renderLists(this.model.lists);
                    this.showListDetails(list, items);
                });
            }
        });

// Event-Handler für Löschen von Artikeln
        const deleteButtons = this.detailContainer.querySelectorAll(".delete-article-from-list");
        deleteButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const articleId = parseInt(btn.getAttribute("data-id"));
                const liElement = btn.closest("li"); // Das Listenelement
                if (confirm("Möchten Sie den Artikel wirklich aus der Liste entfernen?")) {
                    // Füge die swipe-out-Klasse hinzu
                    liElement.classList.add("swipe-out");
                    // Sobald die Animation endet, entferne den Artikel und aktualisiere die Ansicht
                    liElement.addEventListener("animationend", () => {
                        list.items = list.items.filter(itemRef => itemRef.id !== articleId);
                        this.model.updateList(list);
                        this.showListDetails(list, items);
                    }, {once: true});
                }
            });
        });
    }
}