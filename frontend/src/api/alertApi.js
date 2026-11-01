import axiosClient from "./axiosClient";

export const getAlerts = async () => (await axiosClient.get("/alerts")).data;
export const getAlertStatus = async () => (await axiosClient.get("/alerts/status")).data;
export const createMockDrillAlert = async (payload) =>
  (await axiosClient.post("/alerts/mock-drill", payload)).data;
export const cancelAlert = async (id) =>
  (await axiosClient.post(`/alerts/${id}/cancel`)).data;
