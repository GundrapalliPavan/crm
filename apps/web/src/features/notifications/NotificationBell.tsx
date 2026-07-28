import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Notification } from '@crm/types';
import { notificationLink } from './notification-link';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsList,
  useUnreadNotificationCount,
} from './useNotifications';

/** API.md sections 100-101: a lightweight bell + dropdown, not a dedicated page - matches the "no unnecessary notification overload" principle in PROJECT.md section 26. */
export function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: unread } = useUnreadNotificationCount();
  const { data: notifications } = useNotificationsList({ pageSize: 10 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleSelect(notification: Notification) {
    if (!notification.isRead) {
      void markRead.mutateAsync(notification.id);
    }
    setIsOpen(false);
    const link = notificationLink(notification);
    if (link) {
      navigate(link);
    }
  }

  const unreadCount = unread?.count ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-app)] hover:text-[var(--color-text-primary)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-danger-border)] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-[12px] font-medium text-[var(--color-action-primary)] hover:underline"
                onClick={() => void markAllRead.mutateAsync()}
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-96 overflow-y-auto">
            {notifications?.data.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">No notifications yet.</li>
            )}
            {notifications?.data.map((notification) => (
              <li key={notification.id} className="border-b border-[var(--color-border-default)] last:border-0">
                <button
                  type="button"
                  onClick={() => handleSelect(notification)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-bg-app)] ${
                    notification.isRead ? '' : 'bg-[var(--color-info-bg)]'
                  }`}
                >
                  <p className="font-medium text-[var(--color-text-primary)]">{notification.title}</p>
                  {notification.message && (
                    <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">{notification.message}</p>
                  )}
                  <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
