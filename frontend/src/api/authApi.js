import axiosClient from "./axiosClient";

export const registerUser = async (data) => {
  const response = await axiosClient.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await axiosClient.post("/auth/login", data);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosClient.get("/auth/me");
  return response.data;
};