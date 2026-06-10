// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CertificateNFT
/// @notice Sertifikat akademik on-chain sebagai NFT ERC721
/// @dev Menggunakan OpenZeppelin ERC721URIStorage + Ownable
contract CertificateNFT is ERC721URIStorage, Ownable {

    uint256 private _tokenIdCounter;

    struct Certificate {
        string  certId;
        string  recipientName;
        string  courseName;
        string  issueDate;
        address issuedTo;
        bool    isRevoked;
        uint256 issuedAt;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(address => bool) public authorizedIssuers;
    
    mapping(string => uint256) public certIdToTokenId;
    mapping(string => bool) public certIdExists;

    // Events
    event CertificateMinted(uint256 indexed tokenId, address indexed recipient, string courseName);
    event CertificateRevoked(uint256 indexed tokenId, address indexed revokedBy);
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);

    // Custom errors
    error NotAuthorizedIssuer();
    error TokenDoesNotExist();
    error AlreadyRevoked();

    constructor() ERC721("AcademicCertificate", "ACERT") Ownable(msg.sender) {
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyIssuer() {
        if (!authorizedIssuers[msg.sender]) revert NotAuthorizedIssuer();
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        _;
    }

    function addIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    function removeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    /// @notice Mint sertifikat baru ke wallet mahasiswa
    function mintCertificate(
        address recipient,
        string calldata certId,
        string calldata recipientName,
        string calldata courseName,
        string calldata issueDate,
        string calldata ipfsHash
    ) external onlyIssuer returns (uint256 tokenId) {
        require(!certIdExists[certId], "Certificate ID already exists");
        
        tokenId = _tokenIdCounter++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, ipfsHash);

        certificates[tokenId] = Certificate({
            certId:        certId,
            recipientName: recipientName,
            courseName:    courseName,
            issueDate:     issueDate,
            issuedTo:      recipient,
            isRevoked:     false,
            issuedAt:      block.timestamp
        });

        certIdToTokenId[certId] = tokenId;
        certIdExists[certId] = true;

        emit CertificateMinted(tokenId, recipient, courseName);
    }

    /// @notice Revoke sertifikat (tandai tidak valid)
    function revokeCertificate(uint256 tokenId)
        external onlyIssuer tokenExists(tokenId)
    {
        if (certificates[tokenId].isRevoked) revert AlreadyRevoked();
        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    function revokeCertificateByCertId(string calldata certId)
        external onlyIssuer
    {
        if (!certIdExists[certId]) revert TokenDoesNotExist();
        uint256 tid = certIdToTokenId[certId];
        if (certificates[tid].isRevoked) revert AlreadyRevoked();
        certificates[tid].isRevoked = true;
        emit CertificateRevoked(tid, msg.sender);
    }

    /// @notice Verifikasi keaslian sertifikat — siapapun bisa panggil
    function verifyCertificate(uint256 tokenId)
        external view tokenExists(tokenId)
        returns (
            string  memory certId,
            string  memory recipientName,
            string  memory courseName,
            string  memory issueDate,
            address        issuedTo,
            bool           isRevoked,
            bool           isValid,
            string  memory ipfsHash
        )
    {
        Certificate memory cert = certificates[tokenId];
        return (
            cert.certId,
            cert.recipientName,
            cert.courseName,
            cert.issueDate,
            cert.issuedTo,
            cert.isRevoked,
            !cert.isRevoked,
            tokenURI(tokenId)
        );
    }

    function verifyCertificateByCertId(string calldata certId)
        external view 
        returns (
            string  memory recipientName,
            string  memory courseName,
            string  memory issueDate,
            address        issuedTo,
            bool           isRevoked,
            bool           isValid,
            string  memory ipfsHash,
            uint256        tokenId
        )
    {
        if (!certIdExists[certId]) revert TokenDoesNotExist();
        uint256 tid = certIdToTokenId[certId];
        Certificate memory cert = certificates[tid];
        return (
            cert.recipientName,
            cert.courseName,
            cert.issueDate,
            cert.issuedTo,
            cert.isRevoked,
            !cert.isRevoked,
            tokenURI(tid),
            tid
        );
    }

    /// @notice Ambil semua tokenId milik address tertentu
    function getCertificatesByOwner(address owner)
        external view returns (uint256[] memory)
    {
        uint256 total = _tokenIdCounter;
        uint256 count;
        for (uint256 i; i < total; ++i) {
            if (_ownerOf(i) == owner) ++count;
        }
        uint256[] memory result = new uint256[](count);
        uint256 idx;
        for (uint256 i; i < total; ++i) {
            if (_ownerOf(i) == owner) result[idx++] = i;
        }
        return result;
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
