import { clusterApiUrl, Connection } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import axios from 'axios';
import { Buffer } from "buffer";
import { createURL, buildUrl } from '../utils/urlBuilder';
import { CLUSTER, REDIRECT_HOST } from '../config/constants';
import { encryptPayload } from "../utils/encryption";

const dappKeyPair = nacl.box.keyPair();
let sharedSecret: Uint8Array | undefined;
let session: string | undefined;
let phantomWalletPublicKey: string | undefined;
let successTransaction: string | undefined;

export const connect = async (): Promise<string> => {
  const dappEncryptionSecretKey = bs58.encode(dappKeyPair.secretKey);
  const redirectLink = `${REDIRECT_HOST}/callback?dapp_encryption_secret_key=${dappEncryptionSecretKey}`;

  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
    cluster: CLUSTER,
    app_url: "https://t.me/devlifebot",
    redirect_link: redirectLink,
  });
  console.log("params: ", params);

  const url = buildUrl("connect", params, true);
  console.log("url: ", url);
  return url;
};

export const signTransaction = async (href: string) => {
  const urlSign = href;
  const query = {
    account: phantomWalletPublicKey,
  };
  const headers = {
    "Content-Type": "application/json",
  };
  const response = await axios.post(urlSign, query, { headers });
  const transactionRaw = response.data.transaction;
  const transactionBuffer = Buffer.from(transactionRaw, "base64");
  const serializedTransaction = bs58.encode(transactionBuffer);
  if (session === undefined) throw new Error("missing or invalid session");
  const payload = {
    session,
    transaction: serializedTransaction,
  };
  const redirectLink = encodeURI(`${REDIRECT_HOST}/success`);
  console.log("redirectLink", redirectLink);
  if (!sharedSecret) throw new Error("sharedSecret is undefined");
  const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
    nonce: bs58.encode(nonce),
    redirect_link: redirectLink,
    payload: bs58.encode(encryptedPayload),
  });
  const url = buildUrl("signAndSendTransaction", params, true);
  console.log(url);
  return url;
};