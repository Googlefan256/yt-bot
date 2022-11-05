import type { Logger } from "./logger";
import { execSync, spawn } from "node:child_process";
import { env } from "./env";

export class Updater {
  HEAD = execSync("git rev-parse HEAD").toString().trim();
  Version = env.Version;
  constructor() {}
  pull() {
    const r = execSync("git pull").toString().trim();
    if (r === "Already up to date.") return false;
    return true;
  }
  install() {
    execSync("npm install");
  }
  build() {
    execSync("npm run build");
  }
  restart() {
    process.once("exit", () => {
      spawn(process.argv.shift() ?? "", process.argv, {
        cwd: process.cwd(),
        detached: true,
        stdio: "inherit",
        env: Object.assign(process.env, {
          UPDATE_STATUS: "restarted",
        }),
      });
    });
    process.exit(0);
  }
}

export function autoUpdate(logger: Logger) {
  const updater = new Updater();
  if (process.env.UPDATE_STATUS === "restarted") {
    logger.info("Updated!");
    return logger.info(
      `Running on head ${updater.HEAD}, version ${updater.Version}...`
    );
  }
  logger.info("Checking for updates...");
  try {
    const status = updater.pull();
    if (!status) {
      logger.info("Already up to date.");
      return logger.info(
        `Running on head ${updater.HEAD}, version ${updater.Version}...`
      );
    } else {
      logger.info("Updating dependencies...");
      updater.install();
      logger.info("Updated!");
      logger.info("Building scripts...");
      updater.build();
      logger.info("Completed!");
    }
  } catch (error) {
    logger.error(error);
  }
  logger.info("Update finished");
  logger.info("Restarting...");
  updater.restart();
}
