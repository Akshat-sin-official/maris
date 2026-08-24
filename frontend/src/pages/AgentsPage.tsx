import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Compass, CloudRain, Activity, MapPin, Fish, ShieldAlert, MessageSquareQuote } from 'lucide-react';
import { CtaSection } from '../components/CtaSection';

export const AgentsPage: React.FC = () => {
  const agents = [
    {
      title: 'Planner Agent',
      icon: Cpu,
      role: 'Orchestrator',
      desc: 'Understands user intent and decomposes complex marine queries into coordinated tasks across domain agents.',
    },
    {
      title: 'Marine Data Agent',
      icon: Compass,
      role: 'Data Discovery',
      desc: 'Discovers, queries, and retrieves relevant marine datasets from satellite, oceanographic, and field sources.',
    },
    {
      title: 'Weather & Hazard Agent',
      icon: CloudRain,
      role: 'Atmospheric Reasoning',
      desc: 'Assesses real-time weather conditions, wind trends, precipitation, and active cyclone/lightning advisories.',
    },
    {
      title: 'Ocean Intelligence Agent',
      icon: Activity,
      role: 'Oceanography',
      desc: 'Reasons over oceanographic parameters including Sea Surface Temperature (SST), wave heights, and currents.',
    },
    {
      title: 'Geospatial Agent',
      icon: MapPin,
      role: 'GIS & Boundaries',
      desc: 'Handles spatial relationships, proximity to protected marine sanctuaries, restricted zones, and geofences.',
    },
    {
      title: 'PFZ Agent',
      icon: Fish,
      role: 'Fisheries Intelligence',
      desc: 'Retrieves Potential Fishing Zone intelligence and evaluates harvesting suitability relative to local risks.',
    },
    {
      title: 'Risk & Reasoning Agent',
      icon: ShieldAlert,
      role: 'Signal Synthesis',
      desc: 'Combines multi-agent output signals into a consolidated, confidence-weighted risk assessment.',
    },
    {
      title: 'Explanation Agent',
      icon: MessageSquareQuote,
      role: 'Explainable AI Output',
      desc: 'Generates evidence-backed explanations detailing why a specific recommendation was produced.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#fa2edf', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AGENTIC AI ARCHITECTURE (SIH 26176 / ORCA)
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 500, color: '#000000', lineHeight: 1.12, marginBottom: '24px', maxWidth: '900px' }}>
            One intelligence engine. Specialized agents.
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: 'rgba(0, 0, 0, 0.75)', maxWidth: '780px', lineHeight: 1.6 }}>
            MARIS uses collaborative AI agents to decompose complex marine questions, select relevant tools, retrieve data, correlate evidence and synthesize recommendations.
          </p>
        </motion.div>
      </section>

      {/* Main Multi-Agent Architecture Flow */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '90px 24px', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '12px' }}>
            COLLABORATIVE AGENTIC ORCHESTRATION
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#000000', marginBottom: '40px' }}>
            Shared Reasoning Workflow
          </h2>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '40px 24px', fontFamily: 'monospace', fontSize: '0.95rem', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
            <div style={{ color: '#000000', fontWeight: 700, marginBottom: '16px' }}>USER QUERY</div>
            <div style={{ color: 'rgba(0,0,0,0.3)', marginBottom: '16px' }}>↓</div>
            <div style={{ backgroundColor: '#000000', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', display: 'inline-block', fontWeight: 700, marginBottom: '24px' }}>
              PLANNER AGENT (Orchestrator)
            </div>

            <div style={{ color: 'rgba(0,0,0,0.3)', marginBottom: '20px' }}>↓ (Parallel Dispatch)</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>Weather Agent</div>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>Ocean Agent</div>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>GIS Agent</div>
              <div style={{ padding: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', color: '#000' }}>PFZ Agent</div>
            </div>

            <div style={{ color: 'rgba(0,0,0,0.3)', marginBottom: '16px' }}>↓</div>
            <div style={{ color: '#000000', fontWeight: 700, marginBottom: '8px' }}>RISK / REASONING AGENT</div>
            <div style={{ color: 'rgba(0,0,0,0.3)', marginBottom: '8px' }}>↓</div>
            <div style={{ color: '#000000', fontWeight: 700, marginBottom: '8px' }}>EXPLANATION AGENT</div>
            <div style={{ color: 'rgba(0,0,0,0.3)', marginBottom: '8px' }}>↓</div>
            <div style={{ backgroundColor: '#000000', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', display: 'inline-block', fontWeight: 700 }}>
              EXPLAINABLE RECOMMENDATION
            </div>
          </div>

          <p style={{ fontSize: '1.1rem', color: 'rgba(0,0,0,0.75)', marginTop: '32px', fontStyle: 'italic', maxWidth: '700px', margin: '32px auto 0' }}>
            "MARIS does not ask one model to do everything. It coordinates specialized capabilities around a shared reasoning workflow."
          </p>
        </div>
      </section>

      {/* Eight Agents Grid */}
      <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '56px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SPECIALIZED AGENT ROLES
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: '#000000', marginTop: '8px' }}>
            The 8 Domain Agents
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
          {agents.map((ag, idx) => {
            const Icon = ag.icon;
            return (
              <motion.div
                key={ag.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                style={{
                  padding: '32px 24px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color="#000000" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase' }}>
                      {ag.role}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#000000', marginBottom: '10px' }}>
                    {ag.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(0, 0, 0, 0.7)', lineHeight: 1.5, margin: 0 }}>
                    {ag.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <CtaSection />
    </div>
  );
};
