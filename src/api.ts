const env = (): string => {
    const { host } = window.location;
    if (host.indexOf('mos.spotmet') !== -1) return 'prd';
    if (host.indexOf('mos-staging') !== -1) return 'staging';
    if (host.indexOf('mos-sandbox') !== -1) return 'sandbox';
    if (host.indexOf('mos-dev-k8s') !== -1) return 'dev-k8s';
    if (host.indexOf('mos-dev.spo') !== -1) return 'dev';
    return 'dev';
};

const MosApi = async <T>(
    action: string,
    options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?: unknown | null;
        raw?: BodyInit;
        cache?: boolean;
    }
): Promise<T> => {
    if (!localStorage.getItem('env')) {
        const found = process.env.REACT_APP_ENV ?? env();
        localStorage.setItem('env', found);
    }
    const server = localStorage.getItem('env');

    const api = `https://mos-api-${server}.spotmetrics.com`;

    let input = action;
    const addParamFromStorage = (current: string, param: string) => {
        if (localStorage.getItem(param) && current.indexOf(param) === -1) {
            return `${
                current + (current.indexOf('?') === -1 ? '?' : '&') + param
            }=${localStorage.getItem(param)}`;
        }
        return current;
    };
    input = addParamFromStorage(input, 'mallId');
    input = addParamFromStorage(input, 'storeId');

    if (options?.cache === true) {
        if (options?.method === 'GET' || !options?.method) {
            const text = sessionStorage.getItem(input);
            if (text && text !== '') {
                return JSON.parse(text) as T;
            }
        } else {
            sessionStorage.removeItem(input);
        }
    }

    const fetchPromise = await fetch(api + input, {
        headers: {
            Accept: 'application/json',
            'x-access-token': localStorage.getItem('x-access-token') ?? '',
            ...(!options?.raw && {
                'Content-Type': 'application/json',
            }),
        },
        method: options?.method ?? 'GET',
        body:
            options?.raw ?? options?.body
                ? JSON.stringify(options.body)
                : undefined,
    }).then(async (response) => {
        if (response.status === 403) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/403';
        }

        if (options && response.headers.get('x-access-token')) {
            const token = response.headers.get('x-access-token');
            localStorage.setItem('x-access-token', String(token));
        }

        if (response.status === 204) {
            return {} as T;
        }

        const JSONparse = (text: string): unknown => {
            try {
                return JSON.parse(text);
            } catch (error) {
                return {};
            }
        };
        const json = JSONparse(await response.text());

        if (options?.cache === true) {
            sessionStorage.setItem(input, JSON.stringify(json));
        }

        if (response.status < 200 || response.status >= 300) {
            throw json as unknown;
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

export default MosApi;
export { env };
