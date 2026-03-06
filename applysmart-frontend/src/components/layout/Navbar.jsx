import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();
  const [showProfileMenu, setShowProfileMenu]     = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef   = useRef(null);
  const location   = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tracker',   label: 'Applications' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-0 flex justify-between items-center h-14">

        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-black text-gray-900 text-lg tracking-tight">
            <span className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm">🧠</span>
            ApplySmart
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname === link.to
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <span className="text-2xl block mb-2">🔔</span>
                    <p className="text-sm text-gray-400">No new notifications</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <p className="text-sm font-semibold text-gray-900">{notif.type}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-semibold text-gray-700">{user?.name}</span>
              <svg className={`hidden md:block w-3.5 h-3.5 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                </div>
                {[
                  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
                  { to: '/tracker',   icon: '📋', label: 'My Applications' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-500 w-full transition-colors"
                >
                  <span className="text-base">🚪</span>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;