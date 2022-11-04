"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = exports.Command = void 0;
const discord_js_1 = require("discord.js");
const commands_1 = __importDefault(require("../../commands"));
class Command {
    exec;
    name;
    description;
    options;
    constructor(options) {
        this.exec = options.exec;
        this.name = options.name;
        this.description = options.description;
        this.options = options.options;
    }
    get raw() {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
        };
    }
}
exports.Command = Command;
class CommandManager extends discord_js_1.Collection {
    client;
    constructor(client) {
        super();
        this.client = client;
    }
    loadAll() {
        return commands_1.default.map((cmd) => {
            this.set(cmd.name, new Command(cmd));
        });
    }
}
exports.CommandManager = CommandManager;
