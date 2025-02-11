import { REACT_APP_SERVER_BASE_URL } from '../Env';

export interface ResponseData<T> {
  success: boolean;
  error?: ResponseError;
  data?: T;
}

export interface ResponseError {
  name: string;
  message: string | string[];
}

export interface PageData<T, U> {
  hasNext: boolean;
  data: T[];
  nextCursor: U;
}

interface QueryServerProps {
  queryParams?: Record<string, string>;
  method?: string;
  body?: any;
  isJson?: boolean;
  useAuth?: boolean;
  returnFullResponse?: boolean;
}

export async function queryServer<T>(
  path: string,
  props?: QueryServerProps,
): Promise<T | undefined> {
  const {
    queryParams = {},
    method = 'GET',
    body,
    isJson = false,
    useAuth = false,
    returnFullResponse = false,
  } = props ?? {};
  const url = new URL(path, REACT_APP_SERVER_BASE_URL);
  Object.entries(queryParams).forEach(([key, val]) =>
    url.searchParams.append(key, val),
  );

  const fetchParams: RequestInit = {};
  fetchParams.method = method;
  if (body) {
    if (isJson) {
      fetchParams.headers = {
        'Content-Type': 'application/json',
      };
    }
    fetchParams.body = isJson ? JSON.stringify(body) : body;
  }
  if (useAuth) {
    fetchParams.credentials = 'include';
  }
  const res = await fetch(url.toString(), fetchParams);

  // Status 204 is a success with an empty response.
  const json = res.status === 204 ? { success: true } : await res.json();
  if (json.success) {
    return returnFullResponse ? json : json.data;
  } else {
    throw json.error;
  }
}
