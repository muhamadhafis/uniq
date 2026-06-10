// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/CertificateNFT.sol";

contract DeployScript is Script {
    function run() external returns (CertificateNFT) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        CertificateNFT cert = new CertificateNFT();
        vm.stopBroadcast();

        console.log("CertificateNFT deployed at:", address(cert));
        console.log("Deployer (admin):", vm.addr(deployerKey));
        return cert;
    }
}
