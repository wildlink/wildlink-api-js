// api response or error (application or network)
export interface Response<T> {
  status?: number;
  result: T;
  body: string;
}
