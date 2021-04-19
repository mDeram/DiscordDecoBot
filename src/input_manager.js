const readline = require('readline')
const config = require('./configs/input.js');

const WARNING_USER_DELETED = 'WARNING, you will not get disconnected because the bot owner deleted you from the user database';

const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class InputManager {
    constructor(client, user_manager) {
        this.client = client;
        this.user_manager = user_manager;
        input.on('line', content => {
            const args = config.parse(content);
            this.handleInput(args);
        });
    }
    onClientReady() {
        this.presentation();
    }
    presentation() {
        console.log(`Logged in as ${this.client.user.tag}!`);
        console.log('Enter help for command infos');
    }
    handleInput(args) {
        if (args == null)
            return;

        if      (args.help)     this.help();
        else if (args.showu)    this.showu(args.verbose);
        else if (args.flush)    this.flush(args.nowarn);
    }
    help() {
        console.log('Available commands:\n');

        console.group();
        console.log('showu [-v]         (list deco users, -v verbose)');
        console.log('flush [-no-warn]   (flush all users, -no-warn without warning)');
        console.groupEnd();
    }
    showu(verbose) {
        if (verbose) {
            console.log('Users: [id] => User\n');
            this.user_manager.forEach((value, key) => {
                console.log(`[${key}] => `, value);
            });
            console.log('--------------------------------------');
        }

        console.log('Users count: ' + this.user_manager.count());
    }
    flush(nowarn) {
        let cb = (user) => user.msg.reply(WARNING_USER_DELETED);
        if (nowarn)
            cb = () => {};

        this.user_manager.flush(cb);
    }
}

module.exports = InputManager;
