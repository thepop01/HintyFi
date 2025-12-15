import React, { useState, useEffect } from 'react';
import { getProjects, deleteItem, updateProjectStatus } from '../../../src/services/dataService';
import { Project } from '../../../src/types';
import Loader from '../../../components/common/Loader';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { Search } from 'lucide-react';

const ManageProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'hide' | 'delete' | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const allProjects = await getProjects({ includePending: true });
      setProjects(allProjects);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects(prevSelected =>
      prevSelected.includes(projectId)
        ? prevSelected.filter(id => id !== projectId)
        : [...prevSelected, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id));
    }
  };

  const openModal = (action: 'hide' | 'delete') => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  const handleConfirm = async () => {
    if (modalAction === 'hide') {
      await Promise.all(
        selectedProjects.map(id => updateProjectStatus(id, 'rejected'))
      );
    } else if (modalAction === 'delete') {
      await Promise.all(
        selectedProjects.map(id => deleteItem('projects', id))
      );
    }
    setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
    setSelectedProjects([]);
    closeModal();
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loader message="Loading projects..." />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Projects</h1>
      <div className="flex justify-between mb-4">
        <div className="relative w-full sm:max-w-sm">
          <div className="flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={20} />
            <input
              type="text"
              placeholder="Search for a project to manage..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="neu-inset-control w-full pl-10 pr-4 py-2"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('hide')}
            disabled={selectedProjects.length === 0}
            className="neu-button"
          >
            Hide Selected
          </button>
          <button
            onClick={() => openModal('delete')}
            disabled={selectedProjects.length === 0}
            className="neu-button"
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProjects.map(project => (
          <div key={project.id} className="neu-outset-card p-4 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={project.logo_url} alt={project.name} className="w-12 h-12 rounded-lg bg-surface object-contain p-1" />
                <h2 className="font-bold text-lg text-on-surface">{project.name}</h2>
              </div>
              <input
                type="checkbox"
                checked={selectedProjects.includes(project.id)}
                onChange={() => handleSelectProject(project.id)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={`Confirm ${modalAction}`}
        confirmText="Confirm"
      >
        Are you sure you want to {modalAction} the selected projects?
      </ConfirmationModal>
    </div>
  );
};

export default ManageProjectsPage;