import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Twitter, Send } from 'lucide-react';

const DiscordIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
    <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`fill-current ${className}`}
        style={{ width: size, height: size }}
    >
        <title>Discord</title>
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8257-.618 1.2295a18.298 18.298 0 00-5.4849 0c-.1716-.4038-.407-.8542-.618-1.2295a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8851 1.5152.0699.0699 0 00-.0321.027c-3.3757 5.9272-3.3757 11.7582 0 17.6854a.0699.0699 0 00.0321.027c1.5872.4839 3.1632.844 4.8851 1.05.0741.0053.1328-.0213.1593-.0838.2215-.5533.432-1.1281.5937-1.7292a.0741.0741 0 00-.0426-.0891 16.5913 16.5913 0 01-1.4239-.8199.0741.0741 0 01-.0053-.1064c.2057-.2825.401-.5754.578-.8578a.0741.0741 0 01.0991-.0106c.0053.0053.0106.0053.0159.0106 2.3051 1.2825 4.9543 1.2825 7.2594 0 .0053-.0053.0106-.0053.0159-.0106a.0741.0741 0 01.0991.0106c.177.2824.3723.5753.578.8578a.0741.0741 0 01-.0053.1064 16.5913 16.5913 0 01-1.4239.8199.0741.0741 0 00-.0426.0891c.1617.6011.3722 1.1759.5937 1.7292.0266.0625.0852.0891.1593.0838 1.7219-.206 3.2979-.5661 4.8851-1.05a.0699.0699 0 00.0321-.027c3.3757-5.9272 3.3757-11.7582 0-17.6854a.0699.0699 0 00-.0321-.027zm-5.4232 12.336c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929s-1.1211 2.5929-2.5024 2.5929zm-5.3283 0c-1.3813 0-2.5024-1.1636-2.5024-2.5929s1.1211-2.5929 2.5024-2.5929c1.3813 0 2.5024 1.1636 2.5024 2.5929 0 1.4293-1.1211 2.5929-2.5024 2.5929z" />
    </svg>
);

const SocialButton: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
    <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="neu-nav-item w-12 h-12 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
    >
        {icon}
    </motion.a>
);

const FooterLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
    <li>
        <Link to={to} className="font-semibold text-on-surface-variant hover:text-primary transition-colors">
            {label}
        </Link>
    </li>
);

const Footer: React.FC = () => {
    return (
        <footer className="bg-[rgb(var(--color-surface-container))] text-on-surface-variant mt-12 py-12 px-4 sm:px-6 lg:px-8 border-t border-border/10">
            <div className="max-w-[84rem] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Column 1: Logo, Brand, and Socials */}
                <div className="md:col-span-1 flex flex-col items-center md:items-start">
                     <Link to="/" className="flex items-center gap-3 mb-4">
                        <img 
                            src="https://res.cloudinary.com/dizoez2x9/image/upload/v1760456318/trends_vtetaz.png"
                            alt="TIRTH Logo" 
                            className="h-12 w-12 rounded-full"
                        />
                        <span className="font-display font-bold text-3xl logo-text">TIRTH</span>
                    </Link>
                    <p className="text-center md:text-left max-w-xs">The central hub for our crypto ecosystem. Discover, participate, and build your reputation.</p>
                    <div className="flex items-center gap-4 mt-6">
                        <SocialButton href="#" icon={<Twitter size={24} />} label="Follow on Twitter" />
                        <SocialButton href="#" icon={<Send size={24} />} label="Join our Telegram" />
                        <SocialButton href="#" icon={<DiscordIcon size={24} />} label="Join our Discord" />
                    </div>
                </div>

                {/* Column 2 & 3: Navigation Links */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-display font-bold text-xl text-on-surface mb-4">Explore</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/" label="The Vault" />
                            <FooterLink to="/early-projects" label="Early Projects" />
                            <FooterLink to="/ecosystem/nft" label="NFTs" />
                            <FooterLink to="/ecosystem/ido" label="IDOs" />
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-display font-bold text-xl text-on-surface mb-4">Participate</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/campaigns" label="Campaigns & Quests" />
                            <FooterLink to="/tasks" label="Tasks" />
                            <FooterLink to="/this-week" label="This Week" />
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-display font-bold text-xl text-on-surface mb-4">Community</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/ledger" label="Ledger" />
                            <FooterLink to="/profile" label="My Profile" />
                            <FooterLink to="/admin" label="Admin" />
                        </ul>
                    </div>
                </div>
            </div>
            <div className="text-center mt-12 pt-8 border-t border-border/10 text-sm">
                <p>&copy; {new Date().getFullYear()} TIRTH. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;