// controllers/tagController.js
import { TagView } from "./tagView.js";

export class TagController {
    constructor(model) {
        this.model = model;
        this.tagView = new TagView(this.model);

        // Direkt beim Start: Dropdowns und Liste aufbauen
        this.tagView.updateTagDropdowns();
        this.tagView.updateTagList();

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener("tagsUpdated", () => {
            this.tagView.updateTagDropdowns();
            this.tagView.updateTagList();

            // Dropdown auf "" -> Alle anzeigen
            const newProductTag = document.getElementById("newProductTag");
            if (newProductTag) {
                newProductTag.value = "";
            }
            // Feuer ein Event, damit der ArticleController weiß:
            // -> Bitte alle Artikel zeigen
            document.dispatchEvent(new Event("showAllArticles"));
        });

        const addTagBtn = document.getElementById("addTagBtn");
        if (addTagBtn) {
            addTagBtn.addEventListener("click", () => {
                const tagInput = document.getElementById("newTagInputInManagement");
                const newTag = tagInput.value.trim();
                if (newTag) {
                    this.addTag(newTag);
                    tagInput.value = "";
                } else {
                    alert("Bitte geben Sie einen Tag-Namen ein.");
                }
            });
        }

        const openTagManagementBtn = document.getElementById("openTagManagement");
        if (openTagManagementBtn) {
            openTagManagementBtn.addEventListener("click", () => {
                const tagModalEl = document.getElementById("tagManagementModal");
                const tagModal = bootstrap.Modal.getOrCreateInstance(tagModalEl);
                tagModal.show();
            });
        }
    }

    addTag(tagName) {
        this.model.addTag(tagName);
    }

    deleteTag(tagName) {
        if (confirm(`Möchten Sie den Tag "${tagName}" wirklich löschen?`)) {
            this.model.deleteTag(tagName);
        }
    }
}
