import nacl from "tweetnacl";
import { Buffer } from "buffer";

export const encryptPayload = (payload: any, sharedSecret: Uint8Array) => {
  if (sharedSecret === undefined)
    throw new Error("missing or invalid shared secret");

  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedSecret
  );

  return [nonce, encryptedPayload];
};