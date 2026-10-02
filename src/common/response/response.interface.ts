export interface IApiBaseResponse {
  success: boolean;
  message?: string;
}

export interface IApiResponse<T> extends IApiBaseResponse {
  data: T | null;
}

export interface IPaginationMetadata {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface IApiPaginated<T> extends IApiBaseResponse {
  data: T[];
  meta: IPaginationMetadata;
}
