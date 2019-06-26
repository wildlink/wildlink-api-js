/* global describe it */
import 'mocha';
import expect from 'expect';

import { WildlinkClient } from '../src';

describe('WildlinkClient', () => {
  const WLClient = new WildlinkClient('SECRET');
  describe('getDeviceToken()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('getDeviceKey()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('getDeviceId()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('getDeviceUuid()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('init()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('makeHeaders()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('createDevice()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('getDomains()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
  describe('generateVanity()', () => {
    it('should be defined', () => {
      expect(WLClient.getDeviceToken).toBeInstanceOf(Function);
    });
  });
});
