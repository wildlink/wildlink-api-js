import fetch from 'isomorphic-fetch';

import { API_URL_BASE } from './constants';
import { ParsedResponse } from '../types/api';

const parse = async <T>(response: Response): Promise<ParsedResponse<T>> => {
  const json = await response.json();
  const parsedResponse: ParsedResponse<T> = {
    status: response.status,
    ok: response.ok,
    json,
  };
  if (!response.ok) {
    parsedResponse.error = json.ErrorMessage || response.statusText;
  }
  return parsedResponse;
};

const request = async <T>(path: string, options: RequestInit): Promise<T> => {
  try {
    const response = await fetch(`${API_URL_BASE}${path}`, options);
    const parsedResponse = await parse<T>(response);
    if (!parsedResponse.ok) {
      throw new Error(parsedResponse.error);
    }
    return parsedResponse.json;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default request;
