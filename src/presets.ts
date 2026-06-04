import { WorkoutPreset } from './types';

export const WORKOUT_PRESETS: WorkoutPreset[] = [
  {
    id: 'A',
    title: 'Treino A',
    subtitle: 'Peito e Ombro',
    recoveryTip: 'Como seu foco é força e volume tradicionais, esse treino evita calistenia e foca em cargas progressivas de supino livre e polias. Atente para a correta estabilização escapular.',
    exercises: [
      {
        id: 'supino_reto_barra',
        name: 'Supino Reto com Barra',
        muscleGroup: 'Peito',
        defaultSets: 4,
        defaultReps: '8 a 10',
        notes: 'Foco no controle da descida (fase excêntrica) e empurre explosivo com as cargas máximas.',
        videoUrl: 'https://www.youtube.com/watch?v=sqOw2Y6u9v8'
      },
      {
        id: 'supino_inclinado_halteres',
        name: 'Supino Inclinado com Halteres',
        muscleGroup: 'Peito',
        defaultSets: 3,
        defaultReps: '10 a 12',
        notes: 'Halteres garantem maior amplitude e trabalho simétrico unilateral.',
        videoUrl: 'https://www.youtube.com/watch?v=Z16CMeunV3I'
      },
      {
        id: 'crossover_polia_media',
        name: 'Crossover na Polia Média',
        muscleGroup: 'Peito',
        defaultSets: 3,
        defaultReps: '12',
        notes: 'Foco no alongamento extremo e contração máxima do músculo no centro do movimento.',
        videoUrl: 'https://www.youtube.com/watch?v=uKAs5v_S4rU'
      },
      {
        id: 'desenvolvimento_halteres',
        name: 'Desenvolvimento com Halteres',
        muscleGroup: 'Ombro',
        defaultSets: 3,
        defaultReps: '8 a 10',
        notes: 'Postura firme, focado no deltoide anterior e força geral das escápulas.',
        videoUrl: 'https://www.youtube.com/watch?v=3K_3uInYg3U'
      },
      {
        id: 'elevacao_lateral_halteres',
        name: 'Elevação Lateral com Halteres',
        muscleGroup: 'Ombro',
        defaultSets: 4,
        defaultReps: '10 a 12',
        notes: 'Suba de forma controlada até a linha dos ombros, mantendo o estresse constante.',
        videoUrl: 'https://www.youtube.com/watch?v=e_8388v7Jto'
      },
      {
        id: 'elevacao_lateral_polia_unilateral',
        name: 'Elevação Lateral na Polia (Unilateral)',
        muscleGroup: 'Ombro',
        defaultSets: 3,
        defaultReps: '12',
        notes: 'Tensão constante em todo o arco de movimento. Excelente finalizador lateral.',
        videoUrl: 'https://www.youtube.com/watch?v=gQIsf86nQk4'
      }
    ]
  },
  {
    id: 'B',
    title: 'Treino B',
    subtitle: 'Perna Completo',
    recoveryTip: 'ATENÇÃO: Evite treinos de corrida e explosão/pista hoje ou amanhã! Garanta que suas pernas tenham recuperação completa para render na corrida.',
    exercises: [
      {
        id: 'agachamento_livre',
        name: 'Agachamento Livre com Barra',
        muscleGroup: 'Quadríceps',
        defaultSets: 4,
        defaultReps: '8 a 10',
        notes: 'Agachamento profundo com postura correta. Aumente a carga a cada série de forma segura.',
        videoUrl: 'https://www.youtube.com/watch?v=R96c7SgD6u0'
      },
      {
        id: 'leg_press_45',
        name: 'Leg Press 45º',
        muscleGroup: 'Quadríceps',
        defaultSets: 4,
        defaultReps: '10',
        notes: 'Boa amplitude de movimento. Mantenha os joelhos alinhados com as pontas dos pés.',
        videoUrl: 'https://www.youtube.com/watch?v=5T5Z4yX0FfI'
      },
      {
        id: 'passada_halteres',
        name: 'Passada / Afundo com Halteres',
        muscleGroup: 'Quadríceps',
        defaultSets: 3,
        defaultReps: '10 a 12 (por perna)',
        notes: 'Passos controlados. Desenvolve ótima estabilização, força do quadríceps e glúteos.',
        videoUrl: 'https://www.youtube.com/watch?v=7X8mNbeU9u0'
      },
      {
        id: 'cadeira_extensora',
        name: 'Cadeira Extensora',
        muscleGroup: 'Quadríceps',
        defaultSets: 3,
        defaultReps: '12 a 15',
        notes: 'Foco em exaustão e falha concêntrica. Segure 1s em pico de contração.',
        videoUrl: 'https://www.youtube.com/watch?v=gbe0D7Xn1Vw'
      },
      {
        id: 'stiff_barra_halteres',
        name: 'Stiff com Barra ou Halteres',
        muscleGroup: 'Posterior de Coxa',
        defaultSets: 4,
        defaultReps: '8 a 10',
        notes: 'Mantenha as costas neutras e sinta o alongamento completo do posterior e glúteos.',
        videoUrl: 'https://www.youtube.com/watch?v=pS_sWk94E38'
      },
      {
        id: 'mesa_flexora',
        name: 'Mesa Flexora',
        muscleGroup: 'Posterior de Coxa',
        defaultSets: 4,
        defaultReps: '10 a 12',
        notes: 'Contraia o posterior vigorosamente, subida explosiva e descida em cadência.',
        videoUrl: 'https://www.youtube.com/watch?v=i389tA97qYI'
      }
    ]
  },
  {
    id: 'C',
    title: 'Treino C',
    subtitle: 'Costas, Post. Ombro, Panturrilha e Abdômen',
    recoveryTip: 'Foco na postura e adução de escápulas nas remadas. As panturrilhas precisam de amplitude completa, enquanto os abdominais exigem cadência.',
    exercises: [
      {
        id: 'puxada_frontal_aberta',
        name: 'Puxada Frontal Aberta (Pulley)',
        muscleGroup: 'Costas',
        defaultSets: 4,
        defaultReps: '8 a 10',
        notes: 'Puxe com os cotovelos direcionados ao solo, ativando as dorsais de fora para dentro.',
        videoUrl: 'https://www.youtube.com/watch?v=uX_F3kR8z_U'
      },
      {
        id: 'remada_curvada_barra',
        name: 'Remada Curvada com Barra',
        muscleGroup: 'Costas',
        defaultSets: 4,
        defaultReps: '8 a 10',
        notes: 'Tronco inclinado estável. Puxe a barra em direção à parte inferior do abdômen.',
        videoUrl: 'https://www.youtube.com/watch?v=scvVCHW7Z-M'
      },
      {
        id: 'remada_baixa_triangulo',
        name: 'Remada Baixa (Triângulo)',
        muscleGroup: 'Costas',
        defaultSets: 3,
        defaultReps: '10',
        notes: 'Abra o peito no final, espremendo as escápulas uma contra a outra.',
        videoUrl: 'https://www.youtube.com/watch?v=8-WbU6M0a1U'
      },
      {
        id: 'remada_unilateral_serrote',
        name: 'Remada Unilateral (Serrote)',
        muscleGroup: 'Costas',
        defaultSets: 3,
        defaultReps: '10 (por lado)',
        notes: 'Foco no alinhamento do quadril e amplitude de puxada livre de rotações de tronco.',
        videoUrl: 'https://www.youtube.com/watch?v=W9uGstGstKA'
      },
      {
        id: 'pulldown_corda',
        name: 'Pulldown com Corda (Braços Esticados)',
        muscleGroup: 'Costas',
        defaultSets: 3,
        defaultReps: '12',
        notes: 'Isolamento máximo do grande dorsal. Ombros para baixo e para trás.',
        videoUrl: 'https://www.youtube.com/watch?v=bL1C7kPbeE4'
      },
      {
        id: 'crucifixo_invertido_maquina',
        name: 'Crucifixo Invertido na Máquina',
        muscleGroup: 'Posterior de Ombro',
        defaultSets: 3,
        defaultReps: '12',
        notes: 'Isolamento do deltoide posterior. Segure levemente na contração traseira.',
        videoUrl: 'https://www.youtube.com/watch?v=KjL9tqX4xQo'
      },
      {
        id: 'face_pull_polia_alta',
        name: 'Face Pull na Polia Alta',
        muscleGroup: 'Posterior de Ombro',
        defaultSets: 3,
        defaultReps: '12',
        notes: 'Puxe a corda em direção aos olhos, abrindo as mãos para trabalhar o rotador e post. ombro.',
        videoUrl: 'https://www.youtube.com/watch?v=xR2zJ9K9qg8'
      },
      {
        id: 'gemeos_sentado',
        name: 'Gêmeos Sentado (Máquina)',
        muscleGroup: 'Panturrilha',
        defaultSets: 4,
        defaultReps: '12 a 15',
        notes: 'Focado no sóleo. Descida lenta, subida completa com pico de contração.',
        videoUrl: 'https://www.youtube.com/watch?v=p1T_eM9R8dE'
      },
      {
        id: 'gemeos_em_pe',
        name: 'Gêmeos em Pé (Máquina ou Leg)',
        muscleGroup: 'Panturrilha',
        defaultSets: 4,
        defaultReps: '15',
        notes: 'Trabalho do gastrocnêmio. Alongar no máximo e subir na ponta dos dedos.',
        videoUrl: 'https://www.youtube.com/watch?v=GJ_2AhXVjrf'
      },
      {
        id: 'abdominal_supra_solo',
        name: 'Abdominal Supra no Solo',
        muscleGroup: 'Abdômen',
        defaultSets: 3,
        defaultReps: '15 a 20',
        notes: 'Arredonde as costas ao subir para aproximar o esterno do púbis. Evite puxar o pescoço.',
        videoUrl: 'https://www.youtube.com/watch?v=vN_n8tT_l9Y'
      },
      {
        id: 'abdominal_infra_elevacao',
        name: 'Abdominal Infra (Elevação de Pernas)',
        muscleGroup: 'Abdômen',
        defaultSets: 3,
        defaultReps: '12 a 15',
        notes: 'Controle a descida das pernas com força do core, não use embalo.',
        videoUrl: 'https://www.youtube.com/watch?v=P_Pq5Ies3hA'
      },
      {
        id: 'prancha_isometrica',
        name: 'Prancha Isométrica',
        muscleGroup: 'Abdômen',
        defaultSets: 3,
        defaultReps: '45 a 60 segundos',
        notes: 'Mantenha todo o corpo alinhado e abdômen contraído ao extremo.',
        videoUrl: 'https://www.youtube.com/watch?v=gI8_6c47Lzo'
      }
    ]
  },
  {
    id: 'D',
    title: 'Treino D',
    subtitle: 'Bíceps, Tríceps e Antebraço',
    recoveryTip: 'Dia premium de braços! Permitirá cargas muito maiores, pois as articulações e sinergistas não estarão cansados de grandes agrupamentos no mesmo dia.',
    exercises: [
      {
        id: 'rosca_direta_barra',
        name: 'Rosca Direta com Barra',
        muscleGroup: 'Bíceps',
        defaultSets: 4,
        defaultReps: '8 a 10',
        notes: 'Pode usar barra reta ou barra W para poupar os punhos.',
        videoUrl: 'https://www.youtube.com/watch?v=8k5NmsY_vK8'
      },
      {
        id: 'rosca_alternada_halteres',
        name: 'Rosca Alternada com Halteres',
        muscleGroup: 'Bíceps',
        defaultSets: 3,
        defaultReps: '10 (por braço)',
        notes: 'Gire o punho para cima (supinação) no meio da subida para melhor contração do bíceps.',
        videoUrl: 'https://www.youtube.com/watch?v=lAea4P8vveI'
      },
      {
        id: 'rosca_scott',
        name: 'Rosca Scott (Máquina ou Banco)',
        muscleGroup: 'Bíceps',
        defaultSets: 3,
        defaultReps: '10 a 12',
        notes: 'Braços bem apoiados. Evite estender 100% o cotovelo no fundo para proteger o tendão.',
        videoUrl: 'https://www.youtube.com/watch?v=Xq4WWhE-wHk'
      },
      {
        id: 'tricepes_polia_barra',
        name: 'Tríceps na Polia com Barra Reta/V',
        muscleGroup: 'Tríceps',
        defaultSets: 4,
        defaultReps: '10',
        notes: 'Mantenha os cotovelos fixos ao lado do corpo em toda a execução.',
        videoUrl: 'https://www.youtube.com/watch?v=fAWhuQ77Pek'
      },
      {
        id: 'tricepes_testa_barra_w',
        name: 'Tríceps Testa com Barra W',
        muscleGroup: 'Tríceps',
        defaultSets: 3,
        defaultReps: '10',
        notes: 'Controle a descida até a testa ou um pouco atrás, estendendo com força.',
        videoUrl: 'https://www.youtube.com/watch?v=eorPZzNqHjg'
      },
      {
        id: 'tricepes_corda',
        name: 'Tríceps Corda na Polia',
        muscleGroup: 'Tríceps',
        defaultSets: 3,
        defaultReps: '12',
        notes: 'Afaste as pontas da corda na parte mais baixa de cada repetição para pico de contração.',
        videoUrl: 'https://www.youtube.com/watch?v=ZscPz408n7Y'
      },
      {
        id: 'rosca_inversa',
        name: 'Rosca Inversa na Polia ou Barra',
        muscleGroup: 'Antebraço',
        defaultSets: 3,
        defaultReps: '12',
        notes: 'Desenvolve excelente pegada e trabalha fortemente o músculo braquiorradial.',
        videoUrl: 'https://www.youtube.com/watch?v=l59B9y_qL2Y'
      },
      {
        id: 'flexao_punho',
        name: 'Flexão de Punho com Barra',
        muscleGroup: 'Antebraço',
        defaultSets: 3,
        defaultReps: '15',
        notes: 'Foco na parte flexora interna do antebraço. Cadência suave.',
        videoUrl: 'https://www.youtube.com/watch?v=a9mH2o3oG2I'
      }
    ]
  }
];
