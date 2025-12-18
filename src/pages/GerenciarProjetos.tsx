import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  FolderKanban,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import apiService from '../services/api';
import { showToast, showConfirm } from '../utils/toast';
import { usePagination } from '../hooks/usePagination';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import { Project as ProjectType } from '../types';
import { ExportButton } from '../components/ExportButton';


export default function GerenciarProjetos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: projectsData, isLoading, refetch } = useProjects();
  const projects = (projectsData as ProjectType[]) || [];
  const deleteProjectMutation = useDeleteProject();

  const filteredProjects = useMemo(() => {
    return projects.filter((project: ProjectType) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, filterStatus]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage
  } = usePagination({
    items: filteredProjects,
    itemsPerPage: 10,
    initialPage: 1
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const mapStatusToApi = (status: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'ACTIVE',
      'completed': 'COMPLETED',
      'paused': 'ON_HOLD',
      'cancelled': 'CANCELLED',
      'planning': 'PLANNING',
      'ACTIVE': 'ACTIVE',
      'COMPLETED': 'COMPLETED',
      'ON_HOLD': 'ON_HOLD',
      'CANCELLED': 'CANCELLED',
      'PLANNING': 'PLANNING'
    };
    return statusMap[status] || status.toUpperCase();
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const apiStatus = mapStatusToApi(newStatus);
      await apiService.changeProjectStatus(projectId, apiStatus);
      showToast.success('Status do projeto atualizado com sucesso!');
      refetch();
    } catch (error: any) {
      console.error('Error changing project status:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao alterar status do projeto';
      showToast.error(message);
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirm('Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    
    deleteProjectMutation.mutate(projectId);
  };

  const handleView = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projetos/${projectId}`);
  };

  const handleEdit = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projetos/${projectId}/editar`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie todos os seus projetos</p>
        </div>
        <div className="flex items-center gap-3">
          {filteredProjects.length > 0 && (
            <ExportButton
              title="Relatório de Projetos"
              data={filteredProjects.map(p => ({
                ...p,
                clientName: (p as any).clientName || (p as any).client?.name || 'N/A',
                endDate: (p as any).endDate || (p as any).timeline?.endDate || ''
              }))}
              columns={['name', 'status', 'progress', 'clientName', 'endDate']}
              columnLabels={{
                name: 'Nome',
                status: 'Status',
                progress: 'Progresso (%)',
                clientName: 'Cliente',
                endDate: 'Data de Término'
              }}
            />
          )}
          <button
            onClick={() => navigate('/projetos/novo')}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2" size={20} />
            Novo Projeto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="paused">Pausado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projeto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FolderKanban className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">Nenhum projeto encontrado</p>
                  </td>
                </tr>
              ) : (
                (paginatedItems as ProjectType[]).map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderKanban className="text-blue-500 mr-3" size={20} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          {project.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(project as any).clientName || (project as any).client?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(project.status)} cursor-pointer`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="planning">Planejamento</option>
                        <option value="active">Em Andamento</option>
                        <option value="paused">Pausado</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(project as any).endDate || project.timeline?.endDate 
                              ? new Date((project as any).endDate || project.timeline?.endDate || '').toLocaleDateString('pt-BR') 
                              : 'N/A'}
                          </div>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => handleView(project.id, e)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ver detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleEdit(project.id, e)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(project.id, e)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Deletar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
              <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> de{' '}
              <span className="font-medium">{totalItems}</span> projetos
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToFirstPage}
                disabled={!hasPreviousPage}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Primeira
              </button>
              <button
                onClick={previousPage}
                disabled={!hasPreviousPage}
                className="p-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-1 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={!hasNextPage}
                className="p-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={goToLastPage}
                disabled={!hasNextPage}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Última
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

