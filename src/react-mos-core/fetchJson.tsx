interface Options {
    body?: unknown | null;
    cache?: boolean;
    headers?: HeadersInit;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    onResponse?: (response: Response) => void;
}

const JSONparse = (text: string): unknown => {
    try {
        return text ? JSON.parse(text) : {};
    } catch (error) {
        return {};
    }
};

const api = async <T,>(input: string, options?: Options): Promise<T> => {
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

        if (options?.onResponse) {
            options.onResponse(response);
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

const mosApi = async <T,>(input: string, options?: Options): Promise<T> => {
    const storage = window.localStorage;

    // -------------------------------------------------------------------------
    // add the x-access-token on header of all requests
    const mosOption = {
        headers: {
            'x-access-token': storage.getItem('x-access-token') ?? '',
        },
        ...options,
    };

    // -------------------------------------------------------------------------
    // gets the api url based on react env or domain name
    if (!storage.getItem('env')) {
        const getEnvByDomain = (): string => {
            const { host } = window.location;
            if (host.indexOf('mos.spotme') !== -1) return 'prd';
            if (host.indexOf('mos-stagin') !== -1) return 'staging';
            if (host.indexOf('mos-sandbo') !== -1) return 'sandbox';
            if (host.indexOf('mos-dev-k8') !== -1) return 'dev-k8s';
            if (host.indexOf('mos-dev.sp') !== -1) return 'dev';
            return 'dev';
        };
        storage.setItem('env', process.env.REACT_APP_ENV ?? getEnvByDomain());
    }
    const mosUrl = `https://mos-api-${storage.getItem('env')}.spotmetrics.com`;

    // -------------------------------------------------------------------------
    // gets the uri and add common query params (mallId and storeId)
    const setParamsFromStorage = (current: string, params: string[]) => {
        let fixInput = current;
        params.forEach((param) => {
            if (current.indexOf(param) === -1) {
                const value = storage.getItem(param);
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
    return api<T>(mosUrl + mosUri, mosOption);
};

const authentication = <T,>(email: string, password: string): Promise<T> =>
    mosApi<T>('/mos/v1/auth-api/authentication', {
        method: 'POST',
        body: {
            email,
            password,
        },
        onResponse: async (response) => {
            const storage = window.localStorage;

            // x-access-token --------------------------------------------------
            const mosToken = response.headers.get('x-access-token');
            if (mosToken) storage.setItem('x-access-token', mosToken);

            // permissions -----------------------------------------------------
            const mosPermission = await mosApi<any>(
                '/mos/v1/auth-api/employee-permissions'
            );
            storage.setItem('permission', JSON.stringify(mosPermission));

            // employee --------------------------------------------------------
            const mosEmployee = await mosApi<any>(
                '/mos/v1/auth-api/employee-mall/own'
            );
            storage.setItem('employee.name', mosEmployee?.name);

            const firstMall = mosPermission?.malls[0];

            // mallId ----------------------------------------------------------
            storage.setItem('mall.id', firstMall?.id);
            storage.setItem('mall.name', firstMall?.name);

            // storeId ---------------------------------------------------------
            storage.setItem('store.id', firstMall?.stores[0]?.id);
            storage.setItem('store.name', firstMall?.stores[0]?.name);
        },
    });

const permission = (name: string, redirect?: string): boolean => {
    const storage = window.localStorage;

    const mallId = storage.getItem('mallId');
    const search = storage.getItem('permission');

    const permissions = JSON.parse(String(search));
    const malls = permissions?.malls?.find(
        (v: any) => Number(v?.id) === Number(mallId)
    );
    const code = malls?.role?.permissions?.find(
        (v: any) => String(v?.code) === name
    );
    if (redirect && !!code === false) {
        window.location.href = redirect;
    }
    return !!code;
};

export default mosApi;
export { authentication, permission };
