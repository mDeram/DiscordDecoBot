const readline = require('readline')
const config = require('./configs/input.js');

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
            if (args != null) {
                this.handleInput(args);
            }
        });
        this.presentation();
    }
    presentation() {
        console.log(`Logged in as ${this.client.user.tag}!`);
        console.log('Enter help for command infos');
    }
    handleInput(args) {
        if        (args.help) {
            this.help();
        } else if (args.showu) {
            this.showu(args.verbose);
        }
    }
    help() {
        console.log('I\'ll help you later');
    }
    showu(verbose) {
        if (verbose) {
            console.log(this.user_manager);
        }
        console.log('Users count: ' + this.user_manager.count());
    }
}

module.exports = InputManager;