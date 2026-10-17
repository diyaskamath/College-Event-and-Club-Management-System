import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Layers, Info, Sparkles, MapPin, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

const buildingsData = [
  {
    id: 'main-block',
    name: 'Main Block',
    code: 'MB-01',
    category: 'Administration & Academics',
    description: 'The monumental central hub of Amrita Coimbatore campus housing administrative offices, auditoriums, and foundational lecture halls.',
    highlight: 'Central Administrative Secretariat & Main Convocation Hall',
    x: 200,
    y: 180,
    width: 140,
    depth: 110,
    height: 95,
    color: '#00d2ff',
    glowColor: 'rgba(0, 210, 255, 0.7)',
    accentGradient: 'linear-gradient(135deg, #0052d4, #4364f7, #6fb1fc)',
    relatedLink: { label: 'Explore Clubs', url: '/clubs' }
  },
  {
    id: 'central-library',
    name: 'Central Library',
    code: 'LIB-03',
    category: 'Resource & Quiet Study',
    description: 'A multi-tier repository of over 100,000 volumes, international journal archives, and quiet study pods with high-speed digital access.',
    highlight: 'Home to the Campus Book Club sanctuary & digital archives',
    x: 430,
    y: 140,
    width: 120,
    depth: 130,
    height: 120,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    accentGradient: 'linear-gradient(135deg, #059669, #10b981, #34d399)',
    relatedLink: { label: 'The Book Club', url: '/clubs/book-club' }
  },
  {
    id: 'ece-block',
    name: 'ECE Block',
    code: 'ENG-04',
    category: 'Engineering & Research',
    description: 'State-of-the-art semiconductor prototyping labs, microwave engineering testbeds, and signal processing research labs.',
    highlight: 'Department coordinators Dr. Abhishek and Dr. Manikandan preside here',
    x: 180,
    y: 380,
    width: 130,
    depth: 100,
    height: 85,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    accentGradient: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
    relatedLink: { label: 'Explore Events', url: '/events' }
  },
  {
    id: 'canteen',
    name: 'Canteen & Food Court',
    code: 'CAN-02',
    category: 'Student Hub & Dining',
    description: 'The vibrant campus heartbeat serving fresh South Indian delicacies, coffee, and evening snacks surrounded by green patio seating.',
    highlight: 'The ultimate meetup spot for club committees and casual brainstorming',
    x: 390,
    y: 360,
    width: 110,
    depth: 110,
    height: 60,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.7)',
    accentGradient: 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)',
    relatedLink: { label: 'About Campus', url: '/about' }
  },
  {
    id: 'iot-lab',
    name: 'IoT & Robotics Lab',
    code: 'TECH-06',
    category: 'Hardware & Prototyping',
    description: 'High-tech makerspace with 3D printers, sensor testbeds, drone flight cages, and embedded systems racks for student builders.',
    highlight: 'Official headquarters of the IoT & Robotics Guild',
    x: 580,
    y: 320,
    width: 120,
    depth: 110,
    height: 75,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.75)',
    accentGradient: 'linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)',
    relatedLink: { label: 'IoT & Robotics Club', url: '/clubs/iot-club' }
  },
  {
    id: 'ab2-ground',
    name: 'AB2 Ground',
    code: 'ARENA-05',
    category: 'Festival Grounds & Athletics',
    description: 'Vast open grounds framed by the Western Ghats hills, hosting the grand Dussera Cultural Night, sports tournaments, and student festivals.',
    highlight: 'Venue for Dussera Puja (9 AM) & Lunch in Pandhal (1 PM)',
    x: 350,
    y: 530,
    width: 180,
    depth: 130,
    height: 45,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.75)',
    accentGradient: 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)',
    relatedLink: { label: 'Dussera Cultural Night', url: '/events/dussera' }
  }
];

export default function CampusLifePage() {
  const [activeBuilding, setActiveBuilding] = useState(buildingsData[0]);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [viewAngle, setViewAngle] = useState('isometric'); // 'isometric', 'dramatic', 'plan'

  const getTransform = () => {
    switch (viewAngle) {
      case 'dramatic':
        return 'rotateX(70deg) rotateZ(-30deg) scale(0.95)';
      case 'plan':
        return 'rotateX(20deg) rotateZ(0deg) scale(0.9)';
      case 'isometric':
      default:
        return 'rotateX(60deg) rotateZ(-45deg) scale(1)';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#040914',
      backgroundImage: `
        radial-gradient(circle at 50% 10%, rgba(0, 180, 255, 0.12) 0%, transparent 60%),
        radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
        linear-gradient(to bottom, #030712, #071126 50%, #030712 100%)
      `,
      color: '#ffffff',
      fontFamily: 'Lato, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '5rem'
    }}>

      {/* Cyber Grid Background overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 240, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Glowing Radar Scanning Line */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '80%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.6), transparent)',
        boxShadow: '0 0 15px #00ffff',
        pointerEvents: 'none',
        opacity: 0.3,
        zIndex: 1
      }} />

      {/* Top HUD Bar */}
      <header style={{
        position: 'relative',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 3rem',
        borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
        backgroundColor: 'rgba(5, 12, 24, 0.85)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#00ffff',
              textDecoration: 'none',
              fontFamily: 'Cinzel, serif',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '0px',
              backgroundColor: 'rgba(0, 240, 255, 0.08)',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.2)';
              e.currentTarget.style.borderColor = '#00ffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
            }}
          >
            <ArrowLeft size={16} /> Return to Home
          </Link>

          <div>
            <h1 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '1.6rem',
              margin: 0,
              color: '#ffffff',
              letterSpacing: '2px',
              textShadow: '0 0 12px rgba(0, 240, 255, 0.6)'
            }}>
              AMRITA COIMBATORE <span style={{ color: '#00ffff' }}>HOLOGRAPHIC MAP</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1px' }}>
              ISOMETRIC 3D TACTICAL BLUEPRINT // ETTIMADAI SECTOR 5
            </p>
          </div>
        </div>

        {/* Camera Angle Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Compass size={18} color="#00ffff" />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: '0.3rem', fontWeight: 600 }}>CAMERA:</span>
          {[
            { id: 'isometric', label: 'Isometric 3D' },
            { id: 'dramatic', label: 'Deep Angle' },
            { id: 'plan', label: 'Top Grid' }
          ].map(angle => (
            <button
              key={angle.id}
              onClick={() => setViewAngle(angle.id)}
              style={{
                backgroundColor: viewAngle === angle.id ? '#00ffff' : 'rgba(15, 23, 42, 0.6)',
                color: viewAngle === angle.id ? '#040914' : '#cbd5e1',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: viewAngle === angle.id ? '0 0 15px rgba(0, 240, 255, 0.6)' : 'none'
              }}
            >
              {angle.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main 3D Stage Area */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1300px',
        overflow: 'hidden'
      }}>

        {/* 3D Transform Viewport */}
        <div style={{
          position: 'relative',
          width: '900px',
          height: '780px',
          transform: getTransform(),
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.2, 0.9, 0.3, 1)',
          marginTop: '-40px'
        }}>

          {/* Blueprint Ground Surface */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(8, 20, 44, 0.85)',
            border: '2px solid rgba(0, 240, 255, 0.5)',
            boxShadow: `
              0 0 50px rgba(0, 240, 255, 0.3),
              inset 0 0 60px rgba(0, 40, 100, 0.8)
            `,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15) 0%, transparent 70%),
              linear-gradient(rgba(0, 240, 255, 0.18) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.18) 1px, transparent 1px),
              linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 80px 80px, 80px 80px, 20px 20px, 20px 20px',
            borderRadius: '12px'
          }}>
            {/* Campus Compass Marker on ground */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.9rem',
              color: 'rgba(0, 240, 255, 0.7)',
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>▲ N // ETTIMADAI SECTOR CO-01</span>
            </div>

            {/* Subtle Ground Grid Coordinates */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '25px',
              fontSize: '0.75rem',
              color: 'rgba(0, 240, 255, 0.5)',
              fontFamily: 'monospace'
            }}>
              LAT 10.9001° N / LON 76.8998° E / ELEV 412M
            </div>
          </div>

          {/* Render 3D Floating Building Boxes */}
          {buildingsData.map((b) => {
            const isHovered = hoveredBuilding?.id === b.id;
            const isSelected = activeBuilding?.id === b.id;
            const currentLift = isHovered ? 'translateZ(45px)' : isSelected ? 'translateZ(25px)' : 'translateZ(0px)';

            return (
              <div
                key={b.id}
                onClick={() => setActiveBuilding(b)}
                onMouseEnter={() => setHoveredBuilding(b)}
                onMouseLeave={() => setHoveredBuilding(null)}
                style={{
                  position: 'absolute',
                  left: `${b.x}px`,
                  top: `${b.y}px`,
                  width: `${b.width}px`,
                  height: `${b.depth}px`,
                  transform: currentLift,
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  zIndex: isHovered ? 50 : 10
                }}
              >
                {/* 3D Box Floor Shadow */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  filter: 'blur(10px)',
                  transform: 'translateZ(-2px)',
                  opacity: isHovered ? 0.9 : 0.4,
                  transition: 'opacity 0.3s ease'
                }} />

                {/* 3D Building Top Roof Face */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transform: `translateZ(${b.height}px)`,
                  background: isHovered
                    ? b.accentGradient
                    : isSelected
                    ? b.accentGradient
                    : 'rgba(15, 30, 60, 0.9)',
                  border: `2px solid ${b.color}`,
                  boxShadow: isHovered
                    ? `0 0 35px ${b.glowColor}, inset 0 0 20px ${b.glowColor}`
                    : isSelected
                    ? `0 0 25px ${b.glowColor}`
                    : `0 0 10px rgba(0, 240, 255, 0.2)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  boxSizing: 'border-box',
                  color: '#ffffff',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                    opacity: 0.9,
                    letterSpacing: '1px'
                  }}>
                    {b.code}
                  </span>
                  <strong style={{
                    fontSize: '0.95rem',
                    fontFamily: 'Cinzel, serif',
                    marginTop: '2px',
                    textShadow: '0 0 8px rgba(0,0,0,0.8)'
                  }}>
                    {b.name}
                  </strong>
                </div>

                {/* Front Face (Y dimension extrusion) */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: `${b.height}px`,
                  transformOrigin: 'bottom center',
                  transform: 'rotateX(-90deg)',
                  background: `linear-gradient(to top, rgba(5, 12, 28, 0.95), ${b.color}44)`,
                  border: `1px solid ${b.color}88`,
                  boxShadow: isHovered ? `0 0 20px ${b.glowColor}` : 'none',
                  pointerEvents: 'none'
                }} />

                {/* Right Face (X dimension extrusion) */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: `${b.depth}px`,
                  height: `${b.height}px`,
                  transformOrigin: 'top right',
                  transform: 'rotateY(90deg) rotateZ(-90deg)',
                  background: `linear-gradient(to top, rgba(3, 8, 20, 0.95), ${b.color}33)`,
                  border: `1px solid ${b.color}66`,
                  pointerEvents: 'none'
                }} />

                {/* Hover Tooltip Popup above building */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    top: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%) translateZ(120px) rotateZ(45deg) rotateX(-60deg)',
                    backgroundColor: 'rgba(5, 15, 35, 0.95)',
                    border: `2px solid ${b.color}`,
                    boxShadow: `0 0 25px ${b.glowColor}`,
                    padding: '0.6rem 1rem',
                    borderRadius: '0px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 100,
                    textAlign: 'center'
                  }}>
                    <div style={{ color: b.color, fontWeight: 'bold', fontSize: '0.9rem', fontFamily: 'Cinzel, serif' }}>
                      {b.name} ({b.code})
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '2px' }}>
                      {b.category}
                    </div>
                    <div style={{ color: '#fbbf24', fontSize: '0.7rem', marginTop: '3px', fontWeight: 'bold' }}>
                      ⚡ Click for full tactical specs
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Info Sidebar / Holographic HUD Card */}
        <aside style={{
          position: 'absolute',
          right: '2.5rem',
          bottom: '2.5rem',
          width: '380px',
          maxHeight: 'calc(100vh - 160px)',
          backgroundColor: 'rgba(4, 12, 28, 0.92)',
          border: `2px solid ${activeBuilding.color}`,
          boxShadow: `0 0 35px ${activeBuilding.glowColor}, inset 0 0 20px rgba(0, 240, 255, 0.1)`,
          padding: '1.8rem',
          borderRadius: '0px',
          zIndex: 30,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
            <div>
              <span style={{
                color: activeBuilding.color,
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                fontWeight: 'bold',
                display: 'block'
              }}>
                [SECTOR ID: {activeBuilding.code}]
              </span>
              <h2 style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '1.6rem',
                margin: '0.2rem 0 0 0',
                color: '#ffffff'
              }}>
                {activeBuilding.name}
              </h2>
            </div>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: activeBuilding.color,
              boxShadow: `0 0 12px ${activeBuilding.color}`
            }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <MapPin size={16} />
            <span>{activeBuilding.category}</span>
          </div>

          <p style={{
            fontSize: '0.95rem',
            color: '#e2e8f0',
            lineHeight: '1.6',
            margin: 0
          }}>
            {activeBuilding.description}
          </p>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderLeft: `3px solid ${activeBuilding.color}`,
            padding: '0.8rem 1rem',
            marginTop: '0.2rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '4px' }}>
              Special Campus Intelligence:
            </div>
            <div style={{ fontSize: '0.9rem', color: '#fef08a', fontWeight: '600' }}>
              {activeBuilding.highlight}
            </div>
          </div>

          {activeBuilding.relatedLink && (
            <Link
              to={activeBuilding.relatedLink.url}
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                backgroundColor: activeBuilding.color,
                color: '#040914',
                padding: '0.8rem 1.2rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: `0 0 20px ${activeBuilding.glowColor}`,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{activeBuilding.relatedLink.label}</span>
              <ExternalLink size={16} />
            </Link>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '0.6rem',
            fontFamily: 'monospace'
          }}>
            <span>TRANSLATE_Z: HOVER_LIFT ACTIVE</span>
            <span>SYSTEM READY</span>
          </div>
        </aside>

        {/* Bottom Legend Pill Bar */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2.5rem',
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          maxWidth: '560px',
          zIndex: 20
        }}>
          {buildingsData.map(b => (
            <button
              key={b.id}
              onClick={() => setActiveBuilding(b)}
              style={{
                backgroundColor: activeBuilding.id === b.id ? 'rgba(0, 240, 255, 0.25)' : 'rgba(5, 15, 32, 0.75)',
                color: activeBuilding.id === b.id ? '#00ffff' : '#94a3b8',
                border: `1px solid ${activeBuilding.id === b.id ? b.color : 'rgba(255, 255, 255, 0.15)'}`,
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                fontFamily: 'Lato, sans-serif',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: b.color }} />
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
