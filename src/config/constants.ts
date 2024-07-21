import { clusterApiUrl } from '@solana/web3.js';
import * as dotenv from 'dotenv';
dotenv.config();

export const CLUSTER = "devnet";
export const REDIRECT_HOST = "https://eminent-basilisk-faithful.ngrok-free.app";
export const PORT: number = parseInt(process.env.PORT as string, 10) || 3002;
export const BOT_TOKEN = process.env.BOT_TOKEN as string;
export const NETWORK = clusterApiUrl(CLUSTER);