import axiosClient from "./axiosClient";

export const createInstitution = async (data) => {
  const response = await axiosClient.post("/institutions", data);
  return response.data;
};

export const getMyInstitution = async () => {
  const response = await axiosClient.get("/institutions/mine");
  return response.data;
};

export const getInstitutionById = async (id) => {
  const response = await axiosClient.get(`/institutions/${id}`);
  return response.data;
};

export const updateInstitution = async (id, data) => {
  const response = await axiosClient.put(`/institutions/${id}`, data);
  return response.data;
};