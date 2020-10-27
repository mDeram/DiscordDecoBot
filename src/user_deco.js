//const tc = require('./time_conversion.js');
function min_to_sec(m) { return m*60; }
function min_to_milli(m) { return sec_to_milli(min_to_sec(m)); }

function sec_to_milli(s) { return s*1000; }
function sec_to_min(s) { return s/60; }

function milli_to_sec(mi) { return mi/1000; }
function milli_to_min(mi) { return milli_to_sec(sec_to_min(mi)); }

const WARNING_TIME = sec_to_milli(30);
const FORCE_DELAY = sec_to_milli(5);
// const FORCE_DURATION = min_to_milli(10);
const FORCE_DURATION = sec_to_milli(15);

const REPLY_MESSAGE = (minutes) => `I'll disconnect you in ${minutes} minutes`;
const WARNING_MESSAGE = 'You\'ll be disconnected in ' + milli_to_sec(WARNING_TIME) + ' seconds';
const DISCONNECT_MESSAGE = 'You asked for it, see you';

class UserDeco {
    constructor(manager, msg, time, force, ulti) {
        let init_time = Date.now();
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

        let is_warning_possible = this.disconnect_in > 2*WARNING_TIME;
        if (is_warning_possible) {
            let time_before_warning = this.disconnect_in - WARNING_TIME;
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
        this.destroyIfValid();
    }
    cancel() {

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

        if (this.is_in_force && this.timeout != null) {
            clearTimeout(this.timeout);
            this.timeout = null;
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
    destroyIfValid() {
        if (this.force_level == 0 || !this.isForceTimeValid()) {
            this.destroy();
        }
    }
    destroy() {
        this.manager.remove(this);
        delete this;
    }
}

module.exports = UserDeco;