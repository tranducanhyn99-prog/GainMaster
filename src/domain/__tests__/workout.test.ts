import {
  generateRecommendedWeeklySchedule,
  moveWorkoutSessionDay,
  swapSessionExercise,
  toggleSessionNoEquipmentMode,
  addCustomExerciseToSession,
  removeExerciseFromSession,
} from '../workout';
import { PlannedSessionExercise, WorkoutSessionPlan } from '../../types/models';

describe('Evidence-Based Goal Workout Engine & Customizer', () => {
  it('structures 4-phase sessions differently for fat_loss, muscle_gain, and weight_gain', () => {
    const fatLoss = generateRecommendedWeeklySchedule('fat_loss', 3);
    const hypertrophy = generateRecommendedWeeklySchedule('muscle_gain', 4);
    const ectomorph = generateRecommendedWeeklySchedule('weight_gain', 4);

    const flSession = fatLoss.days.find((d: WorkoutSessionPlan) => !d.isRestDay)!;
    const hypSession = hypertrophy.days.find((d: WorkoutSessionPlan) => !d.isRestDay)!;
    const ectoSession = ectomorph.days.find((d: WorkoutSessionPlan) => !d.isRestDay)!;

    // Every training session has all 4 physiological phases
    const phases = new Set(flSession.exercises.map((e: PlannedSessionExercise) => e.phase));
    expect(phases.has('warmup')).toBe(true);
    expect(phases.has('primary_compound')).toBe(true);
    expect(phases.has('secondary_isolation')).toBe(true);
    expect(phases.has('finisher_cooldown')).toBe(true);

    // Fat loss includes Zone 2 / conditioning finisher; Ectomorph weight_gain excludes calorie-burning cardio
    expect(flSession.cardioFinisherMinutes).toBeGreaterThanOrEqual(15);
    expect(ectoSession.cardioFinisherMinutes).toBe(0);
    expect(hypSession.splitName).toContain('Upper / Lower');
  });

  it('allows the user to move a workout day to fit their personal schedule', () => {
    const schedule = generateRecommendedWeeklySchedule('muscle_gain', 4);
    // Move Thursday (dayIndex 3) to Saturday (dayIndex 5)
    const updated = moveWorkoutSessionDay(schedule, 3, 5);
    expect(updated.days[5].isRestDay).toBe(false);
    expect(updated.days[3].isRestDay).toBe(true);
    expect(updated.isCustomized).toBe(true);
  });

  it('converts machine exercises to equipment-free alternatives while preserving completed set logs (Review Focus #3)', () => {
    const schedule = generateRecommendedWeeklySchedule('muscle_gain', 4);
    const session = schedule.days.find((d: WorkoutSessionPlan) => !d.isRestDay)!;
    session.exercises[1].setLogs[0].completed = true;
    session.exercises[1].setLogs[0].weightKg = 60;

    const noEquipSession = toggleSessionNoEquipmentMode(session, true);
    const workingExercises = noEquipSession.exercises.filter((e: PlannedSessionExercise) => e.phase !== 'warmup');
    expect(
      workingExercises.every((e: PlannedSessionExercise) =>
        ['bodyweight', 'dumbbell', 'barbell'].includes(e.equipment)
      )
    ).toBe(true);
    expect(noEquipSession.exercises[1].setLogs[0].completed).toBe(true);
  });

  it('supports swapping, adding, and removing exercises in a session', () => {
    const schedule = generateRecommendedWeeklySchedule('muscle_gain', 4);
    const session = schedule.days.find((d: WorkoutSessionPlan) => !d.isRestDay)!;
    const targetInstId = session.exercises[1].instanceId;
    const originalExId = session.exercises[1].exerciseId;

    const swapped = swapSessionExercise(session, targetInstId, true);
    expect(swapped.exercises[1].exerciseId).not.toBe(originalExId);

    const added = addCustomExerciseToSession(swapped, 'ex_pushup_standard', 3, '12-15');
    expect(added.exercises.length).toBe(swapped.exercises.length + 1);

    const removed = removeExerciseFromSession(added, targetInstId);
    expect(removed.exercises.some((e: PlannedSessionExercise) => e.instanceId === targetInstId)).toBe(false);
  });
});
