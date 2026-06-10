import { useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Certificate, WarningCircle, SealCheck, Link, MagnifyingGlass } from "@phosphor-icons/react";
import { useCertificatesByOwner, useVerifyCertificate } from "../hooks/useCertificate";

function CertCard({ tokenId, index, searchTerm }: { tokenId: bigint; index: number; searchTerm: string }) {
  const { data } = useVerifyCertificate(tokenId);
  
  if (!data) return null;

  const courseName = data[1].toLowerCase();
  const certIdStr = tokenId.toString();
  const term = searchTerm.toLowerCase();

  if (searchTerm && !certIdStr.includes(term) && !courseName.includes(term)) {
    return null;
  }

  const isValid = data[5];
  const colSpan = index % 3 === 0 ? "md:col-span-2" : "md:col-span-1";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.32, 0.72, 0, 1] }}
      className={`double-bezel ${colSpan} row-span-1`}
    >
      <div className="double-bezel-inner p-6 md:p-8 flex flex-col justify-between min-h-[240px]">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10">
            <Certificate weight="light" size={24} className="text-white/70" />
          </div>
          <div className={`px-3 py-1 rounded-full text-xs tracking-wider uppercase font-medium flex items-center gap-1.5 ${isValid ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"}`}>
            {isValid ? <SealCheck weight="fill" /> : <WarningCircle weight="fill" />}
            {isValid ? "Valid" : "Revoked"}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-1 flex justify-between">
            <span>Certificate ID: {certIdStr}</span>
          </p>
          <h3 className="text-2xl md:text-3xl font-medium tracking-tight mb-2 leading-tight">{data[1]}</h3>
          <div className="flex items-center justify-between mt-6">
            <p className="text-white/50 text-sm">{data[2]}</p>
            <div className="flex gap-2">
              <a 
                href={data[6].replace("ipfs://", "https://ipfs.io/ipfs/")} 
                target="_blank" 
                rel="noreferrer"
                title="View Certificate Image"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Link size={14} className="text-white/70" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { address, isConnected } = useAccount();
  const { data: tokenIds, isLoading } = useCertificatesByOwner(address);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Certificate size={48} weight="thin" className="text-white/20 mb-6" />
        <h2 className="text-3xl font-medium tracking-tight mb-4">Connect Wallet</h2>
        <p className="text-white/50 max-w-md font-light leading-relaxed">
          Please connect your Ethereum wallet to view your academic credentials and certificates.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">My Collection</h1>
          <p className="text-white/50 mt-4 font-light flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {address}
          </p>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full bg-white/[0.03] ring-1 ring-white/10 outline-none focus:ring-white/30 transition-all text-sm w-64"
            />
          </div>
          <div className="px-5 py-2.5 rounded-full bg-white/[0.03] ring-1 ring-white/10 w-fit">
            <span className="text-white/60 text-sm">Total: <span className="text-white font-medium">{tokenIds?.length || 0}</span></span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-2 items-center text-white/40">
          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/80 animate-spin"></div>
          Loading blockchain data...
        </div>
      ) : (!tokenIds || tokenIds.length === 0) ? (
        <div className="double-bezel">
          <div className="double-bezel-inner py-24 flex flex-col items-center text-center">
            <Certificate size={48} weight="thin" className="text-white/10 mb-4" />
            <p className="text-white/40 text-lg font-light">No certificates found for this address.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tokenIds.map((id, index) => (
            <CertCard key={id.toString()} tokenId={id} index={index} searchTerm={searchTerm} />
          ))}
        </div>
      )}
    </div>
  );
}
