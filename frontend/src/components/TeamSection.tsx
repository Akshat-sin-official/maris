import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Smartphone, Monitor, ShieldCheck, UserCheck } from 'lucide-react';

interface CountUpNumberProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  color?: string;
}

const CountUpNumber: React.FC<CountUpNumberProps> = ({
  end,
  prefix = '',
  suffix = '',
  duration = 2000,
  color = '#000000',
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
          let startTime: number | null = null;
          const animate = (now: number) => {
            if (!startTime) startTime = now;
            const progress = Math.min((now - startTime) / duration, 1);
            // Cubic ease-out
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, started]);

  return (
    <div
      ref={ref}
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(4rem, 7.5vw, 6.2rem)',
        fontWeight: 600,
        color,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        minHeight: '1em',
        display: 'inline-flex',
        alignItems: 'baseline',
      }}
    >
      <span>{prefix}</span>
      <span>{count.toLocaleString()}</span>
      <span>{suffix}</span>
    </div>
  );
};

interface IntelligenceRole {
  id: string;
  name: string;
  roleTitle: string;
  badge: string;
  description: string;
  capabilities: string[];
  icon: React.ElementType;
  imageUrl: string;
}

const ROLES: IntelligenceRole[] = [
  {
    id: 'role-1',
    name: 'Marine Field Officer',
    roleTitle: 'AUTHORITY MOBILE CAPTURE',
    badge: 'OFFLINE-FIRST APP',
    description: 'Primary frontline user capturing photos/videos, GPS, and multi-item contraband details even in zero-connectivity offshore waters.',
    capabilities: ['Offline SQLite Storage', 'Camera & GPS Timestamp', 'Species AI Assistance', 'Field Response Status'],
    icon: Smartphone,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'role-2',
    name: 'Control Room Operator',
    roleTitle: 'GIS COMMAND & PRIORITY QUEUE',
    badge: 'CENTRAL CONTROL WEB',
    description: 'Manages incoming intelligence feeds, reviews explainable priority signals, and dispatches cases to field officers.',
    capabilities: ['Explainable Priority Signal', 'GIS Incident Visualization', 'Corridor Pattern Matching', 'Officer Dispatch Tracking'],
    icon: Monitor,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'role-3',
    name: 'Confidential Tipster',
    roleTitle: 'PSEUDONYMOUS PROTECTION',
    badge: 'ANONYMOUS REPORTING',
    description: 'Sensitive source reporting marine crime without personal identity exposure or fear of retaliation.',
    capabilities: ['10-Digit Tipster ID', 'End-to-End JWT Encryption', 'Protected Communication', 'Encrypted Evidence Upload'],
    icon: ShieldCheck,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'role-4',
    name: 'Supervisor & Admin',
    roleTitle: 'OPERATIONAL OVERSIGHT',
    badge: 'AUDIT & GOVERNANCE',
    description: 'Monitors organizational case workloads, verifies analytical decisions, and maintains immutable case timelines.',
    capabilities: ['Role-Based Access Control', 'Case Verification Approval', 'Immutable Timeline Audit', 'Institutional Memory'],
    icon: UserCheck,
    imageUrl: 'https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&w=800&q=80',
  },
];

export const TeamSection: React.FC = () => {
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: statsContainerRef,
    offset: ['start end', 'end start'],
  });

  // Scale up as user scrolls into this section, and scale down as moving to the next section (desktop only)
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.12, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.4, 1, 1, 0.4]);

  return (
    <div style={{ backgroundColor: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      {/* 1. CINEMATIC FULL-SCREEN SCROLL SCALING STATS BANNER (Desktop: 100vh full screen with scale up & scale down on scroll) */}
      <div
        ref={statsContainerRef}
        style={{
          width: '100vw',
          minHeight: isDesktop ? '100vh' : 'auto',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isDesktop ? '100px 48px' : '64px 24px',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        <motion.div
          style={{
            scale: isDesktop ? scale : 1,
            opacity: isDesktop ? opacity : 1,
            width: '100%',
            maxWidth: '1360px',
            margin: '0 auto',
            transformOrigin: 'center center',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: isDesktop ? '36px' : '24px',
              backgroundColor: '#fafafa',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '24px',
              padding: isDesktop ? '64px 48px' : '36px 24px',
              boxShadow: '0 12px 50px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Stat Item 1: 500+ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <CountUpNumber end={500} suffix="+" color="#000000" />
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  color: 'rgba(0, 0, 0, 0.72)',
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                protected coastal checkpoints & marine corridors covered
              </p>
            </div>

            {/* Stat Item 2: 73% */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <CountUpNumber end={73} suffix="%" color="#fa2edf" />
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  color: 'rgba(0, 0, 0, 0.72)',
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                offshore wildlife trafficking occurring in zero-cellular connectivity zones
              </p>
            </div>

            {/* Stat Item 3: 8,400+ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <CountUpNumber end={8400} suffix="+" color="#000000" />
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  color: 'rgba(0, 0, 0, 0.72)',
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                high-priority incidents logged & resolved via offline field capture
              </p>
            </div>

            {/* Stat Item 4: $23B+ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <CountUpNumber end={23} prefix="$" suffix="B+" color="#000000" />
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  color: 'rgba(0, 0, 0, 0.72)',
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                annual global economic loss due to illegal & unreported marine poaching
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. SECTION 02: SYSTEM USERS & ROLE-BASED ACCESS */}
      <section
        id="team"
        style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '100px 24px 120px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              color: '#000000',
              margin: '0 auto 16px',
              maxWidth: '900px',
            }}
          >
            Meet our intelligence roles
          </h2>

          <p style={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            MARIS unites frontline officers, confidential tipsters, control-room operators, and supervisors into one connected, role-protected workflow.
          </p>
        </div>

        {/* 3. ROLES GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
            gap: '32px',
          }}
        >
          {ROLES.map((roleItem, idx) => {
            const Icon = roleItem.icon;
            return (
              <motion.div
                key={roleItem.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {roleItem.badge}
                    </span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    {roleItem.roleTitle}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 500, margin: '0 0 10px', color: '#000000' }}>
                    {roleItem.name}
                  </h3>
                  <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {roleItem.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {roleItem.capabilities.map((cap, capIdx) => (
                    <span
                      key={capIdx}
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#fafafa',
                        border: '1px solid rgba(0,0,0,0.06)',
                        color: 'rgba(0,0,0,0.8)',
                      }}
                    >
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
