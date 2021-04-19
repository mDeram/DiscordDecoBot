const User = require('./user.js');

const ALREADY_REGISTERED_EXCEPTION = (content) =>
    `User already registered, use "!deco cancel" before using "${content}"`;
const CANCEL_NOTHING_EXCEPTION = 'Nothing to cancel';

class UserManager {
    constructor() {
        this.users = new Map();
    }

    push(id, user) {
        this.users.set(id, user);
    }
    remove(id) {
        this.users.delete(id);
    }

    forEach(cb) {
        this.users.forEach(cb);
    }
    flush(cb) {
        const userIter = this.users.values();

        for (const user of userIter) {
            cb(user);
            user.destroy();
        }
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

    add(id, msg, duration, force, ulti) {
        if (this.has(id))
            throw ALREADY_REGISTERED_EXCEPTION;

        const user = new User(() => this.remove(id), msg, duration, force, ulti);
        this.push(id, user);
    }
    hasReconnected(id) {
        this.get(id)?.hasReconnected();
    }
    hasDisconnected(id) {
        this.get(id)?.hasDisconnected();
    }
    cancel(id, msg) {
        if (!this.has(id))
            throw CANCEL_NOTHING_EXCEPTION;

        this.get(id).cancel();
    }
}

module.exports = UserManager;
