import axiosClient from "./axiosClient";

export const sendChatMessage = async (payload) => {
  const response = await axiosClient.post("/ai/chat", payload);
  return response.data;
};
