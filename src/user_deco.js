//const tc = require('./time_conversion.js');
function min_to_sec(m) { return m*60; }
function min_to_milli(m) { return sec_to_milli(min_to_sec(m)); }

function sec_to_milli(s) { return s*1000; }
function sec_to_min(s) { return s/60; }

function milli_to_sec(mi) { return mi/1000; }
function milli_to_min(mi) { return milli_to_sec(sec_to_min(mi)); }

let WARNING_TIME = sec_to_milli(30);
let FORCE_DELAY = sec_to_milli(5);
let FORCE_DURATION = min_to_milli(10);

if (process.env.DEBUG == true) {
    WARNING_TIME = sec_to_milli(10);
    FORCE_DELAY = sec_to_milli(5);
    FORCE_DURATION = sec_to_milli(10);
}

const REPLY_MESSAGE = (minutes) => `I'll disconnect you in ${minutes} minutes`;
const CANCEL_MESSAGE = 'I canceled your disconnection succesfully! Have fun!';
const CANCEL_IMPOSSIBLE_MESSAGE = 'You\'re in ultimate force mode, I can\'t cancel...';
const WARNING_MESSAGE = 'You\'ll be disconnected in ' + milli_to_sec(WARNING_TIME) + ' seconds';
const DISCONNECT_MESSAGE = 'You asked for it, see you';

class UserDeco {
    constructor(manager, msg, time, force, ulti) {
        const init_time = Date.now();
        this.manager = manager;
        this.msg = msg;
        this.disconnect_in = time;
        this.is_in_force = false;
        this.force_level = Math.min(2, force + 2*ulti); //0, 1: force, 2: ulti
        this.last_deconnection_time = null;
        this.init_time = init_time;
        this.timeout = null;
    }
    setTimeout(callback, time) {
        this.timeout = setTimeout(() => { callback.bind(this)(); }, time);
    }
    init() {
        this.msg.reply(REPLY_MESSAGE(milli_to_min(this.disconnect_in)));

        const can_warn = this.disconnect_in > 2*WARNING_TIME;
        if (can_warn) {
            const time_before_warning = this.disconnect_in - WARNING_TIME;
            this.setTimeout(this.warning, time_before_warning);
        } else {
            this.setTimeout(this.deco, this.disconnect_in);
        }
    }
    warning() {
        this.msg.reply(WARNING_MESSAGE);

        this.setTimeout(this.deco, WARNING_TIME);
    }
    deco() {
        this.disconnect();
        this.is_in_force = true;

        const can_destroy = this.force_level == 0 || !this.isForceTimeValid()
        if (can_destroy) {
            this.destroy();
        }
    }
    cancel() {
        if (this.force_level == 2) {
            this.msg.reply(CANCEL_IMPOSSIBLE_MESSAGE);
        } else {
            this.clearTimeout();
            this.msg.reply(CANCEL_MESSAGE);
            destroy();
        }
    }
    isInVoiceChannel() {
        return this.msg.member.voice.channel != null;
    }
    hasReconnected() {
        if (!this.is_in_force) { return; }

        if (this.isForceTimeValid()) {
            this.setTimeout(this.deco, FORCE_DELAY);
        } else {
            this.destroy();
        }
    }
    hasDisconnected() {
        this.last_deconnection_time = Date.now();

        if (this.is_in_force) {
            this.clearTimeout();
        }
    }
    disconnect() {
        this.msg.member.voice.kick(DISCONNECT_MESSAGE);
        this.hasDisconnected();
    }
    getForceStopTime() {
        return this.last_deconnection_time + FORCE_DURATION;
    }
    isForceTimeValid() {
        return Date.now() <= this.getForceStopTime();
    }
    clearTimeout() {
        if (this.timeout != null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    destroy() {
        this.manager.remove(this);
        delete this;
    }
}

module.exports = UserDeco;