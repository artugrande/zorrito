// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title ProofOfHuman
 * @notice Implementation of SelfVerificationRoot for age verification (13+ years)
 * @dev This contract verifies that users are at least 13 years old using Self Protocol
 */
contract ProofOfHuman is SelfVerificationRoot {
    // Verification result storage
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bool public verificationSuccessful;
    bytes public lastUserData;
    address public lastUserAddress;

    // Verification config storage
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;

    // Events
    event VerificationCompleted(ISelfVerificationRoot.GenericDiscloseOutputV2 output, bytes userData);

    /**
     * @notice Constructor for the ProofOfHuman contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scopeSeed The scope seed that is used to create the scope of the contract
     * @param _verificationConfig The verification configuration (minimumAge: 13)
     */
    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed, 
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    )
        SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed)
    {
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId =
            IIdentityVerificationHubV2(identityVerificationHubV2Address).setVerificationConfigV2(verificationConfig);
    }

    /**
     * @notice Implementation of customVerificationHook from SelfVerificationRoot
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    )
        internal
        override
    {
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = address(uint160(output.userIdentifier));

        emit VerificationCompleted(output, userData);
    }

    /**
     * @notice Implementation of getConfigId from SelfVerificationRoot
     * @dev Returns the verification config ID for this contract
     * @return The verification configuration ID
     */
    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    )
        public
        view
        override
        returns (bytes32)
    {
        return verificationConfigId;
    }

    /**
     * @notice Check if a user address has been verified
     * @param userAddress The address to check
     * @return bool True if the user has been verified
     */
    function isUserVerified(address userAddress) public view returns (bool) {
        return verificationSuccessful && lastUserAddress == userAddress;
    }
}

