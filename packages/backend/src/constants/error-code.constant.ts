export enum ErrorEnum {
  DEFAULT = '0:未知错误',
  SERVER_ERROR = '500:服务繁忙，请稍后再试',

  SYSTEM_USER_EXISTS = '1001:系统用户已存在',
  INVALID_USERNAME_PASSWORD = '1003:用户名密码有误',
  PERMISSION_REQUIRES_PARENT = '1005:权限必须包含父节点',
  ILLEGAL_OPERATION_DIRECTORY_PARENT = '1006:非法操作：该节点仅支持目录类型父节点',
  PASSWORD_MISMATCH = '1011:旧密码与原密码不一致',
  USER_NOT_FOUND = '1017:用户不存在',

  INVALID_LOGIN = '1101:登录无效，请重新登录',
  NO_PERMISSION = '1102:无权限访问',
  ONLY_ADMIN_CAN_LOGIN = '1103:不是管理员，无法登录',
  REQUEST_INVALIDATED = '1104:当前请求已失效',
  ACCOUNT_LOGGED_IN_ELSEWHERE = '1105:您的账号已在其他地方登录',
  PARENT_MENU_NOT_FOUND = '1014:父级菜单不存在',
}
