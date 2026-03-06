import { useNotifications } from '../../context/NotificationContext';

const NotificationToast = () => {
  const { notifications, clearNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="bg-white shadow-lg rounded-lg p-4 border-l-4 border-primary animate-slide-in"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{notif.type}</p>
              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
            </div>
            <button
              onClick={() => clearNotification(notif.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;