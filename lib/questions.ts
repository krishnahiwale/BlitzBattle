// This module is server-only in application imports; answers never enter the client bundle.
export const packs = {
 ai: {name:'AI & Machine Learning', tag:'Think like a machine', icon:'brain', color:'purple', description:'From training data to neural networks. Put your AI instincts to the test.', questions:[
 {text:'A model scores 99% on training data, but only 61% on new data. What is the likely problem?', options:['Underfitting','Overfitting','Perfect generalization','Data normalization'], answer:1, topic:'Generalization', explanation:'Overfitting means the model learns the training examples too closely and fails to generalize to unseen data.'},
 {text:'Which task is an example of unsupervised learning?', options:['Predicting a labeled spam message','Estimating house prices','Grouping customers without labels','Recognizing labeled handwritten digits'],answer:2,topic:'Learning types',explanation:'Clustering finds patterns and groups in data without needing target labels.'},
 {text:'Why should you split data before fitting a scaler?',options:['To prevent data leakage','To increase the dataset size','To remove every outlier','To guarantee 100% accuracy'],answer:0,topic:'Data leakage',explanation:'Fit preprocessing only on training data so information from the test set does not influence the model.'},
 {text:'What does retrieval add to a RAG application?', options:['Automatic model retraining','Guaranteed correct answers','A larger neural network','Relevant external context'],answer:3,topic:'RAG',explanation:'Retrieval supplies relevant external documents as context. The model can still make mistakes.'},
 {text:'For a rare positive class, which metric measures how many actual positives were found?',options:['Accuracy','Recall','Specificity','Mean squared error'],answer:1,topic:'Evaluation',explanation:'Recall is true positives divided by all actual positives: TP / (TP + FN).'}
 ]},
 web3:{name:'Web3 & Monad',tag:'Your onchain origin story',icon:'diamond',color:'green',description:'Wallets, smart contracts, and the foundations of the decentralized web.',questions:[
 {text:'What should you NEVER share when connecting a wallet to a dApp?',options:['Your public address','Your transaction hash','Your recovery phrase','Your preferred network'],answer:2,topic:'Wallet security',explanation:'A recovery phrase controls your wallet. A legitimate dApp never needs it.'},
 {text:'What is a smart contract?',options:['A program executed on a blockchain','A password manager','A social agreement only','A cryptocurrency price chart'],answer:0,topic:'Smart contracts',explanation:'Smart contracts are programs whose state changes are validated by the blockchain network.'},
 {text:'What can a transaction hash help you verify?',options:['Someone’s real-world identity','A transaction’s recorded status and details','That a project is risk-free','A wallet’s recovery phrase'],answer:1,topic:'Verification',explanation:'An explorer can use the hash to show transaction status, sender, destination, and recorded events.'},
 {text:'Why use testnet tokens during a hackathon?',options:['They guarantee profits','They are always redeemable for cash','They remove all software bugs','They let you test without using mainnet funds'],answer:3,topic:'Testnets',explanation:'Testnets are development environments. Test tokens are used for testing and should not be presented as real earnings.'},
 {text:'Why is EVM compatibility useful to Solidity developers?',options:['No testing is needed','Private keys become public','Existing Ethereum tools and contracts can be adapted','Every transaction becomes free'],answer:2,topic:'EVM',explanation:'EVM compatibility allows developers to reuse familiar Solidity workflows and many Ethereum tools, while checking network differences.'}
 ]},
 python:{name:'Python & Data',tag:'Small code. Big brain.',icon:'code',color:'orange',description:'Practical Python, clean data, and SQL essentials for curious builders.',questions:[
 {text:'What is the result of len({1, 1, 2, 3}) in Python?',options:['4','3','2','An error'],answer:1,topic:'Sets',explanation:'A set contains unique elements. The duplicate 1 is stored only once.'},
 {text:'Which SQL clause filters groups after aggregation?',options:['WHERE','ORDER BY','HAVING','LIMIT'],answer:2,topic:'SQL aggregation',explanation:'HAVING filters aggregate groups; WHERE filters individual rows before grouping.'},
 {text:'What does a pandas DataFrame represent?',options:['A two-dimensional labeled table','Only a single number','A compiled Python module','An unchangeable string'],answer:0,topic:'Pandas',explanation:'A DataFrame is a labeled two-dimensional structure with rows and columns.'},
 {text:'Which plot best reveals the relationship between two numeric variables?',options:['Pie chart','Single stacked bar','Word cloud','Scatter plot'],answer:3,topic:'Visualization',explanation:'A scatter plot displays paired numeric observations to reveal patterns, relationships, and outliers.'},
 {text:'What does a LEFT JOIN preserve?',options:['Only matched right-table rows','Every row from the left table','Only unmatched rows','Every possible pair of rows'],answer:1,topic:'SQL joins',explanation:'LEFT JOIN keeps every left-table row and adds matching right-table values, or NULL when no match exists.'}
 ]}
} as const;
export type PackId = keyof typeof packs;
export const QUESTION_MS = 20000;
export const COUNTDOWN_MS = 4000;
export function position(started:number|null, now=Date.now()) { return started===null ? -1 : Math.floor((now-started)/QUESTION_MS); }
export function score(correct:boolean, remaining:number) { return correct ? 100 + Math.max(0, Math.min(50,Math.floor(remaining/QUESTION_MS*50))) : 0; }
export function catalog(){return Object.entries(packs).map(([id,p])=>({id,name:p.name,tag:p.tag,icon:p.icon,color:p.color,description:p.description,count:p.questions.length}));}
