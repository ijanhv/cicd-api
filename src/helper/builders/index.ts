import { Application, BuildType } from "@prisma/client";
import { buildNixpacks } from "./nixpacks";
import { createWriteStream } from "node:fs";
import type { WriteStream } from "node:fs";

import io from "../../index";
import {
  connectContainerToNetwork,
  ensureNetwork,
  ensureVolume,
  findOrCreateContainer,
  prepareEnvironmentVariables,
  startContainer,
} from "@helper/docker/utils";
import applicationService from "@services/application.service";
import deploymentService from "@services/deployment.service";
import { docker } from "@constants/index";

export const buildApplication = async (
  application: Application,
  logPath: string,
  deploymentId: string
) => {
  const writeStream = createWriteStream(logPath, { flags: "a" });

  console.log("REACHED HERE build Application");

  console.log(application.buildType);
  try {
    if (application.buildType === BuildType.NIXPACKS) {
      const logMessage = "Building app using Nixpacks";
      writeStream.write(`${logMessage}\n`);
      io.emit("logUpdate", logMessage); // Emit log update

      await buildNixpacks(application, writeStream);

      const finishedMessage = "Finished building app using Nixpacks";
      writeStream.write(`${finishedMessage}\n`);
      io.emit("logUpdate", finishedMessage); // Emit log update
      // TODO: dockerize
    }

    startApplicationContainer(application, writeStream, deploymentId);
  } catch (error) {
    const errorMessage = "ERROR";
    writeStream.write(errorMessage);
    io.emit("logUpdate", errorMessage); // Emit log update
    throw error;
  }
};

export const startApplicationContainer = async (
    application: Application,
    writeStream: WriteStream,
    deploymentId: string
  ) => {
    const networkName = `${application.projectId}-network`;
    const volumeName = `${application.appName}-data`;
  
    try {
      // Ensure network and volume
      await ensureNetwork(networkName);
      await ensureVolume(volumeName);
  
      // Find or create container (this will now always create a new container)
      const { container } = await findOrCreateContainer(
        application,
        networkName,
        volumeName
      );
  
      console.log("NEW CONTAINER:", container);
  
      const logMessage = `Created new container for ${application.appName}`;
      writeStream.write(`${logMessage}\n`);
      io.emit("logUpdate", logMessage);
  
      // Start the container
      await container.start();
  
      const containerInfo = await container.inspect();
      console.log('Container Info:', JSON.stringify(containerInfo, null, 2));
  
      const startMessage = `Started container with ID ${container.id}`;
      writeStream.write(`${startMessage}\n`);
      io.emit("logUpdate", startMessage);
  
      // Connect container to network (this will now check if it's already connected)
      await connectContainerToNetwork(container, networkName);
  
      // Update application and deployment status
      try {
        await applicationService.updateApplication(application.applicationId, {
          applicationStatus: "RUNNING",
        });
        await deploymentService.updateDeployment(deploymentId, {
          status: "DONE",
        });
      } catch (updateError: any) {
        console.log('Error updating application or deployment status:', updateError);
        writeStream.write(`Warning: Failed to update application or deployment status: ${updateError.message}\n`);
        io.emit("logUpdate", `Warning: Failed to update application or deployment status: ${updateError.message}`);
      }
  
      const successMessage = `Application deployed with name ${application.appName} and accessible on port 5008`;
      writeStream.write(`${successMessage}\n`);
      io.emit("logUpdate", successMessage);
  
      return { container, isNew: true };
    } catch (error: any) {
      console.error(`Error handling application container: ${error.message}`);
      writeStream.write(`Error: ${error.message}\n`);
      io.emit("logUpdate", `Error: ${error.message}`);
      throw error;
    }
  };