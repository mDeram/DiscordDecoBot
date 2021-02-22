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
const discord_config = require('../../src/configs/discord.js');
const input_config = require('../../src/configs/input.js');

const tests = [
    {
        name: 'discord',
        config: discord_config,
        args: {
            valid_pre_condition: '!deco',
            all_args: '!deco force ulti cancel 1',
            some_valid_args: ['!deco force ulti 4', '!deco ulti cancel 2']
        }
    },
    {
        name: 'input', 
        config: input_config,
        args: {
            valid_pre_condition: '',
            all_args: 'help showu -v',
            some_valid_args: ['help showu', 'showu -v']
        }
    }
];


describe('Configs', () => {
    function objFindFirst(obj, cb) {
        for (let i in obj) {
            if (obj.hasOwnProperty(i) && cb(obj[i]) === true) {
                return obj[i];
            }
        }
        return null;
    }
    
    it('should return null when discord failed pre-condition', () => {
        assert.equal(null, discord_config.parse(''));
    });
    it('should return null when input failed post-condition', () => {
        assert.equal(null, input_config.parse(''));
    });
    tests.forEach(test => {
        describe(test.name, () => {
            it('should return every arg with null value when ' + test.name + ' succed pre-condition', () => {
                const result = objFindFirst(
                    test.config.parse(test.args.valid_pre_condition),
                    value => { return value !== null; }
                )

                assert.equal(null, result);
            });
        // describe(test.name + ' parse config all args', () => {
            it('should return every arg not null', () => {
                assert.notEqual(null, test.config.parse(test.args.all_args));

                const result = objFindFirst(
                    test.config.parse(test.args.all_args),
                    value => { return value === null; }
                )

                assert.equal(null, result);
            });
        // });
        // describe(test.name + ' parse config with some args & reparse with other args', () => {
            it('should only take the second call as valid args', () => {
                let args;
                args = test.config.parse(test.args.some_valid_args[0]);
                args = test.config.parse(test.args.some_valid_args[1]);
                const result = args.force !== true &&
                               args.ulti === true &&
                               args.cancel === true &&
                               args.time === 2;
                assert.equal(true, result);
            });
        // });
        // describe(test.name + ' parse config with some args & add other args', () => {
            it('should take both calls into args', () => {
                let args;
                args = test.config.parse(test.args.some_valid_args[0]);
                args = test.config.add(test.args.some_valid_args[1]);

                const result = args == test.config.parse(test.args.some_valid_args[1]);
                assert.strictEqual(true, result);
            });
        // });
        // describe(test.name + ' parse config some args & reset them', () => {
            it('should return every args with null value', () => {
                let args;
                args = test.config.parse(test.args.all_args);
                test.config.reset();
                const result = objFindFirst(
                    test.config.args,
                    value => { return value !== null; }
                )
                assert.equal(null, result);
            });
        // });
        });
    });
});