import React, { createContext, useContext, useState } from 'react';

interface StorageContextProps {
    (key: string): [string | undefined, (value?: string | undefined) => void];
}

interface StorageProviderProps {
    children: React.ReactNode;
}

const StorageContext = createContext<StorageContextProps>(
    {} as StorageContextProps
);

const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
    const [items, setItems] = useState<{
        [key: string]: string;
    }>({});

    const useStorage = (
        key: string,
        storage?: Storage
    ): [string | undefined, (value?: string | undefined) => void] => {
        const webStorage = storage ?? window.localStorage;

        const value = items[key] ?? webStorage.getItem(key) ?? undefined;

        const setStorage = (newValue?: string | undefined): void => {
            if (newValue) {
                webStorage.setItem(key, newValue);
                setItems({ ...items, [key]: newValue });
            } else {
                webStorage.removeItem(key);
                const current = { ...items };
                delete items[key];
                setItems(current);
            }
        };

        return [value, setStorage];
    };

    return (
        <StorageContext.Provider value={useStorage}>
            {children}
        </StorageContext.Provider>
    );
};

const useStorageContext = (): StorageContextProps => {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('StorageContext must be use with StorageProvider');
    }
    return context;
};

export { StorageProvider, useStorageContext };
