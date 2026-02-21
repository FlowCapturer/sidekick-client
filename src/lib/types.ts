import type { LucideIcon } from 'lucide-react';

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItemSub {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isExpanded?: boolean;
  items?: NavItemSub[];
  parent?: NavItem;
}

export interface IVirtualChildOf {
  parentId: string;
  id: string;
  title: string;
}

export interface LoginCmd {
  api: string;
}

export interface OrganizationType {
  org_id: number;
  org_name: string;
  org_address: string;
  org_state: string;
  org_country: string;
  org_external_id: string;
  org_is_deleted: boolean;
  role_id: number;
  org_created_by: number;
  created_at: string;
  updated_at: string;

  logo?: LucideIcon;

  active_purchased_plan?: purchasedPlansInf;
}

export interface OrganizationTypeResponse {
  orgs: OrganizationType[];
}

export interface loggedInUserInf {
  email: string;
  id: number;
  fname?: string;
  lname?: string;
  mobNo?: string;
}

export interface purchasedPlansInfResponse {
  purchasedPlans: purchasedPlansInf[];
  activePlan: purchasedPlansInf;
}

export interface purchasedPlansInf {
  plan_id: string;
  purchased_at: string;
  for_months: number;
  for_no_users: number;
  status: string;
  amount: number;
  transaction_id: string;
  old_purchased_for_no_users: number;

  z_currency: string;
  z_order_id: string;
  z_payment_method: string;
  z_payment_id: string;
  purchased_id: number;
  updatedRecords?: IUpdatedPurchasedPlan[];

  //calculated fields
  startAt: Date;
  endAt: Date;
  old_purchased_amount?: number;
}

export interface IUpdatedPurchasedPlan {
  purchased_id: number;
  updated_at: string;
  for_no_users: string;
  status: string;
  amount: number;
  z_order_id: string;
  z_payment_method: string;
  z_payment_at: string;
  z_currency: string;
  z_payment_id: string;
}

export interface SessionInfoResponse {
  sessionInfo: loggedInUserInf;
  user: responseTeamMembersInf;
}

export interface EmailProcessingResult {
  validEmails: string[];
  invalidEmails: string[];
  totalProcessed: number;
}

type userOpinionType = 0 | 1 | 2 | 3 | 4 | number;

export interface TeamMembersDetails {
  email: string;
  role_id: number;
  id: string;
  user_opinion: userOpinionType;
  fname?: string;
  lname?: string;

  invited_users_id?: number;
}

export interface responseTeamMembersInf {
  user_email: string;
  user_id: string;
  role_id: number;
  is_active: 0 | 1;
  user_fname: string;
  user_lname: string;
  user_opinion: userOpinionType;
  email?: string;
  user_mobile_no?: number;
  joined_on: string;
  invited_users_id?: string;
}

export interface IEachInvitation {
  org_name: string;
  org_id: string;
  org_user_is_admin: string;
  org_user_is_active: 0 | 1;
  sent_at: string;
  user_opinion?: number;
}

export interface IInvitationsResponse {
  invites: IEachInvitation[];
}

export interface ICountry {
  countryCode: string;
  countryName: string;
}
export interface ICountries {
  countries: ICountry[];
}

export interface ICreateOrderResponse {
  orderId: string;
  message: string;
  insertRecordId: number;
}

export interface IVerifyPaymentResponse {
  success: boolean;
  message: string;
}

export type IFeatureFlagsResponse = {
  featureFlags: Record<string, boolean>;
};

export interface IRazorPayPrefill {
  name: string;
  email: string;
  contact: string;
}

export interface IUserData {
  user_id: number;
  user_email: string;
  user_mobile_no: string;
  user_fname: string;
  user_lname: string;
  user_is_active: boolean;
  created_at: string;
  updated_at: string;
}
