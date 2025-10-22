import { useState } from 'react';
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

const mockCollaborators = [
  {
    id: 1,
    name: 'Maria Silva',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    position: 'Gerente de Projetos',
    area: 'Gestão',
    email: 'maria.silva@empresa.com',
    phone: '(11) 99999-9999',
    bankAccount: 'Banco do Brasil - 12345-6',
    pix: 'maria.silva@empresa.com',
    documents: 5,
    contracts: 2,
    status: 'Ativo'
  },
  {
    id: 2,
    name: 'João Santos',
    cpf: '987.654.321-00',
    rg: '98.765.432-1',
    position: 'Designer',
    area: 'Criação',
    email: 'joao.santos@empresa.com',
    phone: '(11) 88888-8888',
    bankAccount: 'Itaú - 54321-0',
    pix: 'joao.santos@empresa.com',
    documents: 3,
    contracts: 1,
    status: 'Ativo'
  },
  {
    id: 3,
    name: 'Ana Costa',
    cpf: '456.789.123-00',
    rg: '45.678.912-3',
    position: 'Planejadora',
    area: 'Planejamento',
    email: 'ana.costa@empresa.com',
    phone: '(11) 77777-7777',
    bankAccount: 'Bradesco - 98765-4',
    pix: 'ana.costa@empresa.com',
    documents: 4,
    contracts: 2,
    status: 'Ativo'
  }
];

const mockClients = [
  {
    id: 1,
    name: 'TechCorp Brasil',
    cnpj: '12.345.678/0001-90',
    contactName: 'Carlos Lima',
    email: 'carlos.lima@techcorp.com',
    phone: '(11) 3333-3333',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    paymentTerms: '30 dias',
    projects: 3,
    documents: 8,
    status: 'Ativo'
  },
  {
    id: 2,
    name: 'Inovação Ltda',
    cnpj: '98.765.432/0001-10',
    contactName: 'Patricia Oliveira',
    email: 'patricia@inovacao.com',
    phone: '(11) 2222-2222',
    address: 'Rua das Flores, 500 - Rio de Janeiro/RJ',
    paymentTerms: '15 dias',
    projects: 2,
    documents: 5,
    status: 'Ativo'
  },
  {
    id: 3,
    name: 'Academia Digital',
    cnpj: '11.222.333/0001-44',
    contactName: 'Roberto Silva',
    email: 'roberto@academiadigital.com',
    phone: '(11) 1111-1111',
    address: 'Rua da Tecnologia, 200 - Belo Horizonte/MG',
    paymentTerms: '45 dias',
    projects: 1,
    documents: 3,
    status: 'Ativo'
  }
];

const areas = ['Negócios', 'Gestão', 'Planejamento', 'Criação', 'Produção', 'Arquitetura', 'Financeiro'];

const mockSuppliers = [
  {
    id: 1,
    name: 'Equipamentos Pro Ltda',
    cnpj: '12.345.678/0001-90',
    contactName: 'Roberto Santos',
    email: 'contato@equipamentospro.com',
    phone: '(11) 4444-4444',
    address: 'Rua Industrial, 1000 - São Paulo/SP',
    category: 'Equipamentos',
    products: 'Som, iluminação, palcos',
    paymentTerms: '30 dias',
    documents: 6,
    contracts: 3,
    status: 'Ativo'
  },
  {
    id: 2,
    name: 'Design Digital Studio',
    cnpj: '98.765.432/0001-10',
    contactName: 'Ana Costa',
    email: 'ana@designdigital.com',
    phone: '(11) 5555-5555',
    address: 'Av. Paulista, 2000 - São Paulo/SP',
    category: 'Design',
    products: 'Identidade visual, materiais gráficos',
    paymentTerms: '15 dias',
    documents: 4,
    contracts: 2,
    status: 'Ativo'
  },
  {
    id: 3,
    name: 'Logística Express',
    cnpj: '11.222.333/0001-44',
    contactName: 'Carlos Lima',
    email: 'carlos@logisticaexpress.com',
    phone: '(11) 6666-6666',
    address: 'Rua da Logística, 500 - Guarulhos/SP',
    category: 'Logística',
    products: 'Transporte, montagem, desmontagem',
    paymentTerms: '45 dias',
    documents: 5,
    contracts: 1,
    status: 'Ativo'
  }
];

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
  const colors = {
    'Negócios': 'bg-purple-100 text-purple-800',
    'Gestão': 'bg-blue-100 text-blue-800',
    'Planejamento': 'bg-green-100 text-green-800',
    'Criação': 'bg-yellow-100 text-yellow-800',
    'Produção': 'bg-orange-100 text-orange-800',
    'Arquitetura': 'bg-pink-100 text-pink-800',
    'Financeiro': 'bg-indigo-100 text-indigo-800'
  };
  return colors[area as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getCategoryColor = (category: string) => {
  const colors = {
    'Equipamentos': 'bg-blue-100 text-blue-800',
    'Design': 'bg-purple-100 text-purple-800',
    'Logística': 'bg-green-100 text-green-800',
    'Marketing': 'bg-yellow-100 text-yellow-800',
    'Tecnologia': 'bg-indigo-100 text-indigo-800',
    'Produção': 'bg-orange-100 text-orange-800',
    'Catering': 'bg-pink-100 text-pink-800',
    'Outros': 'bg-gray-100 text-gray-800'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export default function Administrativo() {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'clients' | 'suppliers'>('collaborators');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<number | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<number | null>(null);
  const [newCollaborator, setNewCollaborator] = useState({
    name: '',
    cpf: '',
    rg: '',
    position: '',
    area: '',
    email: '',
    phone: '',
    bankAccount: '',
    pix: '',
    address: '',
    status: 'Ativo'
  });
  const [newClient, setNewClient] = useState({
    name: '',
    cnpj: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: '',
    status: 'Ativo'
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
    paymentTerms: '',
    status: 'Ativo'
  });

  const filteredCollaborators = mockCollaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          collaborator.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'all' || collaborator.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const filteredClients = mockClients.filter(client => {
    return client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           client.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredSuppliers = mockSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCollaborator = () => {
    console.log('Adicionar colaborador:', newCollaborator);
    setNewCollaborator({
      name: '',
      cpf: '',
      rg: '',
      position: '',
      area: '',
      email: '',
      phone: '',
      bankAccount: '',
      pix: '',
      address: '',
      status: 'Ativo'
    });
    setShowCollaboratorModal(false);
  };

  const handleAddClient = () => {
    console.log('Adicionar cliente:', newClient);
    setNewClient({
      name: '',
      cnpj: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: '',
      status: 'Ativo'
    });
    setShowClientModal(false);
  };

  const handleAddSupplier = () => {
    console.log('Adicionar fornecedor:', newSupplier);
    setNewSupplier({
      name: '',
      cnpj: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      products: '',
      paymentTerms: '',
      status: 'Ativo'
    });
    setShowSupplierModal(false);
  };

  const handleEditCollaborator = (id: number) => {
    console.log('Editar colaborador:', id);
    setEditingCollaborator(id);
    setShowCollaboratorModal(true);
  };

  const handleEditClient = (id: number) => {
    console.log('Editar cliente:', id);
    setEditingClient(id);
    setShowClientModal(true);
  };

  const handleEditSupplier = (id: number) => {
    console.log('Editar fornecedor:', id);
    setEditingSupplier(id);
    setShowSupplierModal(true);
  };

  const handleDeleteCollaborator = (id: number) => {
    console.log('Excluir colaborador:', id);
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      console.log('Colaborador excluído:', id);
    }
  };

  const handleDeleteClient = (id: number) => {
    console.log('Excluir cliente:', id);
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      console.log('Cliente excluído:', id);
    }
  };

  const handleDeleteSupplier = (id: number) => {
    console.log('Excluir fornecedor:', id);
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      console.log('Fornecedor excluído:', id);
    }
  };

  const handleViewCollaborator = (id: number) => {
    console.log('Visualizar colaborador:', id);
  };

  const handleViewClient = (id: number) => {
    console.log('Visualizar cliente:', id);
  };

  const handleViewSupplier = (id: number) => {
    console.log('Visualizar fornecedor:', id);
  };

  const handleUploadDocuments = () => {
    console.log('Upload de documentos');
    setShowUploadModal(true);
  };

  const handleImportCSV = () => {
    console.log('Importar CSV');
  };

  const handleExportData = () => {
    console.log('Exportar dados');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrativo</h1>
          <p className="text-gray-600 mt-2">Cadastro de colaboradores e clientes</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleImportCSV}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Upload size={20} className="mr-2" />
            Importar CSV
          </button>
          <button 
            onClick={() => {
              if (activeTab === 'collaborators') setShowCollaboratorModal(true);
              else if (activeTab === 'clients') setShowClientModal(true);
              else if (activeTab === 'suppliers') setShowSupplierModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            {activeTab === 'collaborators' ? 'Novo Colaborador' : 
             activeTab === 'clients' ? 'Novo Cliente' : 'Novo Fornecedor'}
          </button>
        </div>
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
                Colaboradores
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'clients' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'suppliers' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Fornecedores
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportData}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <Download size={20} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={activeTab === 'collaborators' ? 'Buscar colaboradores...' : 
                           activeTab === 'clients' ? 'Buscar clientes...' : 'Buscar fornecedores...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {activeTab === 'collaborators' && (
              <select 
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                {supplierCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}
          </div>

          {activeTab === 'collaborators' && (
            <div className="space-y-4">
              {filteredCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAreaColor(collaborator.area)}`}>
                            {collaborator.area}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(collaborator.status)}`}>
                            {collaborator.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{collaborator.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{collaborator.position}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2" />
                            {collaborator.email}
                          </div>
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2" />
                            {collaborator.phone}
                          </div>
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2" />
                            CPF: {collaborator.cpf}
                          </div>
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2" />
                            RG: {collaborator.rg}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{collaborator.documents} documentos</span>
                          <span>{collaborator.contracts} contratos</span>
                          <span>PIX: {collaborator.pix}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewCollaborator(collaborator.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={() => handleEditCollaborator(collaborator.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCollaborator(collaborator.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Building2 className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Contato: {client.contactName}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2" />
                            {client.email}
                          </div>
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2" />
                            {client.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2" />
                            {client.address}
                          </div>
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2" />
                            CNPJ: {client.cnpj}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{client.projects} projetos</span>
                          <span>{client.documents} documentos</span>
                          <span>Pagamento: {client.paymentTerms}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewClient(client.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={() => handleEditClient(client.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Building2 className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(supplier.category)}`}>
                            {supplier.category}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                            {supplier.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Contato: {supplier.contactName}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2" />
                            {supplier.email}
                          </div>
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2" />
                            {supplier.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2" />
                            {supplier.address}
                          </div>
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2" />
                            CNPJ: {supplier.cnpj}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{supplier.documents} documentos</span>
                          <span>{supplier.contracts} contratos</span>
                          <span>Pagamento: {supplier.paymentTerms}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Produtos/Serviços:</strong> {supplier.products}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewSupplier(supplier.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        onClick={() => handleEditSupplier(supplier.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Colaboradores por Área</h3>
          <div className="space-y-3">
            {areas.map((area, index) => (
              <div key={area} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'][index]
                  }`}></div>
                  <span className="text-sm text-gray-600">{area}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{Math.floor(Math.random() * 8) + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Colaboradores</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Ativos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">28</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Férias</span>
              </div>
              <span className="text-sm font-medium text-gray-900">3</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Inativos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">2</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clientes Ativos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Clientes Ativos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">15</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Projetos Ativos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Novos Este Mês</span>
              </div>
              <span className="text-sm font-medium text-gray-900">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cadastro de Colaborador */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingCollaborator ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h2>
                <button
                  onClick={() => {
                    setShowCollaboratorModal(false);
                    setEditingCollaborator(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={newCollaborator.name}
                      onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Maria Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                    <input
                      type="text"
                      value={newCollaborator.cpf}
                      onChange={(e) => setNewCollaborator({...newCollaborator, cpf: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">RG</label>
                    <input
                      type="text"
                      value={newCollaborator.rg}
                      onChange={(e) => setNewCollaborator({...newCollaborator, rg: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="00.000.000-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                    <input
                      type="text"
                      value={newCollaborator.position}
                      onChange={(e) => setNewCollaborator({...newCollaborator, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Gerente de Projetos"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
                    <select
                      value={newCollaborator.area}
                      onChange={(e) => setNewCollaborator({...newCollaborator, area: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma área</option>
                      {areas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={newCollaborator.status}
                      onChange={(e) => setNewCollaborator({...newCollaborator, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Férias">Férias</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newCollaborator.email}
                      onChange={(e) => setNewCollaborator({...newCollaborator, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={newCollaborator.phone}
                      onChange={(e) => setNewCollaborator({...newCollaborator, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={newCollaborator.address}
                    onChange={(e) => setNewCollaborator({...newCollaborator, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conta Bancária</label>
                    <input
                      type="text"
                      value={newCollaborator.bankAccount}
                      onChange={(e) => setNewCollaborator({...newCollaborator, bankAccount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Banco - 12345-6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIX</label>
                    <input
                      type="text"
                      value={newCollaborator.pix}
                      onChange={(e) => setNewCollaborator({...newCollaborator, pix: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCollaboratorModal(false);
                    setEditingCollaborator(null);
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCollaborator}
                  className="btn-primary w-full sm:w-auto"
                >
                  {editingCollaborator ? 'Atualizar' : 'Salvar'} Colaborador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setEditingClient(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: TechCorp Brasil"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                    <input
                      type="text"
                      value={newClient.cnpj}
                      onChange={(e) => setNewClient({...newClient, cnpj: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="00.000.000/0000-00"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Carlos Lima"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contato@empresa.com"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 3333-3333"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condições de Pagamento</label>
                    <select
                      value={newClient.paymentTerms}
                      onChange={(e) => setNewClient({...newClient, paymentTerms: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="15 dias">15 dias</option>
                      <option value="30 dias">30 dias</option>
                      <option value="45 dias">45 dias</option>
                      <option value="60 dias">60 dias</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rua, número, bairro, cidade, estado"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newClient.status}
                    onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setEditingClient(null);
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddClient}
                  className="btn-primary w-full sm:w-auto"
                >
                  {editingClient ? 'Atualizar' : 'Salvar'} Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Fornecedor */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h2>
                <button
                  onClick={() => {
                    setShowSupplierModal(false);
                    setEditingSupplier(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
                    <input
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Equipamentos Pro Ltda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                    <input
                      type="text"
                      value={newSupplier.cnpj}
                      onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Contato</label>
                    <input
                      type="text"
                      value={newSupplier.contactName}
                      onChange={(e) => setNewSupplier({...newSupplier, contactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Roberto Santos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contato@empresa.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 4444-4444"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={newSupplier.category}
                      onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      {supplierCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rua, número, bairro, cidade, estado"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Produtos/Serviços</label>
                  <textarea
                    rows={3}
                    value={newSupplier.products}
                    onChange={(e) => setNewSupplier({...newSupplier, products: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva os produtos ou serviços oferecidos..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condições de Pagamento</label>
                    <select
                      value={newSupplier.paymentTerms}
                      onChange={(e) => setNewSupplier({...newSupplier, paymentTerms: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="15 dias">15 dias</option>
                      <option value="30 dias">30 dias</option>
                      <option value="45 dias">45 dias</option>
                      <option value="60 dias">60 dias</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={newSupplier.status}
                      onChange={(e) => setNewSupplier({...newSupplier, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowSupplierModal(false);
                    setEditingSupplier(null);
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSupplier}
                  className="btn-primary w-full sm:w-auto"
                >
                  {editingSupplier ? 'Atualizar' : 'Salvar'} Fornecedor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload de Documentos */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upload de Documentos</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione o tipo</option>
                    <option value="contract">Contrato</option>
                    <option value="personal">Documento Pessoal</option>
                    <option value="bank">Comprovante Bancário</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Arquivo</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição do documento..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    console.log('Upload realizado');
                    setShowUploadModal(false);
                  }}
                  className="btn-primary w-full sm:w-auto"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
