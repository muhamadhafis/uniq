// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CertificateNFT.sol";

contract CertificateNFTTest is Test {
    CertificateNFT public cert;

    address public admin   = address(this);
    address public student = makeAddr("student");
    address public random  = makeAddr("random");

    function setUp() public {
        cert = new CertificateNFT();
    }

    // ── Mint ─────────────────────────────────────────────────────────────────

    function test_MintCertificate() public {
        uint256 tokenId = cert.mintCertificate(
            student, "Budi Santoso", "Web Development 3.0", "2025-06-10", "ipfs://QmHash"
        );
        assertEq(tokenId, 0);
        assertEq(cert.ownerOf(0), student);
        assertEq(cert.totalSupply(), 1);
    }

    function test_MintEmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit CertificateNFT.CertificateMinted(0, student, "Web Development 3.0");
        cert.mintCertificate(student, "Budi", "Web Development 3.0", "2025-06-10", "ipfs://QmHash");
    }

    function test_RevertMint_NotIssuer() public {
        vm.prank(random);
        vm.expectRevert(CertificateNFT.NotAuthorizedIssuer.selector);
        cert.mintCertificate(student, "Budi", "Course", "2025-06-10", "ipfs://hash");
    }

    // ── Verify ────────────────────────────────────────────────────────────────

    function test_VerifyCertificate() public {
        cert.mintCertificate(student, "Budi Santoso", "Web Dev 3.0", "2025-06-10", "ipfs://QmHash");
        (string memory name, , , address issuedTo, bool isRevoked, bool isValid,) =
            cert.verifyCertificate(0);

        assertEq(name, "Budi Santoso");
        assertEq(issuedTo, student);
        assertFalse(isRevoked);
        assertTrue(isValid);
    }

    function test_RevertVerify_TokenNotExist() public {
        vm.expectRevert(CertificateNFT.TokenDoesNotExist.selector);
        cert.verifyCertificate(999);
    }

    // ── Revoke ────────────────────────────────────────────────────────────────

    function test_RevokeCertificate() public {
        cert.mintCertificate(student, "Budi", "Course", "2025-06-10", "ipfs://hash");
        cert.revokeCertificate(0);
        (,,,, bool isRevoked, bool isValid,) = cert.verifyCertificate(0);
        assertTrue(isRevoked);
        assertFalse(isValid);
    }

    function test_RevertRevoke_AlreadyRevoked() public {
        cert.mintCertificate(student, "Budi", "Course", "2025-06-10", "ipfs://hash");
        cert.revokeCertificate(0);
        vm.expectRevert(CertificateNFT.AlreadyRevoked.selector);
        cert.revokeCertificate(0);
    }

    // ── Issuer Management ─────────────────────────────────────────────────────

    function test_AddIssuer() public {
        cert.addIssuer(random);
        assertTrue(cert.authorizedIssuers(random));
        vm.prank(random);
        cert.mintCertificate(student, "Budi", "Course", "2025-06-10", "ipfs://hash");
    }

    // ── Fuzz Test ─────────────────────────────────────────────────────────────

    function testFuzz_MintMultiple(uint8 count) public {
        vm.assume(count > 0 && count < 50);
        for (uint256 i; i < count; ++i) {
            cert.mintCertificate(student, "Budi", "Course", "2025-06-10", "ipfs://hash");
        }
        assertEq(cert.totalSupply(), count);
    }
}
