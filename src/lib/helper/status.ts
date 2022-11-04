import { cpus, freemem, totalmem, uptime } from "node:os";

export const getCpu = () => {
  const before = getCurrent();
  return new Promise<number>((resolve) =>
    setTimeout(() => {
      const after = getCurrent();
      resolve(
        Math.floor(
          (1 - (after.idle - before.idle) / (after.total - before.total)) *
            10000
        ) / 100
      );
    }, 1000)
  );
};

export const getMemory = () => ({
  process: Math.floor((process.memoryUsage().rss / 1024 / 1024) * 100) / 100,
  all: Math.floor(((totalmem() - freemem()) / 1024 / 1024) * 100) / 100,
  total: Math.floor((totalmem() / 1024 / 1024) * 100) / 100,
});

const getCurrent = () => {
  const current = cpus()
    .map((x) => x.times)
    .reduce(
      (x, y) =>
        [
          {
            user: x.user + y.user,
            nice: x.nice + y.nice,
            sys: x.sys + y.sys,
            irq: x.irq + y.irq,
            idle: x.idle + y.idle,
          },
        ][0]
    );
  return {
    idle: current.idle,
    total:
      current.user + current.nice + current.sys + current.idle + current.irq,
  };
};

export const getUptime = () => {
  return {
    process: process.uptime(),
    all: uptime(),
  };
};

export const formatTime = (time: number) => {
  time = Math.floor(time);
  const sec = time % 60;
  time = (time - sec) / 60;
  const min = time % 60;
  time = (time - min) / 60;
  const hour = time % 24;
  time = (time - hour) / 24;
  return `${time ? time + "日" : ""}${hour ? hour + "時間" : ""}${
    min ? min + "分" : ""
  }${sec ? sec + "秒" : ""}`;
};
