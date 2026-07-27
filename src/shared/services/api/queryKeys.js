// Central registry of React Query keys for the whole app.
//
// Organized by domain. Each domain is a key factory: `all` is the broadest key
// (invalidate it to refresh everything in that domain), and the more specific
// helpers build off it so related keys always share a prefix.
//
// Usage:
//   useQuery({ queryKey: queryKeys.projects.list(filters), queryFn })
//   queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
//   queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })

export const queryKeys = {
  dashboard:{
    all:["dashboard"]
  },
  currentUser: {
    all: ["currentUser"],
    detail:(id)=>[...queryKeys.currentUser.all, id],
  },

  employees: {
    all: ["employees"],
    lists: () => [...queryKeys.employees.all, "list"],
    list: (filters) => [...queryKeys.employees.lists(), filters ?? {}],
    details: () => [...queryKeys.employees.all, "detail"],
    detail: (id) => [...queryKeys.employees.details(), id],
  },

  clients: {
    all: ["clients"],
    lists: () => [...queryKeys.clients.all, "list"],
    list: (filters) => [...queryKeys.clients.lists(), filters ?? {}],
    details: () => [...queryKeys.clients.all, "detail"],
    detail: (id) => [...queryKeys.clients.details(), id],
  },

  projects: {
    all: ["projects"],
    lists: () => [...queryKeys.projects.all, "list"],
    list: (filters) => [...queryKeys.projects.lists(), filters ?? {}],
    details: () => [...queryKeys.projects.all, "detail"],
    detail: (id) => [...queryKeys.projects.details(), id],
  },

  reports: {
    all: ["reports"],
    lists: () => [...queryKeys.reports.all, "list"],
    list: (filters) => [...queryKeys.reports.lists(), filters ?? {}],
    details: () => [...queryKeys.reports.all, "detail"],
    detail: (id) => [...queryKeys.reports.details(), id],
    primaryModule: () => [...queryKeys.reports.all, "primary-module"],
    associatedModule: (mainModule) => [
      ...queryKeys.reports.all,
      "associate-module",
      mainModule,
    ],
    configuration: () => [...queryKeys.reports.all, "configuration"],
  },

  artifacts: {
    all: ["artifacts"],
    lists: () => [...queryKeys.artifacts.all, "list"],
    list: (projectId, filters) => [
      ...queryKeys.artifacts.lists(),
      projectId,
      filters ?? {},
    ],
    details: () => [...queryKeys.artifacts.all, "detail"],
    detail: (id) => [...queryKeys.artifacts.details(), id],
    // Children are per-parent + per-type; `type` in the key makes each tab its
    // own cache entry, so switching tabs fetches that tab's children.
    children: (artifactId, type) => [
      ...queryKeys.artifacts.all,
      "children",
      artifactId,
      type,
    ],
  },

  boards: {
    all: (projectId) => ["boards", projectId],
  },

  // Settings-managed reference data (rarely changes; invalidate on settings edit).
  projectTypes: {
    all: ["projectTypes"],
  },

  priorities: {
    all: ["priorities"],
  },

  projectStatus:{
    all:(projectId)=>["projectStatuses", projectId],
  },
  globalStatus:{
    all: ["globalStatuses"],
  },
  profiles:{
    all: ["profiles"],
    detail: (id) => [...queryKeys.profiles.all, "detail", id],
  },
  permissions:{
    all: ["permissions"],
  },
  roles:{
    all:["roles"]
  },

  notifications: {
    all: ["notifications"],
    lists: () => [...queryKeys.notifications.all, "list"],
    list: (filters) => [...queryKeys.notifications.lists(), filters ?? {}],
  },

  users:{
    all:["users"],
    detail:(id)=>[...queryKeys.users.all, id],
  },

  organization: {
    all: ["organization"],
    detail: (id) => [...queryKeys.organization.all, id],
  },

  branches:{
    all:["branches"],
    detail:(id)=>[...queryKeys.branches.all, id],
  },

  auditLogs: {
    all: ["auditLogs"],
    lists: () => [...queryKeys.auditLogs.all, "list"],
    list: (filters) => [...queryKeys.auditLogs.lists(), filters ?? {}],
  },


  team:{
    all:(projectId)=>["team", projectId]
  },


  backlog:{
    all:["backlog"]
  },

  sprints:{
    all:["sprints"]
  }
};
