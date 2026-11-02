import { useState, useEffect } from 'react';
import { CaseFile, CaseStatus, AuditEntry } from '../types';
import {
  generateCaseId, validateFileName, validatePathLength,
  computeHash, getStatusColor, getStatusText,
  responsiblePersons, nomenclatureIndexes, BASE_PATH, formatFileSize
} from '../utils';

interface CaseFormProps {
  selectedCase: CaseFile | null;
  onSave: (caseData: CaseFile, auditEntry: AuditEntry) => void;
  onClose: () => void;
}

export default function CaseForm({ selectedCase, onSave, onClose }: CaseFormProps) {
  const isEditing = !!selectedCase;

  const [formData, setFormData] = useState({
    id: selectedCase?.id || generateCaseId(),
    index: selectedCase?.index || '',
    title: selectedCase?.title || '',
    openDate: selectedCase?.openDate || new Date().toISOString().slice(0, 10),
    closeDate: selectedCase?.closeDate || '',
    counterpart: selectedCase?.counterpart || '',
    status: selectedCase?.status || 'active' as CaseStatus,
    responsible: selectedCase?.responsible || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (selectedCase) {
      setFormData({
        id: selectedCase.id,
        index: selectedCase.index,
        title: selectedCase.title,
        openDate: selectedCase.openDate,
        closeDate: selectedCase.closeDate,
        counterpart: selectedCase.counterpart,
        status: selectedCase.status,
        responsible: selectedCase.responsible,
      });
    }
  }, [selectedCase]);

  // Валидация формы
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.index) newErrors.index = 'Укажите индекс номенклатуры';
    if (!formData.title) newErrors.title = 'Укажите название дела';
    else {
      const nameValidation = validateFileName(formData.title);
      if (!nameValidation.valid) newErrors.title = nameValidation.message;
    }
    if (!formData.counterpart) newErrors.counterpart = 'Укажите контрагента/тематику';
    if (!formData.responsible) newErrors.responsible = 'Выберите ответственного';
    if (!formData.openDate) newErrors.openDate = 'Укажите дату открытия';
    if (formData.status === 'closed' && !formData.closeDate) {
      newErrors.closeDate = 'Для закрытого дела укажите дату закрытия';
    }

    // Проверка длины пути
    const dirPath = `${BASE_PATH}\\${formData.openDate.slice(0, 4)}\\${formData.id}`;
    const pathValidation = validatePathLength(dirPath);
    if (!pathValidation.valid) newErrors.path = pathValidation.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Сохранение
  const handleSave = () => {
    if (!validate()) return;

    const dirPath = `${BASE_PATH}\\${formData.openDate.slice(0, 4)}\\${formData.id}`;
    const newCase: CaseFile = {
      id: formData.id,
      index: formData.index,
      title: formData.title,
      openDate: formData.openDate,
      closeDate: formData.closeDate,
      counterpart: formData.counterpart,
      status: formData.status,
      responsible: formData.responsible,
      directoryPath: dirPath,
      documents: selectedCase?.documents || [],
      hash: computeHash(formData.id + formData.title + Date.now().toString()),
    };

    onSave(newCase, {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Иванов А.С.',
      action: isEditing ? 'case_updated' : 'case_created',
      caseId: formData.id,
      details: isEditing
        ? `Обновлено дело «${formData.title}»`
        : `Создано дело «${formData.title}»`
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Блокировка для закрытых дел
  const isLocked = selectedCase?.status === 'closed' || selectedCase?.status === 'archived';

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isEditing ? 'Редактирование дела' : 'Новое дело'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Форма 1: Карточка дела — создание и редактирование метаданных
          </p>
        </div>
        {isEditing && (
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(selectedCase!.status)}`}>
            {getStatusText(selectedCase!.status)}
          </span>
        )}
      </div>

      {/* Уведомление об успехе */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <i className="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
          <p className="text-emerald-800 text-sm font-medium">
            Дело успешно {isEditing ? 'обновлено' : 'создано'}! Папка сформирована в хранилище.
          </p>
        </div>
      )}

      {/* Форма */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <i className="fa-solid fa-id-card text-blue-600"></i>
            Метаданные дела
          </h3>
        </div>

        <div className="p-6 space-y-5">
          {/* ID дела (автогенерация) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Уникальный номер дела (ID)
                <span className="text-xs text-slate-400 ml-2">автогенерация</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.id}
                  readOnly
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600"
                />
                {!isEditing && (
                  <button
                    onClick={() => setFormData({...formData, id: generateCaseId()})}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                    title="Перегенерировать ID"
                  >
                    <i className="fa-solid fa-arrows-rotate"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Индекс номенклатуры */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Индекс номенклатуры <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.index}
                onChange={(e) => setFormData({...formData, index: e.target.value})}
                disabled={isLocked}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                  errors.index ? 'border-red-300 bg-red-50' : 'border-slate-200'
                } ${isLocked ? 'bg-slate-50 text-slate-500' : ''}`}
              >
                <option value="">— Выберите индекс —</option>
                {nomenclatureIndexes.map(idx => (
                  <option key={idx} value={idx}>{idx}</option>
                ))}
              </select>
              {errors.index && <p className="text-xs text-red-500 mt-1">{errors.index}</p>}
            </div>
          </div>

          {/* Название дела */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Название дела <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              disabled={isLocked}
              placeholder="Введите название дела"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200'
              } ${isLocked ? 'bg-slate-50 text-slate-500' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Контрагент */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Контрагент / Тематика <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.counterpart}
              onChange={(e) => setFormData({...formData, counterpart: e.target.value})}
              disabled={isLocked}
              placeholder="Например: ООО «Компания» или Отдел кадров"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                errors.counterpart ? 'border-red-300 bg-red-50' : 'border-slate-200'
              } ${isLocked ? 'bg-slate-50 text-slate-500' : ''}`}
            />
            {errors.counterpart && <p className="text-xs text-red-500 mt-1">{errors.counterpart}</p>}
          </div>

          {/* Даты и ответственный */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Дата открытия <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.openDate}
                onChange={(e) => setFormData({...formData, openDate: e.target.value})}
                disabled={isLocked}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                  errors.openDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
                } ${isLocked ? 'bg-slate-50 text-slate-500' : ''}`}
              />
              {errors.openDate && <p className="text-xs text-red-500 mt-1">{errors.openDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Дата закрытия
                {formData.status === 'closed' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="date"
                value={formData.closeDate}
                onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                disabled={isLocked}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                  errors.closeDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
                } ${isLocked ? 'bg-slate-50 text-slate-500' : ''}`}
              />
              {errors.closeDate && <p className="text-xs text-red-500 mt-1">{errors.closeDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Ответственный <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.responsible}
                onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                disabled={isLocked}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                  errors.responsible ? 'border-red-300 bg-red-50' : 'border-slate-200'
                } ${isLocked ? 'bg-slate-50 text-slate-500' : ''}`}
              >
                <option value="">— Выберите —</option>
                {responsiblePersons.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.responsible && <p className="text-xs text-red-500 mt-1">{errors.responsible}</p>}
            </div>
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Статус дела</label>
            <div className="flex gap-3 flex-wrap">
              {(['active', 'pending', 'closed', 'archived'] as CaseStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => !isLocked && setFormData({...formData, status})}
                  disabled={isLocked}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    formData.status === status
                      ? getStatusColor(status) + ' ring-2 ring-offset-1 ring-blue-400'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {getStatusText(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Путь к папке (предпросмотр) */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <i className="fa-solid fa-folder-tree text-slate-500 mr-2"></i>
              Путь к директории (автоматически)
            </label>
            <code className="text-sm text-blue-700 font-mono bg-white px-3 py-1.5 rounded border border-slate-200 block">
              {formData.openDate ? `${BASE_PATH}\\${formData.openDate.slice(0, 4)}\\${formData.id}` : 'Укажите дату открытия'}
            </code>
            {errors.path && <p className="text-xs text-red-500 mt-2">{errors.path}</p>}
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <i className="fa-solid fa-circle-info text-blue-500"></i>
              <span>Подпапки будут созданы автоматически: \Входящие, \Исходящие, \Внутренние, \Договоры</span>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 font-medium"
          >
            Отмена
          </button>
          <div className="flex items-center gap-3">
            {isEditing && !isLocked && (
              <button
                onClick={() => {
                  onSave({...selectedCase!, status: 'closed', closeDate: new Date().toISOString().slice(0, 10)}, {
                    id: `AUD-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    user: 'Иванов А.С.',
                    action: 'case_closed',
                    caseId: selectedCase!.id,
                    details: `Дело «${selectedCase!.title}» закрыто`
                  });
                  onClose();
                }}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors"
              >
                <i className="fa-solid fa-lock mr-2"></i>
                Закрыть дело
              </button>
            )}
            {!isLocked && (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
              >
                <i className="fa-solid fa-save mr-2"></i>
                {isEditing ? 'Сохранить изменения' : 'Создать дело'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Документы дела (если редактирование) */}
      {isEditing && selectedCase!.documents.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <i className="fa-solid fa-paperclip text-blue-600"></i>
              Прикреплённые документы ({selectedCase!.documents.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {selectedCase!.documents.map(doc => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-file text-blue-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{doc.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {doc.addedDate} • {doc.author} • {formatFileSize(doc.size)} • v{doc.version}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">#{doc.hash}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
