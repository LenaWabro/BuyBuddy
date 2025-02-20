// model.js
import { User } from "./user.js";


export class Model {
    constructor() {
        this.lists = [];  // Einkaufslisten
        this.items = [];  // Artikel
        this.tags = [];   // Tags
        this.users = [];  // Speichert Benutzer aus user.json
        this.loadData();
    }
    async loadUsers() {
        try {
            const response = await fetch("./data/user.json");
            const data = await response.json();
            this.users = data.map(user => new User(user.id, user.name, user.email));
            console.log("Benutzer geladen:", this.users);
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

            // Tags aus den Artikeln extrahieren
            this.extractTags();

            document.dispatchEvent(new Event("dataLoaded"));
        } catch (error) {
            console.error("Fehler beim Laden der Daten:", error);
        }
    }

    /**
     * Extrahiert alle einzigartigen Tags aus den Artikeln
     */
    extractTags() {
        this.tags = [...new Set(this.items.flatMap(item => item.tags || []))];
    }

    /*getItems() {
        return this.items;
    }

    getLists() {
        return this.lists;
    }

    getListById(id) {
        return this.lists.find(list => list.id === id);
    }

    getItemsByTag(tagName) {
        return this.items.filter(item => item.tags.includes(tagName));
    }

     */

    /*

      Fügt einen neuen Tag hinzu, falls er noch nicht existiert
     */
    addTag(tagName) {
        if (!this.tags.includes(tagName)) {
            this.tags.push(tagName);
            document.dispatchEvent(new Event("tagsUpdated"));
        }
    }

    /**
     * Erstellt einen neuen Artikel mit Titel, Bild und Tags
     */
    createItem(title, image, tags = []) {
        const newItem = {
            id: Date.now(),
            title: title,
            image: image,
            tags: tags
        };

        this.items.push(newItem);

        // Tags hinzufügen, falls sie nicht existieren
        tags.forEach(tag => this.addTag(tag));

        document.dispatchEvent(new Event("itemAdded"));
        return newItem;
    }
}
