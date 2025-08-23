export const checkAuth = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  const currentUser = JSON.parse(localStorage.getItem("user"));
  return currentUser ? currentUser : false;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};
