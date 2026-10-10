import type {PackId,Question} from "./types";
const BANK:Record<PackId,Question[]>={
 ai:[
 {prompt:"An AI answer sounds confident. What should you do before using it as a fact?",options:["Check a reliable source","Make it longer","Ask for more confidence","Trust fluent text"],correct:0,explanation:"Fluent text can still contain mistakes. Verify important claims against reliable evidence.",concept:"AI literacy"},
 {prompt:"What does retrieval-augmented generation (RAG) add to an AI workflow?",options:["Relevant retrieved information","Guaranteed correct answers","Faster internet","A replacement for every database"],correct:0,explanation:"RAG retrieves relevant material as context for generation. The output still needs evaluation.",concept:"RAG"},
 {prompt:"Which prompt gives an assistant the clearest task?",options:["Summarize this article in three bullets for a beginner","Do something useful","Be very smart","Make everything perfect"],correct:0,explanation:"A concrete input, task, audience and output format reduce ambiguity.",concept:"Prompt design"},
 {prompt:"A model excels on training data but struggles on new data. What is a likely issue?",options:["Overfitting","Perfect generalization","Too much test accuracy","A correct SQL join"],correct:0,explanation:"Overfitting means learning training-specific patterns that do not generalize well.",concept:"Generalization"},
 {prompt:"How should you compare two AI assistants for a real use case?",options:["Use representative tasks and defined criteria","Compare only their names","Pick the longest responses","Pick the most confident answers"],correct:0,explanation:"Evaluate representative tasks using criteria such as correctness, usefulness and instruction following.",concept:"Evaluation"},
 ],
 web3:[
 {prompt:"What should you keep private when using a blockchain wallet?",options:["Your seed phrase and private key","Your public address","A public transaction hash","The network name"],correct:0,explanation:"The private key or seed phrase controls your wallet. Public addresses and transaction hashes are meant to be shared.",concept:"Wallet ownership"},
 {prompt:"In BlitzBattle, what can the reward contract enforce?",options:["Funded allocations and one claim per winner","The truth of every answer","The quality of every question","Who is the smartest person"],correct:0,explanation:"The server scores the quiz. The contract enforces the host-recorded allocations and claim rules.",concept:"Trust boundaries"},
 {prompt:"What does EVM compatibility help developers reuse?",options:["Ethereum-style contracts and development tools","A guaranteed profitable token","Every offchain database","A wallet's private key"],correct:0,explanation:"Monad's EVM compatibility supports familiar Solidity contracts and Ethereum development tools.",concept:"EVM"},
 {prompt:"Why show a confirmed funded prize pool before a battle?",options:["Players can verify that the reward budget exists","It proves the host can never make a mistake","It makes internet speeds equal","It replaces the question bank"],correct:0,explanation:"A funding receipt makes the budget visible. It does not verify quiz scoring or every host decision.",concept:"Escrow"},
 {prompt:"What do rewards in this app use?",options:["Monad Testnet MON with no cash value","Guaranteed cash prizes","A fixed rupee-to-MON rate","Mainnet funds from every player"],correct:0,explanation:"This app only supports Monad Testnet rewards. Joining is free; testnet tokens are for testing.",concept:"Testnet"},
 ],
 data:[
 {prompt:"In SQL, which clause filters groups after aggregation?",options:["HAVING","ORDER BY","SELECT DISTINCT","LIMIT"],correct:0,explanation:"HAVING filters aggregated groups. WHERE filters individual rows before grouping.",concept:"SQL aggregation"},
 {prompt:"Why fit a scaler on training data rather than the entire dataset?",options:["To avoid leaking test information into training","To make every value positive","To guarantee 100% accuracy","To remove all missing values"],correct:0,explanation:"Preprocessing learns from training data, then transforms validation or test data with the fitted parameters.",concept:"Data leakage"},
 {prompt:"Which pandas operation reads a CSV into a DataFrame?",options:["pd.read_csv(...)","pd.to_csv(...)","pd.read_model(...)","pd.select_sql(...)"],correct:0,explanation:"pandas.read_csv reads CSV data. DataFrame.to_csv writes a DataFrame to a CSV file.",concept:"Python basics"},
 {prompt:"Which task is a classification problem?",options:["Predict whether a ticket is resolved or unresolved","Predict tomorrow's temperature","Estimate a house price","Calculate an average"],correct:0,explanation:"Classification predicts a category. Regression predicts a numerical outcome.",concept:"ML tasks"},
 {prompt:"A dataset has extreme outliers. Which summary is usually less sensitive to them?",options:["Median","Arithmetic mean","Maximum","Range"],correct:0,explanation:"The median depends on ordering and is usually more robust to extreme values than the arithmetic mean.",concept:"Robust statistics"},
 ]
};
export function makeQuestions(pack:PackId):Question[]{return BANK[pack].map(q=>{
 const shuffled=q.options.map((text,i)=>({text,i}));
 for(let i=shuffled.length-1;i>0;i--){const a=new Uint32Array(1);crypto.getRandomValues(a);const j=a[0]%(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 return {...q,options:shuffled.map(x=>x.text),correct:shuffled.findIndex(x=>x.i===q.correct)};
});}
