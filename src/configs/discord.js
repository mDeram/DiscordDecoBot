const Config = require('../config.js');

const DECO_ARG = '!deco';

const args = {
    force: null,
    ulti: null,
    cancel: null,
    time: null,
    status: null,
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
        args.cancel = true;
    } else if (!isNaN(arg)) {
        args.time = Number(arg);
    } else if (arg === 'status') {
        args.status = true;
    }
}

const validator = _ => { return true; }

module.exports = new Config(pre_condition, args, handler, validator);
