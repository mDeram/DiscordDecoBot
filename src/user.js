const tc = require('./time_conversion.js');

let WARNING_TIME = tc.sec_to_milli(30);
let FORCE_DELAY = tc.sec_to_milli(5);
let FORCE_DURATION = tc.min_to_milli(10);

if (process.env.DEBUG) {
    WARNING_TIME = tc.sec_to_milli(10);
    FORCE_DELAY = tc.sec_to_milli(5);
    FORCE_DURATION = tc.sec_to_milli(10);
}

const REPLY_MESSAGE = (minutes) => `I'll disconnect you in ${minutes} minutes`;
const CANCEL_MESSAGE = 'I canceled your disconnection succesfully! Have fun!';
const CANCEL_IMPOSSIBLE_MESSAGE = 'You\'re in ultimate force mode, I can\'t cancel...';
const WARNING_MESSAGE = 'You\'ll be disconnected in ' + tc.milli_to_sec(WARNING_TIME) + ' seconds';
const DISCONNECT_MESSAGE = 'You asked for it, see you';
const DISCONNECT_IMPOSSIBLE_MESSAGE = (err) => `For some reason I can't disconnect you (Error: ${err})`;

class User {
    constructor(remove_cb, msg, duration, force, ulti) {
        this.init_time = Date.now();
        this.remove_cb = remove_cb;
        this.msg = msg;
        this.deco_duration = duration; 
        this.force_time = this.init_time + duration + FORCE_DURATION;
        this.force_level = Math.min(2, force + 2*ulti); //0 | 1: force | 2: ulti
        this.forcing = false;
        this.timeout = null;
        this.init();
    }
    init() {
        this.msg.reply(REPLY_MESSAGE(tc.milli_to_min(this.deco_duration)));

        if (this.canWarn()) {
            this.setTimeout(this.warning, this.getTimeBeforeWarning());
        } else {
            this.setTimeout(this.deco, this.deco_duration);
        }
    }
    warning() {
        this.msg.reply(WARNING_MESSAGE);
        this.setTimeout(this.deco, WARNING_TIME);
    }
    deco() {
        this.disconnect();
        this.forcing = true;

        if (this.canDestroy())
            this.destroy();

        // hasDisconnected will get called twice if the user was connected
        // but only once if he wasn't.
        this.hasDisconnected();
    }
    cancel() {
        if (this.force_level == 2) {
            this.msg.reply(CANCEL_IMPOSSIBLE_MESSAGE);
        } else {
            this.msg.reply(CANCEL_MESSAGE);
            this.destroy();
        }
    }

    disconnect() {
        this.msg.member.voice.kick(DISCONNECT_MESSAGE)
            .catch(err => this.msg.reply(DISCONNECT_IMPOSSIBLE_MESSAGE(err)));
    }
    hasReconnected() {
        if (!this.forcing)
            return;

        if (this.isForceTimeValid()) {
            this.setTimeout(this.deco, FORCE_DELAY);
        } else {
            this.destroy();
        }
    }
    hasDisconnected() {
        if (!this.forcing)
            return;
        
        this.setTimeout(this.destroy, this.getTimeBeforeDestroy());
    }
    getStatus() {
        return this.forcing;
    }

    canWarn() {
        return this.deco_duration > 2*WARNING_TIME;
    }
    canDestroy() {
        return this.force_level == 0 || !this.isForceTimeValid();
    }
    isForceTimeValid() {
        return Date.now() <= this.force_time;
    }
    getTimeBeforeWarning() {
        return this.deco_duration - WARNING_TIME;
    }
    getTimeBeforeDestroy() {
        return this.force_time - Date.now();
    }
    setTimeout(callback, time) {
        this.clearTimeout();
        this.timeout = setTimeout(() => { callback.bind(this)(); }, time);
    }
    clearTimeout() {
        if (!this.timeout)
            return;

        clearTimeout(this.timeout);
        this.timeout = null;
    }
    destroy() {
        this.clearTimeout();
        this.remove_cb();
        delete this;
    }
}

module.exports = User;
