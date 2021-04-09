class UserManager {
    constructor() {
        this.users = new Map();
    }
    push(id, user_deco) {
        this.users.set(id, user_deco);
    }
    remove(id) {
        this.users.delete(id);
    }
    get(id) {
        return this.users.get(id);
    }
    has(id) {
        return this.users.has(id);
    }
    count() {
        return this.users.size;
    }
}

module.exports = UserManager;
