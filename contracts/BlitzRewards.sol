// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/// @notice Testnet MVP. The host is trusted to submit the server's winner list.
contract BlitzRewards {
 address public host;
 bytes32 public roomKey;
 uint256 public pool;
 uint256 public finalizeBefore;
 uint256 public claimUntil;
 bool public finalized;
 bool public refunded;
 mapping(address => uint256) public allocation;
 event Finalized(address[] winners,uint256 share);
 event Claimed(address indexed winner,uint256 amount);
 event Refunded(uint256 amount);
 constructor(bytes32 key,uint256 finalizeBy,uint256 claimsExpire) payable {
  require(msg.value>0,"Empty pool");
  require(finalizeBy>block.timestamp&&claimsExpire>finalizeBy,"Bad deadlines");
  host=msg.sender;roomKey=key;pool=msg.value;finalizeBefore=finalizeBy;claimUntil=claimsExpire;
 }
 function finalize(address[] calldata winners) external {
  require(msg.sender==host,"Host only");
  require(!finalized&&!refunded&&block.timestamp<finalizeBefore,"Finalization closed");
  require(winners.length>0&&winners.length<=20,"Bad winner count");
  uint256 share=pool/winners.length;
  require(share>0,"Pool too small");
  for(uint256 i=0;i<winners.length;i++){
   require(winners[i]!=address(0)&&allocation[winners[i]]==0,"Bad or duplicate winner");
   allocation[winners[i]]=share;
  }
  finalized=true;emit Finalized(winners,share);
 }
 function claim() external {
  require(finalized&&!refunded&&block.timestamp<claimUntil,"Claims closed");
  uint256 amount=allocation[msg.sender];require(amount>0,"No reward or already claimed");
  allocation[msg.sender]=0;
  (bool ok,)=msg.sender.call{value:amount}("");require(ok,"Transfer failed");
  emit Claimed(msg.sender,amount);
 }
 function refund() external {
  require(msg.sender==host&&!refunded,"Host only or refunded");
  require(finalized?block.timestamp>=claimUntil:block.timestamp>=finalizeBefore,"Too early");
  refunded=true;uint256 amount=address(this).balance;
  (bool ok,)=host.call{value:amount}("");require(ok,"Transfer failed");
  emit Refunded(amount);
 }
}
