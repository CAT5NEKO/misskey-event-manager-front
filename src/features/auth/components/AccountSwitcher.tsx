import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';

export function AccountSwitcher() {
  const { sessions, activeIndex, switchAccount, removeAccount } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSwitch = async (index: number) => {
    if (index === activeIndex) { setOpen(false); return; }
    await switchAccount(index);
    setOpen(false);
    navigate('/');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
      >
        <span className="w-2 h-2 rounded-full bg-green-500" />
        {sessions[activeIndex]?.name}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
            {sessions.map((s, i) => (
              <div
                key={s.userId}
                className={`flex items-center justify-between px-3 py-2 ${
                  sessions.length > 1 ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                } ${
                  i === activeIndex ? 'bg-blue-50' : ''
                }`}
                onClick={() => sessions.length > 1 && handleSwitch(i)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {s.avatarUrl ? (
                    <img src={s.avatarUrl} className="w-6 h-6 rounded-full shrink-0" alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300 shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                      {s.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">@{s.username}@{s.host}</p>
                  </div>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`${s.name} をログアウトしますか？`)) removeAccount(i);
                    }}
                    className="text-xs text-red-400 hover:text-red-600 shrink-0 ml-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <div className="border-t mt-1 pt-1">
              <button
                onClick={() => { setOpen(false); navigate('/login?add=1'); }}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-gray-50"
              >
                + アカウントを追加
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
