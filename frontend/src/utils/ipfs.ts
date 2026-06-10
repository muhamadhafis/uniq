import axios from "axios";

export async function uploadFileToIPFS(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, "certificate.png");

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
      },
    }
  );
  return `ipfs://${response.data.IpfsHash}`;
}

export async function uploadToIPFS(metadata: {
  recipientName: string;
  courseName:    string;
  issueDate:     string;
  category:      string;
  certId:        string;
  imageIpfsHash: string;
}): Promise<string> {
  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      pinataContent: {
        name:        `Certificate - ${metadata.courseName}`,
        description: `Official Certificate for ${metadata.recipientName}`,
        image:       metadata.imageIpfsHash,
        attributes: [
          { trait_type: "Recipient",  value: metadata.recipientName },
          { trait_type: "Course",     value: metadata.courseName    },
          { trait_type: "Issue Date", value: metadata.issueDate     },
          { trait_type: "Category",   value: metadata.category      },
          { trait_type: "Certificate ID", value: metadata.certId    },
        ],
      },
      pinataMetadata: { name: `cert-meta-${Date.now()}` },
    },
    {
      headers: {
        pinata_api_key:        import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
      },
    }
  );
  return `ipfs://${response.data.IpfsHash}`;
}
