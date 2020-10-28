const Config = require('../config.js');

const DECO_ARG = '!deco';

const args = {
    force: false,
    ulti: false,
    cancel: false,
    time: null,
}

const pre_condition = args => {
    return args[0] == DECO_ARG;
}

const handler = (args, arg) => {
    if        (arg === 'force') {
        args.force = true;
    } else if (arg === 'ulti') {
        args.ulti = true
    } else if (arg === 'cancel') {
        cancel = true;
    } else if (!isNaN(arg)) {
        args.time = Number(arg);
    }
}

const validator = _ => { return true; }

module.exports = new Config(pre_condition, args, handler, validator);