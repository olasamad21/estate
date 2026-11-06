import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  Download,
  ShieldCheck,
  LogIn,
  MoreVertical,
  Compass,
  Share,
  PlusSquare,
  Bell,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../components/common/useToast.js';
import { Button } from '../../components/common/Button.jsx';
import { BrandMark } from '../../components/common/BrandMark.jsx';
import { getAndroidAppDemoDownloadMessage } from '../../utils/messages.js';

export function GetAppView() {
  const navigate = useNavigate();
  const { currentUserId } = useChat();
  const { showToast } = useToast();
  const isAuthenticated = Boolean(currentUserId);

  // Default tab based on navigator.userAgent read ONCE in initial state
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) return 'Android';
      if (/iphone|ipad|ipod/i.test(ua)) return 'iPhone';
    }
    return 'Laptop';
  });

  // beforeinstallprompt listener with cleanup
  const [installPromptEvent, setInstallPromptEvent] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    try {
      await installPromptEvent.prompt();
    } catch {
      // ignore
    }
    setInstallPromptEvent(null);
  };

  const handleBack = () => {
    if (isAuthenticated) {
      navigate('/channels');
    } else {
      navigate('/login');
    }
  };

  const handleAndroidDownload = () => {
    showToast(getAndroidAppDemoDownloadMessage());
  };

  return (
    <div className="min-h-[100dvh] w-full bg-canvas flex flex-col items-center justify-center p-4 sm:p-6 text-ink">
      <div className="w-full max-w-md bg-surface border border-line rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] -ml-2 px-2 flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>{isAuthenticated ? 'Back to channels' : 'Back to sign in'}</span>
          </button>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BrandMark className="w-6 h-6 text-brand" />
            <h1 className="text-lg font-bold text-ink tracking-tight">Get the app</h1>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Install Da Ace Cribs Staff Chat for faster access and notifications.
          </p>
        </div>

        {/* Install app primary button when beforeinstallprompt fired */}
        {installPromptEvent && (
          <div className="standalone-hide pt-1">
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleInstallClick}
              className="min-h-[44px] justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Install app</span>
            </Button>
          </div>
        )}

        {/* Three tabs: Android, iPhone, Laptop (min 44px touch target) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-raised border border-line rounded-xl">
          {[
            { id: 'Android', label: 'Android', icon: Smartphone },
            { id: 'iPhone', label: 'iPhone', icon: Smartphone },
            { id: 'Laptop', label: 'Laptop', icon: Laptop },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content (keyed so each tab view resets) */}
        <div key={activeTab} className="space-y-4 pt-1">
          {activeTab === 'Android' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                      <p className="text-xs font-semibold text-ink">Download the Android app file.</p>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleAndroidDownload}
                      className="min-h-[44px] justify-center text-xs w-full sm:w-auto"
                    >
                      Download Android app
                    </Button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      If Android asks, allow installs from this source.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <LogIn className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      Open the app and sign in.
                    </p>
                  </div>
                </div>
              </div>

              {/* Second block: Chrome browser option */}
              <div className="p-3.5 rounded-xl border border-line bg-surface flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-raised border border-line flex items-center justify-center text-brand shrink-0">
                  <MoreVertical className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink">Browser install</p>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Or use Chrome: open the menu, then tap Install app.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'iPhone' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Compass className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      Open the website in Safari.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Share className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      Tap the Share button.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <PlusSquare className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      Tap Add to Home Screen, then Add.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Smartphone className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      Open the app from your Home Screen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="p-3.5 rounded-xl border border-line bg-surface flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-raised border border-line flex items-center justify-center text-brand shrink-0">
                  <Bell className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink">Important note</p>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Notifications work only when you open the app from the Home Screen.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Laptop' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Laptop className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      Open the website in Chrome or Edge.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Download className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      Click the install icon in the address bar, or open the menu and choose Install.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised border border-line">
                  <div className="w-6 h-6 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Bell className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink leading-relaxed">
                      Allow notifications when asked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom helper */}
        <div className="border-t border-line pt-3 text-center">
          <p className="text-xs text-ink-muted">
            Da Ace Cribs · Ace Realm Integrated Services
          </p>
        </div>
      </div>
    </div>
  );
}

export default GetAppView;
