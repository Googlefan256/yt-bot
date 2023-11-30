import { greenBright, yellowBright, redBright } from "chalk";

class Logger {
    constructor(private name: string) {}
    info(...args: any[]) {
        console.log(
            `${greenBright(`(info)`)}${yellowBright(`[${this.name}]`)}`,
            ...args,
        );
    }
    error(...args: any[]) {
        console.log(
            `${redBright(`(error)`)}${yellowBright(`[${this.name}]`)}`,
            ...args,
        );
    }
    panic(...args: any[]) {
        console.log(
            `${redBright(`(panic)`)}${yellowBright(`[${this.name}]`)}`,
            ...args,
        );
        process.exit(1);
    }
}

const logger = new Logger("music-bot");

export const info = logger.info.bind(logger);
export const error = logger.error.bind(logger);
export const panic = logger.panic.bind(logger);
