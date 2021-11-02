const env = (): string => {
    const { host } = window.location;
    if (host.indexOf('mos.spotme') !== -1) return 'prd';
    if (host.indexOf('mos-stagin') !== -1) return 'staging';
    if (host.indexOf('mos-sandbo') !== -1) return 'sandbox';
    if (host.indexOf('mos-dev-k8') !== -1) return 'dev-k8s';
    if (host.indexOf('mos-dev.sp') !== -1) return 'dev';
    return 'dev';
};

const JSONparse = (text: string): any => {
    try {
        return text ? JSON.parse(text) : {};
    } catch (error) {
        return {};
    }
};

const mosApi = async <T>(
    action: string,
    options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?: unknown | null;
        raw?: BodyInit;
        cache?: boolean;
    }
): Promise<T> => {
    const trim = (value: string, char = ' ') => {
        let found = value;
        if (found.charAt(0) === char) found = found.substring(1);
        const last = found.length - 1;
        if (found.charAt(last) === char) found = found.substring(0, last);
        return found;
    };
    const url = `/${trim(action, '/')}`;

    // =========================================================================

    const addParamFromStorage = (current: string, param: string) => {
        if (localStorage.getItem(param) && current.indexOf(param) === -1) {
            return `${
                current + (current.indexOf('?') === -1 ? '?' : '&') + param
            }=${localStorage.getItem(param)}`;
        }
        return current;
    };
    let input = url;
    input = addParamFromStorage(input, 'mallId');
    input = addParamFromStorage(input, 'storeId');

    // =========================================================================

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

    // =========================================================================

    if (!localStorage.getItem('env')) {
        const found = process.env.REACT_APP_ENV ?? env();
        localStorage.setItem('env', found);
    }
    const server = localStorage.getItem('env');
    const api = `https://mos-api-${server}.spotmetrics.com`;

    // =========================================================================

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

        if (url === '/mos/v1/auth-api/authentication') {
            const token = response.headers.get('x-access-token');
            localStorage.setItem('x-access-token', String(token));

            const permission = await mosApi<any>(
                '/mos/v1/auth-api/employee-permissions'
            );
            localStorage.setItem('permission', JSON.stringify(permission));
            localStorage.setItem('mallId', permission?.malls[0]?.id);
            localStorage.setItem('mallName', permission?.malls[0]?.name);

            const employee = await mosApi<any>(
                '/mos/v1/auth-api/employee-mall/own'
            );
            localStorage.setItem('employeeName', employee?.name);
        }

        if (response.status === 204) {
            return {} as T;
        }

        const json = JSONparse(await response.text());

        if (options?.cache === true) {
            sessionStorage.setItem(input, JSON.stringify(json));
        }

        if (response.status < 200 || response.status >= 300) {
            throw json as unknown;
        }

        return json as T;
    });

    // =========================================================================

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

const mosAuthentication = <T>(email: string, password: string): Promise<T> =>
    mosApi<T>('/mos/v1/auth-api/authentication', {
        method: 'POST',
        body: {
            email,
            password,
        },
    });

const mosPermission = (name: string): boolean => {
    const mallId = localStorage.getItem('mallId');
    const search = localStorage.getItem('permission');
    const { malls } = JSONparse(String(search));
    const { role } = malls?.find((v: any) => Number(v?.id) === Number(mallId));
    const code = role?.permissions?.find((v: any) => String(v?.code) === name);
    return !!code;
};

export default mosApi;
export { mosAuthentication, mosPermission, env };
