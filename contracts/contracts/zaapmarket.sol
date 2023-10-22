// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/UMAprotocol/protocol/blob/7a93650a7494eaee83756382a18ecf11314499cf/packages/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

contract ZaapPredictionMarket {
    // Define the Optimistic Oracle V3 instance
    OptimisticOracleV3Interface public oov3;
    
    // The ERC20 token used for placing bets
    IERC20 public token;

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
        bool result;                    // The resolved result (true for Yes, false for No)
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
    constructor(address _oov3Address, address _tokenAddress) {
        oov3 = OptimisticOracleV3Interface(_oov3Address);
        token = IERC20(_tokenAddress);
    }

    // Function to propose a new question
    function proposeClaim(bytes memory _claim, uint256 _startTime, uint256 _endTime) public {
        // TODO : add minimum amount for bet
        require(_endTime > _startTime, "End time must be after start time");

        uint256 claimId = claimCounter++;

        claims[claimId] = Claim({
            assertedClaim: _claim,
            startTime: _startTime,
            endTime: _endTime,
            resolved: false,
            result: false,
            resolvedBy: address(0),
            assertionId: 0x00,
            betCounter: 0,
            poolTrue: 0,
            poolFalse: 0
        });
    }

    // Function to place a bet
    function placeBet(uint256 _claimId, uint256 _amount, bool _prediction) public payable {
        Claim storage claim = claims[_claimId];
        require(claim.startTime <= block.timestamp 
                && claim.endTime >= block.timestamp,
                "Betting is not allowed at this time");
        require(!claim.resolved, "Question is already resolved");
        require(msg.value > 0, "Bet amount must be greater than 0");

        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        uint256 betId = claim.betCounter++;
        bets[_claimId][betId] = Bet({
            bettor: msg.sender,
            amount: _amount,
            claimIsTrue: _prediction
        });

        if (_prediction == true){
            claim.poolTrue += _amount;
        } else {
            claim.poolFalse += _amount;
        }

        // TODO emit event
    }

    // Assert the truth against the Optimistic Asserter
    // Note this is the simplest implementation which uses a lot of default values for the resolution process
    function assertTruth(uint256 _claimId) public {
        Claim storage claim = claims[_claimId];
        require(!claim.resolved, "Claim is already resolved");
        require(block.timestamp < claim.endTime, "Claim is not yet ready to be resolved");
        require(claim.assertionId == 0x00, "Assertion already made");

        // Starts the assertion resolution process
        // TODO set a bond amount as part of assertion
        // TODO set a dispute and escalation manager
        // TODO assert negative result to claim
        claim.assertionId = oov3.assertTruthWithDefaults(claim.assertedClaim, address(this));

        // TODO emit event
    }

    // If the assertion has not been disputed within the challenge window this will finalise and pay winners
    function resolveQuestion(uint256 _claimId, bool _result) public {
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

                require(token.transfer(beneficiary, winnings), "Transfer failed");
            }
        }
    }

    function getQuestionFinalResult(uint256 _claimId) public view returns (bool) {
        // Just return the assertion result. Can only be called once the assertion has been settled.
        // If the assertion has not been settled then this will revert
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
