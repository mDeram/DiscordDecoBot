require('dotenv').config();
const tc = require('./time_conversion.js');

const Discord = require('discord.js');
const Intents = Discord.Intents;
const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

const DiscordConfig = require('./configs/discord.js');
const config = new DiscordConfig();

const UserManager = require('./user_manager.js');
const User = require('./user.js');
const InputManager = require('./input_manager.js');

const INPUT_EXCEPTION_MESSAGE = (exception) => `Oops, I'm not sure to understand what you mean: ${exception}`;
const CANCEL_NOTHING_MESSAGE = 'Nothing to cancel';

const user_manager = new UserManager();
const input_manager = new InputManager(client, user_manager);

client.on('ready', () => {
    input_manager.onClientReady();
});

client.on('message', msg => {
    if (msg.author.bot)
        return;

    let parsedArgs;

    console.log(msg.content);
    try {
        parsedArgs = config.parse(msg.content);
    }
    catch(exception) {
        msg.reply(INPUT_EXCEPTION_MESSAGE(exception.message));
        return;
    }

    handle_deco(msg, parsedArgs);
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
                id, msg, args.time, args.force, args.ulti
            );
        }
    }
    catch(err) {
        msg.reply(err);
    }

    if (args.status) {
        user_manager.replyStatus(id, msg);
    }
}

function isInVoiceChannel(member) {
    return member.channelID != null;
}

client.login(process.env.DISCORD_API_KEY);
