import { prepareEnvironmentVariables } from "@helper/docker/utils";
import { getBuildAppDirectory } from "@helper/filesystem/directory";
import { Application } from "@prisma/client";
import type { WriteStream } from "node:fs";

import { createWriteStream } from "node:fs";
import { spawnAsync } from "@utils/spawnAsync";
import io from "../../index";

export const buildNixpacks = async (
  application: Application,
  writeStream: WriteStream
) => {
  console.log("REACHED HERE buildnixpacks");
  const { env, appName } = application;
  const buildAppDirectory = await getBuildAppDirectory(application);
  const envVariables = prepareEnvironmentVariables(env);

  try {
    const args = ["build", buildAppDirectory, "--name", appName];

    for (const env of envVariables) {
      args.push("--env", env);
    }

    await spawnAsync(
      "nixpacks",
      args.filter((arg) => arg !== undefined),
      (data) => {
     
   
        if (writeStream.writable) {
          writeStream.write(data);
          io.emit('logUpdate', data); 
        }
      }
    );

    return true;
  } catch (e) {
    throw e;
  }
};
