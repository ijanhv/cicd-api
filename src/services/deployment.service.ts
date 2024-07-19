import { PrismaClient, Deployment } from "@prisma/client";

import prisma from "../client";

 const createDeployment = async (data: Omit<Deployment, 'deploymentId' | 'createdAt'>) => {
  return prisma.deployment.create({
    data
  });
};

 const getDeployments = async () => {
  return prisma.deployment.findMany();
};

 const getDeploymentById = async (id: string) => {
  return prisma.deployment.findUnique({
    where: { deploymentId: id }
  });
};

 const updateDeployment = async (id: string, data: Partial<Deployment>) => {
  return prisma.deployment.update({
    where: { deploymentId: id },
    data
  });
};

 const deleteDeployment = async (id: string) => {
  return prisma.deployment.delete({
    where: { deploymentId: id }
  });
};


export default {
    createDeployment,
    getDeploymentById,
    getDeployments,
    updateDeployment,
    deleteDeployment
}