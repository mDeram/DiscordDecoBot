require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

function min_to_sec(m) { return m*60; }
function sec_to_milli(s) { return s*1000; }
function min_to_milli(m) { return sec_to_milli(min_to_sec(m)); }

const disconnect_message = 'You asked for it, see you';
const warning_time = sec_to_milli(30);
const force_delay = sec_to_milli(5);
const force_duration = min_to_milli(1);
let to_disconnect = [];

class UserDisconnecting {
    constructor(msg, time, force, time_stamp) {
        this.msg = msg;
        this.time_to_disconnect = time;
        this.force = force;
        this.force_last_connection_time_stamp = time_stamp + time;
        this.time_stamp = time_stamp;
        this.timeout = null;
    }
    disconnect() {
        if (this.msg.member.voice.channel == null) {
            return false
        };

        this.msg.member.voice.kick(disconnect_message);
        return true;
    }
    destroy() {
        to_disconnect.splice(to_disconnect.indexOf(this), 1);
        delete this;
    }
}

function force(user_disconnecting) {
    let force_stop_time = user_disconnecting.force_last_connection_time_stamp
                        + force_duration
                        + force_delay;
                        
    if (Date.now() > force_stop_time) {
        user_disconnecting.destroy();
    } else {
        let delay = sec_to_milli(1);
        if (user_disconnecting.disconnect()) {
            user_disconnecting.force_last_connection_time_stamp = Date.now();
            delay = force_delay;
        }
        user_disconnecting.timeout = setTimeout(force, delay, user_disconnecting);
    }
}

function warning(user_disconnecting) {
    user_disconnecting.msg.reply('attention! Je te déconnecte dans 30 secondes');
    user_disconnecting.timeout = setTimeout(deco, warning_time, user_disconnecting);
}

function deco(user_disconnecting) {
    user_disconnecting.disconnect();

    if (user_disconnecting.force) {
        user_disconnecting.timeout = setTimeout(force, force_delay, user_disconnecting);
    } else {
        user_disconnecting.destroy();
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    let msg_split = msg.content.split(" ");
    let command = msg_split[0];
    if (command === '!deco') {
        let force = msg_split[2] === "force";
        let time = Number(msg_split[1]);
        msg.reply('je te déconnecte dans ' + time + ' minutes');

        let time_millisecond = min_to_milli(time);

        let new_user_to_deco = new UserDisconnecting(msg, time, force, Date.now());
        to_disconnect.push(new_user_to_deco);
        new_user_to_deco.timeout = setTimeout(warning, time_millisecond - warning_time, new_user_to_deco);
    }
});

client.login(process.env.DISCORD_API_KEY);