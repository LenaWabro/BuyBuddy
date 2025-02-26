// views/articleView.js
export class ArticleView {
    constructor() {
        this.articleList = document.getElementById("articleList");
    }

    renderItemsInModal(items) {
        if (!this.articleList) return;
        this.articleList.innerHTML = "";
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
      `;
            this.articleList.appendChild(li);
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => { item.checked = checkbox.checked; });
            const quantityInput = li.querySelector(`#quantity-${item.id}`);
            quantityInput.addEventListener('input', (e) => { item.quantity = parseInt(e.target.value) || 1; });
        });
    }
}