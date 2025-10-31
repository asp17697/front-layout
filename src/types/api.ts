// Essential API Types

import { AxiosError, AxiosResponse, CancelToken } from "axios";

// Product types
export type ProductType = "product1" | "product2" | "product3";

// Request parameters
export interface RequestParams {
    [key: string]: string | number | Date | CancelToken | string[] | boolean | undefined;
}

// Serialized parameters for query strings
export interface SerializedParams {
    [key: string]: string | number | string[] | boolean;
}

// HTTP Headers
export interface HttpHeaders {
    Accept?: string;
    Authorization?: string;
    "Content-Type"?: string;
    [key: string]: string | undefined;
}

// Progress callback
export type ProgressCallback = (progress: number) => void;

// API Response wrapper
export interface ApiResponse<T = unknown> extends AxiosResponse<T> {
    data: T;
}

// API Error response structure
export interface ApiErrorResponse {
    error?: {
        message?: string;
        detail?: Array<{ key: string; message?: string }> | { message?: string };
    };
}

// API Error
export interface ApiError extends AxiosError<ApiErrorResponse> {
    response?: AxiosResponse<ApiErrorResponse>;
}

// Product URLs
export interface ProductUrls {
    senna: string;
    monza: string;
    kimball: string;
}

// File upload data
export type FileUploadData = FormData;

// Auth token
export type AuthToken = string | null;

// HTTP Status codes (only the ones we use)
export enum HttpStatusCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    INTERNAL_SERVER_ERROR = 500
}

// Common response patterns
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    message?: string;
}

export type ApiResponseData<T = unknown> = SuccessResponse<T> | ErrorResponse;

export interface PaginatedResponse<T> {
    total_count?: number;
    page?: number;
    page_size?: number;
    next_page?: number;
    previous_page?: number;
    data: T[];
    bff?: Record<string, unknown>;
}