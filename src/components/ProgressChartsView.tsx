import React, { useState } from 'react';
import { useWorkout } from '../WorkoutContext';
import { WORKOUT_PRESETS } from '../presets';
import { 
  TrendingUp, 
  Award, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';

export const ProgressChartsView: React.FC = () => {
  const { history, getExerciseHistory } = useWorkout();

  // Pick first exercise of Treino A as default
  const defaultExerciseId = 'supino_reto_barra';
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(defaultExerciseId);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group all exercises for select dropdown
  const allExercises = WORKOUT_PRESETS.flatMap(preset => 
    preset.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      presetTitle: preset.title,
      muscleGroup: ex.muscleGroup
    }))
  );

  const selectedExercise = allExercises.find(e => e.id === selectedExerciseId);

  // Load progression history
  const exerciseData = getExerciseHistory(selectedExerciseId);

  // Calculate weekly stats
  // Group history by calendar week (going back 4 weeks)
  const getWeeklyStats = () => {
    const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    const setsPerWeek = [0, 0, 0, 0];
    const now = new Date();

    history.forEach(session => {
      const sessionDate = new Date(session.date);
      const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 4) {
        // Count completed sets
        const completedSetsCount = session.exercises.reduce((acc, curr) => 
          acc + curr.sets.filter(s => s.completed).length, 0
        );
        setsPerWeek[3 - weekIndex] += completedSetsCount; // invert so leftmost is oldest
      }
    });

    return { weeks, setsPerWeek };
  };

  const weeklyStats = getWeeklyStats();

  // Find overall maximum weight ever lifted
  const maxWeightEverList = exerciseData.map(d => d.maxWeight);
  const personalRecord = maxWeightEverList.length > 0 ? Math.max(...maxWeightEverList) : 0;

  // Calculate 1RM (1-Rep Max Estimate using last logged workout)
  const calculateEstimated1RM = () => {
    if (history.length === 0) return 0;
    
    // Find latest completed set for selected exercise
    let latestWeight = 0;
    let latestReps = 0;

    for (const session of history) {
      const exLog = session.exercises.find(e => e.exerciseId === selectedExerciseId);
      if (exLog) {
        const completed = exLog.sets.filter(s => s.completed);
        if (completed.length > 0) {
          // Grab first completed set as sample
          latestWeight = completed[0].weight;
          latestReps = completed[0].reps;
          break;
        }
      }
    }

    if (latestWeight === 0 || latestReps === 0) return 0;
    
    // Brzycki Formula
    const oneRepMax = latestWeight / (1.0278 - 0.0278 * latestReps);
    return Math.round(oneRepMax * 10) / 10;
  };

  const estimated1RM = calculateEstimated1RM();

  // Calculate percentage progression
  const calculateLoadProgression = () => {
    if (exerciseData.length < 2) return null;
    const firstVal = exerciseData[0].maxWeight;
    const latestVal = exerciseData[exerciseData.length - 1].maxWeight;
    if (firstVal === 0) return null;
    const diff = latestVal - firstVal;
    const pct = (diff / firstVal) * 100;
    return {
      diff,
      pct: Math.round(pct * 10) / 10,
      increased: diff >= 0
    };
  };

  const progressionData = calculateLoadProgression();

  // SVG Line Chart Constants & Calculations
  const renderLineChart = () => {
    if (exerciseData.length === 0) return null;

    const width = 500;
    const height = 220;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const weights = exerciseData.map(d => d.maxWeight);
    const maxVal = Math.max(...weights) * 1.15; // Give 15% head clearance
    const minVal = Math.max(0, Math.min(...weights) * 0.85); // 15% floor clearance or 0

    const rangeY = maxVal - minVal || 10;

    // Get coordinates
    const points = exerciseData.map((d, i) => {
      const x = paddingLeft + (i / Math.max(1, exerciseData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((d.maxWeight - minVal) / rangeY) * chartHeight;
      return { x, y, data: d };
    });

    // Create Path Strings
    let linePath = '';
    let areaPath = '';

    if (points.length > 0) {
      // Line path
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

      // Closed area path
      areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }

    // Grid lines count
    const gridCount = 4;
    const gridYLines = Array.from({ length: gridCount }).map((_, i) => {
      const val = minVal + (i / (gridCount - 1)) * rangeY;
      const y = paddingTop + chartHeight - (i / (gridCount - 1)) * chartHeight;
      return { y, val: Math.round(val) };
    });

    return (
      <div className="relative">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00"/>
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridYLines.map((line, i) => (
            <g key={i} className="opacity-40">
              <line 
                x1={paddingLeft} 
                y1={line.y} 
                x2={width - paddingRight} 
                y2={line.y} 
                stroke="#27272a" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={line.y + 4} 
                fill="#71717a" 
                fontSize="9" 
                fontFamily="monospace"
                className="text-right"
                textAnchor="end"
              >
                {line.val}kg
              </text>
            </g>
          ))}

          {/* X axis lines */}
          {points.map((p, i) => (
            <line 
              key={i}
              x1={p.x}
              y1={paddingTop}
              x2={p.x}
              y2={paddingTop + chartHeight}
              stroke="#27272a"
              strokeWidth="0.5"
              className="opacity-20"
            />
          ))}

          {/* Shaded Area */}
          {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

          {/* Stroke Line */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2.5" 
              strokeLinejoin="round" 
              strokeLinecap="round" 
            />
          )}

          {/* Coordinate Dots */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;

            return (
              <g key={i} className="cursor-pointer">
                {/* Larger hover circle tracker */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="12" 
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isHovered ? '6' : '3.5'} 
                  fill={isHovered ? '#10b981' : '#09090b'} 
                  stroke="#10b981" 
                  strokeWidth={isHovered ? '2' : '1.5'}
                  className="transition-all duration-150"
                />

                {/* Date Label on Axis */}
                <text 
                  x={p.x} 
                  y={paddingTop + chartHeight + 14} 
                  fill="#71717a" 
                  fontSize="8.5" 
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {p.data.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div 
            className="absolute z-20 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl text-left text-xxs space-y-1 shadow-xl pointer-events-none"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${Math.max(10, ((points[hoveredIndex].y - 30) / height) * 100)}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <p className="font-bold text-zinc-400 font-mono">Treino em {points[hoveredIndex].data.date}</p>
            <p className="text-white">Carga Máxima: <strong className="text-emerald-450 text-xs font-mono">{points[hoveredIndex].data.maxWeight} kg</strong></p>
            <p className="text-zinc-500 font-mono">Volume Calculado: {points[hoveredIndex].data.volume} kg</p>
          </div>
        )}
      </div>
    );
  };

  // SVG Bar Chart Weekly sets count
  const renderWeeklyBarChart = () => {
    const width = 300;
    const height = 150;
    const paddingTop = 20;
    const paddingBottom = 20;
    const paddingLeft = 35;
    const paddingRight = 10;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const { weeks, setsPerWeek } = weeklyStats;
    const maxVal = Math.max(...setsPerWeek) * 1.2 || 10;

    const barWidth = 24;
    const colSpacing = chartWidth / weeks.length;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight - ratio * chartHeight;
          const val = Math.round(ratio * maxVal);

          return (
            <g key={idx} className="opacity-40">
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="#27272a" 
                strokeWidth="0.5" 
                strokeDasharray="4 4"
              />
              <text 
                x={paddingLeft - 6} 
                y={y + 3} 
                fill="#71717a" 
                fontSize="8" 
                fontFamily="monospace"
                textAnchor="end"
              >
                {val}s
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {setsPerWeek.map((sets, i) => {
          const barHeight = (sets / maxVal) * chartHeight;
          const x = paddingLeft + i * colSpacing + (colSpacing - barWidth) / 2;
          const y = paddingTop + chartHeight - barHeight;

          return (
            <g key={i} className="group">
              {/* Actual bar rect */}
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={Math.max(2, barHeight)} 
                rx="4"
                fill="url(#barGrad)"
                className="hover:brightness-110 cursor-pointer transition-all duration-300"
              />

              {/* Weekly text values floating above bar */}
              {sets > 0 && (
                <text 
                  x={x + barWidth / 2} 
                  y={y - 5} 
                  fill="#10b981" 
                  fontSize="8" 
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {sets}
                </text>
              )}

              {/* Axis text label */}
              <text 
                x={x + barWidth / 2} 
                y={paddingTop + chartHeight + 12} 
                fill="#71717a" 
                fontSize="7.5" 
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {weeks[i]}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xs font-display font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Sobrecarga Progressiva e Métricas
        </h2>
        <p className="text-sm font-medium text-zinc-400 max-w-2xl leading-relaxed font-sans">
          Análise gráfica detalhada do controle de cargas por exercício e frequência semanal cumulativa efetuada.
        </p>
      </div>

      {exerciseData.length === 0 ? (
        /* Alert prompt if user hasn't generated any logs yet */
        <div className="p-8 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-4 text-center max-w-xl mx-auto">
          <div className="inline-flex p-3 bg-zinc-800 text-amber-500 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="font-display font-bold text-white text-base uppercase">Visualização Pronta Para Uso</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              O gráfico de evolução surgirá dinamicamente assim que você salvar pelo menos 1 treino. Se quiser testar os gráficos agora, vá na <strong>Dashboard</strong> e clique em <strong>"Gerar Histórico de Exemplo"</strong> para gerar dados falsos realistas instantaneamente!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Column (Left) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-4 shadow-lg shadow-black/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-white text-base">Evolução Linear de Força</h3>
                  <p className="text-xxs text-emerald-400 uppercase tracking-widest font-mono font-bold">Carga Máxima Concluída (kg)</p>
                </div>

                {/* Dropdown to select exercise */}
                <select 
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="bg-zinc-950 text-zinc-200 text-xs font-semibold py-2 px-3 rounded-xl border border-zinc-800 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {WORKOUT_PRESETS.map((preset) => (
                    <optgroup key={preset.id} label={`${preset.title}: ${preset.subtitle}`} className="bg-zinc-950">
                      {preset.exercises.map((ex) => (
                        <option key={ex.id} value={ex.id} className="text-zinc-200">
                          {ex.name} ({ex.muscleGroup})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Actual Line Chart */}
              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-2xl">
                {renderLineChart()}
              </div>

              {/* Selected Exercise Summary Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-850">
                
                {/* Metric 1: Max Weight Lifted */}
                <div className="text-center p-3 rounded-xl bg-zinc-900 border border-zinc-850">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Recorde (PR)</span>
                  <p className="text-lg font-mono font-bold text-emerald-400 mt-1">{personalRecord}kg</p>
                </div>

                {/* Metric 2: Estimated 1RM */}
                <div className="text-center p-3 rounded-xl bg-zinc-900 border border-zinc-850">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">1RM Estimado</span>
                  <p className="text-lg font-mono font-bold text-indigo-400 mt-1">{estimated1RM}kg</p>
                </div>

                {/* Metric 3: Delta load progression percentage */}
                <div className="text-center p-3 rounded-xl bg-zinc-900 border border-zinc-850 col-span-2">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Evolução de Carga</span>
                  {progressionData ? (
                    <p className={`text-sm font-mono font-bold mt-1.5 ${progressionData.increased ? 'text-emerald-450 text-emerald-400' : 'text-red-400'}`}>
                      {progressionData.increased ? '+' : ''}{progressionData.diff}kg ({progressionData.increased ? '+' : ''}{progressionData.pct}%)
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 mt-2 font-medium">Faça outro treino para calcular delta</p>
                  )}
                </div>

              </div>
            </div>
            
            {/* Custom Scientific Note */}
            <div className="bg-emerald-500/5 p-5 rounded-3xl border border-emerald-500/10 flex gap-3 text-xs text-slate-300 leading-relaxed font-sans">
              <Award className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="font-sans font-medium text-zinc-350">
                <strong>Análise Científica de Tensão:</strong> A sobrecarga progressiva vai muito além de levantar mais peso. Você também progride na hipertrofia mantendo a mesma carga porém executando com cadência controlada, completando a fase excêntrica por mais segundos, ou diminuindo o tempo de repouso!
              </div>
            </div>

          </div>

          {/* Weekly Stats Bar Column (Right) */}
          <div className="space-y-5">
            <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-4 shadow-lg">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-white text-base">Volume Semanal</h3>
                <p className="text-xxs text-emerald-400 uppercase tracking-widest font-mono font-bold">Total de séries feitas por semana</p>
              </div>

              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-2xl">
                {renderWeeklyBarChart()}
              </div>

              <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl space-y-3 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Séries Totais Efetuadas:</span>
                  <span className="font-mono font-bold text-zinc-200">
                    {weeklyStats.setsPerWeek.reduce((sum, current) => sum + current, 0)} séries
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs border-t border-zinc-850/80 pt-2.5">
                  <span className="text-zinc-400 font-medium">Frequência de Fichas:</span>
                  <span className="font-mono font-bold text-zinc-200">
                    {history.length} sessões
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-zinc-850/80 pt-2.5">
                  <span className="text-zinc-400 font-medium">Tempo de Contração Total:</span>
                  <span className="font-mono font-bold text-emerald-450 text-emerald-450/90">
                    {Math.round(history.reduce((sum, s) => sum + s.durationSeconds, 0) / 60)} min
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};
