import { inspect } from "node:util";
import chalk from "chalk";

function format(msg: any) {
  return typeof msg === "string" ? msg : inspect(msg);
}

export class Logger {
  constructor() {}
  info(msg: any) {
    console.log(chalk.greenBright("INFO: ") + format(msg));
  }
  warn(msg: any) {
    console.log(chalk.yellowBright("WARN: ") + format(msg));
  }
  error(msg: any) {
    console.log(chalk.redBright("ERROR: ") + format(msg));
  }
  panic(msg: any) {
    console.log(chalk.red("ERROR: ") + format(msg));
    process.exit(1);
  }
  debug(msg: any) {
    if (process.env.NODE_ENV === "development") {
      console.log(chalk.blueBright("DEBUG: ") + format(msg));
    }
  }
}

export const logger = new Logger();
