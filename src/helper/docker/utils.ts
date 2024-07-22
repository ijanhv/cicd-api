import { parse } from "dotenv";
import { docker } from "@constants/index";
import { Container } from "dockerode";
import { Application } from "@prisma/client";



// Define the interface for network stats
interface NetworkStats {
  rx_bytes: number;
  tx_bytes: number;
}

// Define the interface for container stats
interface ContainerStats {
  cpu_stats: {
    cpu_usage: {
      total_usage: number;
    };
  };
  memory_stats: {
    usage: number;
  };
  networks?: Record<string, NetworkStats>; // Use Record to define a map of network stats
}

export const ensureNetwork = async (networkName: string) => {
  try {
    // Check if network already exists
    const networks = await docker.listNetworks({
      filters: { name: [networkName] },
    });

    if (networks.length === 0) {
      // Network does not exist, create a new one
      await docker.createNetwork({ Name: networkName });
      console.log(`Created new network: ${networkName}`);
    } else {
      console.log(`Network already exists: ${networkName}`);
    }
  } catch (error: any) {
    console.error(`Error ensuring network ${networkName}: ${error.message}`);
    throw error;
  }
};

export const ensureVolume = async (volumeName: string) => {
  try {
    return await docker.createVolume({ Name: volumeName });
  } catch (error: any) {
    if (error.statusCode === 409) {
      return docker.getVolume(volumeName);
    }
    throw error;
  }
};



export const findOrCreateContainer = async (application: Application, networkName: string, volumeName: string) => {
  try {
    const existingContainers = await docker.listContainers({
      all: true,
      filters: { name: [application.appName] },
    });

    // If a container with this name exists, remove it
    if (existingContainers.length > 0) {
      const existingContainer = docker.getContainer(existingContainers[0].Id);
      console.log(`Removing existing container: ${existingContainer.id}`);
      
      try {
        await existingContainer.stop();
      } catch (error: any) {
        console.log(`Container was not running or couldn't be stopped: ${error.message}`);
      }
      
      try {
        await existingContainer.remove({ force: true });
        console.log(`Existing container removed: ${existingContainer.id}`);
      } catch (error: any) {
        console.log(`Failed to remove existing container: ${error.message}`);
        throw error;
      }
    }

 
    // Create a new container
    const environmentVariables = prepareEnvironmentVariables(application.env);

    const containerConfig = {
      Image: `${application.appName}:latest`,
      name: application.appName,
      Env: environmentVariables,
      ExposedPorts: {
        [`${application.targetPort}/tcp`]: {}
      },
      HostConfig: {
        PortBindings: {
          [`${application.publishedPort}/tcp`]: [
            {
              HostIp: '0.0.0.0',
              HostPort: `${application.targetPort}`
            }
          ]
        },
        Binds: [`${volumeName}:/app/data`],
      },
      NetworkingConfig: {
        EndpointsConfig: {
          [networkName]: {},
        },
      },
    };

    console.log('Container Config:', JSON.stringify(containerConfig, null, 2));

    console.log("CREATING NEW CONTAINER");
    const newContainer = await docker.createContainer(containerConfig);
    return { container: newContainer, isNew: true };
  } catch (error: any) {
    console.log(`Error in findOrCreateContainer: ${error.message}`);
    throw error;
  }
};


export const startContainer = async (container: Container) => {
  await container.start();
  return container;
};

export const connectContainerToNetwork = async (container: Container, networkName: string) => {
  try {
    const containerInfo = await container.inspect();
    const isAlreadyConnected = containerInfo.NetworkSettings.Networks.hasOwnProperty(networkName);

    if (!isAlreadyConnected) {
      const network = docker.getNetwork(networkName);
      await network.connect({ Container: container.id });
      console.log(`Container ${container.id} connected to network ${networkName}`);
    } else {
      console.log(`Container ${container.id} is already connected to network ${networkName}`);
    }
  } catch (error: any) {
    console.error(`Error connecting container to network: ${error.message}`);
    throw error;
  }
};


// Get or create a Docker network
export async function getOrCreateNetwork(networkName: string) {
  try {
    const network = await docker.createNetwork({ Name: networkName });
    return network;
  } catch (error: any) {
    if (error.statusCode === 409) { // Network already exists
      const network = docker.getNetwork(networkName);
      return network;
    }
    throw error;
  }
}

export const deleteDuplicateNetworks = async (networkName: string) => {
  try {
    // List all networks
    const networks = await docker.listNetworks({
      filters: { name: [networkName] },
    });

    // Filter networks by name
    const duplicateNetworks = networks.filter(network => network.Name === networkName);

    if (duplicateNetworks.length > 1) {
      console.log(`Found ${duplicateNetworks.length} networks with name: ${networkName}`);
      // Keep one network and delete the rest
      for (let i = 1; i < duplicateNetworks.length; i++) {
        const networkId = duplicateNetworks[i].Id;
        const network = docker.getNetwork(networkId);
        await network.remove();
        console.log(`Deleted duplicate network with ID: ${networkId}`);
      }
    } else {
      console.log(`No duplicate networks found for name: ${networkName}`);
    }
  } catch (error: any) {
    console.error(`Error deleting duplicate networks: ${error.message}`);
  }
};

// Prepare environment variables for Docker
export const prepareEnvironmentVariables = (env: string | null) =>
  Object.entries(parse(env ?? "")).map(([key, value]) => `${key}=${value}`);

// Check if a port is available
export async function isPortAvailable(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = require("net").createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Find an available port starting from a given port
export async function findAvailablePort(startPort = 3000) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

// Get container stats
export async function getContainerStats(containerId: string) {
  const container = docker.getContainer(containerId);
  const stats = (await container.stats({ stream: false })) as ContainerStats;

  return {
    cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
    memoryUsage: stats.memory_stats.usage,
    networkRx: stats.networks
      ? Object.values(stats.networks).reduce(
          (total, net) => total + (net?.rx_bytes || 0),
          0
        )
      : 0,
    networkTx: stats.networks
      ? Object.values(stats.networks).reduce(
          (total, net) => total + (net?.tx_bytes || 0),
          0
        )
      : 0,
  };
}

// Wait for a container to reach a specific state
export async function waitForContainerState(
  containerId: string,
  desiredState: string,
  timeout = 30000
) {
  const container = docker.getContainer(containerId);
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const containerInfo = await container.inspect();
    if (containerInfo.State.Status === desiredState) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(
    `Container did not reach ${desiredState} state within ${timeout}ms`
  );
}

// Get container logs
export async function getContainerLogs(containerId: string, tail = 100) {
  const container = docker.getContainer(containerId);
  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail: tail,
    timestamps: true,
  });
  return logs.toString("utf8");
}

// Execute a command in a container using execAsync
// export async function executeCommandInContainer(
//   containerId: string,
//   command: string
// ) {
//   const container = docker.getContainer(containerId);
//   const exec = await container.exec({
//     Cmd: ["/bin/sh", "-c", command],
//     AttachStdout: true,
//     AttachStderr: true,
//   });
//   const stream = await exec.start();

//   return new Promise<string>((resolve, reject) => {
//     let output = "";
//     stream.on("data", (chunk: Buffer) => {
//       output += chunk.toString();
//     });
//     stream.on("end", () => resolve(output));
//     stream.on("error", reject);
//   });
// }

// Check if a container exists
export async function containerExists(containerName: string) {
  const containers = await docker.listContainers({
    all: true,
    filters: { name: [containerName] },
  });
  return containers.length > 0;
}

// Remove a container
export async function removeContainer(containerId: string, force = false) {
  const container = docker.getContainer(containerId);
  await container.remove({ force: force });
}

// Pull a Docker image
export async function pullDockerImage(imageName: string) {
  await new Promise<void>((resolve, reject) => {
    docker.pull(imageName, (err: Error, stream: any) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err: any, output: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

// Get Docker system information
export async function getDockerInfo() {
  return await docker.info();
}

// List all Docker images
export async function listDockerImages() {
  return await docker.listImages();
}
