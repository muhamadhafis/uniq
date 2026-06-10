import { useState, useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Certificate, WarningCircle, SealCheck, Link as LinkIcon, MagnifyingGlass, Copy, CheckCircle } from "@phosphor-icons/react";
import { useCertificatesByOwner, useVerifyCertificate } from "../hooks/useCertificate";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function CertCard({ tokenId, index, searchTerm }: { tokenId: bigint; index: number; searchTerm: string }) {
  const { data } = useVerifyCertificate(tokenId);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (data && data[0]) {
      navigator.clipboard.writeText(data[0]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (data?.[7]) {
      const url = data[7].replace("ipfs://", "https://green-absent-gorilla-466.mypinata.cloud/ipfs/");
      fetch(url)
        .then(res => res.json())
        .then(json => {
          if (json.imageIpfsHash) {
            setImageUrl(json.imageIpfsHash.replace("ipfs://", "https://green-absent-gorilla-466.mypinata.cloud/ipfs/"));
          } else if (json.image) {
            setImageUrl(json.image.replace("ipfs://", "https://green-absent-gorilla-466.mypinata.cloud/ipfs/"));
          }
        })
        .catch(() => { });
    }
  }, [data]);

  if (!data) return null;

  const courseName = data[2].toLowerCase();
  const certIdStr = data[0];
  const term = searchTerm.toLowerCase();

  if (searchTerm && !certIdStr.toLowerCase().includes(term) && !courseName.includes(term)) {
    return null;
  }

  const isValid = data[6];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.32, 0.72, 0, 1] }}
      className="double-bezel w-full"
    >
      <div className="double-bezel-inner py-2 px-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-6">
          <div>
            <div
              onClick={handleCopy}
              className="flex items-center gap-2 cursor-pointer group w-fit"
              title="Click to copy ID"
            >
              <p className="text-white/40 text-sm tracking-widest uppercase mb-1 group-hover:text-white/70 transition-colors">
                {certIdStr}
              </p>
              <div className="mb-1">
                {isCopied ? (
                  <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                ) : (
                  <Copy size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                )}
              </div>
            </div>
            <h3 className="text-2xl font-medium tracking-tight leading-tight">{data[2]}</h3>
            <p className="text-white/50 text-sm mt-1">{data[3]}</p>
          </div>
        </div>

        <div className="flex items-start md:items-end justify-center">
          <div className="flex flex-row gap-2 mt-2">
            <a
              href={data[7].replace("ipfs://", "https://green-absent-gorilla-466.mypinata.cloud/ipfs/")}
              target="_blank"
              rel="noreferrer"
              title="View IPFS Metadata"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <span className="underline text-white/80 text-xs">Metadata</span>
            </a>
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                title="View Certificate Image"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
              >
                <span className="underline text-white/80 text-xs">Image</span>
              </a>
            )}
            <div className={`px-4 py-1.5 rounded-full text-xs tracking-wider uppercase font-medium flex items-center gap-1 w-fit ${isValid ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"}`}>
              {isValid ? <SealCheck weight="fill" size={16} /> : <WarningCircle weight="fill" size={16} />}
              {isValid ? "Valid" : "Revoked"}
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState("5");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term to prevent jitter/lag while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 400); // 400ms delay

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const limitNum = parseInt(limit);
  const totalItems = tokenIds ? tokenIds.length : 0;
  const totalPages = Math.ceil(totalItems / limitNum);

  const currentItems = useMemo(() => {
    if (!tokenIds) return [];
    const reversedTokens = [...tokenIds].reverse();
    const start = (currentPage - 1) * limitNum;
    return reversedTokens.slice(start, start + limitNum);
  }, [tokenIds, currentPage, limitNum]);

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
    <div className="flex flex-col space-y-6 sm:space-y-12 ">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">My Collection</h1>
        </div>
        <div className="flex flex-col gap-4 items-start sm:items-end">
          <div className="flex sm:flex-wrap items-center gap-3">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by ID or Course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full bg-white/[0.03] ring-1 ring-white/10 outline-none focus:ring-white/30 transition-all text-sm w-auto"
              />
            </div>

            <Select
              value={limit}
              onValueChange={(val) => {
                setLimit(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px] bg-white/[0.03] ring-1 ring-white/10 border-none outline-none rounded-full h-9">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10 text-white rounded-xl mt-2">
                <SelectItem value="5" className="focus:bg-white/10">5</SelectItem>
                <SelectItem value="10" className="focus:bg-white/10">10</SelectItem>
                <SelectItem value="20" className="focus:bg-white/10">20</SelectItem>
                <SelectItem value="50" className="focus:bg-white/10">50</SelectItem>
              </SelectContent>
            </Select>
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
        <div className="flex flex-col gap-4">
          {currentItems.map((id, index) => (
            <CertCard key={id.toString()} tokenId={id} index={index} searchTerm={debouncedSearch} />
          ))}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={`cursor-pointer hover:bg-white/5 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className={`cursor-pointer ${currentPage === page ? "bg-white text-white hover:bg-white/90" : "hover:bg-white/5 text-white"}`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={`cursor-pointer hover:bg-white/5 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
