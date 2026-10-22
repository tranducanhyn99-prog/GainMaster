# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Stack

React Native (Expo SDK 52, TypeScript, Expo Router), Zustand + AsyncStorage + `expo-file-system` (Local-First persistence), Google Gemini API (`gemini-2.5-flash` for Vision & Coaching).

## Users

Solo Vietnamese gym-goers ("người tự tập") training on iPhone with one of three goals: Fat Loss (`Giảm mỡ`), Muscle Building (`Phát triển cơ bắp`), or Weight Gain (`Tăng cân`). They use the app in two primary contexts: at the gym between sets (checking exercises, logging sets, swapping unavailable machines for equipment-free alternatives, running rest timers) and at home/meals (following or swapping Vietnamese meal items and taking periodic Front/Back physique progress photos).

## Product Purpose

GainMaster acts as a pocket virtual personal trainer ("PT ảo bỏ túi") that eliminates guesswork in body recomposition, Vietnamese meal planning, and goal-specific training schedules, while motivating users through periodic Front/Back photo comparisons analyzed by Gemini Vision AI.

## Positioning

Unlike Western fitness trackers that require weighing foreign ingredients in grams/ounces and offer generic workout templates, GainMaster combines:
1. Authentic Vietnamese cuisine measured in everyday household units (`bát`, `tô`, `lạng (100g)`, `quả`, `đĩa`) with 1-tap calorie-equivalent swapping.
2. Evidence-based 4-phase workout schedules tailored to each physiological goal (`Giảm mỡ`, `Tăng cơ`, `Tăng cân`) with 1-tap equipment-free/bodyweight alternatives when gym machines are unavailable.
3. Periodic Front & Back photo check-in cycles (`1 ngày`, `1 tuần`, `1 tháng`, `2 tháng`) paired with Gemini Vision AI body composition analysis.

## Operating Context

- Used one-handed on an iPhone in bright or mixed gym lighting (`Operate` mode).
- Local-first operation so weak gym Wi-Fi/cellular never blocks workout logging or meal checking.
- Sensitive Front/Back physique photos remain stored locally on the device unless the user explicitly invokes AI analysis.

## Capabilities and Constraints

- 4 fixed bottom navigation tabs (`Hôm nay`, `Thể trạng AI`, `Thực đơn`, `Lịch tập`) + persistent top-right gear button (`⚙️`) opening the Profile, Goal & Photo Cycle Modal Sheet.
- Mifflin-St Jeor BMR/TDEE calculation with goal-specific calorie & macro targets.
- Customizable weekly workout schedule (weekday rearranging, exercise addition/removal, set logging, Rest Timer, and equipment-free mode).

## Brand Commitments

- **Visual Direction:** Style B — Clean Daylight (MacroFactor / Apple Health inspired warmth and precision).
- **Language:** Clear, encouraging, non-jargon Vietnamese.

## Product Principles

1. **Recommend with 1-tap, customize without friction:** Every plan (workout or meal) works out of the box with "Áp dụng ngay" but adapts to the user's real life schedule and available equipment in one tap.
2. **Everyday Vietnamese practicality:** Speak in `bát cơm`, `lạng thịt`, `tô phở`, not foreign food databases.
3. **Visual truth over scale anxiety:** Pair weight trends with standardized Front/Back photo milestones and objective AI feedback.
4. **Native iOS precision:** Respect safe areas, minimum 44×44pt touch targets, SF Pro typography hierarchy, and tabular numerals (`tabular-nums`).
