import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Award, 
  Clock,
  Edit,
  Save,
  X,
  Camera,
  Download,
  Share2
} from 'lucide-react';

const mockProfile = {
  personal: {
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    phone: '(11) 99999-9999',
    position: 'Gerente de Projetos',
    department: 'Gestão',
    location: 'São Paulo, SP',
    joinDate: '2023-01-15',
    avatar: 'JD'
  },
  stats: {
    projectsCompleted: 24,
    projectsActive: 3,
    tasksCompleted: 156,
    hoursWorked: 1840,
    rating: 4.8,
    achievements: 12
  },
  recentActivity: [
    {
      id: 1,
      action: 'Concluiu projeto',
      project: 'Evento Corporativo Q1',
      time: '2 horas atrás',
      type: 'success'
    },
    {
      id: 2,
      action: 'Atualizou cronograma',
      project: 'Lançamento Produto',
      time: '1 dia atrás',
      type: 'info'
    },
    {
      id: 3,
      action: 'Adicionou nova tarefa',
      project: 'Workshop Digital',
      time: '2 dias atrás',
      type: 'info'
    },
    {
      id: 4,
      action: 'Comentou em projeto',
      project: 'Conferência Anual',
      time: '3 dias atrás',
      type: 'comment'
    }
  ],
  skills: [
    { name: 'Gestão de Projetos', level: 95 },
    { name: 'Planejamento Estratégico', level: 90 },
    { name: 'Comunicação', level: 88 },
    { name: 'Liderança', level: 85 },
    { name: 'Análise de Dados', level: 80 },
    { name: 'Negociação', level: 75 }
  ]
};

export default function Perfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfile);

  const handleSave = () => {
    setIsEditing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'info': return 'ℹ';
      case 'comment': return '💬';
      default: return '•';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'info': return 'text-blue-600';
      case 'comment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais e acompanhe seu desempenho</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Download size={20} className="mr-2" />
            Exportar
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Share2 size={20} className="mr-2" />
            Compartilhar
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-semibold text-3xl">{profile.personal.avatar}</span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Camera size={16} className="text-white" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.personal.name}</h2>
              <p className="text-gray-600 mb-2">{profile.personal.position}</p>
              <p className="text-sm text-gray-500 mb-4">{profile.personal.department}</p>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  {profile.personal.location}
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Desde {new Date(profile.personal.joinDate).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avaliação</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-1">{profile.stats.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.floor(profile.stats.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Projetos Concluídos</span>
                  <span className="text-sm font-medium text-gray-900">{profile.stats.projectsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tarefas Concluídas</span>
                  <span className="text-sm font-medium text-gray-900">{profile.stats.tasksCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Horas Trabalhadas</span>
                  <span className="text-sm font-medium text-gray-900">{profile.stats.hoursWorked.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conquistas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Award className="text-yellow-600 mx-auto mb-2" size={24} />
                <p className="text-sm font-medium text-gray-900">{profile.stats.achievements}</p>
                <p className="text-xs text-gray-600">Conquistas</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Briefcase className="text-green-600 mx-auto mb-2" size={24} />
                <p className="text-sm font-medium text-gray-900">{profile.stats.projectsActive}</p>
                <p className="text-xs text-gray-600">Projetos Ativos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Save size={20} className="mr-2" />
                  Salvar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.personal.name}
                    onChange={(e) => setProfile({...profile, personal: {...profile.personal, name: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.personal.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.personal.email}
                    onChange={(e) => setProfile({...profile, personal: {...profile.personal, email: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.personal.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.personal.phone}
                    onChange={(e) => setProfile({...profile, personal: {...profile.personal, phone: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.personal.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.personal.position}
                    onChange={(e) => setProfile({...profile, personal: {...profile.personal, position: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.personal.position}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                {isEditing ? (
                  <select
                    value={profile.personal.department}
                    onChange={(e) => setProfile({...profile, personal: {...profile.personal, department: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Gestão">Gestão</option>
                    <option value="Negócios">Negócios</option>
                    <option value="Planejamento">Planejamento</option>
                    <option value="Criação">Criação</option>
                    <option value="Produção">Produção</option>
                    <option value="Arquitetura">Arquitetura</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.personal.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.personal.location}
                    onChange={(e) => setProfile({...profile, personal: {...profile.personal, location: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.personal.location}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Habilidades</h3>
            <div className="space-y-4">
              {profile.skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                    <span className="text-sm text-gray-600">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              {profile.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getActivityColor(activity.type)} bg-white`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.project}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock size={12} className="mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
