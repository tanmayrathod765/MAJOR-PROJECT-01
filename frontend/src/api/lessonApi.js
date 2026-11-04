import axiosClient from "./axiosClient";

export const listLessons = async (filters = {}) => {
  const response = await axiosClient.get("/lessons", {
    params: filters,
  });

  return response.data;
};

export const getLessonById = async (id) => {
  const response = await axiosClient.get(`/lessons/${id}`);

  return response.data;
};

export const createLesson = async (data) => {
  const response = await axiosClient.post("/lessons", data);

  return response.data;
};

export const saveQuiz = async (lessonId, questions) => {
  const response = await axiosClient.post(
    `/lessons/${lessonId}/quiz`,
    { questions }
  );

  return response.data;
};

export const submitQuizAttempt = async (lessonId, answers) => {
  const response = await axiosClient.post(
    `/lessons/${lessonId}/quiz/submit`,
    { answers }
  );

  return response.data;
};

export const getMyQuizAttempts = async () => {
  const response = await axiosClient.get(
    "/lessons/quiz-attempts/mine"
  );

  return response.data;
};