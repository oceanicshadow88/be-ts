import { Response, Request, NextFunction } from 'express';
import * as Role from '../model/role';
import * as Permission from '../model/permission';
import * as Project from '../model/project';
import { IProjectRole } from '../model/user';
import { IRole, IRolePermission } from '../model/role';

const hasPermission = async (role: IRole, slug: string, req: Request) => {
  const roleObj = await role.populate({
    path: 'permissions',
    model: Permission.getModel(req.dbConnection),
  });

  return roleObj.permissions.some((element) => (element as IRolePermission).slug === slug);
};

const getProjectRoleId = (projectId: string, projectsRoles: IProjectRole[]) => {
  let roleId = null;
  projectsRoles.forEach((element: { project: { toString: () => string }; role: any }) => {
    if (element.project.toString() === projectId.toString()) {
      roleId = element.role;
    }
  });
  return roleId;
};

const checkIsOwner = async (projectId: string, userId: string, req: Request) => {
  const project = await Project.getModel(req.dbConnection).findById(projectId);
  return project.owner.toString() === userId;
};

const permission = (slug: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user: any = req.user;
    const projectId = req.params.id || req.params.projectId;
    const projectsRoles = user.projectsRoles;

    if (user.isSuperUser || (await checkIsOwner(projectId, user.id, req))) {
      next();
      return;
    }
    const roleId = getProjectRoleId(projectId, projectsRoles);

    if (!roleId) {
      res.status(403).send('no role id');
    }
    const role: IRole | null = await Role.getModel(req.dbConnection).findById(roleId);
    if (!role) {
      res.status(403).send('Cannot find role');
      return;
    }

    if (!(await hasPermission(role, slug, req))) {
      res.status(403).send('nothing');
    }
  };
};

export { permission };
