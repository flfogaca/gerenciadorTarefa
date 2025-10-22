import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Calendar, 
  User, 
  Flag, 
  Clock,
  FileText,
  Tag
} from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Pedro Costa', email: 'pedro@gestorpro.com', avatar: 'PC', role: 'Funcionário' },
  { id: 2, name: 'Maria Santos', email: 'maria@gestorpro.com', avatar: 'MS', role: 'Gestor' },
  { id: 3, name: 'Ana Oliveira', email: 'ana@gestorpro.com', avatar: 'AO', role: 'Diretor' },
  { id: 4, name: 'João Silva', email: 'joao@gestorpro.com', avatar: 'JS', role: 'Administrador' }
];

const mockProjects = [
  { id: 1, name: 'Evento Corporativo Q1', color: 'blue' },
  { id: 2, name: 'Lançamento Produto', color: 'green' },
  { id: 3, name: 'Workshop Digital', color: 'purple' },
  { id: 4, name: 'Sistema Interno', color: 'orange' }
];

const mockTasks = [
  { id: 1, code: 'TSK-001' },
  { id: 2, code: 'TSK-002' },
  { id: 3, code: 'TSK-003' },
  { id: 4, code: 'TSK-004' }
];

export default function CreateTask() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    priority: 'Média',
    dueDate: '',
    estimatedHours: 0,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  const handleSave = async () => {
    if (!newTask.title || !newTask.project || !newTask.assignee) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    
    // Simular salvamento
    setTimeout(() => {
      console.log('Nova tarefa criada:', {
        ...newTask,
        id: Math.max(...mockTasks.map(t => t.id)) + 1,
        code: `TSK-${String(Math.max(...mockTasks.map(t => t.id)) + 1).padStart(3, '0')}`,
        status: 'Pendente',
        createdDate: new Date().toISOString().split('T')[0],
        attachments: 0,
        comments: 0,
        progress: 0,
        completedHours: 0
      });
      setIsSaving(false);
      navigate('/tarefas');
    }, 1000);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newTask.tags.includes(newTag.trim())) {
      setNewTask({ ...newTask, tags: [...newTask.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask({ ...newTask, tags: newTask.tags.filter(tag => tag !== tagToRemove) });
  };

  const selectedProject = mockProjects.find(p => p.id.toString() === newTask.project);
  const selectedAssignee = mockUsers.find(u => u.id.toString() === newTask.assignee);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/tarefas')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Tarefa</h1>
            <p className="text-gray-600">Crie uma nova tarefa para seu projeto</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/tarefas')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <X size={20} className="mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Tarefa'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o título da tarefa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Descreva os detalhes da tarefa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projeto *
                  </label>
                  <select
                    value={newTask.project}
                    onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um projeto</option>
                    {mockProjects.map(project => (
                      <option key={project.id} value={project.id.toString()}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável *
                  </label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um responsável</option>
                    {mockUsers.map(user => (
                      <option key={user.id} value={user.id.toString()}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas Estimadas
                  </label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite uma tag e pressione Enter"
                />
                <button
                  onClick={handleAddTag}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Tag size={20} className="mr-2" />
                  Adicionar
                </button>
              </div>

              {newTask.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newTask.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {newTask.title || 'Sem título'}
                  </p>
                  <p className="text-xs text-gray-600">Título</p>
                </div>
              </div>

              {selectedProject && (
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full bg-${selectedProject.color}-500`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.name}</p>
                    <p className="text-xs text-gray-600">Projeto</p>
                  </div>
                </div>
              )}

              {selectedAssignee && (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{selectedAssignee.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedAssignee.name}</p>
                    <p className="text-xs text-gray-600">Responsável</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Flag size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{newTask.priority}</p>
                  <p className="text-xs text-gray-600">Prioridade</p>
                </div>
              </div>

              {newTask.dueDate && (
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(newTask.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600">Vencimento</p>
                  </div>
                </div>
              )}

              {newTask.estimatedHours > 0 && (
                <div className="flex items-center space-x-3">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{newTask.estimatedHours}h</p>
                    <p className="text-xs text-gray-600">Estimativa</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags Preview */}
          {newTask.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {newTask.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
