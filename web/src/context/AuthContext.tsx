import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    role: string;
    phone_number: string;
}

interface MerchantData {
    id: string;
    status: string;
    business_name?: string;
}


interface AuthContextType {
    user: User | null;
    merchant: MerchantData | null;
    token: string | null;
    login: (token: string, user: User, merchant: MerchantData | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isMerchant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [merchant, setMerchant] = useState<MerchantData | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedMerchant = localStorage.getItem('merchant');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            if (storedMerchant) {
                setMerchant(JSON.parse(storedMerchant));
            }
        }
    }, []);

    const login = (newToken: string, newUser: User, newMerchant: MerchantData | null) => {
        setToken(newToken);
        setUser(newUser);
        setMerchant(newMerchant);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        if (newMerchant) {
            localStorage.setItem('merchant', JSON.stringify(newMerchant));
        } else {
            localStorage.removeItem('merchant');
        }
    };


    const logout = () => {
        setToken(null);
        setUser(null);
        setMerchant(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('merchant');
    };

    return (
        <AuthContext.Provider value={{
            user,
            merchant,
            token,
            login,
            logout,
            isAuthenticated: !!token,
            isAdmin: user?.role?.toLowerCase() === 'admin',
            isMerchant: user?.role?.toLowerCase() === 'merchant'

        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
