import type {Phase} from "./types";
export const INTRO_MS=5000;
export const REVEAL_MS=5000;
export function phaseAt(status:string,startedAt:number|null,seconds:number,total:number,now:number):{phase:Phase;index:number;endsAt:number}{
 if(status==="cancelled")return {phase:"cancelled",index:0,endsAt:0};
 if(!startedAt)return {phase:"waiting",index:0,endsAt:0};
 const begin=startedAt+INTRO_MS;
 if(now<begin)return {phase:"countdown",index:0,endsAt:begin};
 const span=seconds*1000+REVEAL_MS;
 const index=Math.floor((now-begin)/span);
 if(index>=total)return {phase:"finished",index:total-1,endsAt:begin+total*span};
 const questionEnd=begin+index*span+seconds*1000;
 return {phase:now<questionEnd?"question":"reveal",index,endsAt:now<questionEnd?questionEnd:begin+(index+1)*span};
}
export function eligibleWinners<T extends {wallet:string|null;bot:boolean;score:number}>(players:T[]):T[]{
 const eligible=players.filter(x=>x.wallet&&!x.bot);
 if(!eligible.length)return [];
 const max=Math.max(...eligible.map(x=>x.score));
 return eligible.filter(x=>x.score===max);
}
