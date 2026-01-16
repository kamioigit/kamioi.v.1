/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import { AuthAPI, setToken, getToken, clearToken, ROLES } from "../services/apiService";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const init = async () => {
      const ut = getToken(ROLES.USER);
      if (ut) { try { const { data } = await AuthAPI.meUser(); setUser(data); } catch (e) { console.error('User auth error:', e); } }
      const at = getToken(ROLES.ADMIN);
      if (at) { try { const { data } = await AuthAPI.meAdmin(); setAdmin(data); } catch (e) { console.error('Admin auth error:', e); } }
    };
    init();
  }, []);

  const loginUser = async (email, password) => {
    const { data } = await AuthAPI.loginUser(email, password);
    setToken(ROLES.USER, data.access_token);
    const me = await AuthAPI.meUser();
    setUser(me.data);
  };

  const loginAdmin = async (email, password) => {
    const { data } = await AuthAPI.loginAdmin(email, password);
    setToken(ROLES.ADMIN, data.access_token);
    const me = await AuthAPI.meAdmin();
    setAdmin(me.data);
  };

  const logoutUser = () => { clearToken(ROLES.USER); setUser(null); };
  const logoutAdmin = () => { clearToken(ROLES.ADMIN); setAdmin(null); };

  return (
    <AuthContext.Provider value={{ user, admin, loginUser, loginAdmin, logoutUser, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
