import { Request, Response } from "express";
import httpStatus from "http-status";
import postgresService from "../services/postgres.service";
import catchAsync from "../utils/catchAsync";
import { Prisma } from "@prisma/client";
import projectService from "@services/project.service";
import { prepareEnvironmentVariables } from "@helper/docker/utils";
import { docker } from "@constants/index";

const createPostgres = catchAsync(async (req: Request, res: Response) => {
  const newPostgres: Prisma.PostgresUncheckedCreateInput =
    await postgresService.createPostgres(req.body);
  res.status(httpStatus.CREATED).json({ success: true, data: newPostgres });
});

const getAllPostgres = catchAsync(async (req: Request, res: Response) => {
  const postgresInstances = await postgresService.getPostgres();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Postgres Databases fetched successfuly!",
    postgres: postgresInstances,
  });
});

const getPostgresById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const postgresInstance = await postgresService.getPostgresById(id);
  if (postgresInstance) {
    res.status(httpStatus.OK).json({
      success: true,
      message: "Postgres instance fetched successfully!",
      postgres: postgresInstance,
    });
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, error: "PostgreSQL instance not found" });
  }
});

const updatePostgres = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedPostgres = await postgresService.updatePostgres(id, req.body);
  res.status(httpStatus.OK).json({ success: true, data: updatedPostgres });
});

const deletePostgres = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await postgresService.deletePostgres(id);
  res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message: "PostgreSQL instance deleted successfully",
  });
});

const getPostgresByProjectId = catchAsync(
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const postgresInstances = await postgresService.getPostgresByProjectId(
      projectId
    );
    res.status(httpStatus.OK).json({ success: true, data: postgresInstances });
  }
);

// start postgres container
const startPostgresContainer = catchAsync(
  async (req: Request, res: Response) => {
    const { postgresId } = req.params;
    const logFileName = `postgres_${postgresId}.log`;

    console.log(`Starting Postgres container for postgresId: ${postgresId}`);

    try {
      // Fetch Postgres configuration
      const postgres = await postgresService.getPostgresById(postgresId);
      if (!postgres) {
        console.error(
          `Postgres database not found for postgresId: ${postgresId}`
        );
        throw new Error("Postgres database not found");
      }
      console.log(
        `Fetched Postgres configuration: ${JSON.stringify(postgres)}`
      );

      const networkName = `${postgres.projectId}-network`;
      let network;
      try {
        network = await docker.createNetwork({ Name: networkName });
        console.log(`Created network: ${networkName}`);
      } catch (error: any) {
        if (error.statusCode === 409) {
          network = docker.getNetwork(networkName);
          console.log(
            `Network already exists, using existing network: ${networkName}`
          );
        } else {
          console.error(`Error creating network: ${error.message}`);
          throw error;
        }
      }

      // // Initialize Docker volume
      const volumeName = `${postgres.appName}-data`;
      let volume;
      try {
        volume = await docker.createVolume({ Name: volumeName });
        console.log(`Created volume: ${volumeName}`);
      } catch (error: any) {
        if (error.statusCode === 409) {
          volume = docker.getVolume(volumeName);
          console.log(
            `Volume already exists, using existing volume: ${volumeName}`
          );
        } else {
          console.error(`Error creating volume: ${error.message}`);
          throw error;
        }
      }

      // Check for existing containers
      const existingContainers = await docker.listContainers({
        all: true,
        filters: { name: [postgres.appName] },
      });

      console.log("existingContainers", existingContainers);
      let container;
      if (existingContainers.length > 0) {
        container = docker.getContainer(existingContainers[0].Id);
        console.log(container);
        console.log(`Found existing container with ID: ${container.id}`);
        const containerInfo = await container.inspect();
        console.log(containerInfo);
        if (containerInfo.State.Running) {
          console.log(`Container ${container.id} is already running`);
          return res.json(containerInfo);
        }
      } else {
        // Configure and create a new container
        const containerConfig = {
          Image: postgres.dockerImage,
          name: postgres.appName,
          Env: [
            `POSTGRES_DB=${postgres.databaseName}`,
            `POSTGRES_USER=${postgres.databaseUser}`,
            `POSTGRES_PASSWORD=${postgres.databasePassword}`,
          ],
          HostConfig: {
            PortBindings: {
              "5432/tcp": [
                {
                  HostPort: "8888",
                },
              ],
            },
            Binds: [`${volumeName}:/var/lib/postgresql/data`],
          },
          NetworkingConfig: {
            EndpointsConfig: {
              [networkName]: {},
            },
          },
        };

        // if (postgres.env) {
        //   const envVars = prepareEnvironmentVariables(postgres.env);
        //   containerConfig.Env.push(...envVars);
        //   console.log(`Added environment variables: ${envVars.join(', ')}`);
        // }

        // if (postgres.command) {
        //   containerConfig.Cmd = postgres.command.split(' ');
        //   console.log(`Set command to execute: ${containerConfig.Cmd.join(' ')}`);
        // }

        container = await docker.createContainer(containerConfig);
        console.log(`Created container with ID: ${container.id}`);
      }

      await container.start();
      console.log(`Started container with ID: ${container.id}`);

      try {
        await network.connect({ Container: container.id });
        console.log(
          `Container ${container.id} connected to network ${networkName}`
        );
      } catch (error: any) {
        if (error.statusCode !== 409) {
          console.error(
            `Error connecting container to network: ${error.message}`
          );
          throw error;
        }
      }

      await postgresService.updatePostgres(postgresId, {
        applicationStatus: "RUNNING",
      });

      console.log(`Postgres status updated to RUNNING for ${postgres.appName}`);
      return res.json({
        message: `Container started`,
        containerId: container.id,
      });
    } catch (error: any) {
      console.error(`Error starting Postgres container: ${error.message}`);
      return res.status(500).json({ message: error.message });
    }
  }
);

// stop postgres container

const stopPostgresContainer = catchAsync(
  async (req: Request, res: Response) => {
    const { postgresId } = req.params;
    console.log(`Stopping Postgres container for postgresId: ${postgresId}`);

    try {
      // Fetch Postgres configuration
      const postgres = await postgresService.getPostgresById(postgresId);
      if (!postgres) {
        console.error(
          `Postgres database not found for postgresId: ${postgresId}`
        );
        throw new Error("Postgres database not found");
      }
      console.log(
        `Fetched Postgres configuration: ${JSON.stringify(postgres)}`
      );

      // Check for existing containers
      const existingContainers = await docker.listContainers({
        all: true,
        filters: { name: [postgres.appName] },
      });

      if (existingContainers.length === 0) {
        console.log(`No running container found for ${postgres.appName}`);
        return res.status(404).json({ message: "No running container found" });
      }

      const container = docker.getContainer(existingContainers[0].Id);
      await container.stop();
      console.log(`Stopped container with ID: ${container.id}`);

      await postgresService.updatePostgres(postgresId, {
        applicationStatus: "IDLE",
      });

      console.log(`Postgres status updated to STOPPED for ${postgres.appName}`);
      return res.json({
        message: `Container stopped`,
        containerId: container.id,
      });
    } catch (error: any) {
      console.error(`Error stopping Postgres container: ${error.message}`);
      return res.status(500).json({ message: error.message });
    }
  }
);


const deletePostgresContainer = catchAsync(
  async (req: Request, res: Response) => {
    const { postgresId } = req.params;
    console.log(`Deleting Postgres container for postgresId: ${postgresId}`);

    try {
      // Fetch Postgres configuration
      const postgres = await postgresService.getPostgresById(postgresId);
      if (!postgres) {
        console.error(`Postgres database not found for postgresId: ${postgresId}`);
        throw new Error("Postgres database not found");
      }
      console.log(`Fetched Postgres configuration: ${JSON.stringify(postgres)}`);

      // Check for existing containers
      const existingContainers = await docker.listContainers({
        all: true,
        filters: { name: [postgres.appName] },
      });

      if (existingContainers.length === 0) {
        console.log(`No container found for ${postgres.appName}`);
        return res.status(404).json({ message: "No container found" });
      }

      const container = docker.getContainer(existingContainers[0].Id);
      await container.stop();
      console.log(`Stopped container with ID: ${container.id}`);
      await container.remove();
      console.log(`Deleted container with ID: ${container.id}`);

      // Optionally, you can also remove the associated volume and network
      const volumeName = `${postgres.appName}-data`;
      try {
        const volume = docker.getVolume(volumeName);
        await volume.remove();
        console.log(`Removed volume: ${volumeName}`);
      } catch (error: any) {
        console.error(`Error removing volume: ${error.message}`);
      }

      const networkName = `${postgres.projectId}-network`;
      try {
        const network = docker.getNetwork(networkName);
        await network.remove();
        console.log(`Removed network: ${networkName}`);
      } catch (error: any) {
        console.error(`Error removing network: ${error.message}`);
      }

      await postgresService.deletePostgres(postgresId)

      console.log(`Postgres DELETED for ${postgres.appName}`);
      return res.json({ message: `Container deleted`, containerId: container.id });
    } catch (error: any) {
      console.error(`Error deleting Postgres container: ${error.message}`);
      return res.status(500).json({ message: error.message });
    }
  }
);


export default {
  createPostgres,
  getAllPostgres,
  getPostgresById,
  startPostgresContainer,
  updatePostgres,
  getPostgresByProjectId,
  deletePostgres,
  deletePostgresContainer,
  stopPostgresContainer
};
