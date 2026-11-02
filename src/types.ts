// ============================================================
// Типы данных модуля «Электронное дело» (Case Management Module)
// ============================================================

export interface CaseFile {
  id: string;
  index: string;           // Индекс номенклатуры
  title: string;           // Название дела
  openDate: string;        // Дата открытия
  closeDate: string;       // Дата закрытия
  counterpart: string;     // Контрагент/Тематика
  status: CaseStatus;      // Статус дела
  responsible: string;     // Ответственный
  directoryPath: string;   // Ссылка на директорию
  documents: DocumentFile[]; // Список прикрепленных документов
  hash: string;            // Контрольная сумма
}

export type CaseStatus = 'active' | 'closed' | 'archived' | 'pending';

export interface DocumentFile {
  id: string;
  fileName: string;
  originalName: string;
  category: DocumentCategory;
  addedDate: string;
  author: string;
  size: number;
  version: number;
  hash: string;
}

export type DocumentCategory = 
  | 'incoming'      // Входящий документ
  | 'outgoing'      // Исходящий документ
  | 'internal'      // Внутренний документ
  | 'contract'      // Договор
  | 'report'        // Отчет
  | 'correspondence' // Переписка
  | 'other';        // Прочее

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  caseId: string;
  details: string;
}

export type AuditAction = 
  | 'case_created'
  | 'case_updated'
  | 'case_closed'
  | 'case_archived'
  | 'document_added'
  | 'document_removed'
  | 'document_renamed'
  | 'export_performed'
  | 'access_granted'
  | 'access_denied';

export interface AppState {
  cases: CaseFile[];
  auditLog: AuditEntry[];
  currentUser: string;
  currentView: ViewType;
  selectedCase: CaseFile | null;
}

export type ViewType = 'dashboard' | 'case-form' | 'document-form' | 'search' | 'audit-log' | 'directory-tree';
