import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AnswerState } from '../types';

interface User extends AnswerState {
    name: string;
}

interface UserContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUserData = localStorage.getItem('user_data');
            if (storedUserData) {
                setUser(JSON.parse(storedUserData));
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            localStorage.removeItem('user_data');
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        window.dispatchEvent(new Event('userLoggedIn'));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_data');
        localStorage.removeItem('personalized_routine'); // Also clear routine
        localStorage.removeItem('test_history'); // And test history
        window.dispatchEvent(new Event('userLoggedOut'));
    };

    return (
        <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

