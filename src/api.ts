// fetchSpot is a complete standalone function
// to connect and query API from spot metrics
// - autosave and read the params from localStorage
// - indetify the env from dns domain
// - save result cache on sessionStorage
// - fiscal redirect to /logout if recive forbidden from api
// - accept raw value to send files or object values to send json

const MosEnv = () => {
    if (!localStorage.getItem('env')) {
        const env = () => {
            const { host } = window.location;
            if (host.indexOf('mos.spotmetrics.com') !== -1) {
                return 'prd';
            }
            if (host.indexOf('mos-staging.spotmetrics.com') !== -1) {
                return 'staging';
            }
            if (host.indexOf('mos-sandbox.spotmetrics.com') !== -1) {
                return 'sandbox';
            }
            if (host.indexOf('mos-dev.spotmetrics.com') !== -1) {
                return 'dev';
            }
            if (host.indexOf('mos-dev-k8s.spotmetrics.com') !== -1) {
                return 'dev-k8s';
            }
            if (host.indexOf('localhost') !== -1) {
                return 'dev';
            }
            return 'notfound';
        };
        localStorage.setItem('env', env());
    }
    return localStorage.getItem('env');
    // const api = `https://mos-api-${env}.spotmetrics.com`;
};

interface OptionInterface {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown | null;
    raw?: BodyInit;
    cache?: boolean;
}

const MosApi = async <T>(
    action: string,
    options?: OptionInterface
): Promise<T> => {
    const env = MosEnv();

    const api = `https://mos-api-${env}.spotmetrics.com`;

    const mallId = (action2: string) => {
        if (
            localStorage.getItem('mallId') &&
            action2.indexOf('mallId') === -1
        ) {
            return `${
                action2 + (action2.indexOf('?') === -1 ? '?' : '&')
            }mallId=${localStorage.getItem('mallId')}`;
        }
        return action2;
    };

    const input = mallId(action);

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

    const getOptions = (
        options2: OptionInterface | undefined
    ): BodyInit | undefined => {
        if (options2?.raw) {
            return options2.raw;
        }
        if (options2?.body) {
            return JSON.stringify(options2.body);
        }
        return undefined;
    };

    const fetchPromise = await fetch(api + input, {
        headers: {
            Accept: 'application/json',
            'x-access-token': localStorage.getItem('x-access-token') ?? '',
            ...(!options?.raw && {
                'Content-Type': 'application/json',
            }),
        },
        method: options?.method ?? 'GET',
        body: getOptions(options),
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

        let text = await response.text();

        // check json inside text ----------------------------------------------
        try {
            JSON.parse(text);
        } catch (error) {
            text = '{}';
        }

        // save cache ----------------------------------------------------------
        if (options?.cache === true) {
            sessionStorage.setItem(input, text);
        }

        // convert text to json ------------------------------------------------
        const json = JSON.parse(text);

        // catch is status isnt 2XX --------------------------------------------
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
export { MosEnv };
