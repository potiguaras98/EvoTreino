import React, { useState, useEffect } from 'react';
import { useWorkout } from '../WorkoutContext';
import { Lock, Mail, User, Dumbbell, Sparkles, ChevronRight, LogIn, AlertCircle } from 'lucide-react';

interface AuthGatewayProps {
  onDismiss: () => void;
}

// Custom Google Branded Icon
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

// Decodes the standard credential JWT returned by Google Sign-In
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT", error);
    return null;
  }
};

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onDismiss }) => {
  const { login, register, loginWithGoogle } = useWorkout();
  
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // States for the Google Account Selector/Simulator
  const [showGoogleSelector, setShowGoogleSelector] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Dynamic Google One Tap and Auth Button Integration
  useEffect(() => {
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    
    if (clientId && (window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            const payload = decodeJwt(response.credential);
            if (payload) {
              const gName = payload.name || payload.given_name || 'Usuário Google';
              const gEmail = payload.email;
              const googleId = payload.sub;
              const photoUrl = payload.picture;
              
              setLoading(true);
              try {
                await loginWithGoogle(gName, gEmail, googleId, photoUrl);
                onDismiss();
              } catch (err: any) {
                setErrorMessage(err.message || 'Erro ao conectar via Google.');
              } finally {
                setLoading(false);
              }
            }
          },
          auto_select: false
        });
        
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-element"),
          { 
            theme: "dark", 
            size: "large", 
            width: "350", 
            text: "signin_with",
            shape: "pill"
          }
        );
      } catch (e) {
        console.error("Google One Tap rendering failed:", e);
      }
    }
  }, [loginWithGoogle, onDismiss]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client input validation
    if (!email || !password || (isRegister && !name)) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const success = await register(name, email, password);
        if (success) {
          onDismiss(); // authenticated successfully
        }
      } else {
        const success = await login(email, password);
        if (success) {
          onDismiss(); // logged in successfully
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  // Triggers the Google authorization process
  const handleGoogleSignInClick = () => {
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    if (clientId) {
      // If a real client id is set, GSI initialize will trigger the standard popup
      try {
        (window as any).google.accounts.id.prompt();
      } catch (e) {
        // Fallback to selector modal
        setShowGoogleSelector(true);
      }
    } else {
      // Otherwise, open our beautiful custom account chooser representing simulated GSI flow
      setShowGoogleSelector(true);
    }
  };

  const handleSimulatedAccountSelect = async (gName: string, gEmail: string, gId: string, photo: string) => {
    setLoading(true);
    setShowGoogleSelector(false);
    try {
      await loginWithGoogle(gName, gEmail, gId, photo);
      onDismiss();
    } catch (err: any) {
      setErrorMessage('Erro ao conectar via seu login do Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-955/95 backdrop-blur-md flex items-center justify-center p-4 z-50 text-left animate-fade-in font-sans animate-duration-300">
      <div className="bg-zinc-900 border border-zinc-805 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow background accent lines */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header App Brand Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500 text-zinc-950 rounded-2xl flex items-center justify-center mx-auto border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          
          <div>
            <h3 className="font-display font-medium text-white text-xl tracking-tight">
              {isRegister ? 'Criar Nova Conta' : 'Acesse Sua Conta'}
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              {isRegister 
                ? 'Salve seus treinos de forma definitiva e acompanhe suas cargas.' 
                : 'Sincronize seu progresso e imagens de evolução física.'}
            </p>
          </div>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium text-center font-sans">
              {errorMessage}
            </div>
          )}

          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 block">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input 
                  type="text"
                  placeholder="Ex: Guilherme"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-medium"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 block">Endereço de E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input 
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-955 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1 border-b border-transparent pb-1">
            <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 block">Sua Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input 
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-955 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 border-none ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span>Processando...</span>
            ) : (
              <>
                <span>{isRegister ? 'Registrar Nova Conta' : 'Acessar Meu Painel'}</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Divider and Google Sign In */}
        <div className="space-y-4 pt-1 font-sans">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono uppercase font-black text-zinc-500">Ou continue com</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            {/* Google GSI Native Placement (if client_id is available) */}
            {(import.meta as any).env.VITE_GOOGLE_CLIENT_ID ? (
              <div id="google-signin-element" className="w-full h-11 flex justify-center overflow-hidden rounded-xl border border-zinc-800" />
            ) : (
              /* Custom Branded Google Sign-In Button style */
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <GoogleIcon />
                <span>Entrar com o Google</span>
              </button>
            )}

            <button
              onClick={onDismiss}
              type="button"
              className="w-full py-2.5 bg-zinc-900/40 hover:bg-zinc-805 border border-zinc-800/60 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
            >
              Treinar como Convidado (Local)
            </button>

            <button
              onClick={() => {
                setErrorMessage(null);
                setIsRegister(!isRegister);
              }}
              type="button"
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-all text-center font-sans font-medium mt-1"
            >
              {isRegister 
                ? 'Já possui uma conta? Faça login aqui' 
                : 'Não tem conta? Cadastre-se em 10 segundos'}
            </button>
          </div>
        </div>
      </div>

      {/* Google Sign-In Real-time Simulator Popup Overlay */}
      {showGoogleSelector && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-55 animate-fade-in font-sans">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full shadow-2xl relative p-6 space-y-6">
            
            {/* Google Brand Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <svg className="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-white text-base">Fazer login com o Google</h4>
                <p className="text-xs text-zinc-400 mt-1">Escolha uma conta para continuar no Evolução Pro</p>
              </div>
            </div>

            {/* List of Accounts */}
            <div className="space-y-2">
              {!showCustomGoogleInput ? (
                <>
                  {/* Account choice 1: Dynamic User from metadata email if present, or generic */}
                  <button
                    onClick={() => handleSimulatedAccountSelect(
                      "Guilherme Brito", 
                      "guilhermebritocon@gmail.com", 
                      "g_109348572019348",
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                    )}
                    className="w-full flex items-center justify-between p-3.5 bg-zinc-950/50 hover:bg-zinc-850 border border-zinc-800 rounded-2xl transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300">
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" 
                          alt="G" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">Guilherme Brito</p>
                        <p className="text-[10px] text-zinc-400">guilhermebritocon@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold leading-none uppercase shrink-0">Sua conta</span>
                  </button>

                  {/* Account choice 2: General Google User */}
                  <button
                    onClick={() => handleSimulatedAccountSelect(
                      "Carlos Silva", 
                      "carlossilva.treino@gmail.com", 
                      "g_1028347201029348",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                    )}
                    className="w-full flex items-center justify-between p-3.5 bg-zinc-950/50 hover:bg-zinc-850 border border-zinc-800 rounded-2xl transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300">
                        <img 
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" 
                          alt="C" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">Carlos Silva</p>
                        <p className="text-[10px] text-zinc-400">carlossilva.treino@gmail.com</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="w-full py-2.5 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 text-zinc-350 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
                  >
                    Usar outra conta Google
                  </button>
                </>
              ) : (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono font-black text-zinc-500 block">Nome do Usuário</label>
                    <input 
                      type="text"
                      placeholder="Ex: Guilherme Brito"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono font-black text-zinc-500 block">E-mail do Google</label>
                    <input 
                      type="email"
                      placeholder="nome.conta@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowCustomGoogleInput(false)}
                      type="button"
                      className="flex-1 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-zinc-850"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => {
                        if (!customGoogleEmail || !customGoogleName) return;
                        handleSimulatedAccountSelect(
                          customGoogleName, 
                          customGoogleEmail, 
                          'custom_g_' + Date.now().toString(), 
                          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
                        );
                      }}
                      type="button"
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-black uppercase cursor-pointer"
                    >
                      Conectar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Note & Settings Guide */}
            <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-850 space-y-1.5 text-left">
              <p className="text-[9px] font-bold text-zinc-350 uppercase tracking-wide flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-400 text-emerald-500 shrink-0" />
                Configurar Produção
              </p>
              <p className="text-[9px] text-zinc-400 leading-normal">
                Esta simulação preenche instantaneamente o fluxo callback do Google Identity Services. Para ativar o login do Google real, configure o <code className="bg-zinc-850 px-1 py-0.5 rounded text-zinc-300 font-mono text-[8px]">VITE_GOOGLE_CLIENT_ID</code> nas credenciais do seu projeto.
              </p>
            </div>

            <button
              onClick={() => setShowGoogleSelector(false)}
              className="absolute top-2.5 right-3 text-zinc-500 hover:text-white p-2 text-xl font-bold cursor-pointer bg-transparent border-none outline-none leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
