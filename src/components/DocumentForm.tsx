import { useState } from 'react';
import { CaseFile, DocumentFile, DocumentCategory, AuditEntry } from '../types';
import {
  generateDocId, formatDocumentName, computeHash,
  getCategoryText, validateFileName
} from '../utils';

interface DocumentFormProps {
  cases: CaseFile[];
  onAddDocument: (caseId: string, doc: DocumentFile, auditEntry: AuditEntry) => void;
}

export default function DocumentForm({ cases, onAddDocument }: DocumentFormProps) {
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [originalFileName, setOriginalFileName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('incoming');
  const [fileSize, setFileSize] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeCases = cases.filter(c => c.status === 'active' || c.status === 'pending');
  const selectedCase = cases.find(c => c.id === selectedCaseId);

  // Имитация выбора файла через FileDialog
  const handleFileSelect = () => {
    // Симуляция выбора файла
    const mockFiles = [
      { name: 'Акт_выполненных_работ.pdf', size: 245760 },
      { name: 'Служебная_записка.docx', size: 51200 },
      { name: 'Счёт_на_оплату.xlsx', size: 102400 },
      { name: 'Дополнительное_соглашение.pdf', size: 512000 },
      { name: 'Протокол_совещания.docx', size: 76800 },
    ];
    const mock = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setOriginalFileName(mock.name);
    setFileSize(mock.size);
    setErrors({...errors, file: ''});
  };

  // Вычисление нового имени файла
  const getNewFileName = (): string => {
    if (!selectedCase || !originalFileName) return '';
    const currentVersion = selectedCase.documents
      .filter(d => d.category === category)
      .length + 1;
    return formatDocumentName(selectedCase.id, category, originalFileName, currentVersion);
  };

  // Валидация
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedCaseId) newErrors.case = 'Выберите дело';
    if (!originalFileName) newErrors.file = 'Выберите файл для прикрепления';
    else {
      const nameValidation = validateFileName(originalFileName);
      if (!nameValidation.valid) newErrors.file = nameValidation.message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Добавление документа
  const handleAdd = () => {
    if (!validate()) return;

    const currentVersion = selectedCase!.documents
      .filter(d => d.category === category)
      .length + 1;

    const newDoc: DocumentFile = {
      id: generateDocId(),
      fileName: getNewFileName(),
      originalName: originalFileName,
      category,
      addedDate: new Date().toISOString().slice(0, 10),
      author: 'Иванов А.С.',
      size: fileSize,
      version: currentVersion,
      hash: computeHash(originalFileName + Date.now().toString()),
    };

    onAddDocument(selectedCaseId, newDoc, {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Иванов А.С.',
      action: 'document_added',
      caseId: selectedCaseId,
      details: `Добавлен документ: ${originalFileName} → ${newDoc.fileName}`
    });

    // Сброс формы
    setSelectedCaseId('');
    setOriginalFileName('');
    setFileSize(0);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const categories: { value: DocumentCategory; label: string; icon: string }[] = [
    { value: 'incoming', label: 'Входящий', icon: 'fa-arrow-down' },
    { value: 'outgoing', label: 'Исходящий', icon: 'fa-arrow-up' },
    { value: 'internal', label: 'Внутренний', icon: 'fa-building' },
    { value: 'contract', label: 'Договор', icon: 'fa-handshake' },
    { value: 'report', label: 'Отчёт', icon: 'fa-chart-bar' },
    { value: 'correspondence', label: 'Переписка', icon: 'fa-envelope' },
    { value: 'other', label: 'Прочее', icon: 'fa-file' },
  ];

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Добавление документа</h2>
        <p className="text-slate-500 text-sm mt-1">
          Форма 2: Классификация, переименование и прикрепление документа к делу
        </p>
      </div>

      {/* Уведомление */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <i className="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
          <div>
            <p className="text-emerald-800 text-sm font-medium">Документ успешно добавлен!</p>
            <p className="text-emerald-600 text-xs mt-0.5">Файл скопирован в папку дела, опись обновлена.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка — форма */}
        <div className="space-y-5">
          {/* Выбор дела */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-folder text-blue-600"></i>
              1. Выберите дело
            </h3>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                errors.case ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            >
              <option value="">— Выберите дело для прикрепления —</option>
              {activeCases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title}
                </option>
              ))}
            </select>
            {errors.case && <p className="text-xs text-red-500 mt-1">{errors.case}</p>}
            {selectedCase && (
              <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">{selectedCase.title}</p>
                <p className="text-xs text-blue-500 mt-0.5">{selectedCase.directoryPath}</p>
              </div>
            )}
          </div>

          {/* Выбор файла */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-file-import text-blue-600"></i>
              2. Выберите файл
            </h3>
            <div
              onClick={handleFileSelect}
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
            >
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-2"></i>
              <p className="text-sm text-slate-600">Нажмите для выбора файла</p>
              <p className="text-xs text-slate-400 mt-1">Или перетащите файл в эту область</p>
            </div>
            {errors.file && <p className="text-xs text-red-500 mt-2">{errors.file}</p>}
            {originalFileName && (
              <div className="mt-3 flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                <i className="fa-solid fa-file text-slate-500"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{originalFileName}</p>
                  <p className="text-xs text-slate-500">
                    {(fileSize / 1024).toFixed(1)} КБ
                  </p>
                </div>
                <button
                  onClick={() => { setOriginalFileName(''); setFileSize(0); }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
          </div>

          {/* Категория документа */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-tags text-blue-600"></i>
              3. Категория документа
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border transition-all ${
                    category === cat.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <i className={`fa-solid ${cat.icon} text-xs`}></i>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка — предпросмотр */}
        <div className="space-y-5">
          {/* Предпросмотр переименования */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-eye text-blue-600"></i>
              Предпросмотр результата
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Исходное имя файла
                </label>
                <p className="text-sm text-slate-700 mt-1 font-mono bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {originalFileName || '— не выбран —'}
                </p>
              </div>

              <div className="flex items-center justify-center">
                <i className="fa-solid fa-arrow-down text-slate-400"></i>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Новое имя (по правилу)
                </label>
                <p className="text-sm text-blue-700 mt-1 font-mono bg-blue-50 px-3 py-2 rounded border border-blue-200 break-all">
                  {getNewFileName() || '— выберите дело и файл —'}
                </p>
              </div>

              {/* Правило именования */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p className="text-xs text-amber-800 font-medium mb-1">
                  <i className="fa-solid fa-lightbulb mr-1"></i>
                  Правило именования:
                </p>
                <code className="text-xs text-amber-700 font-mono">
                  {'{ID_дела}_{Категория}_{Дата}_{Имя_файла}_v{Версия}.{ext}'}
                </code>
              </div>
            </div>
          </div>

          {/* Информация о версионности */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-code-branch text-blue-600"></i>
              Контроль версионности
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Версия документа: <strong>v{selectedCase ? selectedCase.documents.filter(d => d.category === category).length + 1 : 1}</strong>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Защита от перезаписи: <strong>активна</strong>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Контрольная сумма: <strong className="font-mono text-xs">{originalFileName ? computeHash(originalFileName + Date.now()) : '—'}</strong>
              </p>
            </div>
          </div>

          {/* Кнопка добавления */}
          <button
            onClick={handleAdd}
            disabled={!selectedCaseId || !originalFileName}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-file-circle-plus"></i>
            Добавить документ к делу
          </button>

          {/* Справка по операциям */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              <i className="fa-solid fa-circle-info text-slate-500 mr-2"></i>
              Выполняемые операции
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                Проверка прав доступа к папке дела
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                Копирование файла из временного источника
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                Автоматическое переименование по правилу
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                Защита от перезаписи (версионность)
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                Вычисление контрольной суммы
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                Обновление внутренней описи
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                Запись в журнал аудита
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
