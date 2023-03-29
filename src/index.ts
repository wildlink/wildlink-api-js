import request from './helpers/request';
import { ApplicationErrorResponse } from './helpers/error';
import {
  ApiHeaders,
  Device,
  ActiveDomain,
  AlternateDomain,
  Vanity,
  UrlBaseConfig,
  Sender,
  PartnerSender,
  ActiveDomainMerchant,
  Merchant,
  Category,
  MerchantImage,
  FeaturedMerchantCategory,
  MerchantRateDetail,
  StandDownPolicy,
  DeviceXIDSource,
  DeviceXIDResponse,
  DeviceMetadata,
} from './types/api';
import {
  API_URL_BASE,
  DATA_URL_BASE,
  VANITY_URL_BASE,
} from './helpers/constants';

// we track the version this way because importing the package.json causes issues
export const VERSION = '3.4.1';

export class WildlinkClient {
  protected applicationId: number;
  protected secret: string;
  protected isInit: boolean;
  protected deviceToken: string;
  protected deviceKey: string;
  protected deviceId: number;
  protected apiUrlBase: string;
  protected dataUrlBase: string;
  protected vanityUrlBase: string;
  protected currencyCode?: string;
  protected installChannel?: string;
  protected os?: string;

  protected makeHeaders(): ApiHeaders {
    const headers = {
      'Content-Type': 'application/json',
      'WF-User-Agent': `js-client-${VERSION}`,
      'WF-Secret': this.secret,
      'WF-Device-Token': this.deviceToken,
      'WF-App-ID': String(this.applicationId),
    };
    return headers;
  }

  public constructor(
    secret: string,
    applicationId: number,
    {
      api = API_URL_BASE,
      data = DATA_URL_BASE,
      vanity = VANITY_URL_BASE,
    }: UrlBaseConfig = {
      api: API_URL_BASE,
      data: DATA_URL_BASE,
      vanity: VANITY_URL_BASE,
    },
  ) {
    if (!secret) {
      throw ApplicationErrorResponse('Missing secret');
    }
    if (!applicationId) {
      throw ApplicationErrorResponse('Missing application ID');
    }
    this.applicationId = applicationId;
    this.secret = secret;
    this.isInit = false;
    this.deviceToken = '';
    this.deviceKey = '';
    this.deviceId = 0;
    this.apiUrlBase = api;
    this.dataUrlBase = data;
    this.vanityUrlBase = vanity;
  }

  public async init(
    { DeviceID = 0, DeviceToken = '', DeviceKey = '' }: Device = {
      DeviceID: 0,
      DeviceToken: '',
      DeviceKey: '',
    },
    deviceMetaData: DeviceMetadata = {},
  ): Promise<void> {
    if (this.isInit) {
      return Promise.reject(
        ApplicationErrorResponse(
          'WildlinkClient should only be initialized once',
        ),
      );
    }
    this.deviceId = DeviceID;
    this.deviceToken = DeviceToken;
    this.deviceKey = DeviceKey;
    this.currencyCode = deviceMetaData?.CurrencyCode;
    this.installChannel = deviceMetaData?.InstallChannel;
    this.os = deviceMetaData?.OS;
    if (DeviceToken === '') {
      try {
        await this.createDevice();
      } catch (error) {
        throw error;
      }
    }

    this.isInit = true;
  }

  public getDeviceToken(): string {
    return this.deviceToken;
  }

  public getDeviceKey(): string {
    return this.deviceKey;
  }

  public getDeviceId(): number {
    return this.deviceId;
  }

  public getDevice(): Device {
    if (!this.init) {
      throw ApplicationErrorResponse(
        'WildlinkClient has not been initialized yet',
      );
    }

    return {
      DeviceID: this.getDeviceId(),
      DeviceToken: this.getDeviceToken(),
      DeviceKey: this.getDeviceKey(),
    };
  }

  protected async createDevice(): Promise<void> {
    // create or recreate device depending if deviceKey provided
    const body = {
      DeviceKey: this.deviceKey,
      Currency: this.currencyCode,
      InstallChannel: this.installChannel,
      OS: this.os,
    };
    try {
      const response = await request<Device>(`${this.apiUrlBase}/v2/device`, {
        method: 'POST',
        headers: this.makeHeaders(),
        body: JSON.stringify(body),
      });

      this.deviceToken = response.result.DeviceToken;
      this.deviceKey = response.result.DeviceKey;
      this.deviceId = response.result.DeviceID;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async updateDeviceXID(
    source: DeviceXIDSource,
    value: string,
  ): Promise<DeviceXIDResponse> {
    const body = {
      Source: source,
      Value: value,
    };
    try {
      const response = await request<DeviceXIDResponse>(
        `${this.apiUrlBase}/v2/device/xid`,
        {
          method: 'POST',
          headers: this.makeHeaders(),
          body: JSON.stringify(body),
        },
      );
      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async getDomains(): Promise<ActiveDomain[]> {
    try {
      const response = await request<ActiveDomain[]>(
        `${this.dataUrlBase}/${this.applicationId}/active-domain/1`,
        { method: 'GET' },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }
  public async getAlternates(): Promise<AlternateDomain[]> {
    try {
      const response = await request<AlternateDomain[]>(
        `${this.dataUrlBase}/${this.applicationId}/alternative-domains/1`,
        { method: 'GET' },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async getFeaturedMerchantCategories(): Promise<
    FeaturedMerchantCategory[]
  > {
    try {
      const response = await request<FeaturedMerchantCategory[]>(
        `${this.dataUrlBase}/${this.applicationId}/featured-merchant/1`,
        { method: 'GET' },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async getStandDownPolicy(): Promise<StandDownPolicy> {
    try {
      const response = await request<StandDownPolicy>(
        `${this.dataUrlBase}/${this.applicationId}/stand-down-policy/1`,
        { method: 'GET' },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async getMerchants(): Promise<Merchant[]> {
    try {
      const response = await request<Merchant[]>(
        `${this.dataUrlBase}/${this.applicationId}/merchant/1`,
        { method: 'GET' },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async getMerchantRateDetails(
    lang?: string,
  ): Promise<MerchantRateDetail> {
    try {
      const url = new URL(
        `${this.dataUrlBase}/${this.applicationId}/merchant-rate/1`,
      );
      if (lang) {
        url.searchParams.append('translation_language', lang);
      }
      const response = await request<MerchantRateDetail>(url.toString(), {
        method: 'GET',
      });

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async generateVanity(
    url: string,
    activeDomain: ActiveDomain,
    placementDetail?: string,
  ): Promise<Vanity> {
    if (!this.isInit) {
      return Promise.reject(
        ApplicationErrorResponse('WildlinkClient has not been initialized yet'),
      );
    }

    if (!url) {
      return Promise.reject(ApplicationErrorResponse('No URL provided'));
    }

    if (!activeDomain) {
      return Promise.reject(
        ApplicationErrorResponse('No ActiveDomain provided'),
      );
    }

    if (url.indexOf(activeDomain.Domain) < 0) {
      return Promise.reject(
        ApplicationErrorResponse('URL does not match ActiveDomain'),
      );
    }

    let Placement = 'js-client';

    if (placementDetail) {
      Placement = `${Placement}_${placementDetail}`;
    }

    const body = {
      URL: url,
      Placement,
    };

    try {
      const response = await request<Vanity>(`${this.apiUrlBase}/v2/vanity`, {
        method: 'POST',
        headers: this.makeHeaders(),
        body: JSON.stringify(body),
      });

      return response.result;
    } catch (reason) {
      if (reason.status && reason.status >= 500) {
        return this.generateOfflineVanity(url, activeDomain);
      } else {
        return Promise.reject(reason);
      }
    }
  }

  public generateOfflineVanity(
    url: string,
    activeDomain: ActiveDomain,
  ): Vanity {
    return {
      VanityURL: `${this.vanityUrlBase}/e?d=${this.deviceId}&c=${
        activeDomain.ID
      }&url=${encodeURI(url)}`,
      OriginalURL: url,
    };
  }

  public async makeSenderFromPaypal(code: string): Promise<Sender> {
    if (!this.isInit) {
      return Promise.reject(
        ApplicationErrorResponse('WildlinkClient has not been initialized yet'),
      );
    }

    if (!code) {
      return Promise.reject(ApplicationErrorResponse('No code provided'));
    }

    const body = {
      code,
    };

    try {
      const response = await request<Sender>(
        `${this.apiUrlBase}/v2/sender/oauth/paypal`,
        {
          method: 'POST',
          headers: this.makeHeaders(),
          body: JSON.stringify(body),
        },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async makeSenderFromGoogle(code: string): Promise<Sender> {
    if (!this.isInit) {
      return Promise.reject(
        ApplicationErrorResponse('WildlinkClient has not been initialized yet'),
      );
    }

    if (!code) {
      return Promise.reject(ApplicationErrorResponse('No code provided'));
    }

    const body = {
      code,
    };

    try {
      const response = await request<Sender>(
        `${this.apiUrlBase}/v2/sender/oauth/google`,
        {
          method: 'POST',
          headers: this.makeHeaders(),
          body: JSON.stringify(body),
        },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async makeSenderFromApple(code: string): Promise<Sender> {
    if (!this.isInit) {
      return Promise.reject(
        ApplicationErrorResponse('WildlinkClient has not been initialized yet'),
      );
    }

    if (!code) {
      return Promise.reject(ApplicationErrorResponse('No code provided'));
    }

    const body = {
      code,
    };

    try {
      const response = await request<Sender>(
        `${this.apiUrlBase}/v2/sender/oauth/apple`,
        {
          method: 'POST',
          headers: this.makeHeaders(),
          body: JSON.stringify(body),
        },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async makeSenderFromSender(code: string): Promise<Sender> {
    if (!this.isInit) {
      return Promise.reject(
        ApplicationErrorResponse('WildlinkClient has not been initialized yet'),
      );
    }

    if (!code) {
      return Promise.reject(ApplicationErrorResponse('No code provided'));
    }

    const body = {
      code,
    };

    try {
      const response = await request<Sender>(
        `${this.apiUrlBase}/v2/sender/oauth/sender`,
        {
          method: 'POST',
          headers: this.makeHeaders(),
          body: JSON.stringify(body),
        },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }

  public async makeSenderFromPartner(code: string): Promise<PartnerSender> {
    if (!this.isInit) {
      return Promise.reject(
        ApplicationErrorResponse('WildlinkClient has not been initialized yet'),
      );
    }

    if (!code) {
      return Promise.reject(ApplicationErrorResponse('No code provided'));
    }

    const body = {
      code,
    };

    try {
      const response = await request<PartnerSender>(
        `${this.apiUrlBase}/v2/sender/oauth/partner`,
        {
          method: 'POST',
          headers: this.makeHeaders(),
          body: JSON.stringify(body),
        },
      );

      return response.result;
    } catch (reason) {
      return Promise.reject(reason);
    }
  }
}

export {
  Device,
  ActiveDomain,
  AlternateDomain,
  Vanity,
  UrlBaseConfig,
  ActiveDomainMerchant,
  Merchant,
  Category,
  MerchantImage,
  FeaturedMerchantCategory,
  Sender,
  PartnerSender,
  StandDownPolicy,
  MerchantRateDetail,
  DeviceXIDSource,
  DeviceXIDResponse,
  DeviceMetadata,
  request,
  ApplicationErrorResponse,
};
