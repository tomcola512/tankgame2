class UserMessage {
    constructor(name, message) {
        this.data = { name, message };
    }

    get name() {
        return this.data.name;
    }

    get message() {
        return this.data.message;
    }
}

module.exports = {
    UserMessage
}