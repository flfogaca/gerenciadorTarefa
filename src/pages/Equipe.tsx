import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { showToast } from '../utils/toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  UserCog,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  UserPlus,
  X,
  Save
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  position: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export default function Equipe() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMemberData, setNewMemberData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    phone: '',
    position: '',
    department: ''
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUsers();
      const usersData = response?.data?.users || response?.data || [];
      const mappedMembers = usersData.map((user: any) => ({
        id: user.id,
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.telephone || '',
        role: user.role || 'employee',
        position: user.position || user.jobTitle || '',
        department: user.department || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
        createdAt: user.createdAt || new Date().toISOString()
      }));
      setMembers(mappedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && member.isActive) ||
                         (filterStatus === 'inactive' && !member.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TENANT_ADMIN':
      case 'tenant_admin':
      case 'admin':
        return 'Administrador';
      case 'MANAGER':
      case 'manager':
        return 'Gerente';
      case 'EMPLOYEE':
      case 'employee':
        return 'Funcionário';
      case 'SUPER_ADMIN':
      case 'super_admin':
      case 'director':
        return 'Diretor';
      default:
        return role;
    }
  };

  const mapRoleToApi = (role: string): string => {
    const roleMap: Record<string, string> = {
      'admin': 'TENANT_ADMIN',
      'manager': 'MANAGER',
      'employee': 'EMPLOYEE',
      'director': 'SUPER_ADMIN'
    };
    return roleMap[role] || 'EMPLOYEE';
  };

  const mapApiToRole = (role: string): string => {
    if (role === 'TENANT_ADMIN' || role === 'tenant_admin') return 'admin';
    if (role === 'MANAGER' || role === 'manager') return 'manager';
    if (role === 'SUPER_ADMIN' || role === 'super_admin') return 'director';
    return 'employee';
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
      const userData: any = {
        email: newMemberData.email.trim(),
        password: newMemberData.password,
        firstName: newMemberData.firstName.trim(),
        lastName: newMemberData.lastName.trim(),
        role: mapRoleToApi(newMemberData.role),
        tenantId
      };
      
      if (newMemberData.phone?.trim()) {
        userData.phone = newMemberData.phone.trim();
      }
      if (newMemberData.position?.trim()) {
        userData.position = newMemberData.position.trim();
      }
      if (newMemberData.department?.trim()) {
        userData.department = newMemberData.department.trim();
      }
      
      await apiService.createUser(userData);
      setShowCreateModal(false);
      setNewMemberData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        phone: '',
        position: '',
        department: ''
      });
      loadTeamMembers();
      showToast.success('Membro criado com sucesso!');
    } catch (error: any) {
      console.error('Error creating member:', error);
      const status = error.response?.status || error.status;
      let message = error.response?.data?.message || error.message || 'Erro ao criar membro';
      
      if (status === 403) {
        message = 'Você não tem permissão para criar membros. Apenas diretores e gestores podem criar membros.';
      } else if (status === 400) {
        const details = error.response?.data?.details || [];
        if (details.length > 0) {
          message = `Erro de validação: ${details.map((d: any) => d.message || d).join(', ')}`;
        }
      }
      
      showToast.error(message);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    const nameParts = member.name.split(' ');
    setEditingMember(member);
    setNewMemberData({
      email: member.email,
      password: '',
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      role: mapApiToRole(member.role),
      phone: member.phone || '',
      position: member.position || '',
      department: member.department || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    try {
      const updateData: any = {
        name: `${newMemberData.firstName} ${newMemberData.lastName}`.trim(),
        email: newMemberData.email,
        role: mapRoleToApi(newMemberData.role),
        phone: newMemberData.phone,
        position: newMemberData.position,
        department: newMemberData.department
      };
      
      if (newMemberData.password) {
        updateData.password = newMemberData.password;
      }
      
      await apiService.updateUser(editingMember.id, updateData);
      setShowEditModal(false);
      setEditingMember(null);
      setNewMemberData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        phone: '',
        position: '',
        department: ''
      });
      loadTeamMembers();
    } catch (error: any) {
      console.error('Error updating member:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar membro';
      alert(`Erro ao atualizar membro: ${message}`);
    }
  };

  const handleViewMember = (member: TeamMember) => {
    navigate(`/perfil/${member.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie os membros da sua equipe</p>
        </div>
        <button 
          onClick={() => {
            setNewMemberData({
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              role: 'employee',
              phone: '',
              position: '',
              department: ''
            });
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="mr-2" size={20} />
          Adicionar Membro
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar membros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={18} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Perfis</option>
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="employee">Funcionário</option>
                <option value="director">Diretor</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <UserCog className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">Nenhum membro encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.position || '-'}</div>
                      {member.department && (
                        <div className="text-sm text-gray-500">{member.department}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getRoleLabel(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} className="text-gray-400" />
                            {member.phone}
                          </div>
                        )}
                        {!member.phone && (
                          <div className="flex items-center gap-1">
                            <Mail size={14} className="text-gray-400" />
                            {member.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 inline-flex items-center">
                          <CheckCircle size={14} className="mr-1" />
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 inline-flex items-center">
                          <XCircle size={14} className="mr-1" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewMember(member)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditMember(member)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (!confirm('Tem certeza que deseja deletar este membro? Esta ação não pode ser desfeita.')) return;
                            try {
                              await apiService.deleteUser(member.id);
                              setMembers(members.filter(m => m.id !== member.id));
                            } catch (error: any) {
                              console.error('Error deleting user:', error);
                              const message = error.response?.data?.message || error.message || 'Erro ao deletar membro';
                              alert(`Erro ao deletar membro: ${message}`);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Deletar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Adicionar Novo Membro</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={newMemberData.firstName}
                      onChange={(e) => setNewMemberData({...newMemberData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                    <input
                      type="text"
                      required
                      value={newMemberData.lastName}
                      onChange={(e) => setNewMemberData({...newMemberData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newMemberData.email}
                    onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newMemberData.password}
                    onChange={(e) => setNewMemberData({...newMemberData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select
                    value={newMemberData.role}
                    onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="employee">Funcionário</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Administrador</option>
                    <option value="director">Diretor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={newMemberData.position}
                    onChange={(e) => setNewMemberData({...newMemberData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={newMemberData.phone}
                    onChange={(e) => setNewMemberData({...newMemberData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Criar Membro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Editar Membro</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMember(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={newMemberData.firstName}
                      onChange={(e) => setNewMemberData({...newMemberData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                    <input
                      type="text"
                      required
                      value={newMemberData.lastName}
                      onChange={(e) => setNewMemberData({...newMemberData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newMemberData.email}
                    onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha (deixe em branco para manter)</label>
                  <input
                    type="password"
                    minLength={8}
                    value={newMemberData.password}
                    onChange={(e) => setNewMemberData({...newMemberData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select
                    value={newMemberData.role}
                    onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="employee">Funcionário</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Administrador</option>
                    <option value="director">Diretor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={newMemberData.position}
                    onChange={(e) => setNewMemberData({...newMemberData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={newMemberData.phone}
                    onChange={(e) => setNewMemberData({...newMemberData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingMember(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
