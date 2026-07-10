// Decouples the API layer from React: the axios interceptor emits a DOM event
// instead of importing the router/context. AuthProvider subscribes and performs
// the actual logout (clear session + redirect).
export const AUTH_LOGOUT_EVENT = "auth:logout";

export const emitAuthLogout = () => {
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
};

export const onAuthLogout = (handler) => {
  window.addEventListener(AUTH_LOGOUT_EVENT, handler);
  return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
};
