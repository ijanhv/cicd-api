import { Server, Socket } from "socket.io";
import Docker from "dockerode";

const docker = new Docker();

const startTerminal = async (imageName: string) => {
  const containers = await docker.listContainers({ all: true });
  const container = containers.find((c) => c.Image === imageName);

  if (!container) {
    throw new Error("Container not found");
  }

  const containerId = container.Id;
  const dockerContainer = docker.getContainer(containerId);

  const exec = await dockerContainer.exec({
    Cmd: ["/bin/bash"],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });

  return { exec, containerId };
};

export const setupTerminalSocket = (socket: Socket) => {
  socket.on("start-exec", async ({ imageName }) => {
    console.log(`Starting exec for ${imageName}`);
    try {
      const { exec, containerId } = await startTerminal(imageName);
      let currentDirectory = "/app";
      let prompt = `root@${containerId.slice(0, 12)}:${currentDirectory}# `;

      exec.start(
        { hijack: true, stdin: true },
        (err: Error | null, stream: any | null) => {
          if (err || !stream) {
            console.error("Error starting terminal session", err);
            socket.emit("terminal-error", "Error starting terminal session");
            return;
          }

          const cleanOutput = (chunk: Buffer) => {
            let output = chunk.toString("utf8");

            // Remove specific unwanted sequences
            output = output.replace(/\u001b\[\?2004[h|l]/g, ""); // Remove specific sequences
            output = output.replace(/\u001b]0;.*?\u0007/g, ""); // Remove directory change sequences
            output = output.replace(/\u0001\u003croot@[\w\-]+:.*?\u0007root@[\w\-]+:.*?#/g, ""); // Remove unwanted prompt parts
            output = output.replace(/\u0001/g, ""); // Remove remaining control characters
            output = output.replace(/\u0007/g, ""); // Remove remaining control characters
            output = output.replace(/root@[\w\-]+:.*?# /g, ""); // Remove final unwanted prompt parts

            return output;
          };

          // Stream for data from Docker container
          stream.on("data", (chunk: Buffer) => {
            const cleanedData = cleanOutput(chunk);
            console.log("Received data from container", cleanedData);
            socket.emit(`terminal-${imageName}-output`, { data: cleanedData, prompt });
          });

          stream.on("end", () => {
            socket.emit(`terminal-${imageName}-output`, { data: "Session ended", prompt });
          });

          stream.on("error", (streamErr: Error) => {
            console.error("Stream error", streamErr);
            socket.emit("terminal-error", "Stream error");
          });

          stream.on("close", () => {
            socket.emit(`terminal-${imageName}-output`, { data: "Session closed", prompt });
          });

          // Handle incoming data from the client and send it to Docker
          socket.on("terminal-input", (data: string) => {
            console.log("Sending input to container", data);
            if (stream) {
              stream.write(data + "\n");
            }
          });

          socket.on("disconnect", () => {
            console.log("Client disconnected, closing stream");
            if (stream) {
              stream.end();
              stream.destroy();
            }
          });
        }
      );
    } catch (error) {
      console.error("Error initializing terminal session", error);
      socket.emit("terminal-error", "Error initializing terminal session");
    }
  });
};
