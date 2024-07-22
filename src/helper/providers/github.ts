import { APPLICATIONS_PATH } from "@constants/index";
import io from "../../index";
import { createWriteStream, existsSync } from "node:fs";

import { join } from "node:path";

import simpleGit from "simple-git";

interface Entity {
  url: string;
  appName: string;
  branch: string;
}


export const cloneRepository = async ({
  entity: { appName, url, branch },
  logPath,
  isCompose = false,
}: {
  entity: Entity;
  logPath: string;
  isCompose: boolean;
}) => {
  const basePath = APPLICATIONS_PATH;
  const outputPath = join(basePath, appName);

  const writeStream = createWriteStream(logPath, { flags: "a" });

  const git = simpleGit();

  try {
    if (existsSync(outputPath)) {
      const logMessage = `Repository already exists. Pulling latest changes for ${appName} from branch ${branch}: ✅\n`;
      writeStream.write(`\n${logMessage}`);
      io.emit("logUpdate", logMessage); 

      await git.cwd(outputPath);
      await git.pull('origin', branch);
      const pulledMessage = `Pulled latest changes for ${appName}: ✅\n`;
      writeStream.write(`\n${pulledMessage}`);
      io.emit("logUpdate", pulledMessage); 
    } else {
      const logMessage = `Cloning Repo ${url} to ${outputPath}: ✅\n`;
      writeStream.write(`\n${logMessage}`);
      io.emit("logUpdate", logMessage); // Emit log update

      await git.clone(url, outputPath, ["-b", branch]);
      const clonedMessage = `Cloned ${url}: ✅\n`;
      writeStream.write(`\n${clonedMessage}`);
      io.emit("logUpdate", clonedMessage); // Emit log update
    }
  } catch (error) {
    const errorMessage = `ERROR Cloning: ${error}: ❌`;
    writeStream.write(errorMessage);
    io.emit("logUpdate", errorMessage); // Emit log update
    console.error(
      `Failed to clone the repository: ${(error as Error).message}`
    );
  }
};