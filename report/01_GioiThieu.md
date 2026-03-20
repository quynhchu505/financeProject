# CHƯƠNG 1: GIỚI THIỆU

## 1.1 Đặt vấn đề

Trong bối cảnh nền kinh tế Việt Nam ngày càng phát triển, thu nhập bình quân đầu người không ngừng tăng lên, song song với đó là sự đa dạng trong hình thức chi tiêu và đầu tư. Theo số liệu từ Tổng cục Thống kê, tỷ lệ người dân có tài khoản ngân hàng đã đạt trên 70% vào năm 2024, cho thấy nhận thức tài chính của người dân đang dần được cải thiện. Tuy nhiên, việc quản lý tài chính cá nhân vẫn là một thách thức lớn đối với đa số người dân, đặc biệt là trong việc theo dõi chi tiêu, lập kế hoạch ngân sách và đưa ra quyết định tài chính hợp lý.

Thực trạng cho thấy nhiều người gặp khó khăn trong việc kiểm soát chi tiêu hàng tháng, dẫn đến tình trạng "lương tháng đầu tiên đã hết" hoặc không thể tích lũy được khoản tiết kiệm đáng kể. Nguyên nhân chính bao gồm: (1) thiếu công cụ theo dõi thu chi hiệu quả; (2) không có kiến thức chuyên sâu về quản lý tài chính; (3) khó khăn trong việc phân tích dữ liệu tài chính để đưa ra dự đoán; và (4) thiếu sự tư vấn kịp thời khi gặp vấn đề tài chính.

Các giải pháp quản lý tài chính cá nhân hiện có trên thị trường, dù đã cung cấp nhiều tính năng hữu ích, vẫn còn một số hạn chế đáng chú ý. Phần lớn các ứng dụng trong nước và quốc tế mới chỉ dừng lại ở mức ghi chép thu chi cơ bản, thiếu khả năng phân tích chuyên sâu, dự đoán xu hướng tài chính, và đặc biệt là thiếu sự hỗ trợ từ trí tuệ nhân tạo (AI) để cá nhân hóa trải nghiệm quản lý tài chính. Nhận thấy những hạn chế này, đề tài "Hệ thống Quản lý và Phân tích Tài chính Cá nhân Thông minh" được nghiên cứu và triển khai nhằm mang đến một giải pháp toàn diện, tích hợp AI vào quản lý tài chính cá nhân.

## 1.2 Mục tiêu đề tài

### 1.2.1 Mục tiêu chung

Xây dựng một hệ thống quản lý tài chính cá nhân thông minh, tích hợp các kỹ thuật trí tuệ nhân tạo để hỗ trợ người dùng theo dõi, phân tích và lập kế hoạch tài chính một cách hiệu quả.

### 1.2.2 Mục tiêu cụ thể

- **Quản lý giao dịch**: Cho phép người dùng ghi chép, phân loại và theo dõi thu chi một cách thuận tiện.
- **Phân loại giao dịch tự động bằng AI**: Sử dụng mô hình học máy để tự động phân loại giao dịch dựa trên mô tả, giảm thao tác thủ công cho người dùng.
- **Dự đoán dòng tiền**: Áp dụng mô hình dự đoán để đưa ra dự báo thu chi các tháng tiếp theo, giúp người dùng chủ động hơn trong kế hoạch tài chính.
- **Phát hiện chi tiêu bất thường**: Sử dụng thuật toán phát hiện bất thường để cảnh báo kịp thời khi chi tiêu vượt ngưỡng bình thường.
- **Chatbot tư vấn tài chính**: Xây dựng chatbot thông minh dựa trên kiến trúc RAG (Retrieval Augmented Generation) để tư vấn về các vấn đề tài chính cá nhân.
- **Báo cáo và trực quan hóa**: Cung cấp các báo cáo chi tiết và biểu đồ trực quan giúp người dùng nắm bắt tình hình tài chính.

## 1.3 Phạm vi nghiên cứu

### 1.3.1 Phạm vi chức năng

Hệ thống tập trung vào các chức năng cốt lõi của quản lý tài chính cá nhân:

- Quản lý tài khoản người dùng và các tài khoản tài chính (tiền mặt, ngân hàng, thẻ tín dụng).
- Quản lý giao dịch: thu, chi, chuyển khoản.
- Quản lý ngân sách theo danh mục và thời gian.
- Báo cáo thống kê theo ngày, tuần, tháng, năm.
- Tính năng AI: phân loại giao dịch tự động, dự đoán dòng tiền, phát hiện bất thường.
- Chatbot tư vấn tài chính 24/7.

### 1.3.2 Phạm vi công nghệ

- **Frontend**: React với TypeScript, sử dụng Vite làm build tool, Tailwind CSS cho giao diện.
- **Backend**: Python FastAPI cho REST API.
- **Database**: PostgreSQL cho dữ liệu quan hệ, Redis cho cache.
- **AI/ML**: scikit-learn cho các mô hình học máy, LangChain cho chatbot.
- **Authentication**: JWT (JSON Web Token).

### 1.3.3 Phạm vi hạn chế

- Hệ thống không kết nối trực tiếp với ngân hàng hoặc các dịch vụ tài chính bên thứ ba (sử dụng dữ liệu do người dùng nhập liệu thủ công).
- Chatbot tư vấn ở mức độ cơ bản, không thay thế cho lời khuyên tài chính chuyên nghiệp.
- Mô hình dự đoán dòng tiền dựa trên dữ liệu lịch sử của chính người dùng, cần tối thiểu 30 giao dịch để có kết quả đáng tin cậy.

## 1.4 Phương pháp nghiên cứu

### 1.4.1 Phương pháp nghiên cứu lý thuyết

- Nghiên cứu tổng quan về quản lý tài chính cá nhân, các nguyên tắc và phương pháp luận liên quan.
- Khảo cứu các công nghệ AI/ML hiện đại phù hợp với bài toán: supervised learning, unsupervised learning, NLP và LLM.
- Nghiên cứu các hệ thống tương tự trong và ngoài nước để rút kinh nghiệm thiết kế.

### 1.4.2 Phương pháp nghiên cứu thực tiễn

- Phân tích yêu cầu người dùng thông qua khảo sát thực tế.
- Thiết kế hệ thống theo phương pháp hướng đối tượng (UML).
- Triển khai và kiểm thử hệ thống theo mô hình phát triển phần mềm.

### 1.4.3 Công cụ và môi trường phát triển

- VS Code / PyCharm làm IDE chính.
- Git cho quản lý mã nguồn.
- Docker cho triển khai.
- PostgreSQL, Redis cho môi trường cơ sở dữ liệu.

## 1.5 Kết quả đạt được

Đề tài đã hoàn thành việc xây dựng một hệ thống hoàn chỉnh bao gồm:

1. **Hệ thống Backend FastAPI** với đầy đủ REST API cho quản lý tài khoản, giao dịch, danh mục, ngân sách, báo cáo, xác thực JWT.

2. **Hệ thống Frontend React** với giao diện người dùng trực quan, bao gồm Dashboard, Trang giao dịch, Trang ngân sách, Trang báo cáo và Chatbot.

3. **Bốn mô hình AI** được triển khai:
   - Mô hình phân loại giao dịch tự động (TF-IDF + Naive Bayes).
   - Mô hình dự đoán dòng tiền (Linear Regression với lag features).
   - Mô hình phát hiện bất thường (Isolation Forest).
   - Chatbot tư vấn tài chính (LangChain + RAG).

4. **Cơ sở dữ liệu PostgreSQL** thiết kế theo mô hình quan hệ chuẩn, đáp ứng đầy đủ yêu cầu lưu trữ và truy vấn.

5. **Docker Compose** cho phép triển khai toàn bộ hệ thống với một lệnh duy nhất.

6. **Báo cáo kỹ thuật** hoàn chỉnh gồm 7 chương, trình bày đầy đủ lý thuyết, thiết kế và triển khai.

## 1.6 Cấu trúc báo cáo

Báo cáo được tổ chức thành 7 chương với cấu trúc như sau:

- **Chương 1: Giới thiệu** - Đặt vấn đề, mục tiêu, phạm vi, phương pháp nghiên cứu, kết quả đạt được.
- **Chương 2: Cơ sở lý thuyết và công nghệ** - Tổng quan quản lý tài chính cá nhân, các khái niệm AI/ML, công nghệ sử dụng, khảo sát hệ thống tương tự.
- **Chương 3: Phân tích và yêu cầu hệ thống** - Khảo sát thực tế, yêu cầu chức năng, yêu cầu phi chức năng, sơ đồ use-case.
- **Chương 4: Thiết kế hệ thống** - Thiết kế kiến trúc, cơ sở dữ liệu, API, giao diện và thuật toán AI.
- **Chương 5: Triển khai và cài đặt** - Cấu trúc dự án, triển khai Backend, Frontend, AI modules và Docker.
- **Chương 6: Kiểm thử và đánh giá** - Kế hoạch kiểm thử, kiểm thử đơn vị, tích hợp, đánh giá mô hình AI.
- **Chương 7: Kết luận và hướng phát triển** - Tổng kết, hạn chế, hướng phát triển tiếp theo.
