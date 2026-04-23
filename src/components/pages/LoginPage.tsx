import React, { useState, useEffect } from 'react';
import { Bot, MessageCircle, Sparkles, Users, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getWeComAuthUrl, parseAuthCallback, clearAuthCallbackParams, isWeComSSOEnabled } from '@/services/wecom';

export function LoginPage() {
  const { dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理企业微信回调
  useEffect(() => {
    const handleWeComCallback = async () => {
      const authResult = parseAuthCallback();
      if (authResult && authResult.state === 'wecom_sso') {
        setIsLoading(true);
        setError(null);

        try {
          // 调用后端接口验证 code 并获取用户信息
          const response = await fetch(`/api/auth/wecom?code=${authResult.code}`);
          const data = await response.json();

          if (data.success && data.user) {
            // 更新全局状态
            dispatch({
              type: 'UPDATE_USER_PROFILE',
              payload: {
                id: data.user.userid,
                name: data.user.name,
                department: data.user.department?.[0] || '未知部门',
                title: data.user.position || '员工',
              },
            });

            // 清除 URL 参数
            clearAuthCallbackParams();

            // 跳转到首页
            dispatch({ type: 'SET_SECTION', payload: 'home' });
          } else {
            setError(data.message || '登录失败，请重试');
          }
        } catch (err) {
          console.error('WeCom login error:', err);
          setError('登录失败，请重试');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleWeComCallback();
  }, [dispatch]);

  // 企业微信登录
  const handleWeComLogin = () => {
    // 生产环境使用 Vercel 部署地址
    const redirectUri = 'https://t-tau-six.vercel.app/login';
    const authUrl = getWeComAuthUrl(redirectUri);
    window.location.href = authUrl;
  };

  // 演示模式登录（不使用企业微信）
  const handleDemoLogin = () => {
    // 保存演示模式标识
    localStorage.setItem('demo_mode', 'true');
    dispatch({ type: 'SET_SECTION', payload: 'home' });
  };

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: '所有人问所有人',
      description: '低门槛求助，高质量解答',
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'AI Hub',
      description: '项目展示，灵感碰撞',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: '见闻洞察',
      description: '行业资讯，精选推荐',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '不止是 AI',
      description: '职场分享，发现好物',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Spark Hub</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              让 AI 赋能<br />每一位员工
            </h1>
            <p className="text-indigo-100 text-lg mb-12">
              企业内部的 AI 知识共享中心、灵感集散地与资产沉淀库
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-indigo-200 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t border-white/20">
            <p className="text-indigo-200 text-sm">
              © 2024 Spark Hub · 企业内部 AI 社区
            </p>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Spark Hub</span>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-slate-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">欢迎回来</h2>
                <p className="text-slate-500">使用企业微信账号快速登录</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                  <p className="text-slate-500">正在验证身份...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 企业微信登录按钮 */}
                  {isWeComSSOEnabled() && (
                    <button
                      onClick={handleWeComLogin}
                      className="w-full flex items-center justify-center gap-3 bg-[#07C160] hover:bg-[#06AD56] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-200/50 hover:-translate-y-0.5"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.5 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 2C6.48 2 2 6.03 2 11c0 2.76 1.36 5.22 3.5 6.83V22l4.07-2.24c.85.24 1.75.37 2.68.37 1.66 0 3.2-.43 4.56-1.16.17.03.35.05.53.05.18 0 .36-.02.53-.05A7.96 7.96 0 0 0 12 19c5.52 0 10-4.03 10-9s-4.48-9-10-9z"/>
                      </svg>
                      <span>使用企业微信登录</span>
                    </button>
                  )}

                  {/* 分隔符 */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-slate-400 text-sm">或</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* 演示模式入口 */}
                  <button
                    onClick={handleDemoLogin}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-4 px-6 rounded-xl transition-all duration-200"
                  >
                    <Shield className="w-5 h-5" />
                    <span>演示模式（无需登录）</span>
                  </button>
                </div>
              )}

              <p className="text-center text-slate-400 text-xs mt-6">
                登录即表示同意我们的服务条款和隐私政策
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">500+</div>
                <div className="text-slate-500 text-sm">活跃用户</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">1,200+</div>
                <div className="text-slate-500 text-sm">问答内容</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">98%</div>
                <div className="text-slate-500 text-sm">满意度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
