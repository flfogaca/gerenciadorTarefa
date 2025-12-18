import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react';

const areas = ['Negócios', 'Gestão', 'Planejamento', 'Criação', 'Produção', 'Arquitetura', 'Financeiro'];
const supplierCategories = ['Equipamentos', 'Design', 'Logística', 'Marketing', 'Tecnologia', 'Produção', 'Catering', 'Outros'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ativo': return 'bg-green-100 text-green-800';
    case 'Inativo': return 'bg-red-100 text-red-800';
    case 'Férias': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getAreaColor = (area: string) => {
  const colors: Record<string, string> = {
    'Negócios': 'bg-purple-100 text-purple-800',
    'Gestão': 'bg-blue-100 text-blue-800',
    'Planejamento': 'bg-green-100 text-green-800',
    'Criação': 'bg-yellow-100 text-yellow-800',
    'Produção': 'bg-orange-100 text-orange-800',
    'Arquitetura': 'bg-pink-100 text-pink-800',
    'Financeiro': 'bg-indigo-100 text-indigo-800'
  };
  return colors[area] || 'bg-gray-100 text-gray-800';
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Equipamentos': 'bg-blue-100 text-blue-800',
    'Design': 'bg-purple-100 text-purple-800',
    'Logística': 'bg-green-100 text-green-800',
    'Marketing': 'bg-yellow-100 text-yellow-800',
    'Tecnologia': 'bg-indigo-100 text-indigo-800',
    'Produção': 'bg-orange-100 text-orange-800',
    'Catering': 'bg-pink-100 text-pink-800',
    'Outros': 'bg-gray-100 text-gray-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export default function Administrativo() {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'clients' | 'suppliers'>('collaborators');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [newCollaborator, setNewCollaborator] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    position: '',
    department: '',
    password: ''
  });
  const [newClient, setNewClient] = useState({
    name: '',
    cnpj: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: '30 dias'
  });
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    cnpj: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    products: '',
    paymentTerms: '30 dias'
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      if (activeTab === 'collaborators') {
        const usersRes = await apiService.getUsers();
        setUsers(usersRes?.data?.users || []);
      } else if (activeTab === 'clients') {
        const clientsRes = await apiService.getClients();
        setClients(clientsRes?.data?.clients || clientsRes?.data || []);
      } else if (activeTab === 'suppliers') {
        const suppliersRes = await apiService.getSuppliers();
        setSuppliers(suppliersRes?.data?.suppliers || suppliersRes?.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCollaborators = users.filter((user: any) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'all' || user.department === selectedArea;
    return matchesSearch && matchesArea;
  });

  const filteredClients = clients.filter((client: any) => {
    return client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           client.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           client.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredSuppliers = suppliers.filter((supplier: any) => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCollaborator = async () => {
    try {
      const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
      const roleMap: Record<string, string> = {
        'employee': 'EMPLOYEE',
        'manager': 'MANAGER',
        'admin': 'TENANT_ADMIN',
        'director': 'SUPER_ADMIN'
      };
      
      await apiService.createUser({
        email: newCollaborator.email,
        password: newCollaborator.password,
        name: newCollaborator.name,
        role: roleMap[newCollaborator.role] || 'EMPLOYEE',
        phone: newCollaborator.phone,
        position: newCollaborator.position,
        department: newCollaborator.department,
        tenantId
      });
      
      setShowCollaboratorModal(false);
      setNewCollaborator({
        name: '',
        email: '',
        phone: '',
        role: 'employee',
        position: '',
        department: '',
        password: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating collaborator:', error);
      alert('Erro ao criar colaborador');
    }
  };

  const handleAddClient = async () => {
    try {
      const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
      await apiService.createClient({
        name: newClient.name,
        cnpj: newClient.cnpj,
        contactName: newClient.contactName,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address,
        paymentTerms: newClient.paymentTerms,
        tenantId
      });
      
      setShowClientModal(false);
      setNewClient({
        name: '',
        cnpj: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        paymentTerms: '30 dias'
      });
      loadData();
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Erro ao criar cliente');
    }
  };

  const handleAddSupplier = async () => {
    try {
      const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
      await apiService.createSupplier({
        name: newSupplier.name,
        cnpj: newSupplier.cnpj,
        contactName: newSupplier.contactName,
        email: newSupplier.email,
        phone: newSupplier.phone,
        address: newSupplier.address,
        category: newSupplier.category,
        products: newSupplier.products,
        paymentTerms: newSupplier.paymentTerms,
        tenantId
      });
      
      setShowSupplierModal(false);
      setNewSupplier({
        name: '',
        cnpj: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        category: '',
        products: '',
        paymentTerms: '30 dias'
      });
      loadData();
    } catch (error) {
      console.error('Error creating supplier:', error);
      alert('Erro ao criar fornecedor');
    }
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return;
    try {
      await apiService.deleteUser(id);
      loadData();
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      alert('Erro ao excluir colaborador');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await apiService.deleteClient(id);
      loadData();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    try {
      await apiService.deleteSupplier(id);
      loadData();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Erro ao excluir fornecedor');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administrativo</h1>
        <p className="text-gray-600 mt-2">Gerencie colaboradores, clientes e fornecedores</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('collaborators')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'collaborators' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users size={16} className="inline mr-2" />
                Colaboradores ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'clients' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 size={16} className="inline mr-2" />
                Clientes ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'suppliers' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 size={16} className="inline mr-2" />
                Fornecedores ({suppliers.length})
              </button>
            </div>
            <div className="flex space-x-2">
              {activeTab === 'collaborators' && (
                <button
                  onClick={() => {
                    setEditingCollaborator(null);
                    setNewCollaborator({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'employee',
                      position: '',
                      department: '',
                      password: ''
                    });
                    setShowCollaboratorModal(true);
                  }}
                  className="btn-primary flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Colaborador
                </button>
              )}
              {activeTab === 'clients' && (
                <button
                  onClick={() => {
                    setEditingClient(null);
                    setNewClient({
                      name: '',
                      cnpj: '',
                      contactName: '',
                      email: '',
                      phone: '',
                      address: '',
                      paymentTerms: '30 dias'
                    });
                    setShowClientModal(true);
                  }}
                  className="btn-primary flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Cliente
                </button>
              )}
              {activeTab === 'suppliers' && (
                <button
                  onClick={() => {
                    setEditingSupplier(null);
                    setNewSupplier({
                      name: '',
                      cnpj: '',
                      contactName: '',
                      email: '',
                      phone: '',
                      address: '',
                      category: '',
                      products: '',
                      paymentTerms: '30 dias'
                    });
                    setShowSupplierModal(true);
                  }}
                  className="btn-primary flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Novo Fornecedor
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {activeTab === 'collaborators' && (
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as Áreas</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            )}
            {activeTab === 'suppliers' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as Categorias</option>
                {supplierCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}
          </div>

          {activeTab === 'collaborators' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cargo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Área</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollaborators.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{user.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{user.position || '-'}</td>
                      <td className="py-3 px-4">
                        {user.department && (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAreaColor(user.department)}`}>
                            {user.department}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('Ativo')}`}>
                          Ativo
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeleteCollaborator(user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCollaborators.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Nenhum colaborador encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">CNPJ</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Contato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client: any) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{client.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{client.cnpj || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{client.contactName || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{client.email || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('Ativo')}`}>
                          Ativo
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">CNPJ</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Contato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier: any) => (
                    <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{supplier.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{supplier.cnpj || '-'}</td>
                      <td className="py-3 px-4">
                        {supplier.category && (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(supplier.category)}`}>
                            {supplier.category}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{supplier.contactName || supplier.email || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('Ativo')}`}>
                          Ativo
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Nenhum fornecedor encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCollaborator ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h2>
                <button
                  onClick={() => setShowCollaboratorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={newCollaborator.name}
                      onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newCollaborator.email}
                      onChange={(e) => setNewCollaborator({...newCollaborator, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={newCollaborator.phone}
                      onChange={(e) => setNewCollaborator({...newCollaborator, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Perfil</label>
                    <select
                      value={newCollaborator.role}
                      onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="employee">Funcionário</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                    <input
                      type="text"
                      value={newCollaborator.position}
                      onChange={(e) => setNewCollaborator({...newCollaborator, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                    <select
                      value={newCollaborator.department}
                      onChange={(e) => setNewCollaborator({...newCollaborator, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      {areas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {!editingCollaborator && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <input
                      type="password"
                      value={newCollaborator.password}
                      onChange={(e) => setNewCollaborator({...newCollaborator, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={8}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCollaboratorModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCollaborator}
                  className="btn-primary"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                    <input
                      type="text"
                      value={newClient.cnpj}
                      onChange={(e) => setNewClient({...newClient, cnpj: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Contato</label>
                    <input
                      type="text"
                      value={newClient.contactName}
                      onChange={(e) => setNewClient({...newClient, contactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condições de Pagamento</label>
                    <input
                      type="text"
                      value={newClient.paymentTerms}
                      onChange={(e) => setNewClient({...newClient, paymentTerms: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 30 dias"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowClientModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddClient}
                  className="btn-primary"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h2>
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                    <input
                      type="text"
                      value={newSupplier.cnpj}
                      onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={newSupplier.category}
                      onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      {supplierCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Contato</label>
                    <input
                      type="text"
                      value={newSupplier.contactName}
                      onChange={(e) => setNewSupplier({...newSupplier, contactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Produtos/Serviços</label>
                  <textarea
                    value={newSupplier.products}
                    onChange={(e) => setNewSupplier({...newSupplier, products: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descreva os produtos ou serviços oferecidos"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condições de Pagamento</label>
                    <input
                      type="text"
                      value={newSupplier.paymentTerms}
                      onChange={(e) => setNewSupplier({...newSupplier, paymentTerms: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 30 dias"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSupplier}
                  className="btn-primary"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
