import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from "framer-motion";
import AdminPanel from "./components/AdminPanel";
import StudentDashboard from "./components/StudentDashboard";
import VerifyPage from "./components/VerifyPage";

type Tab = "admin" | "student" | "verify";

export default function App() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("verify");

  const tabs: { id: Tab; label: string }[] = [
    { id: "verify", label: "Verify" },
    { id: "student", label: "My Certificates" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <div className="relative min-h-[100dvh] w-full px-4 md:px-8 py-12 md:py-24 font-sans text-white">
      {/* Navbar - Floating Glass Pill */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[90%] max-w-5xl rounded-full bg-white/[0.03] backdrop-blur-2xl ring-1 ring-white/10 px-6 py-3"
      >
        <div className="font-bold tracking-tight text-lg">uniQ</div>

        <div className="hidden md:flex items-center">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-500 ease-fluid ${tab === t.id ? "text-white" : "text-white/40 hover:text-white/80"
                }`}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-white/10 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center">
          <ConnectButton />
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto mt-16">
        {/* Mobile Tabs */}
        <div className="flex md:hidden overflow-x-auto gap-2 pb-6 no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors ring-1 ${tab === t.id ? "bg-white text-black ring-transparent" : "bg-white/[0.03] text-white/60 ring-white/10"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            {tab === "admin" && <AdminPanel />}
            {tab === "student" && <StudentDashboard />}
            {tab === "verify" && <VerifyPage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
