export class TagView {
    constructor(model) {
        this.model = model;
    }

    updateTagDropdowns() {
        const articleEntryTag = document.getElementById("articleEntryTag");
        if (articleEntryTag) {
            articleEntryTag.innerHTML = `<option value="">Wähle einen Tag</option>`;
            this.model.tags.forEach(tag => {
                articleEntryTag.innerHTML += `<option value="${tag}">${tag}</option>`;
            });
            articleEntryTag.innerHTML += `<option value="new">Neuen Tag erstellen...</option>`;
        }

        const editArticleTag = document.getElementById("editArticleTag");
        if (editArticleTag) {
            editArticleTag.innerHTML = `<option value="">Wähle einen Tag</option>`;
            this.model.tags.forEach(tag => {
                editArticleTag.innerHTML += `<option value="${tag}">${tag}</option>`;
            });
            editArticleTag.innerHTML += `<option value="new">Neuen Tag erstellen...</option>`;
        }

        const newProductTag = document.getElementById("newProductTag");
        if (newProductTag) {
            newProductTag.innerHTML = `<option value="">Alle anzeigen</option>`;
            this.model.tags.forEach(tag => {
                newProductTag.innerHTML += `<option value="${tag}">${tag}</option>`;
            });
        }
    }

    updateTagList() {
        const tagList = document.getElementById("tagList");
        if (tagList) {
            tagList.innerHTML = "";
            this.model.tags.forEach(tag => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.textContent = tag;

                // Bootstrap-Icon für das Löschen
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn btn-danger btn-sm";
                deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`; // Bootstrap Trash Icon

                deleteBtn.addEventListener("click", () => {
                    document.dispatchEvent(new CustomEvent("deleteTag", { detail: { tagName: tag } }));
                });

                li.appendChild(deleteBtn);
                tagList.appendChild(li);
            });
        }
    }
}
