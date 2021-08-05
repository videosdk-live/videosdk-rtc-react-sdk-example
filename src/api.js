const API_BASE_URL = "http://localhost:9000/";

export const getToken = async () => {
  const res = await fetch(`${API_BASE_URL}get-token`, {
    method: "GET",
  });

  const { token } = await res.json();
  return token;
};

export const createMeeting = async () => {
  const res = await fetch(`${API_BASE_URL}create-meeting`, {
    method: "POST",
  });
  console.log(res);
};

export const validateMeeting = async (token) => {
  const res = await fetch(`${API_BASE_URL}validate-meeting/${token}`, {
    method: "GET",
  });

  const { meetingId } = await res.json();
  return meetingId;
};
