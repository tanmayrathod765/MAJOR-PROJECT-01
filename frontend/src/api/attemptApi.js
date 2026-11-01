import axiosClient from "./axiosClient";

export const submitAttempt = async (data) => {
  const response = await axiosClient.post("/attempts", data);
  return response.data;
};

export const addDiaryEntry = async (
  attemptId,
  disasterDiaryEntry
) => {
  const response = await axiosClient.patch(
    `/attempts/${attemptId}/diary`,
    {
      disasterDiaryEntry,
    }
  );

  return response.data;
};

export const getMyAttempts = async () => {
  const response = await axiosClient.get("/attempts/mine");
  return response.data;
};

export const getStudentAttempts = async (studentId) => {
  const response = await axiosClient.get(
    `/attempts/student/${studentId}`
  );

  return response.data;
};

export const getStudentsForReview = async () => {
  const response = await axiosClient.get("/attempts/students");
  return response.data;
};