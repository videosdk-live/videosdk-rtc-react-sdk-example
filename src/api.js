const API_BASE_URL = "https://api.zujonow.com";
const VIDEOSDK_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;
const API_AUTH_URL = process.env.REACT_APP_AUTH_URL;

export const getToken = async () => {
  if(VIDEOSDK_TOKEN !== ""){
      return VIDEOSDK_TOKEN;
  }else if(API_AUTH_URL !== ""){
    const res = await fetch(`${API_AUTH_URL}/get-token`, {
      method: "GET",
    });
    const { token } = await res.json();
    return token;
  }else{
    console.error("Error: ", Error("Please add a token or Auth Server URL"));
  }
};

export const createMeeting = async ({ token }) => {
  const url = `${API_BASE_URL}/api/meetings`;
  const options = {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
  };

  const result = await fetch(url, options)
  .then((response) => response.json()) 
  .catch((error) => console.error("error", error));
  
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
