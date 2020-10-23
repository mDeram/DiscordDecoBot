require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

const warning_time = 30*1000;
let to_disconnect = [];

class UserDisconnecting {
    constructor(msg, time, time_stamp) {
        this.msg = msg;
        this.time_to_disconnect = time;
        this.time_stamp = time_stamp;
        this.timeout = null;
    }
}

function warning(user_disconnecting) {
    user_disconnecting.msg.reply('attention! Je te déconnecte dans 30 secondes');
    user_disconnecting.timeout = setTimeout(deco, warning_time, user_disconnecting);
}

function deco(user_disconnecting) {
    user_disconnecting.msg.member.voice.kick('Bonne nuit');
    let user = to_disconnect.splice(to_disconnect.indexOf(user_disconnecting), 1);
    delete user;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    let msg_split = msg.content.split(" ");
    let command = msg_split[0];
    let time = Number(msg_split[1]);
    if (command === '!deco') {
        msg.reply('je te déconnecte dans ' + time + ' minutes');

        let time_millisecond = time*60*1000;

        let new_user_to_deco = new UserDisconnecting(msg, time, Date.now());
        to_disconnect.push(new_user_to_deco);
        new_user_to_deco.timeout = setTimeout(warning, time_millisecond - warning_time, new_user_to_deco);
    }
});

client.login(process.env.DISCORD_API_KEY);