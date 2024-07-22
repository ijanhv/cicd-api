import express from "express";
import authRoute from "./auth.route";
import projectRoute from "./project.route";
import applicationRoute from "./application.route";
import postgresRoute from "./postgres.route";
import mongodbRoute from './mongodb.route'
import deploymentRoute from './deployment.route'

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/projects",
    route: projectRoute,
  },
  {
    path: "/application",
    route: applicationRoute,
  },
  {
    path: "/database/postgres",
    route: postgresRoute
  },
  {
    path: "/database/mongo",
    route: mongodbRoute
  },
  {    path: "/deployment",
    route: deploymentRoute

  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

//   if (config.env === 'development') {
//     devRoutes.forEach((route) => {
//       router.use(route.path, route.route);
//     });
//   }

export default router;
