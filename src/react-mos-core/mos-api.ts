const hosts = [
    { host: 'mos.spotmetrics.com', env: 'prd' },
    { host: 'mos-staging.spotmetrics.com', env: 'staging' },
    { host: 'mos-sandbox.spotmetrics.com', env: 'sandbox' },
    { host: 'mos-dev-k8.spotmetrics.com', env: 'dev-k8s' },
    { host: 'mos-dev.spotmetrics.com', env: 'dev' },
    { host: 'localhost', env: 'dev' },
];

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

        if (options?.cache === true && method === 'GET')
            window.sessionStorage.setItem(input, JSON.stringify(json));

        if (response.status < 200 || response.status >= 300) throw json;

        if (options?.getHeaders) options.getHeaders(response.headers);

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

const mosApi = async <T>(input: string, options?: Options): Promise<T> => {
    if (!window.localStorage.getItem('env')) {
        const findEnv = (): string => {
            const found = hosts.find(
                ({ host }) => !!(window.location.host.indexOf(host) !== -1)
            );
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

    const token = window.localStorage.getItem('token');

    return fetchJson<T>(url.href, {
        headers: { 'x-access-token': token ?? '' },
        ...options,
    });
};

type Malls = {
    id: number;
    name: string;
    roles: {
        id: number;
        name: string;
        permissions: string[];
    }[];
    stores?: {
        id: number;
        name: string;
    }[];
}[];

const mosAuthentication = async (
    email: string,
    password: string
): Promise<boolean> => {
    const authentication = await mosApi<{ name: string; area: string }>(
        '/mos/v1/auth-api/authentication',
        {
            method: 'POST',
            body: { email, password },
            getHeaders: async (headers) => {
                const token = headers.get('x-access-token') as string;
                window.localStorage.setItem('token', token);
            },
        }
    );

    if (!authentication) {
        throw new Error('error');
    }

    window.localStorage.setItem('employeeName', authentication.name);

    /*
    const malls = await mosApi<Malls>(
        '/mos/v1/auth-api/employee-permissions-new'
    );
    window.localStorage.setItem('malls', JSON.stringify(malls));
    */

    // TEMP ====================================================================
    // =========================================================================
    // =========================================================================
    // =========================================================================
    type Permissions = {
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
    const permissions = await mosApi<Permissions>(
        '/mos/v1/auth-api/employee-permissions'
    );
    const malls: Malls = [];
    permissions.malls.forEach(({ id, name, role }) => {
        malls.push({
            id,
            name,
            roles: [
                {
                    id: role.id,
                    name: role.name,
                    permissions: role.permissions.map(({ code }) => code),
                },
            ],
        });
    });
    window.localStorage.setItem('malls', JSON.stringify(malls));
    // =========================================================================
    // =========================================================================
    // =========================================================================
    // =========================================================================

    const mall = malls[0];
    if (mall) {
        window.localStorage.setItem('mallId', String(mall?.id));
        window.localStorage.setItem('mallName', String(mall?.name));
    }

    const role = mall?.roles && mall?.roles[0];
    if (role) {
        window.localStorage.setItem('roleId', String(role?.id));
        window.localStorage.setItem('roleName', String(role?.name));
    }

    const store = mall?.stores && mall?.stores[0];
    if (store) {
        window.localStorage.setItem('storeId', String(store.id));
        window.localStorage.setItem('storeName', String(store.name));
    }

    return true;
};

const mosAuthenticated = (): boolean => !!window.localStorage.getItem('token');

const mosPermission = (name: string): boolean => {
    if (!mosAuthenticated()) return false;

    const malls = parseJson(window.localStorage.getItem('malls')) as Malls;

    if (!malls.length) return false;

    const mallId = window.localStorage.getItem('mallId');
    const mall = malls?.find(({ id }) => id === Number(mallId));

    const roleId = window.localStorage.getItem('roleId');
    const role = mall?.roles?.find(({ id }) => id === Number(roleId));

    if (role && role.permissions?.find((value) => value === name)) return true;

    return false;
};

const mosSignout = (): void => {
    window.localStorage.clear();
    window.sessionStorage.clear();
};

export default mosApi;
export { mosAuthentication, mosAuthenticated, mosPermission, mosSignout };