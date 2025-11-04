import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase handles the redirect automatically
        // Just redirect to home after a moment
        const timer = setTimeout(() => {
            navigate('/');
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Authenticating...</h2>
            <p>Please wait while we complete your login.</p>
        </div>
    );
}