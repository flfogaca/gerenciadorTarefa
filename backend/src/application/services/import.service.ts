import { injectable } from 'inversify';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { Readable } from 'stream';

export interface ImportMapping {
  [key: string]: string; // Coluna do arquivo -> Campo do modelo
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  data: any[];
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'date' | 'email' | 'boolean';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

@injectable()
export class ImportService {
  /**
   * Importa dados de um arquivo CSV
   */
  async importCSV(
    fileBuffer: Buffer,
    mapping: ImportMapping,
    validationRules?: ValidationRule[]
  ): Promise<ImportResult> {
    try {
      const content = fileBuffer.toString('utf-8');
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
      });

      return this.processRecords(records, mapping, validationRules);
    } catch (error) {
      return {
        success: false,
        totalRows: 0,
        imported: 0,
        errors: [{ row: 0, field: 'file', message: `Erro ao processar CSV: ${(error as Error).message}` }],
        data: []
      };
    }
  }

  /**
   * Importa dados de um arquivo Excel
   */
  async importExcel(
    fileBuffer: Buffer,
    mapping: ImportMapping,
    sheetName?: string,
    validationRules?: ValidationRule[]
  ): Promise<ImportResult> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('Nenhuma planilha encontrada no arquivo Excel');
      }
      const sheet = sheetName 
        ? workbook.Sheets[sheetName] 
        : workbook.Sheets[firstSheetName];
      
      if (!sheet) {
        throw new Error('Planilha não encontrada');
      }
      
      const records = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
        defval: ''
      });

      return this.processRecords(records as any[], mapping, validationRules);
    } catch (error) {
      return {
        success: false,
        totalRows: 0,
        imported: 0,
        errors: [{ row: 0, field: 'file', message: `Erro ao processar Excel: ${(error as Error).message}` }],
        data: []
      };
    }
  }

  /**
   * Processa os registros e aplica validações
   */
  private processRecords(
    records: any[],
    mapping: ImportMapping,
    validationRules?: ValidationRule[]
  ): ImportResult {
    const result: ImportResult = {
      success: true,
      totalRows: records.length,
      imported: 0,
      errors: [],
      data: []
    };

    records.forEach((record, index) => {
      const rowNumber = index + 2; // +2 porque começa na linha 2 (linha 1 é cabeçalho)
      const mappedRecord: any = {};
      let hasError = false;

      // Aplica o mapeamento
      Object.entries(mapping).forEach(([fileColumn, modelField]) => {
        if (modelField) {
          const value = record[fileColumn];
          mappedRecord[modelField] = value;
        }
      });

      // Aplica validações
      if (validationRules) {
        validationRules.forEach(rule => {
          const value = mappedRecord[rule.field];
          
          // Validação de campo obrigatório
          if (rule.required && (value === undefined || value === null || value === '')) {
            result.errors.push({
              row: rowNumber,
              field: rule.field,
              message: `Campo obrigatório: ${rule.field}`
            });
            hasError = true;
            return;
          }

          // Se o campo não é obrigatório e está vazio, pula outras validações
          if (!rule.required && (value === undefined || value === null || value === '')) {
            return;
          }

          // Validação de tipo
          if (rule.type) {
            const typeError = this.validateType(value, rule.type, rule.field);
            if (typeError) {
              result.errors.push({
                row: rowNumber,
                field: rule.field,
                message: typeError
              });
              hasError = true;
              return;
            }
          }

          // Validação de tamanho
          if (rule.min !== undefined && value.length < rule.min) {
            result.errors.push({
              row: rowNumber,
              field: rule.field,
              message: `Valor muito curto. Mínimo: ${rule.min}`
            });
            hasError = true;
            return;
          }

          if (rule.max !== undefined && value.length > rule.max) {
            result.errors.push({
              row: rowNumber,
              field: rule.field,
              message: `Valor muito longo. Máximo: ${rule.max}`
            });
            hasError = true;
            return;
          }

          // Validação de padrão (regex)
          if (rule.pattern && !rule.pattern.test(String(value))) {
            result.errors.push({
              row: rowNumber,
              field: rule.field,
              message: `Formato inválido para ${rule.field}`
            });
            hasError = true;
            return;
          }

          // Validação customizada
          if (rule.custom) {
            const customResult = rule.custom(value);
            if (customResult !== true) {
              result.errors.push({
                row: rowNumber,
                field: rule.field,
                message: typeof customResult === 'string' ? customResult : `Validação falhou para ${rule.field}`
              });
              hasError = true;
              return;
            }
          }
        });
      }

      if (!hasError) {
        result.data.push(mappedRecord);
        result.imported++;
      }
    });

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Valida o tipo do valor
   */
  private validateType(value: any, type: string, field: string): string | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return `Campo ${field} deve ser texto`;
        }
        break;
      case 'number':
        if (isNaN(Number(value))) {
          return `Campo ${field} deve ser numérico`;
        }
        break;
      case 'date':
        if (isNaN(Date.parse(value))) {
          return `Campo ${field} deve ser uma data válida`;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return `Campo ${field} deve ser um email válido`;
        }
        break;
      case 'boolean':
        const boolValue = String(value).toLowerCase();
        if (boolValue !== 'true' && boolValue !== 'false' && boolValue !== '1' && boolValue !== '0') {
          return `Campo ${field} deve ser verdadeiro ou falso`;
        }
        break;
    }
    return null;
  }

  /**
   * Detecta automaticamente as colunas do arquivo
   */
  detectColumns(fileBuffer: Buffer, isExcel: boolean = false): string[] {
    try {
      if (isExcel) {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          return [];
        }
        const sheet = workbook.Sheets[firstSheetName];
        if (!sheet) {
          return [];
        }
        const firstRow = XLSX.utils.sheet_to_json(sheet, { range: 0, defval: '' });
        return firstRow.length > 0 ? Object.keys(firstRow[0] as any) : [];
      } else {
        const content = fileBuffer.toString('utf-8');
        const lines = content.split('\n');
        if (lines.length > 0 && lines[0]) {
          const parsed = parse(lines[0], { columns: false, skip_empty_lines: true });
          const headers = parsed[0] as string[] | undefined;
          return headers || [];
        }
      }
    } catch (error) {
      console.error('Erro ao detectar colunas:', error);
    }
    return [];
  }

  /**
   * Gera um template de mapeamento baseado nas colunas detectadas
   */
  generateMappingTemplate(fileColumns: string[], modelFields: string[]): ImportMapping {
    const mapping: ImportMapping = {};
    
    fileColumns.forEach(fileCol => {
      // Tenta fazer match automático (case-insensitive)
      const matchedField = modelFields.find(
        field => field.toLowerCase() === fileCol.toLowerCase() ||
                 field.toLowerCase().replace(/_/g, ' ') === fileCol.toLowerCase()
      );
      
      if (matchedField && fileCol) {
        mapping[fileCol] = matchedField;
      }
    });
    
    return mapping;
  }
}

