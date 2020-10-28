class Config {
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
    add (content) {
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

module.exports = Config;