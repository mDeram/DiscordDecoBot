require('dotenv').config();
const tc = require('./time_conversion.js');

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./configs/discord.js');

const UserManager = require('./user_manager.js');
const User = require('./user.js');
const InputManager = require('./input_manager.js');

const CANCEL_NOTHING_MESSAGE = 'Nothing to cancel';

const user_manager = new UserManager();
let input_manager;

client.on('ready', () => {
    input_manager = new InputManager(client, user_manager);
});

client.on('message', msg => {
    handle_deco(msg, config.parse(msg.content));
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    const id = newMember.id;

    if (isInVoiceChannel(newMember))
        user_manager.hasReconnected(id);
    else if (isInVoiceChannel(oldMember))
        user_manager.hasDisconnected(id);
});

function handle_deco(msg, args) {
    if (args == null)
        return;

    const id = msg.member.user.id;

    try {
        if (args.cancel) {
            user_manager.cancel(id);
        } else if (args.time != null) {
            user_manager.add(
                id, msg, tc.min_to_milli(args.time), args.force, args.ulti
            );
        }
    }
    catch(err) {
        console.log(err);
        msg.reply(err);
    }
}

function isInVoiceChannel(member) {
    return member.channelID != null;
}

client.login(process.env.DISCORD_API_KEY);
