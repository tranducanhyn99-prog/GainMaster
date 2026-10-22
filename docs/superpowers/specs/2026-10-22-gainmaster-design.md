# Tài liệu Thiết kế (Design Specification): GainMaster — PT Ảo Cá Nhân (iOS-First)

**Ngày tạo:** 2026-10-22  
**Trạng thái:** Đang chờ phê duyệt  
**Nền tảng mục tiêu:** iOS (React Native / Expo — hỗ trợ chạy trực tiếp trên iPhone qua Expo Go và xem trước trên Web tại Windows)  
**Tiêu chuẩn thiết kế UI/UX:** Phong cách **Clean Daylight (Phong cách B)** được chuẩn hóa và kiểm định bằng kỹ năng **`impeccable`** (Mode: `Operate`, Native iOS guidelines).

---

## 1. Ý định & Lý do xây dựng (Intent & The Why)

Người tự tập gym tại Việt Nam thường gặp 3 rào cản lớn khiến họ bỏ cuộc hoặc tập mãi không thấy kết quả:
1. **Không biết bắt đầu từ đâu:** Thiếu một "PT cá nhân" tính toán chuẩn xác lượng Calo/Macro (Đạm - Tinh bột - Béo) và thiết kế sẵn lịch tập phù hợp với mục tiêu (**Giảm mỡ**, **Tăng cân**, hoặc **Phát triển cơ bắp**).
2. **Thực đơn xa rời thực tế Việt Nam:** Hầu hết ứng dụng ngoại gợi ý yến mạch, ức gà nướng kiểu Âu, quả bơ, phô mai tính theo đơn vị `oz` hoặc bắt cân tiểu ly từng gam, trong khi người Việt ăn cơm nhà, phở bò, bún bò, khoai lang, thịt thăn, đậu phụ, trứng... theo **bát, tô, lạng (100g), quả**.
3. **Mất động lực vì chỉ nhìn cân nặng:** Quá trình giảm mỡ - tăng cơ (Body Recomposition) thường làm cân nặng đứng yên dù hình thể săn gọn hơn nhiều. Người tập cần một công cụ lưu trữ **bộ ảnh thể trạng (Mặt trước & Mặt sau)** theo từng chu kỳ tùy chọn (**1 ngày, 1 tuần, 1 tháng, 2 tháng**) kết hợp **AI phân tích hình ảnh (Gemini Vision)** để nhận xét khách quan sự thay đổi của cơ và mỡ.

**GainMaster** ra đời để đóng vai trò một **"PT ảo bỏ túi" dành riêng cho người tự tập trên iPhone**: tự động hóa việc lập kế hoạch nhưng vẫn cho phép đổi món ăn/bài tập linh hoạt chỉ bằng một chạm, đồng thời theo dõi sự lột xác hình thể bằng hình ảnh và AI.

---

## 2. Mục tiêu, Ngoài phạm vi & Điều tối kỵ (Goals, Non-Goals & Anti-Goals)

### Mục tiêu (Goals)
- **Tự động hóa lộ trình cá nhân (Onboarding & Auto-Plan):** Thu thập thông số cơ thể (chiều cao, cân nặng, tuổi, giới tính, mức độ vận động) và mục tiêu (`Giảm mỡ`, `Tăng cân`, `Tăng cơ`) để tính BMI, BMR, TDEE, tỷ lệ Macro chuẩn và tự sinh lịch tập + thực đơn mẫu cả tuần.
- **Nhật ký thể trạng qua hình ảnh & AI Vision:**
  - Cho phép lưu bộ ảnh chuẩn gồm **2 góc chụp: Mặt trước (Front) & Mặt sau (Back)** kèm cân nặng và số đo (eo, ngực, mông/đùi tùy chọn) tại thời điểm chụp.
  - Cho phép cài đặt và lọc theo **chu kỳ theo dõi tùy chọn**: `1 ngày`, `1 tuần`, `1 tháng`, `2 tháng` (hoặc chọn 2 mốc bất kỳ).
  - Giao diện đặt 2 bộ ảnh (Trước - Sau) cạnh nhau và chế độ kéo thanh trượt đè ảnh (Before/After Slider).
  - Tích hợp **Google Gemini Vision AI** để phân tích trực tiếp 2 bộ ảnh (Mặt trước & Mặt sau giữa 2 mốc), đưa ra nhận xét cụ thể về các nhóm cơ, xu hướng % mỡ cơ thể ước tính, và đề xuất điều chỉnh calo/lịch tập.
- **Thực đơn thuần Việt linh hoạt:**
  - Cơ sở dữ liệu món ăn Việt Nam phong phú chia làm 2 nhóm: *Đồ tự nấu / Eat Clean kiểu Việt* (cơm trắng, gạo lứt, khoai lang, ức gà, thăn heo, bắp bò, cá, đậu phụ, trứng, rau luộc...) và *Món ăn hàng ngày / Ăn tiệm* (phở bò, bún bò, cơm tấm, bún chả, cơm gia đình...).
  - Quy đổi khẩu phần sang đơn vị gần gũi với người Việt: **bát/chén, tô, đĩa, lạng (100g), quả, hộp** (kèm số gam quy chiếu).
  - Nút **"Đổi món tương đương"** ngay trên từng bữa (Sáng / Trưa / Tối / Phụ) giúp đổi sang món Việt khác có lượng Calo & Đạm tương đương mà không làm vỡ kế hoạch Macro trong ngày.
- **Lịch tập thông minh tại phòng gym:**
  - Tự sinh lịch tập theo tuần (3, 4, 5 hoặc 6 buổi/tuần tùy người dùng chọn, ví dụ: Push - Pull - Legs, Upper - Lower, Full Body).
  - Ghi rõ số hiệp (Sets) × số lần (Reps), thời gian nghỉ, hướng dẫn kỹ thuật ngắn gọn, cho phép tích hoàn thành từng hiệp, ghi mức tạ thực tế và bấm **"Đổi bài tập"** cùng nhóm cơ khi máy tập trong phòng gym đang bận.

### Ngoài phạm vi giai đoạn hiện tại (Non-Goals)
- **Không làm hệ thống quản lý nhiều học viên cho PT (Multi-tenant PT Portal):** Không xây dựng tính năng phân quyền PT - Học viên, giao bài từ xa hay chat giữa PT và khách hàng.
- **Không làm mạng xã hội:** Không có bảng tin (newsfeed) công khai, bình luận hay chia sẻ ảnh thể trạng lên cộng đồng.
- **Không tích hợp phần cứng đeo tay chuyên sâu (Apple Watch / Garmin) ở bản đầu tiên:** Tập trung hoàn thiện trải nghiệm trên iPhone trước.

### Điều tối kỵ (Anti-Goals)
- **Không bắt người dùng nhập liệu thủ công phức tạp mới dùng được app:** Tuyệt đối tránh màn hình trống bắt người tập tự nghĩ lịch tập hay tự tìm từng nguyên liệu cộng trừ từng gam mới lên được bữa ăn.
- **Không ép dùng thực phẩm ngoại xa lạ:** Không gợi ý thực đơn mặc định chứa các món khó mua ở Việt Nam.
- **Không tự ý tải ảnh nhạy cảm của người dùng lên máy chủ công cộng:** Ảnh chụp cơ thể (Mặt trước / Mặt sau) phải được lưu trữ cục bộ an toàn trên thiết bị của người dùng; chỉ gửi qua kết nối mã hóa tới Gemini API tại thời điểm người dùng chủ động bấm nút yêu cầu AI phân tích.
- **Không thiết kế giao diện rối mắt hoặc sơ sài:** Mọi màn hình phải tuân thủ quy trình và tiêu chuẩn chất lượng của kỹ năng **`impeccable`** (Mode: `Operate` trên nền tảng `ios`).

---

## 3. Ràng buộc kỹ thuật & Môi trường (Constraints)

1. **Môi trường phát triển trên Windows, đích chạy là iPhone (iOS):**
   - Máy tính phát triển chạy hệ điều hành Windows (không thể chạy Xcode bản địa).
   - Giải pháp phải cho phép chạy thử trực tiếp trên chiếc iPhone thật của người dùng thông qua **Expo Go** (quét mã QR qua mạng Wi-Fi nội bộ) đồng thời hỗ trợ mở trên trình duyệt Web ở Windows để kiểm thử giao diện nhanh.
2. **Hoạt động mượt ngay cả khi phòng gym sóng yếu (Local-First):**
   - Toàn bộ hồ sơ, lịch sử cân nặng, lịch tập, thư viện món Việt và đường dẫn bộ ảnh thể trạng được lưu trữ cục bộ trên máy (`expo-sqlite` / `AsyncStorage` + `expo-file-system`).
3. **Tiêu chuẩn thiết kế UI/UX với `impeccable`:**
   - Sử dụng bộ công cụ và quy trình của kỹ năng `impeccable` (`PRODUCT.md`, `DESIGN.md`, `reference/new-work.md`, `reference/craft-floor.md`, `reference/audit.native.md`, `reference/polish.md`) để thiết kế và rà soát toàn bộ giao diện theo **Phong cách B (Clean Daylight)**.

---

## 4. Các phương án kỹ thuật đã cân nhắc (Approaches)

### Phương án 1: React Native (Expo) + Google Gemini Flash (Vision) + Lưu trữ cục bộ SQLite/FileSystem *(Đã chọn)*
- **Mô tả:** Xây dựng bằng Expo (React Native, TypeScript, Expo Router). Sử dụng `expo-image-picker` / `expo-camera` để chụp hoặc chọn ảnh thể trạng Mặt trước/Mặt sau, `expo-file-system` + `expo-sqlite` để lưu trữ cục bộ, và gọi trực tiếp Google Gemini Flash API (`gemini-2.5-flash`) cho tác vụ Vision (phân tích bộ ảnh) và gợi ý chuyên môn.
- **Ưu điểm:** Chạy trực tiếp trên iPhone thật từ máy Windows thông qua ứng dụng Expo Go; giao diện, vuốt chạm và truy cập Camera chuẩn iOS native; đồng thời chạy được cả bản Web trên Windows để xem trước và kiểm tra bằng công cụ trực quan.
- **Đánh đổi:** Khi muốn đóng gói file `.ipa` đưa lên App Store chính thức sẽ dùng dịch vụ đám mây EAS Build của Expo.

### Phương án 2: Progressive Web App (PWA - Next.js / React)
- **Mô tả:** Làm ứng dụng Web tối ưu cho màn hình di động và ghim ra màn hình chính iPhone qua Safari.
- **Lý do không chọn:** Trải nghiệm chụp ảnh đối chiếu, lưu trữ dung lượng ảnh lớn cục bộ và độ mượt của thao tác vuốt chạm trên iPhone không đạt chuẩn ứng dụng gốc như Phương án 1.

### Phương án 3: Flutter + Gemini AI
- **Mô tả:** Viết ứng dụng đa nền tảng bằng ngôn ngữ Dart.
- **Lý do không chọn:** Không thể biên dịch và cài trực tiếp sang iPhone thật từ máy Windows nếu không có máy Mac trung gian.

---

## 5. Thiết kế chi tiết các quyết định đã thống nhất (Decided Architecture & UX)

### 5.1. Cấu trúc điều hướng & Thẩm mỹ giao diện (UI/UX Architecture)
- **Thanh điều hướng đáy (Bottom Tab Bar) gồm đúng 4 Tab chính:**
  1. `Hôm nay` (Dashboard tổng quan ngày)
  2. `Thể trạng AI` (Nhật ký bộ ảnh Mặt trước/Mặt sau & Phân tích Gemini Vision)
  3. `Thực đơn` (Thực đơn món Việt theo bữa & Đổi món tương đương)
  4. `Lịch tập` (Lịch tập theo buổi trong tuần, theo dõi hiệp tập & Đổi bài tập)
- **Nút Bánh răng Cài đặt (`⚙️`) ở góc trên bên phải:**
  - Xuất hiện nhất quán trên thanh tiêu đề để mở màn hình/ngăn kéo (Modal Sheet chuẩn iOS) **Hồ sơ & Cài đặt**, nơi người dùng có thể:
    - Chỉnh sửa chỉ số cơ thể (Chiều cao, Cân nặng hiện tại, Tuổi, Giới tính, Mức độ vận động, Số buổi tập/tuần).
    - Đổi mục tiêu chính: **Giảm mỡ** (-400 đến -500 kcal so với TDEE), **Tăng cơ chuẩn (Lean Bulk)** (+200 đến +300 kcal), hoặc **Tăng cân** (+400 đến +500 kcal).
    - Cài đặt **Chu kỳ nhắc chụp ảnh thể trạng**: `1 ngày`, `1 tuần`, `1 tháng`, `2 tháng`.
    - Cấu hình khóa API Gemini (hoặc dùng chế độ phân tích thông minh tích hợp).
- **Phong cách thẩm mỹ: Phong cách B — Clean Daylight (kết hợp `impeccable`):**
  - **Nền chính (Background):** Kem ấm dịu mắt (`#F6F5F2` / Alabaster), tránh trắng chói lóa `#FFFFFF` toàn màn hình.
  - **Bề mặt thẻ (Card Surface):** Trắng tinh khiết (`#FFFFFF`) với viền mảnh tinh tế (`#E2E8F0`) và đổ bóng mềm nhẹ chuẩn iOS.
  - **Màu nhấn (Accents):**
    - Xanh Ngọc Lục Bảo (`#10B981` / `#059669`) cho tiến độ mục tiêu, dinh dưỡng và trạng thái hoàn thành.
    - Xanh Dương (`#0EA5E9`) cho chỉ số Tinh bột / Lịch tập.
    - Cam Coral (`#F97316`) cho Chất béo / Nhắc nhở năng lượng.
    - Chữ chính màu Than Đậm (`#0F172A`), chữ phụ màu Xám Đá (`#64748B`), số liệu dùng `tabular-nums` để thẳng hàng tuyệt đối.

### 5.2. Chi tiết 4 Phân hệ chức năng

#### A. Phân hệ 1: Hồ sơ, Chỉ số Thể trạng & Bảng điều khiển `Hôm nay`
- **Công thức tính toán chuẩn khoa học:**
  - Tính **BMR** theo công thức *Mifflin-St Jeor*.
  - Nhân hệ số vận động (1.2 đến 1.725) để ra **TDEE**.
  - Tự động phân bổ **Calo mục tiêu** và **Macro (Protein / Carb / Fat)**:
    - *Giảm mỡ:* Calo = `TDEE - 450 kcal`, Protein cao (`2.0g - 2.2g / kg cân nặng`) để giữ cơ.
    - *Phát triển cơ bắp:* Calo = `TDEE + 250 kcal`, Protein (`1.8g - 2.0g / kg`), ưu tiên Carb quanh buổi tập.
    - *Tăng cân:* Calo = `TDEE + 450 kcal`, Protein (`1.6g - 1.8g / kg`), giàu năng lượng dễ hấp thu.
- **Màn hình `Hôm nay`:**
  - Vòng tròn Calo (Đã nạp / Mục tiêu) và 3 thanh tiến độ Đạm - Bột - Béo.
  - Thẻ tóm tắt **Ca tập hôm nay** (bấm vào để bắt đầu tập ngay).
  - Thẻ **Nhắc lịch chụp bộ ảnh thể trạng** (hiển thị khi đến chu kỳ đã chọn: 1 ngày / 1 tuần / 1 tháng / 2 tháng) kèm biểu đồ xu hướng cân nặng.

#### B. Phân hệ 2: Nhật ký Hình ảnh & Đánh giá AI (`Thể trạng AI`)
- **Lưu trữ bộ ảnh theo mốc (Check-in Entry):**
  - Mỗi bản ghi gồm: Ngày chụp, Cân nặng lúc chụp (kg), Ghi chú số đo (Vòng eo, Vòng ngực - tùy chọn), **Ảnh Mặt trước (Front Pose)** và **Ảnh Mặt sau (Back Pose)**.
  - Khung hướng dẫn chụp ảnh có lưới căn chỉnh dáng đứng để các lần chụp có cùng khoảng cách và góc độ.
- **Bộ lọc chu kỳ đối chiếu nhanh:**
  - Thanh chọn nhanh: `1 Ngày` | `1 Tuần` | `1 Tháng` | `2 Tháng` | `Tùy chọn`. Khi bấm vào một chu kỳ (ví dụ `1 Tháng`), app tự động lấy **bộ ảnh mới nhất** ghép cặp với **bộ ảnh cách đó 1 tháng** (hoặc gần mốc đó nhất).
- **Chế độ xem đối chiếu:**
  - Cho phép chuyển đổi giữa góc xem **Mặt trước** và **Mặt sau** (hoặc xem cả cặp).
  - Hỗ trợ đặt 2 ảnh cạnh nhau (Side-by-Side) và thanh trượt đè ảnh (Before/After Comparison Slider).
- **Tích hợp AI Phân tích Hình ảnh (Gemini Vision):**
  - Khi bấm **"Phân tích tiến độ bằng AI"**, ứng dụng gửi bộ ảnh mốc cũ + bộ ảnh mốc mới (cả Mặt trước và Mặt sau) kèm thông tin mục tiêu và chênh lệch cân nặng lên Gemini Vision (`gemini-2.5-flash`).
  - Kết quả trả về được cấu trúc rõ ràng thành 4 mục và lưu lại vào bản ghi để xem lại bất cứ lúc nào:
    1. **Đánh giá Mặt trước:** Nhận xét vùng ngực, vai, bụng trên/dưới, hai bên hông (love handles).
    2. **Đánh giá Mặt sau:** Nhận xét độ rộng lưng xô (V-taper), vai sau, vùng mỡ lưng dưới.
    3. **Ước lượng % Mỡ & Xu hướng cơ bắp:** Ước tính khoảng % body fat hiện tại so với mốc trước và đánh giá chất lượng tăng cơ/giảm mỡ.
    4. **Đề xuất điều chỉnh từ PT Ảo:** Gợi ý cụ thể về lượng Calo hoặc nhóm cơ cần ưu tiên thêm trong chu kỳ tiếp theo.

#### C. Phân hệ 3: Thực đơn Thuần Việt (`Thực đơn`)
- **Cấu trúc bữa ăn trong ngày:** Chia làm 4 bữa: `Bữa sáng`, `Bữa trưa`, `Bữa tối`, và `Bữa phụ / Trước tập`.
- **Thư viện món ăn Việt Nam tích hợp sẵn:**
  - Gồm ít nhất 35–45 món ăn và thực phẩm Việt Nam phổ biến với thông số Calo, Đạm (P), Tinh bột (C), Béo (F) và **đơn vị đo lường đời thường** (`1 tô vừa`, `1,5 bát cơm`, `1,5 lạng (150g)`, `2 quả`, `1 đĩa`, `1 củ vừa`...).
  - Bao gồm cả món cơm nhà/tự nấu (ức gà áp chảo sả ớt, thịt thăn heo luộc, bò xào bông cải, cá hồi/cá basa áp chảo, đậu phụ nhồi thịt, trứng luộc/ốp la, cơm trắng, cơm gạo lứt, khoai lang luộc, rau muống/cải luộc...) và món ăn tiệm quen thuộc (phở bò tái nạm, bún bò Huế, bún chả, cơm tấm sườn nướng, bánh mì thịt/trứng...).
- **Cơ chế Tự sinh & Đổi món 1 chạm:**
  - Tự động chia tổng Calo & Macro mục tiêu vào 4 bữa và chọn món phù hợp cho từng ngày trong tuần.
  - Bấm **"Đổi món"** ở bất kỳ bữa nào sẽ mở danh sách các món Việt cùng nhóm bữa ăn có khẩu phần được tự động quy đổi để khớp lượng Calo/Đạm của bữa đó.
  - Tích chọn **"Đã ăn"** ở từng bữa để cộng trực tiếp vào vòng tròn Calo & Macro ở màn hình `Hôm nay`.

#### D. Phân hệ 4: Lịch tập Đề xuất Chuẩn Khoa học & Tùy biến Linh hoạt (`Lịch tập`)

- **Triết lý "Đề xuất 1 chạm + Toàn quyền tùy biến theo lịch sinh hoạt":**
  - Lịch tập do ứng dụng sinh ra đóng vai trò là **Lịch tập Đề xuất (Recommended Plan)**: người dùng có thể bấm **"Áp dụng ngay"** để bắt đầu tập liền, HOẶC **tự do chỉnh sửa** cho khớp với lịch sinh hoạt cá nhân:
    - **Đổi ngày tập / ngày nghỉ linh hoạt:** Dễ dàng hoán đổi buổi tập giữa các thứ trong tuần (ví dụ bận việc Thứ 5 có thể dời buổi tập sang Thứ 7) hoặc đổi số buổi tập/tuần (3, 4, 5, 6 buổi).
    - **Tùy chỉnh ngay trong buổi tập:** Cho phép thêm bài tập từ thư viện, xóa bài không muốn tập, sắp xếp lại thứ tự bài, và tự chỉnh số hiệp (Sets) × số lần (Reps) / mức tạ.

- **Cấu trúc chuẩn 4 giai đoạn của MỘT buổi tập (Evidence-Based Session Anatomy):**
  Mỗi buổi tập đều được tổ chức theo trình tự sinh lý học chuẩn thay vì liệt kê bài rời rạc:
  1. **Giai đoạn 1 — Khởi động & Kích hoạt (Warm-up • 5–8 phút):** Làm ấm cơ thể + xoay khớp động (Dynamic Mobility) + hướng dẫn 1–2 hiệp khởi động tạ nhẹ (Ramp-up sets) trước bài nặng đầu tiên để bảo vệ khớp.
  2. **Giai đoạn 2 — Bài Đa khớp Chủ lực (Primary Compound Lifts):** Đặt ở đầu buổi khi hệ thần kinh trung ương (CNS) sung sức nhất (Squat, Bench Press, Deadlift, Overhead Press, Pull-up/Row). Tập `3–4 hiệp × 6–10 reps`, nghỉ `120–150 giây` để hồi phục năng lượng ATP-PC.
  3. **Giai đoạn 3 — Bài Đa khớp Phụ & Cô lập Tăng cơ (Secondary Compound & Isolation):** Tác động sâu vào từng góc cơ (Incline Dumbbell Press, Romanian Deadlift, Bulgarian Split Squat, Lateral Raises, Bicep Curls, Tricep Pushdowns). Tập `3–4 hiệp × 8–12 reps` (hoặc `12–15 reps` cho nhóm cơ nhỏ), nghỉ `60–90 giây`.
  4. **Giai đoạn 4 — Core / Điều hòa thể lực (Finisher / Cardio tùy mục tiêu) & Giãn cơ (Cool-down • 5 phút).**

- **Phân hóa Lịch tuần (Split) & Cấu trúc theo 3 Mục tiêu (Dựa trên nghiên cứu khoa học thể thao):**
  1. **Mục tiêu Phát triển cơ bắp (Hypertrophy / Muscle Building):**
     - *Lịch tuần đề xuất:* **Upper / Lower (4 buổi/tuần: Thứ 2 - 3 - 5 - 6)** hoặc **Push / Pull / Legs (PPL 3–6 buổi/tuần)**. Đảm bảo tần suất tác động mỗi nhóm cơ **2 lần/tuần** để tối ưu chu kỳ tổng hợp protein cơ bắp (MPS).
     - *Cấu trúc buổi:* Khởi động ➔ 1–2 Bài Compound nặng (`6–10 reps`, nghỉ `120–150s`) ➔ 2–3 Bài Đa khớp phụ (`8–12 reps`, nghỉ `90s`) ➔ 1–2 Bài Cô lập hoàn thiện nét cơ (`12–15 reps`, nghỉ `60s`). Hạn chế Cardio cường độ cao ngay sau tập để bảo toàn năng lượng phục hồi cơ.
  2. **Mục tiêu Giảm mỡ / Giảm cân giữ cơ (Fat Loss & Body Recomposition):**
     - *Lịch tuần đề xuất:* **Full Body (3–4 buổi/tuần: Thứ 2 - 4 - 6)** hoặc **Upper / Lower cô đọng (4 buổi/tuần)**. Khi ăn thâm hụt calo, khả năng phục hồi giảm; tập toàn thân hoặc thân trên/dưới giúp đốt nhiều calo nhất mỗi buổi, giữ tín hiệu duy trì khối lượng cơ mà vẫn có ngày nghỉ xen kẽ.
     - *Cấu trúc buổi:* Khởi động ➔ 2–3 Bài Compound lớn toàn thân (`8–10 reps`, nghỉ `90s` để giữ sức mạnh cơ) ➔ 2 Bài Bổ trợ / Tổ hợp (`12–15 reps`, nghỉ ngắn `45–60s`) ➔ **15–20 phút Cardio Zone 2 cuối buổi** (đi bộ dốc Incline Walk, đạp xe) hoặc HIIT ngắn (giới hạn 1–2 lần/tuần).
  3. **Mục tiêu Tăng cân cho người gầy / khó hấp thu (Ectomorph Mass Gain):**
     - *Lịch tuần đề xuất:* **Modified Upper / Lower (4 buổi/tuần: 2 buổi Nặng - 2 buổi Vừa)** hoặc **Full Body (3 buổi/tuần)** với **khối lượng hiệp vừa đủ (tránh Junk Volume)**. Người gầy có mức tiêu hao năng lượng tự nhiên (NEAT) cao; tập quá nhiều buổi hoặc quá dài sẽ đốt mất lượng calo thặng dư cần để tăng cân.
     - *Cấu trúc buổi:* Gói gọn trong **40–45 phút**: Khởi động ➔ 2–3 Bài Compound nền tảng kích thích toàn thân (`6–10 reps`, nghỉ `120s`) ➔ 1–2 Bài bổ trợ nhóm cơ nhỏ (`8–12 reps`, nghỉ `90s`) ➔ **Loại bỏ hoàn toàn Cardio tiêu hao calo cuối buổi**, ưu tiên ngày nghỉ để cơ thể hấp thu dinh dưỡng.

- **Hệ thống "Bài tập thay thế Không Cần Máy / Đa dụng cụ" (Equipment-Free & Equipment-Aware Alternatives):**
  - Mọi bài tập dùng máy trong lịch đều được gắn sẵn các **Bài tập thay thế tương đương nhóm cơ**, chia rõ theo dụng cụ để người dùng đổi 1 chạm khi phòng gym thiếu máy, máy đang bận, hoặc tập tại nhà:
    - *Ngực (Chest):* Máy ép ngực / Cáp ➔ **Hít đất tiêu chuẩn (Push-ups)**, **Hít đất chân cao (Decline Push-ups)**, hoặc **Đẩy ngực tạ đơn (Dumbbell Press)**.
    - *Lưng / Xô (Back):* Máy kéo xô (Lat Pulldown) / Máy chèo cáp ➔ **Hít xà đơn (Pull-ups / Chin-ups)**, **Kéo tạ đơn gập người (Dumbbell Row)**, **Gập lưng Superman**.
    - *Vai (Shoulders):* Máy đẩy vai ➔ **Đẩy vai chữ V (Pike Push-ups)**, **Đẩy vai tạ đơn**, **Dang tạ đơn sang ngang (Lateral Raises)**.
    - *Đùi trước (Quads):* Máy đá đùi (Leg Extension) / Đạp đùi (Leg Press) ➔ **Bulgarian Split Squat (Chân sau đặt lên ghế)**, **Bodyweight Squat / Goblet Squat**, **Lunges**.
    - *Đùi sau & Mông (Hamstrings / Glutes):* Máy cuộn đùi sau (Leg Curl) ➔ **Romanian Deadlift (với tạ đơn/tạ đòn)**, **Cầu mông (Glute Bridge / Hip Thrust)**.
    - *Tay trước & Tay sau (Arms):* Máy/Cáp cuốn tay & kéo tay sau ➔ **Cuốn tạ đơn (Dumbbell Curls)**, **Chống đẩy tay hẹp (Diamond Push-ups)**, **Chống đẩy sau với ghế (Bench Dips)**.
  - Có nút chuyển nhanh **"Chế độ Không cần máy (Tạ tự do / Bodyweight)"** ngay đầu buổi tập để tự động đổi toàn bộ các bài dùng máy trong buổi đó sang bài tập không cần máy tương đương.

---

## 6. Phần giao cho người triển khai (What's Left to the Builder)

Các chi tiết kỹ thuật dưới đây được giao toàn quyền quyết định cho kỹ sư triển khai để tối ưu tốc độ và chất lượng:
- Cấu trúc bảng dữ liệu chi tiết trong SQLite / bộ nhớ cục bộ và cơ chế khởi tạo dữ liệu mẫu (Seed Data) cho thư viện món ăn Việt Nam & thư viện bài tập.
- Thiết kế Prompt hệ thống (System Prompt) và định dạng JSON Schema trả về từ Gemini Vision API sao cho lời nhận xét bằng tiếng Việt tự nhiên, khích lệ nhưng trung thực và chuẩn chuyên môn thể hình.
- Chế độ dự phòng thông minh (Smart Fallback): Nếu người dùng chưa nhập Gemini API Key hoặc đang mất kết nối mạng trong phòng tập, ứng dụng vẫn cho phép lưu/đối chiếu bộ ảnh Trước - Sau kèm tính toán chênh lệch cân nặng, số đo và hiển thị phân tích cơ bản dựa trên chỉ số, đồng thời cho phép bấm phân tích AI lại ngay khi có mạng/API Key.
- Các hiệu ứng chuyển cảnh mượt mà (spring animations, haptic feedback nhẹ trên iPhone) và việc áp dụng đầy đủ bộ quy chuẩn `impeccable` (`PRODUCT.md`, `DESIGN.md`, `craft-floor.md`).
