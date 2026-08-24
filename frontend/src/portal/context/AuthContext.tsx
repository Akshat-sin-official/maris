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
  isAuthenticated: boolean;
  simulatedMode: boolean;
  login: (email?: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  toggleSimulatedMode: () => void;
}

const DEFAULT_USER: UserProfile = {
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
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [simulatedMode, setSimulatedMode] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('maris_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('maris_auth_user');
      localStorage.removeItem('maris_jwt_token');
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

      if (res.ok) {
        const data = await res.json();
        const jwtToken = data.token || data.data?.token;
        const userObj = data.user || data.data?.user;

        if (jwtToken) {
          localStorage.setItem('maris_jwt_token', jwtToken);
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
        return;
      }
    } catch (err) {
      console.warn('Live API login check failed, using local profile fallback', err);
    }

    // Simulated/mock fallback
    const nameMap: Record<UserRole, string> = {
      'Control Room Operator': 'Cmdr. Rajesh Verma',
      'Researcher': 'Dr. Meera Swaminathan',
      'Coastal Officer': 'Inspector K. Sundaram',
      'Admin': 'Admin System Director',
    };

    const newUser: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 7),
      name: nameMap[role] || 'MARIS Operator',
      email: email || `${role.toLowerCase().replace(/\s+/g, '.')}@maris.gov.in`,
      role: role,
      avatar: (nameMap[role] || 'MO').split(' ').map(n => n[0]).join(''),
      organization: 'MARIS Operational Command Center',
      activeRegion: 'Coromandel & Gulf of Mannar Zone',
    };

    setUser(newUser);
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
