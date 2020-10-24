require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

function min_to_sec(m) { return m*60; }
function min_to_milli(m) { return sec_to_milli(min_to_sec(m)); }

function sec_to_milli(s) { return s*1000; }
function sec_to_min(s) { return s/60; }

function milli_to_sec(mi) { return mi/1000; }
function milli_to_min(mi) { return milli_to_sec(sec_to_min(mi)); }

const WARNING_TIME = sec_to_milli(30);
const FORCE_DELAY = sec_to_milli(5);
const FORCE_DURATION = min_to_milli(10);

const REPLY_MESSAGE = (minutes) => `I'll disconnect you in ${minutes} minutes`;
const WARNING_MESSAGE = 'You\'ll be disconnected in ' + milli_to_sec(WARNING_TIME) + ' seconds';
const DISCONNECT_MESSAGE = 'You asked for it, see you';

let users_to_deco = [];

class UserDeco {
    constructor(msg, time, force, time_stamp) {
        this.msg = msg;
        this.time_to_disconnect = time;
        this.do_force = force;
        this.force_time_since_last_voice_connection = time_stamp + time;
        this.time_stamp = time_stamp;
        this.timeout = null;
        users_to_deco.push(this);
    }
    set_timeout(callback, time) {
        this.timeout = setTimeout(() => { callback.bind(this)(); }, time);
    }
    init() {
        this.msg.reply(REPLY_MESSAGE(milli_to_min(this.time_to_disconnect)));

        let time_before_warning = this.time_to_disconnect - WARNING_TIME;
        if (time_before_warning > WARNING_TIME) {
            this.set_timeout(this.warning, time_before_warning);
        } else {
            this.set_timeout(this.deco, this.time_to_disconnect);
        }
    }
    warning() {
        this.msg.reply(WARNING_MESSAGE);

        this.set_timeout(this.deco, WARNING_TIME);
    }
    deco() {
        this.disconnect();

        if (this.do_force) {
            this.set_timeout(this.force, FORCE_DELAY);
        } else {
            this.destroy();
        }
    }
    force() {
        let force_stop_time = this.force_time_since_last_voice_connection
                            + FORCE_DURATION
                            + FORCE_DELAY;

        if (Date.now() > force_stop_time) {
            this.destroy();
        } else {
            let delay = sec_to_milli(1);
            if (this.disconnect()) {
                this.force_time_since_last_voice_connection = Date.now();
                delay = FORCE_DELAY;
            }
            this.set_timeout(this.force, delay);
        }
    }

    disconnect() {
        if (this.msg.member.voice.channel == null) {
            return false
        };

        this.msg.member.voice.kick(DISCONNECT_MESSAGE);
        return true;
    }
    destroy() {
        users_to_deco.splice(users_to_deco.indexOf(this), 1);
        delete this;
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    let msg_split = msg.content.split(" ");
    let command = msg_split[0];
    if (command === '!deco') {
        let time = Number(msg_split[1]);
        let force = msg_split[2] === "force";

        let user_to_deco = new UserDeco(msg, min_to_milli(time), force, Date.now());
        user_to_deco.init();
    }
});

client.login(process.env.DISCORD_API_KEY);