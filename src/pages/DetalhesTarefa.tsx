import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  MessageSquare, 
  Paperclip, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Play, 
  Pause,
  ArrowLeft,
  Tag,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockTask = {
  id: 1,
  title: 'Criar apresentação do projeto',
  description: 'Desenvolver apresentação completa para o cliente TechCorp incluindo análise de mercado, proposta de solução e cronograma de implementação.',
  project: 'Evento Corporativo Q1',
  assignee: { id: 1, name: 'Pedro Costa', avatar: 'PC', email: 'pedro@gestorpro.com' },
  status: 'Em andamento',
  priority: 'Alta',
  dueDate: '2024-01-25',
  createdDate: '2024-01-15',
  tags: ['apresentação', 'cliente', 'urgente'],
  attachments: [
    { id: 1, name: 'briefing_cliente.pdf', size: '2.3 MB', type: 'pdf' },
    { id: 2, name: 'template_apresentacao.pptx', size: '1.8 MB', type: 'pptx' },
    { id: 3, name: 'dados_mercado.xlsx', size: '945 KB', type: 'xlsx' }
  ],
  comments: [
    {
      id: 1,
      author: 'Maria Santos',
      avatar: 'MS',
      content: 'Lembrem-se de incluir os dados de ROI na apresentação',
      timestamp: '2024-01-20 14:30',
      isImportant: true
    },
    {
      id: 2,
      author: 'Pedro Costa',
      avatar: 'PC',
      content: 'Já incluí os dados solicitados. Aguardando feedback.',
      timestamp: '2024-01-20 16:45',
      isImportant: false
    },
    {
      id: 3,
      author: 'Ana Oliveira',
      avatar: 'AO',
      content: 'A apresentação está excelente! Podem prosseguir.',
      timestamp: '2024-01-21 09:15',
      isImportant: false
    }
  ],
  progress: 65,
  estimatedHours: 8,
  completedHours: 5,
  subtasks: [
    { id: 1, title: 'Coletar dados do cliente', completed: true },
    { id: 2, title: 'Criar estrutura da apresentação', completed: true },
    { id: 3, title: 'Desenvolver slides principais', completed: false },
    { id: 4, title: 'Revisar conteúdo', completed: false },
    { id: 5, title: 'Preparar apresentação final', completed: false }
  ],
  timeEntries: [
    { date: '2024-01-15', hours: 2, description: 'Coleta de dados e briefing' },
    { date: '2024-01-16', hours: 1.5, description: 'Estruturação da apresentação' },
    { date: '2024-01-20', hours: 1.5, description: 'Desenvolvimento dos slides' }
  ]
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em andamento': return 'bg-blue-100 text-blue-800';
    case 'Pendente': return 'bg-yellow-100 text-yellow-800';
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Pausado': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800';
    case 'Média': return 'bg-yellow-100 text-yellow-800';
    case 'Baixa': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'Alta': return '🔴';
    case 'Média': return '🟡';
    case 'Baixa': return '🟢';
    default: return '⚪';
  }
};

export default function DetalhesTarefa() {
  const navigate = useNavigate();
  const [task] = useState(mockTask);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const handleStartTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    console.log('Adicionar comentário:', newComment);
    setNewComment('');
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    console.log('Adicionar subtarefa:', newSubtask);
    setNewSubtask('');
    setShowAddSubtask(false);
  };

  const handleUpdateStatus = (newStatus: string) => {
    console.log('Atualizar status para:', newStatus);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/tarefas')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600 mt-1">Projeto: {task.project}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartTimer}
              className={`btn-primary flex items-center ${
                isTimerActive ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
            >
              {isTimerActive ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
              {isTimerActive ? 'Pausar' : 'Iniciar'} Timer
            </button>
            <button className="btn-secondary flex items-center">
              <Edit size={18} className="mr-2" />
              Editar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da Tarefa */}
          <div className="card animate-slide-up delay-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getPriorityIcon(task.priority)}</span>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateStatus('Concluído')}
                  className="btn-success text-sm px-3 py-1"
                >
                  <CheckCircle2 size={16} className="mr-1" />
                  Concluir
                </button>
                <button className="btn-secondary text-sm px-3 py-1">
                  <Trash2 size={16} className="mr-1" />
                  Excluir
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">{task.description}</p>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                    <Tag size={14} className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Progresso */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Progresso</h3>
                <span className="text-sm text-gray-600">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>{task.completedHours}h trabalhadas</span>
                <span>{task.estimatedHours}h estimadas</span>
              </div>
            </div>
          </div>

          {/* Subtarefas */}
          <div className="card animate-slide-up delay-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subtarefas</h3>
              <button
                onClick={() => setShowAddSubtask(true)}
                className="btn-primary text-sm px-3 py-1"
              >
                Adicionar Subtarefa
              </button>
            </div>

            {showAddSubtask && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Digite a subtarefa..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddSubtask(false)}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddSubtask}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => console.log('Toggle subtarefa:', subtask.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comentários */}
          <div className="card animate-slide-up delay-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentários</h3>
            
            <div className="space-y-4 mb-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className={`p-4 rounded-lg ${comment.isImportant ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{comment.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">{comment.timestamp}</span>
                        {comment.isImportant && (
                          <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            <AlertCircle size={12} className="mr-1" />
                            Importante
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">PC</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Comentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações da Tarefa */}
          <div className="card animate-slide-up delay-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-600">Responsável</p>
                  <p className="font-medium text-gray-900">{task.assignee.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-600">Prazo</p>
                  <p className="font-medium text-gray-900">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-600">Criado em</p>
                  <p className="font-medium text-gray-900">{new Date(task.createdDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timer */}
          {isTimerActive && (
            <div className="card animate-slide-up delay-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timer Ativo</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">02:34:15</div>
                <p className="text-sm text-gray-600 mb-4">Trabalhando em: {task.title}</p>
                <div className="flex space-x-2">
                  <button className="btn-primary text-sm px-3 py-1">
                    Pausar
                  </button>
                  <button className="btn-secondary text-sm px-3 py-1">
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Anexos */}
          <div className="card animate-slide-up delay-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Anexos</h3>
            <div className="space-y-2">
              {task.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <Paperclip className="text-gray-400" size={16} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{attachment.size}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Baixar
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
              <Paperclip size={16} className="mx-auto mb-1" />
              Adicionar Anexo
            </button>
          </div>

          {/* Registro de Tempo */}
          <div className="card animate-slide-up delay-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro de Tempo</h3>
            <div className="space-y-3">
              {task.timeEntries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.date}</p>
                    <p className="text-xs text-gray-600">{entry.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{entry.hours}h</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 btn-primary text-sm">
              Adicionar Tempo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
