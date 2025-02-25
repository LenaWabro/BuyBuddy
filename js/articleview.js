export class ArtikelView {
    constructor() {
        // Wir greifen hier auf den Container im Modal zu:
        this.articleList = document.getElementById("articleList");
        this.articleContainer = document.getElementById("article-container");
    }

    renderItemsInModal(items) {
        if (!this.articleList) return;
        this.articleList.innerHTML = ""; // Leere vorherige Artikel
        // Artikel im Modal rendern
        items.forEach(item => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
    <div class="me-2">
        <input type="checkbox" value="${item.id}" id="item-${item.id}">
    </div>
    
    <img src="${item.image}" alt="${item.title}" 
         class="img-thumbnail me-2" 
         style="max-width: 70px; max-height: 70px;">

    <div class="flex-grow-1">
        <label for="item-${item.id}" class="fw-bold mb-0">${item.title}</label>
        <div class="text-muted">${item.description}</div>
        <small class="text-muted">${item.tag}</small>
    </div>
    
    <div class="ms-3">
        <input type="number" id="quantity-${item.id}" 
               value="1" min="1" 
               class="form-control form-control-sm" 
               style="width:60px;">
    </div>
`;

            this.articleList.appendChild(li);

            // Event-Listener für das Abhaken der Artikel
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                item.checked = checkbox.checked;
            });

            // Menge erfassen
            const quantityInput = li.querySelector(`#quantity-${item.id}`);
            quantityInput.addEventListener('input', (e) => {
                item.quantity = parseInt(e.target.value) || 1; // Verhindert NaN bei ungültiger Eingabe
            });

        });


    }
}