export const CONTRACT_ADDRESS = "0xEDCA406CD0CEF77c015499Bb8e1FF6f9E3bAcD5f" as `0x${string}`;

export const CERTIFICATE_ABI = [
  {
    name: "mintCertificate", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "recipient",     type: "address" },
      { name: "recipientName", type: "string"  },
      { name: "courseName",    type: "string"  },
      { name: "issueDate",     type: "string"  },
      { name: "ipfsHash",      type: "string"  },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    name: "revokeCertificate", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "verifyCertificate", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "recipientName", type: "string"  },
      { name: "courseName",    type: "string"  },
      { name: "issueDate",     type: "string"  },
      { name: "issuedTo",      type: "address" },
      { name: "isRevoked",     type: "bool"    },
      { name: "isValid",       type: "bool"    },
      { name: "ipfsHash",      type: "string"  },
    ],
  },
  {
    name: "getCertificatesByOwner", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "authorizedIssuers", type: "function", stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
