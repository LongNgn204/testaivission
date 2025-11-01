# PHÂN TÍCH KIẾN TRÚC KỸ THUẬT

## 1. Phân tích cấu trúc dự án
Dự án này có cấu trúc thư mục như sau:
- **src/**: Thư mục chính chứa mã nguồn của ứng dụng.
- **components/**: Chứa các component React.
- **context/**: Chứa các context để quản lý trạng thái toàn cục.
- **services/**: Chứa các dịch vụ cho việc tích hợp AI và quản lý dữ liệu.
- **pages/**: Chứa các trang chính của ứng dụng.

## 2. Phân tích công nghệ
Dự án sử dụng các công nghệ sau:
- **React 19**: Thư viện để xây dựng giao diện người dùng.
- **TypeScript**: Ngôn ngữ lập trình với kiểu tĩnh giúp phát hiện lỗi sớm.
- **Vite**: Công cụ xây dựng nhanh chóng cho ứng dụng web.
- **Gemini AI**: Nền tảng AI để tích hợp các tính năng thông minh.
- **Web Speech API**: API cho phép nhận diện và tổng hợp giọng nói.

## 3. Kiến trúc
Dự án sử dụng các mô hình kiến trúc sau:
- **Context API**: Quản lý trạng thái toàn cục qua các context.
- **Services**: Tách biệt logic nghiệp vụ ra khỏi component.
- **Hooks**: Sử dụng hooks để tái sử dụng logic.

## 4. Giải thích luồng dữ liệu
- **LocalStorage persistence**: Dữ liệu được lưu trữ trong LocalStorage để duy trì trạng thái.
- **User authentication**: Xác thực người dùng qua token.
- **Test history**: Lưu giữ lịch sử test để người dùng xem lại.

## 5. Chi tiết tích hợp AI
- **Gemini API usage**: Gọi API Gemini để xử lý yêu cầu.
- **Voice synthesis**: Sử dụng Web Speech API để tổng hợp giọng nói cho phản hồi.
- **Speech recognition**: Nhận diện giọng nói để tương tác với người dùng.

## 6. Cấu trúc và mối quan hệ component
- **Chatbot**: Component chính cho giao tiếp với AI.
- **VisionCoach**: Trợ lý nổi giúp người dùng.

## 7. Chiến lược quản lý trạng thái
Sử dụng Context API để quản lý trạng thái toàn cục và hooks để xử lý logic trong component.

## 8. Giải thích mục đích từng file chính
- **services/aiService.ts**: Tích hợp AI với Gemini.
- **services/storageService.ts**: Bọc LocalStorage để quản lý dữ liệu.
- **services/reminderService.ts**: Logic gamification cho nhắc nhở.
- **context/LanguageContext.tsx**: Quản lý ngôn ngữ i18n.
- **context/ThemeContext.tsx**: Quản lý chế độ tối.
- **context/RoutineContext.tsx**: Theo dõi thói quen hàng ngày.
- **components/Chatbot.tsx**: Component chat AI giọng nói.
- **components/VisionCoach.tsx**: Trợ lý nổi.
- **All test components**: Các component kiểm tra thị lực và màu sắc.
- **pages/Home.tsx**: Bảng điều khiển với thông tin AI.
- **pages/ProgressPage.tsx**: Phân tích và theo dõi tiến bộ.
- **pages/RemindersPage.tsx**: Trung tâm gamification.