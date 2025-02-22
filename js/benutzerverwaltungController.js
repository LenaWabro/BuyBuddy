export class UserController {
    constructor(model) {
        this.model = model;
    }

    async init() {
        await this.model.loadUsers();
    }
}

export class SharedListController {
    constructor(model) {
        this.model = model;
    }

    shareList(listId, ownerId, userId) {
        let sharedList = this.model.sharedLists.find(sl => sl.listId === listId);
        if (!sharedList) {
            sharedList = new SharedList(listId, ownerId);
            this.model.sharedLists.push(sharedList);
        }
        sharedList.shareWithUser(userId);
    }

    removeSharedUser(listId, userId) {
        let sharedList = this.model.sharedLists.find(sl => sl.listId === listId);
        if (sharedList) {
            sharedList.removeUser(userId);
        }
    }

    getSharedUsers(listId) {
        let sharedList = this.model.sharedLists.find(sl => sl.listId === listId);
        return sharedList ? sharedList.sharedUserIds : [];
    }
}
