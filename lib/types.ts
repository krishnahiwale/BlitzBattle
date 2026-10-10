export type PackId = "ai" | "web3" | "data";
export type Question = {prompt:string;options:string[];correct:number;explanation:string;concept:string};
export type Phase = "waiting" | "countdown" | "question" | "reveal" | "finished" | "cancelled";
export type Player = {id:string;name:string;bot:boolean;wallet:string|null;score:number;correct:number;claimTx:string|null};
export type Recap = Question & {choice:number|null};
export type Snapshot = {
 code:string;title:string;sponsor:string;pack:PackId;mode:"practice"|"monad";seconds:number;phase:Phase;index:number;total:number;serverNow:number;phaseEndsAt:number;startedAt:number|null;createdAt:number;
 question:{prompt:string;options:string[];concept:string;correct?:number;explanation?:string}|null;
 leaderboard:Player[];me:Player|null;answer:number|null;answered:number;host:boolean;winners:Player[];recap:Recap[];analytics:{concept:string;correct:number;total:number}[];poolWei:string;escrow:string|null;fundingTx:string|null;finalizedTx:string|null;finalizeBefore:number|null;claimUntil:number|null;refundTx:string|null;
};
export type RoomSummary = {code:string;title:string;sponsor:string;pack:PackId;mode:string;status:string;created_at:number;started_at:number|null;seconds:number;players:number;pool_wei:string;escrow:string|null};
export const PACKS: {id:PackId;name:string;subtitle:string;level:string;color:string;concepts:string[]}[] = [
 {id:"ai",name:"AI, unlocked",subtitle:"Think beyond the prompt.",level:"Beginner",color:"purple",concepts:["LLMs","RAG","Evaluation"]},
 {id:"web3",name:"Web3 first moves",subtitle:"Wallets, contracts & Monad.",level:"Beginner",color:"green",concepts:["Wallets","Escrow","EVM"]},
 {id:"data",name:"Data brain sprint",subtitle:"Put your data instincts to work.",level:"Intermediate",color:"orange",concepts:["Python","SQL","ML"]},
];
