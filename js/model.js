import { User } from "./benutzerverwaltung.js";
export class Model {
    constructor() {
        this.lists = [];
        this.items = [];
        this.tags = [];
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
            // Beispiel: Setze einen Benutzer als aktuell angemeldeten Benutzer
            // (In einer echten App erfolgt das über ein Login-Formular)
            if (this.users.length > 0) {
                this.currentUser = this.users[0]; // Beispiel: erster Benutzer als currentUser
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
            // Da jedes item nur EINEN Tag (String) hat, passen wir extractTags entsprechend an:
            this.extractTags();
            document.dispatchEvent(new Event("dataLoaded"));
        } catch (error) {
            console.error("Fehler beim Laden der Daten:", error);
        }
    }

    // Wenn jedes Item nur EINEN Tag (String) hat, extrahieren wir die Tags so:
    extractTags() {
        this.tags = [...new Set(this.items.map(item => item.tag))];
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
        this.lists = this.lists.filter(list => list.id !== id); // Entfernt die Liste mit der entsprechenden ID
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


    /**
     * Filtert Artikel nach Tag (String).
     * Wenn kein Tag angegeben wird, gibt es alle Artikel zurück.
     */
    getItemsByTag(tag) {
        if (!tag) return this.items;
        return this.items.filter(item => item.tag === tag);
    }

    /**
     * Fügt einen neuen Tag hinzu, falls er noch nicht existiert.
     */
    addTag(tagName) {
        if (!this.tags.includes(tagName)) {
            this.tags.push(tagName);
            document.dispatchEvent(new Event("tagsUpdated"));
        }
    }

    /**
     * Fügt einen neuen Artikel hinzu (nur EIN Tag möglich).
     */
    addArticle(article) {
        this.items.unshift(article); // Artikel am Anfang einfügen
        this.saveItems();            // Im Local Storage speichern (optional)
        this.extractTags();          // Tags aktualisieren
    }


    /**
     * Speichert Artikel in den Local Storage (optional).
     */
    saveItems() {
        localStorage.setItem('articles', JSON.stringify(this.items));
    }

}
