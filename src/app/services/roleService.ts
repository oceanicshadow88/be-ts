import { Request } from 'express';
import * as Permission from '../model/permission';
import * as Project from '../model/project';
import * as Role from '../model/role';
import * as User from '../model/user';
import mongoose from 'mongoose';
import { invite } from '../utils/emailSender';
import { randomStringGenerator } from '../utils/randomStringGenerator';
import jwt from 'jsonwebtoken';
import config from '../config/app';

export const getProjectRole = async (req: Request) => {
  //use cache after all features moved to v2
  const roleModel = await Role.getModel(req.dbConnection);
  const tenantRoles = await roleModel.find({ tenant: req.tenantId }).populate({
    path: 'permissions',
    model: await Permission.getModel(req.dbConnection),
  });
  const roles = await roleModel.find({ isPublic: true }).populate({
    path: 'permissions',
    model: await Permission.getModel(req.dbConnection),
  });
  const rolesArr = tenantRoles ?? [];
  return [...rolesArr, ...roles];
};

export const createProjectNewRole = async (req: Request) => {
  const { roleName, permissions } = req.body;
  const roleModel = await Role.getModel(req.dbConnection);
  const role = new roleModel({
    name: roleName,
    slug: roleName.replace('-', '').toLowerCase(),
    permissions: permissions,
    tenant: req.tenantId,
  });
  role.save();
  return role;
};

export const updateProjectRole = async (req: Request) => {
  const { roleId } = req.params;
  const { permissions } = req.body;
  const role = await Role.getModel(req.dbConnection).findById(roleId);
  if (!role) {
    return;
  }
  if (role.isPublic) {
    throw new Error('Cannot Edit Public Role');
  }
  role.permissions = permissions;
  return role.save();
};

export const updateUserProjectRole = async (req: Request) => {
  const { userId, projectId } = req.params;
  const { roleId } = req.body;
  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findById(userId);

  for (const element of user.projectsRoles) {
    if (element?.project?.toString() === projectId) {
      element.role = roleId;
    }
  }
  const updateUser = await user.save();
  return updateUser;
};

export const deleteProjectRole = async (req: Request) => {
  const { projectId, roleId } = req.params;
  const project = await Project.getModel(req.dbConnection).findById(projectId);
  const updatedProjectRoles = project.roles.filter((item: any) => {
    return item._id?.toString() !== roleId;
  });
  project.roles = updatedProjectRoles;
  return project.save();
};

export const removeRoleFromProject = async (req: Request) => {
  const { userId, projectId } = req.params;
  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findById(userId);
  const updatedProjectRoles = user.projectsRoles.filter((item: any) => {
    return item.project?.toString() !== projectId;
  });
  user.projectsRoles = updatedProjectRoles;
  const updateUser = await user.save();
  return updateUser;
};

export const inviteUserToProject = async (req: Request) => {
  const { projectId } = req.params;
  const { roleId, email } = req.body;
  const userModel = await User.getModel(req.tenantsConnection);

  const projectModel = Project.getModel(req.dbConnection);

  const project = await projectModel.findById(projectId);

  let isUserActive = false;
  let user = await userModel.findOne({ email });
  if (!user) {
    const activeCode = randomStringGenerator(16);
    user = await new userModel({ email, activeCode, name: email.split('@')[0] });
    await user.save();
  }

  const permission = await userModel.findOne({
    email: email,
    'projectsRoles.project': new mongoose.Types.ObjectId(projectId),
  });
  if (!permission) {
    user = await userModel.findByIdAndUpdate(
      user._id,
      {
        $push: {
          tenants: req.tenantId,
          projectsRoles: [{ project: projectId, role: roleId }],
        },
      },
      { new: true },
    );
  }

  if (user.active) { 
    isUserActive = true;
  }

  const accessToken = jwt.sign({ id: user._id, email, role: roleId, activeCode: user.activeCode }, config.emailSecret);

  const name = user.active ? user.name : '';
  invite(user.email, name, isUserActive, accessToken, roleId, project.name, req.headers.origin ?? '');
  return { user };
};

export const getDefaultRoles = async (req: Request) => {
  const globalRoles = await Role.getModel(req.dbConnection)
    .find({ isPublic: true })
    .populate({
      path: 'permissions',
      model: Permission.getModel(req.dbConnection),
    });
  const tenantRoles = await Role.getModel(req.dbConnection)
    .find({ tenant: req.tenantId })
    .populate({
      path: 'permissions',
      model: Permission.getModel(req.dbConnection),
    });
  return [...globalRoles, ...tenantRoles];
};

export const getRoleById = async (req: Request) => {
  const { projectId, roleId } = req.params;
  //use cache after all features moved to v2
  const project = await Project.getModel(req.dbConnection)
    .findById(projectId)
    .populate({
      path: 'roles.permissions',
      model: Permission.getModel(req.dbConnection),
    });

  return project.roles.filter(
    (element: { id: { toString: () => string } }) => element?.id?.toString() === roleId,
  )[0];
};

export const getUserProjectRole = async (req: Request) => {
  const userModel = await User.getModel(req.tenantsConnection);
  const users = await userModel.find({});
  const projectMembersList = [];
  const projectId = req.params.id;
  for (const user of users) {
    const projectRoles = user.projectsRoles;
    for (const projectRole of projectRoles) {
      if (projectRole?.project?.toString() === projectId) {
        projectMembersList.push(user);
      }
    }
  }
  return projectMembersList;
};
