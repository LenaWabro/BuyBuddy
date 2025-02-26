
import { User } from "./benutzerverwaltung.js";
export class Model {
    constructor() {
        this.lists = [];
        this.items = [];
        this.tags = ["Obst", "Gemüse", "Milchprodukt", "Backware"];
        this.users = [];
        this.sharedLists = [];
        // Observer-Array hinzufügen
        this.observers = [];
        this.loadData();
        this.loadUsers();
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers(eventName, data) {
        console.log("Observer benachrichtigen",this.lists);
        this.observers.forEach(observer => {
            // Hier kannst du definieren, ob ein Observer eine Funktion ist oder ein Objekt mit einer notify-Methode
            if (typeof observer === 'function') {
                observer(eventName, data);
            } else if (observer.notify && typeof observer.notify === 'function') {
                observer.notify(eventName, data);
            }
        });
    }
    // Alle Observer benachrichtigen
    notify(data) {
        this.observers.forEach(observer => observer(data));
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
            this.extractTags();

            // Observer benachrichtigen
            this.notifyObservers("dataLoaded", { lists: this.lists, items: this.items });

            // +++ WICHTIG: DOM-Event auslösen, damit main.js den Listener ausführt +++
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
        this.notifyObservers();
    }

    deleteTag(tagName) {
        const isUsed = this.items.some(item => item.tag === tagName);
        if (isUsed) {
            alert("Dieser Tag wird noch von einem Artikel verwendet und kann daher nicht gelöscht werden.");
            return;
        }
        this.tags = this.tags.filter(tag => tag !== tagName);
        document.dispatchEvent(new Event("tagsUpdated"));
        this.notifyObservers();
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
        this.notifyObservers();
    }

    updateList(updatedList) {
        this.lists = this.lists.map(list => list.id === updatedList.id ? updatedList : list);
    }

    deleteList(id) {
        this.lists = this.lists.filter(list => list.id !== id);
        console.log("Liste löschen");
        this.notifyObservers();
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
        this.notifyObservers();
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
        this.notifyObservers();
    }

    addArticle(article) {
        this.items.unshift(article);
        this.saveItems();
        this.extractTags();
        this.notifyObservers();
    }

    saveItems() {
        localStorage.setItem('articles', JSON.stringify(this.items));
        this.notifyObservers();
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