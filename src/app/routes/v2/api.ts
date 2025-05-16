import express from 'express';
const router = express.Router();
import * as projectsController from '../../controllers/v1/projectsController';
import * as projectValidation from '../../validations/project';
import * as tenantValidations from '../../validations/tenant';
import * as tenantControllers from '../../controllers/v1/tenantController';
import {
  authenticationTokenMiddleware,
  authenticationRefreshTokenMiddleware,
} from '../../middleware/authMiddleware';
import { authenticationEmailTokenMiddlewareV2 } from '../../middleware/registerMiddlewareV2';
import { authenticationForgetPasswordMiddleware } from '../../middleware/forgetPasswordMiddleware';
import * as loginControllerV2 from '../../controllers/v1/loginControllerV2';
import * as loginValidation from '../../validations/login';
import * as registerValidation from '../../validations/register';
import * as forgetPasswordController from '../../controllers/v1/forgetPasswordController';
import * as forgetPasswordValidation from '../../validations/forgetPassword';
import * as boardController from '../../controllers/v1/boardController';
import * as ticketController from '../../controllers/v1/ticketController';
import * as ticketValidation from '../../validations/ticketValidation';
import * as userControllers from '../../controllers/v1/userController';
import * as userValidation from '../../validations/user';
import * as commentControllers from '../../controllers/v1/commentController';
import * as commentValidation from '../../validations/comment';
import * as accountSettingControllers from '../../controllers/v1/accountSettingController';
import * as accountSettingValidation from '../../validations/accountSetting';
import * as shortcutControllers from '../../controllers/v1/shortcutController';
import * as shortcutValidation from '../../validations/shortcut';
import * as labelController from '../../controllers/v1/labelController';
import * as labelValidation from '../../validations/label';
import * as multerMiddleware from '../../middleware/multerMiddleware';
import * as saasMiddlewareV2 from '../../middleware/saasMiddlewareV2';
import * as userPageControllers from '../../controllers/v1/userPageController';
import * as userPageValidation from '../../validations/userPage';
import * as permissionMiddleware from '../../middleware/permissionMiddleware';
import * as memberController from '../../controllers/v1/memberController';
import * as memberValidation from '../../validations/member';
import * as roleController from '../../controllers/v1/roleController';
import * as roleValidation from '../../validations/role';
import * as permissionController from '../../controllers/v1/permissionController';
import * as typeController from '../../controllers/v1/typeController';
import * as contactController from '../../controllers/v1/contactController';
import * as contactValidation from '../../validations/contact';
import * as emailUsController from '../../controllers/v1/emailUsController';
import * as domainController from '../../controllers/v1/domainsController';
import * as activityControllers from '../../controllers/v1/activityController';
import * as dailyScrumControllers from '../../controllers/v1/dailyScrumController';
import * as dailyScrumValidations from '../../validations/dailyScrum';
import * as stripeController from '../../controllers/v1/stripeController';
import * as registerV2Controller from '../../controllers/v1/registerV2Controller';
import * as dashboardController from '../../controllers/v1/dashboardController';
import * as healthCheckController from '../../controllers/v1/healthCheckController';
import * as dashboardValidations from '../../validations/dashboard';
import * as sprintController from '../../controllers/v1/sprintController';
import * as sprintValidation from '../../validations/sprintValidation';
import * as backlogController from '../../controllers/v1/backlogController';
import * as statusesController from '../../controllers/v1/statusController';
import * as statuseValidation from '../../validations/statusValidation';
import * as securityController from '../../controllers/v1/securityController';
import * as retroBoardController from '../../controllers/v1/retroBoardController';
import * as retroItemController from '../../controllers/v1/retroItemController';
import * as epicController from '../../controllers/v1/epicController';
import * as epicValidator from '../../validations/epicValidation';
import * as importController from '../../controllers/v1/importController';
import * as exportController from '../../controllers/v1/exportController';
import { config } from '../../config/app';

// ----------------------- register -------------------------
//apply tenant and register-stepOne-V2
router.post('/register', registerV2Controller.register);
router.get('/healthcheck', healthCheckController.index);
router.get('/domains/exists', domainController.isValidDomain);
router.get('/domains', domainController.index);
if (config.devopsMode) {
  router.get('/envs', healthCheckController.envs);
}
router.get('/security', securityController.index);

router.get('/payment/productsInfo', stripeController.getAllProductsInfo);
router.use(saasMiddlewareV2.saas);

//emailVerifyCheck-stepTwo-V2
router.get('/register/:token', authenticationEmailTokenMiddlewareV2, registerV2Controller.verify);

//active account-stepThree-V2
router.put(
  '/register/:token',
  registerValidation.store,
  authenticationEmailTokenMiddlewareV2,
  registerV2Controller.store,
);

router.post('/domains/owner', domainController.getOwnerDomain);

router.get('/', (req: any, res: any) => {
  res.sendStatus(201);
});

router.post('/contacts', contactValidation.store, contactController.store);
router.post('/emailus', contactValidation.contactForm, emailUsController.contactForm);

//TODO: typo error
router.get('/tenants', tenantValidations.index, tenantControllers.index);
router.post('/tenants', tenantValidations.store, tenantControllers.store);
router.get(
  '/tenants/owner',
  tenantValidations.checkTenantOwnership,
  tenantControllers.checkTenantOwnership,
);

// ----------------------- login -------------------------
router.post('/login', loginValidation.login, loginControllerV2.login);
// ----------------------- login -------------------------

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

router.get(
  '/tickets/project/:id',
  projectValidation.show,
  authenticationTokenMiddleware,
  ticketController.ticketsByProject,
);

router.get(
  '/tickets/epic/:epicId',
  projectValidation.show,
  authenticationTokenMiddleware,
  ticketController.ticketsByEpic,
);

router.get('/tickets/:id', ticketValidation.show, ticketController.show);
router.post(
  '/tickets',
  ticketValidation.store,
  authenticationTokenMiddleware,
  ticketController.store,
);
router.put(
  '/tickets/:id',
  ticketValidation.update,
  authenticationTokenMiddleware,
  ticketController.update,
);
router.delete(
  '/tickets/:id',
  ticketValidation.remove,
  authenticationTokenMiddleware,
  ticketController.destroy,
);
//TODO: s
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

//TODO: s
router.patch(
  '/account/change-password',
  authenticationTokenMiddleware,
  accountSettingControllers.updatePassword,
);

router.post(
  '/auto-fetch-userInfo',
  authenticationRefreshTokenMiddleware,
  loginControllerV2.autoFetchUserInfo,
);

router.get('/projects', authenticationTokenMiddleware, projectsController.index);
router.get(
  '/projects/:id',
  authenticationTokenMiddleware,
  permissionMiddleware.permission('view:projects'),
  projectValidation.show,
  projectsController.show,
);
router.get('/projects/:id/details', projectsController.details);
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
//TODO: s
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
  memberController.destroy,
);
router.post(
  '/projects/:projectId/members/invite',
  memberValidation.invite,
  memberController.inviteOne,
);

// roleV2
router.get('/permissions', permissionController.index);
router.get('/roles', roleController.defaultRoles);
// get all roles from peoject
router.get('/projects/:projectId/roles', roleValidation.getProject, roleController.index);
router.get(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  roleController.roleById,
);
// add new role
router.post(
  '/projects/:projectId/roles',
  roleValidation.getProject,
  authenticationTokenMiddleware,
  roleController.addNewRole,
);
// update role
router.put(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  authenticationTokenMiddleware,
  roleController.update,
);
// delete role
router.delete(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  authenticationTokenMiddleware,
  roleController.destroy,
);

router.post('/uploads', multerMiddleware.upload.array('photos') as any, (req: any, res: any) => {
  res.status(200).json(req.files);
});

router.get('/types', typeController.index);

router.get('/board/:boardId', boardController.showBoard);
router.get('/sprints/:sprintId/tickets', boardController.showBoardTickets);
router.get('/sprints/:sprintId/retro', retroBoardController.index);
router.get('/sprints/:sprintId/retro/items', retroItemController.index);
router.post('/sprints/:sprintId/retro/items', retroItemController.store);
router.put('/retro/items/:id', retroItemController.update);
router.delete('/retro/items/:id', retroItemController.destroy);

router.get('/labels', labelController.index);
router.get('/labels/:projectId', labelController.index);
router.get('/projects/:projectId/labels', labelController.index);
router.post('/tickets/:ticketId/labels', labelValidation.store, labelController.store);
router.delete(
  '/tickets/:ticketId/labels/:labelId',
  labelValidation.eliminate,
  labelController.remove,
);
router.put('/labels/:id', labelValidation.update, labelController.update);
router.delete('/labels/:id', labelValidation.remove, labelController.destroy);

// backlogs
router.get('/projects/:projectId/backlogs', backlogController.index);

// sprints
router.get('/sprints', sprintController.show);
router.post('/sprints', sprintValidation.store, sprintController.store);
router.put('/sprints/:id', sprintController.update);
router.delete('/sprints/:id', sprintController.destroy);
router.get('/projects/:projectId/sprints/current', sprintController.currentSprint);

// statuses
router.get('/projects/:projectId/statuses', statuseValidation.index, statusesController.index);

//TODO:
//activities
router.get('/activities/:tid', activityControllers.show);
router.delete('/activities/:id', activityControllers.destroy);

//TODO: s
//dailyScrums
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

// payment
router.post('/webhook', stripeController.listenStripeWebhook);
router.post('/payment/createCheckoutSession', stripeController.createStripeCheckoutSession);
router.post('/payment/createCustomerPortal', stripeController.createStripeCustomerPortal);
router.get('/payment/isCurrentPlanFree', stripeController.isCurrentPlanFree);
router.get('/payment/isCurrentPlanSubscribed', stripeController.isCurrentPlanSubscribed);
router.get('/payment/currentPlanId', stripeController.getCurrentPlanId);
router.get('/payment/customerId', stripeController.getCustomerId);
router.get('/payment/priceInfo/:priceId', stripeController.getPriceInfoById);
router.get('/payment/subscriptionHistory', stripeController.getSubscriptionHistory);

// epic
router.post('/epics', authenticationTokenMiddleware, epicValidator.store, epicController.store);
router.get(
  '/epics/project/:projectId',
  authenticationTokenMiddleware,
  epicValidator.showEpicByProject,
  epicController.showEpicByProject,
);
router.get('/epics/:id', authenticationTokenMiddleware, epicValidator.show, epicController.show);
router.put('/epics/:id', authenticationTokenMiddleware, epicController.update);
router.delete(
  '/epics/:id',
  authenticationTokenMiddleware,
  epicValidator.destroy,
  epicController.destroy,
);

// csv
//import
router.post(
  '/import-project',
  multerMiddleware.memoryUpload.single('file'),
  importController.importProjectByCsv,
);
router.post(
  '/import-project/large',
  multerMiddleware.diskUpload.single('file'),
  importController.importProjectByCsv,
);
//export
router.get(
  '/export-project/fields',
  exportController.exportTicketFields,
);
router.get(
  '/export-project/:projectId/tickets',
  exportController.exportTicketsCsv,
);
// dashboard
router.get('/projects/:projectId/dashboards', dashboardValidations.show, dashboardController.show);
router.get(
  '/projects/:projectId/dashboards/dailyScrums',
  dashboardValidations.showDailyScrums,
  dashboardController.showDailyScrums,
);
router.get(
  '/projects/:projectId/dashboards/reports',
  dashboardValidations.generatePDF,
  dashboardController.generatePDF,
);

router.get('/temp/projects/:projectId/import', projectsController.tempImport);

//code review: Some endpoints may not require saas middleware
module.exports = router;
