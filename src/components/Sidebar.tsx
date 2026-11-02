import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  caseCount: number;
}

export default function Sidebar({ currentView, onNavigate, caseCount }: SidebarProps) {
  const navItems: { view: ViewType; label: string; icon: string }[] = [
    { view: 'dashboard', label: 'Панель управления', icon: 'fa-gauge-high' },
    { view: 'case-form', label: 'Карточка дела', icon: 'fa-folder-plus' },
    { view: 'document-form', label: 'Добавить документ', icon: 'fa-file-circle-plus' },
    { view: 'search', label: 'Поиск и реестр', icon: 'fa-magnifying-glass' },
    { view: 'directory-tree', label: 'Структура каталогов', icon: 'fa-sitemap' },
    { view: 'audit-log', label: 'Журнал аудита', icon: 'fa-clipboard-list' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Логотип */}
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-briefcase text-white text-lg"></i>
          </div>
          <div>
            <h1 className="font-bold text-sm">Электронное дело</h1>
            <p className="text-xs text-slate-400">Case Management</p>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  currentView === item.view
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Статистика внизу */}
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Всего дел:</span>
            <span className="font-bold text-blue-400">{caseCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-400">Пользователь:</span>
            <span className="text-emerald-400">Иванов А.С.</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
