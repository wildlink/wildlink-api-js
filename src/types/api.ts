export interface ActiveDomain {
  ID: number;
  Domain: string;
  Merchant: ActiveDomainMerchant;
}

export interface AlternateDomain {
  Domain: string;
  Company: string;
  AlternateMerchantIDs: number[];
}

const PERCENTAGE = 'PERCENTAGE';
const FLAT = 'FLAT';

type RateKindMap = {
  [PERCENTAGE]: undefined;
  [FLAT]: string;
};

export interface ActiveDomainMerchant {
  ID: number;
  Name: string;
  MaxRate: Rate<typeof PERCENTAGE> | Rate<typeof FLAT> | null;
}

export interface Rate<K extends keyof RateKindMap> {
  Kind: K;
  Amount: string;
  Currency?: RateKindMap[K];
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

export interface DeviceMetadata {
  CurrencyCode?: string;
  InstallChannel?: string;
  OS?: string;
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
  SenderID: number;
}

export interface PartnerSender extends Sender {
  TrackingCode: string;
}

enum MerchantImageKind {
  Logo = 'LOGO',
  Featured = 'FEATURED',
  LogoRect = 'LOGORECT',
}

export interface MerchantImage {
  ID: number;
  Kind: MerchantImageKind;
  Ordinal: number;
  ImageID: number;
  URL: string;
  Width: number;
  Height: number;
}

export interface Merchant {
  ID: number;
  Name: string;
  Images: MerchantImage[];
  PaysNewCustomersOnly: boolean;
  ShareAndEarnDisabled: boolean;
  Categories: Category[];
  Score: number;
}

export interface Category {
  ID: number;
  Name: string;
  ParentID: number;
}

export interface FeaturedMerchantCategory {
  Name: string;
  MerchantIDs: Merchant['ID'][];
}

export interface StandDownPolicy {
  Domains: string[];
  Params: string[];
  Serp: string[];
}

export interface RateDetail<K extends keyof RateKindMap> {
  ID: number;
  Name: string;
  Kind: K;
  Currency: RateKindMap[K];
  Amount: string;
}

export interface MerchantRateDetail {
  [MerchantID: string]: (
    | RateDetail<typeof PERCENTAGE>
    | RateDetail<typeof FLAT>
  )[];
}

export enum DeviceXIDSource {
  FCM_REGISTRATION_TOKEN = 'FCM_REGISTRATION_TOKEN',
  ONE_SIGNAL_ID = 'ONE_SIGNAL_ID',
  PARTNER = 'PARTNER',
}

export interface DeviceXIDResponse {
  RowsAffected: number;
}
