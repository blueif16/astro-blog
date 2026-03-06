import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Inline SVG Icons ───────────────────────────────────────────────
// Keeping these as components so we don't need external icon deps.

const WalletIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <rect x="14" y="13" width="4" height="3" rx="0.5" fill="white" stroke="none" />
  </svg>
);

const EthIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L5 12.5L12 16L19 12.5L12 2Z" fill="#7C3AED" opacity="0.8" />
    <path d="M12 16L5 12.5L12 22L19 12.5L12 16Z" fill="#7C3AED" opacity="0.5" />
  </svg>
);

const DollarIcon = ({ size = 18, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const UsdcIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Circular arrows suggesting stablecoin/exchange */}
    <path d="M17.5 7.5C16 5.5 13.5 4.5 11 5c-3 .6-5.2 3-5.5 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M6.5 16.5C8 18.5 10.5 19.5 13 19c3-.6 5.2-3 5.5-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <text x="12" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="sans-serif">$</text>
  </svg>
);

// ─── Satellite icon definitions ─────────────────────────────────────
// Each has a resting position (default) and an orbit position (hovered).
// x/y are percentage offsets from center of the card.

const satellites = [
  {
    id: "eth-1",
    icon: <EthIcon size={22} />,
    bg: "radial-gradient(circle, #ffffff 60%, #f3e8ff 100%)",
    size: 52,
    rest: { x: -90, y: 60, scale: 1, opacity: 1 },
    orbit: { x: -160, y: -120, scale: 0.85, opacity: 1 },
  },
  {
    id: "dollar-1",
    icon: <DollarIcon size={16} color="white" />,
    bg: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)",
    size: 44,
    rest: { x: -60, y: 130, scale: 0.9, opacity: 1 },
    orbit: { x: -170, y: 50, scale: 0.55, opacity: 1 },
  },
  {
    id: "usdc-1",
    icon: <UsdcIcon size={20} />,
    bg: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
    size: 50,
    rest: { x: 100, y: 40, scale: 1, opacity: 1 },
    orbit: { x: 170, y: -80, scale: 0.7, opacity: 0.9 },
  },
  // These 3 are hidden at rest and fan out on hover
  {
    id: "dollar-2",
    icon: <DollarIcon size={14} color="white" />,
    bg: "linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%)",
    size: 38,
    rest: { x: 0, y: 40, scale: 0, opacity: 0 },
    orbit: { x: 30, y: -150, scale: 0.7, opacity: 1 },
  },
  {
    id: "usdc-2",
    icon: <UsdcIcon size={16} />,
    bg: "linear-gradient(135deg, #93c5fd 0%, #7dd3fc 100%)",
    size: 40,
    rest: { x: -20, y: 80, scale: 0, opacity: 0 },
    orbit: { x: -110, y: 120, scale: 0.6, opacity: 0.85 },
  },
  {
    id: "eth-2",
    icon: <EthIcon size={20} />,
    bg: "radial-gradient(circle, #ffffff 60%, #f3e8ff 100%)",
    size: 48,
    rest: { x: 30, y: 100, scale: 0, opacity: 0 },
    orbit: { x: 120, y: 130, scale: 0.8, opacity: 1 },
  },
];

// ─── Spring config ──────────────────────────────────────────────────
// A slightly underdamped spring gives that organic "settle" feel.
const spring = { type: "spring", stiffness: 180, damping: 22, mass: 1 };
const gentleSpring = { type: "spring", stiffness: 120, damping: 20, mass: 1.2 };

// ─── Main Component ─────────────────────────────────────────────────

export default function CryptoCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: 380,
        height: 460,
        borderRadius: 28,
        background: "linear-gradient(160deg, #f0d9ff 0%, #e9d0fa 40%, #dfc4f7 100%)",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
        boxShadow: "0 4px 40px rgba(120, 50, 180, 0.12), 0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Orbit rings (fade in on hover) ── */}
      {[140, 200, 260].map((r, i) => (
        <motion.div
          key={`ring-${i}`}
          animate={{
            opacity: hovered ? 0.18 - i * 0.04 : 0,
            scale: hovered ? 1 : 0.8,
          }}
          transition={{ ...gentleSpring, delay: i * 0.04 }}
          style={{
            position: "absolute",
            // Anchored to card center
            top: "50%",
            left: "50%",
            width: r * 2,
            height: r * 2,
            marginTop: -(r),
            marginLeft: -(r),
            borderRadius: "50%",
            border: "1.5px solid rgba(120, 40, 180, 0.25)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Central wallet hub ── */}
      <motion.div
        animate={{
          // Resting: shifted down. Hovered: true center.
          y: hovered ? 0 : 30,
          scale: hovered ? 1.1 : 1,
        }}
        transition={spring}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 100,
          height: 100,
          marginTop: -50,
          marginLeft: -50,
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, #3b1564 0%, #1e0a36 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 30px rgba(30, 10, 54, 0.4)",
          zIndex: 10,
        }}
      >
        <WalletIcon />
      </motion.div>

      {/* ── Satellite icons ── */}
      {satellites.map((sat, i) => {
        const target = hovered ? sat.orbit : sat.rest;
        return (
          <motion.div
            key={sat.id}
            animate={{
              x: target.x,
              y: target.y,
              scale: target.scale,
              opacity: target.opacity,
            }}
            transition={{ ...spring, delay: i * 0.025 }}
            style={{
              position: "absolute",
              // Start from card center so offsets are relative to center
              top: "50%",
              left: "50%",
              width: sat.size,
              height: sat.size,
              marginTop: -(sat.size / 2),
              marginLeft: -(sat.size / 2),
              borderRadius: "50%",
              background: sat.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              zIndex: 5,
              willChange: "transform, opacity",
            }}
          >
            {sat.icon}
          </motion.div>
        );
      })}

      {/* ── Text crossfade ── */}
      {/* 
        Two text blocks sharing the same container. AnimatePresence handles
        the exit animation of the outgoing text while the incoming text enters.
        Position is absolute so they can overlap during crossfade.
      */}
      <AnimatePresence mode="wait">
        {!hovered ? (
          <motion.div
            key="text-default"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: 36,
              left: 32,
              right: 32,
              zIndex: 20,
            }}
          >
            <h2 style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#2a0845",
              fontFamily: "'DM Sans', 'SF Pro Display', system-ui, sans-serif",
              letterSpacing: "-0.02em",
            }}>
              The best rates,<br />
              thousands of<br />
              aggregated<br />
              services
            </h2>
          </motion.div>
        ) : (
          <motion.div
            key="text-hovered"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              position: "absolute",
              bottom: 32,
              left: 32,
              right: 32,
              zIndex: 20,
            }}
          >
            <h2 style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#2a0845",
              fontFamily: "'DM Sans', 'SF Pro Display', system-ui, sans-serif",
              letterSpacing: "-0.02em",
            }}>
              The best of crypto<br />
              brought to you
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
