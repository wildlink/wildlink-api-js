/* eslint-disable @typescript-eslint/no-empty-function */
/* global describe it */
import 'mocha';
import expect from 'expect';

import { WildlinkClient, ActiveDomain } from '../src';

const SECRET = 'SECRET';
const DEVICE_ID = 0;
const DEVICE_TOKEN = 'DEVICE_TOKEN';
const DEVICE_KEY = 'DEVICE_KEY';
const DEVICE = {
  DeviceID: DEVICE_ID,
  DeviceToken: DEVICE_TOKEN,
  DeviceKey: DEVICE_KEY,
};

describe('WildlinkClient', (): void => {
  describe('constructor', (): void => {
    it('should throw if no secret', (): void => {
      try {
        new WildlinkClient('', 1);
        expect((): void => {}).toBeCalledTimes(0);
      } catch (error) {
        expect(error.result).toBeFalsy();
        expect(typeof error.body).toBe('string');
        expect(error.status).toBe(undefined);
      }
    });
    it('should throw if no application ID', (): void => {
      try {
        new WildlinkClient(SECRET, 0);
        expect((): void => {}).toBeCalledTimes(0);
      } catch (error) {
        expect(error.result).toBeFalsy();
        expect(typeof error.body).toBe('string');
        expect(error.status).toBe(undefined);
      }
    });
  });
  describe('init()', (): void => {
    let client: WildlinkClient;
    it('should reject if ran twice', async (): Promise<void> => {
      try {
        client = new WildlinkClient(SECRET, 1);
        await client.init(DEVICE);
        await client.init();
        expect((): void => {}).toBeCalledTimes(0);
      } catch (error) {
        expect(error.result).toBeFalsy();
        expect(typeof error.body).toBe('string');
      }
    });
    it('should be defined', (): void => {
      expect(client.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  const WLClient = new WildlinkClient(SECRET, 1);
  describe('getDeviceToken()', (): void => {
    it('should be defined', (): void => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('getDeviceKey()', (): void => {
    it('should be defined', (): void => {
      expect(WLClient.getDeviceKey).toBeInstanceOf(Function);
    });
  });
  describe('getDeviceId()', (): void => {
    it('should be defined', (): void => {
      expect(WLClient.getDeviceId).toBeInstanceOf(Function);
    });
  });
  describe('getDomains()', (): void => {
    it('should be defined', (): void => {
      expect(WLClient.getDomains).toBeInstanceOf(Function);
    });
  });
  describe('generateVanity()', (): void => {
    const activeDomain: ActiveDomain = {
      ID: 123,
      Domain: 'test.com',
      Merchant: {
        ID: 321,
        Name: 'Test',
        DefaultRate: null,
        DerivedRate: null,
        MaxRate: null,
      },
    };
    it('should be defined', (): void => {
      expect(WLClient.generateVanity).toBeInstanceOf(Function);
    });
    it('should reject since client is not initialized yet', async (): Promise<
      void
    > => {
      try {
        await WLClient.generateVanity('', activeDomain);
        expect((): void => {}).toBeCalledTimes(0);
      } catch (error) {
        expect(error.result).toBeFalsy();
        expect(typeof error.body).toBe('string');
        expect(error.status).toBe(undefined);
      }
    });
    it('should reject since no URL provided', async (): Promise<void> => {
      try {
        WLClient.init(DEVICE);
        await WLClient.generateVanity('', activeDomain);
        expect((): void => {}).toBeCalledTimes(0);
      } catch (error) {
        expect(error.result).toBeFalsy();
        expect(typeof error.body).toBe('string');
        expect(error.status).toBe(undefined);
      }
    });
    it('should reject since url does not contain ConceptDomain.Value', async (): Promise<
      void
    > => {
      try {
        await WLClient.generateVanity('http://google.com', activeDomain);
        expect((): void => {}).toBeCalledTimes(0);
      } catch (error) {
        expect(error.result).toBeFalsy();
        expect(typeof error.body).toBe('string');
        expect(error.status).toBe(undefined);
      }
    });
  });
});
