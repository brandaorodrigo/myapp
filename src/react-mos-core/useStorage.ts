import { SetStateAction, useEffect, useState } from 'react';

export default function useStorage<T>(
    key: string,
    initial?: T
): [T, React.Dispatch<SetStateAction<T>>] {
    const [storage, setStorage] = useState<T>(() => {
        const stored = window.localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
        if (initial) {
            window.localStorage.setItem(key, JSON.stringify(initial));
        }
        return initial;
    });

    useEffect(() => {
        if (storage === undefined) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, JSON.stringify(storage));
        }
    }, [key, storage]);

    return [storage, setStorage];
}
