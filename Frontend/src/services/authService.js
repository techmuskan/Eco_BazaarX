const API_URL = "http://localhost:8080/user"; // ✅ correct base URL

// ------------------- SIGNUP -------------------
export const signup = async (userData) => {
  const response = await fetch(`${API_URL}/addUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Signup failed");
  }

  const data = await response.json();

  const { name, email, phone } = data;
  localStorage.setItem("user", JSON.stringify({ name, email, phone }));

  return { name, email, phone };
};

// ------------------- LOGIN -------------------
export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/loginUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Invalid email or password");
  }

  const user = await response.json();

  if (!user) {
    throw new Error("Login failed");
  }

  const { name, email, phone } = user;
  localStorage.setItem("user", JSON.stringify({ name, email, phone }));

  return { name, email, phone };
};

// ------------------- LOGOUT -------------------
export const logout = () => {
  localStorage.removeItem("user");
};

// ------------------- GET STORED USER -------------------
export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ------------------- AUTH CHECK -------------------
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("user"));
};
