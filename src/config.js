DECO = '!deco';

class Config {
    constructor(content) {
        this.valid = this.toArgs(content.split(" "));
    }
    isValid() {
        return this.valid;
    }
    toArgs(args) {
        if (args[0] != DECO) { return false; }

        this.args = {
            force: false,
            ulti: false,
            cancel: false,
            time: null,
        }

        args.forEach((arg) => {
            if        (arg === 'force') {
                this.args.force = true;
            } else if (arg === 'ulti') {
                this.args.ulti = true
            } else if (arg === 'cancel') {
                this.cancel = true;
            } else if (!isNaN(arg)) {
                this.args.time = Number(arg);
            }
        });

        return true;
    }
}

module.exports = Config;