import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
fs.mkdirSync('.test-build',{recursive:true});
execFileSync('node_modules/.bin/esbuild',['test/battle.test.ts','--bundle','--platform=node','--format=esm','--outfile=.test-build/battle.test.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['--test','.test-build/battle.test.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['--test','test/contract.test.mjs'],{stdio:'inherit'});
