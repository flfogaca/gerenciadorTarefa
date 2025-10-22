import { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Upload, 
  Download, 
  Plus,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  FileText,
  X,
  Save,
  BarChart3,
  PieChart,
  TrendingUp as ChartTrendingUp
} from 'lucide-react';

const mockFinancialData = [
  {
    id: 1,
    projectName: 'Evento Corporativo Q1',
    client: 'TechCorp Brasil',
    budgetApproved: 150000,
    expensesRegistered: 95000,
    paidValues: 80000,
    valuesToReceive: 70000,
    margin: 55000,
    status: 'Em Andamento',
    invoices: 12,
    receipts: 8
  },
  {
    id: 2,
    projectName: 'Lançamento Produto',
    client: 'Inovação Ltda',
    budgetApproved: 85000,
    expensesRegistered: 25000,
    paidValues: 20000,
    valuesToReceive: 65000,
    margin: 60000,
    status: 'Em Concorrência',
    invoices: 3,
    receipts: 2
  },
  {
    id: 3,
    projectName: 'Workshop Digital',
    client: 'Academia Digital',
    budgetApproved: 25000,
    expensesRegistered: 25000,
    paidValues: 25000,
    valuesToReceive: 0,
    margin: 0,
    status: 'Concluído',
    invoices: 5,
    receipts: 5
  }
];

const mockExpenses = [
  {
    id: 1,
    projectId: 1,
    projectName: 'Evento Corporativo Q1',
    category: 'Equipamentos',
    description: 'Som e iluminação',
    value: 15000,
    date: '2025-01-15',
    status: 'Pago',
    invoice: 'NF-001234'
  },
  {
    id: 2,
    projectId: 1,
    projectName: 'Evento Corporativo Q1',
    category: 'Marketing',
    description: 'Material promocional',
    value: 8000,
    date: '2025-01-20',
    status: 'Pendente',
    invoice: 'NF-001235'
  },
  {
    id: 3,
    projectId: 2,
    projectName: 'Lançamento Produto',
    category: 'Design',
    description: 'Identidade visual',
    value: 12000,
    date: '2025-02-01',
    status: 'Pago',
    invoice: 'NF-001236'
  }
];

const categories = ['Equipamentos', 'Marketing', 'Design', 'Produção', 'Logística', 'Tecnologia', 'Outros'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Em Andamento': return 'bg-blue-100 text-blue-800';
    case 'Em Concorrência': return 'bg-yellow-100 text-yellow-800';
    case 'Declinado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'Pago': return 'bg-green-100 text-green-800';
    case 'Pendente': return 'bg-yellow-100 text-yellow-800';
    case 'Atrasado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Financeiro() {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'reports'>('overview');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [newExpense, setNewExpense] = useState({
    projectId: '',
    category: '',
    description: '',
    value: '',
    date: '',
    invoice: ''
  });

  const totalBudget = mockFinancialData.reduce((sum, project) => sum + project.budgetApproved, 0);
  const totalExpenses = mockFinancialData.reduce((sum, project) => sum + project.expensesRegistered, 0);
  const totalPaid = mockFinancialData.reduce((sum, project) => sum + project.paidValues, 0);
  const totalToReceive = mockFinancialData.reduce((sum, project) => sum + project.valuesToReceive, 0);
  const totalMargin = mockFinancialData.reduce((sum, project) => sum + project.margin, 0);

  const filteredExpenses = mockExpenses.filter(expense => {
    if (selectedProject !== 'all' && expense.projectId.toString() !== selectedProject) return false;
    if (selectedCategory !== 'all' && expense.category !== selectedCategory) return false;
    return true;
  });

  const handleUploadInvoice = () => {
    console.log('Upload de nota fiscal');
    setShowUploadModal(true);
  };

  const handleAddExpense = () => {
    console.log('Adicionar nova despesa');
    setShowExpenseModal(true);
  };

  const handleExportData = () => {
    console.log('Exportar dados financeiros');
    setShowExportModal(true);
  };

  const handleViewProject = (projectId: number) => {
    console.log('Visualizar projeto:', projectId);
  };

  const handleEditExpense = (expenseId: number) => {
    console.log('Editar despesa:', expenseId);
    setEditingExpense(expenseId);
  };

  const handleDeleteExpense = (expenseId: number) => {
    console.log('Excluir despesa:', expenseId);
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      console.log('Despesa excluída:', expenseId);
    }
  };

  const handleSaveExpense = () => {
    console.log('Salvar despesa:', newExpense);
    setNewExpense({
      projectId: '',
      category: '',
      description: '',
      value: '',
      date: '',
      invoice: ''
    });
    setShowExpenseModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-2">Controle de custos e investimentos dos projetos</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleUploadInvoice}
              className="btn-success flex items-center justify-center w-full sm:w-auto"
            >
              <Upload size={20} className="mr-2" />
              Upload NF
            </button>
            <button 
              onClick={handleAddExpense}
              className="btn-primary flex items-center justify-center w-full sm:w-auto"
            >
              <Plus size={20} className="mr-2" />
              Nova Despesa
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">R$ {totalBudget.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center">
            <TrendingUp className="text-green-500 mr-1" size={14} />
            <span className="text-xs sm:text-sm text-green-600 font-medium">+12%</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-2 hidden sm:inline">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">R$ {totalExpenses.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={20} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center">
            <TrendingUp className="text-red-500 mr-1" size={14} />
            <span className="text-xs sm:text-sm text-red-600 font-medium">+8%</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-2 hidden sm:inline">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valores Pagos</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">R$ {totalPaid.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center">
            <TrendingUp className="text-green-500 mr-1" size={14} />
            <span className="text-xs sm:text-sm text-green-600 font-medium">+15%</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-2 hidden sm:inline">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">A Receber</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">R$ {totalToReceive.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center">
            <TrendingDown className="text-yellow-500 mr-1" size={14} />
            <span className="text-xs sm:text-sm text-yellow-600 font-medium">-5%</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-2 hidden sm:inline">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Margem</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">R$ {totalMargin.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center">
            <TrendingUp className="text-purple-500 mr-1" size={14} />
            <span className="text-xs sm:text-sm text-purple-600 font-medium">+22%</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-2 hidden sm:inline">vs mês anterior</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'expenses' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Despesas
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'reports' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Relatórios
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportData}
                className="btn-secondary flex items-center justify-center w-full sm:w-auto"
              >
                <Download size={20} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {mockFinancialData.map((project) => (
                  <div key={project.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{project.projectName}</h3>
                            <p className="text-sm text-gray-600">{project.client}</p>
                            <p className="text-xs text-gray-500 mt-1">{project.invoices} NFs • {project.receipts} recibos</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleViewProject(project.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Visualizar"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => console.log('Editar projeto:', project.id)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
                            <p className="text-sm font-semibold text-gray-900">R$ {project.budgetApproved.toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Despesas</p>
                            <p className="text-sm font-semibold text-gray-900">R$ {project.expensesRegistered.toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Pago</p>
                            <p className="text-sm font-semibold text-gray-900">R$ {project.paidValues.toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">A Receber</p>
                            <p className="text-sm font-semibold text-gray-900">R$ {project.valuesToReceive.toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Margem</p>
                            <p className="text-sm font-semibold text-gray-900">R$ {project.margin.toLocaleString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Filter size={20} className="text-gray-500" />
                    <select 
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                    >
                      <option value="all">Todos os Projetos</option>
                      <option value="1">Evento Corporativo Q1</option>
                      <option value="2">Lançamento Produto</option>
                    </select>
                  </div>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  >
                    <option value="all">Todas as Categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {expense.category}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{expense.description}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Projeto:</strong> {expense.projectName}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Receipt size={16} className="mr-1" />
                            {expense.invoice}
                          </div>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            {new Date(expense.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            R$ {expense.value.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditExpense(expense.id)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Orçado vs Realizado</h3>
                    <BarChart3 className="text-blue-600" size={20} />
                  </div>
                  <div className="space-y-4">
                    {mockFinancialData.map((project) => {
                      const percentage = (project.expensesRegistered / project.budgetApproved) * 100;
                      return (
                        <div key={project.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{project.projectName}</span>
                            <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>R$ {project.expensesRegistered.toLocaleString('pt-BR')}</span>
                            <span>R$ {project.budgetApproved.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Custos por Categoria</h3>
                    <PieChart className="text-green-600" size={20} />
                  </div>
                  <div className="space-y-3">
                    {categories.map((category, index) => {
                      const total = mockExpenses
                        .filter(expense => expense.category === category)
                        .reduce((sum, expense) => sum + expense.value, 0);
                      const percentage = (total / mockExpenses.reduce((sum, expense) => sum + expense.value, 0)) * 100;
                      const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
                      
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${colors[index]}`}></div>
                            <span className="text-sm text-gray-600">{category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              R$ {total.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa</h3>
                    <ChartTrendingUp className="text-purple-600" size={20} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Entradas</span>
                      <span className="text-sm font-semibold text-green-600">
                        R$ {(totalPaid + totalToReceive).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Saídas</span>
                      <span className="text-sm font-semibold text-red-600">
                        R$ {totalExpenses.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Saldo</span>
                        <span className={`text-sm font-semibold ${totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {totalMargin.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Margem por Projeto</h3>
                    <TrendingUp className="text-blue-600" size={20} />
                  </div>
                  <div className="space-y-3">
                    {mockFinancialData.map((project) => {
                      const marginPercentage = (project.margin / project.budgetApproved) * 100;
                      return (
                        <div key={project.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 truncate">{project.projectName}</span>
                            <span className={`font-medium ${marginPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {marginPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            R$ {project.margin.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Status de Pagamentos</h3>
                    <Clock className="text-yellow-600" size={20} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pagos</span>
                      <span className="text-sm font-semibold text-green-600">
                        R$ {totalPaid.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pendentes</span>
                      <span className="text-sm font-semibold text-yellow-600">
                        R$ {(totalExpenses - totalPaid).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">A Receber</span>
                      <span className="text-sm font-semibold text-blue-600">
                        R$ {totalToReceive.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Relatórios Detalhados</h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="all">Todos os Projetos</option>
                      {mockFinancialData.map(project => (
                        <option key={project.id} value={project.id}>{project.projectName}</option>
                      ))}
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="all">Todos os Clientes</option>
                      {mockFinancialData.map(project => (
                        <option key={project.id} value={project.client}>{project.client}</option>
                      ))}
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="month">Último Mês</option>
                      <option value="quarter">Último Trimestre</option>
                      <option value="year">Último Ano</option>
                    </select>
                    <button className="btn-primary flex items-center">
                      <Download size={16} className="mr-2" />
                      Exportar
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Projeto</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Budget</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Gasto</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Margem</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFinancialData.map((project) => (
                        <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{project.projectName}</td>
                          <td className="py-3 px-4 text-gray-600">{project.client}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">
                            R$ {project.budgetApproved.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">
                            R$ {project.expensesRegistered.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">
                            R$ {project.margin.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'][index]
                  }`}></div>
                  <span className="text-sm text-gray-600">{category}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  R$ {(Math.random() * 50000 + 10000).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Financeiros</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-red-800">Pagamento atrasado</p>
                <p className="text-xs text-red-600">Material promocional - 5 dias de atraso</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-yellow-800">Budget próximo do limite</p>
                <p className="text-xs text-yellow-600">Evento Corporativo Q1 - 85% utilizado</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-green-800">Projeto finalizado</p>
                <p className="text-xs text-green-600">Workshop Digital - Margem positiva</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Upload de Nota Fiscal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upload de Nota Fiscal</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Arquivo</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione um projeto</option>
                    <option value="1">Evento Corporativo Q1</option>
                    <option value="2">Lançamento Produto</option>
                    <option value="3">Workshop Digital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número da Nota</label>
                  <input
                    type="text"
                    placeholder="Ex: NF-001234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                  className="btn-success w-full sm:w-auto"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Despesa */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Nova Despesa</h2>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
                    <select
                      value={newExpense.projectId}
                      onChange={(e) => setNewExpense({...newExpense, projectId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um projeto</option>
                      <option value="1">Evento Corporativo Q1</option>
                      <option value="2">Lançamento Produto</option>
                      <option value="3">Workshop Digital</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Material promocional"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <input
                      type="number"
                      value={newExpense.value}
                      onChange={(e) => setNewExpense({...newExpense, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número da Nota</label>
                  <input
                    type="text"
                    value={newExpense.invoice}
                    onChange={(e) => setNewExpense({...newExpense, invoice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: NF-001234"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveExpense}
                  className="btn-primary w-full sm:w-auto"
                >
                  Salvar Despesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Exportar Dados</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todos os dados</option>
                    <option value="month">Último mês</option>
                    <option value="quarter">Último trimestre</option>
                    <option value="year">Último ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todos os projetos</option>
                    <option value="1">Evento Corporativo Q1</option>
                    <option value="2">Lançamento Produto</option>
                    <option value="3">Workshop Digital</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    console.log('Exportação realizada');
                    setShowExportModal(false);
                  }}
                  className="btn-primary w-full sm:w-auto"
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
