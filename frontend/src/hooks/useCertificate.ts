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
    recipientName: string,
    courseName: string,
    issueDate: string,
    ipfsHash: string
  ) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CERTIFICATE_ABI,
      functionName: "mintCertificate",
      args: [recipient, recipientName, courseName, issueDate, ipfsHash],
    });
  };

  return { mint, hash, isPending, isConfirming, isSuccess, error };
}

export function useRevokeCertificate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const revoke = (tokenId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CERTIFICATE_ABI,
      functionName: "revokeCertificate",
      args: [tokenId],
    });
  };

  return { revoke, hash, isPending, isConfirming, isSuccess, error };
}
