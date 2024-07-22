import path from "node:path"
import Docker from "dockerode"

export const BASE_PATH =
	process.env.NODE_ENV === "production"
		? "/etc/cicd"
		// : path.join(process.cwd(), ".docker");
		: "/home"


export const LOGS_PATH = `${BASE_PATH}/logs`;

export const APPLICATIONS_PATH = `${BASE_PATH}/applications`;

export const docker = new Docker({ socketPath: '/var/run/docker.sock' });
