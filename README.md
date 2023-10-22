# ETH online 2023 Hackathon

# Zaapbot
![Zaap](https://github.com/EpsilonProtocol/eo2023hackathon/assets/148345042/8131adc3-d313-4749-9b42-398792d4ea02)


## Overview

Zaapbot is a Peer to Peer prediction market designed to allow users to bet on anything, anywhere. For this hackathon, we show Zaapbots multimodal capabilties inside the beating heart of crypto- TWITTER. We simplify the experience of prediction markets without making any additional trust assumptions, using Account abstraction. We create SCW wallets using SAFE SDK and Metamask authentication. Users can customise allowance and whitelist markets inside the Zaapbot UI. 

### (DEMO)

## Problem

Broken Crypto UX has seen the proliferation of TG bots that make significant trust assumptions. For prediction markets, applications in web2.0 are censored, with a high take rate. Crypto counterparts are inaccessible to web2.0 users, while TG bots hold the private keys of users on centralised servers. 

## Our Solution 

With Zaapbot, we give users best in class UX for prediction markets using Twitter, SAFE Account abstraction SDK and UMAs Optimistic Oracle. Users can have full control and custody of their funds, while being able to enjoy a multimodal experince of betting on ANYTHING. For this hackathon, we showcase this capabiltiy in twitter, and our Zaapbot UI. The UI is used to deploy a SAFE Account Abstraction wallet, authorize it with Metamask (the controller wallet), and customize allowances (bet limits). Once the user does this, they are free to create markets and participate in them directly from twitter. 

We use the UMA Optmistic Oracle for our betting contracts. 

## How it works

![image](https://github.com/EpsilonProtocol/eo2023hackathon/assets/60383339/fd7409ae-c428-4263-9f7e-e70d885805e6)
![image](https://github.com/EpsilonProtocol/eo2023hackathon/assets/60383339/54ec3058-042d-4c45-ab0e-2821591aba9c)

### Smart contracts

#### ZaapPredictionMarket Smart Contract

*Overview*
The ZaapPredictionMarket smart contract is designed to create a decentralized prediction market where users can propose questions (claims), place bets on these claims, and subsequently resolve and pay out the winners based on the outcome of these claims. The contract utilizes the Optimistic Oracle V3 (OOV3) and Ethereum's ERC20 tokens for its operation.

*Events*
The contract defines several events to log important activities:

**NewClaimRegistered:**
Parameters: originator (address), id (uint256)
Emitted when a new claim is registered.

**BetMadeOnClaimOutcome:**
Parameters: bettor (address), amount (uint256), prediction (bool)
Emitted when a user places a bet on a claim.

**RewardPaid:**
Parameters: bettor (address), amount (uint256)
Emitted when a reward is paid out to a bettor.

*Structs*

**Bet:**
bettor (address): Address of the bettor.
amount (uint256): Bet amount.
claimIsTrue (bool): The bettor's prediction.

**Claim:**
assertedClaim (bytes): Description (assertion) of the question.
startTime (uint256): Start time of the question.
endTime (uint256): End time of the question.
resolved (bool): Indicates whether the question is resolved.
resolvedBy (address): Address that resolved the question.
assertionId (bytes32): ID for the Optimistic Oracle.
betCounter (uint256): Counter for tracking the number of bets on the claim.
poolTrue (uint256): Total amount of tokens in the "true" outcome pool.
poolFalse (uint256): Total amount of tokens in the "false" outcome pool.

*Functions*
The contract provides several functions for interacting with the prediction market:

**proposeClaim(string memory _claim, uint256 _startTime, uint256 _endTime) public:**
Allows users to propose a new question (claim).
Checks for validity of input parameters and emits a NewClaimRegistered event upon success.

**placeBet(uint256 _claimId, uint256 _amount, bool _prediction) public:**
Allows users to place bets on existing claims.
Verifies conditions such as claim validity, non-resolved status, and bet amount, and records the bet.
Emits a BetMadeOnClaimOutcome event upon success.

**assertTruth(uint256 _claimId) public:**
Initiates the assertion resolution process for a claim.
Conditions are checked to ensure the claim is not already resolved, and the assertion is not already made.
The Optimistic Oracle is used to assert the truth.

**resolveQuestionAndPayWinners(uint256 _claimId, bool _result) public:**
Allows for the resolution of a claim and payout to the winners.
Conditions are checked to ensure the claim is not already resolved, and the claim's end time has passed.
The Optimistic Oracle is used to settle the assertion, and winnings are paid out to correct bettors.

**getQuestionFinalResult(uint256 _claimId) public view returns (bool):**
Retrieves the final result of the assertion for a specific claim.
getAssertion(uint256 _claimId) public view returns (OptimisticOracleV3Interface.Assertion memory):

Retrieves the full assertion object associated with a claim, including detailed information.

**getClaim(uint256 _claimId) public view returns (Claim memory):**
Allows users to retrieve information about a specific claim by providing its claim ID.
Usage

This smart contract can be utilized in a decentralized application (DApp) to create and manage prediction markets. Users can propose questions, place bets, and resolve questions to determine winning bets.

## Team 

### Sarat Angajala https://github.com/SaratAngajalaoffl
### Konrad Strachan https://github.com/konradstrachan
### Vishwa Naik https://github.com/hrojantorse

# Deployed Contracts

## Prediction Market Contract

### Scroll > https://sepolia.scrollscan.com/address/0x4dc36fcc192c042fc49fe934d86e8942d79c4e93
### Mantle > https://explorer.testnet.mantle.xyz/address/0x4DC36FCc192c042fC49Fe934D86E8942D79c4e93
### Goerli > https://goerli.etherscan.io/address/0xFF109C7C3AA9706F0bFDc2f4a7173B4F7aA9bc22

## Safe Delegate Contracts

### Goerli > https://goerli.etherscan.io/address/0x2976ad88221447146E887B8ECef8CA0b526384C6


