import { TAB_ITEMS } from '../../../app/(tabs)/_layout';

describe('4-Tab iOS Navigation Structure', () => {
  it('exposes exactly the 4 approved tabs in order', () => {
    expect(TAB_ITEMS.map((t: { name: string }) => t.name)).toEqual([
      'index',
      'progress',
      'nutrition',
      'workout',
    ]);
    expect(TAB_ITEMS.map((t: { title: string }) => t.title)).toEqual([
      'Hôm nay',
      'Thể trạng AI',
      'Thực đơn',
      'Lịch tập',
    ]);
  });
});
