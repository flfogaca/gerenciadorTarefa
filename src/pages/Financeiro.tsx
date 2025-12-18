import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2, Clock, Plus, Upload, Download, X, AlertCircle, Edit, Trash2, FileText, Receipt } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
import { ExportButton } from '../components/ExportButton';
import { exportService } from '../services/exportService';

export default function Financeiro() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  
  const [dashboardReport, setDashboardReport] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const [newExpense, setNewExpense] = useState({
    projectId: '',
    supplierId: '',
    category: '',
    description: '',
    amount: '',
    currency: 'BRL',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  });
  
  const [newInvoice, setNewInvoice] = useState({
    projectId: '',
    clientId: '',
    supplierId: '',
    invoiceNumber: '',
    type: 'income',
    amount: '',
    tax: '0',
    total: '',
    currency: 'BRL',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });
  
  const [newPayment, setNewPayment] = useState({
    invoiceId: '',
    expenseId: '',
    amount: '',
    currency: 'BRL',
    method: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    notes: ''
  });

  const categories = [
    'Material',
    'Serviços',
    'Equipamentos',
    'Marketing',
    'Transporte',
    'Alimentação',
    'Hospedagem',
    'Outros'
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [reportRes, expensesRes, invoicesRes, paymentsRes, projectsRes, suppliersRes, clientsRes] = await Promise.all([
        apiService.getFinancialDashboardReport(),
        apiService.getExpenses(),
        apiService.getInvoices(),
        apiService.getPayments(),
        apiService.getProjects(),
        apiService.getSuppliers(),
        apiService.getClients()
      ]);

      if (reportRes?.data?.report) {
        setDashboardReport(reportRes.data.report);
      }
      
      setExpenses(expensesRes?.data?.expenses || []);
      setInvoices(invoicesRes?.data?.invoices || []);
      setPayments(paymentsRes?.data?.payments || []);
      setProjects(projectsRes?.data?.projects || []);
      setSuppliers(suppliersRes?.data?.suppliers || []);
      setClients(clientsRes?.data?.clients || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async () => {
    try {
      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date).toISOString()
      };

      if (editingExpense) {
        await apiService.updateExpense(editingExpense, expenseData);
      } else {
        await apiService.createExpense(expenseData);
      }

      setShowExpenseModal(false);
      setEditingExpense(null);
      setNewExpense({
        projectId: '',
        supplierId: '',
        category: '',
        description: '',
        amount: '',
        currency: 'BRL',
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving expense:', error);
      showToast.error('Erro ao salvar despesa');
    }
  };

  const handleSaveInvoice = async () => {
    try {
      const invoiceData = {
        ...newInvoice,
        amount: parseFloat(newInvoice.amount),
        tax: parseFloat(newInvoice.tax || '0'),
        total: parseFloat(newInvoice.total || newInvoice.amount),
        issueDate: new Date(newInvoice.issueDate).toISOString(),
        dueDate: newInvoice.dueDate ? new Date(newInvoice.dueDate).toISOString() : null
      };

      if (editingInvoice) {
        await apiService.updateInvoice(editingInvoice, invoiceData);
      } else {
        await apiService.createInvoice(invoiceData);
      }

      setShowInvoiceModal(false);
      setEditingInvoice(null);
      setNewInvoice({
        projectId: '',
        clientId: '',
        supplierId: '',
        invoiceNumber: '',
        type: 'income',
        amount: '',
        tax: '0',
        total: '',
        currency: 'BRL',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving invoice:', error);
      showToast.error('Erro ao salvar fatura');
    }
  };

  const handleSavePayment = async () => {
    try {
      const paymentData = {
        ...newPayment,
        amount: parseFloat(newPayment.amount),
        paymentDate: new Date(newPayment.paymentDate).toISOString()
      };

      if (editingPayment) {
        await apiService.updatePayment(editingPayment, paymentData);
      } else {
        await apiService.createPayment(paymentData);
      }

      setShowPaymentModal(false);
      setEditingPayment(null);
      setNewPayment({
        invoiceId: '',
        expenseId: '',
        amount: '',
        currency: 'BRL',
        method: 'bank_transfer',
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving payment:', error);
      showToast.error('Erro ao salvar pagamento');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const confirmed = await showConfirm('Tem certeza que deseja excluir esta despesa?');
    if (!confirmed) return;
    
    try {
      await apiService.deleteExpense(expenseId);
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      showToast.error('Erro ao excluir despesa');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    const confirmed = await showConfirm('Tem certeza que deseja excluir esta fatura?');
    if (!confirmed) return;
    
    try {
      await apiService.deleteInvoice(invoiceId);
      loadData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showToast.error('Erro ao excluir fatura');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    const confirmed = await showConfirm('Tem certeza que deseja excluir este pagamento?');
    if (!confirmed) return;
    
    try {
      await apiService.deletePayment(paymentId);
      loadData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      showToast.error('Erro ao excluir pagamento');
    }
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense.id);
    setNewExpense({
      projectId: expense.projectId || '',
      supplierId: expense.supplierId || '',
      category: expense.category || '',
      description: expense.description || '',
      amount: expense.amount?.toString() || '',
      currency: expense.currency || 'BRL',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      invoiceNumber: expense.invoiceNumber || '',
      notes: expense.notes || ''
    });
    setShowExpenseModal(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice.id);
    setNewInvoice({
      projectId: invoice.projectId || '',
      clientId: invoice.clientId || '',
      supplierId: invoice.supplierId || '',
      invoiceNumber: invoice.invoiceNumber || '',
      type: invoice.type || 'income',
      amount: invoice.amount?.toString() || '',
      tax: invoice.tax?.toString() || '0',
      total: invoice.total?.toString() || '',
      currency: invoice.currency || 'BRL',
      issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
      notes: invoice.notes || ''
    });
    setShowInvoiceModal(true);
  };

  const handleMarkInvoiceAsPaid = async (invoiceId: string) => {
    try {
      await apiService.markInvoiceAsPaid(invoiceId);
      loadData();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      showToast.error('Erro ao marcar fatura como paga');
    }
  };

  const handleMarkExpenseAsPaid = async (expenseId: string) => {
    try {
      await apiService.markExpenseAsPaid(expenseId);
      loadData();
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      showToast.error('Erro ao marcar despesa como paga');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'rejected': 'bg-red-100 text-red-800',
      'paid': 'bg-green-100 text-green-800',
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendente',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado',
      'paid': 'Pago',
      'draft': 'Rascunho',
      'sent': 'Enviado',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado',
      'completed': 'Concluído',
      'failed': 'Falhou',
      'refunded': 'Reembolsado'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  const summary = dashboardReport?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalPayments: 0,
    pendingPayments: 0
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-2">Controle completo de finanças</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {dashboardReport && (
              <ExportButton
                title="Relatório Financeiro"
                data={[dashboardReport]}
                columns={[]}
                onExportPDF={() => {
                  const reportData = {
                    stats: dashboardReport,
                    expenses: expenses.slice(0, 100),
                    invoices: invoices.slice(0, 100),
                    payments: payments.slice(0, 100)
                  };
                  exportService.exportDashboardToPDF(reportData, 'Relatório Financeiro');
                }}
                variant="icon"
              />
            )}
            <button 
              onClick={() => {
                setEditingInvoice(null);
                setNewInvoice({
                  projectId: '',
                  clientId: '',
                  supplierId: '',
                  invoiceNumber: '',
                  type: 'income',
                  amount: '',
                  tax: '0',
                  total: '',
                  currency: 'BRL',
                  issueDate: new Date().toISOString().split('T')[0],
                  dueDate: '',
                  notes: ''
                });
                setShowInvoiceModal(true);
              }}
              className="btn-success flex items-center justify-center w-full sm:w-auto"
            >
              <Receipt size={20} className="mr-2" />
              Nova Fatura
            </button>
            <button 
              onClick={() => {
                setEditingExpense(null);
                setNewExpense({
                  projectId: '',
                  supplierId: '',
                  category: '',
                  description: '',
                  amount: '',
                  currency: 'BRL',
                  date: new Date().toISOString().split('T')[0],
                  invoiceNumber: '',
                  notes: ''
                });
                setShowExpenseModal(true);
              }}
              className="btn-primary flex items-center justify-center w-full sm:w-auto"
            >
              <Plus size={20} className="mr-2" />
              Nova Despesa
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                R$ {summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                R$ {summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
              <p className={`text-xl sm:text-2xl font-bold mt-1 ${
                summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                R$ {summary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturas Vencidas</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                {summary.overdueInvoices || 0}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
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
              Despesas ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'invoices' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Faturas ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'payments' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pagamentos ({payments.length})
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total de Faturas</span>
                      <span className="text-sm font-semibold text-gray-900">{summary.totalInvoices}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Faturas Pagas</span>
                      <span className="text-sm font-semibold text-green-600">{summary.paidInvoices}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pagamentos Pendentes</span>
                      <span className="text-sm font-semibold text-yellow-600">{summary.pendingPayments}</span>
                    </div>
                  </div>
                </div>

                {dashboardReport?.expensesByCategory && dashboardReport.expensesByCategory.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
                    <div className="space-y-3">
                      {dashboardReport.expensesByCategory.slice(0, 5).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.category}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Valor</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{expense.category}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{expense.description}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {getStatusLabel(expense.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {expense.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkExpenseAsPaid(expense.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Marcar como pago"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Nenhuma despesa encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Número</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data Emissão</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimento</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {invoice.type === 'income' ? 'Receita' : 'Despesa'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(invoice.issueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button
                              onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Marcar como pago"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Nenhuma fatura encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Método</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Valor</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {payment.method === 'bank_transfer' ? 'Transferência' :
                         payment.method === 'credit_card' ? 'Cartão de Crédito' :
                         payment.method === 'debit_card' ? 'Cartão de Débito' :
                         payment.method === 'pix' ? 'PIX' :
                         payment.method === 'cash' ? 'Dinheiro' :
                         payment.method === 'check' ? 'Cheque' : payment.method}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {payment.status === 'pending' && (
                            <button
                              onClick={async () => {
                                try {
                                  await apiService.completePayment(payment.id);
                                  loadData();
                                } catch (error) {
                                  console.error('Error completing payment:', error);
                                  showToast.error('Erro ao completar pagamento');
                                }
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Completar"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Nenhum pagamento encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
                </h2>
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um projeto</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                    <select
                      value={newExpense.supplierId}
                      onChange={(e) => setNewExpense({...newExpense, supplierId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um fornecedor</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição da despesa"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número da Nota</label>
                    <input
                      type="text"
                      value={newExpense.invoiceNumber}
                      onChange={(e) => setNewExpense({...newExpense, invoiceNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="NF-001234"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveExpense}
                  className="btn-primary"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingInvoice ? 'Editar Fatura' : 'Nova Fatura'}
                </h2>
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setEditingInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <select
                      value={newInvoice.type}
                      onChange={(e) => setNewInvoice({...newInvoice, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="income">Receita</option>
                      <option value="expense">Despesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número da Fatura</label>
                    <input
                      type="text"
                      value={newInvoice.invoiceNumber}
                      onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="NF-001234"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {newInvoice.type === 'income' ? 'Cliente' : 'Fornecedor'}
                    </label>
                    <select
                      value={newInvoice.type === 'income' ? newInvoice.clientId : newInvoice.supplierId}
                      onChange={(e) => {
                        if (newInvoice.type === 'income') {
                          setNewInvoice({...newInvoice, clientId: e.target.value});
                        } else {
                          setNewInvoice({...newInvoice, supplierId: e.target.value});
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      {newInvoice.type === 'income' ? (
                        clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))
                      ) : (
                        suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
                    <select
                      value={newInvoice.projectId}
                      onChange={(e) => setNewInvoice({...newInvoice, projectId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um projeto</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <input
                      type="number"
                      value={newInvoice.amount}
                      onChange={(e) => {
                        const amount = e.target.value;
                        const tax = parseFloat(newInvoice.tax || '0');
                        const total = (parseFloat(amount || '0') + tax).toString();
                        setNewInvoice({...newInvoice, amount, total});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imposto</label>
                    <input
                      type="number"
                      value={newInvoice.tax}
                      onChange={(e) => {
                        const tax = e.target.value;
                        const amount = parseFloat(newInvoice.amount || '0');
                        const total = (amount + parseFloat(tax || '0')).toString();
                        setNewInvoice({...newInvoice, tax, total});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                    <input
                      type="number"
                      value={newInvoice.total}
                      onChange={(e) => setNewInvoice({...newInvoice, total: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Emissão</label>
                    <input
                      type="date"
                      value={newInvoice.issueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento</label>
                    <input
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setEditingInvoice(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveInvoice}
                  className="btn-primary"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
