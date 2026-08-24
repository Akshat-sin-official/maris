import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import {
  ArrowRight,
  Lock,
  Mail,
  Shield,
  Activity,
  Radio,
  Key,
  ArrowLeft,
  Waves,
  Compass,
} from 'lucide-react';

export const PortalLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Control Room Operator');
  const [email, setEmail] = useState('operator.verma@maris.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [isHoveredBtn, setIsHoveredBtn] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const emailMap: Record<UserRole, string> = {
      'Control Room Operator': 'operator.verma@maris.gov.in',
      'Researcher': 'meera.swaminathan@maris.gov.in',
      'Coastal Officer': 'inspector.sundaram@maris.gov.in',
      'Admin': 'sysadmin@maris.gov.in',
    };
    setEmail(emailMap[role]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, selectedRole);
    navigate('/portal/dashboard');
  };

  const rolesList: { role: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
    {
      role: 'Control Room Operator',
      label: 'Control Room Operator',
      desc: 'Situation monitoring, alert dispatches, & incident triage',
      icon: Shield,
    },
    {
      role: 'Researcher',
      label: 'Marine Researcher',
      desc: 'Oceanographic data analytics, SST trends, & historical correlation',
      icon: Activity,
    },
    {
      role: 'Coastal Officer',
      label: 'Coastal Field Officer',
      desc: 'Field observation verification, geofence audit, & enforcement',
      icon: Radio,
    },
    {
      role: 'Admin',
      label: 'System Administrator',
      desc: 'User permissions, provider adapters, & region boundary configs',
      icon: Key,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-body)',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          minHeight: '100vh',
        }}
      >
        {/* LEFT COLUMN: Marine Picture / Depiction Showcase */}
        <div
          style={{
            position: 'relative',
            backgroundImage: `url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px',
            boxSizing: 'border-box',
            color: '#ffffff',
            minHeight: '480px',
          }}
        >
          {/* Dark Overlay for Image Readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0, 20, 40, 0.75) 0%, rgba(0, 10, 25, 0.88) 100%)',
              zIndex: 1,
            }}
          />

          {/* Content Layer over Marine Background */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 500,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '9999px',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Public Website</span>
            </Link>
          </div>

          <div style={{ position: 'relative', zIndex: 2, margin: '60px 0 40px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '3rem',
                fontWeight: 500,
                margin: '0 0 16px',
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '0.01em',
              }}
            >
              .maris portal
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'rgba(255, 255, 255, 0.82)',
                lineHeight: 1.5,
                maxWidth: '440px',
                margin: 0,
              }}
            >
              Agentic Marine Ecosystem Reasoning & Operational Control Room for Coastal Authorities, Researchers, and Field Officers.
            </p>

            {/* Marine Stat Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '36px', maxWidth: '440px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase' }}>
                  LIVE SENSOR STREAM
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Waves size={16} color="#38bdf8" />
                  <span>INCOIS & IMD</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase' }}>
                  AI CONFIDENCE RATING
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={16} color="#fa2edf" />
                  <span>98.4% Provenanced</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              paddingTop: '20px',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.55)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>© 2026 MARIS Operational Command</span>
            <span>Gulf of Mannar & Palk Bay Sector</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Light Mode Login Form */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '60px 56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
            {/* Form Header */}
            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.85rem',
                  fontWeight: 500,
                  color: '#000000',
                  margin: '0 0 8px',
                }}
              >
                Operational Sign In
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                Choose your role profile to initialize authenticated control room session
              </p>
            </div>

            {/* Operational Role Selector Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'rgba(0, 0, 0, 0.4)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                SELECT DEMO ROLE PROFILE
              </span>

              {rolesList.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleChange(item.role)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #000000' : '1px solid rgba(0, 0, 0, 0.08)',
                      backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.03)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 2px 10px rgba(0, 0, 0, 0.04)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#000000' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#000000' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'rgba(0, 0, 0, 0.5)' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #000000' : '1.5px solid rgba(0,0,0,0.2)',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.7)',
                    marginBottom: '6px',
                  }}
                >
                  Official Identifier Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(0,0,0,0.4)',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-body)',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.7)',
                    marginBottom: '6px',
                  }}
                >
                  Security Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(0,0,0,0.4)',
                    }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-body)',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                onMouseEnter={() => setIsHoveredBtn(true)}
                onMouseLeave={() => setIsHoveredBtn(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '9999px',
                  border: '1.5px solid #000000',
                  backgroundColor: isHoveredBtn ? '#000000' : '#ffffff',
                  color: isHoveredBtn ? '#ffffff' : '#000000',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHoveredBtn ? 'translateY(-1px)' : 'none',
                  boxShadow: isHoveredBtn ? '0 8px 20px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <span>Enter Operational Control Room</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                color: 'rgba(0,0,0,0.4)',
                marginTop: '32px',
              }}
            >
              Authenticated Access • Protected BY MARIS RBAC & Key Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
