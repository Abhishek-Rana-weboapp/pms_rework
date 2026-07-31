/**
 * Hardcoded UI permission keys → backend permission catalog codenames.
 * Source: `GET permissions/` (grouped by module). Compare against
 * `userprofile.user_permissions` (string[]) via `hasPermission` / `usePermission`.
 *
 *   usePermission(PERMISSIONS.USER.CHANGE)
 *   hasPermission(permissions, PERMISSIONS.ARTIFACT.VIEW)
 */
export const PERMISSIONS = {
  ARTIFACT: {
    VIEW: "view_artifact",
    ADD: "add_artifact",
    CHANGE: "change_artifact",
    DELETE: "delete_artifact",
    ASSIGN: "assign_artifact",
    CHANGE_STATUS: "change_artifact_status",
    APPROVE: "approve_artifact",
    MOVE_SPRINT: "move_artifact_sprint",
    ESTIMATE: "estimate_story_points",
    VIEW_BACKLOG: "view_artifact_backlog",
    VIEW_ALL: "view_all_artifacts",
    COMMENT: "comment_artifacts",
    UPLOAD_ATTACHMENTS: "upload_artifact_attachments",
    CLOSE: "close_artifact",
    REOPEN: "reopen_artifact",
    VIEW_HISTORY: "view_artifact_history",
  },

  ARTIFACT_COMMENT: {
    VIEW: "view_artifactcomment",
    ADD: "add_artifactcomment",
    CHANGE: "change_artifactcomment",
    DELETE: "delete_artifactcomment",
    REPLY: "reply_comment",
  },

  ARTIFACT_COMMENT_MENTION: {
    VIEW: "view_artifactcommentmention",
    ADD: "add_artifactcommentmention",
    CHANGE: "change_artifactcommentmention",
    DELETE: "delete_artifactcommentmention",
    VIEW_MENTIONS: "view_comment_mentions",
    MENTION_USERS: "mention_users",
    MENTION_EXTERNAL: "mention_external_users",
  },

  ATTACHMENT: {
    VIEW: "view_attachment",
    ADD: "add_attachment",
    CHANGE: "change_attachment",
    DELETE: "delete_attachment",
    UPLOAD: "upload_attachment",
  },

  AUDIT_LOG: {
    VIEW: "view_auditlog",
    ADD: "add_auditlog",
    CHANGE: "change_auditlog",
    DELETE: "delete_auditlog",
    VIEW_ORG: "view_organization_audit_logs",
  },

  COMMENT_ATTACHMENT: {
    VIEW: "view_commentattachment",
    ADD: "add_commentattachment",
    CHANGE: "change_commentattachment",
    DELETE: "delete_commentattachment",
    UPLOAD: "upload_comment_attachment",
  },

  COMPANY_BRANCH: {
    VIEW: "view_companybranch",
    ADD: "add_companybranch",
    CHANGE: "change_companybranch",
    DELETE: "delete_companybranch",
  },

  COMPANY_SETTINGS: {
    VIEW: "view_companysettings",
    ADD: "add_companysettings",
    CHANGE: "change_companysettings",
    DELETE: "delete_companysettings",
    UPDATE: "update_company_settings",
    VIEW_CONFIGURATION: "view_company_configuration",
  },

  NOTIFICATION: {
    VIEW: "view_notification",
    ADD: "add_notification",
    CHANGE: "change_notification",
    DELETE: "delete_notification",
  },

  ORGANIZATION: {
    VIEW: "view_organization",
    ADD: "add_organization",
    CHANGE: "change_organization",
    DELETE: "delete_organization",
    VIEW_USERS: "view_organization_users",
  },

  ORGANIZATION_STATUS_TEMPLATE: {
    VIEW: "view_organizationstatustemplate",
    ADD: "add_organizationstatustemplate",
    CHANGE: "change_organizationstatustemplate",
    DELETE: "delete_organizationstatustemplate",
  },

  PRIORITY: {
    VIEW: "view_priority",
    ADD: "add_priority",
    CHANGE: "change_priority",
    DELETE: "delete_priority",
  },

  PROFILE: {
    VIEW: "view_profilemodel",
    ADD: "add_profilemodel",
    CHANGE: "change_profilemodel",
    DELETE: "delete_profilemodel",
    ASSIGN_PERMISSIONS: "assign_permissions",
    MANAGE_PERMISSIONS: "manage_profile_permissions",
    VIEW_PERMISSIONS: "view_profile_permissions",
  },

  PROJECT: {
    VIEW: "view_project",
    ADD: "add_project",
    CHANGE: "change_project",
    DELETE: "delete_project",
    ASSIGN_CLIENT: "assign_project_client",
    ASSIGN_MANAGER: "assign_project_manager",
    ASSIGN_MEMBERS: "assign_project_members",
    VIEW_DASHBOARD: "view_dashboard",
    VIEW_TEAM: "view_project_team",
    VIEW_CALENDAR: "view_project_calendar",
    VIEW_DOCUMENTS: "view_project_documents",
    VIEW_TIMELINE: "view_project_timeline",
    VIEW_REPORTS: "view_project_reports",
    VIEW_OVERVIEW_REPORT: "view_project_overview_report",
    VIEW_CLIENT_REPORT: "view_client_report",
    VIEW_TEAM_REPORT: "view_team_report",
    VIEW_REPORTS_HOME: "view_reports_home",
  },

  PROJECT_STATUS: {
    VIEW: "view_projectstatus",
    ADD: "add_projectstatus",
    CHANGE: "change_projectstatus",
    DELETE: "delete_projectstatus",
  },

  PROJECT_TYPE: {
    VIEW: "view_projecttype",
    ADD: "add_projecttype",
    CHANGE: "change_projecttype",
    DELETE: "delete_projecttype",
  },

  ROLE: {
    VIEW: "view_rolemodel",
    ADD: "add_rolemodel",
    CHANGE: "change_rolemodel",
    DELETE: "delete_rolemodel",
    MANAGE_PERMISSIONS: "manage_role_permissions",
  },

  SPRINT: {
    VIEW: "view_sprint",
    ADD: "add_sprint",
    CHANGE: "change_sprint",
    DELETE: "delete_sprint",
    START: "start_sprint",
    COMPLETE: "complete_sprint",
    PLAN: "plan_sprint",
    MANAGE_ARTIFACTS: "manage_sprint_artifacts",
    MANAGE_BOARD: "manage_sprint_board",
    MOVE_BOARD: "move_board_artifacts",
    MOVE_DATES: "move_sprint_dates",
  },

  TIME_TRACKING: {
    VIEW: "view_timetracking",
    ADD: "add_timetracking",
    CHANGE: "change_timetracking",
    DELETE: "delete_timetracking",
    VIEW_TIMESHEET: "view_project_timesheet",
  },

  USER: {
    VIEW: "view_user",
    ADD: "add_user",
    CHANGE: "change_user",
    DELETE: "delete_user",
    INVITE: "invite_user",
    REINVITE: "reinvite_user",
    ASSIGN_PROFILE: "assign_user_profile",
    ASSIGN_ROLE: "assign_user_role",
    VIEW_EMPLOYEE: "view_employee",
    ADD_EMPLOYEE: "add_employee",
    VIEW_CLIENT: "view_client",
    ADD_CLIENT: "add_client",
  },
};

/**
 * Build a Set of codenames from `user_permissions`
 * (string[] from userprofile API).
 */
const toCodenameSet = (userPermissions) => {
  const set = new Set();
  for (const entry of userPermissions ?? []) {
    if (typeof entry === "string") set.add(entry);
  }
  return set;
};

/** True when the user has every listed permission (AND). */
export const hasPermission = (userPermissions, required) => {
  if (required == null || required === "") return true;

  const owned = toCodenameSet(userPermissions);
  const needed = Array.isArray(required) ? required : [required];
  if (needed.length === 0) return true;

  return needed.every((code) => owned.has(code));
};

/** True when the user has at least one listed permission (OR). */
export const hasAnyPermission = (userPermissions, required) => {
  if (required == null || required === "") return true;

  const owned = toCodenameSet(userPermissions);
  const needed = Array.isArray(required) ? required : [required];
  if (needed.length === 0) return true;

  return needed.some((code) => owned.has(code));
};
