// models/model.js
import { User } from "./benutzerverwaltung.js"; // Passe ggf. den Pfad an

export class Model {
    constructor() {
        this.lists = [];
        this.items = [];
        // Setze die Standard-Tags einmalig
        this.tags = ["Obst", "Gemüse", "Milchprodukt", "Backware"];
        this.users = [];
        this.sharedLists = [];
        this.loadData();
        this.loadUsers();
    }

    async loadUsers() {
        try {
            const response = await fetch("./data/user.json");
            const data = await response.json();
            this.users = data.map(user => new User(user.id, user.name, user.email));
            console.log("Benutzer geladen:", this.users);
            if (this.users.length > 0) {
                this.currentUser = this.users[0];
                console.log("Aktueller Benutzer:", this.currentUser);
            }
        } catch (error) {
            console.error("Fehler beim Laden der Benutzer:", error);
        }
    }

    async loadData() {
        try {
            const response = await fetch("./data/einkaufsliste.json");
            const data = await response.json();
            this.lists = data.lists;
            this.items = data.items;
            this.extractTags(); // Aktualisiere die Tags basierend auf den Artikeln
            document.dispatchEvent(new Event("dataLoaded"));
        } catch (error) {
            console.error("Fehler beim Laden der Daten:", error);
        }
    }

    extractTags() {
        // Extrahiere die Tags aus den Artikeln und füge nur neue Tags hinzu
        const itemTags = this.items.map(item => item.tag);
        const uniqueItemTags = [...new Set(itemTags)];
        uniqueItemTags.forEach(tag => {
            if (!this.tags.includes(tag)) {
                this.tags.push(tag);
            }
        });
    }

    deleteTag(tagName) {
        const isUsed = this.items.some(item => item.tag === tagName);
        if (isUsed) {
            alert("Dieser Tag wird noch von einem Artikel verwendet und kann daher nicht gelöscht werden.");
            return;
        }
        this.tags = this.tags.filter(tag => tag !== tagName);
        document.dispatchEvent(new Event("tagsUpdated"));
    }

    getItems() {
        return this.items;
    }

    getLists() {
        return this.lists;
    }

    getListById(id) {
        return this.lists.find(list => list.id === id);
    }

    addList(newList) {
        this.lists.push(newList);
    }

    updateList(updatedList) {
        this.lists = this.lists.map(list => list.id === updatedList.id ? updatedList : list);
    }

    deleteList(id) {
        this.lists = this.lists.filter(list => list.id !== id);
    }

    updateItems(updatedItems) {
        updatedItems.forEach(updatedItem => {
            const list = this.lists.find(l => l.id === updatedItem.listId);
            if (list) {
                const itemIndex = list.items.findIndex(item => item.id === updatedItem.id);
                if (itemIndex !== -1) {
                    list.items[itemIndex] = updatedItem;
                }
            }
        });
    }

    getItemsByTag(tag) {
        if (!tag) return this.items;
        return this.items.filter(item => item.tag === tag);
    }

    addTag(tagName) {
        if (!this.tags.includes(tagName)) {
            this.tags.push(tagName);
            document.dispatchEvent(new Event("tagsUpdated"));
        }
    }

    addArticle(article) {
        this.items.unshift(article);
        this.saveItems();
        this.extractTags();
    }

    saveItems() {
        localStorage.setItem('articles', JSON.stringify(this.items));
    }

    deleteArticle(articleId) {
        this.items = this.items.filter(item => item.id !== articleId);
        this.extractTags();
        this.saveItems();
    }

    updateArticle(updatedArticle) {
        this.items = this.items.map(item => item.id === updatedArticle.id ? updatedArticle : item);
        this.extractTags();
        this.saveItems();
    }
}
