"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const node_util_1 = require("node:util");
const chalk_1 = __importDefault(require("chalk"));
function format(msg) {
    return typeof msg === "string" ? msg : (0, node_util_1.inspect)(msg);
}
class Logger {
    constructor() { }
    info(msg) {
        console.log(chalk_1.default.greenBright("INFO: ") + format(msg));
    }
    warn(msg) {
        console.log(chalk_1.default.yellowBright("WARN: ") + format(msg));
    }
    error(msg) {
        console.log(chalk_1.default.redBright("ERROR: ") + format(msg));
    }
    panic(msg) {
        console.log(chalk_1.default.red("ERROR: ") + format(msg));
        process.exit(1);
    }
    debug(msg) {
        if (process.env.NODE_ENV === "development") {
            console.log(chalk_1.default.blueBright("DEBUG: ") + format(msg));
        }
    }
}
exports.logger = new Logger();
