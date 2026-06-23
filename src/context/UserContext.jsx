import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[UserContext] fetchUser called but no token found in localStorage.');
      return;
    }
    try {
      console.log('[UserContext] fetchUser fetching user details from database...');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[UserContext] fetchUser success. Loaded user details:', data);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setUserRole(data.role);
        localStorage.setItem('userRole', data.role);
      } else {
        console.warn('[UserContext] fetchUser failed with status:', res.status);
      }
    } catch (err) {
      console.error('[UserContext] Error fetching user:', err);
    }
  };

  const updateUser = async (profileData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[UserContext] updateUser called but no token found.');
      return;
    }
    try {
      console.log('[UserContext] updateUser starting. Payload:', profileData);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[UserContext] updateUser success. Returned data:', data);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
      }
      console.warn('[UserContext] updateUser failed with status:', res.status);
      throw new Error('Failed to update profile');
    } catch (err) {
      console.error('[UserContext] Error updating user:', err);
      throw err;
    }
  };

  const loginUser = (userData, role, token) => {
    console.log('[UserContext] loginUser called. userData:', userData, 'role:', role);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', role);
    setUser(userData);
    setUserRole(role);
    
    // Fetch latest user details from DB
    console.log('[UserContext] Fetching latest user details immediately after login...');
    fetchUser();
  };

  const logoutUser = () => {
    console.log('[UserContext] logging out user');
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, userRole, fetchUser, updateUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
