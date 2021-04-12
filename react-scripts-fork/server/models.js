class UserMessage {
    constructor(type, name, payload) {
        this.data = { type, name, payload };
    }

    get type() {
        return this.data.type;
    }

    get name() {
        return this.data.name;
    }

    get payload() {
        return this.data.payload;
    }
}

module.exports = {
    UserMessage
}