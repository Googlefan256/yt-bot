"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dc_1 = __importDefault(require("./dc"));
const loop_1 = __importDefault(require("./loop"));
const pause_1 = __importDefault(require("./pause"));
const play_1 = __importDefault(require("./play"));
const queue_1 = __importDefault(require("./queue"));
const resume_1 = __importDefault(require("./resume"));
const skip_1 = __importDefault(require("./skip"));
const np_1 = __importDefault(require("./np"));
const volume_1 = __importDefault(require("./volume"));
const search_1 = __importDefault(require("./search"));
const status_1 = __importDefault(require("./status"));
const delete_1 = __importDefault(require("./delete"));
exports.default = [
    play_1.default,
    queue_1.default,
    skip_1.default,
    np_1.default,
    pause_1.default,
    resume_1.default,
    dc_1.default,
    loop_1.default,
    volume_1.default,
    search_1.default,
    status_1.default,
    delete_1.default,
];
