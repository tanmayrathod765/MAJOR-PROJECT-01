import axiosClient from "./axiosClient";

export const listVideos = async (filters = {}) => {
  const response = await axiosClient.get("/videos", { params: filters });
  return response.data;
};

export const getVideo = async (id) => {
  const response = await axiosClient.get(`/videos/${id}`);
  return response.data;
};

export const createVideo = async (data) => {
  const response = await axiosClient.post("/videos", data);
  return response.data;
};

export const updateVideo = async (id, data) => {
  const response = await axiosClient.put(`/videos/${id}`, data);
  return response.data;
};

export const deleteVideo = async (id) => {
  const response = await axiosClient.delete(`/videos/${id}`);
  return response.data;
};

export const updateVideoProgress = async (id, completed) => {
  const response = await axiosClient.patch(`/videos/${id}/progress`, {
    completed,
  });
  return response.data;
};

export const getMyVideoProgress = async () => {
  const response = await axiosClient.get("/videos/progress/mine");
  return response.data;
};
