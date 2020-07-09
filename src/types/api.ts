export interface ActiveDomain {
  ID: number;
  Domain: string;
  Merchant: Merchant;
}

const PERCENTAGE = 'PERCENTAGE';
const FLAT = 'FLAT';

type RateKindMap = {
  [PERCENTAGE]: undefined;
  [FLAT]: string;
};

export interface Merchant {
  ID: number;
  Name: string;
  DefaultRate: Rate<typeof PERCENTAGE> | Rate<typeof FLAT> | null;
  DerivedRate: Rate<typeof PERCENTAGE> | Rate<typeof FLAT> | null;
  MaxRate: Rate<typeof PERCENTAGE> | Rate<typeof FLAT> | null;
}

export interface Rate<K extends keyof RateKindMap> {
  Kind: K;
  Amount: string;
  Currency: RateKindMap[K];
}

export interface Vanity {
  OriginalURL: string;
  VanityURL: string;
}

export interface Device {
  DeviceToken: string;
  DeviceKey: string;
  DeviceID: number;
}

export interface ApiHeaders {
  [key: string]: string;
}

export interface UrlBaseConfig {
  api?: string;
  data?: string;
  vanity?: string;
}

export interface Sender {
  SenderToken: string;
}
