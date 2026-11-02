import { AuditEntry } from '../types';
import { getAuditActionText } from '../utils';

interface AuditLogProps {
  auditLog: AuditEntry[];
}

export default function AuditLog({ auditLog }: AuditLogProps) {
  // Сортировка по дате (новые сверху)
  const sortedLog = [...auditLog].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActionIcon = (action: string): { icon: string; color: string } => {
    switch (action) {
      case 'case_created': return { icon: 'fa-folder-plus', color: 'text-emerald-600 bg-emerald-100' };
      case 'case_updated': return { icon: 'fa-pen', color: 'text-blue-600 bg-blue-100' };
      case 'case_closed': return { icon: 'fa-lock', color: 'text-red-600 bg-red-100' };
      case 'case_archived': return { icon: 'fa-box-archive', color: 'text-slate-600 bg-slate-100' };
      case 'document_added': return { icon: 'fa-file-circle-plus', color: 'text-purple-600 bg-purple-100' };
      case 'document_removed': return { icon: 'fa-file-circle-xmark', color: 'text-red-600 bg-red-100' };
      case 'document_renamed': return { icon: 'fa-pen-to-square', color: 'text-amber-600 bg-amber-100' };
      case 'export_performed': return { icon: 'fa-file-export', color: 'text-teal-600 bg-teal-100' };
      case 'access_granted': return { icon: 'fa-unlock', color: 'text-emerald-600 bg-emerald-100' };
      case 'access_denied': return { icon: 'fa-ban', color: 'text-red-600 bg-red-100' };
      default: return { icon: 'fa-circle-info', color: 'text-slate-600 bg-slate-100' };
    }
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Журнал аудита</h2>
          <p className="text-slate-500 text-sm mt-1">
            Регистрация всех действий пользователей в системе
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600">
            <i className="fa-solid fa-list-ol mr-1.5"></i>
            {auditLog.length} записей
          </span>
          <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors">
            <i className="fa-solid fa-file-export mr-1.5"></i>
            Экспорт
          </button>
        </div>
      </div>

      {/* Легенда */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <span className="text-xs text-slate-500 font-medium">Действия:</span>
          {['case_created', 'case_updated', 'case_closed', 'document_added', 'document_removed'].map(action => {
            const { icon, color } = getActionIcon(action);
            return (
              <span key={action} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className={`w-5 h-5 rounded flex items-center justify-center ${color}`}>
                  <i className={`fa-solid ${icon} text-[10px]`}></i>
                </span>
                {getAuditActionText(action)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Список записей */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {sortedLog.map((entry) => {
            const { icon, color } = getActionIcon(entry.action);
            return (
              <div key={entry.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Иконка действия */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <i className={`fa-solid ${icon} text-sm`}></i>
                  </div>

                  {/* Содержимое */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800">
                        {getAuditActionText(entry.action)}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 font-mono">
                        {entry.caseId}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{entry.details}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-500">
                        <i className="fa-solid fa-user mr-1"></i>
                        {entry.user}
                      </span>
                      <span className="text-xs text-slate-400">
                        <i className="fa-solid fa-clock mr-1"></i>
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sortedLog.length === 0 && (
          <div className="p-10 text-center">
            <i className="fa-solid fa-clipboard text-4xl text-slate-300 mb-3"></i>
            <p className="text-slate-500">Журнал пуст</p>
          </div>
        )}
      </div>
    </div>
  );
}
