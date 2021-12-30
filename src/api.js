const API_BASE_URL = process.env.REACT_APP_SERVER_URL;

export const getToken = async () => {
  // const res = await fetch(`${API_BASE_URL}/get-token`, {
  //   method: "GET",
  // });

  // const { token } = await res.json();
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIxYTgyNjA2YS02MjcyLTQzZWItODZiYy0xYjE1OWM1ZDE2MWIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTYzOTQ4MDc0M30.NevyWx8214tCtUt8Ka7hcdt5BiMiIZjODccmi_0X6dY";
};

export const createMeeting = async ({ token }) => {
  const res = await fetch(`${API_BASE_URL}/create-meeting`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const { meetingId } = await res.json();

  return meetingId;
};

export const validateMeeting = async ({ meetingId, token }) => {
  await fetch(`${API_BASE_URL}/validate-meeting/${meetingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
};
