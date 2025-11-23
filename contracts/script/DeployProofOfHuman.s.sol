// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ProofOfHuman } from "../src/ProofOfHuman.sol";
import { BaseScript } from "./Base.s.sol";
import { console } from "forge-std/console.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/// @title DeployProofOfHuman
/// @notice Deployment script for ProofOfHuman contract
contract DeployProofOfHuman is BaseScript {
    // Custom errors for deployment verification
    error DeploymentFailed();

    /// @notice Main deployment function
    /// @return proofOfHuman The deployed ProofOfHuman contract instance
    /// @dev Requires the following environment variables:
    ///      - IDENTITY_VERIFICATION_HUB_ADDRESS: Address of the Self Protocol verification hub
    ///      - SCOPE_SEED: Scope seed value (defaults to "zorrito-finance")
    function run() public broadcast returns (ProofOfHuman proofOfHuman) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        
        // Validate hub address
        if (hubAddress == address(0)) {
            revert("IDENTITY_VERIFICATION_HUB_ADDRESS cannot be zero address");
        }
        
        // Make sure this matches frontend config in components/age-verification.tsx
        // Frontend: minimumAge: 13, nationality: true
        string[] memory forbiddenCountries = new string[](0);  // Empty array = no countries forbidden
        
        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 13,  // Must match frontend minimumAge
            forbiddenCountries: forbiddenCountries,  // Empty array = no countries are forbidden/all countries allowed
            ofacEnabled: false  // Must match frontend ofac setting
        });

        // Deploy the contract using SCOPE_SEED from environment
        proofOfHuman = new ProofOfHuman(hubAddress, scopeSeed, verificationConfig);

        // Log deployment information
        console.log("ProofOfHuman deployed to:", address(proofOfHuman));
        console.log("Identity Verification Hub:", hubAddress);
        console.log("Scope Value:", proofOfHuman.scope());

        // Verify deployment was successful
        if (address(proofOfHuman) == address(0)) revert DeploymentFailed();

        console.log("Deployment verification completed successfully!");
        console.log("Scope automatically generated from SCOPE_SEED:", scopeSeed);
    }
}

