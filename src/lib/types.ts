import { PublicKey, Transaction, SendOptions } from '@solana/web3.js';

type DisplayEncoding = 'utf8' | 'hex';

type PhantomEvent = 'connect' | 'disconnect' | 'accountChanged';

type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signAndSendTransaction'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage';

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

export interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signAndSendTransaction: (
    transaction: Transaction,
    opts?: SendOptions
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

export type Status = 'success' | 'warning' | 'error' | 'info';

export interface TLog {
  status: Status;
  method?: PhantomRequestMethod | Extract<PhantomEvent, 'accountChanged'>;
  message: string;
  messageTwo?: string;
}

export interface ActionError {
    message: string;
}
export interface LinkedAction {
    href: string;
    label: string;
    parameters?: [ActionParameter];
}
   
export interface ActionParameter {
    name: string;
    label?: string;
    required?: boolean;
}
export interface ActionGetResponse {
    icon: string;
    title: string;
    description: string;
    label: string;
    disabled?: boolean;
    links?: {
      actions: LinkedAction[];
    };
    error?: ActionError;
}


type Action = {
  pathPattern: string;
  apiPath: string;
};

export type ActionsJsonConfig = {
  rules: Action[];
};

export class ActionsURLMapper {
  private config: ActionsJsonConfig;

  constructor(config: ActionsJsonConfig) {
    this.config = config;
  }

  public mapUrl(url: string | URL): string | null {
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    const queryParams = urlObj.search; 
    for (const action of this.config.rules) {
      if (this.isExactMatch(action.pathPattern, urlObj)) {
        return `${action.apiPath}${queryParams}`;
      }

      const match = this.matchPattern(action.pathPattern, urlObj);

      if (match) {
        return this.constructMappedUrl(
          action.apiPath,
          match,
          queryParams,
          urlObj.origin,
        );
      }
    }

    return null;
  }

  private isExactMatch(pattern: string, urlObj: URL): boolean {
    return pattern === `${urlObj.origin}${urlObj.pathname}`;
  }

  private matchPattern(pattern: string, urlObj: URL): RegExpMatchArray | null {
    const fullPattern = new RegExp(
      `^${pattern.replace(/\*\*/g, '(.*)').replace(/\/(\*)/g, '/([^/]+)')}$`,
    );

    const urlToMatch = pattern.startsWith('http')
      ? urlObj.toString()
      : urlObj.pathname;
    return urlToMatch.match(fullPattern);
  }

  private constructMappedUrl(
    apiPath: string,
    match: RegExpMatchArray,
    queryParams: string,
    origin: string,
  ): string {
    let mappedPath = apiPath;
    match.slice(1).forEach((group) => {
      mappedPath = mappedPath.replace(/\*+/, group);
    });

    if (apiPath.startsWith('http')) {
      const mappedUrl = new URL(mappedPath);
      return `${mappedUrl.origin}${mappedUrl.pathname}${queryParams}`;
    }

    return `${origin}${mappedPath}${queryParams}`;
  }
}