export const userConnections = new Map<number, boolean>();
export let sharedSecret: Uint8Array | undefined;
export let session: string | undefined;
export let phantomWalletPublicKey: string | undefined;
export let successTransaction: string | undefined;

export const setSharedSecret = (secret: Uint8Array) => {
  sharedSecret = secret;
};

export const setSession = (newSession: string) => {
  session = newSession;
};

export const setPhantomWalletPublicKey = (publicKey: string) => {
  phantomWalletPublicKey = publicKey;
};

export const setSuccessTransaction = (status: string) => {
  successTransaction = status;
};