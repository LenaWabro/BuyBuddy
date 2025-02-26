export class ArticleController {
    constructor(model, articleView, listView) {
        this.model = model;
        this.articleView = articleView;
        this.listView = listView;
        this.selectedItems = {};

        this.setupModalEvents();
        this.setupModalEventsForNewArticle();
        this.setupArticleEditAndDeleteEvents();
        this.setupEditArticleSave();

        // **Dauerhafter** Listener für "showAllArticles":
        document.addEventListener("showAllArticles", () => {
            // Filter auf leeren Tag -> zeige alle Artikel
            this.filterArticlesByTag('');
        });
    }

    setupArticleEditAndDeleteEvents() {
        const articleList = document.getElementById("articleList");
        if (!articleList) return;
        articleList.addEventListener("click", (event) => {
            const editBtn = event.target.closest(".edit-article");
            if (editBtn) {
                const articleId = parseInt(editBtn.getAttribute("data-id"));
                this.openEditArticleModal(articleId);
            }
            const deleteBtn = event.target.closest(".delete-article");
            if (deleteBtn) {
                const articleId = parseInt(deleteBtn.getAttribute("data-id"));
                this.deleteArticleWithConfirmation(articleId);
            }
        });
    }

    openEditArticleModal(articleId) {
        const article = this.model.getItems().find(item => item.id === articleId);
        if (!article) return;

        document.getElementById("editArticleId").value = article.id;
        document.getElementById("editArticleName").value = article.title;
        document.getElementById("editArticleDescription").value = article.description;
        document.getElementById("editArticleImage").value = article.image;

        const preview = document.getElementById("editArticleImagePreview");
        preview.src = article.image;
        preview.style.display = article.image ? "block" : "none";

        // **Dropdown aktualisieren und den aktuellen Tag setzen**
        const editArticleTag = document.getElementById("editArticleTag");

        // Stelle sicher, dass die Dropdown-Optionen korrekt geladen sind
        editArticleTag.innerHTML = `<option value="">Wähle einen Tag</option>`;
        this.model.tags.forEach(tag => {
            editArticleTag.innerHTML += `<option value="${tag}">${tag}</option>`;
        });
        editArticleTag.innerHTML += `<option value="new">Neuen Tag erstellen...</option>`;

        // Setze den aktuellen Tag als ausgewählt
        setTimeout(() => {
            editArticleTag.value = article.tag || "";
        }); // Kurze Verzögerung, um sicherzustellen, dass das Dropdown aktualisiert wurde

        // Falls der Benutzer "Neuen Tag erstellen" auswählt, zeige das Eingabefeld
        document.getElementById("editNewTagContainer").style.display = "none";
        editArticleTag.addEventListener("change", () => {
            if (editArticleTag.value === "new") {
                document.getElementById("editNewTagContainer").style.display = "block";
                document.getElementById("editNewTagInput").focus();
            } else {
                document.getElementById("editNewTagContainer").style.display = "none";
            }
        });

        // Öffne das Modal
        const modalEl = document.getElementById("articleEditModal");
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }


    deleteArticleWithConfirmation(articleId) {
        const isUsed = this.model.lists.some(list => list.items.some(item => item.id === articleId));
        if (isUsed) {
            alert("Dieser Artikel wird noch in einer Liste verwendet und kann daher nicht gelöscht werden.");
            return;
        }
        if (confirm("Möchtest du diesen Artikel wirklich löschen?")) {
            const articleList = document.getElementById("articleList");
            // Finde das li-Element des zu löschenden Artikels:
            const liElement = articleList.querySelector(`.delete-article[data-id="${articleId}"]`).closest("li");
            liElement.classList.add("swipe-out");
            liElement.addEventListener("animationend", () => {
                this.model.deleteArticle(articleId);
                this.articleView.renderItemsInModal(this.model.getItems());
            }, {once: true});
        }
    }

    setupEditArticleSave() {
        // Neuen Tag im Edit-Modal erstellen (Button "confirmEditNewTag")
        const confirmEditNewTagBtn = document.getElementById("confirmEditNewTag");
        const editNewTagInput = document.getElementById("editNewTagInput");
        if (confirmEditNewTagBtn) {
            confirmEditNewTagBtn.addEventListener("click", () => {
                const newTag = editNewTagInput.value.trim();
                if (!newTag) {
                    alert("Bitte neuen Tag eingeben.");
                    return;
                }


                this.model.addTag(newTag);
                document.dispatchEvent(new Event("tagsUpdated"));
                setTimeout(() => {
                    document.getElementById("editArticleTag").value = newTag;
                }, 100); // Kurze Verzögerung, um sicherzustellen, dass das Dropdown aktualisiert wurde
                editNewTagInput.value = "";
                document.getElementById("editNewTagContainer").style.display = "none";
            });
        }

        // Speichern-Button im Edit-Modal
        const saveEditArticleBtn = document.getElementById("saveEditArticle");
        saveEditArticleBtn.addEventListener("click", () => {
            const id = parseInt(document.getElementById("editArticleId").value);
            const title = document.getElementById("editArticleName").value.trim();
            const description = document.getElementById("editArticleDescription").value.trim();
            const image = document.getElementById("editArticleImage").value.trim();
            let tag = document.getElementById("editArticleTag").value;

            if (tag === "new") {
                const newTag = document.getElementById("editNewTagInput").value.trim();
                if (!newTag) {
                    alert("Bitte neuen Tag eingeben.");
                    return;
                }
                tag = newTag;
                // Auch hier KEIN manuelles <option> erstellen:
                this.model.addTag(newTag);
            }

            if (!title || !description || !image || !tag) {
                alert("Bitte alle Felder ausfüllen.");
                return;
            }

            const updatedArticle = { id, title, description, image, tag };
            this.model.updateArticle(updatedArticle);

            this.articleView.renderItemsInModal(this.model.getItems());

            const modalEl = document.getElementById("articleEditModal");
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();
        });

        // Zeige/neuer Tag-Eingabebereich im Edit-Modal
        const editArticleTagSelect = document.getElementById("editArticleTag");
        editArticleTagSelect.addEventListener("change", () => {
            if (editArticleTagSelect.value === "new") {
                document.getElementById("editNewTagContainer").style.display = "block";
                document.getElementById("editNewTagInput").focus();
            } else {
                document.getElementById("editNewTagContainer").style.display = "none";
            }
        });
    }


    setupModalEventsForNewArticle() {
        const modal = document.getElementById("articleEntryModal");
        if (!modal) return;

        // Kein "showAllArticles"-Listener mehr hier rein,
        // sondern in den Konstruktor verschieben!

        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();
        });

        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("add-article-entry").focus();
            document.getElementById("articleEntryName").value = "";
            document.getElementById("articleEntryTag").value = "";
            document.getElementById("articleEntryDescription").value = "";
            document.getElementById("articleEntryImage").value = "";
            document.getElementById("newTagContainer").style.display = "none";
        });

        const tagSelect = document.getElementById("articleEntryTag");
        const filterDropdown = document.getElementById("newProductTag");
        const newTagContainer = document.getElementById("newTagContainer");
        const newTagInput = document.getElementById("newTagInput");
        const confirmNewTagBtn = document.getElementById("confirmNewTag");

        // Wenn der Benutzer "Neuen Tag" auswählt
        tagSelect.addEventListener("change", () => {
            if (tagSelect.value === "new") {
                newTagContainer.style.display = "block";
                newTagInput.focus();
            } else {
                newTagContainer.style.display = "none";
            }
        });

        // Klick-Event für "Neuen Tag erstellen"
        confirmNewTagBtn.addEventListener("click", () => {
            const newTag = newTagInput.value.trim();
            if (newTag) {
                this.model.addTag(newTag);
                document.dispatchEvent(new Event("tagsUpdated"));
                tagSelect.value = newTag;
                newTagContainer.style.display = "none";
                newTagInput.value = "";
            }
        });


        // "Artikel hinzufügen"‑Button
        const addBtn = document.getElementById("addArticleEntry");
        if (addBtn) {
            addBtn.removeAttribute("data-bs-dismiss");
            addBtn.addEventListener("click", (event) => {
                const nameInput = document.getElementById("articleEntryName").value.trim();
                const tagInput = document.getElementById("articleEntryTag").value;
                const descriptionInput = document.getElementById("articleEntryDescription").value.trim();
                const imageInput = document.getElementById("articleEntryImage").value.trim();
                const newTagInput = document.getElementById("newTagInput").value.trim();

                if (!nameInput) {
                    alert("Bitte Namen eingeben.");
                    return;
                }
                if (!tagInput) {
                    alert("Bitte Tag auswählen.");
                    return;
                }
                if (tagInput === "new" && !newTagInput) {
                    alert("Falls gewünschter Tag nicht gefunden, neuen Tag Titel bitte eingeben.");
                    return;
                }
                if (!descriptionInput) {
                    alert("Bitte Beschreibung eingeben.");
                    return;
                }
                if (!imageInput) {
                    alert("Bitte Bild auswählen.");
                    return;
                }

                const finalTag = tagInput === "new" ? newTagInput : tagInput;
                const newArticle = {
                    id: Date.now(),
                    title: nameInput,
                    description: descriptionInput,
                    image: imageInput,
                    tag: finalTag
                };

                document.addEventListener("showAllArticles", () => {
                    this.filterArticlesByTag(''); // Filter auf leeren Tag -> zeige alle Artikel
                });


                this.model.addArticle(newArticle);
                document.dispatchEvent(new Event("dataLoaded"));
                this.showAllArticles();

                const modal = document.getElementById("articleEntryModal");
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
                const overviewModalElement = document.getElementById("articleModal");
                const overviewModalInstance = new bootstrap.Modal(overviewModalElement);
                overviewModalInstance.show();
            });
        }
    }

    showAllArticles() {
        const items = this.model.getItems();
        this.articleView.renderItemsInModal(items);
    }

    setupModalEvents() {
        const modal = document.getElementById("articleModal");
        if (!modal) return;

        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();
        });

        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("add-list").focus();
            modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            modal.querySelectorAll('input[type="number"]').forEach(input => input.value = "1");
            const tagSelect = modal.querySelector('#newProductTag');
            if (tagSelect) {
                tagSelect.value = '';
            }
            this.selectedItems = {};
            this.filterArticlesByTag('');
        });

        const addToListBtn = document.getElementById("addToListBtn");
        if (addToListBtn) {
            addToListBtn.removeAttribute("data-bs-dismiss");
            addToListBtn.addEventListener("click", (event) => {
                event.preventDefault();
                const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
                const selectedItems = [];

                checkboxes.forEach(cb => {
                    const itemId = parseInt(cb.value);
                    const quantityInput = modal.querySelector(`#quantity-${itemId}`);
                    const quantity = parseInt(quantityInput.value);
                    if (!isNaN(quantity) && quantity > 0) {
                        selectedItems.push({id: itemId, quantity});
                    }
                });

                if (selectedItems.length === 0) {
                    alert("Bitte wählen Sie Artikel aus und geben Sie eine Menge an.");
                    return;
                }

                const detailContainer = document.getElementById("detail-container");
                const listId = parseInt(detailContainer.dataset.currentlistid);
                const list = this.model.getListById(listId);
                if (!list) {
                    alert("Liste nicht gefunden.");
                    return;
                }

                // Artikel hinzufügen / Menge erhöhen
                selectedItems.forEach(item => {
                    const existingItem = list.items.find(i => i.id === item.id);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                        existingItem.checked = false;
                    } else {
                        const newItem = this.model.getItems().find(i => i.id === item.id);
                        if (newItem) {
                            list.items.push({...newItem, quantity: item.quantity, checked: false});
                        }
                    }
                });

                if (list.completed) {
                    list.completed = false;
                }

                this.model.updateList(list);
                this.listView.renderLists(this.model.getLists());
                this.listView.showListDetails(list, this.model.getItems());

                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }

        const tagSelect = modal.querySelector('#newProductTag');
        if (tagSelect) {
            tagSelect.addEventListener('change', (event) => {
                this.filterArticlesByTag(event.target.value);
            });
        }

        this.filterArticlesByTag = (tag) => {
            const articleList = modal.querySelector('#articleList');
            articleList.innerHTML = '';
            let filteredItems;
            if (!tag) {
                filteredItems = this.model.getItems();
            } else {
                filteredItems = this.model.getItemsByTag(tag);
            }

            filteredItems.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'align-items-center');

                const currentQuantity = this.selectedItems[item.id] || 1;
                const isChecked = !!this.selectedItems[item.id];

                li.innerHTML = `
                  <div class="me-2">
                    <input type="checkbox" value="${item.id}" id="item-${item.id}" ${isChecked ? 'checked' : ''}>
                  </div>
                  <img src="${item.image}" alt="${item.title}" class="img-thumbnail me-2" style="max-width: 70px; max-height: 70px;">
                  <div class="flex-grow-1">
                    <label for="item-${item.id}" class="fw-bold mb-0">${item.title}</label>
                    <div class="text-muted">${item.description}</div>
                    <small class="text-muted">${item.tag}</small>
                  </div>
                  <div class="ms-3">
                    <input type="number" id="quantity-${item.id}" value="${currentQuantity}" min="1"
                      class="form-control form-control-sm" style="width:60px;">
                  </div>
                  <div class="ms-3 d-flex flex-column">
                    <button class="btn btn-warning btn-sm edit-article mb-1" data-id="${item.id}" title="Artikel bearbeiten">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-article" data-id="${item.id}" title="Artikel löschen">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                `;
                articleList.appendChild(li);

                const quantityInput = li.querySelector(`#quantity-${item.id}`);
                quantityInput.addEventListener('change', (event) => {
                    this.selectedItems[item.id] = parseInt(event.target.value);
                });

                const checkbox = li.querySelector(`#item-${item.id}`);
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        this.selectedItems[item.id] = parseInt(quantityInput.value);
                    } else {
                        delete this.selectedItems[item.id];
                    }
                });
            });
        };
    }
}
