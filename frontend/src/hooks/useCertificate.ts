import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CERTIFICATE_ABI, CONTRACT_ADDRESS } from "../utils/abi";

export function useVerifyCertificate(tokenId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CERTIFICATE_ABI,
    functionName: "verifyCertificate",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined },
  });
}

export function useVerifyCertificateByCertId(certId: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CERTIFICATE_ABI,
    functionName: "verifyCertificateByCertId",
    args: certId ? [certId] : undefined,
    query: { enabled: !!certId },
  });
}

export function useCertificatesByOwner(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CERTIFICATE_ABI,
    functionName: "getCertificatesByOwner",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner },
  });
}

export function useMintCertificate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const mint = (
    recipient: `0x${string}`,
    certId: string,
    recipientName: string,
    courseName: string,
    issueDate: string,
    ipfsHash: string
  ) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CERTIFICATE_ABI,
      functionName: "mintCertificate",
      args: [recipient, certId, recipientName, courseName, issueDate, ipfsHash],
    });
  };

  return { mint, hash, isPending, isConfirming, isSuccess, error };
}

export function useRevokeCertificate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const revoke = (certId: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CERTIFICATE_ABI,
      functionName: "revokeCertificateByCertId",
      args: [certId],
    });
  };

  return { revoke, hash, isPending, isConfirming, isSuccess, error };
}
