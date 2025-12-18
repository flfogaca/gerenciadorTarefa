import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export class ExportService {
  exportToPDF(title: string, data: any[], columns: string[], columnLabels?: Record<string, string>) {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    const headers = columns.map(col => columnLabels?.[col] || col);
    const body = data.map(item => 
      columns.map(col => {
        const value = item[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 35, left: 14, right: 14 }
    });

    doc.save(`${title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel(title: string, data: any[], columns: string[], columnLabels?: Record<string, string>) {
    const worksheetData = data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        const label = columnLabels?.[col] || col;
        const value = item[col];
        row[label] = value === null || value === undefined ? '' : value;
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    
    const fileName = `${title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  exportDashboardToPDF(dashboardData: any, title: string = 'Relatório de Dashboard') {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(20);
    doc.text(title, 14, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, yPos);
    yPos += 15;

    if (dashboardData.stats || dashboardData.summary) {
      const stats = dashboardData.stats || dashboardData.summary;
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Estatísticas', 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      Object.entries(stats).forEach(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        const displayValue = typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value);
        doc.text(`${label}: ${displayValue}`, 20, yPos);
        yPos += 8;
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    if (dashboardData.recentProjects && dashboardData.recentProjects.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.text('Projetos Recentes', 14, yPos);
      yPos += 10;

      const projectData = dashboardData.recentProjects.map((p: any) => [
        p.name || 'N/A',
        p.status || 'N/A',
        p.progress ? `${p.progress}%` : '0%'
      ]);

      autoTable(doc, {
        head: [['Nome', 'Status', 'Progresso']],
        body: projectData,
        startY: yPos,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    doc.save(`dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportProjectsToPDF(projects: any[]) {
    this.exportToPDF(
      'Relatório de Projetos',
      projects,
      ['name', 'status', 'progress', 'clientName', 'endDate'],
      {
        name: 'Nome',
        status: 'Status',
        progress: 'Progresso (%)',
        clientName: 'Cliente',
        endDate: 'Data de Término'
      }
    );
  }

  exportTasksToPDF(tasks: any[]) {
    this.exportToPDF(
      'Relatório de Tarefas',
      tasks,
      ['title', 'status', 'priority', 'assignee', 'dueDate'],
      {
        title: 'Título',
        status: 'Status',
        priority: 'Prioridade',
        assignee: 'Responsável',
        dueDate: 'Prazo'
      }
    );
  }
}

export const exportService = new ExportService();
export default exportService;

