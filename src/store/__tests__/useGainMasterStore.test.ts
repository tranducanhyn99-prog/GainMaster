import { createGainMasterStore } from '../useGainMasterStore';

describe('GainMaster Unified Store', () => {
  it('recomputes macro targets and updates recommended schedule when goal changes in ⚙️ Settings', () => {
    const store = createGainMasterStore();
    expect(store.getState().profile.goal).toBe('fat_loss');

    store.getState().updateProfile({ goal: 'muscle_gain', workoutDaysPerWeek: 4 }, true);
    const state = store.getState();

    expect(state.profile.goal).toBe('muscle_gain');
    expect(state.nutritionTargets.calories).toBeGreaterThan(state.nutritionTargets.tdee);
    expect(state.weeklySchedule.goal).toBe('muscle_gain');
  });

  it('tracks meal completion and updates consumed macros on the Today dashboard', () => {
    const store = createGainMasterStore();
    store.getState().toggleMealCompleted('breakfast');
    const consumed = store.getState().getConsumedMacros();
    expect(consumed.calories).toBeGreaterThan(0);
  });

  it('supports adding a Front/Back photo check-in and running AI cycle comparison', async () => {
    const store = createGainMasterStore();
    const initialCount = store.getState().checkIns.length;
    store.getState().addBodyCheckIn({
      dateIso: '2026-10-22T09:00:00.000Z',
      weightKg: 71.9,
      waistCm: 79.5,
      frontPhotoUri: 'file:///front-new.jpg',
      backPhotoUri: 'file:///back-new.jpg',
    });

    expect(store.getState().checkIns.length).toBe(initialCount + 1);
    const report = await store.getState().runAIComparisonForCycle('1m');
    expect(report).not.toBeNull();
    expect(report?.frontAssessment.length).toBeGreaterThan(5);
  });
});
