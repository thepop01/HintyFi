
import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`card p-4 rounded-xl shadow-lg text-on-background ${className}`}>
            {children}
        </div>
    );
};

export default Card;