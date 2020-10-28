/*class Config {
    constructor(pre_condition, args, handler, validator) {
        this.set(pre_condition, args, handler, validator);
    }
    set(pre_condition, args, handler, validator) {
        this.pre_condition = pre_condition;
        this.args = Object.assign({}, args);
        this.args_init = Object.assign({}, args);
        this.handler = handler;
        this.validator = validator;
    }
    add(content) {
        const splited_content = content.split(" ");
        
        if (this.pre_condition(splited_content) !== true) { return null; }

        splited_content.forEach(arg => {
            this.handler(this.args, arg);
        });
        
        if (this.validator(this.args)) {
            return this.args;
        } else {
            return null;
        }
    }
    reset() {
        delete this.args;
        this.args = Object.assign({}, this.args_init);
    }
    parse(content) {
        this.reset();
        return this.add(content);
    }
}

module.exports = Config;*/

const assert = require('assert');
const Config = require('../../src/config.js');
const discord_config = require('../../src/configs/discord.js');

describe('Config tests', () => {
    function objFindFirst(obj, cb) {
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (cb(obj[i]) === true) {
                    return obj[i];
                }
            }
        }
        return null;
    }
    describe('Parse discord config failed pre condition', () => {
        it('should return null', () => {
            assert.equal(null, discord_config.parse(''));
        });
    });
    describe('Parse discord config success pre condition', () => {
        it('should return every arg with null value', () => {
            const result = objFindFirst(
                discord_config.parse('!deco'),
                value => { return value !== null; }
            )

            assert.equal(null, result);
        });
    });
    describe('Parse discord config all args', () => {
        it('should return every arg not null', () => {
            const result = objFindFirst(
                discord_config.parse('!deco force ulti cancel 1'),
                value => { return value === null; }
            )

            assert.equal(null, result);
        });
    });
    describe('Parse discord config with some args & reparse with other args', () => {
        it('should only take the second call as valid args', () => {
            let args;
            args = discord_config.parse('!deco force ulti 4');
            args = discord_config.parse('!deco ulti cancel 2');
            const result = args.force !== true &&
                           args.ulti === true &&
                           args.cancel === true &&
                           args.time === 2;
            assert.equal(true, result);
        });
    });
    describe('Parse discord config with some args & add other args', () => {
        it('should take both calls into args', () => {
            let args;
            args = discord_config.parse('!deco force ulti 4');
            args = discord_config.add('!deco ulti cancel 2');
            const result = args.force === true &&
                           args.ulti === true &&
                           args.cancel === true &&
                           args.time === 2;
            assert.equal(true, result);
        });
    });
    describe('Parse discord config some args & reset them', () => {
        it('should return every args with null value', () => {
            let args;
            args = discord_config.parse('!deco force ulti 4');
            discord_config.reset();
            const result = objFindFirst(
                discord_config.args,
                value => { return value !== null; }
            )
            assert.equal(null, result);
        });
    });
})