import hosts from './mos-host';

// utils -----------------------------------------------------------------------

const parseJson = (text: string | null): unknown => {
    try {
        return text ? JSON.parse(text) : {};
    } catch (error) {
        return {};
    }
};

type Options = {
    body?: unknown | null;
    cache?: boolean;
    headers?: HeadersInit;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    getHeaders?: (headers: Headers) => void;
};

const fetchJson = async <T>(input: string, options?: Options): Promise<T> => {
    const method = options?.method ?? 'GET';

    if (options?.cache === true) {
        if (method === 'GET') {
            const text = window.sessionStorage.getItem(input);
            if (text && text !== '') return parseJson(text) as T;
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

        const json = parseJson(await response.text());

        if (options?.cache === true && method === 'GET') window.sessionStorage.setItem(input, JSON.stringify(json));

        if (response.status < 200 || response.status >= 300) throw json;

        if (options?.getHeaders) options.getHeaders(response.headers);

        return json as T;
    });

    return new Promise((resolve: (value: T) => void, reject: (reason?: unknown) => void) => {
        try {
            resolve(fetchPromise);
        } catch (error) {
            reject(error);
        }
    });
};

// api -------------------------------------------------------------------------

const mosApi = async <T>(input: string, options?: Options): Promise<T> => {
    if (!window.localStorage.getItem('env')) {
        const findEnv = (): string => {
            const found = hosts.find(({ host }) => !!(window.location.host.indexOf(host) !== -1));
            return found?.env ?? 'dev';
        };
        const env = process.env.REACT_APP_ENV ?? findEnv();
        window.localStorage.setItem('env', env);
    }
    const env = window.localStorage.getItem('env');
    const url = new URL(`https://mos-api-${env}.spotmetrics.com${input}`);

    const mallId = window.localStorage.getItem('mallId');
    if (mallId) url.searchParams.set('mallId', mallId);

    const storeId = window.localStorage.getItem('storeId');
    if (storeId) url.searchParams.set('storeId', storeId);

    const token = window.localStorage.getItem('x-access-token');

    return fetchJson<T>(url.href, {
        headers: { 'x-access-token': token ?? '' },
        ...options,
    });
};

// sign ------------------------------------------------------------------------

type Permission = {
    id: number;
    name: string;
    permissions?: string[];
    stores?: {
        id: number;
        name: string;
        permissions: string[];
    }[];
};

const normalizePermissions = async (): Promise<Permission[]> => {
    type MallsLegacy = {
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
    const mallsLegacy = await mosApi<MallsLegacy>('/mos/v1/auth-api/employee-permissions');
    const permissions: Permission[] = [];
    mallsLegacy.malls.forEach(({ id, name, role }) => {
        permissions.push({
            id,
            name,
            permissions: role.permissions.map(({ code }) => code),
            stores: [
                {
                    id: 44,
                    name: 'Store 44',
                    permissions: ['PERMISSION-EXAMPLE-1', 'PERMISSION-EXAMPLE-2'],
                },
            ],
        });
    });
    return permissions;
};

const mosSignIn = async (email: string, password: string): Promise<boolean> => {
    const authentication = await mosApi<{ name: string; area: string }>('/mos/v1/auth-api/authentication', {
        method: 'POST',
        body: { email, password },
        getHeaders: async (headers) => {
            const token = headers.get('x-access-token') as string;
            window.localStorage.setItem('x-access-token', token);
        },
    });

    if (!authentication) throw new Error('error');

    window.localStorage.setItem('employee', authentication.name);

    /*
    const permissions = await mosApi<Permissions>(
        '/mos/v1/auth-api/employee-permissions'
    );
    */
    const permissions = await normalizePermissions();
    window.localStorage.setItem('permissions', JSON.stringify(permissions));

    const mall = permissions[0];
    if (mall) {
        window.localStorage.setItem('mallId', String(mall?.id));
        window.localStorage.setItem('mallName', String(mall?.name));
    }

    const store = mall?.stores && mall?.stores[0];
    if (store) {
        window.localStorage.setItem('storeId', String(store.id));
        window.localStorage.setItem('storeName', String(store.name));
    }

    return true;
};

const mosSignOut = (): void => {
    window.localStorage.clear();
    window.sessionStorage.clear();
};

const mosSigned = (): boolean => !!window.localStorage.getItem('x-access-token');

// permissions -----------------------------------------------------------------

const findMall = (mallId: number): Permission | undefined => {
    if (!mosSigned()) return undefined;

    const permissions = parseJson(window.localStorage.getItem('permissions')) as Permission[];
    if (!permissions.length) return undefined;

    const mall = permissions?.find(({ id }) => id === mallId);

    return mall ?? undefined;
};

const mosPermission = {
    mall: (name?: string): boolean => {
        const mallId = Number(window.localStorage.getItem('mallId'));
        const mall = findMall(mallId);
        if (!mall) return false;

        if (!name && mall?.permissions?.length) return true;

        return !!mall.permissions?.find((value) => value === name);
    },

    store: (name?: string): boolean => {
        const mallId = Number(window.localStorage.getItem('mallId'));
        const mall = findMall(mallId);
        if (!mall) return false;

        if (!name && mall?.stores?.length) return true;

        const storeId = window.localStorage.getItem('storeId');
        const store = mall?.stores?.find(({ id }) => id === Number(storeId));
        if (!store) return false;

        return !!store.permissions?.find((value) => value === name);
    },
};

// set -------------------------------------------------------------------------

/*
const mosPermission = (where: 'mall' | 'store', name?: string): boolean => {
    if (!mosSigned()) return false;

    const permissions = parseJson(
        window.localStorage.getItem('permissions')
    ) as Permissions;
    if (!permissions.length) return false;

    const mallId = window.localStorage.getItem('mallId');
    const mall = permissions?.find(({ id }) => id === Number(mallId));
    if (!mall) return false;

    const found = mall && mall.permissions?.find((value) => value === name);
    if (found) return true;

    const storeId = window.localStorage.getItem('storeId');
    if (!storeId) return false;

    const store = mall?.stores?.find(({ id }) => id === Number(storeId));
    if (!store) return false;

    const allow = store && store.permissions?.find((value) => value === name);
    if (!allow) return false;

    return true;
};
*/

export default mosApi;
export { mosApi, mosSignIn, mosSignOut, mosSigned };
export { mosPermission };
