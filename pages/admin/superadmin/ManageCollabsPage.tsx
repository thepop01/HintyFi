import React from 'react';
import ManageCollabs from '../../../components/admin/ManageCollabs';
import { motion } from 'framer-motion';

const ManageCollabsPage: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
        >
            <ManageCollabs />
        </motion.div>
    );
};

export default ManageCollabsPage;
