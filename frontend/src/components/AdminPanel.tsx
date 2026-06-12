import { useState, useRef } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { FileArrowUp, Trash, CheckCircle, CalendarBlank } from "@phosphor-icons/react";
import { uploadFileToIPFS, uploadToIPFS } from "../utils/ipfs";
import { useMintCertificate, useRevokeCertificate } from "../hooks/useCertificate";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "ACW", label: "ACHIEVEMENT & AWARDS" },
  { value: "CG", label: "COMPLETION & GRADUATION" },
  { value: "PA", label: "PARTICIPATION & ATTENDANCE" },
  { value: "CL", label: "CONTRIBUTION & LEADERSHIP" }
];

export default function AdminPanel() {
  const { address } = useAccount();

  const [form, setForm] = useState({
    recipient: "",
    recipientName: "",
    courseName: "",
  });
  const [category, setCategory] = useState("CG");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [revokeId, setRevokeId] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { mint, isPending: minting, isConfirming, isSuccess, error } = useMintCertificate();
  const { revoke, isPending: revoking, isConfirming: revokeConfirming, isSuccess: revokeSuccess, error: revokeError } = useRevokeCertificate();

  // Draw image to canvas and add text
  const generateImageBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject(new Error("Canvas not found"));
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context missing"));

      const img = new Image();
      img.src = "/template.png";
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Match canvas size to image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Styling text
        ctx.textAlign = "center";

        // Draw Category
        ctx.font = "bold 100px 'Times New Roman', serif";
        ctx.fillStyle = "#d8ae5e";
        const categoryLabel = CATEGORIES.find(c => c.value === category)?.label || category;
        ctx.fillText(`CERTIFICATE OF`, canvas.width / 2, canvas.height / 2 - 470);
        ctx.fillText(categoryLabel, canvas.width / 2, canvas.height / 2 - 360);

        // Draw Name
        ctx.font = "bold 150px 'Times New Roman', serif";
        ctx.fillStyle = "#d8ae5e";
        ctx.fillText(form.recipientName, canvas.width / 2, canvas.height / 2 + 40);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas to Blob failed"));
        }, "image/png");
      };
      img.onerror = () => reject(new Error("Failed to load template.png"));
    });
  };

  async function handleMint() {
    setIsAlertOpen(false); // Close the modal immediately

    if (!form.recipient || !form.recipientName || !date) {
      setStatusText("Error: Please fill all required fields");
      return;
    }

    setIsUploading(true);
    setStatusText("Generating certificate image...");
    try {
      const imageBlob = await generateImageBlob();

      setStatusText("Uploading image to IPFS...");
      const imageIpfsHash = await uploadFileToIPFS(imageBlob);

      // Generate ID: [KATEGORI]-[TAHUN][BULAN]-[STRING_ACAK]
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const certId = `${category.toUpperCase()}-${year}${month}-${randomStr}`;

      const issueDateStr = date.toISOString().split('T')[0];

      setStatusText("Uploading metadata to IPFS...");
      const metadataIpfsHash = await uploadToIPFS({
        recipientName: form.recipientName,
        courseName: form.courseName,
        issueDate: issueDateStr,
        category: category,
        certId: certId,
        imageIpfsHash: imageIpfsHash
      });

      setStatusText(`Please Sign the Transaction in your Wallet...`);
      mint(form.recipient as `0x${string}`, certId, form.recipientName, form.courseName, issueDateStr, metadataIpfsHash);
    } catch (e: any) {
      if (e.message?.includes("User rejected")) {
        setStatusText("Error: Dibatalkan untuk mint sertifikat.");
      } else {
        setStatusText(`Error: ${e.message.substring(0, 50)}...`);
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mint Section */}
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Issue Certificate</h1>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-6 md:p-8 flex flex-col space-y-4">

            <div className="space-y-1">
              <Label className="text-white/60">Kategori Sertifikat</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-transparent border-white/10 text-white">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white w-full mt-1 ml-10 sm:mt-0 sm:ml-0">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="focus:bg-white/10 focus:text-white">
                      {c.label} ({c.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-white/60">Student Wallet Address</Label>
              <Input
                className="bg-transparent border-white/10 focus:border-white/40 text-white"
                placeholder="0x..."
                value={form.recipient}
                onChange={e => setForm({ ...form, recipient: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-white/60">Full Name</Label>
              <Input
                className="bg-transparent border-white/10 focus:border-white/40 text-white"
                placeholder="Student Name"
                value={form.recipientName}
                onChange={e => setForm({ ...form, recipientName: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-white/60">Course</Label>
              <Input
                className="bg-transparent border-white/10 focus:border-white/40 text-white"
                placeholder="e.g. Web Development 3.0"
                value={form.courseName}
                onChange={e => setForm({ ...form, courseName: e.target.value })}
              />
            </div>

            <div className="space-y-1 flex flex-col">
              <Label className="text-white/60 mb-1">Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent border-white/10 text-white hover:bg-white/5",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarBlank className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-black border-white/10">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isUploading || minting || isConfirming || !address || !form.recipient || !form.recipientName || !date}
                  className="group w-full mt-2 bg-white text-black hover:bg-white/90 rounded-full h-12"
                >
                  <span>{isUploading ? "Uploading to IPFS..." : minting ? "Awaiting Signature..." : isConfirming ? "Confirming..." : "Mint Credential"}</span>
                  <FileArrowUp weight="bold" size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0a0a0a] border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Certificate Details</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    Are you sure the following data is 100% correct? <br /><br />
                    <span className="block text-white/90"><strong>Name:</strong> {form.recipientName}</span>
                    <span className="block text-white/90"><strong>Course:</strong> {form.courseName}</span>
                    <span className="block text-white/90 font-mono text-xs mt-1"><strong>Wallet:</strong> {form.recipient}</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMint} className="bg-white text-black hover:bg-white/90">Yes, Proceed</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {statusText && <p className="text-sm text-white/50">{statusText}</p>}
            {isSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 text-sm flex items-center gap-1">
                <CheckCircle weight="fill" /> Minted successfully!
              </motion.div>
            )}
            {error && <p className="text-sm text-red-400">{error.message.includes("User rejected") ? "Error: Dibatalkan untuk mint sertifikat." : (error.message.includes("NotAuthorizedIssuer") || error.message.includes("reverted")) ? "Error: Wallet ini tidak punya akses untuk membuat sertifikat." : "Error: " + error.message.substring(0, 50) + "..."}</p>}
          </div>
        </div>
      </div>

      {/* Revoke Section */}
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Revoke Token</h2>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-6 md:p-8 flex flex-col space-y-4">
            <div className="space-y-1">
              <Label className="text-white/60">Certificate ID</Label>
              <Input
                type="text"
                className="bg-transparent border-white/10 focus:border-white/40 text-white uppercase"
                placeholder="e.g. CG-202606-RD5RW"
                value={revokeId}
                onChange={e => setRevokeId(e.target.value)}
              />
            </div>
            <Button
              variant="destructive"
              onClick={() => revoke(revokeId)}
              disabled={revoking || revokeConfirming || !revokeId}
              className="group w-full rounded-full h-12 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
            >
              <span>{revoking ? "Awaiting Signature..." : revokeConfirming ? "Processing..." : "Revoke"}</span>
              <Trash weight="bold" size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {revokeSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 text-sm flex items-center gap-1 mt-2">
                <CheckCircle weight="fill" /> Certificate successfully revoked!
              </motion.div>
            )}
            {revokeError && (
              <p className="text-sm text-red-400 mt-2">
                Error: {revokeError.message.includes("User rejected")
                  ? "Dibatalkan untuk revoke sertifikat."
                  : revokeError.message.includes("reverted")
                    ? "Sertifikat tidak ditemukan."
                    : revokeError.message.substring(0, 80) + "..."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
