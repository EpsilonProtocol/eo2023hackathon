// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//
// Imported code
//

// From code sample found
contract Enum {
    enum Operation {
        Call, DelegateCall
    }
}

interface Executor {
    /// @dev Allows a Module to execute a transaction.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(address to, uint256 value, bytes calldata data, Enum.Operation operation)
        external
        returns (bool success);
}

contract SafeDelegatedProxyZaap {

    struct Allowances {
        uint256 amount;
        Executor gnosisSafeInstance;
    }

    mapping(bytes32 => Allowances) public allowances;

    function generateAllowanceKey(address owner, address allowedContract) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(owner, allowedContract));
    }

    function getAllowance(address owner, address allowedContract) public view returns (uint256) {
        bytes32 key = generateAllowanceKey(owner, allowedContract);
        return allowances[key].amount;
    }

    function setMaxContractAllowance(address allowedContract, uint256 amount, address spender) public {
        address owner = msg.sender;
        bytes32 key = generateAllowanceKey(owner, allowedContract);
        allowances[key] = Allowances({amount:amount, gnosisSafeInstance:Executor(spender)});
    }

    function betOnMarket(
        address owner,
        address allowedContract,
        uint256 amount,
        uint256 claimId,
        bool outcomeBet) public {

        bytes32 key = generateAllowanceKey(owner, allowedContract);
        require(amount <= allowances[key].amount, "Not enough allowance");

        // It's expected the receiver of the funds sends the NFT in the same transaction
        transferEtherFromGnosisSafe(
            Executor(owner),
            claimId,
            outcomeBet,
            payable(allowedContract),
            amount);
    }

    function transferEtherFromGnosisSafe(
        Executor payer,
        uint256 claimId,
        bool outcome,
        address payable _to,
        uint256 _amount) public {

        bytes memory data = abi.encodePacked(claimId, outcome);

        Enum.Operation op = Enum.Operation.Call;
        (bool success) = payer.execTransactionFromModule(
            _to,
            _amount,
            data,
            op
        );

        require(success, "Transfer from Gnosis Safe failed");
    }
}