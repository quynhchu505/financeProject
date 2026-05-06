# Checklist hoàn thiện hệ thống

> Nguồn bám theo: `BaoCao_ChuVanQuynh.md`
>
> Phạm vi: chỉ gồm các đầu việc liên quan tới code, không gồm báo cáo, slide, thuyết trình.
>
> Quy ước: `[ ]` chưa hoàn thành, `[~]` đang làm, `[x]` đã hoàn thành.
>
> Scan codebase cập nhật: `2026-05-06`
>
> Tiêu chí scan: `[x]` đã có code chạy cho luồng chính, `[~]` có code nhưng còn thiếu hoặc lệch chuẩn checklist, `[ ]` chưa thấy triển khai trong repo.

## 1. Nền tảng backend và cơ sở dữ liệu

- [x] Chuẩn hóa cấu hình `FastAPI`, `settings`, `.env`, tách rõ môi trường dev/prod.
- [x] Bổ sung migration bằng `Alembic`, không phụ thuộc vào `Base.metadata.create_all()`.
- [x] Chuẩn hóa schema database cho các bảng: `users`, `accounts`, `categories`, `transactions`, `budgets`, `alerts`, `ml_logs`, `chat_sessions`.
- [x] Thiết lập index cho các trường truy vấn nhiều: `user_id`, `date`, `category_id`, `account_id`.
- [x] Bổ sung seed dữ liệu mặc định cho danh mục hệ thống khi user mới tạo tài khoản.
- [x] Chuẩn hóa response lỗi toàn hệ thống: `400`, `401`, `403`, `404`, `422`, `500`.
- [ ] Tách rõ service layer, repository/query layer và route layer để dễ bảo trì.
- [x] Thêm kiểm tra health cho database, Redis, Ollama/LLM.

## 2. Xác thực, phân quyền và bảo mật

- [x] Hoàn thiện đăng ký tài khoản với validate email, mật khẩu, tên người dùng.
- [x] Hoàn thiện đăng nhập JWT và endpoint lấy thông tin người dùng hiện tại.
- [x] Bổ sung refresh token hoặc cơ chế gia hạn phiên đăng nhập an toàn.
- [x] Hash mật khẩu bằng `bcrypt` với cấu hình ổn định cho production.
- [x] Chặn toàn bộ truy cập chéo dữ liệu giữa các user ở tất cả API.
- [x] Kiểm tra quyền sở hữu trước khi xem/sửa/xóa `account`, `category`, `transaction`, `budget`, `chat session`.
- [x] Ẩn các secret trong log và không trả dữ liệu nhạy cảm ra client.
- [x] Bổ sung rate limit cho các endpoint nhạy cảm như `login`, `chatbot`, `ai`.

## 3. Module tài khoản tài chính

- [x] Hoàn thiện CRUD tài khoản tài chính: ví tiền mặt, ngân hàng, tiết kiệm, thẻ.
- [x] Validate loại tài khoản hợp lệ và dữ liệu đầu vào.
- [x] Tự động cập nhật số dư tài khoản khi tạo giao dịch thu/chi.
- [x] Hoàn thiện nghiệp vụ chuyển tiền giữa hai tài khoản.
- [x] Đảm bảo số dư không bị sai lệch khi sửa hoặc xóa giao dịch liên quan.

## 4. Module danh mục giao dịch

- [x] Hoàn thiện CRUD danh mục giao dịch tùy chỉnh của người dùng.
- [x] Khởi tạo bộ danh mục hệ thống mặc định bằng tiếng Việt.
- [x] Hỗ trợ icon, màu sắc, danh mục cha/con nếu dùng trong UI.
- [x] Chặn xóa danh mục đang được liên kết với giao dịch hoặc ngân sách nếu chưa xử lý ràng buộc.

## 5. Module giao dịch

- [x] Hoàn thiện thêm giao dịch thu/chi với validate `amount > 0`.
- [x] Gắn giao dịch với đúng `account`, `category`, `user`.
- [x] Hỗ trợ AI gợi ý danh mục ngay khi nhập mô tả giao dịch.
- [x] Hoàn thiện danh sách giao dịch có lọc theo tài khoản, danh mục, loại giao dịch, thời gian.
- [x] Bổ sung tìm kiếm giao dịch theo từ khóa mô tả.
- [x] Bổ sung phân trang và sắp xếp theo ngày tạo / ngày giao dịch.
- [x] Hoàn thiện xem chi tiết giao dịch.
- [x] Hoàn thiện chỉnh sửa giao dịch và đồng bộ lại số dư tài khoản.
- [x] Hoàn thiện xóa giao dịch theo nghiệp vụ an toàn.
- [x] Ghi nhận trạng thái giao dịch được AI phân loại hay người dùng chọn thủ công.
- [x] Cập nhật Dashboard ngay sau khi tạo/sửa/xóa giao dịch.

## 6. Module ngân sách và cảnh báo

- [x] Hoàn thiện tạo ngân sách theo danh mục.
- [x] Hỗ trợ chu kỳ ngân sách `weekly`, `monthly`, `yearly` hoặc theo phạm vi đã chốt của hệ thống.
- [x] Tính toán số đã chi, số còn lại, phần trăm sử dụng ngân sách.
- [x] Cảnh báo khi vượt 80% ngân sách.
- [x] Cảnh báo khi vượt 100% ngân sách.
- [x] Hoàn thiện sửa và xóa ngân sách.
- [x] Đồng bộ cảnh báo ngân sách lên Dashboard.
- [x] Bổ sung gửi email/thông báo nội bộ khi vượt ngưỡng ngân sách.

## 7. Dashboard và báo cáo

- [x] Hoàn thiện Dashboard tổng quan: tổng số dư, tổng thu, tổng chi, tỷ lệ tiết kiệm.
- [x] Hiển thị top danh mục chi tiêu trong kỳ.
- [x] Hiển thị giao dịch gần đây.
- [x] Hiển thị cảnh báo ngân sách và cảnh báo bất thường.
- [x] Hoàn thiện báo cáo thu/chi theo tháng.
- [x] Hoàn thiện báo cáo chi tiêu theo danh mục.
- [x] Bổ sung biểu đồ trực quan bằng `Chart.js` cho xu hướng tài chính.
- [x] So sánh dữ liệu nhiều tháng để hỗ trợ phân tích xu hướng.
- [x] Bổ sung xuất báo cáo dạng `CSV`.
- [x] Bổ sung xuất báo cáo dạng `PDF`.

## 8. AI phân loại giao dịch

- [~] Hoàn thiện pipeline tiền xử lý mô tả giao dịch tiếng Việt.
- [x] Huấn luyện mô hình `TF-IDF + Multinomial Naive Bayes`.
- [x] Hoàn thiện endpoint gợi ý danh mục từ mô tả giao dịch.
- [x] Trả về `category_id`, tên danh mục và `confidence score`.
- [x] Thiết lập ngưỡng confidence để quyết định auto-fill hay chỉ gợi ý.
- [x] Lưu log dự đoán để phục vụ đánh giá mô hình và cải thiện dữ liệu.
- [x] Bổ sung cơ chế người dùng feedback khi AI phân loại sai.
- [x] Bổ sung chức năng huấn luyện lại mô hình từ dữ liệu người dùng khi đủ mẫu.
- [~] Kiểm tra thời gian phản hồi AI phân loại dưới ngưỡng mục tiêu.

## 9. AI dự đoán dòng tiền

- [x] Chuẩn hóa dữ liệu lịch sử giao dịch theo tháng để làm input dự báo.
- [~] Xây dựng feature engineering cho thu nhập, chi tiêu, xu hướng và mùa vụ.
- [~] Huấn luyện mô hình `Linear Regression` cho dự đoán dòng tiền.
- [x] Hoàn thiện endpoint dự đoán cho các mốc `30/60/90 ngày` hoặc `1-3 tháng`.
- [x] Kiểm tra điều kiện tối thiểu về dữ liệu trước khi cho phép dự đoán.
- [x] Trả về dữ liệu dự báo kèm `confidence` hoặc khoảng tin cậy.
- [x] Vẽ biểu đồ so sánh dữ liệu thực tế và dữ liệu dự báo trên frontend.
- [x] Bổ sung thông báo fallback khi dữ liệu lịch sử chưa đủ.
- [x] Ghi nhận chỉ số đánh giá mô hình như `MAE`, `RMSE`, `R²`.

## 10. AI phát hiện bất thường

- [~] Xây dựng feature cho phát hiện bất thường: số tiền, thời điểm, tần suất, danh mục.
- [x] Huấn luyện mô hình `Isolation Forest`.
- [x] Hoàn thiện cơ chế quét giao dịch theo batch job định kỳ.
- [x] Định nghĩa ngưỡng `anomaly score` để tạo cảnh báo.
- [x] Lưu cảnh báo bất thường vào bảng `alerts`.
- [~] Hiển thị cảnh báo bất thường trên Dashboard và trang chi tiết.
- [x] Phân mức độ cảnh báo `low`, `medium`, `high`.
- [x] Cho phép người dùng phản hồi "bình thường" hoặc "cần điều tra" để cải thiện mô hình.
- [~] Bổ sung gửi email/thông báo khi phát hiện giao dịch bất thường.

## 11. Chatbot tư vấn tài chính

- [x] Hoàn thiện service chatbot dùng `LangChain` kết hợp `Ollama` hoặc provider đã chọn.
- [x] Xây dựng context từ dữ liệu tài chính cá nhân của user.
- [x] Giới hạn chatbot chỉ truy xuất dữ liệu của đúng người dùng đang đăng nhập.
- [x] Thiết kế prompt trả lời bằng tiếng Việt, đúng ngữ cảnh tài chính cá nhân.
- [x] Hoàn thiện API chat và quản lý session chat.
- [x] Lưu lịch sử hội thoại theo session.
- [x] Bổ sung câu hỏi gợi ý nhanh trên giao diện chat.
- [x] Thiết lập fallback khi LLM không khả dụng hoặc timeout.
- [x] Bảo đảm dữ liệu nhạy cảm không bị đẩy ra ngoài ngoài cấu hình cho phép.

## 12. Frontend và trải nghiệm người dùng

- [x] Hoàn thiện trang đăng nhập / đăng ký.
- [x] Hoàn thiện layout chính có điều hướng giữa `Dashboard`, `Giao dịch`, `Ngân sách`, `Báo cáo`, `Chatbot`.
- [x] Hoàn thiện trang danh sách giao dịch với filter, search, phân trang.
- [x] Hoàn thiện form thêm giao dịch có debounce gọi AI classify.
- [x] Hoàn thiện trang ngân sách với progress bar và trạng thái cảnh báo.
- [x] Hoàn thiện trang báo cáo với biểu đồ và bộ lọc kỳ thời gian.
- [x] Hoàn thiện trang chatbot với session list và vùng hội thoại.
- [x] Đồng bộ kiểu dữ liệu TypeScript với schema backend.
- [~] Chuẩn hóa xử lý loading, empty state, error state, success toast.
- [x] Tối ưu responsive cho mobile/tablet theo yêu cầu báo cáo.
- [~] Hoàn thiện i18n/giao diện tiếng Việt đồng bộ toàn bộ hệ thống.

## 13. Logging, monitoring và vận hành

- [x] Thiết lập logging theo cấp độ `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.
- [x] Gắn request id hoặc correlation id để trace lỗi theo request.
- [~] Log các sự kiện nghiệp vụ chính: đăng nhập, tạo giao dịch, vượt ngân sách, lỗi AI.
- [x] Hoàn thiện endpoint `/health`.
- [x] Hoàn thiện endpoint `/metrics` cho Prometheus.
- [x] Bổ sung custom metrics cho thời gian phản hồi API, AI classify, chatbot, anomaly detection.
- [x] Tạo dashboard Grafana cho API, database, AI, business metrics.
- [x] Thiết lập alert rules cho downtime, latency cao, lỗi tăng đột biến.

## 14. Kiểm thử chất lượng

- [~] Viết unit test cho service auth, giao dịch, ngân sách, AI modules.
- [x] Viết integration test cho các API chính.
- [ ] Viết test cho luồng thêm giao dịch có AI phân loại.
- [x] Viết test cho luồng cập nhật số dư tài khoản sau giao dịch.
- [x] Viết test cho luồng cảnh báo ngân sách.
- [ ] Viết test cho luồng dự đoán dòng tiền khi đủ và không đủ dữ liệu.
- [~] Viết test cho luồng phát hiện bất thường.
- [x] Viết test cho chatbot API và fallback.
- [x] Bổ sung test frontend cho form, bảng dữ liệu, biểu đồ và điều hướng.

## 15. Docker, deploy và môi trường production

- [x] Hoàn thiện `Dockerfile` cho frontend và backend.
- [x] Hoàn thiện `docker-compose` cho `frontend`, `backend`, `postgres`, `redis`.
- [x] Tách cấu hình dev/prod trong file compose nếu cần.
- [x] Hoàn thiện reverse proxy `Nginx` cho frontend và API backend.
- [~] Quản lý biến môi trường production an toàn.
- [x] Mount volume cho database và model AI để tránh mất dữ liệu khi restart.
- [~] Bổ sung script khởi tạo môi trường, migrate DB và seed dữ liệu.
- [ ] Kiểm tra luồng deploy thực tế trên server/EC2.

## 16. Ngoài phạm vi checklist hiện tại

- [x] Không đưa `OCR hóa đơn` vào checklist bản này nếu chưa chốt phạm vi code triển khai.
- [x] Không đưa `Open Banking` vào checklist bản này nếu hệ thống vẫn ở phiên bản nhập liệu thủ công.
