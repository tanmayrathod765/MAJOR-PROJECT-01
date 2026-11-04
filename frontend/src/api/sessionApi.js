import axiosClient from "./axiosClient";

export const createSession = async (data) => {
  const response = await axiosClient.post("/sessions", data);
  return response.data;
};

export const startSession = async (id) => {
  const response = await axiosClient.patch(`/sessions/${id}/start`);
  return response.data;
};

export const updateMyProgress = async (id, currentNodeId) => {
  const response = await axiosClient.patch(
    `/sessions/${id}/progress`,
    { currentNodeId }
  );
  return response.data;
};

export const completeMyProgress = async (id, attemptId) => {
  const response = await axiosClient.patch(
    `/sessions/${id}/complete`,
    { attemptId }
  );
  return response.data;
};

export const getSessionById = async (id) => {
  const response = await axiosClient.get(`/sessions/${id}`);
  return response.data;
};

export const listMySessions = async () => {
  const response = await axiosClient.get("/sessions");
  return response.data;
};
export const getMySessions = async () => {
  const response = await axiosClient.get("/sessions/mine");
  return response.data;
};