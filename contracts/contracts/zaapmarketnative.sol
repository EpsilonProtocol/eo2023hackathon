// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/UMAprotocol/protocol/blob/7a93650a7494eaee83756382a18ecf11314499cf/packages/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

contract ZaapPredictionMarketNative {
    // Define the Optimistic Oracle V3 instance
    OptimisticOracleV3Interface public oov3;

    event NewClaimRegistered(address originator, uint256 id);
    event BetMadeOnClaimOutcome(address bettor, uint256 amount, bool prediction);
    event RewardPaid(address bettor, uint256 amount);

    struct Bet {
        address bettor;
        uint256 amount;
        bool claimIsTrue;
    }

    // Structure to represent a question
    struct Claim {
        bytes assertedClaim;                    // The question description (assertion)
        uint256 startTime;              // Start time of the question
        uint256 endTime;                // End time of the question
        bool resolved;                  // Whether the question is resolved
        address resolvedBy;             // Address that resolved the question
        bytes32 assertionId;            // ID for OO
        uint256 betCounter;
        uint256 poolTrue;
        uint256 poolFalse;
    }

    mapping(uint256 => mapping(uint256 => Bet)) bets;

    // Mapping to store questions
    mapping(uint256 => Claim) public claims;
    uint256 public claimCounter;

    // Constructor to set the Optimistic Oracle V3 address
    constructor(address _oov3Address) {
        oov3 = OptimisticOracleV3Interface(_oov3Address);
    }

    // Function to propose a new question
    function proposeClaim(string memory _claim, uint256 _startTime, uint256 _endTime) public {
        // TODO: add a minimum amount for the bet
        require(_endTime > _startTime, "End time must be after start time");

        uint256 claimId = claimCounter++;

        bytes memory claimBytes = bytes(_claim);  // Convert string to bytes

        claims[claimId] = Claim({
            assertedClaim: claimBytes,
            startTime: _startTime,
            endTime: _endTime,
            resolved: false,
            resolvedBy: address(0),
            assertionId: 0x00,
            betCounter: 0,
            poolTrue: 0,
            poolFalse: 0
        });

        emit NewClaimRegistered(msg.sender, claimId);
    }

    // Function to place a bet
    function placeBet(uint256 _claimId, bool _prediction) public payable {
        Claim storage claim = claims[_claimId];
        require(claim.startTime <= block.timestamp 
                && claim.endTime >= block.timestamp,
                "Betting is not allowed at this time");
        require(!claim.resolved, "Question is already resolved");

        uint256 amount = msg.value;
        require(amount > 0, "Bet amount must be greater than 0");

        uint256 betId = claim.betCounter++;
        bets[_claimId][betId] = Bet({
            bettor: msg.sender,
            amount: amount,
            claimIsTrue: _prediction
        });

        if (_prediction == true){
            claim.poolTrue += amount;
        } else {
            claim.poolFalse += amount;
        }

        emit BetMadeOnClaimOutcome(msg.sender, amount, _prediction);
    }

    // Assert the truth against the Optimistic Asserter
    // Note this is the simplest implementation which uses a lot of default values for the resolution process
    function assertTruth(uint256 _claimId) public {
        Claim storage claim = claims[_claimId];
        require(!claim.resolved, "Claim is already resolved");
        require(block.timestamp > claim.endTime, "Claim is not yet ready to be resolved");
        require(claim.assertionId == 0x00, "Assertion already made");

        // Starts the assertion resolution process
        // TODO set a bond amount as part of assertion
        // TODO set a dispute and escalation manager
        // TODO assert negative result to claim
        claim.assertionId = oov3.assertTruthWithDefaults(claim.assertedClaim, address(this));

        // TODO emit event
    }

    // If the assertion has not been disputed within the challenge window this will finalise and pay winners
    // NOTE : There is a short wait time between calling assertTruth and being able to call this function to allow for despute
    function resolveQuestionAndPayWinners(uint256 _claimId, bool _result) public {
        Claim storage claim = claims[_claimId];
        require(!claim.resolved, "Claim is already resolved");
        require(block.timestamp > claim.endTime, "Claim is not yet resolved");

        // TODO: assumption here is this will revert if the challenge window hasn't started or finished
        bool result = oov3.settleAndGetAssertionResult(claims[_claimId].assertionId);

        // TODO: make total pool less to pay for Oracle and protocol fees in future
        // TODO2: a more elegant way is to give each position an ERC20 LP-like stake (which opens up secondary markets)
        uint256 totalPrizePool = claim.poolTrue + claim.poolFalse;

        for (uint256 i = 0; i < claim.betCounter; i++) {
            if (bets[_claimId][i].claimIsTrue == result) {
                // pay winning bet
                uint256 outcomePool = 0;
                
                if (bets[_claimId][i].claimIsTrue == true) {
                    outcomePool = claim.poolTrue;
                } else {
                    outcomePool = claim.poolFalse;
                }

                uint256 winnings = (bets[_claimId][i].amount / outcomePool) * totalPrizePool;

                address beneficiary = bets[_claimId][i].bettor;
                payable(beneficiary).transfer(winnings);
                emit RewardPaid(beneficiary, winnings);
            }
        }

        claim.resolved = true;
    }

    function getQuestionFinalResult(uint256 _claimId) public view returns (bool) {
        // Just return the assertion result. Can only be called once the assertion has been settled.
        // If the assertion has not been settled then this will revert
        return oov3.getAssertionResult(claims[_claimId].assertionId);
    }

    // Return the full assertion object contain all information associated with the assertion. Can be called any time.
    function getAssertion(uint256 _claimId) public view
        returns (OptimisticOracleV3Interface.Assertion memory)
    {
        return oov3.getAssertion(claims[_claimId].assertionId);
    }

    function getClaim(uint256 _claimId) public view
        returns (Claim memory)
    {
        return claims[_claimId];
    }
}