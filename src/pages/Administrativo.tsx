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
  Eye
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

export default function Administrativo() {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'clients'>('collaborators');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrativo</h1>
          <p className="text-gray-600 mt-2">Cadastro de colaboradores e clientes</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Upload size={20} className="mr-2" />
            Importar CSV
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus size={20} className="mr-2" />
            {activeTab === 'collaborators' ? 'Novo Colaborador' : 'Novo Cliente'}
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
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
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
                placeholder={activeTab === 'collaborators' ? 'Buscar colaboradores...' : 'Buscar clientes...'}
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
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye size={20} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit size={20} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
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
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye size={20} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit size={20} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
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
    </div>
  );
}
