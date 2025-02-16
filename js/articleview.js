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
            <input type="checkbox" value="${item.id}" class="form-check-input me-2">
            <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
            <span>${item.tag} - ${item.title} - ${item.description}</span>
            <input type="number" value="1" min="1" id="quantity-${item.id}" class="form-control ms-3" style="width: 60px;">
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
