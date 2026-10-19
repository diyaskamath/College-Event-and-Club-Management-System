import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  MapPin,
  Search,
  Navigation,
  Phone,
  BookOpen,
  Info,
  ShieldCheck,
  Zap,
  Coffee,
  HeartPulse,
  ShoppingBag,
  Home,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Maximize2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const buildingsData = [
  // 1. Academic Blocks
  {
    id: 'ab-1',
    code: 'AB-1',
    name: 'Academic Block 1',
    category: 'academic',
    branches: 'Aerospace, Mech',
    incharge: 'Dr. K. Radhakrishnan',
    phone: '+91 94421 88301',
    description: 'Houses Department of Mechanical Engineering, Aerospace Propulsion labs, and central design studios.',
    x: 180,
    y: 130,
    width: 125,
    depth: 95,
    height: 85,
    color: '#00d2ff',
    glowColor: 'rgba(0, 210, 255, 0.8)',
    accentGradient: 'linear-gradient(135deg, #0284c7, #00d2ff)'
  },
  {
    id: 'ab-2',
    code: 'AB-2',
    name: 'Academic Block 2',
    category: 'academic',
    branches: 'ECE, CCE, EEE',
    incharge: 'Dr. S. Abhishek',
    phone: '+91 94421 88302',
    description: 'Electronics & Communication hub, VLSI design suites, Microwave labs, and Electrical engineering research wings.',
    x: 350,
    y: 130,
    width: 135,
    depth: 100,
    height: 95,
    color: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.85)',
    accentGradient: 'linear-gradient(135deg, #b45309, #d4af37, #fef08a)'
  },
  {
    id: 'ab-3',
    code: 'AB-3',
    name: 'Academic Block 3',
    category: 'academic',
    branches: 'CSE & Sub-branches',
    incharge: 'Dr. P. Manikandan',
    phone: '+91 94421 88303',
    description: 'Computer Science & Engineering headquarters, Cloud datacenter racks, Cyber Security labs, and High Performance Computing clusters.',
    x: 530,
    y: 130,
    width: 135,
    depth: 105,
    height: 105,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.85)',
    accentGradient: 'linear-gradient(135deg, #7e22ce, #a855f7, #e9d5ff)'
  },
  {
    id: 'ab-4',
    code: 'AB-4',
    name: 'Academic Block 4',
    category: 'academic',
    branches: 'AI',
    incharge: 'Dr. R. Ananth',
    phone: '+91 94421 88304',
    description: 'Center for Computational Engineering and Artificial Intelligence, Neural Network simulation labs, and Robotics testbeds.',
    x: 710,
    y: 130,
    width: 125,
    depth: 95,
    height: 90,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.85)',
    accentGradient: 'linear-gradient(135deg, #0e7490, #06b6d4, #67e8f9)'
  },

  // 2. Girls Hostels (PINK THEME)
  {
    id: 'mythreyi',
    code: 'GH-01',
    name: 'Mythreyi Hostel',
    category: 'girls_hostel',
    description: 'Residence hall for senior undergraduate and postgraduate women students with inner courtyard gardens.',
    x: 100,
    y: 310,
    width: 95,
    depth: 80,
    height: 70,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.85)',
    accentGradient: 'linear-gradient(135deg, #db2777, #ec4899, #fbcfe8)'
  },
  {
    id: 'savitri',
    code: 'GH-02',
    name: 'Savitri Hostel',
    category: 'girls_hostel',
    description: 'Multi-story women residence complex with high-speed Wi-Fi, study lounges, and solar hot water systems.',
    x: 215,
    y: 310,
    width: 95,
    depth: 80,
    height: 75,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.85)',
    accentGradient: 'linear-gradient(135deg, #be185d, #f43f5e, #fbcfe8)'
  },
  {
    id: 'gargi',
    code: 'GH-03',
    name: 'Gargi Hostel',
    category: 'girls_hostel',
    description: 'Peaceful residential block framed by trees, housing first-year women scholars with 24/7 security warden desks.',
    x: 100,
    y: 420,
    width: 95,
    depth: 80,
    height: 70,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.85)',
    accentGradient: 'linear-gradient(135deg, #db2777, #ec4899, #fbcfe8)'
  },
  {
    id: 'adithi',
    code: 'GH-04',
    name: 'Adithi Hostel',
    category: 'girls_hostel',
    description: 'Modern women hall of residence with indoor badminton court, gym facilities, and reading rooms.',
    x: 215,
    y: 420,
    width: 95,
    depth: 80,
    height: 75,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.85)',
    accentGradient: 'linear-gradient(135deg, #be185d, #ec4899, #fbcfe8)'
  },

  // 3. Boys Hostels (BLUE THEME)
  {
    id: 'agastya',
    code: 'BH-01',
    name: 'Agastya Hostel',
    category: 'boys_hostel',
    description: 'Spacious men residence block adjacent to the main athletic track, featuring recreational commons.',
    x: 720,
    y: 310,
    width: 95,
    depth: 80,
    height: 75,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.85)',
    accentGradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #93c5fd)'
  },
  {
    id: 'brigu',
    code: 'BH-02',
    name: 'Brigu Hostel',
    category: 'boys_hostel',
    description: 'Residential quarters for second and third year men scholars with quiet study halls and indoor table tennis.',
    x: 835,
    y: 310,
    width: 95,
    depth: 80,
    height: 70,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.85)',
    accentGradient: 'linear-gradient(135deg, #2563eb, #60a5fa, #bfdbfe)'
  },
  {
    id: 'vasista',
    code: 'BH-03',
    name: 'Vasista Hostel',
    category: 'boys_hostel',
    description: 'Multi-wing residential facility overlooking the mountain range with landscaped garden paths.',
    x: 720,
    y: 420,
    width: 95,
    depth: 80,
    height: 75,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.85)',
    accentGradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #93c5fd)'
  },
  {
    id: 'kasyapa',
    code: 'BH-04',
    name: 'Kasyapa Hostel',
    category: 'boys_hostel',
    description: 'Senior men hostel block with specialized thesis study rooms and solar backup power.',
    x: 835,
    y: 420,
    width: 95,
    depth: 80,
    height: 70,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.85)',
    accentGradient: 'linear-gradient(135deg, #2563eb, #60a5fa, #bfdbfe)'
  },

  // 4. Canteens
  {
    id: 'canteen-mba',
    code: 'CAN-01',
    name: 'MBA Canteen',
    category: 'canteen',
    description: 'Specialty cafe and breakfast hub near the management block serving filter coffee, pastries, and quick lunches.',
    x: 360,
    y: 290,
    width: 80,
    depth: 70,
    height: 50,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.85)',
    accentGradient: 'linear-gradient(135deg, #d97706, #f59e0b, #fef08a)'
  },
  {
    id: 'canteen-main',
    code: 'CAN-02',
    name: 'MAIN Canteen',
    category: 'canteen',
    description: 'Vibrant two-story campus food court offering full meals, dosas, fresh juices, and outdoor patio seating.',
    x: 460,
    y: 285,
    width: 105,
    depth: 85,
    height: 60,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.85)',
    accentGradient: 'linear-gradient(135deg, #b45309, #f59e0b, #fed7aa)'
  },
  {
    id: 'canteen-it',
    code: 'CAN-03',
    name: 'IT Canteen',
    category: 'canteen',
    description: 'Quick-service snack stall and coffee junction favored by computer engineering and research scholars.',
    x: 585,
    y: 290,
    width: 80,
    depth: 70,
    height: 48,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.85)',
    accentGradient: 'linear-gradient(135deg, #d97706, #f59e0b, #fef08a)'
  },

  // 5. Others (ATMs, Clinic, General Store, Grounds, Pandhal, Conference Hall, Main Gate)
  {
    id: 'atm-kiosk',
    code: 'ATM-01',
    name: 'ATMs (State Bank & Axis)',
    category: 'amenity',
    description: '24/7 automated teller machines with cash deposit and passbook printing services.',
    x: 360,
    y: 390,
    width: 65,
    depth: 55,
    height: 40,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.85)',
    accentGradient: 'linear-gradient(135deg, #059669, #10b981, #a7f3d0)'
  },
  {
    id: 'clinic',
    code: 'MED-01',
    name: 'Campus Clinic & Health Centre',
    category: 'amenity',
    description: 'Equipped medical infirmary with resident medical officers, emergency beds, and round-the-clock ambulance service.',
    x: 445,
    y: 390,
    width: 80,
    depth: 65,
    height: 52,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.85)',
    accentGradient: 'linear-gradient(135deg, #dc2626, #ef4444, #fecaca)'
  },
  {
    id: 'general-store',
    code: 'STR-01',
    name: 'General Store & Stationery',
    category: 'amenity',
    description: 'Essential student provisions, textbook copies, project blueprint printing, and toiletry supplies.',
    x: 545,
    y: 390,
    width: 75,
    depth: 60,
    height: 45,
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.85)',
    accentGradient: 'linear-gradient(135deg, #6d28d9, #8b5cf6, #ddd6fe)'
  },
  {
    id: 'basketball-ground',
    code: 'BB-01',
    name: 'Basketball Ground',
    category: 'sports',
    description: 'Floodlit regulation synthetic courts for inter-batch tournaments and varsity team coaching.',
    x: 110,
    y: 560,
    width: 140,
    depth: 95,
    height: 25,
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.85)',
    accentGradient: 'linear-gradient(135deg, #ea580c, #f97316, #ffedd5)'
  },
  {
    id: 'main-ground',
    code: 'MGR-01',
    name: 'Main Sports Ground',
    category: 'sports',
    description: 'Expansive natural turf arena for cricket championships, athletic meets, and major cultural festivals.',
    x: 280,
    y: 520,
    width: 210,
    depth: 140,
    height: 25,
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.85)',
    accentGradient: 'linear-gradient(135deg, #15803d, #22c55e, #bbf7d0)'
  },
  {
    id: 'pandhal',
    code: 'PDL-01',
    name: 'Pandhal (Event Pavilion)',
    category: 'amenity',
    description: 'Grand thatched pavilion for Dussera feast lunches, festival pujas, and open-air convocation celebrations.',
    x: 515,
    y: 520,
    width: 150,
    depth: 115,
    height: 48,
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.85)',
    accentGradient: 'linear-gradient(135deg, #ca8a04, #eab308, #fef08a)'
  },
  {
    id: 'conference-hall',
    code: 'CONF-01',
    name: 'Central Conference Hall',
    category: 'academic',
    description: 'Acoustically tuned auditorium hosting academic colloquiums, corporate symposiums, and cultural guest lectures.',
    x: 690,
    y: 540,
    width: 120,
    depth: 95,
    height: 65,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.85)',
    accentGradient: 'linear-gradient(135deg, #0891b2, #06b6d4, #a5f3fc)'
  },
  {
    id: 'main-gate',
    code: 'GATE-01',
    name: 'Main Campus Gate',
    category: 'amenity',
    description: 'The monumental Amrita archway entrance welcoming scholars, faculty buses, and campus visitors.',
    x: 420,
    y: 720,
    width: 140,
    depth: 55,
    height: 45,
    color: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.9)',
    accentGradient: 'linear-gradient(135deg, #b45309, #d4af37, #fef08a)'
  }
];

export default function CampusLifePage() {
  const [activeBuilding, setActiveBuilding] = useState(buildingsData[1]); // Default to AB-2
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [sourceId, setSourceId] = useState('main-gate');
  const [destinationId, setDestinationId] = useState('ab-2');
  const [pathfindingActive, setPathfindingActive] = useState(true);

  // 3D Camera Controls State
  const [rotX, setRotX] = useState(60); // Tilt angle (15° to 85°)
  const [rotZ, setRotZ] = useState(-45); // Azimuth rotation
  const [zoom, setZoom] = useState(1.0); // Zoom scale factor (0.5 to 2.2)
  const [pan, setPan] = useState({ x: 0, y: 0 }); // Viewport pan offset
  const [isDragging, setIsDragging] = useState(false);
  const [activePreset, setActivePreset] = useState('isometric');
  const [hudExpanded, setHudExpanded] = useState(true);

  const stageRef = useRef(null);
  const dragRef = useRef({
    isDown: false,
    mode: 'rotate', // 'rotate' | 'pan' | 'touch-pinch-pan'
    startX: 0,
    startY: 0,
    startRotX: 60,
    startRotZ: -45,
    startPanX: 0,
    startPanY: 0,
    moved: false,
    initialTouchDistance: 0,
    startZoom: 1.0
  });

  const destinationBuilding = buildingsData.find((b) => b.id === destinationId);
  const sourceBuilding = buildingsData.find((b) => b.id === sourceId);

  // Clamp helper
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  // Camera Action Handlers
  const rotateLeft = () => {
    setActivePreset(null);
    setRotZ((z) => Math.round(z - 25));
  };
  const rotateRight = () => {
    setActivePreset(null);
    setRotZ((z) => Math.round(z + 25));
  };
  const tiltUp = () => {
    setActivePreset(null);
    setRotX((x) => clamp(Math.round(x - 10), 15, 85));
  };
  const tiltDown = () => {
    setActivePreset(null);
    setRotX((x) => clamp(Math.round(x + 10), 15, 85));
  };
  const handleZoomIn = () => {
    setZoom((z) => clamp(Number((z + 0.15).toFixed(2)), 0.5, 2.2));
  };
  const handleZoomOut = () => {
    setZoom((z) => clamp(Number((z - 0.15).toFixed(2)), 0.5, 2.2));
  };
  const handleResetCamera = () => {
    setRotX(60);
    setRotZ(-45);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setActivePreset('isometric');
  };

  const applyPreset = (presetName) => {
    setActivePreset(presetName);
    if (presetName === 'isometric') {
      setRotX(60);
      setRotZ(-45);
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
    } else if (presetName === 'top') {
      setRotX(20);
      setRotZ(0);
      setZoom(0.95);
      setPan({ x: 0, y: 0 });
    } else if (presetName === 'front') {
      setRotX(50);
      setRotZ(-90);
      setZoom(1.05);
      setPan({ x: 0, y: 0 });
    } else if (presetName === 'east') {
      setRotX(60);
      setRotZ(45);
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
    }
  };

  // Window listeners for smooth mouse dragging across the entire screen
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragRef.current.isDown) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.hypot(dx, dy) > 4) {
        dragRef.current.moved = true;
        setActivePreset(null);
      }

      if (dragRef.current.mode === 'rotate') {
        const nextZ = dragRef.current.startRotZ + dx * 0.45;
        const nextX = clamp(dragRef.current.startRotX - dy * 0.35, 15, 85);
        setRotZ(Number(nextZ.toFixed(1)));
        setRotX(Number(nextX.toFixed(1)));
      } else if (dragRef.current.mode === 'pan') {
        setPan({
          x: Math.round(dragRef.current.startPanX + dx),
          y: Math.round(dragRef.current.startPanY + dy)
        });
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current.isDown) {
        dragRef.current.isDown = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Stage wheel listener with passive: false to allow preventDefault for smooth zooming
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((prev) => clamp(Number((prev + delta).toFixed(2)), 0.5, 2.2));
    };

    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      stage.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('[data-no-drag="true"]')) return;

    const isPan = e.button === 2 || e.button === 1 || e.shiftKey;
    dragRef.current = {
      ...dragRef.current,
      isDown: true,
      mode: isPan ? 'pan' : 'rotate',
      startX: e.clientX,
      startY: e.clientY,
      startRotX: rotX,
      startRotZ: rotZ,
      startPanX: pan.x,
      startPanY: pan.y,
      moved: false
    };
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('[data-no-drag="true"]')) return;

    if (e.touches.length === 1) {
      const t = e.touches[0];
      dragRef.current = {
        ...dragRef.current,
        isDown: true,
        mode: 'rotate',
        startX: t.clientX,
        startY: t.clientY,
        startRotX: rotX,
        startRotZ: rotZ,
        startPanX: pan.x,
        startPanY: pan.y,
        moved: false
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      dragRef.current = {
        ...dragRef.current,
        isDown: true,
        mode: 'touch-pinch-pan',
        startX: midX,
        startY: midY,
        startPanX: pan.x,
        startPanY: pan.y,
        initialTouchDistance: dist,
        startZoom: zoom,
        moved: false
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!dragRef.current.isDown) return;
    if (e.touches.length === 1 && dragRef.current.mode === 'rotate') {
      const t = e.touches[0];
      const dx = t.clientX - dragRef.current.startX;
      const dy = t.clientY - dragRef.current.startY;
      if (Math.hypot(dx, dy) > 4) {
        dragRef.current.moved = true;
        setActivePreset(null);
      }
      const nextZ = dragRef.current.startRotZ + dx * 0.45;
      const nextX = clamp(dragRef.current.startRotX - dy * 0.35, 15, 85);
      setRotZ(Number(nextZ.toFixed(1)));
      setRotX(Number(nextX.toFixed(1)));
    } else if (e.touches.length === 2 && dragRef.current.mode === 'touch-pinch-pan') {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      dragRef.current.moved = true;
      setActivePreset(null);

      if (dragRef.current.initialTouchDistance > 0) {
        const scale = dist / dragRef.current.initialTouchDistance;
        const nextZoom = clamp(Number((dragRef.current.startZoom * scale).toFixed(2)), 0.5, 2.2);
        setZoom(nextZoom);
      }

      const dx = midX - dragRef.current.startX;
      const dy = midY - dragRef.current.startY;
      setPan({
        x: Math.round(dragRef.current.startPanX + dx),
        y: Math.round(dragRef.current.startPanY + dy)
      });
    }
  };

  const handleTouchEnd = () => {
    dragRef.current.isDown = false;
    setIsDragging(false);
  };

  const handleSearchRoute = (e) => {
    if (e) e.preventDefault();
    if (destinationBuilding) {
      setActiveBuilding(destinationBuilding);
      setPathfindingActive(true);
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
      paddingTop: '5.5rem'
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

      {/* =========================================================================
          TOP HUD & ROUTE SEARCH BAR
         ========================================================================= */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '0 2rem 1.5rem 2rem'
      }}>
        
        {/* Navigation back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#d4af37',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontFamily: 'Cinzel, serif',
              letterSpacing: '1px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>

          <div style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: '#00ffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#00ffff', borderRadius: '50%', boxShadow: '0 0 8px #00ffff' }} />
            <span>3D ISOMETRIC ENGINE ACTIVE &bull; 23 SCATTERED LOCATIONS</span>
          </div>
        </div>

        {/* Dual Search Bar: "Where are you?" -> "Where do you want to go?" */}
        <form
          onSubmit={handleSearchRoute}
          style={{
            backgroundColor: 'rgba(8, 20, 44, 0.95)',
            border: '2px solid rgba(0, 240, 255, 0.5)',
            borderRadius: '4px',
            padding: '1.2rem 1.5rem',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.25)',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.2fr auto',
            gap: '1.2rem',
            alignItems: 'center'
          }}
        >
          {/* Dropdown 1: Origin */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontFamily: 'Cinzel, serif', color: '#cbd5e1', marginBottom: '0.4rem', letterSpacing: '1px' }}>
              <MapPin size={14} color="#10b981" />
              <span>WHERE ARE YOU? (ORIGIN)</span>
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#050c1e',
                border: '1.5px solid rgba(16, 185, 129, 0.5)',
                color: '#ffffff',
                padding: '0.6rem 0.8rem',
                fontSize: '0.9rem',
                borderRadius: '2px',
                outline: 'none'
              }}
            >
              {buildingsData.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Destination */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontFamily: 'Cinzel, serif', color: '#cbd5e1', marginBottom: '0.4rem', letterSpacing: '1px' }}>
              <Navigation size={14} color="#00ffff" />
              <span>WHERE DO YOU WANT TO GO? (DESTINATION)</span>
            </label>
            <select
              value={destinationId}
              onChange={(e) => {
                setDestinationId(e.target.value);
                const found = buildingsData.find(b => b.id === e.target.value);
                if (found) setActiveBuilding(found);
              }}
              style={{
                width: '100%',
                backgroundColor: '#050c1e',
                border: '1.5px solid #00ffff',
                color: '#ffffff',
                padding: '0.6rem 0.8rem',
                fontSize: '0.9rem',
                borderRadius: '2px',
                outline: 'none',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
              }}
            >
              <optgroup label="Academic Blocks">
                <option value="ab-1">AB1 (Aerospace, Mech)</option>
                <option value="ab-2">AB2 (ECE, CCE, EEE)</option>
                <option value="ab-3">AB3 (CSE & Sub-branches)</option>
                <option value="ab-4">AB4 (AI & Data Science)</option>
              </optgroup>
              <optgroup label="Girls Hostels (Pink)">
                <option value="mythreyi">Mythreyi Hostel</option>
                <option value="savitri">Savitri Hostel</option>
                <option value="gargi">Gargi Hostel</option>
                <option value="adithi">Adithi Hostel</option>
              </optgroup>
              <optgroup label="Boys Hostels (Blue)">
                <option value="agastya">Agastya Hostel</option>
                <option value="brigu">Brigu Hostel</option>
                <option value="vasista">Vasista Hostel</option>
                <option value="kasyapa">Kasyapa Hostel</option>
              </optgroup>
              <optgroup label="Canteens & Dining">
                <option value="canteen-mba">MBA Canteen</option>
                <option value="canteen-main">MAIN Canteen</option>
                <option value="canteen-it">IT Canteen</option>
              </optgroup>
              <optgroup label="Campus Amenities & Grounds">
                <option value="atm-kiosk">ATMs (State Bank & Axis)</option>
                <option value="clinic">Clinic & Health Centre</option>
                <option value="general-store">General Store & Stationery</option>
                <option value="basketball-ground">Basketball Ground</option>
                <option value="main-ground">Main Ground</option>
                <option value="pandhal">Pandhal (Event Pavilion)</option>
                <option value="conference-hall">Conference Hall</option>
                <option value="main-gate">Main Campus Gate</option>
              </optgroup>
            </select>
          </div>

          {/* Search Button */}
          <div style={{ paddingTop: '1.2rem' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#00ffff',
                color: '#05070e',
                border: 'none',
                padding: '0.65rem 1.4rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#00ffff';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.5)';
              }}
            >
              <Zap size={16} />
              <span>PULSE DESTINATION</span>
            </button>
          </div>
        </form>

        {/* Route Guidance Bar */}
        {destinationBuilding && (
          <div style={{
            marginTop: '0.8rem',
            backgroundColor: 'rgba(0, 240, 255, 0.08)',
            borderLeft: '4px solid #00ffff',
            padding: '0.6rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            color: '#cbd5e1'
          }}>
            <div>
              <span style={{ color: '#00ffff', fontWeight: 700 }}>GUIDED PATH: </span>
              From <strong style={{ color: '#10b981' }}>{sourceBuilding?.name || 'Main Gate'}</strong> to{' '}
              <strong style={{ color: '#00ffff' }}>{destinationBuilding.name}</strong> &mdash; Follow central walkway spine past Canteen plaza.
            </div>
            <div style={{ color: '#d4af37' }}>
              Est. Walking Distance: ~280m (3 mins)
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          MAIN 3D ISOMETRIC STAGE & BLUEPRINT GRID
         ========================================================================= */}
      <div
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          if (dragRef.current.moved) e.preventDefault();
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 220px)',
          minHeight: '620px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1400px',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
      >

        {/* 3D Transform Viewport with dynamic interactive camera */}
        <div style={{
          position: 'relative',
          width: '1020px',
          height: '840px',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1)',
          marginTop: '-40px'
        }}>

          {/* Blueprint Ground Surface */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(8, 20, 44, 0.88)',
            border: '2px solid rgba(0, 240, 255, 0.6)',
            boxShadow: `
              0 0 60px rgba(0, 240, 255, 0.3),
              inset 0 0 70px rgba(0, 40, 100, 0.85)
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
              top: '25px',
              left: '25px',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.85rem',
              color: 'rgba(0, 240, 255, 0.75)',
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>▲ NORTH // AMRITA COIMBATORE BLUEPRINT</span>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '25px',
              fontSize: '0.75rem',
              color: 'rgba(0, 240, 255, 0.55)',
              fontFamily: 'monospace'
            }}>
              CAMPUS SECTOR GRID: LAT 10.9001° N / LON 76.8998° E
            </div>
          </div>

          {/* Render All 23 Scattered 3D Buildings */}
          {buildingsData.map((b) => {
            const isHovered = hoveredBuilding?.id === b.id;
            const isSelected = activeBuilding?.id === b.id;
            const isDestination = destinationId === b.id && pathfindingActive;
            const isSource = sourceId === b.id && pathfindingActive;

            // Height elevation on hover or destination
            const currentLift = isDestination
              ? 'translateZ(45px)'
              : isHovered
              ? 'translateZ(35px)'
              : isSelected
              ? 'translateZ(20px)'
              : 'translateZ(0px)';

            return (
              <div
                key={b.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (dragRef.current.moved) return;
                  setActiveBuilding(b);
                  setDestinationId(b.id);
                }}
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
                  zIndex: isDestination ? 60 : isHovered ? 50 : 10
                }}
              >
                {/* 3D Box Floor Shadow */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  filter: 'blur(10px)',
                  transform: 'translateZ(-2px)',
                  opacity: isDestination ? 0.95 : isHovered ? 0.85 : 0.4
                }} />

                {/* Pulsing Beacon Ring for Destination Search */}
                {isDestination && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '-15px',
                    width: `${b.width + 30}px`,
                    height: `${b.depth + 30}px`,
                    borderRadius: '8px',
                    border: '3px solid #00ffff',
                    boxShadow: '0 0 35px #00ffff, inset 0 0 25px rgba(0, 240, 255, 0.6)',
                    animation: 'beaconPulse 1.2s infinite ease-in-out',
                    transform: `translateZ(${b.height + 15}px)`,
                    pointerEvents: 'none'
                  }} />
                )}

                {/* Billboard Floating Indicator when Hovered, Selected or Destination */}
                {(isHovered || isSelected || isDestination) && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translateZ(${b.height + 35}px) rotateZ(${-rotZ}deg) rotateX(${-rotX}deg)`,
                    transformStyle: 'preserve-3d',
                    pointerEvents: 'none',
                    zIndex: 70,
                    whiteSpace: 'nowrap',
                    backgroundColor: 'rgba(4, 10, 24, 0.95)',
                    border: `1.5px solid ${isDestination ? '#00ffff' : b.color}`,
                    borderRadius: '4px',
                    padding: '3px 8px',
                    boxShadow: `0 0 15px ${b.glowColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isDestination ? '#00ffff' : b.color,
                      boxShadow: `0 0 8px ${b.color}`
                    }} />
                    <span style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}>
                      {b.name}
                    </span>
                  </div>
                )}

                {/* 3D Building Top Roof Face */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transform: `translateZ(${b.height}px)`,
                  background: isDestination
                    ? 'linear-gradient(135deg, #0284c7, #00ffff, #ffffff)'
                    : isHovered || isSelected
                    ? b.accentGradient
                    : b.category === 'girls_hostel'
                    ? 'linear-gradient(135deg, rgba(190, 24, 93, 0.85), rgba(236, 72, 153, 0.95))'
                    : b.category === 'boys_hostel'
                    ? 'linear-gradient(135deg, rgba(29, 78, 216, 0.85), rgba(59, 130, 246, 0.95))'
                    : 'rgba(15, 30, 60, 0.92)',
                  border: isDestination
                    ? '3px solid #ffffff'
                    : isSource
                    ? '2px solid #10b981'
                    : `2px solid ${b.color}`,
                  boxShadow: isDestination
                    ? '0 0 45px #00ffff, inset 0 0 25px #00ffff'
                    : isHovered
                    ? `0 0 35px ${b.glowColor}, inset 0 0 20px ${b.glowColor}`
                    : `0 0 12px ${b.glowColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  boxSizing: 'border-box',
                  color: isDestination ? '#05070e' : '#ffffff',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: isDestination ? '#05070e' : b.color
                  }}>
                    {b.code}
                  </span>
                  <strong style={{
                    fontSize: '0.8rem',
                    fontFamily: 'Cinzel, serif',
                    marginTop: '2px',
                    lineHeight: 1.1,
                    textShadow: isDestination ? 'none' : '0 0 8px rgba(0,0,0,0.9)'
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

              </div>
            );
          })}

        </div>

        {/* Floating 3D Camera Controls HUD */}
        <div
          data-no-drag="true"
          style={{
            position: 'absolute',
            top: '20px',
            right: '25px',
            zIndex: 35,
            backgroundColor: 'rgba(8, 20, 44, 0.92)',
            border: '1.5px solid rgba(0, 240, 255, 0.45)',
            borderRadius: '6px',
            padding: hudExpanded ? '0.85rem 1rem' : '0.5rem 0.75rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 240, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            userSelect: 'none',
            maxWidth: '280px',
            transition: 'all 0.25s ease'
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* HUD Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: hudExpanded ? '1px solid rgba(0, 240, 255, 0.2)' : 'none', paddingBottom: hudExpanded ? '0.4rem' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00ffff', fontSize: '0.75rem', fontFamily: 'Cinzel, serif', fontWeight: 700, letterSpacing: '1px' }}>
              <Compass size={14} />
              <span>3D CAMERA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={handleResetCamera}
                title="Reset camera to default view"
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  color: '#00ffff',
                  borderRadius: '3px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={11} />
                <span>RESET</span>
              </button>
              <button
                type="button"
                onClick={() => setHudExpanded(!hudExpanded)}
                title={hudExpanded ? 'Collapse Camera HUD' : 'Expand Camera HUD'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {hudExpanded ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {hudExpanded && (
            <>
              {/* D-Pad Directional Tilt & Rotate Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.5px' }}>
                  ROTATION & TILT
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 34px)', gridTemplateRows: 'repeat(3, 30px)', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                  <div />
                  <button
                    type="button"
                    onClick={tiltUp}
                    title="Tilt Camera Up"
                    style={{
                      backgroundColor: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      color: '#00ffff',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '0',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <div />

                  <button
                    type="button"
                    onClick={rotateLeft}
                    title="Rotate Left"
                    style={{
                      backgroundColor: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      color: '#00ffff',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '0',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.62rem',
                    fontFamily: 'monospace',
                    color: '#38bdf8'
                  }}>
                    3D
                  </div>
                  <button
                    type="button"
                    onClick={rotateRight}
                    title="Rotate Right"
                    style={{
                      backgroundColor: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      color: '#00ffff',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '0',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>

                  <div />
                  <button
                    type="button"
                    onClick={tiltDown}
                    title="Tilt Camera Down"
                    style={{
                      backgroundColor: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      color: '#00ffff',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '0',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                  <div />
                </div>
              </div>

              {/* Zoom In / Out Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', backgroundColor: 'rgba(5, 12, 28, 0.75)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  disabled={zoom <= 0.5}
                  style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    color: '#00ffff',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
                    padding: '0.3rem 0.6rem',
                    opacity: zoom <= 0.5 ? 0.4 : 1
                  }}
                >
                  <ZoomOut size={13} />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: '#fef08a' }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: '#64748b' }}>
                    ZOOM
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  disabled={zoom >= 2.2}
                  style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    color: '#00ffff',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: zoom >= 2.2 ? 'not-allowed' : 'pointer',
                    padding: '0.3rem 0.6rem',
                    opacity: zoom >= 2.2 ? 0.4 : 1
                  }}
                >
                  <ZoomIn size={13} />
                </button>
              </div>

              {/* Preset Angle Buttons */}
              <div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  VIEW PRESETS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {[
                    { id: 'isometric', label: 'ISO' },
                    { id: 'top', label: 'TOP' },
                    { id: 'front', label: 'FRONT' },
                    { id: 'east', label: 'EAST' }
                  ].map((p) => {
                    const isActive = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p.id)}
                        style={{
                          background: isActive ? '#00ffff' : 'rgba(0, 240, 255, 0.08)',
                          color: isActive ? '#05070e' : '#cbd5e1',
                          border: isActive ? '1px solid #00ffff' : '1px solid rgba(0, 240, 255, 0.25)',
                          borderRadius: '2px',
                          padding: '0.25rem 0',
                          fontSize: '0.64rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Coordinate readout */}
              <div style={{
                fontSize: '0.6rem',
                fontFamily: 'monospace',
                color: '#64748b',
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '0.35rem'
              }}>
                <span>TILT: {Math.round(rotX)}°</span>
                <span>ROT: {Math.round(rotZ)}°</span>
                <span>{isDragging ? 'DRAGGING' : 'READY'}</span>
              </div>
            </>
          )}
        </div>

        {/* Navigation Gestures Hint Pill (Bottom Left of 3D stage) */}
        <div
          data-no-drag="true"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '25px',
            zIndex: 35,
            backgroundColor: 'rgba(8, 20, 44, 0.88)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '4px',
            padding: '0.4rem 0.8rem',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            color: '#cbd5e1',
            pointerEvents: 'none'
          }}
        >
          <span style={{ color: '#00ffff', fontWeight: 700 }}>NAVIGATION:</span>
          <span>🖱️ Drag to Rotate</span>
          <span style={{ color: '#64748b' }}>|</span>
          <span>Right-Click/Shift: Pan</span>
          <span style={{ color: '#64748b' }}>|</span>
          <span>Scroll / Pinch: Zoom</span>
        </div>

      </div>

      {/* =========================================================================
          INTERACTIVE BUILDING TOOLTIP & INCHARGE MODAL DRAWER (Bottom Right)
         ========================================================================= */}
      {activeBuilding && (
        <div style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          width: '380px',
          backgroundColor: 'rgba(8, 20, 44, 0.96)',
          border: `2px solid ${activeBuilding.color}`,
          borderRadius: '4px',
          padding: '1.4rem',
          boxShadow: `0 0 35px ${activeBuilding.glowColor}, 0 20px 40px rgba(0,0,0,0.8)`,
          backdropFilter: 'blur(12px)',
          zIndex: 100,
          animation: 'fadeInUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{
              backgroundColor: `${activeBuilding.color}22`,
              border: `1px solid ${activeBuilding.color}`,
              color: activeBuilding.color,
              padding: '0.15rem 0.5rem',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              fontWeight: 700
            }}>
              {activeBuilding.code} &bull; {activeBuilding.category.toUpperCase().replace('_', ' ')}
            </span>

            <button
              type="button"
              onClick={() => setActiveBuilding(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
            >
              &times;
            </button>
          </div>

          <h3 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.25rem',
            color: '#ffffff',
            margin: '0.3rem 0 0.5rem 0',
            letterSpacing: '1px'
          }}>
            {activeBuilding.name}
          </h3>

          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 0.8rem 0' }}>
            {activeBuilding.description}
          </p>

          {/* Special Academic Block Details: Branches & Incharge Phone (as strictly required) */}
          {activeBuilding.branches && (
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '3px',
              padding: '0.8rem',
              marginBottom: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00ffff', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '0.3rem' }}>
                <BookOpen size={14} />
                <span>BRANCHES HOUSED:</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fef08a', fontFamily: 'Cinzel, serif' }}>
                {activeBuilding.branches}
              </div>

              {activeBuilding.incharge && (
                <div style={{ marginTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    BUILDING INCHARGE:
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                    {activeBuilding.incharge}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    <Phone size={13} />
                    <span>{activeBuilding.phone}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Route Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setSourceId(activeBuilding.id);
                setPathfindingActive(true);
              }}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '0.45rem',
                fontSize: '0.72rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Set as Origin
            </button>

            <button
              type="button"
              onClick={() => {
                setDestinationId(activeBuilding.id);
                setPathfindingActive(true);
              }}
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid #00ffff',
                color: '#00ffff',
                padding: '0.45rem',
                fontSize: '0.72rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Set as Destination
            </button>
          </div>

        </div>
      )}

      {/* Pulse Keyframe Style */}
      <style>{`
        @keyframes beaconPulse {
          0% {
            transform: translateZ(95px) scale(1);
            opacity: 1;
            box-shadow: 0 0 20px #00ffff;
          }
          50% {
            transform: translateZ(110px) scale(1.12);
            opacity: 0.8;
            box-shadow: 0 0 50px #00ffff, inset 0 0 30px #00ffff;
          }
          100% {
            transform: translateZ(95px) scale(1);
            opacity: 1;
            box-shadow: 0 0 20px #00ffff;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </div>
  );
}
