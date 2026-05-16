import API from "./axiosConfig";

export const signupUser = async (userData) => {
  const { data } = await API.post("/auth/signup", userData);
  return data;
};

export const loginUser = async (userData) => {
  const { data } = await API.post("/auth/login", userData);
  return data;
};

export const getUserProfile = async () => {
  const { data } = await API.get("/auth/profile");
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await API.put("/auth/profile", userData);
  return data;
};