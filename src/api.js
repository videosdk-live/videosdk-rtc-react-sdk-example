const API_BASE_URL = process.env.REACT_APP_SERVER_URL;
const VIDEOSDK_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;

export const getToken =  () => {
  return VIDEOSDK_TOKEN;
};

export const createMeeting = async ({ token }) => {
  const url = `${API_BASE_URL}/api/meetings`;
  const options = {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
  };

  const result = await fetch(url, options)
  .then((response) => response.json()) 
  return result.meetingId;
};

export const validateMeeting = async ({ meetingId, token }) => {

  const url = `${process.env.API_BASE_URL}/api/meetings/${meetingId}`;

  const options = {
    method: "POST",
    headers: { Authorization: token },
  };

  const result = await fetch(url, options)
    .then((response) => response.json()) //result will have meeting id
};
