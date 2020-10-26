//const tc = require('./time_conversion.js');
function min_to_sec(m) { return m*60; }
function min_to_milli(m) { return sec_to_milli(min_to_sec(m)); }

function sec_to_milli(s) { return s*1000; }
function sec_to_min(s) { return s/60; }

function milli_to_sec(mi) { return mi/1000; }
function milli_to_min(mi) { return milli_to_sec(sec_to_min(mi)); }

const WARNING_TIME = sec_to_milli(30);
const FORCE_DELAY = sec_to_milli(5);
// const FORCE_DURATION = tc.min_to_milli(10);
const FORCE_DURATION = sec_to_milli(15);

const REPLY_MESSAGE = (minutes) => `I'll disconnect you in ${minutes} minutes`;
const WARNING_MESSAGE = 'You\'ll be disconnected in ' + milli_to_sec(WARNING_TIME) + ' seconds';
const DISCONNECT_MESSAGE = 'You asked for it, see you';

class UserDeco {
    constructor(msg, time, force, ulti) {
        let init_time = Date.now();
        this.msg = msg;
        this.disconnect_in = time;
        this.is_in_force = false;
        this.force_level = Math.min(2, force + 2*ulti); //0, 1: force, 2: ulti
        /*if (this.isInVoiceChannel()) {
            this.time_since_last_voice_connection = init_time;
        } else {
            this.time_since_last_voice_connection = null;
        }*/
        this.last_deconnection_time = null;
        //this.force_until = init_time + time + FORCE_DURATION;
        this.init_time = init_time;
        this.timeout = null;    }
    setTimeout(callback, time) {
        this.timeout = setTimeout(() => { callback.bind(this)(); }, time);
    }
    init() {
        this.msg.reply(REPLY_MESSAGE(milli_to_min(this.disconnect_in)));

        if (this.disconnect_in > 2*WARNING_TIME) {
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
    force() {
        this.deco();
    }
    isInVoiceChannel() {
        return this.msg.member.voice.channel != null;
    }
    hasReconnected() {
        if (this.is_in_force == false) { return; }

        let force_stop_time = this.last_deconnection_time + FORCE_DURATION;
        if (Date.now() > force_stop_time) {
            this.destroy();
        } else {
            this.setTimeout(this.deco, FORCE_DELAY);
        }
    }
    hasDisconnected() {
        this.last_deconnection_time = Date.now();
    }
    cancel() {

    }
    disconnect() {
        this.msg.member.voice.kick(DISCONNECT_MESSAGE);
    }
    destroyIfValid() {//destroyIfNoForce
        if (this.force_level == 0) {
            this.destroy();
        } else {
            let force_stop_time = this.last_deconnection_time + FORCE_DURATION;
            if (Date.now() > force_stop_time) {
                this.destroy();
            }
        }
    }
    destroy() {
        //users_to_deco.splice(users_to_deco.indexOf(this), 1);
        delete this;
    }
}

module.exports = UserDeco;