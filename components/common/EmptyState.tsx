import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox size={48} />,
  title,
  description,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="neu-card p-12 text-center text-on-background-variant flex flex-col items-center justify-center h-full my-8"
    >
      <div className="w-16 h-16 rounded-full bg-surface/50 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-bold font-display text-on-surface">{title}</h2>
      <p className="mt-1 max-w-sm">{description}</p>
    </motion.div>
  );
};

export default EmptyState;
