import React, { createContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi, logoutApi } from './services/auth.api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const data = await getMeApi();
                setUser(data.user);
                setIsLoggedIn(true);
            } catch (err) {
                // Not authenticated, ignore
            } finally {
                setLoading(false);
            }
        };
        checkSession();

        const handleAuthFailed = () => {
            setUser(null);
            setIsLoggedIn(false);
        };
        window.addEventListener('auth-failed', handleAuthFailed);
        return () => {
            window.removeEventListener('auth-failed', handleAuthFailed);
        };
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginApi(email, password);
            setUser(data.user);
            setIsLoggedIn(true);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await registerApi(formData);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch(e) {}
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout, error, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
