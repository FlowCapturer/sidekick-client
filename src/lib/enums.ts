import { appInfo } from '../config/app-config';

export const ROLES = {
  READ: 0,
  ADMIN: 1,
  WRITE: 2,
  Is_ADMIN: function (roleId: number) {
    return roleId === this.ADMIN;
  },
  CAN_WRITE: function (roleId: number) {
    return roleId === this.WRITE || roleId === this.ADMIN;
  },
  CAN_READ: function (roleId: number) {
    return roleId === this.READ || roleId === this.WRITE || roleId === this.ADMIN;
  },

  DISPLAY_TEXT: function (roleId: number) {
    const textMap = {
      [this.READ]: 'Read',
      [this.WRITE]: 'Read / Write',
      [this.ADMIN]: appInfo.account_type_txt.singular + ' Admin',
    };

    return textMap[roleId] || '';
  },

  IS_VALID_ROLE_ID: function (roleId: number) {
    return roleId === this.READ || roleId === this.ADMIN || roleId === this.WRITE;
  },

  GET_LIST: function () {
    return [
      { id: this.READ.toString(), text: this.DISPLAY_TEXT(this.READ) },
      { id: this.WRITE.toString(), text: this.DISPLAY_TEXT(this.WRITE) },
      { id: this.ADMIN.toString(), text: this.DISPLAY_TEXT(this.ADMIN) },
    ];
  },
};

export const updateRolesEnum = (newRoles: any) => {
  Object.assign(ROLES, newRoles);
};
