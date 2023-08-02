// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Escrow {
    address public arbiter;
    uint public escrowsNo;

    enum Status {
        Deposited,
        Disputed,
        Approved,
        Cancelled
    }

    struct EscrowDetail {
        address beneficiary;
        address depositor;
        uint256 amount;
        Status status;
    }

    mapping(uint => EscrowDetail) escrows;

    event Approved(uint);
    event Disputed(uint);
    event Cancelled(uint);
    event EscrowCreated(
        address indexed depositor,
        address indexed beneficiary,
        uint amount
    );

    constructor() {
        arbiter = msg.sender;
    }

    function createEscrow(address _beneficiary) external payable {
        EscrowDetail memory newEscrow = EscrowDetail({
            beneficiary: _beneficiary,
            depositor: msg.sender,
            amount: msg.value,
            status: Status.Deposited
        });
        escrowsNo++;
        escrows[escrowsNo] = newEscrow;
        emit EscrowCreated(msg.sender, _beneficiary, msg.value);
    }

    function getEscrow(
        uint id
    ) external view returns (EscrowDetail memory escrow) {
        escrow = escrows[id];
    }

    function dispute(uint256 id) external {
        EscrowDetail storage disputedEscrow = escrows[id];
        require(msg.sender == disputedEscrow.depositor, "Unauthorized caller");
        require(
            disputedEscrow.status == Status.Deposited,
            "Escrow can no longer be disputed"
        );
        disputedEscrow.status = Status.Disputed;
        emit Disputed(id);
    }

    function approve(uint256 id) external {
        EscrowDetail storage approvedEscrow = escrows[id];
        require(msg.sender == approvedEscrow.depositor, "Unauthorized caller");
        require(
            approvedEscrow.status == Status.Deposited,
            "Escrow can no longer be approved"
        );
        (bool sent, ) = payable(approvedEscrow.beneficiary).call{
            value: approvedEscrow.amount
        }("");
        require(sent, "Failed to send Ether");
        approvedEscrow.status = Status.Approved;
        emit Approved(id);
    }

    function handleDispute(uint256 id, Status status) external {
        require(msg.sender == arbiter, "Unauthorized caller");
        bool validStatus = status == Status.Approved ||
            status == Status.Cancelled;
        require(validStatus, "Invalid status");
        EscrowDetail storage disputedEscrow = escrows[id];
        require(
            disputedEscrow.status == Status.Disputed,
            "Escrow can no longer be handled"
        );
        if (status == Status.Approved) {
            (bool sent, ) = payable(disputedEscrow.beneficiary).call{
                value: disputedEscrow.amount
            }("");
            require(sent, "Failed to send Ether");
            disputedEscrow.status = Status.Approved;
            emit Approved(id);
        } else {
            (bool sent, ) = payable(disputedEscrow.depositor).call{
                value: disputedEscrow.amount
            }("");
            require(sent, "Failed to send Ether");
            disputedEscrow.status = Status.Cancelled;
            emit Cancelled(id);
        }
    }
}
