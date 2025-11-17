import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("https://shopeasy-backend-sagk.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          
          // Check if user is blocked
          if (userData.status === 'blocked') {
            console.warn('User is blocked. Logging out...');
            localStorage.removeItem("token");
            setUser(null);
            setIsAuthenticated(false);
            // Redirect to blocked page
            window.location.href = '/support-blocked';
            return;
          }
          
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Check user status every 30 seconds if authenticated
    const interval = setInterval(() => {
      if (token && isAuthenticated) {
        fetchUser();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  // Save token + user on login
  const login = (token, user) => {
    localStorage.setItem("token", token);
    setUser(user);
    setIsAuthenticated(true);
    
    // Trigger cart/wishlist fetch
    window.dispatchEvent(new Event('user-login'));
  };

  // Clear token + user on logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



