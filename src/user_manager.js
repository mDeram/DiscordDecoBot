class UserManager {
    constructor() {
        this.users = [];
    }
    push(user_deco) {
        this.users.push(user_deco);
    }
    remove(user_deco) {
        this.users.splice(this.users.indexOf(user_deco), 1);
    }
    get(member) {
        return this.users.find(user => user.msg.member == member);
    }
    count() {
        return this.users.length;
    }
}

module.exports = UserManager;