/** Shared HTTP/result shapes used by the API layer. */
export type ApiError = {
  status: number;
  message: string;
  code?: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
