import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Control Room Operator' | 'Researcher' | 'Coastal Officer' | 'Admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  organization: string;
  activeRegion: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  simulatedMode: boolean;
  login: (email?: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  toggleSimulatedMode: () => void;
}

export const DEFAULT_USER: UserProfile = {
  id: 'usr-2026-001',
  name: 'Dr. Vikram Sarabhai',
  email: 'vikram.sarabhai@maris.gov.in',
  role: 'Control Room Operator',
  avatar: 'VS',
  organization: 'Ministry of Ports, Shipping & Waterways',
  activeRegion: 'Gulf of Mannar & Palk Bay Sector',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('maris_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('maris_jwt_token'));
  const [simulatedMode, setSimulatedMode] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('maris_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('maris_auth_user');
      localStorage.removeItem('maris_jwt_token');
      setToken(null);
    }
  }, [user]);

  const login = async (email?: string, password?: string, role: UserRole = 'Control Room Operator') => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || 'operator@maris.gov.in',
          password: password || 'password123',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Invalid email or password. Please verify your credentials.');
      }

      const data = await res.json();
      const jwtToken = data.data?.accessToken || data.token || data.accessToken || data.data?.token;
      const userObj = data.data?.user || data.user;

      if (jwtToken) {
        localStorage.setItem('maris_jwt_token', jwtToken);
        setToken(jwtToken);
      }

      const roleMapReverse: Record<string, UserRole> = {
        'CONTROL_ROOM': 'Control Room Operator',
        'SUPERVISOR': 'Researcher',
        'FIELD_OFFICER': 'Coastal Officer',
        'ORG_ADMIN': 'Admin',
      };

      const mappedRole = userObj?.role ? (roleMapReverse[userObj.role] || role) : role;

      setUser({
        id: userObj?.id || userObj?._id || 'usr-live',
        name: userObj?.name || 'Cmdr. Rajesh Verma',
        email: userObj?.email || email || 'operator@maris.gov.in',
        role: mappedRole,
        avatar: (userObj?.name || 'Rajesh Verma').split(' ').map((n: string) => n[0]).join(''),
        organization: userObj?.organization || 'Ministry of Ports, Shipping & Waterways',
        activeRegion: 'Gulf of Mannar & Palk Bay Sector',
      });
    } catch (err: any) {
      console.error('Authentication error:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    } else {
      login(undefined, undefined, newRole);
    }
  };

  const toggleSimulatedMode = () => {
    setSimulatedMode(prev => !prev);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        simulatedMode,
        login,
        logout,
        switchRole,
        toggleSimulatedMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
