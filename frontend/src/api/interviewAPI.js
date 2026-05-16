import API from "./axiosConfig";

export const createInterview = async (interviewData) => {
  const { data } = await API.post("/interview/create", interviewData);
  return data;
};

export const getMyInterviews = async () => {
  const { data } = await API.get("/interview/my");
  return data;
};

export const getInterviewById = async (id) => {
  const { data } = await API.get(`/interview/${id}`);
  return data;
};

export const submitInterview = async (id, submitData) => {
  const { data } = await API.put(`/interview/${id}/submit`, submitData);
  return data;
};

export const deleteInterview = async (id) => {
  const { data } = await API.delete(`/interview/${id}`);
  return data;
};