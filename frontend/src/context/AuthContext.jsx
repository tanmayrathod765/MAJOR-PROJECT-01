import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getMe,
} from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("disasterready_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("disasterready_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();

        if (response.success) {
          setUser(response.user);
          setToken(storedToken);
        }
      } catch (error) {
        localStorage.removeItem("disasterready_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await loginUser({
      email,
      password,
    });

    if (response.success) {
      localStorage.setItem(
        "disasterready_token",
        response.token
      );

      setToken(response.token);
      setUser(response.user);
    }

    return response;
  };

  const register = async (data) => {
    const response = await registerUser(data);

    if (response.success) {
      localStorage.setItem(
        "disasterready_token",
        response.token
      );

      setToken(response.token);
      setUser(response.user);
    }

    return response;
  };

  const logout = () => {
    localStorage.removeItem("disasterready_token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};