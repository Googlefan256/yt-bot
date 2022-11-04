"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = exports.getUptime = exports.getMemory = exports.getCpu = void 0;
const node_os_1 = require("node:os");
const getCpu = () => {
    const before = getCurrent();
    return new Promise((resolve) => setTimeout(() => {
        const after = getCurrent();
        resolve(Math.floor((1 - (after.idle - before.idle) / (after.total - before.total)) *
            10000) / 100);
    }, 1000));
};
exports.getCpu = getCpu;
const getMemory = () => ({
    process: Math.floor((process.memoryUsage().rss / 1024 / 1024) * 100) / 100,
    all: Math.floor((((0, node_os_1.totalmem)() - (0, node_os_1.freemem)()) / 1024 / 1024) * 100) / 100,
    total: Math.floor(((0, node_os_1.totalmem)() / 1024 / 1024) * 100) / 100,
});
exports.getMemory = getMemory;
const getCurrent = () => {
    const current = (0, node_os_1.cpus)()
        .map((x) => x.times)
        .reduce((x, y) => [
        {
            user: x.user + y.user,
            nice: x.nice + y.nice,
            sys: x.sys + y.sys,
            irq: x.irq + y.irq,
            idle: x.idle + y.idle,
        },
    ][0]);
    return {
        idle: current.idle,
        total: current.user + current.nice + current.sys + current.idle + current.irq,
    };
};
const getUptime = () => {
    return {
        process: process.uptime(),
        all: (0, node_os_1.uptime)(),
    };
};
exports.getUptime = getUptime;
const formatTime = (time) => {
    time = Math.floor(time);
    const sec = time % 60;
    time = (time - sec) / 60;
    const min = time % 60;
    time = (time - min) / 60;
    const hour = time % 24;
    time = (time - hour) / 24;
    return `${time ? time + "日" : ""}${hour ? hour + "時間" : ""}${min ? min + "分" : ""}${sec ? sec + "秒" : ""}`;
};
exports.formatTime = formatTime;
