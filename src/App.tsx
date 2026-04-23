import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header, Sidebar, RightSidebar, MobileNav, AIAssistant } from '@/components/layout';
import { HomePage, AskPage, AIHubPage, InsightsPage, MarketPage, ProfilePage, AdminPage, PointsPage } from '@/components/pages';
import { AICompassModal } from '@/components/ui/AICompass';
import { LoginPage } from '@/components/pages/LoginPage';

function MainContent() {
  const { state, dispatch } = useApp();
  const [showAICompass, setShowAICompass] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    // 如果没有用户信息且不是演示模式，显示登录页
    const isLoggedIn = state.user && state.user.id !== 'demo';
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';

    // 未登录且不是演示模式时，显示登录页
    if (!isLoggedIn && !isDemoMode) {
      dispatch({ type: 'SET_SECTION', payload: 'login' });
    }
    setIsInitialized(true);
  }, [state.user, state.currentSection, dispatch]);

  // 渲染登录页
  if (state.currentSection === 'login') {
    return <LoginPage />;
  }

  // 初始化中显示 loading
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const renderPage = () => {
    switch (state.currentSection) {
      case 'home':
        return <HomePage />;
      case 'ask':
        return <AskPage />;
      case 'aihub':
        return <AIHubPage />;
      case 'insights':
        return <InsightsPage />;
      case 'market':
        return <MarketPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPage />;
      case 'points':
        return <PointsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <AIAssistant />

      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex gap-6">
            <Sidebar onOpenAICompass={() => setShowAICompass(true)} />
            <main className="flex-1 min-w-0">
              {renderPage()}
            </main>
            <RightSidebar />
          </div>
        </div>
      </div>

      <MobileNav />

      {/* AI Compass Modal - 渲染在根层级，避免被遮挡 */}
      <AICompassModal
        isOpen={showAICompass}
        onClose={() => setShowAICompass(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
