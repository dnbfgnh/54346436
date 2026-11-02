import { useState, useCallback } from 'react';
import { CaseFile, AuditEntry, DocumentFile, ViewType } from './types';
import { initialCases, initialAuditLog } from './utils';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CaseForm from './components/CaseForm';
import DocumentForm from './components/DocumentForm';
import SearchRegistry from './components/SearchRegistry';
import AuditLog from './components/AuditLog';
import DirectoryTree from './components/DirectoryTree';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [cases, setCases] = useState<CaseFile[]>(initialCases);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(initialAuditLog);
  const [selectedCase, setSelectedCase] = useState<CaseFile | null>(null);

  // Обработчик сохранения дела
  const handleSaveCase = useCallback((caseData: CaseFile, auditEntry: AuditEntry) => {
    setCases(prev => {
      const existing = prev.findIndex(c => c.id === caseData.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = caseData;
        return updated;
      }
      return [caseData, ...prev];
    });
    setAuditLog(prev => [auditEntry, ...prev]);
    setSelectedCase(caseData);
  }, []);

  // Обработчик добавления документа
  const handleAddDocument = useCallback((caseId: string, doc: DocumentFile, auditEntry: AuditEntry) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, documents: [...c.documents, doc] };
      }
      return c;
    }));
    setAuditLog(prev => [auditEntry, ...prev]);
  }, []);

  // Обработчик выбора дела
  const handleSelectCase = useCallback((caseItem: CaseFile) => {
    setSelectedCase(caseItem);
  }, []);

  // Навигация
  const handleNavigate = useCallback((view: ViewType) => {
    setCurrentView(view);
    if (view !== 'case-form') {
      // Не сбрасываем selectedCase при переходе на форму, чтобы можно было редактировать
    }
  }, []);

  // Рендер содержимого
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            cases={cases}
            onNavigate={handleNavigate}
            onSelectCase={handleSelectCase}
          />
        );
      case 'case-form':
        return (
          <CaseForm
            selectedCase={selectedCase}
            onSave={handleSaveCase}
            onClose={() => { setSelectedCase(null); setCurrentView('dashboard'); }}
          />
        );
      case 'document-form':
        return (
          <DocumentForm
            cases={cases}
            onAddDocument={handleAddDocument}
          />
        );
      case 'search':
        return (
          <SearchRegistry
            cases={cases}
            onSelectCase={handleSelectCase}
            onNavigate={handleNavigate}
          />
        );
      case 'audit-log':
        return <AuditLog auditLog={auditLog} />;
      case 'directory-tree':
        return <DirectoryTree cases={cases} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Боковая панель */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        caseCount={cases.length}
      />

      {/* Основной контент */}
      <main className="flex-1 overflow-auto">
        {/* Верхняя панель */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
              <button onClick={() => setCurrentView('dashboard')} className="hover:text-blue-600">
                Главная
              </button>
              <i className="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
              <span className="text-slate-700 font-medium">
                {currentView === 'dashboard' && 'Панель управления'}
                {currentView === 'case-form' && (selectedCase ? 'Редактирование дела' : 'Новое дело')}
                {currentView === 'document-form' && 'Добавление документа'}
                {currentView === 'search' && 'Поиск и реестр'}
                {currentView === 'audit-log' && 'Журнал аудита'}
                {currentView === 'directory-tree' && 'Структура каталогов'}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <i className="fa-solid fa-bell"></i>
              {auditLog.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {auditLog.length > 9 ? '9+' : auditLog.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                ИА
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">Иванов А.С.</p>
                <p className="text-xs text-slate-500">Администратор</p>
              </div>
            </div>
          </div>
        </header>

        {/* Содержимое страницы */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
