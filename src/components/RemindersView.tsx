import React, { useState } from 'react';
import { useWorkout } from '../WorkoutContext';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Info
} from 'lucide-react';

const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const RemindersView: React.FC = () => {
  const { 
    reminders, 
    updateReminder, 
    remindersEnabled, 
    setRemindersEnabled, 
    clearAllData, 
    generateSampleHistory 
  } = useWorkout();

  const [testSuccess, setTestSuccess] = useState(false);
  const [showInAppReminderToast, setShowInAppReminderToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Request browser permissions
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      triggerInAppToast('Seu navegador não oferece suporte para notificações nativas.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setRemindersEnabled(true);
        triggerInAppToast('Notificações nativas autorizadas com sucesso!');
        sendLocalMessage('Evolução de Treinos', 'Você ativou os lembretes de sobrecarga progressiva com sucesso!');
      } else {
        setRemindersEnabled(false);
        triggerInAppToast('Permissão de notificações recusada pelo navegador.');
      }
    } catch (e) {
      // Often blocked inside iframe sandboxes
      setRemindersEnabled(true); // fall back to in-app simulate mode
      triggerInAppToast('Permissões de iframe restritas. Canal de alertas no app de treino ativo!');
    }
  };

  const handleToggleReminder = (id: string, currentlyActive: boolean) => {
    updateReminder(id, { active: !currentlyActive });
  };

  const handleTimeChange = (id: string, time: string) => {
    updateReminder(id, { time });
  };

  const triggerInAppToast = (msg: string) => {
    setToastMessage(msg);
    setShowInAppReminderToast(true);
    setTimeout(() => {
      setShowInAppReminderToast(false);
    }, 4500);
  };

  const sendLocalMessage = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3043/3043232.png'
        });
      } catch (e) {
        // Fallback for some browsers inside Sandboxes
        console.warn('Could not spawn native notification: ', e);
      }
    }
  };

  const handleTestNotification = () => {
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 2000);

    const motivationLines = [
      "Está na hora do Treino A! Foco no supino reto, busque a progressão de carga!",
      "Hora do Treino B! Prepare-se para agachar pesado. Lembre-se de poupar a corrida após o treino!",
      "Hora de esmagar as costas no Treino C. A sobrecarga no trapézio de hoje dita o crescimento de amanhã!",
      "Braços no fogo com o Treino D hoje! Supere a carga recente da rosca direta!"
    ];

    const randomAdvice = motivationLines[Math.floor(Math.random() * motivationLines.length)];
    
    // Attempt native
    if (remindersEnabled && 'Notification' in window && Notification.permission === 'granted') {
      sendLocalMessage('Lembrete de Treino 🏋️', randomAdvice);
    }
    
    // Always trigger visual in-app overlay toast because we are in iframe
    triggerInAppToast(`🔔 Lembrete de Treino: ${randomAdvice}`);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="space-y-2">
        <h2 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          Lembretes e Frequência Semanal
        </h2>
        <p className="text-sm font-medium text-zinc-400 max-w-xl leading-relaxed font-sans">
          Programe horários de notificações automáticas para manter a consistência e manter sua rota rumo à sobrecarga de pesos.
        </p>
      </div>

      {/* Notification Active Switch Callout */}
      <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-white text-base">Notificações por Push</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium max-w-md">
              Os alertas integrados lembrarão você no início das sessões, garantindo que você registre as cargas semanais certas.
            </p>
          </div>

          <button
            onClick={requestNotificationPermission}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 active:scale-95 cursor-pointer ${
              remindersEnabled
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-emerald-400'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 hover:shadow-lg'
            }`}
          >
            {remindersEnabled ? '✓ Ativas no App' : 'Ativar Alertas'}
          </button>
        </div>

        {/* If enabled, trigger tester */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-bold tracking-wide flex items-center gap-1.5 leading-none">
            <Info className="w-3.5 h-3.5 text-zinc-650" />
            Canal interno de alertas ativo em tempo de execução.
          </span>

          <button
            onClick={handleTestNotification}
            className={`px-4 py-2.5 text-[10px] font-mono font-bold uppercase rounded-xl border transition-colors cursor-pointer ${
              testSuccess 
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-450' 
                : 'bg-zinc-800 hover:bg-zinc-750 border-zinc-750 text-zinc-200'
            }`}
          >
            {testSuccess ? 'Disparando...' : 'Testar Lembrete'}
          </button>
        </div>
      </div>

      {/* Weekday alarm schedules list */}
      <div className="space-y-4">
        <h3 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase">Alertas Diários</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {reminders.map((rem) => {
            return (
              <div 
                key={rem.id}
                className={`p-5 rounded-3xl border flex justify-between items-center transition-all ${
                  rem.active 
                    ? 'bg-zinc-900 border-zinc-850' 
                    : 'bg-zinc-950/20 border-zinc-900/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    rem.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-zinc-750 text-zinc-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-zinc-200 text-sm">{WEEKDAYS[rem.dayOfWeek]}</h4>
                    
                    {/* Time Input picker */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <span>Horário:</span>
                      <input 
                        type="time" 
                        value={rem.time}
                        onChange={(e) => handleTimeChange(rem.id, e.target.value)}
                        disabled={!rem.active}
                        className="bg-zinc-950 text-zinc-300 font-mono text-xxs px-1.8 py-0.5 rounded-lg border border-zinc-850 focus:outline-none disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>

                {/* Alarm Enable Check Slider */}
                <button
                  onClick={() => handleToggleReminder(rem.id, rem.active)}
                  className={`w-11 h-6 px-1 rounded-full flex items-center transition-all cursor-pointer ${
                    rem.active ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-zinc-950 shadow-md"></div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Danger Utilities Option */}
      <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-4">
        <div className="space-y-1">
          <h3 className="font-display font-black text-red-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Zona de Manutenção
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-sans font-medium pr-8">
            Limpar os dados apaga permanentemente todo o histórico real e simulado, redefinindo as fichas de exercícios para os valores originais de fábrica.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => {
              if (confirm('Atenção: Deseja apagar permanentemente todas as suas sessões e reiniciar a aplicação?')) {
                clearAllData();
                triggerInAppToast('Banco de dados redefinido com sucesso.');
              }
            }}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase rounded-xl border border-red-500/10 transition-colors cursor-pointer"
          >
            Limpar Banco De Dados
          </button>

          <button
            onClick={() => {
              generateSampleHistory();
              triggerInAppToast('Histórico simulado de 4 semanas gerado! Gráficos prontos para análise.');
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-350 text-[10px] font-mono font-bold uppercase rounded-xl border border-zinc-750 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500" /> Sobregravar Dados De Exemplo
          </button>
        </div>
      </div>

      {/* Floating In-App Toast Alerte Notification */}
      {showInAppReminderToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-emerald-500/30 px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 max-w-sm text-xs text-white animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <p className="leading-relaxed font-sans font-medium text-zinc-300">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};
