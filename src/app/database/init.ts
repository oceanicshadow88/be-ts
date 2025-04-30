import * as Role from '../model/role';
import * as Permission from '../model/permission';
import * as Type from '../model/type';
import * as retroBoardServices from '../services/retroBoardService';
import { capitalizeFirstLetter } from '../utils/helper';
import { Mongoose } from 'mongoose';

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

const createPolicies = (
  dbConnection: Mongoose,
  slug: string,
  hasCreatePolicy = true,
  hasEditPolicy = true,
  hasDeletePolicy = true,
) => {
  const permission = Permission.getModel(dbConnection);
  const name = capitalizeFirstLetter(slug.replace('-', ''));
  const policies = [];
  if (hasCreatePolicy) {
    policies.push(new permission({ slug: `add:${slug}`, description: `Add ${name}` }));
  }
  policies.push(new permission({ slug: `view:${slug}`, description: `View ${name}` }));
  if (hasEditPolicy) {
    policies.push(new permission({ slug: `edit:${slug}`, description: `Edit ${name}` }));
  }
  if (hasDeletePolicy) {
    policies.push(
      new permission({
        slug: `delete:${slug}`,
        description: `Delete ${name}`,
      }),
    );
  }
  policies.forEach((item) => item.save());

  return policies;
};

export const init = async (dbConnection: any) => {
  const roleModel = Role.getModel(dbConnection);

  createTicketType(dbConnection);

  const result = await roleModel.find({ slug: 'admin' });
  if (result.length > 0) {
    return;
  }
  const [createProjectPolicy, viewProjectPolicy, editProjectPolicy, deleteProjectPolicy] =
    createPolicies(dbConnection, 'projects');

  const [createBoardPolicy, viewBoardPolicy, editBoardPolicy, deleteBoardPolicy] = createPolicies(
    dbConnection,
    'boards',
  );

  const [addMembersPolicy, viewMembersPolicy, editMembersPolicy, deleteMembersPolicy] =
    createPolicies(dbConnection, 'members');

  const [addRolesPolicy, viewRolesPolicy, editRolesPolicy, deleteRolesPolicy] = createPolicies(
    dbConnection,
    'roles',
  );

  const [addShortcutsPolicy, viewShortcutsPolicy, editShortcutsPolicy, deleteShortcutsPolicy] =
    createPolicies(dbConnection, 'shortcuts');

  const [addCardsPolicy, viewCardsPolicy, editCardsPolicy, deleteCardsPolicy] = createPolicies(
    dbConnection,
    'tickets',
  );

  const [viewSettingsPolicy, editSettingsPolicy] = createPolicies(
    dbConnection,
    'settings',
    false,
    true,
    false,
  );

  const [addEpicsPolicy, viewEpicsPolicy, editEpicsPolicy, deleteEpicsPolicy] = createPolicies(
    dbConnection,
    'epics',
  );

  const [addStandupPolicy, viewStandupPolicy, editStandupPolicy] = createPolicies(
    dbConnection,
    'standup',
    true,
    true,
    false,
  );

  const [addRetroPolicy, viewRetroPolicy, editRetroPolicy, deleteRetroPolicy] = createPolicies(
    dbConnection,
    'retro',
  );

  const [viewBacklogPolicy] = createPolicies(dbConnection, 'backlog', false, false, false);

  const [addSprintsPolicy, viewSprintsPolicy, editSprintsPolicy, deleteSprintsPolicy] =
    createPolicies(dbConnection, 'sprints');

  const [addCommentsPolicy, viewCommentsPolicy, editCommentsPolicy, deleteCommentsPolicy] =
    createPolicies(dbConnection, 'comments');

  ////////////////////////////////
  const adminPermissions = [
    viewProjectPolicy._id,
    editProjectPolicy._id,
    deleteProjectPolicy._id,
    createBoardPolicy._id,
    viewBoardPolicy._id,
    editBoardPolicy._id,
    deleteBoardPolicy._id,
    viewMembersPolicy._id,
    editMembersPolicy._id,
    deleteMembersPolicy._id,
    viewRolesPolicy._id,
    editRolesPolicy._id,
    deleteRolesPolicy._id,
    viewShortcutsPolicy._id,
    editShortcutsPolicy._id,
    deleteShortcutsPolicy._id,
    viewCardsPolicy._id,
    editCardsPolicy._id,
    deleteCardsPolicy._id,
    addCardsPolicy._id,
    viewSettingsPolicy._id,
    editSettingsPolicy._id,
    addShortcutsPolicy._id,
    addRolesPolicy._id,
    addMembersPolicy._id,
    createProjectPolicy._id,
    addEpicsPolicy._id,
    viewEpicsPolicy._id,
    editEpicsPolicy._id,
    deleteEpicsPolicy._id,
    addStandupPolicy._id,
    viewStandupPolicy._id,
    editStandupPolicy._id,
    addRetroPolicy._id,
    viewRetroPolicy._id,
    editRetroPolicy._id,
    deleteRetroPolicy._id,
    viewBacklogPolicy._id,
    addSprintsPolicy._id,
    viewSprintsPolicy._id,
    editSprintsPolicy._id,
    deleteSprintsPolicy._id,
    addCommentsPolicy._id,
    viewCommentsPolicy._id,
    editCommentsPolicy._id,
    deleteCommentsPolicy._id,
  ];

  const devPermissions = [
    viewProjectPolicy._id,
    editProjectPolicy._id,
    deleteProjectPolicy._id,
    viewBoardPolicy._id,
    editBoardPolicy._id,
    deleteBoardPolicy._id,
    viewShortcutsPolicy._id,
    editShortcutsPolicy._id,
    deleteShortcutsPolicy._id,
    viewCardsPolicy._id,
    editCardsPolicy._id,
    addCardsPolicy._id,
    addEpicsPolicy._id,
    viewEpicsPolicy._id,
    editEpicsPolicy._id,
    addStandupPolicy._id,
    viewStandupPolicy._id,
    editStandupPolicy._id,
    addRetroPolicy._id,
    viewRetroPolicy._id,
    editRetroPolicy._id,
    deleteRetroPolicy._id,
    viewBacklogPolicy._id,
    viewSprintsPolicy._id,
    addCommentsPolicy._id,
    viewCommentsPolicy._id,
    editCommentsPolicy._id,
    deleteCommentsPolicy._id,
  ];

  const productManagerPermissions = [
    viewProjectPolicy._id,
    editProjectPolicy._id,
    deleteProjectPolicy._id,
    createBoardPolicy._id,
    viewBoardPolicy._id,
    editBoardPolicy._id,
    deleteBoardPolicy._id,
    viewMembersPolicy._id,
    editMembersPolicy._id,
    deleteMembersPolicy._id,
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
    deleteCardsPolicy._id,
    viewSettingsPolicy._id,
    editSettingsPolicy._id,
    addEpicsPolicy._id,
    viewEpicsPolicy._id,
    editEpicsPolicy._id,
    deleteEpicsPolicy._id,
    addStandupPolicy._id,
    viewStandupPolicy._id,
    editStandupPolicy._id,
    addRetroPolicy._id,
    viewRetroPolicy._id,
    editRetroPolicy._id,
    deleteRetroPolicy._id,
    viewBacklogPolicy._id,
    addSprintsPolicy._id,
    viewSprintsPolicy._id,
    editSprintsPolicy._id,
    deleteSprintsPolicy._id,
    addCommentsPolicy._id,
    viewCommentsPolicy._id,
    editCommentsPolicy._id,
    deleteCommentsPolicy._id,
  ];

  const guestPermissions = [
    viewProjectPolicy._id,
    viewBoardPolicy._id,
    viewShortcutsPolicy._id,
    viewCardsPolicy._id,
    viewEpicsPolicy._id,
    viewRetroPolicy._id,
    viewBacklogPolicy._id,
    viewSprintsPolicy._id,
    viewCommentsPolicy._id,
  ];

  const adminRole = new roleModel({
    name: 'Admin',
    slug: 'admin',
    isPublic: true,
    permissions: adminPermissions,
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
    permissions: productManagerPermissions,
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
