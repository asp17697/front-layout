import axios, { AxiosRequestConfig, AxiosResponse, CancelToken } from "axios";
import qs from "query-string";
import {
    ProductType,
    RequestParams,
    SerializedParams,
    ApiError,
    ProductUrls,
    HttpStatusCode
} from '@/types/api';

// Mock user for development/testing
const mockUser = {
    expired: false,
    access_token: "mock_access_token_12345",
    profile: {
        sub: "mock_user_id",
        name: "Mock User",
        email: "mockuser@example.com"
    }
};

const getHttpHeaders = async (contentType: string | undefined = undefined): Promise<AxiosRequestConfig> => {
    let authToken = null;

    // Use mock user instead of getUser()
    try {
        if (typeof window !== 'undefined') {
            const user = mockUser;
            if (user && !user.expired && user.access_token) {
                authToken = `Bearer ${user.access_token}`;
            }
        }
    } catch (error) {
        console.warn('Failed to get mock user token:', error);
    }

    // Fallback to legacy token for backward compatibility
    if (!authToken && typeof window !== 'undefined') {
        const legacyToken = localStorage.getItem("token");
        if (legacyToken) {
            authToken = `Token ${legacyToken}`;
        }
    }

    const headers: Record<string, string> = {
        "Content-Type": contentType || "application/json",
    };

    if (authToken) {
        headers.Accept = "application/json";
        headers.Authorization = authToken;
    }

    return { headers };
};

export const getPath = (path: string, product: ProductType): string => {
    const product_urls: ProductUrls = {
        product1: process.env.NEXT_PUBLIC_PRODUCT1_API_URL || "",
        product2: process.env.NEXT_PUBLIC_PRODUCT2_API_URL || "",
        product3: process.env.NEXT_PUBLIC_PRODUCT3_API_URL || "",
    }

    return path.startsWith("http://") || path.startsWith("https://")
        ? path
        : `${product_urls[product]}/${path}`;
};

const get = async <T = unknown>(
    path: string,
    params?: {
        [key: string]: string | number | Date | CancelToken | string[] | boolean;
    },
    product: "senna" | "monza" | "kimball" = "senna"
): Promise<AxiosResponse<T>> => {
    const headers = await getHttpHeaders();
    return axios
        .get(getPath(path, product), {
            params,
            ...headers,
            paramsSerializer: {
                serialize: (params: RequestParams) => {
                    const _params: SerializedParams = {};
                    Object.keys(params).forEach((key) => {
                        const value = params[key];
                        if (value instanceof Date) {
                            _params[key] = value.toISOString();
                        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
                            _params[key] = value;
                        }
                    });
                    return qs.stringify(_params, { encode: false });
                },
            },
        })
        .catch(detectError);
};

const getFile = async (path: string, product: "product1" | "product2" | "product3" = "product1"): Promise<AxiosResponse> => {
    const headers = await getHttpHeaders();
    return axios.get(getPath(path, product), { ...headers, responseType: "blob" }).catch(detectError);
};

const uploadFile = async (path: string, data: FormData, product: "product1" | "product2" | "product3" = "product1"): Promise<AxiosResponse> => {
    const headers = await getHttpHeaders("multipart/form-data");
    return axios
        .post(getPath(path, product), data, headers)
        .catch(detectError);
};

const del = async (path: string, product: "product1" | "product2" | "product3" = "product1"): Promise<AxiosResponse> => {
    const headers = await getHttpHeaders();
    return axios.delete(getPath(path, product), headers).catch(detectError);
};

const post = async <T = unknown>(
    path: string,
    data: unknown,
    requestConfig?: AxiosRequestConfig,
    product: "product1" | "product2" | "product3" = "product1"
): Promise<AxiosResponse<T>> => {
    const headers = await getHttpHeaders();
    return axios.post(getPath(path, product), data, { ...requestConfig, ...headers }).catch(detectError);
};


const put = async (path: string, data?: unknown, contentType: string | undefined = undefined, setProgress?: (progress: number) => void, product: "senna" | "monza" | "kimball" = "senna"): Promise<AxiosResponse> => {
    const headers = await getHttpHeaders(contentType);
    const config = {
        ...headers,
        onUploadProgress: (progressEvent: import("axios").AxiosProgressEvent) => {
            const total = progressEvent.total ?? 0;
            const loaded = progressEvent.loaded ?? 0;
            const percent = total > 0
                ? Math.round((loaded * 100) / total)
                : 0;
            if (setProgress) {
                setProgress(percent);
            }
            console.log(`Upload progress: ${percent}%`);
        },
    };
    return axios.put(getPath(path, product), data, config).catch(detectError);
};

const patch = async <T = unknown>(path: string, data?: unknown, product: "product1" | "product2" | "product3" = "product1"): Promise<AxiosResponse> => {
    const headers = await getHttpHeaders();
    return axios.patch(getPath(path, product), data, headers).catch(detectError);
};

const detectMaintenance = (error: ApiError): boolean => {
    const authErrorList = ["maintenance-mode-exception"];
    const errorDetails = error.response?.data?.error?.detail;
    const isMatchedAuthError = Array.isArray(errorDetails) 
        ? errorDetails.some((item) => authErrorList.includes(item?.key))
        : false;

    if (error.response?.status === HttpStatusCode.BAD_REQUEST && isMatchedAuthError) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("token-removed"));
        return true;
    }

    return false;
};

const detectError = (error: ApiError): Promise<never> => {
    if (detectMaintenance(error)) {
        window.location.href = "/maintenance";
        return Promise.reject(error);
    }

    /**
     * define user permission role
     * don't remove token when get permission error
     */
    // const authErrorList = ["account-temp-locked", "not-validated-acc-secured"];
    // const isMatchedAuthError =
    //     error.response?.data?.error?.detail?.some((item: { key: string; }) => authErrorList.includes(item?.key)) ||
    //     error.response?.data?.detail?.toLowerCase().includes("invalid token") ||
    //     error.response?.data?.detail?.toLowerCase().includes("the token is expired") ||
    //     error.response?.statusText == "Unauthorized";

    if (error.response?.status === 401) {
        // Handle both legacy token and OIDC token expiration
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("token-removed"));

        // For OIDC, redirect to login if token is expired
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth/callback') {
            // Store current URL for redirect after login
            sessionStorage.setItem('returnUrl', window.location.pathname);
            window.location.href = '/auth/login';
        }
    }

    console.log("getting an error");

    return Promise.reject(error);
};

const getResponseError = (err: ApiError): string => {
    if (err.response?.status === HttpStatusCode.INTERNAL_SERVER_ERROR)
        return "We're sorry, but there was an error processing your request. Please try again later.";

    if (err.response?.status === HttpStatusCode.UNAUTHORIZED) return "Request user don't have access permission.";

    const errorData = err.response?.data?.error;
    if (errorData?.message) {
        return errorData.message;
    }
    if (errorData?.detail && typeof errorData.detail === 'object' && 'message' in errorData.detail) {
        return (errorData.detail as { message?: string }).message || 'Unknown error occurred';
    }
    return 'Unknown error occurred';
};

export { del, get, getFile, getResponseError, patch, post, put, uploadFile };