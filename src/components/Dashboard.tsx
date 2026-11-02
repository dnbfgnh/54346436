import { CaseFile } from '../types';
import { getStatusColor, getStatusText, formatFileSize } from '../utils';

interface DashboardProps {
  cases: CaseFile[];
  onNavigate: (view: any) => void;
  onSelectCase: (c: CaseFile) => void;
}

export default function Dashboard({ cases, onNavigate, onSelectCase }: DashboardProps) {
  const activeCases = cases.filter(c => c.status === 'active').length;
  const closedCases = cases.filter(c => c.status === 'closed').length;
  const archivedCases = cases.filter(c => c.status === 'archived').length;
  const pendingCases = cases.filter(c => c.status === 'pending').length;
  const totalDocs = cases.reduce((sum, c) => sum + c.documents.length, 0);
  const totalSize = cases.reduce((sum, c) => sum + c.documents.reduce((s, d) => s + d.size, 0), 0);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Панель управления</h2>
          <p className="text-slate-500 text-sm mt-1">Обзор системы электронного документооборота</p>
        </div>
        <button
          onClick={() => onNavigate('case-form')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
        >
          <i className="fa-solid fa-plus"></i>
          Новое дело
        </button>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Активные дела"
          value={activeCases}
          icon="fa-folder-open"
          color="emerald"
          subtitle="В работе"
        />
        <StatCard
          title="На рассмотрении"
          value={pendingCases}
          icon="fa-clock"
          color="amber"
          subtitle="Ожидают"
        />
        <StatCard
          title="Закрытые дела"
          value={closedCases}
          icon="fa-folder-closed"
          color="red"
          subtitle="Завершены"
        />
        <StatCard
          title="В архиве"
          value={archivedCases}
          icon="fa-box-archive"
          color="slate"
          subtitle="Архив"
        />
      </div>

      {/* Вторая строка статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-file-lines text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalDocs}</p>
              <p className="text-xs text-slate-500">Всего документов</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-hard-drive text-purple-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{formatFileSize(totalSize)}</p>
              <p className="text-xs text-slate-500">Общий объём</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-server text-teal-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">\\fileserver</p>
              <p className="text-xs text-slate-500">Сетевое хранилище</p>
            </div>
          </div>
        </div>
      </div>

      {/* Последние дела */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Последние дела</h3>
          <button
            onClick={() => onNavigate('search')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Все дела →
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {cases.slice(0, 5).map((c) => (
            <div
              key={c.id}
              className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => { onSelectCase(c); onNavigate('case-form'); }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-folder text-slate-500 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.id} • {c.counterpart}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{c.documents.length} док.</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(c.status)}`}>
                    {getStatusText(c.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: {
  title: string; value: number; icon: string; color: string; subtitle: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', iconBg: 'bg-slate-100' },
  };
  const c = colorMap[color] || colorMap.slate;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center`}>
          <i className={`fa-solid ${icon} ${c.text} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}
