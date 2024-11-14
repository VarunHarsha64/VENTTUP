// UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import {jwtDecode} from 'jwt-decode'
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State to manage loading


  // useEffect(() => {
  //   // On load, check if token exists in localStorage
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     setUserDetails({ token, role: localStorage.getItem("role") });
  //   }
  // }, []);

  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    const decoded = jwtDecode(token);
    console.log(decoded);
    setUserDetails({ token, role, userId:decoded.id });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUserDetails(null);
  };

  return (
    <UserContext.Provider value={{ userDetails, login, logout, isLoading,setIsLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
