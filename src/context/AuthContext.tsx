"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { getDecodedToken, logoutHelper } from "@/utils/helper";

interface User {
  id?: string;
  username?: string;
  role?: string;
  site?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = () => {
    setIsLoading(true);
    const decoded = getDecodedToken();
    console.log(decoded);
    if (decoded) {
      const userData: User = {
        id: (decoded as any).id,
        username: (decoded as any).username,
        role: (decoded as any).role,
        site: (decoded as any).site,
      };
      setUser(userData);
    } else {
      setUser(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const refreshUser = () => {
    loadUser();
  };

  const logout = () => {
    logoutHelper();
    setUser(null);
    loadUser();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
