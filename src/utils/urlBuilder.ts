import { URL } from 'url';

export const createURL = (path: string) => {
  const baseUrl = "https://phantom.app/ul/";
  return new URL(path, baseUrl).toString();
};

export const buildUrl = (path: string, params: URLSearchParams, useUniversalLinks: boolean) =>
  `${useUniversalLinks ? "https://phantom.app/ul/" : "phantom://"}v1/${path}?${params.toString()}`;