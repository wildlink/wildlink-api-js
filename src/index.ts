import promise from 'es6-promise';

import request from './helpers/request';
import { ApiHeaders, Device, Domain, Vanity } from './types/api';

promise.polyfill();

export class WildlinkClient {
  private secret: string;

  private isInit: boolean;

  private deviceToken: string;

  private deviceKey: string;

  private deviceId: number;

  private deviceUuid: string;

  private makeHeaders(): ApiHeaders {
    const headers = {
      'Content-Type': 'application/json',
      'WF-User-Agent': `js-client`,
      'WF-Secret': this.secret,
      'WF-Device-Token': this.deviceToken,
    };
    return headers;
  }

  private async createDevice(): Promise<void> {
    // create or recreate device depending if deviceKey provided
    const body = {
      DeviceKey: this.deviceKey,
    };
    const device = await request<Device>('/v2/device', {
      method: 'POST',
      headers: this.makeHeaders(),
      body: JSON.stringify(body),
    });
    this.deviceToken = device.DeviceToken;
    this.deviceKey = device.DeviceKey;
    this.deviceId = device.DeviceID;
    this.deviceUuid = device.UUID;
  }

  public constructor(secret: string) {
    if (!secret) {
      throw new Error('Missing secret');
    }
    this.secret = secret;
    this.isInit = false;
    this.deviceToken = '';
    this.deviceKey = '';
    this.deviceId = 0;
    this.deviceUuid = '';
  }

  public async init({ deviceToken = '', deviceKey = '' } = {}): Promise<void> {
    if (this.isInit) {
      throw new Error('WildlinkClient should only be initialized once');
    }
    this.isInit = true;
    this.deviceToken = deviceToken;
    this.deviceKey = deviceKey;

    if (deviceToken === '') {
      try {
        await this.createDevice();
      } catch (error) {
        throw error;
      }
    }
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

  public getDeviceUuid(): string {
    return this.deviceUuid;
  }

  public getDomains(): Promise<Domain[]> {
    if (!this.isInit) {
      throw new Error('WildlinkClient has not been initialized yet');
    }
    const domains = request<Domain[]>('/v2/concept/domain', {
      method: 'GET',
      headers: this.makeHeaders(),
    });
    return domains;
  }

  public generateVanity(url: string): Promise<Vanity> {
    if (!this.isInit) {
      throw new Error('WildlinkClient has not been initialized yet');
    }
    if (!url) {
      throw new Error('No URL provided');
    }
    const body = {
      URL: url,
      Placement: 'js-client',
    };
    const vanity = request<Vanity>('/v2/vanity', {
      method: 'POST',
      headers: this.makeHeaders(),
      body: JSON.stringify(body),
    });
    return vanity;
  }
}
