import type { Logger } from "./logger";
import { execSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";

export function autoUpdate(logger: Logger) {
  const VERSION: string = JSON.parse(
    readFileSync("./package.json", "utf-8")
  ).version;
  const HEAD = execSync("git rev-parse HEAD").toString().trim();
  if (process.env.UPDATE_STATUS === "restarted") {
    logger.info("Updated!");
    return logger.info(`Running on head ${HEAD}, version ${VERSION}...`);
  }
  logger.info("Checking for updates...");
  try {
    const r = execSync("git pull").toString().trim();
    if (r === "Already up to date.") {
      logger.info("Already up to date.");
      return logger.info(`Running on head ${HEAD}, version ${VERSION}...`);
    } else {
      logger.info("Updating dependencies...");
      execSync("npm install");
      logger.info("Updated!");
      logger.info("Building scripts...");
      execSync("npm run build");
      logger.info("Completed!");
    }
  } catch (error) {
    logger.error(error);
  }
  logger.info("Update finished");
  process.once("exit", function () {
    spawn(process.argv.shift() ?? "", process.argv, {
      cwd: process.cwd(),
      detached: true,
      stdio: "inherit",
      env: Object.assign(process.env, {
        UPDATE_STATUS: "restarted",
      }),
    });
  });
  logger.info("Restarting...");
  process.exit(0);
}
