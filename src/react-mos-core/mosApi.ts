const JSONparse = (text: string | null): unknown => {
    try {
        return text ? JSON.parse(text) : {};
    } catch (error) {
        return {};
    }
};

const api = async <T>(
    input: string,
    options?: {
        body?: unknown | null;
        cache?: boolean;
        headers?: HeadersInit;
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        getHeaders?: (headers: Headers, json: T) => void;
    }
): Promise<T> => {
    const method = options?.method ?? 'GET';

    if (options?.cache === true) {
        if (method === 'GET') {
            const text = window.sessionStorage.getItem(input);
            if (text && text !== '') {
                return JSONparse(text) as T;
            }
        } else {
            window.sessionStorage.removeItem(input);
        }
    }

    const fetchPromise = await fetch(input, {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
            ...(options?.headers && options.headers),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
    }).then(async (response) => {
        if (response.status === 403) {
            window.sessionStorage.clear();
            window.location.href = '/forbidden';
        }

        const json = JSONparse(await response.text());

        if (options?.cache === true && method === 'GET') {
            window.sessionStorage.setItem(input, JSON.stringify(json));
        }

        if (response.status < 200 || response.status >= 300) {
            throw json;
        }

        if (options?.getHeaders) {
            options.getHeaders(response.headers, json as T);
        }

        return json as T;
    });

    return new Promise(
        (resolve: (value: T) => void, reject: (reason?: unknown) => void) => {
            try {
                resolve(fetchPromise);
            } catch (error) {
                reject(error);
            }
        }
    );
};

const mosApi = async <T>(
    input: string,
    options?: {
        body?: unknown | null;
        cache?: boolean;
        headers?: HeadersInit;
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        getHeaders?: (headers: Headers, json: T) => void;
    }
): Promise<T> => {
    // -------------------------------------------------------------------------
    // api url based on react env or domain name
    // -------------------------------------------------------------------------
    if (!window.localStorage.getItem('env')) {
        const getEnvByDomain = (): string => {
            const { host } = window.location;
            if (host.indexOf('mos.spotme') !== -1) return 'prd';
            if (host.indexOf('mos-stagin') !== -1) return 'staging';
            if (host.indexOf('mos-sandbo') !== -1) return 'sandbox';
            if (host.indexOf('mos-dev-k8') !== -1) return 'dev-k8s';
            if (host.indexOf('mos-dev.sp') !== -1) return 'dev';
            return 'dev';
        };
        const env = process.env.REACT_APP_ENV ?? getEnvByDomain();
        window.localStorage.setItem('env', env);
    }
    const env = window.localStorage.getItem('env');
    const url = `https://mos-api-${env}.spotmetrics.com`;

    // -------------------------------------------------------------------------
    // add on uri the common query params (mallId and storeId)
    // -------------------------------------------------------------------------
    const setParamsFromStorage = (current: string, params: string[]) => {
        let value = current;
        params.forEach((param) => {
            if (current.indexOf(param) === -1) {
                const item = window.localStorage.getItem(param);
                if (item) {
                    const symbol = value.indexOf('?') === -1 ? '?' : '&';
                    value += `${symbol + param}=${item}`;
                }
            }
        });
        return value;
    };
    const uri = setParamsFromStorage(input, ['mallId', 'storeId']);

    // -------------------------------------------------------------------------
    // x-access-token on header
    // -------------------------------------------------------------------------
    return api<T>(url + uri, {
        headers: {
            'x-access-token':
                window.localStorage.getItem('x-access-token') ?? '',
        },
        ...options,
    });
};

type Permissions = {
    id: number;
    name: string;
    permissions: string[];
    stores?: {
        id: number;
        name: string;
    }[];
}[];

const authentication = (
    email: string,
    password: string
): Promise<{ name: string; area: string }> =>
    mosApi<{ name: string; area: string }>('/mos/v1/auth-api/authentication', {
        method: 'POST',
        body: { email, password },
        getHeaders: async (headers, response) => {
            // -----------------------------------------------------------------
            // set x-access-token
            // -----------------------------------------------------------------
            const token = headers.get('x-access-token') as string;
            window.localStorage.setItem('x-access-token', token);

            // -----------------------------------------------------------------
            // set employee.name
            // -----------------------------------------------------------------
            window.localStorage.setItem('employeeName', response.name);

            // -----------------------------------------------------------------
            // set permissions
            // -----------------------------------------------------------------
            // (temp)
            type OldPermissions = {
                malls: {
                    id: number;
                    name: string;
                    role: {
                        id: number;
                        name: string;
                        permissions: {
                            id: number;
                            code: string;
                            name: string;
                        }[];
                    };
                }[];
            };
            const oldPermissions = await mosApi<OldPermissions>(
                '/mos/v1/auth-api/employee-permissions'
            );
            // (temp) fix permissions
            const permissions: Permissions = [];
            oldPermissions.malls.forEach(({ id, name, role }) => {
                permissions.push({
                    id,
                    name,
                    permissions: role.permissions.map(({ code }) => code),
                });
            });
            const stringPermissions = JSON.stringify(permissions);
            window.localStorage.setItem('permissions', stringPermissions);

            // -----------------------------------------------------------------
            // set the first mall
            // -----------------------------------------------------------------
            window.localStorage.setItem('mallId', String(permissions[0]?.id));
            window.localStorage.setItem('mallName', permissions[0]?.name);

            // -----------------------------------------------------------------
            // set the first store (if exists)
            // -----------------------------------------------------------------
            if (permissions[0]?.stores) {
                const store = permissions[0].stores[0];
                window.localStorage.setItem('storeId', String(store.id));
                window.localStorage.setItem('storeName', String(store.name));
            }
        },
    });

const authenticated = (): boolean =>
    !!window.localStorage.getItem('x-access-token');

const permission = (name: string): boolean => {
    if (authenticated()) {
        return false;
    }

    const mallId = Number(window.localStorage.getItem('mallId'));
    const stringPermissions = window.localStorage.getItem('permissions');
    const permissions = JSONparse(stringPermissions) as Permissions;

    const mall = permissions?.find(({ id }) => id === mallId);
    if (mall && mall.permissions?.find((code) => code === name)) {
        return true;
    }

    return false;
};

const signout = (): void => {
    window.localStorage.removeItem('x-access-token');
    window.sessionStorage.clear();
};

export default mosApi;
export { authentication, authenticated, permission, signout };
