import { CaseFile } from '../types';
import { BASE_PATH } from '../utils';

interface DirectoryTreeProps {
  cases: CaseFile[];
}

export default function DirectoryTree({ cases }: DirectoryTreeProps) {
  // Группировка дел по годам
  const casesByYear: Record<string, CaseFile[]> = {};
  cases.forEach(c => {
    const year = c.openDate.slice(0, 4);
    if (!casesByYear[year]) casesByYear[year] = [];
    casesByYear[year].push(c);
  });

  const subfolders = ['Входящие', 'Исходящие', 'Внутренние', 'Договоры', 'Отчёты', 'Переписка'];

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Структура каталогов</h2>
        <p className="text-slate-500 text-sm mt-1">
          Стандартизированное древо папок на сетевом хранилище
        </p>
      </div>

      {/* Информация о хранилище */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-server text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Сервер</p>
              <p className="text-xs text-slate-500 font-mono">\\fileserver</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-network-wired text-emerald-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Протокол</p>
              <p className="text-xs text-slate-500">SMB/LAN</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-purple-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Доступ</p>
              <p className="text-xs text-slate-500">Чтение/Запись (группа)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Дерево каталогов */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <i className="fa-solid fa-folder-tree text-blue-600"></i>
            Древо папок файловой системы
          </h3>
        </div>
        <div className="p-5 font-mono text-sm">
          {/* Корневая папка */}
          <TreeItem icon="fa-hard-drive" label="fileserver" type="server" />
          <TreeItem icon="fa-server" label="cases" type="root" indent={1} />
          
          {/* По годам */}
          {Object.keys(casesByYear).sort().reverse().map(year => (
            <div key={year}>
              <TreeItem icon="fa-calendar" label={year} type="year" indent={2} />
              
              {/* Дела в году */}
              {casesByYear[year].map(caseItem => (
                <div key={caseItem.id}>
                  <TreeItem
                    icon={caseItem.status === 'closed' || caseItem.status === 'archived' ? 'fa-folder-closed' : 'fa-folder-open'}
                    label={caseItem.id}
                    subtitle={caseItem.title}
                    type="case"
                    indent={3}
                    status={caseItem.status}
                  />
                  
                  {/* Подпапки дела (показываем для первого дела) */}
                  {casesByYear[year].indexOf(caseItem) === 0 && subfolders.map(sub => (
                    <TreeItem
                      key={sub}
                      icon="fa-folder"
                      label={sub}
                      type="subfolder"
                      indent={4}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Схема архитектуры */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-diagram-project text-blue-600"></i>
          Архитектурная схема хранения
        </h3>
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="flex flex-col items-center gap-3">
            {/* Уровень 1 */}
            <div className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg">
              <i className="fa-solid fa-server mr-2"></i>
              \\fileserver\cases
            </div>
            <i className="fa-solid fa-arrow-down text-slate-400"></i>
            
            {/* Уровень 2 */}
            <div className="flex gap-3 flex-wrap justify-center">
              {Object.keys(casesByYear).sort().reverse().map(year => (
                <div key={year} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm border border-emerald-200">
                  <i className="fa-solid fa-calendar mr-1.5"></i>
                  {year}
                </div>
              ))}
            </div>
            <i className="fa-solid fa-arrow-down text-slate-400"></i>
            
            {/* Уровень 3 */}
            <div className="flex gap-3 flex-wrap justify-center">
              {cases.slice(0, 3).map(c => (
                <div key={c.id} className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-xs border border-amber-200">
                  <i className="fa-solid fa-folder mr-1"></i>
                  {c.id}
                </div>
              ))}
              <div className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs border border-slate-200">
                ...
              </div>
            </div>
            <i className="fa-solid fa-arrow-down text-slate-400"></i>
            
            {/* Уровень 4 */}
            <div className="flex gap-2 flex-wrap justify-center">
              {subfolders.map(sub => (
                <div key={sub} className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded text-xs border border-purple-200">
                  {sub}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Стандарт подпапок */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-list-check text-blue-600"></i>
          Стандартная структура подпапок дела
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {subfolders.map((sub, idx) => {
            const descriptions = [
              'Входящая корреспонденция и документы',
              'Исходящие письма и ответы',
              'Служебные записки, приказы',
              'Договоры и доп. соглашения',
              'Отчёты, акты, справки',
              'Деловая переписка'
            ];
            return (
              <div key={sub} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{sub}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{descriptions[idx]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Компонент элемента дерева
function TreeItem({ icon, label, subtitle, type, indent = 0, status }: {
  icon: string;
  label: string;
  subtitle?: string;
  type: 'server' | 'root' | 'year' | 'case' | 'subfolder';
  indent?: number;
  status?: string;
}) {
  const colorMap: Record<string, string> = {
    server: 'text-slate-800 font-bold',
    root: 'text-blue-700 font-semibold',
    year: 'text-emerald-700 font-semibold',
    case: 'text-amber-700',
    subfolder: 'text-slate-500',
  };

  const iconColorMap: Record<string, string> = {
    server: 'text-slate-600',
    root: 'text-blue-500',
    year: 'text-emerald-500',
    case: 'text-amber-500',
    subfolder: 'text-slate-400',
  };

  return (
    <div
      className="flex items-center gap-2 py-1 hover:bg-slate-50 rounded px-2 -mx-2"
      style={{ paddingLeft: `${indent * 24 + 8}px` }}
    >
      <i className={`fa-solid ${icon} ${iconColorMap[type]} text-xs w-4 text-center`}></i>
      <span className={`${colorMap[type]} text-sm`}>
        {label}
        {subtitle && <span className="text-slate-400 font-normal ml-2 text-xs">— {subtitle}</span>}
      </span>
      {status === 'closed' && <i className="fa-solid fa-lock text-red-400 text-[10px] ml-1"></i>}
      {status === 'archived' && <i className="fa-solid fa-box-archive text-slate-400 text-[10px] ml-1"></i>}
    </div>
  );
}
