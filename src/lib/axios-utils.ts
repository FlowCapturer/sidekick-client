import axios, { type AxiosInstance } from 'axios';
import { getLocalStorage } from './utils';
import { showErrorToast } from './toast-helper';
import { appInfo } from '../config/app-config';

/**
 * Axios utility for making HTTP requests with common configurations.
 * Automatically attaches the provided API key to every request header.
 */

/**
 * Creates an Axios instance with default headers and base URL.
 * @returns Configured Axios instance.
 */

let axiosInstance: AxiosInstance | null = null;

const getAxiosInstance = (): AxiosInstance => {
  if (axiosInstance) {
    return axiosInstance;
  }

  axiosInstance = axios.create({
    baseURL: appInfo.serverUrl,
    headers: {
      api: getLocalStorage('apiKey') || '',
      'Content-Type': 'application/json',
    },
  });

  // Add a request interceptor to always set the latest API key
  axiosInstance.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers['api'] = getLocalStorage('apiKey') || '';
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      return response.data?.response;
    },
    (error) => {
      if (!error.response) {
        showErrorToast({
          header: error.message || 'Network error',
          description: 'Unable to connect with server.',
        });
        throw error;
      }

      const errorRes = error.response.data;

      showErrorToast({
        header: parseDbErrorMessageEnhanced(errorRes?.error?.errorMsg) || 'Server error',
        description: parseDbErrorMessageEnhanced(errorRes.error.solution) || '',
      });

      throw errorRes.error;
    },
  );
  return axiosInstance;
};

const tableNameMapping: Record<string, Record<string, string>> = {
  auth_users_tbl: {
    user_id: 'User Id',
    user_email: 'User Email',
    user_mobile_no: 'User Mobile Number',
    user_fname: "User's First Name",
    user_lname: "User's Last Name",
    user_is_active: 'User Is Active',
  },
  auth_organization_tbl: {
    org_id: appInfo.account_type_txt.singular + ' Id',
    org_name: appInfo.account_type_txt.singular + ' Name',
    org_address: appInfo.account_type_txt.singular + ' Address',
    org_state: appInfo.account_type_txt.singular + ' State',
    org_country: appInfo.account_type_txt.singular + ' Country',
    org_external_id: appInfo.account_type_txt.singular + ' External ID',
    org_gst_in: appInfo.account_type_txt.singular + ' External ID',
    org_is_deleted: appInfo.account_type_txt.singular + ' Deleted',
    org_created_by: appInfo.account_type_txt.singular + ' Created By',
  },
  auth_organization_users_tbl: {
    org_user_id: appInfo.account_type_txt.singular + 'User ID',
    org_id: appInfo.account_type_txt.singular + 'ID',
    user_id: 'User Id',
    org_user_role_id: appInfo.account_type_txt.singular + 'User Role Id',
    org_user_is_active: appInfo.account_type_txt.singular + 'User is active',
    user_opinion: 'User Opinion',
  },
  auth_invited_users_tbl: {
    invited_users_id: 'Invited Users Id',
    org_id: appInfo.account_type_txt.singular + 'Id',
    email: 'Email',
    invited_user_role_id: 'Invited user role Id',
    invited_by_user_id: 'Invited by user Id',
    is_deleted: 'Deleted',
  },
};

const parseDbErrorMessageEnhanced = (errorMessage: string): string => {
  // Regular expression to match table.column patterns
  const tableColumnPattern = /(\w+)\.(\w+)/g;

  let parsedMessage = errorMessage;

  // Find all table.column matches
  const matches = errorMessage.matchAll(tableColumnPattern);

  for (const match of matches) {
    const fullMatch = match[0]; // e.g., "auth_users_tbl.user_email"
    const tableName = match[1]; // e.g., "auth_users_tbl"
    const columnName = match[2]; // e.g., "user_email"

    // Check if we have a mapping for this table and column
    if (tableNameMapping[tableName]?.[columnName]) {
      const friendlyName = tableNameMapping[tableName][columnName];
      parsedMessage = parsedMessage.replace(fullMatch, friendlyName);
    }
  }

  parsedMessage = parsedMessage.replaceAll('key', 'field');

  return parsedMessage;
};

export { getAxiosInstance };
