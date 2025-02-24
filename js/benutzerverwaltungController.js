// benutzerverwaltungController.js
import { User, SharedList } from './benutzerverwaltung.js';

export class UserController {
    constructor(model) {
        this.model = model;
    }

    /**
     * Hier kann man z.B. Benutzer laden, registrieren oder einloggen.
     * Momentan wird nur loadUsers() aufgerufen.
     */
    async init() {
        await this.model.loadUsers();
        console.log("Benutzer wurden geladen:", this.model.users);
    }
}

export class SharedListController {
    constructor(model) {
        this.model = model;
    }

    /**
     * Teilt eine Liste mit einem anderen Benutzer.
     * Legt eine SharedList an, falls es sie noch nicht gibt.
     */
    shareList(listId, ownerId, userId) {
        let sharedList = this.model.sharedLists.find(sl => sl.listId === listId);
        if (!sharedList) {
            sharedList = new SharedList(listId, ownerId);
            this.model.sharedLists.push(sharedList);
        }
        sharedList.shareWithUser(userId);
    }

    /**
     * Entfernt einen Benutzer aus einer bereits geteilten Liste.
     */
    removeSharedUser(listId, userId) {
        let sharedList = this.model.sharedLists.find(sl => sl.listId === listId);
        if (sharedList) {
            sharedList.removeUser(userId);
        }
    }

    /**
     * Gibt alle Benutzer-IDs zurück, die Zugriff auf die Liste haben.
     */
    getSharedUsers(listId) {
        let sharedList = this.model.sharedLists.find(sl => sl.listId === listId);
        return sharedList ? sharedList.sharedUserIds : [];
    }
}
