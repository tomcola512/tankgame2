interface Message {
    name: string,
    message: string;
}

export class UserMessage implements Message {
    private data: { name: string, message: string };
    constructor(payload: string) {
        const {name, message} = JSON.parse(payload);
        this.data = {name, message};
    }

    get name(): string {
        return this.data.name;
    }

    get message(): string {
        return this.data.message;
    }
}