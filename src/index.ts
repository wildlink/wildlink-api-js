import request from './helpers/request';
import { ApplicationErrorResponse } from './helpers/error';
import {
  ApiHeaders,
  Device,
  ActiveDomain,
  Vanity,
  UrlBaseConfig,
  Sender,
} from './types/api';
import {
  API_URL_BASE,
  DATA_URL_BASE,
  VANITY_URL_BASE,
} from './helpers/constants';

export class WildlinkClient {
  private applicationId: number;
  private secret: string;
  private isInit: boolean;
  private deviceToken: string;
  private deviceKey: string;
  private deviceId: number;
  private apiUrlBase: string;
  private dataUrlBase: string;
  private vanityUrlBase: string;

  private makeHeaders(): ApiHeaders {
    const headers = {
      'Content-Type': 'application/json',
      'WF-User-Agent': 'js-client',
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

  private async createDevice(): Promise<void> {
    // create or recreate device depending if deviceKey provided
    const body = {
      DeviceKey: this.deviceKey,
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

  public async getDomains(): Promise<ActiveDomain[]> {
    if (!this.isInit) {
      return Promise.reject(
        ApplicationErrorResponse('WildlinkClient has not been initialized yet'),
      );
    }

    const response = await request<ActiveDomain[]>(
      `${this.dataUrlBase}/${this.applicationId}/active-domain/1`,
      { method: 'GET' },
    );

    return response.result;
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

  private generateOfflineVanity(
    url: string,
    activeDomain: ActiveDomain,
  ): Vanity {
    return {
      VanityURL: `${this.vanityUrlBase}/e?
      d=${this.deviceId}&
      c=${activeDomain.ID}&
      url=${encodeURIComponent(url)}&`,
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
}

export { Device, ActiveDomain, Vanity, UrlBaseConfig };
