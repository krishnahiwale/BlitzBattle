import {env} from "cloudflare:workers";
import {handleBattleRequest,type Database} from "../../../lib/server";
export const dynamic="force-dynamic";
export function GET(req:Request){return handleBattleRequest(req,env.DB as unknown as Database)}
export function POST(req:Request){return handleBattleRequest(req,env.DB as unknown as Database)}
