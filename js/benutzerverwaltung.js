export class User {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}


export class SharedList {
    constructor(listId, ownerId) {
        this.listId = listId;
        this.ownerId = ownerId;
        this.sharedUserIds = [];
    }

    shareWithUser(userId) {
        if (!this.sharedUserIds.includes(userId)) {
            this.sharedUserIds.push(userId);
        }
    }

    removeUser(userId) {
        this.sharedUserIds = this.sharedUserIds.filter(id => id !== userId);
    }
}
