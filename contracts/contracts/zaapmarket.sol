// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/UMAprotocol/protocol/blob/7a93650a7494eaee83756382a18ecf11314499cf/packages/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

contract ZaapPredictionMarket {
    // Define the Optimistic Oracle V3 instance
    OptimisticOracleV3Interface public oov3;

    // Structure to represent a question
    struct Claim {
        bytes claim;         // The question description (assertion)
        uint256 startTime;   // Start time of the question
        uint256 endTime;     // End time of the question
        bool resolved;       // Whether the question is resolved
        bool result;         // The resolved result (true for Yes, false for No)
        address resolvedBy;  // Address that resolved the question
        bytes32 assertionId; // ID for OO
    }

    // Mapping to store questions
    mapping(uint256 => Claim) public claims;
    uint256 public claimCounter;

    // Constructor to set the Optimistic Oracle V3 address
    constructor(address _oov3Address) {
        oov3 = OptimisticOracleInterface(_oov3Address);
    }

    // Function to propose a new question
    function proposeClaim(bytes memory _claim, uint256 _startTime, uint256 _endTime) public {
        // TODO : add minimum amount for bet
        require(_endTime > _startTime, "End time must be after start time");

        uint256 claimId = claimCounter++;
        claims[claimId] = Claim({
            description: _description,
            assertionId: bytes(0),
            startTime: _startTime,
            endTime: _endTime,
            resolved: false,
            result: false,
            resolvedBy: address(0)
        });
    }

    // Function to place a bet
    function placeBet(uint256 _claimId, bool _prediction) public payable {
        Question storage question = questions[_claimId];
        require(question.startTime <= block.timestamp && question.endTime >= block.timestamp, "Betting is not allowed at this time");
        require(!question.resolved, "Question is already resolved");
        require(msg.value > 0, "Bet amount must be greater than 0");
    }

    // Function to resolve a question using Optimistic Oracle V3
    function resolveQuestion(uint256 _claimId, bool _result) public {
        Question storage question = questions[_claimId];
        require(!question.resolved, "Question is already resolved");
        require(block.timestamp > question.endTime, "Question is not yet resolved");

        // Prepare the ancillary data for the Optimistic Oracle
        bytes32 identifier = bytes32(_claimId); // Use a unique identifier for each question
        bytes32 ancillaryData = OracleAncillaryData.encodeForYesNo(_result); // Convert "Yes" or "No" to ancillary data
        uint256 timeout = 100; // Set a timeout value in blocks
        uint256 disputeId = oov3.requestPriceWithIdentifier(identifier, ancillaryData, timeout);

        // Wait for the Oracle to resolve the dispute
        bool isFinal = oov3.isDisputeFinalized(disputeId);
        require(isFinal, "Oracle result is not finalized yet");

        // Get the final result from the Oracle
        (uint256 finalPrice, ) = oov3.getDisputeData(disputeId);
        question.result = finalPrice == 1; // Set the result based on the Oracle's response
        question.resolved = true;
        question.resolvedBy = msg.sender;
    }

    // Assert the truth against the Optimistic Asserter
    // Note this is the simplest implementation which uses a lot of default values for the resolution process
    function assertTruth(uint256 _claimId) public {
        Claim storage claim = claims[_claimId];
        require(!claim.resolved, "Claim is already resolved");
        require(block.timestamp < claim.endTime, "Question is not yet ready to be resolved");
        require(claim.assertionId == bytes(0), "Assertion already made");

        // Starts the assertion resolution process
        // TODO set a bond amount as part of assertion
        // TODO set a dispute and escalation manager
        // TODO assert negative result to question
        claim.assertionId = oov3.assertTruthWithDefaults(claim.claim, address(this));
    }

    // If the assertion has not been disputed within the challenge window this will finalise and return result
    function settleAndGetAssertionResult(uint256 _claimId) public returns (bool) {
        return oov3.settleAndGetAssertionResult(claims[_claimId].assertionId);
    }

    // Just return the assertion result. Can only be called once the assertion has been settled.
    // If the assertion has not been settled then this will revert
    function getAssertionResult(uint256 _claimId) public view returns (bool) {
        return oov3.getAssertionResult(claims[_claimId].assertionId);
    }

    // Return the full assertion object contain all information associated with the assertion. Can be called any time.
    function getAssertion(uint256 _claimId)
        public
        view
        returns (OptimisticOracleV3Interface.Assertion memory)
    {
        return oov3.getAssertion(claims[_claimId].assertionId);
    }

    function getClaim(uint256 _claimId)
        public
        view
        returns (Claim memory)
    {
        return claims[_claimId];
    }
}
