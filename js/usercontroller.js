export class UserController {
    constructor(model) {
        this.model = model;
    }

    async init() {
        await this.model.loadUsers();
    }

    getUsers() {
        return this.model.users;
    }
}
