import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { showToast, showConfirm } from '../utils/toast';
import { 
  FileText, 
  Plus, 
  Copy, 
  Trash2, 
  Upload,
  Search,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Star,
  Tag
} from 'lucide-react';

interface Template {
  id: string;
  templateId: string;
  name: string;
  description: string;
  category: string;
  duration?: number;
  phasesCount?: number;
  tasks?: number | any[];
  teamSize?: number;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  lastUsedAt?: string | null;
  usageCount: number;
  rating: number;
  tags: string[];
  phases?: Array<{ name: string; tasks: number; duration: number }> | any[];
}

const categories = ['Todos', 'Eventos', 'Marketing', 'Educação', 'Tecnologia', 'Consultoria'];

export default function Templates() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const filters: any = {};
      if (selectedCategory !== 'Todos') {
        filters.category = selectedCategory;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await apiService.getTemplates(filters);
      const templatesData = (response as any)?.data?.templates || (response as any)?.data || [];
      
      const mappedTemplates = templatesData.map((t: any) => ({
        id: t.id,
        templateId: t.templateId,
        name: t.name,
        description: t.description || '',
        category: t.category,
        duration: t.phases?.reduce((sum: number, p: any) => sum + (p.duration || 0), 0) || 0,
        phasesCount: t.phases?.length || 0,
        tasks: Array.isArray(t.tasks) ? t.tasks.length : (t.tasks || 0),
        teamSize: 0,
        isDefault: t.isDefault || false,
        isPublic: t.isPublic || false,
        createdAt: t.createdAt || new Date().toISOString(),
        lastUsedAt: t.lastUsedAt,
        usageCount: t.usageCount || 0,
        rating: t.rating || 0,
        tags: t.tags || [],
        phases: t.phases || []
      }));
      
      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, searchTerm]);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'Todos' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.templateId === templateId || t.id === templateId);
      if (!template) {
        showToast.error('Template não encontrado');
        return;
      }
      
      navigate('/projetos/novo', { state: { templateId: template.templateId || template.id } });
    } catch (error) {
      console.error('Error using template:', error);
      showToast.error('Erro ao usar template');
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.templateId === templateId || t.id === templateId);
      if (!template) {
        showToast.error('Template não encontrado');
        return;
      }

      const newTemplateData = {
        name: `${template.name} (Cópia)`,
        description: template.description,
        category: template.category,
        phases: template.phases || [],
        tasks: Array.isArray(template.tasks) ? template.tasks : [],
        isPublic: false,
        tags: template.tags || []
      };

      await apiService.createTemplate(newTemplateData);
      await loadTemplates();
      showToast.success('Template duplicado com sucesso!');
    } catch (error) {
      console.error('Error duplicating template:', error);
      showToast.error('Erro ao duplicar template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const confirmed = await showConfirm('Tem certeza que deseja excluir este template?');
    if (!confirmed) return;
    
    try {
      const template = templates.find(t => t.templateId === templateId || t.id === templateId);
      if (!template) {
        showToast.error('Template não encontrado');
        return;
      }

      await apiService.deleteTemplate(template.templateId || template.id);
      await loadTemplates();
      showToast.success('Template excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast.error('Erro ao excluir template');
    }
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
          <button 
            onClick={() => navigate('/projetos/novo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
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
                      onClick={() => handleUseTemplate(template.templateId || template.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Usar Template
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(template.templateId || template.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.templateId || template.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Nenhum template encontrado
                </div>
              )}
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
                          {template.lastUsedAt && (
                            <div className="flex items-center">
                              <Clock className="mr-1" size={14} />
                              Último uso: {new Date(template.lastUsedAt).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleUseTemplate(template.templateId || template.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Usar Template
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template.templateId || template.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.templateId || template.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhum template encontrado
                </div>
              )}
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
            {categories.slice(1).map((category) => (
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
                {templates.length > 0 
                  ? (templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)
                  : '0.0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
