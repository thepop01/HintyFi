import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManageButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/super-admin/project-detail/manage');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Manage
    </button>
  );
};

export default ManageButton;