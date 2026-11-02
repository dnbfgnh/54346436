// ============================================================
// Утилиты и начальные данные модуля «Электронное дело»
// ============================================================

import { CaseFile, DocumentFile, AuditEntry, CaseStatus, DocumentCategory } from './types';

// Генерация уникального ID по маске ДЕЛО-ГГГГ-НННН
export function generateCaseId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `ДЕЛО-${year}-${num}`;
}

// Генерация ID документа
export function generateDocId(): string {
  return `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Генерация ID записи аудита
export function generateAuditId(): string {
  return `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Валидация имени файла/папки (запрещенные символы Windows)
export function validateFileName(name: string): { valid: boolean; message: string } {
  const forbidden = /[\\/:*?"<>|]/;
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Имя не может быть пустым' };
  }
  if (forbidden.test(name)) {
    return { valid: false, message: 'Имя содержит запрещённые символы: \\ / : * ? " < > |' };
  }
  if (name.length > 200) {
    return { valid: false, message: 'Имя превышает максимальную длину (200 символов)' };
  }
  return { valid: true, message: '' };
}

// Проверка длины пути (MAX_PATH = 260 для Windows)
export function validatePathLength(path: string): { valid: boolean; message: string } {
  if (path.length > 260) {
    return { valid: false, message: `Путь превышает MAX_PATH (260): текущая длина ${path.length}` };
  }
  return { valid: true, message: '' };
}

// Формирование имени документа по правилу
export function formatDocumentName(
  caseId: string,
  category: DocumentCategory,
  originalName: string,
  version: number
): string {
  const ext = originalName.split('.').pop() || '';
  const baseName = originalName.split('.').slice(0, -1).join('_');
  const catMap: Record<DocumentCategory, string> = {
    incoming: 'ВХД',
    outgoing: 'ИСХ',
    internal: 'ВНУ',
    contract: 'ДГВ',
    report: 'ОТЧ',
    correspondence: 'ПРП',
    other: 'ПРО'
  };
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${caseId}_${catMap[category]}_${dateStr}_${baseName}_v${version}.${ext}`;
}

// Вычисление хэша (имитация)
export function computeHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

// Форматирование размера файла
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

// Получение цвета статуса
export function getStatusColor(status: CaseStatus): string {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'closed': return 'bg-red-100 text-red-800 border-red-300';
    case 'archived': return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

// Получение текста статуса
export function getStatusText(status: CaseStatus): string {
  switch (status) {
    case 'active': return 'Активное';
    case 'closed': return 'Закрыто';
    case 'archived': return 'В архиве';
    case 'pending': return 'На рассмотрении';
    default: return status;
  }
}

// Получение категории документа (текст)
export function getCategoryText(category: DocumentCategory): string {
  const map: Record<DocumentCategory, string> = {
    incoming: 'Входящий',
    outgoing: 'Исходящий',
    internal: 'Внутренний',
    contract: 'Договор',
    report: 'Отчёт',
    correspondence: 'Переписка',
    other: 'Прочее'
  };
  return map[category] || category;
}

// Получение текста действия аудита
export function getAuditActionText(action: string): string {
  const map: Record<string, string> = {
    case_created: 'Создание дела',
    case_updated: 'Обновление дела',
    case_closed: 'Закрытие дела',
    case_archived: 'Архивация дела',
    document_added: 'Добавление документа',
    document_removed: 'Удаление документа',
    document_renamed: 'Переименование документа',
    export_performed: 'Экспорт данных',
    access_granted: 'Предоставление доступа',
    access_denied: 'Отказ в доступе'
  };
  return map[action] || action;
}

// Начальные данные — дела
export const initialCases: CaseFile[] = [
  {
    id: 'ДЕЛО-2025-0001',
    index: 'НМ-01-03',
    title: 'Договор поставки оборудования',
    openDate: '2025-01-15',
    closeDate: '',
    counterpart: 'ООО «ТехноСервис»',
    status: 'active',
    responsible: 'Иванов А.С.',
    directoryPath: '\\\\fileserver\\cases\\2025\\ДЕЛО-2025-0001',
    documents: [
      {
        id: 'DOC-001',
        fileName: 'ДЕЛО-2025-0001_ДГВ_20250115_Договор_поставки_v1.pdf',
        originalName: 'Договор поставки.pdf',
        category: 'contract',
        addedDate: '2025-01-15',
        author: 'Иванов А.С.',
        size: 245760,
        version: 1,
        hash: 'A1B2C3D4'
      },
      {
        id: 'DOC-002',
        fileName: 'ДЕЛО-2025-0001_ВХД_20250120_Спецификация_v1.xlsx',
        originalName: 'Спецификация.xlsx',
        category: 'incoming',
        addedDate: '2025-01-20',
        author: 'Петрова М.В.',
        size: 102400,
        version: 1,
        hash: 'E5F6A7B8'
      }
    ],
    hash: 'FF001122'
  },
  {
    id: 'ДЕЛО-2025-0002',
    index: 'НМ-02-01',
    title: 'Кадровые вопросы Q1',
    openDate: '2025-02-01',
    closeDate: '',
    counterpart: 'Отдел кадров',
    status: 'active',
    responsible: 'Сидорова Е.Н.',
    directoryPath: '\\\\fileserver\\cases\\2025\\ДЕЛО-2025-0002',
    documents: [
      {
        id: 'DOC-003',
        fileName: 'ДЕЛО-2025-0002_ВНУ_20250201_Штатное_расписание_v1.docx',
        originalName: 'Штатное расписание.docx',
        category: 'internal',
        addedDate: '2025-02-01',
        author: 'Сидорова Е.Н.',
        size: 81920,
        version: 1,
        hash: 'C9D0E1F2'
      }
    ],
    hash: '33445566'
  },
  {
    id: 'ДЕЛО-2024-0015',
    index: 'НМ-05-02',
    title: 'Аренда офисного помещения',
    openDate: '2024-03-10',
    closeDate: '2024-12-31',
    counterpart: 'ИП Козлов В.А.',
    status: 'closed',
    responsible: 'Иванов А.С.',
    directoryPath: '\\\\fileserver\\cases\\2024\\ДЕЛО-2024-0015',
    documents: [
      {
        id: 'DOC-004',
        fileName: 'ДЕЛО-2024-0015_ДГВ_20240310_Договор_аренды_v2.pdf',
        originalName: 'Договор аренды.pdf',
        category: 'contract',
        addedDate: '2024-03-10',
        author: 'Иванов А.С.',
        size: 512000,
        version: 2,
        hash: 'A3B4C5D6'
      },
      {
        id: 'DOC-005',
        fileName: 'ДЕЛО-2024-0015_ОТЧ_20241215_Акт_приема-передачи_v1.pdf',
        originalName: 'Акт приема-передачи.pdf',
        category: 'report',
        addedDate: '2024-12-15',
        author: 'Козлов В.А.',
        size: 153600,
        version: 1,
        hash: 'E7F8A9B0'
      }
    ],
    hash: '77889900'
  },
  {
    id: 'ДЕЛО-2025-0003',
    index: 'НМ-03-01',
    title: 'Закупка канцтоваров',
    openDate: '2025-03-01',
    closeDate: '',
    counterpart: 'ООО «Канцелярия-Плюс»',
    status: 'pending',
    responsible: 'Петрова М.В.',
    directoryPath: '\\\\fileserver\\cases\\2025\\ДЕЛО-2025-0003',
    documents: [],
    hash: '11223344'
  },
  {
    id: 'ДЕЛО-2024-0008',
    index: 'НМ-01-01',
    title: 'Лицензирование ПО',
    openDate: '2024-01-20',
    closeDate: '2024-06-30',
    counterpart: 'Microsoft Russia',
    status: 'archived',
    responsible: 'Козлов Д.И.',
    directoryPath: '\\\\fileserver\\cases\\2024\\ДЕЛО-2024-0008',
    documents: [
      {
        id: 'DOC-006',
        fileName: 'ДЕЛО-2024-0008_ДГВ_20240120_Лицензионный_договор_v1.pdf',
        originalName: 'Лицензионный договор.pdf',
        category: 'contract',
        addedDate: '2024-01-20',
        author: 'Козлов Д.И.',
        size: 1048576,
        version: 1,
        hash: 'D1E2F3A4'
      }
    ],
    hash: '55667788'
  }
];

// Начальный журнал аудита
export const initialAuditLog: AuditEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2025-01-15T09:30:00',
    user: 'Иванов А.С.',
    action: 'case_created',
    caseId: 'ДЕЛО-2025-0001',
    details: 'Создано дело «Договор поставки оборудования»'
  },
  {
    id: 'AUD-002',
    timestamp: '2025-01-15T10:15:00',
    user: 'Иванов А.С.',
    action: 'document_added',
    caseId: 'ДЕЛО-2025-0001',
    details: 'Добавлен документ: Договор поставки.pdf'
  },
  {
    id: 'AUD-003',
    timestamp: '2025-01-20T14:00:00',
    user: 'Петрова М.В.',
    action: 'document_added',
    caseId: 'ДЕЛО-2025-0001',
    details: 'Добавлен документ: Спецификация.xlsx'
  },
  {
    id: 'AUD-004',
    timestamp: '2025-02-01T08:45:00',
    user: 'Сидорова Е.Н.',
    action: 'case_created',
    caseId: 'ДЕЛО-2025-0002',
    details: 'Создано дело «Кадровые вопросы Q1»'
  },
  {
    id: 'AUD-005',
    timestamp: '2024-12-31T17:00:00',
    user: 'Иванов А.С.',
    action: 'case_closed',
    caseId: 'ДЕЛО-2024-0015',
    details: 'Дело закрыто. Установлен атрибут «Только чтение»'
  }
];

// Ответственные лица
export const responsiblePersons = [
  'Иванов А.С.',
  'Петрова М.В.',
  'Сидорова Е.Н.',
  'Козлов Д.И.',
  'Новиков П.Р.',
  'Морозова Л.А.'
];

// Индексы номенклатуры
export const nomenclatureIndexes = [
  'НМ-01-01', 'НМ-01-02', 'НМ-01-03',
  'НМ-02-01', 'НМ-02-02',
  'НМ-03-01', 'НМ-03-02',
  'НМ-04-01',
  'НМ-05-01', 'НМ-05-02'
];

// Базовый путь к хранилищу
export const BASE_PATH = '\\\\fileserver\\cases';
