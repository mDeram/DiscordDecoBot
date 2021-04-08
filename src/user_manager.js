class UserManager {
    constructor() {
        this.users = new Map();
    }
    push(user_deco) {
        this.users.set(user_deco.msg.member, user_deco);
    }
    remove(member) {
        this.users.delete(member);
    }
    get(member) {
        return this.users.has(member);
    }
    count() {
        return this.users.size;
    }
}

module.exports = UserManager;
