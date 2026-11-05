import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut, ALargeSmall, Wrench, MessageSquarePlus, KeyRound } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../common/useToast.js';
import { getLoggedOutMessage } from '../../utils/messages.js';
import { canUseAdmin, pendingRequests, callNameOf, initialsOf } from '../../utils/chat.js';
import { ROLE_LABELS } from '../../mock/staff.js';
import { COMPANY_CONFIG } from '../../config/market.js';
import { formatPhoneNg } from '../../utils/formatters.js';
import { TEXT_SIZES, getTextSize } from '../../utils/textSize.js';
import { Drawer } from '../common/Drawer.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Badge } from '../common/Badge.jsx';
import { NotificationSettingsDrawer } from '../../features/chat/NotificationSettingsDrawer.jsx';
import { TextSizeDrawer } from '../../features/settings/TextSizeDrawer.jsx';
import { ChangePasswordDrawer } from '../../features/auth/ChangePasswordDrawer.jsx';

export function AccountMenu({ onOpenDemoTools, onOpenFeedback }) {
  const { currentUser, logout, accessRequests } = useChat();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isTextSizeOpen, setIsTextSizeOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const pendingRequestsCount = useMemo(() => {
    return canUseAdmin(currentUser) ? pendingRequests(accessRequests).length : 0;
  }, [currentUser, accessRequests]);

  const currentSizeId = getTextSize();
  const currentSizeObj = TEXT_SIZES.find((s) => s.id === currentSizeId);
  const textSizeLabel = currentSizeObj?.label || 'Standard';

  const callName = callNameOf(currentUser) || 'User';

  const officeObj = (COMPANY_CONFIG.offices || []).find(
    (o) => o.id === (currentUser?.officeId || currentUser?.office)
  );
  const officeLine = currentUser?.seesAllOffices
    ? 'All offices'
    : (officeObj?.label || officeObj?.name || 'Head Quarters');

  const handleOpenNotificationSettings = () => {
    setIsOpen(false);
    setIsNotificationSettingsOpen(true);
  };

  const handleGoToAdmin = () => {
    setIsOpen(false);
    navigate('/admin');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
    showToast(getLoggedOutMessage());
  };

  return (
    <>
      {/* 44px round avatar button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Account menu for ${callName}`}
        title={`Account menu for ${currentUser?.name || 'User'}`}
        className="w-11 h-11 flex items-center justify-center rounded-full hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer shrink-0 transition-opacity"
      >
        <Avatar
          role={currentUser?.role || 'agent'}
          initials={initialsOf(currentUser?.name)}
          name={currentUser?.name}
          size="sm"
        />
      </button>

      {/* Account Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Account"
        panelClassName="h-full max-h-[92dvh] lg:max-h-[80dvh] lg:max-w-md lg:rounded-2xl lg:border lg:self-center"
      >
        <div className="space-y-6">
          {/* Profile block */}
          <div className="p-4 rounded-xl bg-surface-raised border border-line flex items-start gap-3.5">
            <Avatar
              role={currentUser?.role || 'agent'}
              initials={initialsOf(currentUser?.name)}
              name={currentUser?.name}
              size="lg"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-ink leading-tight">
                  {currentUser?.name || 'Unknown Staff'}
                </span>
                {currentUser?.role && (
                  <Badge role={currentUser.role} size="sm">
                    {ROLE_LABELS[currentUser.role] || currentUser.role}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap">
                <span>{officeLine}</span>
                {currentUser?.department && (
                  <>
                    <span>·</span>
                    <span>{currentUser.department}</span>
                  </>
                )}
                {currentUser?.phone && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{formatPhoneNg(currentUser.phone)}</span>
                  </>
                )}
              </div>
              {currentUser?.title && (
                <div className="text-xs text-ink-soft pt-0.5">
                  {currentUser.title}
                </div>
              )}
            </div>
          </div>

          {/* Action rows (44px, icon at left, hairline separated) */}
          <div className="divide-y divide-line border border-line rounded-xl overflow-hidden bg-surface">
            {/* Notification settings */}
            <button
              type="button"
              onClick={handleOpenNotificationSettings}
              className="w-full min-h-[44px] px-3.5 py-3 flex items-center gap-3 text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
            >
              <Bell className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Notification settings</span>
            </button>

            {/* Text size */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsTextSizeOpen(true);
              }}
              className="w-full min-h-[44px] px-3.5 py-3 flex items-center justify-between text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <ALargeSmall className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                <span>Text size</span>
              </div>
              <span className="text-xs text-ink-muted">{textSizeLabel}</span>
            </button>

            {/* Change password */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsChangePasswordOpen(true);
              }}
              className="w-full min-h-[44px] px-3.5 py-3 flex items-center gap-3 text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
            >
              <KeyRound className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Change password</span>
            </button>

            {/* Admin (Admins only) */}
            {canUseAdmin(currentUser) && (
              <button
                type="button"
                onClick={handleGoToAdmin}
                className="w-full min-h-[44px] px-3.5 py-3 flex items-center justify-between text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                  <span>Admin</span>
                </div>
                {pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-status-danger-bg border border-status-danger-line text-status-danger tabular-nums">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Compact-only rows on narrow screens (<480px) at Large/XL text size */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenDemoTools?.();
              }}
              className="account-menu-compact-only w-full min-h-[44px] px-3.5 py-3 flex items-center gap-3 text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
            >
              <Wrench className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Demo tools</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenFeedback?.();
              }}
              className="account-menu-compact-only w-full min-h-[44px] px-3.5 py-3 flex items-center gap-3 text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
            >
              <MessageSquarePlus className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Give feedback</span>
            </button>

            {/* Log out (neutral text, no red) */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full min-h-[44px] px-3.5 py-3 flex items-center gap-3 text-xs font-medium text-ink hover:bg-surface-raised transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Notification Settings Drawer */}
      <NotificationSettingsDrawer
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
      />

      {/* Text Size Drawer */}
      <TextSizeDrawer
        isOpen={isTextSizeOpen}
        onClose={() => setIsTextSizeOpen(false)}
      />

      {/* Change Password Drawer */}
      <ChangePasswordDrawer
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}

export default AccountMenu;
