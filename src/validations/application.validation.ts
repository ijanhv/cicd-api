import Joi from "joi";

 const createApplicationSchema = Joi.object({
    body: {


  name: Joi.string().min(1).required(),
  appName: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  env: Joi.string().allow("").optional(),
  memoryReservation: Joi.number().integer().optional(),
  memoryLimit: Joi.number().integer().optional(),
  cpuReservation: Joi.number().integer().optional(),
  cpuLimit: Joi.number().integer().optional(),
  title: Joi.string().allow("").optional(),
  enabled: Joi.boolean().optional(),
  subtitle: Joi.string().allow("").optional(),
  command: Joi.string().allow("").optional(),
  refreshToken: Joi.string().required(),
  sourceType: Joi.string().valid("github", "docker", "git").optional(),
  repository: Joi.string().allow("").optional(),
  owner: Joi.string().allow("").optional(),
  branch: Joi.string().allow("").optional(),
  buildPath: Joi.string().default("/").optional(),
  autoDeploy: Joi.boolean().optional(),
  username: Joi.string().allow("").optional(),
  password: Joi.string().allow("").optional(),
  dockerImage: Joi.string().allow("").optional(),
  customGitUrl: Joi.string().allow("").optional(),
  customGitBranch: Joi.string().allow("").optional(),
  customGitBuildPath: Joi.string().allow("").optional(),
  customGitSSHKey: Joi.string().allow("").optional(),
  dockerfile: Joi.string().allow("").optional(),
  healthCheckSwarm: Joi.object({
    Test: Joi.array().items(Joi.string()).optional(),
    Interval: Joi.number().optional(),
    Timeout: Joi.number().optional(),
    StartPeriod: Joi.number().optional(),
    Retries: Joi.number().optional(),
  }).allow(null).optional(),
  restartPolicySwarm: Joi.object({
    Condition: Joi.string().optional(),
    Delay: Joi.number().optional(),
    MaxAttempts: Joi.number().optional(),
    Window: Joi.number().optional(),
  }).allow(null).optional(),
  placementSwarm: Joi.object({
    Constraints: Joi.array().items(Joi.string()).optional(),
    Preferences: Joi.array().items(Joi.object({
      Spread: Joi.object({
        SpreadDescriptor: Joi.string().required(),
      }).required(),
    })).optional(),
    MaxReplicas: Joi.number().optional(),
    Platforms: Joi.array().items(Joi.object({
      Architecture: Joi.string().required(),
      OS: Joi.string().required(),
    })).optional(),
  }).allow(null).optional(),
  updateConfigSwarm: Joi.object({
    Parallelism: Joi.number().required(),
    Delay: Joi.number().optional(),
    FailureAction: Joi.string().optional(),
    Monitor: Joi.number().optional(),
    MaxFailureRatio: Joi.number().optional(),
    Order: Joi.string().required(),
  }).allow(null).optional(),
  rollbackConfigSwarm: Joi.object({
    Parallelism: Joi.number().required(),
    Delay: Joi.number().optional(),
    FailureAction: Joi.string().optional(),
    Monitor: Joi.number().optional(),
    MaxFailureRatio: Joi.number().optional(),
    Order: Joi.string().required(),
  }).allow(null).optional(),
  modeSwarm: Joi.object({
    Replicated: Joi.object({
      Replicas: Joi.number().optional(),
    }).optional(),
    Global: Joi.object().optional(),
    ReplicatedJob: Joi.object({
      MaxConcurrent: Joi.number().optional(),
      TotalCompletions: Joi.number().optional(),
    }).optional(),
    GlobalJob: Joi.object().optional(),
  }).allow(null).optional(),
  labelsSwarm: Joi.object().pattern(Joi.string(), Joi.string()).allow(null).optional(),
  networkSwarm: Joi.array().items(Joi.object({
    Target: Joi.string().optional(),
    Aliases: Joi.array().items(Joi.string()).optional(),
    DriverOpts: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  })).allow(null).optional(),
  replicas: Joi.number().default(1).optional(),
  applicationStatus: Joi.string().valid("idle", "running", "done", "error").optional(),
  buildType: Joi.string().valid("dockerfile", "heroku_buildpacks", "paketo_buildpacks", "nixpacks").optional(),
  createdAt: Joi.string().required(),
  registryId: Joi.string().optional(),
  projectId: Joi.string().required(),
}
});

 const updateApplicationSchema = createApplicationSchema.keys({
    params: {

        applicationId: Joi.string().min(1).required(),
    }
});


export default {
    createApplicationSchema,
    updateApplicationSchema
}