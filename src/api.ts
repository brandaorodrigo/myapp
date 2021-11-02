// fetchSpot is a complete standalone function
// to connect and query API from spot metrics
// - autosave and read the params from localStorage
// - indetify the env from dns domain
// - save result cache on sessionStorage
// - fiscal redirect to /logout if recive forbidden from api
// - accept raw value to send files or object values to send json

const MosEnv = (): string => {
    const getEnv = (): string => {
        const { host } = window.location;
        let env;
        switch (true) {
            case host.indexOf('mos.spotmetrics.com') !== -1:
                env = 'prd';
                break;
            case host.indexOf('mos-staging.spotmetrics.com') !== -1:
                env = 'staging';
                break;
            case host.indexOf('mos-sandbox.spotmetrics.com') !== -1:
                env = 'sandbox';
                break;
            case host.indexOf('mos-dev.spotmetrics.com') !== -1:
                env = 'dev';
                break;
            case host.indexOf('mos-dev-k8s.spotmetrics.com') !== -1:
                env = 'dev-k8s';
                break;
            default:
                env = 'dev';
        }
        localStorage.setItem('env', env);
        return env;
    };
    return localStorage.getItem('env') ?? getEnv();
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
    const env = MosEnv();

    const api = `https://mos-api-${env}.spotmetrics.com`;

    // add query param from local storage --------------------------------------
    const addQueryParamFromLocalStorage = (current: string, param: string) => {
        if (localStorage.getItem(param) && current.indexOf(param) === -1) {
            return `${
                current + (current.indexOf('?') === -1 ? '?' : '&') + param
            }=${localStorage.getItem(param)}`;
        }
        return current;
    };
    let input = action;
    input = addQueryParamFromLocalStorage(input, 'mallId');
    input = addQueryParamFromLocalStorage(input, 'storeId');

    // cache -------------------------------------------------------------------
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

    // fetch -------------------------------------------------------------------
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
        // forbidden -----------------------------------------------------------
        if (response.status === 403) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/403';
        }

        // x-access-token ------------------------------------------------------
        if (options && response.headers.get('x-access-token')) {
            const token = response.headers.get('x-access-token');
            localStorage.setItem('x-access-token', String(token));
        }

        // no content ----------------------------------------------------------
        if (response.status === 204) {
            return {} as T;
        }

        // json ----------------------------------------------------------------
        const JSONparse = (text: string): unknown => {
            try {
                return JSON.parse(text);
            } catch (error) {
                return {};
            }
        };
        const json = JSONparse(await response.text());

        // cache ---------------------------------------------------------------
        if (options?.cache === true) {
            sessionStorage.setItem(input, JSON.stringify(json));
        }

        // no success ----------------------------------------------------------
        if (response.status < 200 || response.status >= 300) {
            throw json as unknown;
        }

        // success -------------------------------------------------------------
        return json as T;
    });

    // promise -----------------------------------------------------------------
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
export { MosEnv };
