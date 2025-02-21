/**
 * ListView.js - View-Klasse für die Darstellung und Interaktion mit der Listenverwaltung --> repräsentiert die View-Schicht.
 *  verantwortlich, die Benutzeroberfläche zu aktualisieren und Nutzerinteraktionen an den Controller weiterzuleiten.
 *
 * Was wird bereits erledigt?
 * -Listen mit Checkboxen
 * -Checkboxen können abgehakt werden und beeinflussen die Artikel
 * -enthält Event-Listener, um Änderungen der Listen und Artikel an den Controller weiterzugeben.
 *
 */
export class ListView {
    constructor(model) {
        this.model = model; // Das gesamte Model speichern, um darauf zuzugreifen
        this.listContainer = document.getElementById("list-container");
        this.detailContainer = document.getElementById("detail-container");
    }

    /**
     * Rendert alle Listen in der Listenübersicht.
     * Jede Liste enthält eine Checkbox, um sie als abgeschlossen zu markieren.
     * Wenn eine Liste abgehakt wird, werden automatisch alle Artikel in dieser Liste ebenfalls abgehakt.
     */
    renderLists(lists) {
        this.listContainer.innerHTML = ""; // Vorherigen Inhalt leeren
        lists.forEach(list => {
            const div = document.createElement("div");
            div.className = "list-group-item d-flex justify-content-between align-items-center";
            div.dataset.id = list.id; // Speichert die ID der Liste als Attribut für spätere Referenzen

            // Falls die Liste abgeschlossen ist, wird eine Klasse für durchgestrichenen Text hinzugefügt
            const listClass = list.completed ? 'strikethrough' : '';

            // HTML für eine Liste: Checkbox zum Abhaken, Name der Liste, Bearbeitungs- und Löschbutton
            div.innerHTML = `
                <span class="${listClass}">
                    <input type="checkbox" class="list-completed" data-id="${list.id}" ${list.completed ? 'checked' : ''}>
                    <span class="list-name">${list.name}</span>
                </span>
             <span class="list-actions d-flex gap-2 flex-row flex-lg-column align-items-end">
    <button class="btn btn-info btn-sm share-list d-flex align-items-center w-auto" data-id="${list.id}" title="Liste teilen">
        <i class="bi bi-share"></i>
    </button>
    <button class="btn btn-warning btn-sm edit-list d-flex align-items-center w-auto" data-id="${list.id}" title="Liste bearbeiten">
        <i class="bi bi-pencil"></i>
    </button>
    <button class="btn btn-danger btn-sm delete-list d-flex align-items-center w-auto" data-id="${list.id}" title="Liste löschen">
        <i class="bi bi-trash"></i>
    </button>
</span>

            `;
            this.listContainer.appendChild(div); // Liste zum Container hinzufügen

            // Event-Listener für das Abhaken der gesamten Liste
            const listCheckbox = div.querySelector('.list-completed');
            listCheckbox.addEventListener('change', (e) => {
                list.completed = e.target.checked; // Speichert den neuen Status der Liste

                // Alle zugehörigen Artikel erhalten denselben Status
                list.items.forEach(itemRef => {
                    itemRef.checked = list.completed;
                });

                // Falls die Liste leer ist und abgehakt wurde, bleibt sie abgeschlossen
                if (list.items.length === 0 && list.completed) {
                    list.completed = true;
                }

                // Listenübersicht aktualisieren
                this.renderLists(this.model.lists);

                // Falls die Detailansicht der Liste gerade geöffnet ist, aktualisieren
                const detailH4 = this.detailContainer.querySelector('h4');
                if (detailH4 && detailH4.textContent.includes(list.name)) {
                    this.showListDetails(list, this.model.items);
                }
            });
        });
    }

    /**
     * Zeigt eine Standardansicht, falls keine Liste ausgewählt wurde.
     */
    showListOverview() {
        this.detailContainer.innerHTML = "<p class='text-overlay'>Bitte wähle eine Liste aus, um Details anzuzeigen.</p>";
    }

    /**
     * Rendert die Detailansicht einer Liste und zeigt die enthaltenen Artikel mit Checkboxes an.
     * Falls alle Artikel abgehakt sind, wird die gesamte Liste als abgeschlossen markiert.
     */
    showListDetails(list, items) {
        console.log(list, items);
        if (!list) {
            this.detailContainer.innerHTML = "<p>Liste nicht gefunden.</p>";
            return;
        }

        // Prüft, ob die Liste Artikel enthält und ob alle abgehakt sind
        const hasItems = list.items.length > 0;
        const allItemsChecked = list.items.every(itemRef => itemRef.checked);

        // Falls die Liste leer ist, übernimmt sie den Status der Checkbox
        if (!hasItems) {
            list.completed = list.completed || list.checked;
        } else {
            list.completed = allItemsChecked;
        }

        const listCompletionStatus = list.completed ? 'Abgeschlossen' : 'In Bearbeitung';

        this.detailContainer.dataset.currentlistid = list.id;
        this.detailContainer.innerHTML = `
        <h2>${list.name} - Status: ${listCompletionStatus}</h2>
        <ul class="list-group">
            ${list.items.map(itemRef => {
            const item = items.find(i => i.id === itemRef.id);
            if (!item) return "";
            return `
                    <li class="list-group-item">
                        <label>
                            <input type="checkbox" data-id="${itemRef.id}" ${itemRef.checked ? 'checked' : ''}>
                            ${item.title} - Menge: ${itemRef.quantity}
                        </label>
                    </li>
                `;
        }).join("")}
        </ul>
        <button id="openModalBtn" class="btn article-overview" data-bs-toggle="modal" data-bs-target="#articleModal">
            <i class="bi bi-bag-plus-fill"></i>
        </button>
    `;


// Prüft, ob alle Artikel in der Liste abgehakt sind
        const allChecked = list.items.every(i => i.checked);
        console.log("Vor Änderung - allChecked:", allChecked); // Debugging

// Event-Listener für einzelne Artikel-Checkboxen in der Detailansicht
        list.items.forEach(itemRef => {
            const checkbox = this.detailContainer.querySelector(`input[data-id="${itemRef.id}"]`);

            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    itemRef.checked = checkbox.checked;
                    // Wenn alle Artikel checked sind, dann ist auch die Liste completed
                    list.completed = list.items.every(i => i.checked);

                    // ggf. im Model speichern
                    this.model.updateList(list);
                    // this.model.updateItems(list.items);

                    this.renderLists(this.model.lists);
                    this.showListDetails(list, items);
                });
            }
        });
    }
}
