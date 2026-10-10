import fs from 'node:fs';
import solc from 'solc';
const input={language:'Solidity',sources:{'BlitzRewards.sol':{content:fs.readFileSync('contracts/BlitzRewards.sol','utf8')}},settings:{optimizer:{enabled:true,runs:200},evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object','evm.deployedBytecode.object']}}}};
const output=JSON.parse(solc.compile(JSON.stringify(input)));
const errors=(output.errors??[]).filter(e=>e.severity==='error');
if(errors.length)throw new Error(errors.map(e=>e.formattedMessage).join('\n'));
const c=output.contracts['BlitzRewards.sol'].BlitzRewards;
fs.writeFileSync('contracts/BlitzRewards.json',JSON.stringify({compiler:solc.version(),abi:c.abi,bytecode:'0x'+c.evm.bytecode.object,deployedBytecode:'0x'+c.evm.deployedBytecode.object},null,2)+'\n');
console.log('BlitzRewards compiled: ABI, creation bytecode and runtime bytecode.');
