import solc from 'solc';
import fs from 'node:fs';
const source=fs.readFileSync('contracts/BlitzRewards.sol','utf8');
const input={language:'Solidity',sources:{'BlitzRewards.sol':{content:source}},settings:{optimizer:{enabled:true,runs:200},evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object','evm.deployedBytecode.object']}}}};
const output=JSON.parse(solc.compile(JSON.stringify(input)));
for(const e of output.errors??[]) {if(e.severity==='error')throw Error(e.formattedMessage); console.warn(e.formattedMessage);}
const c=output.contracts['BlitzRewards.sol'].BlitzRewards;
fs.writeFileSync('lib/contract.json',JSON.stringify({abi:c.abi,bytecode:'0x'+c.evm.bytecode.object,deployedBytecode:'0x'+c.evm.deployedBytecode.object},null,2));
fs.mkdirSync('public/contracts',{recursive:true});
fs.writeFileSync('public/contracts/BlitzRewards.sol',source);
fs.writeFileSync('public/contracts/compiler-input.json',JSON.stringify(input,null,2));
console.log('Compiled BlitzRewards with Solidity '+solc.version());
