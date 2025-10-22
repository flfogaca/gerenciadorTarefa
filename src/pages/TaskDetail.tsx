import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Paperclip, 
  MessageSquare, 
  Edit, 
  Save, 
  X, 
  Plus,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Square,
  Tag,
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const mockTaskDetails = {
  1: {
    id: 1,
    code: 'TSK-001',
    title: 'Criar identidade visual para evento corporativo',
    description: 'Desenvolver identidade visual completa incluindo logo, cores, tipografia e aplicações para o evento corporativo da TechCorp Brasil.',
    status: 'Em andamento',
    priority: 'Alta',
    assignee: {
      id: 1,
      name: 'João Santos',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    project: 'Evento Corporativo Q1',
    client: 'TechCorp Brasil',
    createdAt: '2025-01-15',
    dueDate: '2025-02-15',
    estimatedHours: 40,
    loggedHours: 25,
    tags: ['Design', 'Identidade Visual', 'Evento'],
    watchers: [
      {
        id: 1,
        name: 'Maria Silva',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        role: 'Gestor',
        email: 'maria@gestorpro.com',
        phone: '(11) 99999-9999'
      },
      {
        id: 2,
        name: 'Carlos Lima',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        role: 'Cliente',
        email: 'carlos@techcorp.com',
        phone: '(11) 88888-8888'
      }
    ],
    attachments: [
      {
        id: 1,
        name: 'briefing_evento.pdf',
        type: 'pdf',
        size: '2.4 MB',
        uploadedAt: '2025-01-15',
        uploadedBy: 'Maria Silva'
      },
      {
        id: 2,
        name: 'referencias_cores.ai',
        type: 'ai',
        size: '15.2 MB',
        uploadedAt: '2025-01-16',
        uploadedBy: 'João Santos'
      },
      {
        id: 3,
        name: 'logo_conceito.png',
        type: 'png',
        size: '1.8 MB',
        uploadedAt: '2025-01-17',
        uploadedBy: 'João Santos'
      }
    ],
    history: [
      {
        id: 1,
        action: 'Tarefa criada',
        user: 'Maria Silva',
        timestamp: '2025-01-15T09:00:00',
        details: 'Tarefa criada e atribuída a João Santos'
      },
      {
        id: 2,
        action: 'Status alterado',
        user: 'João Santos',
        timestamp: '2025-01-15T10:30:00',
        details: 'Status alterado de "Pendente" para "Em andamento"'
      },
      {
        id: 3,
        action: 'Arquivo anexado',
        user: 'João Santos',
        timestamp: '2025-01-16T14:20:00',
        details: 'Anexado arquivo: referencias_cores.ai'
      },
      {
        id: 4,
        action: 'Comentário adicionado',
        user: 'Maria Silva',
        timestamp: '2025-01-17T11:15:00',
        details: 'Ótimo trabalho com as referências de cores!'
      }
    ],
    comments: [
      {
        id: 1,
        user: 'Maria Silva',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        message: 'Ótimo trabalho com as referências de cores! Podemos seguir com essa paleta.',
        timestamp: '2025-01-17T11:15:00'
      },
      {
        id: 2,
        user: 'João Santos',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        message: 'Obrigado! Vou finalizar o logo hoje mesmo.',
        timestamp: '2025-01-17T11:45:00'
      }
    ]
  },
  2: {
    id: 2,
    code: 'TSK-002',
    title: 'Desenvolver apresentação executiva',
    description: 'Criar apresentação executiva para o lançamento do novo produto da Inovação Ltda.',
    status: 'Pendente',
    priority: 'Média',
    assignee: {
      id: 2,
      name: 'Ana Costa',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
    },
    project: 'Lançamento Produto',
    client: 'Inovação Ltda',
    createdAt: '2025-01-20',
    dueDate: '2025-02-20',
    estimatedHours: 20,
    loggedHours: 0,
    tags: ['Apresentação', 'Executivo', 'Lançamento'],
    watchers: [
      {
        id: 3,
        name: 'Ana Costa',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        role: 'Diretor',
        email: 'ana@inovacao.com',
        phone: '(11) 77777-7777'
      }
    ],
    attachments: [],
    history: [
      {
        id: 1,
        action: 'Tarefa criada',
        user: 'Carlos Lima',
        timestamp: '2025-01-20T14:00:00',
        details: 'Tarefa criada e atribuída a Ana Costa'
      }
    ],
    comments: []
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Em andamento': return 'bg-blue-100 text-blue-800';
    case 'Pendente': return 'bg-yellow-100 text-yellow-800';
    case 'Pausado': return 'bg-orange-100 text-orange-800';
    case 'Cancelado': return 'bg-red-100 text-red-800';
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

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return '📄';
    case 'ai': return '🎨';
    case 'png': return '🖼️';
    case 'jpg': return '🖼️';
    case 'jpeg': return '🖼️';
    case 'doc': return '📝';
    case 'docx': return '📝';
    case 'xls': return '📊';
    case 'xlsx': return '📊';
    case 'zip': return '📦';
    default: return '📎';
  }
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState(mockTaskDetails[parseInt(id || '1')]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tags' | 'attachments' | 'people'>('overview');
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: '',
    estimatedHours: 0
  });
  const [newComment, setNewComment] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [newTag, setNewTag] = useState('');
  const [newWatcher, setNewWatcher] = useState('');

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours
      });
    }
  }, [task]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log('Salvando alterações:', editData);
    setTask(prev => prev ? { ...prev, ...editData } : null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || '',
      priority: task?.priority || '',
      dueDate: task?.dueDate || '',
      estimatedHours: task?.estimatedHours || 0
    });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    console.log('Alterando status para:', newStatus);
    setTask(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('Adicionando comentário:', newComment);
      setNewComment('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log('Upload de arquivos:', files);
    }
  };

  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerStop = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !task?.tags.includes(newTag.trim())) {
      console.log('Adicionando tag:', newTag);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    console.log('Removendo tag:', tagToRemove);
  };

  const handleAddWatcher = () => {
    if (newWatcher.trim()) {
      console.log('Adicionando observador:', newWatcher);
      setNewWatcher('');
    }
  };

  const handleRemoveWatcher = (watcherId: number) => {
    console.log('Removendo observador:', watcherId);
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tarefa não encontrada</h2>
          <p className="text-gray-600 mb-4">A tarefa solicitada não existe ou foi removida.</p>
          <button
            onClick={() => navigate('/tarefas')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Tarefas
          </button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{task.code}</h1>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <p className="text-gray-600">{task.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
            Editar
          </button>
        </div>
      </div>

      {/* Sistema de Abas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tags'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Tag size={16} className="inline mr-2" />
              Tags
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'attachments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Paperclip size={16} className="inline mr-2" />
              Anexos
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'people'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Pessoas
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Conteúdo da aba Visão Geral - mantém o conteúdo atual */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conteúdo Principal */}
                <div className="lg:col-span-2 space-y-6">
          {/* Informações da Tarefa */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Informações da Tarefa</h2>
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-1" />
                    Salvar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{task.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  {isEditing ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Pausado">Pausado</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <div className="flex space-x-1">
                        {['Pendente', 'Em andamento', 'Pausado', 'Concluído', 'Cancelado'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`px-2 py-1 text-xs rounded ${
                              task.status === status 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                  {isEditing ? (
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({...editData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.dueDate}
                      onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horas Estimadas</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.estimatedHours}
                      onChange={(e) => setEditData({...editData, estimatedHours: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{task.estimatedHours}h</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cronômetro */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Controle de Tempo</h2>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatTime(timerSeconds)}
                </div>
                <p className="text-sm text-gray-600">Tempo atual</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {task.loggedHours}h
                </div>
                <p className="text-sm text-gray-600">Total registrado</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTimerToggle}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                    isTimerRunning 
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isTimerRunning ? <Pause size={20} className="mr-2" /> : <Play size={20} className="mr-2" />}
                  {isTimerRunning ? 'Pausar' : 'Iniciar'}
                </button>
                <button
                  onClick={handleTimerStop}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Square size={20} className="mr-2" />
                  Parar
                </button>
              </div>
            </div>
          </div>

          {/* Anexos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Anexos</h2>
              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
                <Plus size={20} className="mr-2" />
                Adicionar Arquivo
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.ai,.doc,.docx,.xls,.xlsx,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-3">
              {task.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-600">{attachment.size} • {attachment.uploadedBy} • {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1">
                      <Eye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-800 p-1">
                      <Download size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {task.attachments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Paperclip size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhum arquivo anexado</p>
                  <p className="text-sm">Clique em "Adicionar Arquivo" para anexar documentos</p>
                </div>
              )}
            </div>
          </div>

          {/* Comentários */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comentários</h2>
            
            <div className="space-y-4 mb-6">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900">{comment.user}</p>
                      <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                    <p className="text-gray-900">{comment.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="Usuário"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicionar comentário..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Projeto */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Projeto</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.project}</p>
                  <p className="text-xs text-gray-600">Projeto</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.client}</p>
                  <p className="text-xs text-gray-600">Cliente</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-400" />
                <div className="flex items-center space-x-2">
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.assignee.name}</p>
                    <p className="text-xs text-gray-600">Responsável</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{new Date(task.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs text-gray-600">Criado em</p>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h2>
            <div className="space-y-3">
              {task.history.map((item) => (
                <div key={item.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-600">{item.user}</p>
                    <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString('pt-BR')}</p>
                    {item.details && (
                      <p className="text-xs text-gray-600 mt-1">{item.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Gerenciar Tags</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Digite uma nova tag..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
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
                {task.tags.length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhuma tag adicionada ainda.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Anexos da Tarefa</h2>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
                  <Plus size={20} className="mr-2" />
                  Adicionar Arquivo
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.doc,.docx,.xls,.xlsx,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-600">{attachment.size} • {attachment.uploadedBy} • {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-800 p-1">
                        <Download size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {task.attachments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Paperclip size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Nenhum arquivo anexado</p>
                    <p className="text-sm">Clique em "Adicionar Arquivo" para anexar documentos</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pessoas Envolvidas</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newWatcher}
                    onChange={(e) => setNewWatcher(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddWatcher()}
                    placeholder="Digite o nome da pessoa..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddWatcher}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Responsável */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Responsável</h3>
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.assignee.name}</p>
                    <p className="text-sm text-gray-600">Responsável pela tarefa</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1">
                      <Mail size={16} />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-1">
                      <Phone size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Observadores */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Observadores</h3>
                <div className="space-y-3">
                  {task.watchers.map((watcher) => (
                    <div key={watcher.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={watcher.avatar}
                        alt={watcher.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{watcher.name}</p>
                        <p className="text-sm text-gray-600">{watcher.role}</p>
                        <p className="text-xs text-gray-500">{watcher.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Mail size={16} />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Phone size={16} />
                        </button>
                        <button 
                          onClick={() => handleRemoveWatcher(watcher.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {task.watchers.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum observador adicionado ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
