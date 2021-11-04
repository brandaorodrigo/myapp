import moment from 'moment';

// helpers -------------------------------------------------------------------------------------------------------------

const onlyNumeric = (value: string | number): string =>
    value ? String(value).replace(/\D/g, '') : '';

const toMask = (value: string | number, mask: string): string => {
    if (!value) return '';
    const unmask = onlyNumeric(value);
    let digit = 0;
    let output = '';
    if (!unmask.length) return '';
    for (let i = 0; i < mask.length; i += 1)
        if (mask.charAt(i) === '_') {
            output += unmask.charAt(digit);
            if (!unmask.charAt(digit + 1)) break;
            digit += 1;
        } else output += mask.charAt(i);
    return output;
};

const toMaskDate = (value: string, mask: string): string => {
    if (!value) return '';
    return moment(
        value,
        value.charAt(2) === '/' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'
    ).format(mask);
};

// format --------------------------------------------------------------------------------------------------------------

const formatAccents = (value: string): string => {
    if (!value) return '';
    const a = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëÇçÐðÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÝÿýŽž';
    const s = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeCcDdIIIIiiiiUUUUuuuuNnSsYYyyZz';
    const replace: any[] = [];
    for (let i = 0; i < a.length; i += 1) replace[Number(a[i])] = s[i];
    return value.replace(/[^A-Za-z0-9]/g, (x) => replace[Number(x)] || x);
};

const formatCapitalize = (value: string): string => {
    if (!value) return '';
    return value.length > 1
        ? value[0].toUpperCase() + value.substr(1).toLowerCase()
        : value[0].toUpperCase();
};

const formatDatetime = (value: string): string => {
    if (!value) return '';
    const date = moment(value).format('DD/MM/YYYY');
    const hour = moment(value).format('HH:mm');
    return `${date} às ${hour}`;
};

const formatName = (value: string): string => {
    if (!value) return '';
    const exclude = 'a,as,à,às,com,da,de,do,e,etc,na,no,o'.split(',');
    return value
        .split(' ')
        .map((word) => {
            const lower = word.toLowerCase();
            if (!exclude.includes(lower))
                return lower[0]
                    ? lower[0].toUpperCase() + lower.substr(1).toLowerCase()
                    : '';
            return lower;
        })
        .join(' ');
};

const formatSearch = (value: string): string => {
    if (!value) return '';

    if (value.lastIndexOf('@') > 0) {
        return formatAccents(value.toLowerCase());
    }
    return formatAccents(
        value
            .toLowerCase()
            .replaceAll('.', '')
            .replaceAll('-', '')
            .replaceAll('/', '')
    );
};

// mask ----------------------------------------------------------------------------------------------------------------

const maskCurrency = (value: string | number): string => {
    if (!value) return '';
    const fixValue = String(
        Number(String(value).replaceAll('.', '').replaceAll(',', ''))
    );
    let decimal = fixValue.substr(fixValue.length - 2, fixValue.length);
    let integer = fixValue.substr(0, fixValue.length - 2);
    if (decimal === '0') return '';
    if (decimal.length === 1) decimal = `0${decimal}`;
    if (integer.length)
        integer = String(integer).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    else integer = '0';
    return `${integer},${decimal}`;
};

const maskDate = (value: string): string => {
    if (!value) return '';
    let fixValue = value;
    if (value.length === 10 || value.indexOf('T') !== -1)
        fixValue = toMaskDate(value, 'DD/MM/YYYY');
    return toMask(fixValue, '__/__/____');
};

const maskPhone = (value: string): string => {
    if (!value) return '';
    const unmaskPhone = String(onlyNumeric(value.replace('+55', '')));
    if (unmaskPhone.substr(0, 1) === '0')
        return toMask(unmaskPhone, '____-___-____');
    return toMask(
        unmaskPhone,
        unmaskPhone.length === 11 ? '(__) _____-____' : '(__) ____-____'
    );
};

// unmask --------------------------------------------------------------------------------------------------------------

const unmaskCurrency = (value: string | number): number | undefined => {
    if (!value) return undefined;
    const fixValue = String(
        Number(String(value).replaceAll('.', '').replaceAll(',', ''))
    );
    const decimal = fixValue.substr(fixValue.length - 2, fixValue.length);
    const integer = fixValue.substr(0, fixValue.length - 2);
    return Number(`${integer}.${decimal}`);
};

const unmaskPhone = (value: string): string => {
    if (!value) return '';
    const unmakedValue = onlyNumeric(value);
    if (!unmakedValue) return '';
    if (unmakedValue.substr(0, 2) === '55') return `+${unmakedValue}`;
    return `+55${unmakedValue}`;
};

// export --------------------------------------------------------------------------------------------------------------

export const mask = {
    // format
    accent: formatAccents,
    capitalize: formatCapitalize,
    datetime: formatDatetime,
    name: formatName,
    search: formatSearch,
    // mask
    cnpj: (value: string): string => toMask(value, '__.___.___/____-__'),
    cpf: (value: string): string => toMask(value, '___.___.___-__'),
    currency: maskCurrency,
    date: maskDate,
    phone: maskPhone,
    time: (value: string): string => toMask(value, '__:__'),
    zipcode: (value: string): string => toMask(value, '_____-___'),
};

export const unmask = {
    cnpj: (value: string): string => onlyNumeric(value),
    cpf: (value: string): string => onlyNumeric(value),
    currency: unmaskCurrency,
    date: (value: string): string => toMaskDate(value, 'YYYY-MM-DD'),
    phone: unmaskPhone,
    time: (value: string): string => toMask(value, '__:__'),
    zipcode: (value: string): string => onlyNumeric(value),
};
