// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
/// @title BlitzBattle sponsor-funded testnet reward escrow
/// @notice Scores are offchain. Sponsor attests the winners; this is NOT a trustless score oracle.
contract BlitzRewards {
    struct Battle { address sponsor; uint256 pool; uint64 deadline; bool settled; }
    mapping(bytes32 => Battle) public battles;
    mapping(bytes32 => mapping(address => uint256)) public claimable;
    uint256 private locked = 1;
    event Funded(bytes32 indexed id, address indexed sponsor, uint256 amount, uint64 deadline);
    event Settled(bytes32 indexed id, address[] winners, uint256 share);
    event Claimed(bytes32 indexed id, address indexed winner, uint256 amount);
    event Refunded(bytes32 indexed id, uint256 amount);
    modifier nonReentrant() { require(locked == 1, 'Reentrant'); locked = 2; _; locked = 1; }
    function fund(bytes32 id, uint64 deadline) external payable {
        require(id != bytes32(0) && msg.value > 0, 'Invalid funding');
        require(battles[id].sponsor == address(0), 'Already funded');
        require(deadline >= block.timestamp + 10 minutes && deadline <= block.timestamp + 7 days, 'Deadline');
        battles[id] = Battle(msg.sender, msg.value, deadline, false);
        emit Funded(id,msg.sender,msg.value,deadline);
    }
    function settle(bytes32 id, address[] calldata winners) external {
        Battle storage b = battles[id];
        require(msg.sender == b.sponsor && !b.settled, 'Not sponsor or settled');
        require(block.timestamp < b.deadline, 'Expired');
        require(winners.length > 0 && winners.length <= 16 && b.pool >= winners.length, 'Winners');
        b.settled = true;
        uint256 share = b.pool / winners.length;
        for (uint256 i=0; i<winners.length; i++) {
            require(winners[i] != address(0), 'Zero address');
            for (uint256 j=0; j<i; j++) require(winners[i] != winners[j], 'Duplicate');
            claimable[id][winners[i]] = share + (i == 0 ? b.pool % winners.length : 0);
        }
        emit Settled(id,winners,share);
    }
    function claim(bytes32 id) external nonReentrant {
        uint256 amount = claimable[id][msg.sender];
        require(amount > 0, 'Nothing to claim');
        claimable[id][msg.sender] = 0;
        (bool ok,) = msg.sender.call{value:amount}('');
        require(ok,'Transfer failed');
        emit Claimed(id,msg.sender,amount);
    }
    function refund(bytes32 id) external nonReentrant {
        Battle storage b = battles[id];
        require(msg.sender == b.sponsor && !b.settled, 'Not refundable');
        require(block.timestamp >= b.deadline, 'Not expired');
        b.settled = true;
        (bool ok,) = msg.sender.call{value:b.pool}('');
        require(ok,'Transfer failed');
        emit Refunded(id,b.pool);
    }
}
