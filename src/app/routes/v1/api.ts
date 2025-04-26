const express = require('express');
const router = new express.Router();
import * as projectsController from '../../controllers/v1/projectsController';
const projectValidation = require('../../validations/project');
const tenantValidations = require('../../validations/tenant');
const tenantControllers = require('../../controllers/v1/tenantController');
const {
  authenticationTokenMiddleware,
  authenticationTokenValidationMiddleware,
  authenticationRefreshTokenMiddleware,
} = require('../../middleware/authMiddleware');
const {
  authenticationForgetPasswordMiddleware,
} = require('../../middleware/forgetPasswordMiddleware');
const loginController = require('../../controllers/v1/loginController');
const loginValidation = require('../../validations/login');
const forgetPasswordController = require('../../controllers/v1/forgetPasswordController');
const forgetPasswordValidation = require('../../validations/forgetPassword');
const boardController = require('../../controllers/v1/boardController');
const ticketController = require('../../controllers/v1/ticketController');
const ticketValidation = require('../../validations/ticketValidation');
const userControllers = require('../../controllers/v1/userController');
const userValidation = require('../../validations/user');
const commentControllers = require('../../controllers/v1/commentController');
const commentValidation = require('../../validations/comment');
const accountSettingControllers = require('../../controllers/v1/accountSettingController');
const accountSettingValidation = require('../../validations/accountSetting');
const shortcutControllers = require('../../controllers/v1/shortcutController');
const shortcutValidation = require('../../validations/shortcut');
const multerMiddleware = require('../../middleware/multerMiddleware');
const userPageControllers = require('../../controllers/v1/userPageController');
const userPageValidation = require('../../validations/userPage');
const permissionMiddleware = require('../../middleware/permissionMiddleware');
const memberController = require('../../controllers/v1/memberController');
const memberValidation = require('../../validations/member');
const roleController = require('../../controllers/v1/roleController');
const roleValidation = require('../../validations/role');
const permissionController = require('../../controllers/v1/permissionController');
const typeController = require('../../controllers/v1/typeController');
const contactController = require('../../controllers/v1/contactController');
const contactValidation = require('../../validations/contact');
const emailUsController = require('../../controllers/v1/emailUsController');
const domainController = require('../../controllers/v1/domainsController');
const activityControllers = require('../../controllers/v1/activityController');
const dailyScrumControllers = require('../../controllers/v1/dailyScrumController');
const dailyScrumValidations = require('../../validations/dailyScrum');
import * as sprintController from '../../controllers/v1/sprintController';
import * as sprintValidation from '../../validations/sprintValidation';
import * as statusesController from '../../controllers/v1/statusController';
import * as statuseValidation from '../../validations/statusValidation';

router.get('/', (req: any, res: any) => {
  res.sendStatus(201);
});

router.get('/domains', domainController.index);

router.post('/contacts', contactValidation.store, contactController.store);
router.post('/emailus', contactValidation.contactForm, emailUsController.contactForm);

router.get('/tenants', tenantValidations.index, tenantControllers.index);
router.post('/tenants', tenantValidations.store, tenantControllers.store);

router.post('/login', loginValidation.login, loginController.login);

router.post(
  '/reset-password',
  forgetPasswordValidation.forgetPasswordApplication,
  forgetPasswordController.forgetPasswordApplication,
);
router.get(
  '/change-password/:token',
  authenticationForgetPasswordMiddleware,
  forgetPasswordController.getUserEmail,
);
router.put(
  '/change-password/:token',
  authenticationForgetPasswordMiddleware,
  forgetPasswordValidation.updateUserPassword,
  forgetPasswordController.updateUserPassword,
);

router.get('/users', userControllers.index);
router.get('/users/:id', userValidation.show, userControllers.show);
router.put('/users/:id', userPageValidation.update, userPageControllers.update);

router.get('/comments/:id', commentControllers.show);
router.post('/comments', commentValidation.store, commentControllers.store);
router.put('/comments/:id', commentValidation.update, commentControllers.update);
router.delete('/comments/:id', commentValidation.remove, commentControllers.destroy);

router.delete('/comments/:id', commentControllers.destroy);

router.get('/tickets/:id', ticketValidation.show, ticketController.show);
router.post(
  '/tickets',
  ticketValidation.store,
  authenticationTokenMiddleware,
  ticketController.store,
);
router.put('/tickets/:id', ticketValidation.update, ticketController.update);
router.put('/tickets/:id/toggleActive', ticketValidation.update, ticketController.toggleActivate);
router.delete('/tickets/:id', ticketValidation.remove, ticketController.delete);

router.put(
  '/account/me',
  accountSettingValidation.update,
  authenticationTokenMiddleware,
  accountSettingControllers.update,
);
router.delete(
  '/account/me',
  accountSettingValidation.remove,
  authenticationTokenMiddleware,
  accountSettingControllers.destroy,
);

router.patch(
  '/account/change-password',
  authenticationTokenMiddleware,
  accountSettingControllers.updatePassword,
);

router.post(
  '/auto-fetch-userInfo',
  authenticationTokenValidationMiddleware,
  authenticationRefreshTokenMiddleware,
  loginController.autoFetchUserInfo,
);

router.get('/projects', authenticationTokenMiddleware, projectsController.index);
router.get(
  '/projects/:id',
  authenticationTokenMiddleware,
  permissionMiddleware.permission('view:projects'),
  projectValidation.show,
  projectsController.show,
);
router.put(
  '/projects/:id',
  authenticationTokenMiddleware,
  permissionMiddleware.permission('edit:projects'),
  projectValidation.update,
  projectsController.update,
);
router.post(
  '/projects',
  authenticationTokenMiddleware,
  projectValidation.store,
  projectsController.store,
);
router.delete(
  '/projects/:id',
  authenticationTokenMiddleware,
  permissionMiddleware.permission('delete:projects'),
  projectValidation.remove,
  projectsController.deleteOne,
);

router.post('/projects/:id/shortcuts', shortcutValidation.store, shortcutControllers.store);
router.put(
  '/projects/:projectId/shortcuts/:shortcutId',
  shortcutValidation.update,
  shortcutControllers.update,
);
router.delete(
  '/projects/:projectId/shortcuts/:shortcutId',
  shortcutValidation.remove,
  shortcutControllers.destroy,
);

router.get('/projects/:id/members', memberController.index);
router.put(
  '/projects/:projectId/members/:userId',
  memberValidation.update,
  memberController.update,
);
router.delete(
  '/projects/:projectId/members/:userId',
  memberValidation.remove,
  memberController.delete,
);
router.post(
  '/projects/:projectId/members/invite',
  memberValidation.invite,
  memberController.invite,
);

router.get('/permissions', permissionController.index);
router.get('/projects/:projectId/roles', roleValidation.getProject, roleController.index);
router.get(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  roleController.getRoleById,
);

router.put(
  '/projects/:projectId/roles',
  roleValidation.getProject,
  authenticationTokenMiddleware,
  roleController.addNewRole,
);

router.put(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  authenticationTokenMiddleware,
  roleController.update,
);

router.delete(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  authenticationTokenMiddleware,
  roleController.delete,
);

router.post('/uploads', multerMiddleware.array('photos'), (req: any, res: any) => {
  res.status(200).json(req.files);
});

router.get('/types', typeController.index);

router.get('/projects/:projectId/board', boardController.show);

router.get('/sprints', sprintController.show);
router.post('/sprints', sprintValidation.store, sprintController.store);
router.put('/sprints/:id', sprintController.update);
router.delete('/sprints/:id', sprintController.destroy);

router.get('/boards/:boardId/statuses', statuseValidation.index, statusesController.index);

router.get('/activities/:tid', activityControllers.show);
router.post('/activities', activityControllers.store);
router.delete('/activities/:id', activityControllers.destroy);

router.get(
  '/projects/:projectId/dailyScrums',
  dailyScrumValidations.show,
  dailyScrumControllers.show,
);
router.post(
  '/projects/:projectId/dailyScrums',
  dailyScrumValidations.store,
  dailyScrumControllers.store,
);
router.patch(
  '/projects/:projectId/dailyScrums/:dailyScrumId',
  dailyScrumValidations.update,
  dailyScrumControllers.update,
);
router.delete(
  '/projects/:projectId/dailyScrums',
  dailyScrumValidations.destroy,
  dailyScrumControllers.destroy,
);

module.exports = router;
