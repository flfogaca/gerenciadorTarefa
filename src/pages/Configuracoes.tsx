import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { showToast } from '../utils/toast';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Mail, 
  Key,
  Globe,
  Save,
  Upload,
  Download,
  Trash2,
  Plus,
  Edit
} from 'lucide-react';

interface SettingsData {
  profile: {
    name: string;
    email: string;
    role: string;
    avatar: string;
    phone: string;
    department: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    projectUpdates: boolean;
    deadlineAlerts: boolean;
    financialAlerts: boolean;
    teamUpdates: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAlerts: boolean;
  };
  appearance: {
    theme: string;
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  integrations: {
    googleDrive: boolean;
    oneDrive: boolean;
    slack: boolean;
    teams: boolean;
    calendar: boolean;
  };
}

const defaultSettings: SettingsData = {
  profile: {
    name: '',
    email: '',
    role: '',
    avatar: '',
    phone: '',
    department: ''
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    deadlineAlerts: true,
    financialAlerts: true,
    teamUpdates: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true
  },
  appearance: {
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL'
  },
  integrations: {
    googleDrive: false,
    oneDrive: false,
    slack: false,
    teams: false,
    calendar: false
  }
};

export default function Configuracoes() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance' | 'integrations'>('profile');
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      const [userSettingsRes, tenantSettingsRes, userRes] = await Promise.all([
        apiService.getUserSettings().catch(() => null),
        apiService.getTenantSettings().catch(() => null),
        apiService.getCurrentUser().catch(() => null)
      ]);

      const userData = userRes?.data?.user || userRes?.data || user;
      const userSettings = userSettingsRes?.data?.settings;
      const tenantSettings = tenantSettingsRes?.data?.settings;

      if (userData) {
        setSettings(prev => ({
          ...prev,
          profile: {
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || '',
            email: userData.email || '',
            role: userData.role || '',
            avatar: (userData.firstName || userData.name || 'U').substring(0, 2).toUpperCase(),
            phone: userData.phone || '',
            department: userData.department || ''
          }
        }));
      }

      if (userSettings) {
        setSettings(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            ...(userSettings.notifications || {})
          },
          appearance: {
            ...prev.appearance,
            theme: userSettings.theme || prev.appearance.theme,
            language: userSettings.language || prev.appearance.language,
            timezone: userSettings.timezone || prev.appearance.timezone
          }
        }));
      }

      if (tenantSettings) {
        setSettings(prev => ({
          ...prev,
          integrations: {
            ...prev.integrations,
            ...(tenantSettings.integrations || {})
          }
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userRes = await apiService.getCurrentUser();
      const userData = userRes?.data?.user || userRes?.data;
      
      if (userData) {
        setSettings(prev => ({
          ...prev,
          profile: {
            name: userData.name || user?.name || '',
            email: userData.email || user?.email || '',
            role: userData.role || user?.role || '',
            avatar: (userData.name || user?.name || 'U').substring(0, 2).toUpperCase(),
            phone: userData.phone || '',
            department: userData.department || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (activeTab === 'profile') {
        try {
          const nameParts = settings.profile.name.split(' ');
          await apiService.updateUser(user?.id || '', {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: settings.profile.email,
            phone: settings.profile.phone,
            department: settings.profile.department
          });
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }

      if (activeTab === 'notifications' || activeTab === 'appearance') {
        try {
          await apiService.updateUserSettings({
            notifications: activeTab === 'notifications' ? settings.notifications : undefined,
            theme: activeTab === 'appearance' ? settings.appearance.theme : undefined,
            language: activeTab === 'appearance' ? settings.appearance.language : undefined,
            timezone: activeTab === 'appearance' ? settings.appearance.timezone : undefined
          });
        } catch (error) {
          console.error('Error updating user settings:', error);
        }
      }

      if (activeTab === 'integrations') {
        try {
          await apiService.updateTenantSettings({
            integrations: settings.integrations
          });
        } catch (error) {
          console.error('Error updating tenant settings:', error);
        }
      }
      
      showToast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'integrations', name: 'Integrações', icon: Globe }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon size={16} className="mr-2" />
                  {tab.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save size={20} className="mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-2xl">{settings.profile.avatar}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{settings.profile.name || 'Usuário'}</h3>
                  <p className="text-gray-600">{settings.profile.role || 'Usuário'} • {settings.profile.department || 'Sem departamento'}</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Alterar foto
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, name: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, email: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, phone: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                  <select
                    value={settings.profile.department}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, department: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="Gestão">Gestão</option>
                    <option value="Negócios">Negócios</option>
                    <option value="Planejamento">Planejamento</option>
                    <option value="Criação">Criação</option>
                    <option value="Produção">Produção</option>
                    <option value="Arquitetura">Arquitetura</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Preferências de Notificação</h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Notificações por Email', desc: 'Receba atualizações importantes por email' },
                    { key: 'pushNotifications', label: 'Notificações Push', desc: 'Receba notificações no navegador' },
                    { key: 'projectUpdates', label: 'Atualizações de Projetos', desc: 'Notificações sobre mudanças nos projetos' },
                    { key: 'deadlineAlerts', label: 'Alertas de Prazo', desc: 'Lembretes sobre prazos próximos' },
                    { key: 'financialAlerts', label: 'Alertas Financeiros', desc: 'Notificações sobre questões financeiras' },
                    { key: 'teamUpdates', label: 'Atualizações da Equipe', desc: 'Notificações sobre atividades da equipe' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{label}</h4>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                          onChange={(e) => setSettings({
                            ...settings, 
                            notifications: {
                              ...settings.notifications, 
                              [key]: e.target.checked
                            }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Configurações de Segurança</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Autenticação de Dois Fatores</h4>
                      <p className="text-sm text-gray-600">Adicione uma camada extra de segurança</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => setSettings({...settings, security: {...settings.security, twoFactorAuth: e.target.checked}})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Timeout da Sessão (minutos)</h4>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({...settings, security: {...settings.security, sessionTimeout: parseInt(e.target.value) || 30}})}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Expiração da Senha (dias)</h4>
                    <input
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => setSettings({...settings, security: {...settings.security, passwordExpiry: parseInt(e.target.value) || 90}})}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Alertas de Login</h4>
                      <p className="text-sm text-gray-600">Notificações sobre logins suspeitos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.loginAlerts}
                        onChange={(e) => setSettings({...settings, security: {...settings.security, loginAlerts: e.target.checked}})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center">
                    <Key size={20} className="mr-2" />
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Preferências de Aparência</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                    <select
                      value={settings.appearance.theme}
                      onChange={(e) => setSettings({...settings, appearance: {...settings.appearance, theme: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                    <select
                      value={settings.appearance.language}
                      onChange={(e) => setSettings({...settings, appearance: {...settings.appearance, language: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuso Horário</label>
                    <select
                      value={settings.appearance.timezone}
                      onChange={(e) => setSettings({...settings, appearance: {...settings.appearance, timezone: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/New_York">Nova York (GMT-5)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Data</label>
                    <select
                      value={settings.appearance.dateFormat}
                      onChange={(e) => setSettings({...settings, appearance: {...settings.appearance, dateFormat: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Integrações</h3>
                <p className="text-gray-600">Conecte suas ferramentas favoritas para uma experiência mais integrada</p>
                
                <div className="space-y-4">
                  {[
                    { key: 'googleDrive', label: 'Google Drive', desc: 'Sincronize arquivos e documentos', icon: 'G' },
                    { key: 'oneDrive', label: 'Microsoft OneDrive', desc: 'Acesse arquivos do OneDrive', icon: 'M' },
                    { key: 'slack', label: 'Slack', desc: 'Notificações e atualizações no Slack', icon: 'S', color: 'purple' },
                    { key: 'teams', label: 'Microsoft Teams', desc: 'Integração com Teams', icon: 'T' },
                    { key: 'calendar', label: 'Google Calendar', desc: 'Sincronize eventos e cronogramas', icon: 'C', color: 'green' }
                  ].map(({ key, label, desc, icon, color = 'blue' }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                          <span className={`text-${color}-600 font-bold`}>{icon}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">{desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.integrations[key as keyof typeof settings.integrations] as boolean}
                          onChange={(e) => setSettings({
                            ...settings, 
                            integrations: {
                              ...settings.integrations, 
                              [key]: e.target.checked
                            }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
