require('dotenv').config();
const tc = require('./time_conversion.js');

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./configs/discord.js');

const UserManager = require('./user_manager.js');
const UserDeco = require('./user_deco.js');
const InputManager = require('./input_manager.js');

const CANCEL_NOTHING_MESSAGE = 'Nothing to cancel';

const user_manager = new UserManager();
let input_manager;

client.on('ready', () => {
    input_manager = new InputManager(client, user_manager);
});

client.on('message', msg => {
    const args = config.parse(msg.content);
    if (args == null)
        return;
    
    handle_deco(msg, args);
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (!user_manager.has(newMember.id))
        return;

    const user = user_manager.get(newMember.id);

    if (isInVoiceChannel(newMember)) {
        console.log("reconnected");
        user.hasReconnected()
    } else if (isInVoiceChannel(oldMember)) {
        console.log("disconnected");
        user.hasDisconnected()
    }
});

function handle_deco(msg, args) {
    const id = msg.member.user.id;

    if (args.cancel == true) {
        if (user_manager.has(id)) {
            user_manager.get(id).cancel();
        } else {
            this.msg.reply(CANCEL_NOTHING_MESSAGE);
        }
    } else if (args.time != null) {
        let user_to_deco = new UserDeco(
            user_manager,
            msg,
            tc.min_to_milli(args.time),
            args.force,
            args.ulti
        );
        user_to_deco.init();
        user_manager.push(id, user_to_deco);
    }
}

function isInVoiceChannel(member) {
    return member.channelID != null;
}

client.login(process.env.DISCORD_API_KEY);
