const JSONparse = (text: string | null): unknown => {
    try {
        return text ? JSON.parse(text) : {};
    } catch (error) {
        return {};
    }
};

const api = async <T,>(
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
            if (text && text !== '') return JSONparse(text) as T;
        } else window.sessionStorage.removeItem(input);
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

        if (options?.cache === true && method === 'GET')
            window.sessionStorage.setItem(input, JSON.stringify(json));

        if (response.status < 200 || response.status >= 300) throw json;

        if (options?.getHeaders)
            options.getHeaders(response.headers, json as T);

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

const mosApi = async <T,>(
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
    // add the x-access-token on header of all requests
    // -------------------------------------------------------------------------
    const mosOption = {
        headers: {
            'x-access-token':
                window.localStorage.getItem('x-access-token') ?? '',
        },
        ...options,
    };

    // -------------------------------------------------------------------------
    // get the api url based on react env or domain name
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
        window.localStorage.setItem(
            'env',
            process.env.REACT_APP_ENV ?? getEnvByDomain()
        );
    }
    const env = window.localStorage.getItem('env');
    const mosUrl = `https://mos-api-${env}.spotmetrics.com`;

    // -------------------------------------------------------------------------
    // get the uri and add common query params (mallId and storeId)
    // -------------------------------------------------------------------------
    const setParamsFromStorage = (current: string, params: string[]) => {
        let fixInput = current;
        params.forEach((param) => {
            if (current.indexOf(param) === -1) {
                const value = window.localStorage.getItem(param);
                if (value) {
                    const symbol = fixInput.indexOf('?') === -1 ? '?' : '&';
                    fixInput += `${symbol + param}=${value}`;
                }
            }
        });
        return fixInput;
    };
    const mosUri = setParamsFromStorage(input, ['mallId', 'storeId']);

    // -------------------------------------------------------------------------
    // execute the original api function
    // -------------------------------------------------------------------------
    return api<T>(mosUrl + mosUri, mosOption);
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
            window.localStorage.setItem(
                'x-access-token',
                headers.get('x-access-token') as string
            );

            // -----------------------------------------------------------------
            // set employee.name
            // -----------------------------------------------------------------
            window.localStorage.setItem('employee.name', response.name);

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
            window.localStorage.setItem(
                'permissions',
                JSON.stringify(permissions)
            );

            // -----------------------------------------------------------------
            // set the first mall
            // -----------------------------------------------------------------
            window.localStorage.setItem('mall.id', String(permissions[0]?.id));
            window.localStorage.setItem('mall.name', permissions[0]?.name);

            // -----------------------------------------------------------------
            // set the first store (if exists)
            // -----------------------------------------------------------------
            if (permissions[0]?.stores) {
                const store = permissions[0].stores[0];
                window.localStorage.setItem('store.id', String(store.id));
                window.localStorage.setItem('store.name', String(store.name));
            }
        },
    });

const authenticated = (): boolean =>
    !!window.localStorage.getItem('x-access-token');

const permission = (name?: string): boolean => {
    if (authenticated()) return false;

    const mallId = Number(window.localStorage.getItem('mall.id'));
    const permissions = JSONparse(
        window.localStorage.getItem('permissions')
    ) as Permissions;

    const mall = permissions?.find(({ id }) => id === mallId);
    if (mall && mall.permissions?.find((code) => code === name)) return true;

    return false;
};

const signout = (): void => {
    window.localStorage.removeItem('x-access-token');
    window.sessionStorage.clear();
};

export default mosApi;
export { authentication, authenticated, permission, signout };
