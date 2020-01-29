import fetch from 'isomorphic-fetch';

import { Response as WLResponse } from '../types/response';

const parse = async <T>(response: Response): Promise<WLResponse<T>> => {
  let result;
  const body = await response.text();

  try {
    result = JSON.parse(body);
  } catch (error) {
    result = false;
  }

  const parsedResponse: WLResponse<T> = {
    status: response.status,
    result,
    body,
  };

  if (!response.ok) {
    return Promise.reject(parsedResponse);
  }

  return parsedResponse;
};

const request = async <T>(
  url: string,
  options: RequestInit,
): Promise<WLResponse<T>> => {
  const response = await fetch(url, options);
  return await parse<T>(response);
};

export default request;
