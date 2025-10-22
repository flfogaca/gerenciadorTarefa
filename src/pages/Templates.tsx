import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Star,
  Tag
} from 'lucide-react';

const mockTemplates = [
  {
    id: 1,
    name: 'Evento Corporativo',
    description: 'Template completo para eventos corporativos com todas as etapas necessárias',
    category: 'Eventos',
    duration: 45,
    phasesCount: 6,
    tasks: 24,
    teamSize: 8,
    isDefault: true,
    isPublic: true,
    createdAt: '2024-01-15',
    lastUsed: '2025-01-20',
    usageCount: 12,
    rating: 4.8,
    tags: ['evento', 'corporativo', 'planejamento'],
    phases: [
      { name: 'Negócios', tasks: 4, duration: 7 },
      { name: 'Gestão de Projeto', tasks: 3, duration: 5 },
      { name: 'Planejamento', tasks: 5, duration: 10 },
      { name: 'Criação', tasks: 6, duration: 15 },
      { name: 'Produção', tasks: 4, duration: 5 },
      { name: 'Arquitetura', tasks: 2, duration: 3 }
    ]
  },
  {
    id: 2,
    name: 'Lançamento de Produto',
    description: 'Template para lançamento de produtos com foco em marketing e comunicação',
    category: 'Marketing',
    duration: 30,
    phasesCount: 5,
    tasks: 18,
    teamSize: 6,
    isDefault: false,
    isPublic: true,
    createdAt: '2024-02-10',
    lastUsed: '2025-01-18',
    usageCount: 8,
    rating: 4.6,
    tags: ['produto', 'lançamento', 'marketing'],
    phases: [
      { name: 'Pesquisa', tasks: 3, duration: 5 },
      { name: 'Desenvolvimento', tasks: 4, duration: 8 },
      { name: 'Marketing', tasks: 5, duration: 10 },
      { name: 'Lançamento', tasks: 4, duration: 5 },
      { name: 'Pós-lançamento', tasks: 2, duration: 2 }
    ]
  },
  {
    id: 3,
    name: 'Workshop Digital',
    description: 'Template para workshops e treinamentos online',
    category: 'Educação',
    duration: 15,
    phasesCount: 4,
    tasks: 12,
    teamSize: 4,
    isDefault: false,
    isPublic: false,
    createdAt: '2024-03-05',
    lastUsed: '2025-01-15',
    usageCount: 5,
    rating: 4.4,
    tags: ['workshop', 'digital', 'treinamento'],
    phases: [
      { name: 'Planejamento', tasks: 3, duration: 3 },
      { name: 'Preparação', tasks: 4, duration: 5 },
      { name: 'Execução', tasks: 3, duration: 5 },
      { name: 'Follow-up', tasks: 2, duration: 2 }
    ]
  },
  {
    id: 4,
    name: 'Conferência Anual',
    description: 'Template para conferências e eventos de grande porte',
    category: 'Eventos',
    duration: 90,
    phasesCount: 8,
    tasks: 35,
    teamSize: 12,
    isDefault: false,
    isPublic: true,
    createdAt: '2024-01-20',
    lastUsed: '2024-12-10',
    usageCount: 3,
    rating: 4.9,
    tags: ['conferência', 'grande porte', 'evento'],
    phases: [
      { name: 'Concepção', tasks: 4, duration: 10 },
      { name: 'Planejamento', tasks: 6, duration: 15 },
      { name: 'Desenvolvimento', tasks: 8, duration: 20 },
      { name: 'Marketing', tasks: 5, duration: 15 },
      { name: 'Produção', tasks: 6, duration: 15 },
      { name: 'Execução', tasks: 4, duration: 10 },
      { name: 'Pós-evento', tasks: 2, duration: 5 }
    ]
  }
];

const categories = ['Todos', 'Eventos', 'Marketing', 'Educação', 'Tecnologia', 'Consultoria'];

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [templates, setTemplates] = useState(mockTemplates);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'Todos' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (templateId: number) => {
    setTemplates(templates.map(t => 
      t.id === templateId 
        ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString().split('T')[0] }
        : t
    ));
  };

  const handleDuplicateTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTemplate = {
        ...template,
        id: Math.max(...templates.map(t => t.id)) + 1,
        name: `${template.name} (Cópia)`,
        isDefault: false,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
    }
  };

  const handleDeleteTemplate = (templateId: number) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates de Projetos</h1>
          <p className="text-gray-600 mt-2">Crie fluxos prontos para tipos de eventos comuns</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Upload size={20} className="mr-2" />
            Importar
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus size={20} className="mr-2" />
            Novo Template
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <div className="w-4 h-4 space-y-1">
                    <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                    <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                    <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="text-blue-600" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {template.isDefault && (
                        <Star className="text-yellow-500" size={16} />
                      )}
                      {template.isPublic && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duração</span>
                      <span className="font-medium">{template.duration} dias</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fases</span>
                      <span className="font-medium">{template.phasesCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tarefas</span>
                      <span className="font-medium">{template.tasks}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Equipe</span>
                      <span className="font-medium">{template.teamSize} pessoas</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        <Tag size={10} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="text-yellow-500 mr-1" size={14} />
                      {template.rating}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1" size={14} />
                      {template.usageCount} usos
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUseTemplate(template.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Usar Template
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(template.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <FileText className="text-blue-600 mt-1" size={24} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {template.category}
                          </span>
                          {template.isDefault && (
                            <Star className="text-yellow-500" size={16} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center">
                            <Calendar className="text-gray-400 mr-2" size={16} />
                            <span className="text-gray-600">{template.duration} dias</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle2 className="text-gray-400 mr-2" size={16} />
                            <span className="text-gray-600">{template.phasesCount} fases</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="text-gray-400 mr-2" size={16} />
                            <span className="text-gray-600">{template.tasks} tarefas</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="text-gray-400 mr-2" size={16} />
                            <span className="text-gray-600">{template.teamSize} pessoas</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Star className="text-yellow-500 mr-1" size={14} />
                            {template.rating}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1" size={14} />
                            {template.usageCount} usos
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1" size={14} />
                            Último uso: {new Date(template.lastUsed).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Usar Template
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates Mais Usados</h3>
          <div className="space-y-3">
            {templates
              .sort((a, b) => b.usageCount - a.usageCount)
              .slice(0, 3)
              .map((template, index) => (
                <div key={template.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{template.name}</p>
                      <p className="text-xs text-gray-600">{template.usageCount} usos</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Categoria</h3>
          <div className="space-y-3">
            {categories.slice(1).map((category, index) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{category}</span>
                <span className="text-sm font-medium text-gray-900">
                  {templates.filter(t => t.category === category).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total de Templates</span>
              <span className="text-sm font-medium text-gray-900">{templates.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Templates Públicos</span>
              <span className="text-sm font-medium text-gray-900">{templates.filter(t => t.isPublic).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total de Usos</span>
              <span className="text-sm font-medium text-gray-900">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avaliação Média</span>
              <span className="text-sm font-medium text-gray-900">
                {(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
