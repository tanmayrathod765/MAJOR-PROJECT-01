import axiosClient from "./axiosClient";

export const getRiskProfile = async (location) =>
  (await axiosClient.post("/ai/risk-profile", location)).data;
