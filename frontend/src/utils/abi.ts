export const CONTRACT_ADDRESS = "0xc9539534C1B059535e90Dd471d9474baadA00ac2" as `0x${string}`;

export const CERTIFICATE_ABI = [
  {
    name: "mintCertificate", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "recipient",     type: "address" },
      { name: "certId",        type: "string"  },
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
    name: "revokeCertificateByCertId", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "certId", type: "string" }],
    outputs: [],
  },
  {
    name: "verifyCertificate", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "certId",        type: "string"  },
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
    name: "verifyCertificateByCertId", type: "function", stateMutability: "view",
    inputs: [{ name: "certId", type: "string" }],
    outputs: [
      { name: "recipientName", type: "string"  },
      { name: "courseName",    type: "string"  },
      { name: "issueDate",     type: "string"  },
      { name: "issuedTo",      type: "address" },
      { name: "isRevoked",     type: "bool"    },
      { name: "isValid",       type: "bool"    },
      { name: "ipfsHash",      type: "string"  },
      { name: "tokenId",       type: "uint256" },
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
