const Config = require('../config.js');

const args = {
    help: null,
    showu: null,
    verbose: null,
    flush: null,
    nowarn: null,
}

const pre_condition = args => {
    return true;
}

const handler = (args, arg) => {
    if        (arg === 'help') {
        args.help = true;
    } else if (arg === 'showu') {
        args.showu = true;
    } else if (arg === '-v') {
        args.verbose = true;
    } else if (arg === 'flush') {
        args.flush = true;
    } else if (arg === '-no-warn') {
        args.nowarn = true;
    }
}

const validator = args => {
    for (let key in args) {
        if (args[key] != null) {
            return true;
        } 
    }
    return false;
}

module.exports = new Config(pre_condition, args, handler, validator);
