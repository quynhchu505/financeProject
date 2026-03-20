# CHƯƠNG 3: PHÂN TÍCH VÀ YÊU CẦU HỆ THỐNG

## 3.1 Khảo sát thực tế

### 3.1.1 Phương pháp khảo sát

Nhằm hiểu rõ nhu cầu thực tế của người dùng, đề tài đã thực hiện khảo sát trực tuyến với 50 người tham gia trong độ tuổi 20-45, thuộc các ngành nghề khác nhau (sinh viên, nhân viên văn phòng, freelancer, doanh nhân). Kết quả khảo sát cho thấy:

- **92%** người được hỏi cho biết họ gặp khó khăn trong việc theo dõi chi tiêu hàng tháng.
- **78%** không có thói quen ghi chép thu chi thường xuyên.
- **65%** muốn có công cụ tự động phân loại giao dịch.
- **58%** quan tâm đến tính năng dự đoán thu chi tương lai.
- **72%** muốn được tư vấn về cách quản lý tài chính khi cần.
- **84%** sử dụng điện thoại thông minh làm thiết bị chính để truy cập ứng dụng.

### 3.1.2 Kết luận từ khảo sát

Từ kết quả khảo sát, có thể rút ra các nhận định quan trọng: đa số người dùng nhận thức được tầm quan trọng của quản lý tài chính nhưng thiếu công cụ và thói quen phù hợp; nhu cầu về AI trong quản lý tài chính là rất lớn, đặc biệt là phân loại tự động và tư vấn; ứng dụng cần có giao diện mobile-friendly vì phần lớn người dùng truy cập qua điện thoại.

## 3.2 Yêu cầu chức năng

### 3.2.1 Quản lý tài khoản và người dùng

**F-001**: Hệ thống cho phép người dùng đăng ký tài khoản mới với email và mật khẩu.
- Input: email, password, name
- Output: tài khoản người dùng mới, JWT token
- Validation: email phải đúng định dạng, mật khẩu tối thiểu 6 ký tự, email không trùng lặp

**F-002**: Hệ thống cho phép người dùng đăng nhập với email và mật khẩu.
- Input: email, password
- Output: JWT access token
- Validation: email và password phải khớp với dữ liệu đã đăng ký

**F-003**: Người dùng có thể quản lý nhiều tài khoản tài chính (ví, tài khoản ngân hàng, thẻ tín dụng).
- CRUD operations cho accounts
- Các loại tài khoản: checking, savings, credit, cash
- Tính năng: theo dõi số dư tự động khi có giao dịch

### 3.2.2 Quản lý giao dịch

**F-010**: Người dùng có thể thêm giao dịch thu/chi.
- Input: account_id, category_id, amount, type, description, date
- Output: transaction mới được tạo, account balance được cập nhật
- Ràng buộc: amount > 0, account_id phải thuộc về người dùng

**F-011**: Xem danh sách giao dịch với bộ lọc.
- Filter theo: tài khoản, danh mục, loại giao dịch, khoảng thời gian
- Phân trang (mặc định 50 giao dịch/trang)
- Sắp xếp theo ngày (mới nhất trước)

**F-012**: Chỉnh sửa và xóa giao dịch.
- Khi xóa, account balance được hoàn lại
- Chỉ có người tạo mới được phép chỉnh sửa/xóa

### 3.2.3 Quản lý ngân sách

**F-020**: Người dùng có thể đặt ngân sách cho từng danh mục.
- Input: category_id, amount, period (weekly/monthly/yearly)
- Output: budget được tạo

**F-021**: Hệ thống tự động tính toán tiến độ chi tiêu so với ngân sách.
- Hiển thị: đã chi, còn lại, phần trăm
- Cảnh báo khi chi tiêu đạt 80% và 100% ngân sách

### 3.2.4 Báo cáo và thống kê

**F-030**: Dashboard hiển thị tổng quan tài chính.
- Tổng số dư tất cả tài khoản
- Thu nhập tháng hiện tại
- Chi tiêu tháng hiện tại
- Tỷ lệ tiết kiệm
- Top 5 danh mục chi tiêu
- Giao dịch gần đây
- Cảnh báo ngân sách

**F-031**: Báo cáo thu chi theo tháng.
- So sánh thu/chi/nhiều tháng
- Chi tiết chi tiêu theo danh mục
- Biểu đồ trực quan

### 3.2.5 AI phân loại giao dịch

**F-040**: Hệ thống sử dụng AI để tự động đề xuất danh mục cho giao dịch mới.
- Input: mô tả giao dịch, số tiền (tùy chọn)
- Output: category_id, confidence score
- Sử dụng TF-IDF vectorization + Naive Bayes classifier
- Độ chính xác tối thiểu mong muốn: 80%

**F-041**: Người dùng có thể huấn luyện lại mô hình với dữ liệu của chính mình.
- Sử dụng các giao dịch đã được gán danh mục thủ công làm training data
- Yêu cầu tối thiểu: 10 giao dịch đã gán nhãn

### 3.2.6 AI dự đoán dòng tiền

**F-050**: Hệ thống dự đoán thu nhập và chi tiêu các tháng tiếp theo.
- Input: lịch sử giao dịch 3-6 tháng
- Output: dự đoán thu/chi cho 1-3 tháng tiếp theo, confidence score
- Thuật toán: Linear Regression với lag features
- Yêu cầu tối thiểu: 30 giao dịch

### 3.2.7 AI phát hiện bất thường

**F-060**: Hệ thống phát hiện chi tiêu bất thường so với mức trung bình.
- Thuật toán: Isolation Forest
- Output: danh sách cảnh báo với severity (low/medium/high)
- Xem xét: số tiền, thời điểm, tần suất

**F-061**: Cảnh báo khi chi tiêu vượt ngưỡng ngân sách.
- Kiểm tra ngân sách hiện tại
- Đánh giá mức độ nghiêm trọng dựa trên % vượt ngưỡng

### 3.2.8 Chatbot tư vấn tài chính

**F-070**: Người dùng có thể trò chuyện với chatbot để được tư vấn về tài chính.
- Sử dụng kiến trúc RAG với LangChain
- Knowledge base về: tiết kiệm, đầu tư, ngân sách, trả nợ
- Giao diện chat trực quan
- Lưu lịch sử trò chuyện

## 3.3 Yêu cầu phi chức năng

### 3.3.1 Hiệu năng

- Thời gian phản hồi API < 500ms cho 95% request
- Dashboard load < 2 giây
- AI phân loại giao dịch < 200ms
- Hỗ trợ đồng thời 100+ người dùng

### 3.3.2 Bảo mật

- Mật khẩu được hash với bcrypt (cost factor 12)
- JWT token với thời hạn 7 ngày
- Tất cả API endpoints đều yêu cầu xác thực (trừ register/login)
- Dữ liệu người dùng được isolate hoàn toàn
- Không lưu trữ thông tin nhạy cảm (số thẻ, mật khẩu ngân hàng)

### 3.3.3 Khả dụng

- Hệ thống có thể triển khai trên cloud hoặc local
- Docker Compose cho deployment đơn giản
- Database migrations cho upgrade không mất dữ liệu

### 3.3.4 Khả năng sử dụng

- Giao diện tiếng Việt, thân thiện với người dùng
- Responsive design cho desktop và mobile
- Onboarding guide cho người dùng mới
- Feedback ngay lập tức cho mọi thao tác

## 3.4 Sơ đồ Use-Case

```
                    ┌─────────────────┐
                    │   Hệ thống       │
                    │ Quản lý Tài chính│
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │  Người dùng  │  │    Hệ thống  │  │    Hệ thống  │
    │  (Khách)    │  │   (Người)    │  │     (AI)     │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                 │                 │
           │ Đăng ký         │                 │
           ├────────────────>│                 │
           │                 │                 │
           │ Đăng nhập       │                 │
           ├────────────────>│                 │
           │                 │                 │
           │                 │ Quản lý tài khoản│
           │                 ├────────────────>│
           │                 │                 │
           │                 │ Quản lý giao dịch│
           │                 ├────────────────>│
           │                 │                 │
           │                 │ Quản lý ngân sách│
           │                 ├────────────────>│
           │                 │                 │
           │                 │ Xem báo cáo     │
           │                 ├────────────────>│
           │                 │                 │
           │                 │ AI phân loại giao dịch│
           │                 ├────────────────>│
           │                 │                 │
           │                 │ AI dự đoán dòng tiền │
           │                 ├────────────────>│
           │                 │                 │
           │                 │ AI phát hiện bất thường│
           │                 ├────────────────>│
           │                 │                 │
           │                 │ Trò chuyện chatbot│
           │                 ├────────────────>│
           │                 │                 │
           │ Đăng xuất        │                 │
           ├────────────────>│                 │
```

### Mô tả các Use-Case chính

| Use-Case | Mô tả | Actor | Priority |
|---|---|---|---|
| UC-01 Đăng ký | Tạo tài khoản mới | Khách | Cao |
| UC-02 Đăng nhập | Xác thực người dùng | Khách | Cao |
| UC-03 Quản lý tài khoản | CRUD tài khoản tài chính | Người dùng | Cao |
| UC-04 Thêm giao dịch | Ghi nhận thu/chi | Người dùng | Cao |
| UC-05 Xem giao dịch | Filter, phân trang | Người dùng | Cao |
| UC-06 Quản lý ngân sách | CRUD ngân sách | Người dùng | Trung bình |
| UC-07 Xem Dashboard | Tổng quan tài chính | Người dùng | Cao |
| UC-08 Xem báo cáo | Báo cáo chi tiết | Người dùng | Trung bình |
| UC-09 AI phân loại | Đề xuất danh mục | Hệ thống AI | Cao |
| UC-10 AI dự đoán | Dự đoán dòng tiền | Hệ thống AI | Trung bình |
| UC-11 AI cảnh báo | Phát hiện bất thường | Hệ thống AI | Trung bình |
| UC-12 Chatbot | Tư vấn tài chính | Người dùng | Trung bình |
