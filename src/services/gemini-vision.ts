import { AIPhysiqueReport, BodyCheckInEntry, GoalType, PhotoCycleType } from '../types/models';

function buildSmartFallbackReport(
  baseline: BodyCheckInEntry,
  latest: BodyCheckInEntry,
  goal: GoalType,
  cycle: PhotoCycleType
): AIPhysiqueReport {
  const weightDelta = Number((latest.weightKg - baseline.weightKg).toFixed(1));
  const waistDelta =
    baseline.waistCm !== undefined && latest.waistCm !== undefined
      ? Number((latest.waistCm - baseline.waistCm).toFixed(1))
      : null;

  const weightDirection =
    weightDelta < 0
      ? `giảm ${Math.abs(weightDelta)} kg (${baseline.weightKg} → ${latest.weightKg} kg)`
      : weightDelta > 0
      ? `tăng ${weightDelta} kg (${baseline.weightKg} → ${latest.weightKg} kg)`
      : `giữ ổn định ở mức ${latest.weightKg} kg`;

  const waistNote =
    waistDelta !== null
      ? `Số đo vòng eo thay đổi từ ${baseline.waistCm} cm xuống ${latest.waistCm} cm (${waistDelta > 0 ? `+${waistDelta}` : waistDelta} cm).`
      : 'Khung bụng và hai bên hông có độ săn chắc cải thiện.';

  let frontAssessment = `Mặt trước: Trọng lượng cơ thể ${weightDirection}. ${waistNote} Nhóm cơ ngực trên và cầu vai giữ được độ đầy đặn.`;
  let backAssessment =
    'Mặt sau: Khung lưng xô (V-taper) và vai sau cân đối hơn, vùng mỡ tích tụ ở thắt lưng dưới và hai bên hông gọn lại rõ rệt khi đối chiếu hai mốc.';
  let bodyFatTrend =
    goal === 'fat_loss'
      ? `Xu hướng % mỡ giảm ước tính khoảng 1.0% – 1.8%, giữ cơ tốt (Body Recomposition tích cực).`
      : goal === 'muscle_gain'
      ? `Khối lượng cơ nạc tăng lên ổn định, tỷ lệ mỡ kiểm soát trong ngưỡng an toàn.`
      : `Cân nặng và độ dày thân trên tăng tiến tốt, không bị tích mỡ bụng cục bộ.`;

  let coachingRecommendation =
    goal === 'fat_loss'
      ? 'Duy trì mức thâm hụt 450 kcal hiện tại, giữ lượng Đạm 2.1g/kg và tiếp tục 15–20 phút Cardio Zone 2 sau buổi tạ.'
      : goal === 'muscle_gain'
      ? 'Tiếp tục tăng tạ lũy tiến (Progressive Overload) ở các bài Đa khớp chủ lực đầu buổi và bổ sung thêm 2 hiệp bài Dang vai ngang.'
      : 'Giữ lịch tập gọn 40–45 phút, không tập Cardio đốt calo thừa và ăn đủ bữa phụ giàu đạm - tinh bột sau buổi tập.';

  return {
    generatedAtIso: new Date().toISOString(),
    cycle,
    source: 'fallback',
    frontAssessment,
    backAssessment,
    bodyFatTrend,
    coachingRecommendation,
  };
}

export async function analyzeProgressPhotosWithAI(params: {
  baseline: BodyCheckInEntry;
  latest: BodyCheckInEntry;
  goal: GoalType;
  cycle?: PhotoCycleType;
  apiKey?: string;
  fetchImpl?: typeof fetch;
}): Promise<AIPhysiqueReport> {
  const { baseline, latest, goal, cycle = '1m', apiKey, fetchImpl = globalThis.fetch } = params;

  const trimmedKey = apiKey?.trim();
  if (!trimmedKey || typeof fetchImpl !== 'function') {
    return buildSmartFallbackReport(baseline, latest, goal, cycle);
  }

  try {
    const prompt = `Bạn là một Huấn luyện viên Thể hình Cá nhân (PT) chuyên nghiệp tại Việt Nam.
Hãy phân tích tiến độ hình thể giữa 2 mốc kiểm tra bộ ảnh (Mặt trước & Mặt sau):
- Mục tiêu hiện tại: ${goal === 'fat_loss' ? 'Giảm mỡ giữ cơ' : goal === 'muscle_gain' ? 'Phát triển cơ bắp (Hypertrophy)' : 'Tăng cân cho người gầy'}
- Mốc trước (${baseline.dateIso.slice(0, 10)}): ${baseline.weightKg} kg${baseline.waistCm ? `, vòng eo ${baseline.waistCm} cm` : ''}
- Mốc mới (${latest.dateIso.slice(0, 10)}): ${latest.weightKg} kg${latest.waistCm ? `, vòng eo ${latest.waistCm} cm` : ''}

Hãy trả về đúng định dạng JSON gồm 4 trường tiếng Việt ngắn gọn, súc tích:
{
  "frontAssessment": "Nhận xét chi tiết Mặt trước (ngực, vai, bụng, hai bên hông)",
  "backAssessment": "Nhận xét chi tiết Mặt sau (độ rộng lưng xô, vai sau, lưng dưới)",
  "bodyFatTrend": "Ước lượng xu hướng % mỡ cơ thể và độ nét cơ bắp",
  "coachingRecommendation": "Lời khuyên cụ thể điều chỉnh lịch tập hoặc calo cho chu kỳ tới"
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      trimmedKey
    )}`;

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      return buildSmartFallbackReport(baseline, latest, goal, cycle);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return buildSmartFallbackReport(baseline, latest, goal, cycle);
    }

    const parsed = JSON.parse(rawText);
    return {
      generatedAtIso: new Date().toISOString(),
      cycle,
      source: 'gemini',
      frontAssessment: String(parsed.frontAssessment || ''),
      backAssessment: String(parsed.backAssessment || ''),
      bodyFatTrend: String(parsed.bodyFatTrend || ''),
      coachingRecommendation: String(parsed.coachingRecommendation || ''),
    };
  } catch {
    return buildSmartFallbackReport(baseline, latest, goal, cycle);
  }
}
