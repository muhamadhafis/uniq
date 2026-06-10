import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, SealCheck, WarningCircle, ArrowRight, User, CalendarBlank, Hash } from "@phosphor-icons/react";
import { useVerifyCertificate } from "../hooks/useCertificate";

export default function VerifyPage() {
  const [inputId, setInputId] = useState("");
  const [tokenId, setTokenId] = useState<bigint | undefined>();
  const { data, isLoading, error } = useVerifyCertificate(tokenId);

  return (
    <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
      {/* Search Section */}
      <div className="w-full md:w-1/2 flex flex-col space-y-8">
        <div>
          <span className="inline-block px-3 py-1 mb-4 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/10 rounded-full">
            Public Explorer
          </span>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight">Verify<br /><span className="text-white/40">Authenticity.</span></h1>
          <p className="text-white/50 mt-6 font-light leading-relaxed text-lg">
            Instantly cryptographically verify any academic credential issued on our platform without relying on third parties.
          </p>
        </div>

        <div className="double-bezel mt-8">
          <div className="double-bezel-inner p-2 flex items-center">
            <input
              type="number"
              className="w-full bg-transparent py-4 text-xl outline-none placeholder:text-white/20 font-light"
              placeholder="Certificate ID (Token ID)..."
              value={inputId} onChange={e => setInputId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && inputId && setTokenId(BigInt(inputId))}
            />
            <button
              onClick={() => setTokenId(BigInt(inputId))}
              disabled={!inputId}
              className="group flex-shrink-0 bg-white text-black h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <MagnifyingGlass weight="bold" size={18} className="transition-transform duration-500 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="w-full md:w-1/2 min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 text-white/40">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
              <p className="font-light tracking-wide text-sm uppercase">Querying Blockchain</p>
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="double-bezel w-full">
              <div className="double-bezel-inner p-8 flex flex-col items-center text-center">
                <WarningCircle size={48} weight="thin" className="text-red-400/50 mb-4" />
                <p className="text-xl font-medium mb-2">Not Found</p>
                <p className="text-white/40 font-light">The Certificate ID does not exist or has not been minted yet.</p>
              </div>
            </motion.div>
          ) : data ? (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }} className="w-full">
              <div className="double-bezel">
                <div className="double-bezel-inner p-8 relative overflow-hidden">
                  {/* Decorative blur */}
                  <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none ${data[5] ? "bg-emerald-500" : "bg-red-500"}`}></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data[5] ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {data[5] ? <SealCheck weight="fill" size={24} /> : <WarningCircle weight="fill" size={24} />}
                      </div>
                      <div>
                        <h3 className="text-2xl font-medium tracking-tight">{data[5] ? "Verified" : "Revoked"}</h3>
                        <p className="text-white/40 text-sm font-light">On-chain status</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-white/40 text-xs tracking-widest uppercase mb-1 flex items-center gap-2"><Hash size={12} /> Course</p>
                        <p className="text-xl font-medium">{data[1]}</p>
                      </div>

                      <div className="h-[1px] w-full bg-white/5"></div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-white/40 text-xs tracking-widest uppercase mb-1 flex items-center gap-2"><User size={12} /> Recipient</p>
                          <p className="text-white/90">{data[0]}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs tracking-widest uppercase mb-1 flex items-center gap-2"><CalendarBlank size={12} /> Date Issued</p>
                          <p className="text-white/90">{data[2]}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 mt-4">
                        <div>
                          <p className="text-white/40 text-xs tracking-widest uppercase mb-1 flex items-center gap-2"><Hash size={12} /> Certificate ID</p>
                          <p className="text-white/90 font-mono">{tokenId?.toString()}</p>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-col gap-3">
                        <a href={data[6].replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors">
                          <span className="text-sm font-medium text-white/70">View Raw IPFS Metadata</span>
                          <ArrowRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
                        </a>
                        {data[6] && (
                          <a href={data[6].replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors">
                            <span className="text-sm font-medium text-white/70">View Certificate Image</span>
                            <ArrowRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center text-white/20">
              <SealCheck size={64} weight="thin" className="mb-4 opacity-50" />
              <p className="font-light tracking-wide">Enter a Certificate ID to view credentials</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
