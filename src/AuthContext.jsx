import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch profile from your profiles table
    const fetchProfile = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (data) {
            setProfile(data);
            setIsAdmin(data.is_admin || false);
        }
    };

    useEffect(() => {
        // Get current session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        // Listen for login/logout events
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else { setProfile(null); setIsAdmin(false); }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, name, phone) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Create profile row
        await supabase.from('profiles').insert({
            id: data.user.id,
            name,
            phone,
            is_admin: false
        });
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, isAdmin, loading, signUp, signIn, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);