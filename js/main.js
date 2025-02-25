import { Model } from "./model.js";
import { ListView } from "./listview.js";
import { ArtikelView } from "./articleview.js";
import { ListController } from "./listcontroller.js";
import { ArtikelController } from "./articlecontroller.js";


let lastScrollPosition = 0;

document.addEventListener("DOMContentLoaded", () => {
    const model = new Model();
    const listView = new ListView(model);
    const artikelView = new ArtikelView();

    new ListController(model, listView);
    new ArtikelController(model, artikelView, listView);

    document.addEventListener("dataLoaded", () => {
        listView.renderLists(model.lists);
        artikelView.renderItemsInModal(model.items);
        updateTagDropdowns(model);
        updateTagList(model); // Tag-Liste im Managementbereich initialisieren
    });

    document.addEventListener("tagsUpdated", () => {
        updateTagDropdowns(model);
        updateTagList(model);
    });

    listView.showListOverview();

    // Öffnen des Tag-Management-Modals (sofern ein Button vorhanden ist)
    const openTagManagementBtn = document.getElementById("openTagManagement");
    if (openTagManagementBtn) {
        openTagManagementBtn.addEventListener("click", () => {
            const tagModalEl = document.getElementById("tagManagementModal");
            const tagModal = bootstrap.Modal.getOrCreateInstance(tagModalEl);
            tagModal.show();
        });
    }
});


//für CSS Effekt
// Scroll-Event
window.addEventListener('wheel', function (event) {
    const isOnTopScreen = window.scrollY < window.innerHeight;
    const isScrollingDown = lastScrollPosition<window.scrollY;
    if (isOnTopScreen && isScrollingDown) {
        event.preventDefault();
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
    lastScrollPosition=window.scrollY;
}, { passive: false });


// Klick-Event auf .start
document.querySelector('.start').addEventListener('click', function () {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});


/**
 * Aktualisiert die Dropdowns für Tag-Auswahl in:
 * - Artikel-Erstellung (articleEntryTag)
 * - Artikel-Bearbeitung (editArticleTag)
 * - Artikel-Filter (newProductTag)
 */
function updateTagDropdowns(model) {
    // Artikel-Erstellungs-Dropdown
    const articleEntryTag = document.getElementById("articleEntryTag");
    if (articleEntryTag) {
        articleEntryTag.innerHTML = `<option value="">Wähle einen Tag</option>`;
        model.tags.forEach(tag => {
            articleEntryTag.innerHTML += `<option value="${tag}">${tag}</option>`;
        });
        articleEntryTag.innerHTML += `<option value="new">Neuen Tag erstellen...</option>`;
    }

    // Artikel-Bearbeitungs-Dropdown
    const editArticleTag = document.getElementById("editArticleTag");
    if (editArticleTag) {
        editArticleTag.innerHTML = `<option value="">Wähle einen Tag</option>`;
        model.tags.forEach(tag => {
            editArticleTag.innerHTML += `<option value="${tag}">${tag}</option>`;
        });
        editArticleTag.innerHTML += `<option value="new">Neuen Tag erstellen...</option>`;
    }

    // Filter-Dropdown in der Artikelübersicht
    const newProductTag = document.getElementById("newProductTag");
    if (newProductTag) {
        newProductTag.innerHTML = `<option value="">Alle anzeigen</option>`;
        model.tags.forEach(tag => {
            newProductTag.innerHTML += `<option value="${tag}">${tag}</option>`;
        });
    }
}

function updateTagList(model) {
    const tagList = document.getElementById("tagList");
    if (tagList) {
        tagList.innerHTML = ""; // Alte Liste löschen
        model.tags.forEach(tag => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.textContent = tag;

            // Löschen-Button
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-danger btn-sm";
            deleteBtn.textContent = "Löschen";
            deleteBtn.addEventListener("click", () => {
                if (confirm(`Möchten Sie den Tag "${tag}" wirklich löschen?`)) {
                    model.deleteTag(tag);
                }
            });
            li.appendChild(deleteBtn);
            tagList.appendChild(li);
        });
    }
}

