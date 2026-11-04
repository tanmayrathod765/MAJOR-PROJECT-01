import axiosClient from "./axiosClient";

export const listScenarios = async (filters = {}) => {
  const params = {};

  if (filters.disasterType) {
    params.disasterType = filters.disasterType;
  }

  if (filters.difficulty) {
    params.difficulty = filters.difficulty;
  }

  const response = await axiosClient.get("/drills", {
    params,
  });

  return response.data;
};

export const getScenarioById = async (id) => {
  const response = await axiosClient.get(`/drills/${id}`);
  return response.data;
};

export const createScenario = async (data) => {
  const response = await axiosClient.post("/drills", data);
  return response.data;
};