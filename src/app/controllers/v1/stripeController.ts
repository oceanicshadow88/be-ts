import { Request, Response } from 'express';
import { stripeService } from '../../services/stripeService';
import { asyncHandler } from '../../utils/helper';
import { paymentInfoDtos } from '../../dto/paymentInfoDto';
import { IProductInfo } from '../../types';

export const createStripeCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const { priceId, customerId } = req.body;
  const domainUrl = req.headers.origin ?? '';
  const tenantId = req.tenantId;
  const stripeSessionInfo = await stripeService.createStripeCheckoutSession(req.tenantsConnection, domainUrl, priceId, customerId, tenantId);
  res.status(200).json(stripeSessionInfo);
});

export const getCurrentPlanId = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const currentPlanId = await stripeService.getCurrentPlanId(tenantId, req.tenantsConnection);
  res.status(200).json(currentPlanId);
});

export const isCurrentPlanFree = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const tenantsConnection = req.tenantsConnection;
  const isFreePlan = await stripeService.isCurrentPlanFree(tenantId, tenantsConnection);
  res.status(200).json(isFreePlan);
});

export const isCurrentPlanSubscribed = asyncHandler(async (req: Request, res: Response) => {
  const priceId = req.query.priceId as string;
  const tenantId = req.tenantId;
  const isPlanSubscribed = await stripeService.isCurrentPlanSubscribed(req.tenantsConnection, priceId, tenantId);
  res.status(200).json(isPlanSubscribed);
});

export const getCustomerId = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const customerId = await stripeService.getCustomerId(tenantId, req.tenantsConnection);
  res.status(200).json(customerId);
});

export const createStripeCustomerPortal = asyncHandler(async (req: Request, res: Response) => {
  const { customerId } = req.body;
  const domainUrl = req.headers.origin ?? '';
  const tenantId = req.tenantId;
  const stripeCustomerPortalUrl = await stripeService.createStripeCustomerPortal(req.tenantsConnection, customerId, domainUrl, tenantId);
  res.status(200).json(stripeCustomerPortalUrl);
});

export const getAllProductsInfo = asyncHandler(async (req: Request, res: Response) => {
  const productsInfo: IProductInfo[] = await stripeService.getAllProductsInfo() ?? [];
  res.status(200).json({ productsInfo: paymentInfoDtos(productsInfo) });
});

export const getPriceInfoById = asyncHandler(async (req: Request, res: Response) => {
  const { priceId } = req.params;
  const priceInfo = await stripeService.getPriceInfoById(req.tenantsConnection, priceId);
  res.status(200).json(priceInfo);
});

export const getSubscriptionHistory = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const customerSubscriptionHistory = await stripeService.getSubscriptionHistory(req.tenantsConnection, tenantId);
  res.status(200).json(customerSubscriptionHistory);
});

export const listenStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const event = req.body;
  const payloadString = JSON.stringify(req.body).toString();
  const tenantId = req.tenantId;
  await stripeService.listenStripeWebhook(tenantId, req.tenantsConnection, event, payloadString);
  res.sendStatus(200);
});
