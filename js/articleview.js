/**
 Die Methode erstellt HTML-Elemente und zeigt die Artikel an → UI-Darstellung.
 Sie verändert das DOM, aber speichert keine Daten dauerhaft.
 */
export class ArticleView {
    constructor() {
        this.articleList = document.getElementById("articleList");
    }

    /** Diese Methode zeigt Artikel in einer Liste im Modal an.
     erstellt für jeden Artikel einen Listeneintrag (<li>), der im HTML dargestellt wird.
     Nutzer können Artikel auswählen (Checkbox) und eine Anzahl eingeben.
     Änderungen (Checkbox & Anzahl) werden direkt im item-Objekt gespeichert. */
    renderItemsInModal(items) {
        if (!this.articleList) return;
        this.articleList.innerHTML = ""; // leert meine Liste
        items.forEach(item => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
        <div class="me-2">
          <input type="checkbox" value="${item.id}" id="item-${item.id}">
        </div>
        <img src="${item.image}" alt="${item.title}" class="img-thumbnail me-2 article-thumbnail">
        <div class="flex-grow-1 article-info">
          <label for="item-${item.id}" class="fw-bold mb-0">${item.title}</label>
          <div class="text-muted">${item.description}</div>
          <small class="text-muted">${item.tag}</small>
        </div>
        <div class="ms-3">
          <input type="number" id="quantity-${item.id}" value="1" min="1" class="form-control form-control-sm article-quantity">
        </div>
        <div class="ms-3 d-flex flex-column">
          <button class="btn btn-warning btn-sm edit-article mb-1" data-id="${item.id}" title="Artikel bearbeiten">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-danger btn-sm delete-article" data-id="${item.id}" title="Artikel löschen">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `; // Im innerHTML ist alles, was für meine Artikel in der Artikelübersicht erstellt wird (z. B. Checkbox)
            this.articleList.appendChild(li); // Fügt die Listeneinträge in die Artikel-Liste ein
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => { item.checked = checkbox.checked; }); // Speichert, ob ein Item angeklickt wurde
            const quantityInput = li.querySelector(`#quantity-${item.id}`);
            quantityInput.addEventListener('input', (e) => { item.quantity = parseInt(e.target.value) || 1; }); // geänderte Anzahl speichern
        });
    }

    /** Diese Methode rendert gefilterte Artikel, inkl. individueller Mengen und Checkbox-Zustand,
     wie sie im Filter-Modal benötigt werden. */
    renderFilteredItems(items, selectedItems) {
        if (!this.articleList) return;
        this.articleList.innerHTML = "";
        items.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'align-items-center');

            const currentQuantity = selectedItems[item.id] || 1;
            const isChecked = !!selectedItems[item.id];

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
            this.articleList.appendChild(li);

            const quantityInput = li.querySelector(`#quantity-${item.id}`);
            quantityInput.addEventListener('change', (event) => {
                selectedItems[item.id] = parseInt(event.target.value);
            });

            const checkbox = li.querySelector(`#item-${item.id}`);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selectedItems[item.id] = parseInt(quantityInput.value);
                } else {
                    delete selectedItems[item.id];
                }
            });
        });
    }

    /** Diese Methode füllt das Dropdown im Edit-Modal mit den verfügbaren Tags
     und setzt den aktuell ausgewählten Tag.
     Falls der aktuelle Tag noch nicht in den bekannten Tags enthalten ist, wird er zusätzlich hinzugefügt. */
    populateEditArticleTagDropdown(dropdownElement, tags, currentTag) {
        dropdownElement.innerHTML = `<option value="">Wähle einen Tag</option>`;
        tags.forEach(tag => {
            dropdownElement.innerHTML += `<option value="${tag}">${tag}</option>`;
        });
        // Falls currentTag gesetzt ist und noch nicht in tags enthalten ist, hinzufügen:
        if (currentTag && !tags.includes(currentTag)) {
            dropdownElement.innerHTML += `<option value="${currentTag}">${currentTag}</option>`;
        }
        dropdownElement.innerHTML += `<option value="new">Neuen Tag erstellen...</option>`;
        setTimeout(() => {
            dropdownElement.value = currentTag || "";
        });
    }
}
