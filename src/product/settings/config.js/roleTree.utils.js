// Collect every role id in the tree (used for expand-all / counting).
export const collectRoleIds = (roles = []) => {
  const ids = [];
  const walk = (nodes) => {
    nodes.forEach((n) => {
      ids.push(n.id);
      if (Array.isArray(n.children) && n.children.length) walk(n.children);
    });
  };
  walk(roles);
  return ids;
};
