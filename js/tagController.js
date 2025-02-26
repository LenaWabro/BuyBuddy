import { TagView } from "./tagView.js";

export class TagController {
    constructor(model) {
        this.model = model;
        this.tagView = new TagView(this.model);

        // Direkt beim Start: Aktualisiert die Dropdown-Menüs und die Tag-Liste
        this.tagView.updateTagDropdowns();
        this.tagView.updateTagList();

        // Setzt alle Event-Listener für Interaktionen mit Tags
        this.setupEventListeners();
    }

    /**
     * Setzt Event-Listener für Tag-Updates, Hinzufügen und Löschen
     * Sorgt dafür, dass sich die Benutzeroberfläche immer aktualisiert,
     * wenn sich die Tags ändern oder verwaltet werden.
     */
    setupEventListeners() {
        // Listener für das Event "tagsUpdated", um Dropdowns und Listen zu aktualisieren
        document.addEventListener("tagsUpdated", () => {
            this.tagView.updateTagDropdowns();
            this.tagView.updateTagList();

            // Setzt das Filter-Dropdown auf "Alle anzeigen"
            const newProductTag = document.getElementById("newProductTag");
            if (newProductTag) {
                newProductTag.value = "";
            }

            // Löst ein Event aus, um alle Artikel anzuzeigen (z. B. wenn ein Tag entfernt wurde)
            document.dispatchEvent(new Event("showAllArticles"));
        });

        // Event-Listener für das Hinzufügen eines neuen Tags über die Verwaltung
        const addTagBtn = document.getElementById("addTagBtn");
        if (addTagBtn) {
            addTagBtn.addEventListener("click", () => {
                const tagInput = document.getElementById("newTagInputInManagement");
                const newTag = tagInput.value.trim();

                // Prüft, ob der eingegebene Tag nicht leer ist
                if (newTag) {
                    this.addTag(newTag);
                    tagInput.value = ""; // Setzt das Eingabefeld zurück
                } else {
                    alert("Bitte geben Sie einen Tag-Namen ein.");
                }
            });
        }

        // Öffnet das Modal für die Tag-Verwaltung
        const openTagManagementBtn = document.getElementById("openTagManagement");
        if (openTagManagementBtn) {
            openTagManagementBtn.addEventListener("click", () => {
                const tagModalEl = document.getElementById("tagManagementModal");
                const tagModal = bootstrap.Modal.getOrCreateInstance(tagModalEl);
                tagModal.show();
            });
        }

        // Event-Listener für das Löschen eines Tags
        document.addEventListener("deleteTag", (event) => {
            this.deleteTag(event.detail.tagName);
        });
    }

    /**
     * Fügt einen neuen Tag zur Liste hinzu
     * Aktualisiert automatisch die Benutzeroberfläche, um den neuen Tag anzuzeigen.
     */
    addTag(tagName) {
        this.model.addTag(tagName);
    }

    /**
     * Löscht einen Tag aus der Liste, falls er nicht mehr verwendet wird.
     * Schließt das Tag-Management-Modal nach dem Löschen.
     */
    deleteTag(tagName) {
        // Zeigt eine Bestätigungsabfrage vor dem Löschen
        if (confirm(`Möchten Sie den Tag "${tagName}" wirklich löschen?`)) {
            this.model.deleteTag(tagName);

            // Schließt das Tag-Management-Modal nach dem Löschen
            const tagModalEl = document.getElementById("tagManagementModal");
            if (tagModalEl) {
                const tagModal = bootstrap.Modal.getOrCreateInstance(tagModalEl);
                tagModal.hide();
            }
        }
    }
}
