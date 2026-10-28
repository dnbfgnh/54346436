import { useState } from 'react';
import { CaseFile, CaseStatus } from '../types';
import { getStatusColor, getStatusText, formatFileSize, getCategoryText } from '../utils';

interface SearchRegistryProps {
  cases: CaseFile[];
  onSelectCase: (c: CaseFile) => void;
  onNavigate: (view: any) => void;
}

export default function SearchRegistry({ cases, onSelectCase, onNavigate }: SearchRegistryProps) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  // Фильтрация дел
  const filteredCases = cases.filter(c => {
    // Текстовый поиск
    if (searchText) {
      const search = searchText.toLowerCase();
      const matches = c.title.toLowerCase().includes(search) ||
        c.id.toLowerCase().includes(search) ||
        c.counterpart.toLowerCase().includes(search) ||
        c.responsible.toLowerCase().includes(search) ||
        c.index.toLowerCase().includes(search);
      if (!matches) return false;
    }
    // Фильтр по статусу
    if (statusFilter && c.status !== statusFilter) return false;
    // Фильтр по дате
    if (dateFrom && c.openDate < dateFrom) return false;
    if (dateTo && c.openDate > dateTo) return false;
    return true;
  });

  // Переход в папку (имитация)
  const handleOpenFolder = (path: string) => {
    alert(`Открытие папки в проводнике:\n${path}\n\n(В реальной системе будет выполнен Shell.Execute("explorer.exe ${path}"))`);
  };

  // Экспорт описи
  const handleExportInventory = (caseItem: CaseFile) => {
    alert(`Экспорт внутренней описи дела "${caseItem.title}"\n\nФормат: XLSX\nФайлов в описи: ${caseItem.documents.length}\n\n(В реальной системе будет сформирован файл описи с колонками: №, Имя файла, Категория, Дата, Автор, Размер, Хэш)`);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Поиск и реестр дел</h2>
        <p className="text-slate-500 text-sm mt-1">
          Форма 3: Фильтрация, контекстный поиск, переход в папку дела
        </p>
      </div>

      {/* Панель фильтров */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Текстовый поиск */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Контекстный поиск
            </label>
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ID, название, контрагент, ответственный..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Статус
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="pending">На рассмотрении</option>
              <option value="closed">Закрытые</option>
              <option value="archived">В архиве</option>
            </select>
          </div>

          {/* Период */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Период открытия
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-2 py-2.5 border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-2 py-2.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Найдено: <strong className="text-slate-700">{filteredCases.length}</strong> дел
          </p>
          <button
            onClick={() => { setSearchText(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            <i className="fa-solid fa-filter-circle-xmark mr-1"></i>
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Результаты поиска */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Таблица */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">ID / Индекс</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Название</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Контрагент</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Ответственный</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Дата</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Док.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Статус</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map(c => (
                <>
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-mono font-medium text-slate-800">{c.id}</p>
                      <p className="text-xs text-slate-500">{c.index}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{c.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600">{c.counterpart}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600">{c.responsible}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600">{c.openDate}</p>
                      {c.closeDate && <p className="text-xs text-slate-400">→ {c.closeDate}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-blue-600">{c.documents.length}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(c.status)}`}>
                        {getStatusText(c.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Подробнее"
                        >
                          <i className={`fa-solid fa-chevron-${expandedCase === c.id ? 'up' : 'down'} text-xs`}></i>
                        </button>
                        <button
                          onClick={() => handleOpenFolder(c.directoryPath)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Открыть папку"
                        >
                          <i className="fa-solid fa-folder-open text-xs"></i>
                        </button>
                        <button
                          onClick={() => { onSelectCase(c); onNavigate('case-form'); }}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Редактировать"
                        >
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleExportInventory(c)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Экспорт описи"
                        >
                          <i className="fa-solid fa-file-export text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Раскрывающаяся строка с документами */}
                  {expandedCase === c.id && (
                    <tr key={`${c.id}-details`}>
                      <td colSpan={8} className="px-4 py-4 bg-slate-50/50">
                        <div className="ml-8">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Документы дела ({c.documents.length})
                          </p>
                          {c.documents.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">Нет прикреплённых документов</p>
                          ) : (
                            <div className="space-y-1.5">
                              {c.documents.map(doc => (
                                <div key={doc.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-200">
                                  <i className="fa-solid fa-file text-slate-400 text-sm"></i>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-mono text-slate-700 truncate">{doc.fileName}</p>
                                  </div>
                                  <span className="text-xs text-slate-500 shrink-0">{getCategoryText(doc.category)}</span>
                                  <span className="text-xs text-slate-400 shrink-0">{formatFileSize(doc.size)}</span>
                                  <span className="text-xs text-slate-400 font-mono shrink-0">v{doc.version}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-slate-400">
                            <i className="fa-solid fa-link mr-1"></i>
                            {c.directoryPath}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCases.length === 0 && (
          <div className="p-10 text-center">
            <i className="fa-solid fa-folder-open text-4xl text-slate-300 mb-3"></i>
            <p className="text-slate-500">Дела не найдены по заданным критериям</p>
          </div>
        )}
      </div>
    </div>
  );
}
