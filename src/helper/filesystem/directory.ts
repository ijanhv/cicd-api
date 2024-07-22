import { APPLICATIONS_PATH } from "@constants/index";
import { Application } from "@prisma/client";
import path from "node:path";

export const getBuildAppDirectory = (application: Application) => {
  const { appName, buildType, sourceType, customGitBuildPath, dockerfile } =
    application;
  let buildPath = "";

  if (sourceType === "GITHUB") {
    buildPath = application?.buildPath || "";

    if (buildType === "DOCKERFILE") {
      return path.join(
        APPLICATIONS_PATH,
        appName,
        buildPath ?? "",
        dockerfile || ""
      );
    }
    return path.join(APPLICATIONS_PATH, appName, buildPath ?? "");
  }
};
