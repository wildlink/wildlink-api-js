import { Response } from '../types/response';

export const ApplicationErrorResponse = (body: string): Response<false> => {
  return {
    result: false,
    body,
  };
};
