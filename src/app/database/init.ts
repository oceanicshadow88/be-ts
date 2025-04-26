import * as Role from '../model/role';
import * as Permission from '../model/permission';
import * as Type from '../model/type';
import * as retroBoardServices from '../services/retroBoardService';

export const TICKET_TYPES = [
  {
    name: 'Story',
    slug: 'story',
    icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium',
  },
  {
    name: 'Task',
    slug: 'task',
    icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium',
  },
  {
    name: 'Bug',
    slug: 'bug',
    icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium',
  },
  {
    name: 'Tech Debt',
    slug: 'techDebt',
    icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10308?size=medium',
  },
];

export const createTicketType = async (dbConnection: string) => {
  const type = Type.getModel(dbConnection);

  for (const objType of TICKET_TYPES) {
    const hasType = await type.find({ slug: objType.slug });
    if (hasType.length > 0) {
      continue;
    }
    const newType = new type(objType);
    await newType.save();
  }
};

export const init = async (dbConnection: any) => {
  const roleModel = Role.getModel(dbConnection);
  const permission = Permission.getModel(dbConnection);

  createTicketType(dbConnection);

  const result = await roleModel.find({ slug: 'admin' });
  if (result.length > 0) {
    return;
  }

  const viewProjectPolicy = new permission({ slug: 'view:projects', description: 'View Project' });
  const editProjectPolicy = new permission({ slug: 'edit:projects', description: 'Edit Project' });
  const deleteProjectPolicy = new permission({
    slug: 'delete:projects',
    description: 'Delete Project',
  });

  const createBoardPolicy = new permission({ slug: 'create:boards', description: 'Create Boards' });
  const viewBoardPolicy = new permission({ slug: 'view:boards', description: 'View Boards' });
  const editBoardPolicy = new permission({ slug: 'edit:boards', description: 'Edit Project' });
  const deleteBoardPolicy = new permission({
    slug: 'delete:boards',
    description: 'Delete Project',
  });

  const addMembersPolicy = new permission({ slug: 'add:members', description: 'Add Members' });
  const viewMembersPolicy = new permission({ slug: 'view:members', description: 'View Members' });
  const editMembersPolicy = new permission({ slug: 'edit:members', description: 'Edit Members' });
  const deleteMembersPolicy = new permission({
    slug: 'delete:members',
    description: 'Delete Members',
  });

  const addRolesPolicy = new permission({ slug: 'add:roles', description: 'Add Roles' });
  const viewRolesPolicy = new permission({ slug: 'view:roles', description: 'View Roles' });
  const editRolesPolicy = new permission({ slug: 'edit:roles', description: 'Edit Roles' });
  const deleteRolesPolicy = new permission({ slug: 'delete:roles', description: 'Delete Roles' });

  const addShortcutsPolicy = new permission({
    slug: 'add:shortcuts',
    description: 'Add Shortcuts',
  });
  const viewShortcutsPolicy = new permission({
    slug: 'view:shortcuts',
    description: 'View Shortcuts',
  });
  const editShortcutsPolicy = new permission({
    slug: 'edit:shortcuts',
    description: 'Edit Shortcuts',
  });
  const deleteShortcutsPolicy = new permission({
    slug: 'delete:shortcuts',
    description: 'Delete Shortcuts',
  });

  const addCardsPolicy = new permission({ slug: 'add:tickets', description: 'Add Tickets' });
  const viewCardsPolicy = new permission({ slug: 'view:tickets', description: 'View Tickets' });
  const editCardsPolicy = new permission({ slug: 'edit:tickets', description: 'Edit Tickets' });
  const deleteCardsPolicy = new permission({
    slug: 'delete:tickets',
    description: 'Delete Tickets',
  });

  const viewSettingsPolicy = new permission({
    slug: 'view:settings',
    description: 'View Settings',
  });
  const editSettingsPolicy = new permission({
    slug: 'edit:settings',
    description: 'Edit Settings',
  });

  await viewProjectPolicy.save();
  await editProjectPolicy.save();
  await deleteProjectPolicy.save();

  await createBoardPolicy.save();
  await viewBoardPolicy.save();
  await editBoardPolicy.save();
  await deleteBoardPolicy.save();

  await addMembersPolicy.save();
  await viewMembersPolicy.save();
  await editMembersPolicy.save();
  await deleteMembersPolicy.save();

  await addRolesPolicy.save();
  await viewRolesPolicy.save();
  await editRolesPolicy.save();
  await deleteRolesPolicy.save();

  await addShortcutsPolicy.save();
  await viewShortcutsPolicy.save();
  await editShortcutsPolicy.save();
  await deleteShortcutsPolicy.save();

  await addCardsPolicy.save();
  await viewCardsPolicy.save();
  await editCardsPolicy.save();
  await deleteCardsPolicy.save();

  await viewSettingsPolicy.save();
  await editSettingsPolicy.save();
  ////////////////////////////////
  const permissions = [
    viewProjectPolicy._id,
    editProjectPolicy._id,
    deleteProjectPolicy._id,
    createBoardPolicy._id,
    viewBoardPolicy._id,
    editBoardPolicy._id,
    deleteBoardPolicy._id,
    addMembersPolicy._id,
    viewMembersPolicy._id,
    editMembersPolicy._id,
    deleteMembersPolicy._id,
    addRolesPolicy._id,
    viewRolesPolicy._id,
    editRolesPolicy._id,
    deleteRolesPolicy._id,
    addShortcutsPolicy._id,
    viewShortcutsPolicy._id,
    editShortcutsPolicy._id,
    deleteShortcutsPolicy._id,
    addCardsPolicy._id,
    viewCardsPolicy._id,
    editCardsPolicy._id,
    deleteCardsPolicy.id,
    viewSettingsPolicy._id,
    editSettingsPolicy._id,
  ];

  const devPermissions = [
    viewProjectPolicy._id,
    editProjectPolicy._id,
    deleteProjectPolicy._id,
    viewBoardPolicy._id,
    editBoardPolicy._id,
    deleteBoardPolicy._id,
    addShortcutsPolicy._id,
    viewShortcutsPolicy._id,
    editShortcutsPolicy._id,
    deleteShortcutsPolicy._id,
    addCardsPolicy._id,
    viewCardsPolicy._id,
    editCardsPolicy._id,
  ];

  const guestPermissions = [viewProjectPolicy._id, viewBoardPolicy._id, viewShortcutsPolicy._id];

  const adminRole = new roleModel({
    name: 'Admin',
    slug: 'admin',
    isPublic: true,
    permissions: permissions,
  });
  const developerRole = new roleModel({
    name: 'Developer',
    slug: 'developer',
    isPublic: true,
    permissions: devPermissions,
  });
  const productManagerRole = new roleModel({
    name: 'Product Manager',
    slug: 'product-manager',
    isPublic: true,
    permissions: permissions,
  });
  const guestRole = new roleModel({
    name: 'Guest',
    slug: 'guest',
    isPublic: true,
    permissions: guestPermissions,
  });

  await adminRole.save();
  await developerRole.save();
  await productManagerRole.save();
  await guestRole.save();

  retroBoardServices.initGlobalRetro(dbConnection);
};
