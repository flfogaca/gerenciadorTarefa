import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Truck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import apiService from '../services/api';
import { showToast, showConfirm } from '../utils/toast';
import { usePagination } from '../hooks/usePagination';
import { Supplier } from '../types';
import { ExportButton } from '../components/ExportButton';
import { useSuppliers, useDeleteSupplier } from '../hooks/useSuppliers';


export default function GerenciarFornecedores() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    services: [] as string[],
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    }
  });

  const [newService, setNewService] = useState('');

  const availableServices = [
    'Desenvolvimento de Software',
    'Design Gráfico',
    'Marketing Digital',
    'Consultoria',
    'Suporte Técnico',
    'Infraestrutura',
    'Segurança',
    'Análise de Dados',
    'Testes de Software',
    'DevOps'
  ];

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSuppliers();
      setSuppliers((response as any).suppliers || []);
    } catch (error: any) {
      console.error('Error loading suppliers:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar fornecedores';
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    createSupplierMutation.mutate(formData, {
      onSuccess: () => {
        setShowCreateModal(false);
        resetForm();
      }
    });
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    
    updateSupplierMutation.mutate(
      { supplierId: editingSupplier.id, data: formData },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setEditingSupplier(null);
          resetForm();
        }
      }
    );
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    const confirmed = await showConfirm('Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    
    deleteSupplierMutation.mutate(supplierId);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      services: [],
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil'
      }
    });
    setNewService('');
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      cnpj: supplier.cnpj || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      services: supplier.services || [],
      address: supplier.address || {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil'
      }
    });
    setShowEditModal(true);
  };

  const openViewModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  const addService = () => {
    if (newService && !formData.services.includes(newService)) {
      setFormData({
        ...formData,
        services: [...formData.services, newService]
      });
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s !== service)
    });
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.cnpj?.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && supplier.isActive) ||
                           (filterStatus === 'inactive' && !supplier.isActive);
      
      const matchesService = filterService === 'all' || 
                            supplier.services?.includes(filterService);
      
      return matchesSearch && matchesStatus && matchesService;
    });
  }, [suppliers, searchTerm, filterStatus, filterService]);

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedSuppliers,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage
  } = usePagination({
    items: filteredSuppliers,
    itemsPerPage: 10,
    initialPage: 1
  });

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Ativo' : 'Inativo';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Fornecedores</h1>
            <p className="text-gray-600">Gerencie os fornecedores da sua empresa</p>
          </div>
          <div className="flex items-center gap-3">
            {filteredSuppliers.length > 0 && (
              <ExportButton
                title="Relatório de Fornecedores"
                data={filteredSuppliers.map(s => ({
                  name: s.name,
                  cnpj: s.cnpj || 'N/A',
                  email: s.email || 'N/A',
                  phone: s.phone || 'N/A',
                  services: s.services?.join(', ') || 'N/A',
                  status: s.isActive ? 'Ativo' : 'Inativo'
                }))}
                columns={['name', 'cnpj', 'email', 'phone', 'services', 'status']}
                columnLabels={{
                  name: 'Nome',
                  cnpj: 'CNPJ',
                  email: 'Email',
                  phone: 'Telefone',
                  services: 'Serviços',
                  status: 'Status'
                }}
                variant="icon"
              />
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Novo Fornecedor
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os Serviços</option>
          {availableServices.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviços
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Truck className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {supplier.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} className="text-gray-400" />
                          {supplier.email}
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />
                          {supplier.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.cnpj || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {supplier.services?.slice(0, 2).map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <Tag size={12} className="mr-1" />
                          {service}
                        </span>
                      ))}
                      {supplier.services && supplier.services.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{supplier.services.length - 2} mais
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.isActive)}`}>
                      {getStatusIcon(supplier.isActive)}
                      {getStatusText(supplier.isActive)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(supplier.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(supplier)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(supplier)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
              <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> de{' '}
              <span className="font-medium">{totalItems}</span> fornecedores
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Novo Fornecedor</h2>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviços
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um serviço</option>
                    {availableServices.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addService}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, street: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.address.number}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, number: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.address.complement}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, complement: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.address.neighborhood}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, neighborhood: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, zipCode: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Criar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Fornecedor</h2>
            <form onSubmit={handleUpdateSupplier} className="space-y-4">
              {/* Same form fields as create modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSupplier(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Detalhes do Fornecedor</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{selectedSupplier.name}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSupplier.isActive)}`}>
                  {getStatusIcon(selectedSupplier.isActive)}
                  {getStatusText(selectedSupplier.isActive)}
                </span>
              </div>
              
              {selectedSupplier.cnpj && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                  <p className="text-gray-900">{selectedSupplier.cnpj}</p>
                </div>
              )}
              
              {selectedSupplier.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedSupplier.email}</p>
                </div>
              )}
              
              {selectedSupplier.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <p className="text-gray-900">{selectedSupplier.phone}</p>
                </div>
              )}
              
              {selectedSupplier.services && selectedSupplier.services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serviços</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedSupplier.services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag size={12} className="mr-1" />
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSupplier.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <p className="text-gray-900">
                    {[
                      selectedSupplier.address.street,
                      selectedSupplier.address.number,
                      selectedSupplier.address.complement,
                      selectedSupplier.address.neighborhood,
                      selectedSupplier.address.city,
                      selectedSupplier.address.state,
                      selectedSupplier.address.zipCode
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Criado em</label>
                <p className="text-gray-900">{new Date(selectedSupplier.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
