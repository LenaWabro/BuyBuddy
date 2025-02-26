export class ArticleController {
    constructor(model, articleView, listView) {
        this.model = model;
        this.articleView = articleView;
        this.listView = listView;
        this.selectedItems = {}; // leere Liste für ausgewählte Items

        this.setupModalEvents();
        this.setupModalEventsForNewArticle();
        this.setupArticleEditAndDeleteEvents();
        this.setupEditArticleSave();

        /**Wenn ich alle Artikel in der Übersicht laden möchte wie z. B. nach Hinzufügen eines Artikels oder beim Filter "Alle anzeigen"*/
        document.addEventListener("showAllArticles", () => {
            // Filter auf leeren Tag -> zeige alle Artikel
            this.filterArticlesByTag('');
        });
    }

    /** Diese Methode reagiert nun auf mein Artikel bearbeiten und meinen Liste löschen Button */
    setupArticleEditAndDeleteEvents() {
        const articleList = document.getElementById("articleList");
        if (!articleList) return;
        articleList.addEventListener("click", (event) => {
            // Button zum Bearbeiten
            const editBtn = event.target.closest(".edit-article");
            if (editBtn) {
                const articleId = parseInt(editBtn.getAttribute("data-id")); // holt die Data-ID des Artikels – jeder Artikel trägt eine eigene ID mit sich
                this.openEditArticleModal(articleId); // neues Modal öffnen mit dem richtig übergebenen articleID
            }
            // Button zum Löschen
            const deleteBtn = event.target.closest(".delete-article");
            if (deleteBtn) {
                const articleId = parseInt(deleteBtn.getAttribute("data-id"));
                this.deleteArticleWithConfirmation(articleId); // startet die Löschfunktion
            }
        });
    }

    /** Diese Methode wird aufgerufen, wenn der Bearbeiten-Button geklickt wird.
     Sie sorgt dafür, dass das Bearbeitungs-Modal mit den richtigen Daten gefüllt und geöffnet wird.
     Holt den richtigen Artikel basierend auf der articleId */
    openEditArticleModal(articleId) {
        const article = this.model.getItems().find(item => item.id === articleId);
        if (!article) return;

        // Füllt das Bearbeitungs-Formular mit den Artikel-Daten
        document.getElementById("editArticleId").value = article.id;
        document.getElementById("editArticleName").value = article.title;
        document.getElementById("editArticleDescription").value = article.description;
        document.getElementById("editArticleImage").value = article.image;

        // Zeigt das Bild unten an, falls eines existiert
        const preview = document.getElementById("editArticleImagePreview");
        preview.src = article.image;
        preview.style.display = article.image ? "block" : "none";

        // Dropdown aktualisieren und den aktuellen Tag setzen – Delegation an die View
        const editArticleTag = document.getElementById("editArticleTag");
        this.articleView.populateEditArticleTagDropdown(editArticleTag, this.model.tags, article.tag);

        /** Falls der Benutzer "Neuen Tag erstellen" auswählt, zeige das Eingabefeld
         Falls der Nutzer einen neuen Tag erstellen will ("new" ausgewählt), erscheint ein Eingabefeld.
         Falls er einen vorhandenen Tag wählt, wird das Eingabefeld ausgeblendet.
         */
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
        /** this.model.lists → Holt alle Listen
         some(list => list.items.some(item => item.id === articleId))
         Schaut, ob in irgendeiner Liste ein Artikel mit der gleichen ID (articleId) existiert.
         Falls der Artikel noch in einer Liste ist, wird er nicht gelöscht, sondern es erscheint eine Warnung.
         */
        const isUsed = this.model.lists.some(list => list.items.some(item => item.id === articleId));
        if (isUsed) {
            alert("Dieser Artikel wird noch in einer Liste verwendet und kann daher nicht gelöscht werden.");
            return;
        }
        if (confirm("Möchtest du diesen Artikel wirklich löschen?")) {
            const articleList = document.getElementById("articleList");
            // Sucht in der Liste das richtige <li>-Element anhand der data-id.
            // .closest("li") stellt sicher, dass das gesamte <li>-Element des Artikels gefunden wird.
            const liElement = articleList.querySelector(`.delete-article[data-id="${articleId}"]`).closest("li");
            liElement.classList.add("swipe-out"); // CSS-Klasse für Animation
            liElement.addEventListener("animationend", () => { // wartet bis Animation vorbei
                this.model.deleteArticle(articleId); // danach wird gelöscht nach der articleId
                this.articleView.renderItemsInModal(this.model.getItems()); // Aktualisiert die Artikel-Liste im Modal
            }, {once: true});
        }
    }

    /** Diese Methode sorgt dafür, dass Änderungen an einem Artikel gespeichert werden.
     Sie behandelt das Speichern eines neuen Tags sowie das Aktualisieren eines bestehenden Artikels.
     * Wenn auf "Speichern" geklickt wird:
     * Holt die Werte aus den Eingabefeldern (ID, Name, Beschreibung, Bild, Tag)
     * Falls ein neuer Tag gewählt wurde, überprüft er, ob er eingegeben wurde
     * Erstellt ein neues Artikel-Objekt mit den aktualisierten Daten
     * Speichert das geänderte Objekt im Model (this.model.updateArticle(updatedArticle))
     * Aktualisiert die Artikelansicht im Modal (this.articleView.renderItemsInModal(this.model.getItems()))
     */
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
            const title = document.getElementById("editArticleName").value.trim(); // entfernt alle Leerzeichen am Anfang und Ende
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

    /** Hinzufügen eines neuen Artikels */
    setupModalEventsForNewArticle() {
        const modal = document.getElementById("articleEntryModal");
        if (!modal) return;

        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus();
        });

        // Setzt alle Felder zurück, wenn das Modal geschlossen wird
        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("add-article-entry").focus();
            document.getElementById("articleEntryName").value = "";
            document.getElementById("articleEntryTag").value = "";
            document.getElementById("articleEntryDescription").value = "";
            document.getElementById("articleEntryImage").value = "";
            document.getElementById("newTagContainer").style.display = "none";
        });

        const tagSelect = document.getElementById("articleEntryTag");
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

                // erstellt neuen Artikel mit id Date.now()
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

                /**  Eine Instanz ist ein exemplarisches Objekt einer Klasse.
                 Das bedeutet: Du kannst mit einer Instanz auf bestimmte Funktionen zugreifen (wie show() oder hide()).
                 Bootstrap-Modals sind keine normalen divs, sondern spezielle Elemente, die JavaScript-gesteuert sind.
                 Um mit ihnen zu arbeiten (sie zu öffnen oder zu schließen), muss man eine Instanz des Bootstrap-Modals erstellen.
                 */
                const modal = document.getElementById("articleEntryModal"); // finde das Modal
                const modalInstance = bootstrap.Modal.getInstance(modal); // Holt die existierende Bootstrap-Instanz dieses Modals
                if (modalInstance) {
                    modalInstance.hide(); // Falls es bereits eine Instanz gibt → Schließt (hide()) das Modal
                }
                const overviewModalElement = document.getElementById("articleModal");
                const overviewModalInstance = new bootstrap.Modal(overviewModalElement);
                overviewModalInstance.show();
            });
        }
    }

    /** Wenn das Modal für Artikel geöffnet wird
     Nach dem Hinzufügen eines neuen Artikels
     Nach dem Bearbeiten oder Löschen eines Artikels */
    showAllArticles() {
        const items = this.model.getItems(); // ruft alle gespeicherten Artikel ab.
        this.articleView.renderItemsInModal(items); // renderItemsInModal(items)-Methode gehört zur articleView.
        // Sie sorgt dafür, dass die Artikel visuell im Modal dargestellt werden.
    }

    setupModalEvents() {
        const modal = document.getElementById("articleModal");
        if (!modal) return;

        modal.addEventListener("shown.bs.modal", () => {
            modal.querySelector("button").focus(); // besser für Tastaturnutzung
        });

        /** Setzt alle Checkboxen und Mengen zurück, wenn das Modal geschlossen wird */
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

        /** Fügt Artikel einer Liste hinzu
         * Alle aktivierten Checkboxen werden gesammelt
         * Die zugehörige Menge wird ausgelesen
         * Falls kein Artikel ausgewählt wurde, erscheint eine Warnung
         */
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

                /** Falls der Artikel schon in der Liste ist → Menge wird erhöht
                 Falls der Artikel neu ist → Wird zur Liste hinzugefügt */
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

                /** Falls die Liste als "abgeschlossen" markiert war, wird sie wieder offen
                 Die Liste wird in der Datenbank aktualisiert
                 Die Ansicht wird aktualisiert, um die neue Liste anzuzeigen
                 Das Modal wird geschlossen */
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

        // Falls ein Nutzer eine Tag-Kategorie wählt, werden nur Artikel mit diesem Tag angezeigt
        const tagSelect = modal.querySelector('#newProductTag');
        if (tagSelect) {
            tagSelect.addEventListener('change', (event) => {
                this.filterArticlesByTag(event.target.value);
            });
        }

        // Hier wird nun das Filtern an die View delegiert
        this.filterArticlesByTag = (tag) => {
            let filteredItems;
            if (!tag) {
                filteredItems = this.model.getItems();
            } else {
                filteredItems = this.model.getItemsByTag(tag);
            }
            // Übergibt die gefilterten Artikel und die selektierten Items an die View
            this.articleView.renderFilteredItems(filteredItems, this.selectedItems);
        };
    }
}
