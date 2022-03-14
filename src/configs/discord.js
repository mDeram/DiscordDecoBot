const Config = require('../config.js');
const tc = require('../time_conversion.js');

const DECO_PREFIX = '!deco';

const EXCEPTION_INVALID_TIME_FORMAT = 'invalid time format, valids time format would look like \'2h50m\' or \'40m20s\'';
const EXCEPTION_TIME_TOO_BIG = 'deco duration cannot exceed 24h';

class CommandException extends Error {
    constructor() {
        super('the command you typed in does not exist');
        this.name = "CommandException";
    }
}

class ArgumentsException extends Error {
    constructor(inputs) {
        super(`there are ${inputs.length} extra arguments ('${inputs.join(",")}')`);
        this.name = "ArgumentsException";
    }
}

class DiscordConfig {
    args = {
        status: null,
        cancel: null,
        time: null,
        force: null,
        ulti: null,
        timezone: null,
    }

    parse(rawInput) {
        const inputs = rawInput.trim().split(/ +/);

        if (!this.isPrefixValid(inputs.shift()))
            return null;

        return this.handleArgs(inputs);
    }
    isPrefixValid(prefix) {
        return DECO_PREFIX == prefix;
    }
    handleArgs(inputs) {
        let args = Object.assign({}, this.args);

        switch (inputs.shift()) {
            case 'status':
                args.status = true;
                break;
            case 'cancel':
                args.cancel = true;
                break;
            case 'in':
            case 'at':
                args.time = this.parseTime(inputs.shift());
                if (['force', 'ulti'].includes(inputs[0]))
                    args[inputs.shift()] = true
                break;
            case 'timezone':
                args.timezone = this.parseTimezone(inputs.shift());
                break;
            default:
                throw new CommandException();
        }

        if (inputs.length)
            throw new ArgumentsException(inputs);

        return args;
    }
    parseTime(rawTime) {
        // Valid time examples: 5h6m50s / 20s / 20h20s

        let reversedTime = rawTime.split("").reverse().join("");

        let time = {
            h: '',
            m: '',
            s: ''
        }

        let current = '';

        for (let c of reversedTime) {
            if (['h', 'm', 's'].includes(c) && (current == '' || c < current))
                current = c;
            else if (!isNaN(c) && current != '')
                time[current] = c + time[current];
            else
                throw EXCEPTION_INVALID_TIME_FORMAT;
        }
        console.log(time);

        let totalMs = tc.hour_to_milli(Number(time.h))
                    + tc.min_to_milli(Number(time.m))
                    + tc.sec_to_milli(Number(time.s));

        if (totalMs > tc.hour_to_milli(24))
            throw EXCEPTION_TIME_TOO_BIG; 

        return totalMs;
    }
    parseTimezone(tz) {

    }
}


module.exports = DiscordConfig;
