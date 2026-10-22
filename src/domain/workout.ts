import { EXERCISES } from '../data/exercises';
import {
  ExerciseItem,
  GoalType,
  PlannedSessionExercise,
  WeeklyWorkoutSchedule,
  WorkoutSessionPlan,
  WorkoutSetLog,
} from '../types/models';

const DAY_LABELS = [
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
  'Chủ Nhật',
];

function getExerciseById(id: string): ExerciseItem {
  return EXERCISES.find((e) => e.id === id) ?? EXERCISES[0];
}

function createPlannedExercise(
  exerciseId: string,
  goal: GoalType,
  index: number,
  customSets?: number,
  customReps?: string,
  preserveLogs?: WorkoutSetLog[]
): PlannedSessionExercise {
  const item = getExerciseById(exerciseId);
  const sets = customSets ?? (goal === 'weight_gain' && item.phase === 'secondary_isolation' ? 3 : item.defaultSets);
  const targetReps = customReps ?? item.repRangeByGoal[goal];
  const restSeconds = item.restSecondsByGoal[goal];

  const setLogs: WorkoutSetLog[] = Array.from({ length: sets }, (_, idx) => {
    const existing = preserveLogs?.[idx];
    return existing
      ? { ...existing, setNumber: idx + 1 }
      : {
          setNumber: idx + 1,
          weightKg: item.equipment === 'bodyweight' ? 0 : 20,
          repsDone: parseInt(targetReps, 10) || 10,
          completed: false,
        };
  });

  return {
    instanceId: `${exerciseId}_${index}`,
    exerciseId: item.id,
    nameVi: item.nameVi,
    nameEn: item.nameEn,
    muscleGroup: item.muscleGroup,
    phase: item.phase,
    equipment: item.equipment,
    sets,
    targetReps,
    restSeconds,
    cueVi: item.cueVi,
    setLogs,
  };
}

interface SessionBlueprint {
  title: string;
  splitName: string;
  estimatedMinutes: number;
  exerciseIds: string[];
}

function getGoalBlueprints(goal: GoalType, daysPerWeek: number): {
  splitSummaryVi: string;
  scienceRationaleVi: string;
  activeDays: number[];
  sessions: SessionBlueprint[];
} {
  if (goal === 'fat_loss') {
    const isFourDays = daysPerWeek >= 4;
    return {
      splitSummaryVi: isFourDays
        ? 'Full Body & Upper/Lower Đốt Mỡ Giữ Cơ (4 buổi/tuần)'
        : 'Full Body Toàn Thân Tiêu Hao Năng Lượng Cao (3 buổi/tuần)',
      scienceRationaleVi:
        'Khi ăn thâm hụt calo để giảm mỡ, khả năng phục hồi giảm xuống. Tập toàn thân (Full Body) với các bài đa khớp lớn kết hợp 15–20 phút Cardio Zone 2 cuối buổi giúp đốt tối đa calo mà vẫn phát tín hiệu giữ nguyên khối lượng cơ bắp.',
      activeDays: isFourDays ? [0, 1, 3, 4] : [0, 2, 4],
      sessions: [
        {
          title: 'Toàn thân A — Trọng tâm Đùi trước, Ngực & Xô',
          splitName: 'Full Body Fat Loss',
          estimatedMinutes: 55,
          exerciseIds: [
            'ex_warmup_full_pulse',
            'ex_legs_leg_press',
            'ex_chest_machine_press',
            'ex_back_lat_pulldown',
            'ex_shoulders_lateral_raise',
            'ex_finisher_fatloss_zone2',
          ],
        },
        {
          title: 'Toàn thân B — Trọng tâm Chuỗi sau, Vai & Tay',
          splitName: 'Full Body Fat Loss',
          estimatedMinutes: 55,
          exerciseIds: [
            'ex_warmup_full_pulse',
            'ex_legs_barbell_squat',
            'ex_shoulders_machine_press',
            'ex_back_db_row',
            'ex_hamstrings_leg_curl_machine',
            'ex_finisher_fatloss_zone2',
          ],
        },
        {
          title: 'Toàn thân C — Săn chắc Cơ & Điều hòa Thể lực',
          splitName: 'Full Body Fat Loss',
          estimatedMinutes: 55,
          exerciseIds: [
            'ex_warmup_full_pulse',
            'ex_legs_bulgarian_split_squat',
            'ex_chest_db_press',
            'ex_back_pullup',
            'ex_triceps_cable_pushdown',
            'ex_finisher_fatloss_zone2',
          ],
        },
        {
          title: 'Toàn thân D — Tăng cường Đốt mỡ & Core',
          splitName: 'Full Body Fat Loss',
          estimatedMinutes: 50,
          exerciseIds: [
            'ex_warmup_full_pulse',
            'ex_legs_goblet_squat',
            'ex_pushup_decline',
            'ex_back_db_row',
            'ex_biceps_db_curl',
            'ex_finisher_fatloss_zone2',
          ],
        },
      ],
    };
  }

  if (goal === 'weight_gain') {
    const isThreeDays = daysPerWeek <= 3;
    return {
      splitSummaryVi: isThreeDays
        ? 'Full Body Tăng Cân Gọn Nhẹ (3 buổi/tuần • Tránh hao calo thừa)'
        : 'Modified Upper / Lower Cho Người Gầy (4 buổi/tuần • Tối ưu hấp thu)',
      scienceRationaleVi:
        'Người gầy khó tăng cân (Ectomorph) có mức tiêu hao năng lượng tự nhiên (NEAT) rất cao. Lịch tập gói gọn 40–45 phút với 80% bài Đa khớp nặng kích thích hormone phát triển cơ và cảm giác thèm ăn, loại bỏ Cardio đốt calo thừa và dành nhiều ngày nghỉ để cơ thể tích lũy cân nặng.',
      activeDays: isThreeDays ? [0, 2, 4] : [0, 1, 3, 4],
      sessions: [
        {
          title: 'Thân trên A (Upper Heavy) — Ngực, Lưng & Vai nền tảng',
          splitName: 'Modified Upper / Lower (Mass Gain)',
          estimatedMinutes: 45,
          exerciseIds: [
            'ex_warmup_upper_mobility',
            'ex_chest_barbell_bench',
            'ex_back_barbell_row',
            'ex_shoulders_db_press',
            'ex_biceps_db_curl',
            'ex_finisher_core_cooldown',
          ],
        },
        {
          title: 'Thân dưới A (Lower Heavy) — Đùi & Mông sức mạnh',
          splitName: 'Modified Upper / Lower (Mass Gain)',
          estimatedMinutes: 42,
          exerciseIds: [
            'ex_warmup_lower_mobility',
            'ex_legs_barbell_squat',
            'ex_hamstrings_rdl_db',
            'ex_legs_leg_press',
            'ex_finisher_core_cooldown',
          ],
        },
        {
          title: 'Thân trên B (Upper Hypertrophy) — Dày cơ thân trên',
          splitName: 'Modified Upper / Lower (Mass Gain)',
          estimatedMinutes: 45,
          exerciseIds: [
            'ex_warmup_upper_mobility',
            'ex_chest_db_press',
            'ex_back_lat_pulldown',
            'ex_pushup_decline',
            'ex_triceps_cable_pushdown',
            'ex_finisher_core_cooldown',
          ],
        },
        {
          title: 'Thân dưới B (Lower Hypertrophy) — Phát triển Chân & Core',
          splitName: 'Modified Upper / Lower (Mass Gain)',
          estimatedMinutes: 42,
          exerciseIds: [
            'ex_warmup_lower_mobility',
            'ex_legs_leg_press',
            'ex_legs_bulgarian_split_squat',
            'ex_hamstrings_leg_curl_machine',
            'ex_finisher_core_cooldown',
          ],
        },
      ],
    };
  }

  // Default: muscle_gain (Hypertrophy)
  const usePPL = daysPerWeek >= 5;
  return {
    splitSummaryVi: usePPL
      ? 'Push / Pull / Legs (PPL Chuyên Sâu Tăng Cơ • Tần suất 2×/tuần)'
      : 'Upper / Lower Tăng Cơ Tối Ưu (4 buổi/tuần • Tần suất 2×/nhóm cơ)',
    scienceRationaleVi:
      'Nghiên cứu khoa học chứng minh tác động mỗi nhóm cơ 2 lần/tuần (qua lịch Upper/Lower hoặc PPL) giúp duy trì chu kỳ tổng hợp protein cơ bắp (MPS) vượt trội so với kiểu tập mỗi ngày 1 nhóm cơ đơn lẻ. Mỗi buổi đi từ bài Đa khớp nặng sang bài Cô lập tạo độ nét.',
    activeDays: usePPL ? [0, 1, 2, 4, 5] : daysPerWeek === 3 ? [0, 2, 4] : [0, 1, 3, 4],
    sessions: usePPL
      ? [
          {
            title: 'Buổi Đẩy (Push) — Ngực, Vai & Tay sau',
            splitName: 'Push / Pull / Legs (Hypertrophy)',
            estimatedMinutes: 60,
            exerciseIds: [
              'ex_warmup_upper_mobility',
              'ex_chest_machine_press',
              'ex_shoulders_machine_press',
              'ex_pushup_decline',
              'ex_shoulders_lateral_raise',
              'ex_triceps_cable_pushdown',
              'ex_finisher_core_cooldown',
            ],
          },
          {
            title: 'Buổi Kéo (Pull) — Lưng xô, Vai sau & Tay trước',
            splitName: 'Push / Pull / Legs (Hypertrophy)',
            estimatedMinutes: 58,
            exerciseIds: [
              'ex_warmup_upper_mobility',
              'ex_back_lat_pulldown',
              'ex_back_db_row',
              'ex_biceps_db_curl',
              'ex_finisher_core_cooldown',
            ],
          },
          {
            title: 'Buổi Chân (Legs) — Đùi trước, Đùi sau & Mông',
            splitName: 'Push / Pull / Legs (Hypertrophy)',
            estimatedMinutes: 60,
            exerciseIds: [
              'ex_warmup_lower_mobility',
              'ex_legs_leg_press',
              'ex_legs_bulgarian_split_squat',
              'ex_hamstrings_leg_curl_machine',
              'ex_hamstrings_rdl_db',
              'ex_finisher_core_cooldown',
            ],
          },
          {
            title: 'Thân trên (Upper) — Tăng cơ Ngực, Lưng & Vai',
            splitName: 'Push / Pull / Legs + Upper/Lower',
            estimatedMinutes: 58,
            exerciseIds: [
              'ex_warmup_upper_mobility',
              'ex_chest_db_press',
              'ex_back_lat_pulldown',
              'ex_shoulders_lateral_raise',
              'ex_triceps_cable_pushdown',
              'ex_biceps_db_curl',
              'ex_finisher_core_cooldown',
            ],
          },
          {
            title: 'Thân dưới (Lower) — Toàn diện Đùi & Mông',
            splitName: 'Push / Pull / Legs + Upper/Lower',
            estimatedMinutes: 55,
            exerciseIds: [
              'ex_warmup_lower_mobility',
              'ex_legs_barbell_squat',
              'ex_hamstrings_rdl_db',
              'ex_hamstrings_leg_curl_machine',
              'ex_finisher_core_cooldown',
            ],
          },
        ]
      : [
          {
            title: 'Thân trên A (Upper A) — Trọng tâm Độ dày Ngực, Xô & Vai',
            splitName: 'Upper / Lower (Hypertrophy)',
            estimatedMinutes: 58,
            exerciseIds: [
              'ex_warmup_upper_mobility',
              'ex_chest_machine_press',
              'ex_back_lat_pulldown',
              'ex_shoulders_machine_press',
              'ex_shoulders_lateral_raise',
              'ex_triceps_cable_pushdown',
              'ex_finisher_core_cooldown',
            ],
          },
          {
            title: 'Thân dưới A (Lower A) — Trọng tâm Đùi trước & Mông',
            splitName: 'Upper / Lower (Hypertrophy)',
            estimatedMinutes: 55,
            exerciseIds: [
              'ex_warmup_lower_mobility',
              'ex_legs_leg_press',
              'ex_legs_bulgarian_split_squat',
              'ex_hamstrings_leg_curl_machine',
              'ex_finisher_core_cooldown',
            ],
          },
          {
            title: 'Thân trên B (Upper B) — Ngực trên, Lưng giữa & Tay',
            splitName: 'Upper / Lower (Hypertrophy)',
            estimatedMinutes: 58,
            exerciseIds: [
              'ex_warmup_upper_mobility',
              'ex_chest_db_press',
              'ex_back_db_row',
              'ex_pushup_decline',
              'ex_biceps_db_curl',
              'ex_triceps_cable_pushdown',
              'ex_finisher_core_cooldown',
            ],
          },
          {
            title: 'Thân dưới B (Lower B) — Trọng tâm Đùi sau, Mông & Đùi trước',
            splitName: 'Upper / Lower (Hypertrophy)',
            estimatedMinutes: 55,
            exerciseIds: [
              'ex_warmup_lower_mobility',
              'ex_legs_barbell_squat',
              'ex_hamstrings_rdl_db',
              'ex_hamstrings_leg_curl_machine',
              'ex_finisher_core_cooldown',
            ],
          },
        ],
  };
}

export function generateRecommendedWeeklySchedule(
  goal: GoalType,
  daysPerWeek = 4
): WeeklyWorkoutSchedule {
  const blueprint = getGoalBlueprints(goal, daysPerWeek);
  let sessionIdx = 0;

  const days: WorkoutSessionPlan[] = DAY_LABELS.map((dayLabel, dayOfWeek) => {
    const isTrainingDay = blueprint.activeDays.includes(dayOfWeek);
    if (!isTrainingDay) {
      return {
        dayOfWeek,
        dayLabel,
        isRestDay: true,
        sessionTitle: 'Ngày nghỉ & Phục hồi cơ bắp',
        splitName: blueprint.splitSummaryVi,
        estimatedMinutes: 0,
        noEquipmentMode: false,
        cardioFinisherMinutes: 0,
        cardioNoteVi:
          goal === 'fat_loss'
            ? 'Khuyến khích đi bộ nhẹ nhàng 6.000–8.000 bước trong ngày.'
            : 'Nghỉ ngơi hoàn toàn và ngủ đủ 7–8 tiếng để cơ bắp tổng hợp protein.',
        exercises: [],
      };
    }

    const template = blueprint.sessions[sessionIdx % blueprint.sessions.length];
    sessionIdx += 1;

    const exercises = template.exerciseIds.map((id, idx) =>
      createPlannedExercise(id, goal, idx)
    );

    return {
      dayOfWeek,
      dayLabel,
      isRestDay: false,
      sessionTitle: template.title,
      splitName: template.splitName,
      estimatedMinutes: template.estimatedMinutes,
      noEquipmentMode: false,
      cardioFinisherMinutes: goal === 'fat_loss' ? 18 : 0,
      cardioNoteVi:
        goal === 'fat_loss'
          ? '15–20 phút Cardio Zone 2 cuối buổi (Đi bộ dốc Incline Walk hoặc nhảy dây).'
          : goal === 'weight_gain'
          ? 'Không tập Cardio cuối buổi để giữ thặng dư Calo phục vụ tăng cân.'
          : 'Tập trung phục hồi cơ; chỉ đi bộ nhẹ nếu muốn.',
      exercises,
    };
  });

  return {
    goal,
    daysPerWeek,
    splitSummaryVi: blueprint.splitSummaryVi,
    scienceRationaleVi: blueprint.scienceRationaleVi,
    isCustomized: false,
    days,
  };
}

export function moveWorkoutSessionDay(
  schedule: WeeklyWorkoutSchedule,
  fromDayOfWeek: number,
  toDayOfWeek: number
): WeeklyWorkoutSchedule {
  if (
    fromDayOfWeek === toDayOfWeek ||
    fromDayOfWeek < 0 ||
    fromDayOfWeek > 6 ||
    toDayOfWeek < 0 ||
    toDayOfWeek > 6
  ) {
    return schedule;
  }

  const nextDays = schedule.days.map((d) => ({ ...d }));
  const source = nextDays[fromDayOfWeek];
  const target = nextDays[toDayOfWeek];

  nextDays[fromDayOfWeek] = {
    ...target,
    dayOfWeek: fromDayOfWeek,
    dayLabel: DAY_LABELS[fromDayOfWeek],
  };

  nextDays[toDayOfWeek] = {
    ...source,
    dayOfWeek: toDayOfWeek,
    dayLabel: DAY_LABELS[toDayOfWeek],
  };

  return {
    ...schedule,
    isCustomized: true,
    days: nextDays,
  };
}

export function swapSessionExercise(
  session: WorkoutSessionPlan,
  exerciseInstanceId: string,
  preferEquipmentFree = false,
  specificReplacementId?: string
): WorkoutSessionPlan {
  const updatedExercises = session.exercises.map((planned, idx) => {
    if (planned.instanceId !== exerciseInstanceId) return planned;

    const currentCatalogItem = getExerciseById(planned.exerciseId);
    const poolIds =
      preferEquipmentFree || session.noEquipmentMode
        ? currentCatalogItem.equipmentFreeAlternativeIds
        : currentCatalogItem.alternativeIds;

    let replacementId = specificReplacementId;
    if (!replacementId || replacementId === planned.exerciseId) {
      replacementId =
        poolIds.find((id) => id !== planned.exerciseId) ??
        EXERCISES.find(
          (e) =>
            e.muscleGroup === planned.muscleGroup &&
            e.id !== planned.exerciseId &&
            (!preferEquipmentFree || ['bodyweight', 'dumbbell', 'barbell'].includes(e.equipment))
        )?.id ??
        planned.exerciseId;
    }

    return createPlannedExercise(
      replacementId,
      'muscle_gain',
      idx,
      planned.sets,
      planned.targetReps,
      planned.setLogs
    );
  });

  return {
    ...session,
    exercises: updatedExercises,
  };
}

export function toggleSessionNoEquipmentMode(
  session: WorkoutSessionPlan,
  enabled: boolean
): WorkoutSessionPlan {
  if (!enabled) {
    return {
      ...session,
      noEquipmentMode: false,
    };
  }

  const convertedExercises = session.exercises.map((planned, idx) => {
    if (['bodyweight', 'dumbbell', 'barbell'].includes(planned.equipment)) {
      return planned;
    }
    const catalogItem = getExerciseById(planned.exerciseId);
    const eqFreeId =
      catalogItem.equipmentFreeAlternativeIds[0] ??
      EXERCISES.find(
        (e) =>
          e.muscleGroup === planned.muscleGroup &&
          ['bodyweight', 'dumbbell', 'barbell'].includes(e.equipment)
      )?.id ??
      planned.exerciseId;

    return createPlannedExercise(
      eqFreeId,
      'muscle_gain',
      idx,
      planned.sets,
      planned.targetReps,
      planned.setLogs
    );
  });

  return {
    ...session,
    noEquipmentMode: true,
    exercises: convertedExercises,
  };
}

export function addCustomExerciseToSession(
  session: WorkoutSessionPlan,
  exerciseId: string,
  sets = 3,
  reps = '10-12'
): WorkoutSessionPlan {
  const newExercise = createPlannedExercise(
    exerciseId,
    'muscle_gain',
    session.exercises.length + 1,
    sets,
    reps
  );

  // Insert before finisher_cooldown if present
  const finisherIndex = session.exercises.findIndex((e) => e.phase === 'finisher_cooldown');
  const nextExercises = [...session.exercises];
  if (finisherIndex >= 0) {
    nextExercises.splice(finisherIndex, 0, newExercise);
  } else {
    nextExercises.push(newExercise);
  }

  return {
    ...session,
    isRestDay: false,
    exercises: nextExercises,
  };
}

export function removeExerciseFromSession(
  session: WorkoutSessionPlan,
  exerciseInstanceId: string
): WorkoutSessionPlan {
  return {
    ...session,
    exercises: session.exercises.filter((e) => e.instanceId !== exerciseInstanceId),
  };
}
