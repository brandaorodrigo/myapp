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
        /*
        if (response.status === 403) {
            window.sessionStorage.clear();
            window.location.href = '/forbidden';
        }
        */

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

const setStorage = (name: string, id: string | number): void =>
    window.localStorage.setItem(name, String(id));

const getStorage = (name: string): string => window.localStorage.getItem(name);

// api -------------------------------------------------------------------------

const mosApi = async <T>(input: string, options?: Options): Promise<T> => {
    const find = () => {
        const { env } = hosts.find(
            ({ host }) => !!(window.location.host.indexOf(host) !== -1)
        );
        setStorage('env', env ?? 'dev');
        return env;
    };
    const env = getStorage('env') ?? find();
    // const env = process.env.REACT_APP_ENV;

    const url = new URL(`https://mos-api-${env}.spotmetrics.com${input}`);

    const mallId = getStorage('mallId');
    if (mallId) url.searchParams.set('mallId', mallId);

    const storeId = getStorage('storeId');
    if (storeId) url.searchParams.set('storeId', storeId);

    const token = getStorage('x-access-token');

    return fetchJson<T>(url.href, {
        headers: { 'x-access-token': token ?? '' },
        ...options,
    });
};

// sign ------------------------------------------------------------------------

const mosSignIn = async (email: string, password: string): Promise<boolean> => {
    const authentication = await mosApi<{
        name: string;
        area: string;
        isMosMallRegistered: boolean;
        isMosStoreRegistered: boolean;
    }>('/mos/v1/auth-api/authentication', {
        method: 'POST',
        body: { email, password },
        getHeaders: async (headers) => {
            const token = headers.get('x-access-token') as string;
            setStorage('x-access-token', token);
        },
    });

    if (!authentication) throw new Error('error');

    setStorage('employee', authentication.name);

    if (authentication.isMosMallRegistered) setStorage('mos-mall', '1');
    if (authentication.isMosStoreRegistered) setStorage('mos-store', '1');

    return true;
};

const mosSignOut = (): void => {
    window.localStorage.clear();
    window.sessionStorage.clear();
};

const mosSigned = (): boolean => !!getStorage('x-access-token');

export default mosApi;
export { mosApi, mosSignIn, mosSignOut, mosSigned, setStorage, getStorage };
