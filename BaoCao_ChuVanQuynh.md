

**TRƯỜNG ĐẠI HỌC THỦY LỢI**

**KHOA CÔNG NGHỆ THÔNG TIN**

**ĐỒ ÁN TỐT NGHIỆP**

**BÁO CÁO PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG**

**XÂY DỰNG HỆ THỐNG QUẢN LÝ VÀ PHÂN TÍCH**

**TÀI CHÍNH CÁ NHÂN THÔNG MINH**

**Sinh viên thực hiện:** Chu Văn Quỳnh

**Lớp:** 64HTTT4

**MSV:** 2251162133

**GVHD:** ThS. Nguyễn Thị Phương Thảo

**Hà Nội, năm 2025**

**LỜI CẢM ƠN**

Để hoàn thành đồ án tốt nghiệp với đề tài "Xây dựng Hệ thống Quản lý và Phân tích Tài chính Cá nhân Thông minh", em đã nhận được sự hỗ trợ, hướng dẫn tận tình và những lời khuyên quý báu từ nhiều thầy cô, gia đình và bạn bè trong suốt quá trình thực hiện.

Trước tiên, em xin bày tỏ lòng biết ơn sâu sắc và chân thành nhất tới ThS. Nguyễn Thị Phương Thảo – Giảng viên hướng dẫn đồ án của em. Cô đã dành rất nhiều thời gian và tâm huyết để định hướng nghiên cứu, tận tình chỉ bảo về phương pháp luận, kiểm tra và góp ý chi tiết cho từng chương nội dung trong suốt quá trình xây dựng hệ thống. Những nhận xét sâu sắc, những câu hỏi gợi mở và sự động viên kịp thời của cô đã giúp em vượt qua nhiều khó khăn về mặt kỹ thuật lẫn tư duy hệ thống, đồng thời định hướng cho em cách tiếp cận bài toán một cách bài bản và khoa học nhất.

Em xin trân trọng cảm ơn Ban Giám hiệu Trường Đại học Thủy Lợi, Ban chủ nhiệm Khoa Công nghệ Thông tin và toàn thể quý thầy cô trong khoa đã tạo điều kiện thuận lợi, cung cấp nền tảng kiến thức vững chắc trong suốt bốn năm học tập tại trường. Những môn học về Phân tích Thiết kế Hệ thống, Cơ sở dữ liệu, Lập trình Web và Trí tuệ nhân tạo đã trực tiếp đóng góp vào nền tảng kiến thức để em hoàn thành đồ án này.

Em cũng xin gửi lời cảm ơn tới gia đình đã luôn là chỗ dựa vững chắc, bạn bè và đồng nghiệp đã chia sẻ kiến thức, kinh nghiệm và cùng thảo luận trong quá trình nghiên cứu và phát triển hệ thống.

Mặc dù đã cố gắng hết sức, đồ án chắc chắn còn nhiều hạn chế và thiếu sót. Em rất mong nhận được sự chỉ bảo, đóng góp ý kiến của quý thầy cô để đồ án được hoàn thiện hơn và có thể phát triển thêm trong tương lai.

*Hà Nội, tháng 6 năm 2025*

**Sinh viên thực hiện**

**Chu Văn Quỳnh**

**MỤC LỤC**

**DANH MỤC BẢNG BIỂU**

Bảng 2.1: Danh sách các Use Case của hệ thống

Bảng 2.2: Đặc tả Use Case UC-04 – Thêm mới giao dịch có AI phân loại

Bảng 2.3: Đặc tả Use Case UC-12 – Xem báo cáo dự đoán dòng tiền

Bảng 2.4: Đặc tả Use Case UC-13 – Cảnh báo giao dịch bất thường

Bảng 2.5: Đặc tả Use Case UC-14 – Tương tác Chatbot tư vấn

Bảng 3.1: Đặc tả bảng Users

Bảng 3.2: Đặc tả bảng Categories

Bảng 3.3: Đặc tả bảng Transactions

Bảng 3.4: Đặc tả bảng Budgets

Bảng 3.5: Đặc tả bảng ML\_Logs

Bảng 3.6: Đặc tả bảng Alerts

Bảng 4.1: Đặc tả Sequence Diagram – Phân loại giao dịch

Bảng 5.1: Mô tả màn hình Đăng nhập

Bảng 5.2: Mô tả màn hình Dashboard

Bảng 5.3: Mô tả màn hình Thêm giao dịch

Bảng 5.4: Mô tả màn hình Báo cáo

Bảng 5.5: Mô tả màn hình Chatbot

Bảng 6.1: Xử lý lỗi Database

Bảng 6.2: Fallback Ollama

Bảng 6.3: Xử lý Redis failure

Bảng 6.4: Token Revocation

Bảng 6.5: Lỗi import CSV

Bảng 7.1: Log Levels

Bảng 7.2: Health Check Endpoints

Bảng 7.3: Danh sách Metrics Prometheus

Bảng 7.4: Grafana Dashboards

Bảng 7.5: Alert Rules

# **MỞ ĐẦU**

## **1\. Lý do chọn đề tài**

Trong bối cảnh chuyển đổi số diễn ra mạnh mẽ trên toàn cầu, đặc biệt tại Việt Nam với tốc độ phổ biến của smartphone và các ứng dụng tài chính ngày càng tăng, nhu cầu quản lý tài chính cá nhân một cách hiệu quả và thông minh trở nên cấp thiết hơn bao giờ hết. Theo thống kê của Ngân hàng Nhà nước Việt Nam năm 2023, tỷ lệ người dùng dịch vụ tài chính kỹ thuật số đã vượt mức 70% dân số trưởng thành, cho thấy sự sẵn sàng tiếp cận công nghệ tài chính của cộng đồng.

Tuy nhiên, thực tế hiện nay cho thấy phần lớn người dùng cá nhân vẫn đang quản lý tài chính bằng các phương pháp thủ công như ghi chép trong sổ tay, sử dụng bảng tính Microsoft Excel hay Google Sheets. Những phương pháp này tuy đơn giản nhưng bộc lộ nhiều hạn chế nghiêm trọng: dữ liệu phân tán, thiếu khả năng phân tích tự động, không thể dự báo xu hướng chi tiêu trong tương lai, và đặc biệt không thể phát hiện các bất thường tài chính một cách kịp thời.

Sự phát triển vượt bậc của trí tuệ nhân tạo (AI) và học máy (Machine Learning – ML) trong thập kỷ gần đây đã mở ra những khả năng hoàn toàn mới cho bài toán quản lý tài chính cá nhân. Các thuật toán như Naive Bayes có thể tự động phân loại giao dịch dựa trên mô tả văn bản; Linear Regression có thể dự đoán xu hướng thu chi trong tương lai; Isolation Forest có thể phát hiện các giao dịch bất thường tiềm ẩn nguy cơ tài chính. Bên cạnh đó, sự xuất hiện của các mô hình ngôn ngữ lớn (LLM) cùng các framework như LangChain và Ollama cho phép tích hợp chatbot tư vấn tài chính thông minh.

Xuất phát từ thực tiễn trên, em lựa chọn đề tài "Xây dựng Hệ thống Quản lý và Phân tích Tài chính Cá nhân Thông minh" với mong muốn xây dựng một giải pháp phần mềm hoàn chỉnh, tích hợp AI/ML, giúp người dùng Việt Nam quản lý tài chính cá nhân một cách hiệu quả, thông minh và tiện lợi hơn.

## **2\. Mục tiêu nghiên cứu**

Đồ án tốt nghiệp này đặt ra các mục tiêu nghiên cứu cụ thể như sau:

* Tìm hiểu và hệ thống hóa kiến thức về quản lý tài chính cá nhân, bao gồm các quy tắc tài chính phổ biến (quy tắc 50/30/20), các phương pháp theo dõi thu chi và lập ngân sách cá nhân.

* Nghiên cứu và áp dụng các thuật toán Machine Learning phù hợp: Multinomial Naive Bayes cho bài toán phân loại văn bản giao dịch, Linear Regression cho bài toán dự đoán chuỗi thời gian tài chính, và Isolation Forest cho bài toán phát hiện bất thường (anomaly detection).

* Xây dựng hệ thống web hoàn chỉnh với kiến trúc Client-Server hiện đại, trong đó Frontend sử dụng React, TypeScript, Vite và Chart.js; Backend sử dụng Python FastAPI với xác thực JWT và PostgreSQL làm cơ sở dữ liệu quan hệ.

* Tích hợp chatbot tư vấn tài chính sử dụng LangChain kết hợp Ollama (mô hình ngôn ngữ chạy cục bộ) để đảm bảo tính bảo mật dữ liệu người dùng.

* Lập tài liệu phân tích và thiết kế hệ thống đầy đủ, bao gồm đặc tả yêu cầu, thiết kế kiến trúc, thiết kế cơ sở dữ liệu và thiết kế giao diện người dùng.

## **3\. Đối tượng và phạm vi nghiên cứu**

### **3.1. Đối tượng nghiên cứu**

Đồ án tập trung nghiên cứu và giải quyết các vấn đề sau:

* Các bài toán nghiệp vụ trong quản lý tài chính cá nhân: theo dõi thu chi, lập và kiểm soát ngân sách, phân tích báo cáo tài chính.

* Các thuật toán học máy ứng dụng trong lĩnh vực tài chính: phân loại văn bản, dự báo chuỗi thời gian, phát hiện bất thường.

* Công nghệ xây dựng ứng dụng web hiện đại: React ecosystem, FastAPI, PostgreSQL, Docker.

* Tích hợp mô hình ngôn ngữ lớn vào ứng dụng: LangChain framework, Ollama local LLM deployment.

### **3.2. Phạm vi nghiên cứu**

Về phạm vi chức năng, hệ thống được xây dựng bao gồm các module: quản lý tài khoản người dùng, quản lý danh mục giao dịch, nhập và theo dõi giao dịch thu chi, lập và kiểm soát ngân sách theo danh mục, báo cáo và phân tích tài chính với biểu đồ trực quan, phân loại giao dịch tự động bằng AI, dự đoán dòng tiền bằng Linear Regression, phát hiện giao dịch bất thường bằng Isolation Forest và chatbot tư vấn tài chính.

Về phạm vi người dùng, hệ thống hướng đến đối tượng là các cá nhân, sinh viên, người đi làm tại Việt Nam có nhu cầu theo dõi và quản lý tài chính cá nhân một cách bài bản và khoa học.

Về phạm vi công nghệ, hệ thống được xây dựng dưới dạng ứng dụng web, hỗ trợ truy cập qua trình duyệt trên máy tính và thiết bị di động. Hệ thống không bao gồm tích hợp API ngân hàng thực tế (Open Banking) trong phiên bản hiện tại.

## **4\. Bố cục báo cáo**

Báo cáo được tổ chức thành bảy phần chính như sau:

* Phần Mở đầu: Trình bày lý do chọn đề tài, mục tiêu nghiên cứu, đối tượng và phạm vi, cùng bố cục tổng thể của báo cáo.

* Chương 1 – Tổng quan bài toán và Cơ sở lý thuyết: Phân tích hiện trạng nghiệp vụ, trình bày cơ sở lý thuyết về các thuật toán ML và giới thiệu các công nghệ sử dụng.

* Chương 2 – Phân tích yêu cầu hệ thống: Liệt kê và đặc tả chi tiết các yêu cầu chức năng, yêu cầu phi chức năng, xác định actors và Use Case.

* Chương 3 – Thiết kế hệ thống và Cơ sở dữ liệu: Trình bày kiến trúc hệ thống tổng thể, thiết kế cơ sở dữ liệu quan hệ và các biểu đồ UML (Class Diagram, Sequence Diagram).

* Chương 4 – Tích hợp AI/ML và Thiết kế giao diện: Trình bày chi tiết các module AI/ML và wireframe cho 5 màn hình chính của hệ thống.

* Chương 5 – Thiết kế xử lý lỗi, Logging và Monitoring: Trình bày chiến lược xử lý lỗi toàn diện và hệ thống quan sát (observability) cho môi trường production.

* Phần Kết luận và Tài liệu tham khảo: Tóm tắt kết quả, hạn chế và hướng phát triển, kèm danh sách tài liệu tham khảo theo chuẩn APA.

# **CHƯƠNG 1: TỔNG QUAN BÀI TOÁN VÀ CƠ SỞ LÝ THUYẾT**

## **1.1. Phân tích hiện trạng nghiệp vụ quản lý tài chính cá nhân**

### **1.1.1. Thực trạng quản lý tài chính cá nhân hiện nay**

Quản lý tài chính cá nhân (Personal Finance Management – PFM) là quá trình lập kế hoạch, theo dõi và kiểm soát các khoản thu nhập, chi tiêu, tiết kiệm và đầu tư của một cá nhân hoặc hộ gia đình. Đây là kỹ năng quan trọng quyết định đến sức khỏe tài chính và chất lượng cuộc sống của mỗi người.

Khảo sát thực tế tại Việt Nam cho thấy phần lớn người dùng hiện đang áp dụng một trong ba hình thức quản lý tài chính chính:

* Hình thức thứ nhất là ghi chép thủ công trong sổ tay hoặc ứng dụng ghi chú, chiếm khoảng 35% người dùng. Ưu điểm là đơn giản, linh hoạt, không cần thiết bị đặc biệt. Nhược điểm lớn là dễ mất dữ liệu, khó tổng hợp và phân tích, không có cái nhìn tổng thể theo thời gian.

* Hình thức thứ hai là sử dụng bảng tính Excel hoặc Google Sheets, chiếm khoảng 40% người dùng có nhu cầu theo dõi chi tiết hơn. Phương pháp này cho phép tính toán tự động cơ bản và tạo biểu đồ đơn giản, nhưng đòi hỏi kỹ năng spreadsheet, dữ liệu phân tán qua nhiều file và không có khả năng học máy hay phân tích nâng cao.

* Hình thức thứ ba là sử dụng các ứng dụng tài chính có sẵn như Money Lover, Misa Money, Wallet, chiếm khoảng 25% người dùng. Các ứng dụng này cung cấp giao diện thuận tiện và một số tính năng phân tích cơ bản, tuy nhiên vẫn thiếu khả năng phân loại giao dịch tự động bằng AI theo ngữ cảnh tiếng Việt và chatbot tư vấn thông minh được cá nhân hóa.

### **1.1.2. Các vấn đề tồn tại trong hệ thống hiện tại**

Qua phân tích hiện trạng, có thể xác định một số vấn đề chính mà người dùng gặp phải:

* Phân loại giao dịch thủ công: Người dùng phải tự phân loại từng giao dịch vào danh mục phù hợp (ăn uống, đi lại, mua sắm...), tiêu tốn thời gian và dễ phân loại sai.

* Thiếu dự báo tài chính: Không có khả năng dự đoán xu hướng thu chi trong tương lai để chủ động điều chỉnh ngân sách.

* Không phát hiện bất thường: Không có cơ chế cảnh báo khi xuất hiện giao dịch bất thường về giá trị hoặc tần suất.

* Thiếu tư vấn thông minh: Không có hỗ trợ tư vấn tài chính được cá nhân hóa dựa trên lịch sử giao dịch thực tế của người dùng.

* Khó khăn trong việc tổng hợp báo cáo: Việc tạo báo cáo tổng hợp theo nhiều chiều phân tích (theo thời gian, danh mục, so sánh ngân sách) đòi hỏi kỹ năng và thời gian.

### **1.1.3. Đề xuất giải pháp**

Từ việc phân tích các vấn đề tồn tại, hệ thống đề xuất trong đồ án này sẽ giải quyết các điểm yếu trên thông qua việc tích hợp công nghệ AI/ML vào quy trình quản lý tài chính. Cụ thể:

* Thuật toán Naive Bayes sẽ tự động phân loại giao dịch khi người dùng nhập mô tả.

* Linear Regression sẽ dự báo dòng tiền trong 30–90 ngày tới dựa trên lịch sử dữ liệu.

* Isolation Forest sẽ phát hiện các giao dịch có dấu hiệu bất thường và gửi cảnh báo tức thời.

* LangChain \+ Ollama sẽ cung cấp chatbot tư vấn thông minh với ngữ cảnh được cá nhân hóa từ lịch sử tài chính thực tế của người dùng, đảm bảo dữ liệu không rời khỏi hệ thống cục bộ.

## **1.2. Cơ sở lý thuyết về các thuật toán Machine Learning**

### **1.2.1. Multinomial Naive Bayes – Phân loại văn bản giao dịch**

Naive Bayes là một lớp các thuật toán phân loại xác suất dựa trên Định lý Bayes với giả định "ngây thơ" (naive) rằng các đặc trưng (features) đầu vào độc lập có điều kiện với nhau. Định lý Bayes được phát biểu như sau:

***P(C|X) \= P(X|C) × P(C) / P(X)***

Trong đó: P(C|X) là xác suất hậu nghiệm – xác suất thuộc lớp C khi quan sát được đặc trưng X; P(X|C) là hàm likelihood; P(C) là xác suất tiên nghiệm của lớp C; P(X) là bằng chứng (evidence).

Biến thể Multinomial Naive Bayes (MNB) được lựa chọn vì phù hợp với dữ liệu rời rạc như tần số xuất hiện của từ trong văn bản. Mô hình học để ước lượng xác suất của mỗi từ trong từng lớp danh mục tài chính (ăn uống, đi lại, mua sắm, giải trí...). Ưu điểm của Naive Bayes bao gồm: hiệu quả cao với dữ liệu văn bản ngắn, tốc độ huấn luyện O(n), hoạt động tốt với tập dữ liệu nhỏ đến trung bình, và dễ dàng cập nhật khi có dữ liệu mới (online learning).

Quy trình xử lý văn bản trước khi đưa vào mô hình bao gồm: chuẩn hóa văn bản (lowercase, loại bỏ ký tự đặc biệt), loại bỏ stop words tiếng Việt, và vector hóa bằng TF-IDF để chuyển đổi văn bản thành vector số.

### **1.2.2. Linear Regression – Dự đoán dòng tiền**

Hồi quy tuyến tính (Linear Regression) là thuật toán học máy có giám sát hiệu quả cho bài toán dự đoán giá trị liên tục. Mô hình giả định mối quan hệ tuyến tính giữa biến đầu vào X và biến đầu ra y:

***y \= β₀ \+ β₁x₁ \+ β₂x₂ \+ ... \+ βₙxₙ \+ ε***

Trong bài toán dự đoán dòng tiền, các features đầu vào bao gồm: tổng thu nhập theo tháng (T-1, T-2, T-3...), tổng chi tiêu theo tháng, tỷ lệ tiết kiệm trung bình, biến dummy cho tháng trong năm (để capture seasonal patterns), và xu hướng tăng trưởng. Biến đầu ra là tổng thu hoặc chi dự kiến trong tháng tiếp theo. Việc tối ưu hóa mô hình được thực hiện bằng phương pháp Ordinary Least Squares (OLS). Các chỉ số đánh giá gồm R² (hệ số xác định), MAE (Mean Absolute Error), RMSE (Root Mean Squared Error).

### **1.2.3. Isolation Forest – Phát hiện giao dịch bất thường**

Isolation Forest là thuật toán phát hiện bất thường (anomaly detection) dựa trên nguyên lý cô lập (isolation). Thuật toán khai thác tính chất: điểm bất thường trong không gian dữ liệu thường nằm cô lập – ít hàng xóm gần và dễ bị cô lập hơn so với điểm bình thường.

Cơ chế hoạt động: Thuật toán xây dựng một tập hợp các cây quyết định (Isolation Trees), trong đó mỗi cây được xây dựng bằng cách chọn ngẫu nhiên một đặc trưng và một giá trị phân tách ngẫu nhiên. Điểm bất thường sẽ cần ít bước phân tách hơn để bị cô lập (độ sâu trung bình trong cây thấp hơn). Anomaly Score của một điểm được tính bằng trung bình độ sâu cô lập trên toàn bộ rừng cây: score gần 1 là bất thường, gần 0 là bình thường.

Trong hệ thống, các features được đưa vào mô hình bao gồm: giá trị giao dịch (amount), giờ thực hiện giao dịch, danh mục giao dịch (mã hóa số), tần suất giao dịch trong ngày, và độ lệch so với giá trị trung bình của danh mục. Khi phát hiện bất thường, hệ thống tự động gửi cảnh báo đến người dùng qua giao diện và email.

## **1.3. Giới thiệu các công nghệ sử dụng**

### **1.3.1. Frontend: React, TypeScript, Vite, Chart.js**

React là thư viện JavaScript mã nguồn mở do Meta (Facebook) phát triển, sử dụng để xây dựng giao diện người dùng (UI) dựa trên mô hình lập trình khai báo (declarative) và kiến trúc component-based. React sử dụng Virtual DOM để tối ưu hóa hiệu năng render. Hooks API (useState, useEffect, useContext, useReducer...) cung cấp cách quản lý state và side effects hiện đại.

TypeScript là superset của JavaScript với hệ thống kiểu tĩnh (static typing), giúp phát hiện lỗi sớm tại thời điểm biên dịch, cải thiện khả năng đọc và bảo trì code. Đối với dự án tài chính cần độ chính xác cao, TypeScript giúp đảm bảo tính toàn vẹn dữ liệu khi truyền qua API.

Vite là công cụ build thế hệ mới, tận dụng ES modules trong trình duyệt hiện đại để cung cấp tốc độ khởi động server phát triển gần như tức thì và Hot Module Replacement (HMR) nhanh chóng.

Chart.js là thư viện biểu đồ JavaScript mã nguồn mở, hỗ trợ Line chart (xu hướng thu chi), Bar chart (so sánh theo danh mục), Pie/Doughnut chart (tỷ lệ phần trăm chi tiêu) và Area chart (dự báo dòng tiền với khoảng tin cậy).

### **1.3.2. Backend: Python FastAPI**

FastAPI là framework web hiện đại, hiệu suất cao để xây dựng API với Python, được xây dựng trên nền Starlette (ASGI framework) và Pydantic (data validation). FastAPI nổi bật với: tốc độ xử lý request ngang ngửa NodeJS và Go nhờ cơ chế async/await; tự động sinh tài liệu API (Swagger UI và ReDoc) từ type annotations; và tích hợp dễ dàng với các thư viện ML Python (scikit-learn, pandas, numpy).

Xác thực và phân quyền người dùng được thực hiện bằng JWT (JSON Web Token). Khi đăng nhập thành công, server tạo Access Token (30 phút) và Refresh Token (7 ngày), ký bằng secret key. SQLAlchemy ORM được sử dụng như lớp trừu tượng hóa database, hỗ trợ migration qua Alembic.

### **1.3.3. Cơ sở dữ liệu: PostgreSQL**

PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở mạnh mẽ, tuân thủ đầy đủ các tiêu chuẩn SQL và ACID. PostgreSQL được lựa chọn vì: hỗ trợ kiểu dữ liệu phong phú (JSONB cho metadata linh hoạt, UUID cho primary key bảo mật), window functions mạnh mẽ cho phân tích tài chính phức tạp (tính tổng lũy kế, trung bình động), full-text search tích hợp sẵn, và khả năng xử lý transaction đáng tin cậy cho dữ liệu tài chính nhạy cảm.

### **1.3.4. AI/ML Framework: LangChain và Ollama**

LangChain là framework Python mã nguồn mở giúp xây dựng các ứng dụng có sử dụng mô hình ngôn ngữ lớn (LLM). LangChain cung cấp các abstraction mạnh mẽ như: Chains (chuỗi các bước xử lý), Agents (tác nhân có thể quyết định hành động), Memory (lưu trữ lịch sử hội thoại), và Prompts (quản lý template prompt).

Ollama là công cụ cho phép chạy các mô hình ngôn ngữ lớn cục bộ (local) trên máy chủ của người dùng. Lý do lựa chọn Ollama thay vì các API cloud (ChatGPT, Claude API) là vì tính bảo mật dữ liệu: dữ liệu tài chính cá nhân của người dùng là thông tin nhạy cảm và không nên truyền tải lên các server bên thứ ba. Bằng cách sử dụng Ollama với mô hình Llama 3 hoặc Mistral chạy cục bộ, toàn bộ dữ liệu được giữ trong hệ thống. Ngoài ra, sau khi tải về, Ollama hoạt động offline, không phụ thuộc kết nối internet và không tốn chi phí API.

### **1.3.5. Container hóa: Docker và Docker Compose**

Docker là nền tảng container hóa cho phép đóng gói ứng dụng cùng toàn bộ dependencies vào một container độc lập, đảm bảo tính nhất quán giữa môi trường phát triển và production. Docker Compose được sử dụng để định nghĩa và điều phối multi-container application (Frontend, Backend, PostgreSQL, Redis, Ollama) trong một file docker-compose.yml duy nhất, giúp đơn giản hóa quá trình triển khai và vận hành.

# **CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG**

## **2.1. Yêu cầu chức năng**

### **2.1.1. Module quản lý người dùng**

* UC-Auth-01: Đăng ký tài khoản mới với email, mật khẩu và thông tin cá nhân cơ bản.

* UC-Auth-02: Đăng nhập bằng email/mật khẩu, hệ thống cấp JWT Access Token và Refresh Token.

* UC-Auth-03: Làm mới Access Token bằng Refresh Token khi token hết hạn.

* UC-Auth-04: Đăng xuất khỏi hệ thống, vô hiệu hóa token.

* UC-Auth-05: Xem và cập nhật thông tin cá nhân (tên, avatar, thông tin liên hệ).

* UC-Auth-06: Đổi mật khẩu với xác thực mật khẩu cũ.

### **2.1.2. Module quản lý danh mục**

* UC-Cat-01: Xem danh sách danh mục thu/chi mặc định của hệ thống.

* UC-Cat-02: Tạo danh mục tùy chỉnh theo nhu cầu cá nhân (tên, màu sắc, icon, loại thu/chi).

* UC-Cat-03: Chỉnh sửa thông tin danh mục tùy chỉnh.

* UC-Cat-04: Xóa danh mục tùy chỉnh (kiểm tra ràng buộc với giao dịch hiện có).

### **2.1.3. Module quản lý giao dịch**

* UC-Trans-01: Thêm mới giao dịch thu/chi; hệ thống AI tự động gợi ý danh mục dựa trên mô tả.

* UC-Trans-02: Xem danh sách giao dịch với lọc theo thời gian, danh mục, loại; hỗ trợ phân trang và sắp xếp.

* UC-Trans-03: Xem chi tiết một giao dịch.

* UC-Trans-04: Chỉnh sửa thông tin giao dịch.

* UC-Trans-05: Xóa giao dịch (xóa mềm, lưu lịch sử).

* UC-Trans-06: Tìm kiếm giao dịch theo từ khóa trong mô tả.

### **2.1.4. Module quản lý ngân sách**

* UC-Budget-01: Tạo ngân sách cho một danh mục trong một khoảng thời gian (tháng, quý, năm).

* UC-Budget-02: Xem tổng quan ngân sách: số tiền đã chi so với hạn mức, phần trăm sử dụng.

* UC-Budget-03: Nhận cảnh báo khi chi tiêu vượt ngưỡng 80% và 100% ngân sách.

* UC-Budget-04: Chỉnh sửa và xóa ngân sách.

### **2.1.5. Module báo cáo và phân tích**

* UC-Report-01: Dashboard tổng quan: tổng thu, tổng chi, số dư, biểu đồ xu hướng trong tháng hiện tại.

* UC-Report-02: Báo cáo chi tiêu theo danh mục (pie chart, bar chart) cho tháng/quý/năm.

* UC-Report-03: Báo cáo so sánh thu chi qua các tháng (line chart).

* UC-Report-04: Xuất báo cáo dạng PDF hoặc CSV.

### **2.1.6. Module AI/ML**

* UC-AI-01: Phân loại giao dịch tự động khi người dùng nhập mô tả, hiển thị gợi ý kèm độ tin cậy.

* UC-AI-02: Dự đoán dòng tiền: hiển thị dự báo thu/chi cho 30/60/90 ngày tiếp theo trên line chart.

* UC-AI-03: Phát hiện bất thường: tự động quét giao dịch và gửi cảnh báo khi phát hiện dấu hiệu bất thường.

* UC-AI-04: Chatbot tư vấn tài chính: trả lời câu hỏi về tình hình tài chính, đưa ra lời khuyên được cá nhân hóa.

## **2.2. Yêu cầu phi chức năng**

### **2.2.1. Hiệu năng (Performance)**

* Thời gian phản hồi của API không vượt quá 500ms cho các request thông thường (CRUD giao dịch, lấy dữ liệu dashboard).

* Thời gian phân loại giao dịch bằng AI không vượt quá 200ms.

* Hệ thống hỗ trợ ít nhất 100 người dùng đồng thời mà không ảnh hưởng đáng kể đến hiệu năng.

* Trang web tải lần đầu (First Contentful Paint) không quá 3 giây trên đường truyền trung bình 4G.

### **2.2.2. Bảo mật (Security)**

* Tất cả mật khẩu phải được mã hóa bằng thuật toán bcrypt với salt rounds \>= 10 trước khi lưu vào database.

* Xác thực API bằng JWT với thời gian hiệu lực ngắn (Access Token: 30 phút, Refresh Token: 7 ngày).

* Toàn bộ giao tiếp giữa client và server phải qua HTTPS/TLS.

* Dữ liệu tài chính của người dùng này không được phép truy cập bởi người dùng khác (row-level security).

* Hệ thống có cơ chế bảo vệ chống lại các tấn công phổ biến: SQL injection, XSS, CSRF.

* Dữ liệu chatbot (lịch sử giao dịch đưa vào prompt) được xử lý cục bộ qua Ollama, không gửi lên server bên thứ ba.

### **2.2.3. Giao diện người dùng (UI/UX)**

* Giao diện phải responsive, hoạt động tốt trên các màn hình từ 375px (mobile) đến 1920px (desktop).

* Hỗ trợ chế độ tối (Dark Mode) và chế độ sáng (Light Mode).

* Các thao tác chính (thêm giao dịch, xem dashboard) phải thực hiện được trong tối đa 3 bước.

* Hiển thị thông báo phản hồi (toast notification) cho mọi thao tác thành công hay thất bại.

* Hỗ trợ ngôn ngữ tiếng Việt hoàn toàn trong giao diện và chatbot.

### **2.2.4. Khả năng mở rộng và bảo trì**

* Code backend tuân thủ nguyên tắc SOLID, Clean Architecture với phân tầng rõ ràng (Router – Service – Repository – Model).

* Cấu hình môi trường qua biến môi trường (.env file), không hardcode thông tin nhạy cảm trong code.

* Hệ thống có thể triển khai bằng Docker Compose cho cả môi trường development và production.

## **2.3. Xác định các Actor**

Dựa trên việc phân tích yêu cầu, hệ thống được xác định có ba actor chính:

* Người dùng đã xác thực (Authenticated User): Là người dùng đã đăng nhập vào hệ thống – actor chính và quan trọng nhất. Người dùng có thể thực hiện toàn bộ các chức năng: quản lý giao dịch, ngân sách, xem báo cáo và tương tác với AI. Người dùng chỉ có quyền truy cập dữ liệu của chính mình.

* Quản trị viên (Administrator): Quản lý hệ thống ở cấp độ cao nhất. Admin có thể quản lý tài khoản người dùng, quản lý danh mục mặc định, xem thống kê tổng quan. Admin không được phép xem dữ liệu tài chính cá nhân của người dùng.

* Hệ thống AI (AI System): Actor tự động, thực hiện các tác vụ nền: phân loại giao dịch khi được gọi, chạy batch job kiểm tra bất thường định kỳ, cập nhật mô hình dự đoán khi có đủ dữ liệu mới. Hệ thống AI hoạt động như một service nội bộ, được gọi bởi Backend API.

## **2.4. Danh sách Use Case**

*Bảng 2.1: Danh sách các Use Case của hệ thống*

| Mã UC | Tên Use Case | Actor | Ưu tiên | Module |
| ----- | ----- | ----- | ----- | ----- |
| UC-01 | Đăng ký tài khoản | Người dùng | Cao | Xác thực |
| UC-02 | Đăng nhập hệ thống | Người dùng | Cao | Xác thực |
| UC-03 | Quản lý thông tin cá nhân | Người dùng | Trung bình | Xác thực |
| UC-04 | Thêm mới giao dịch (có AI phân loại) | Người dùng, AI System | Cao | Giao dịch |
| UC-05 | Xem và lọc danh sách giao dịch | Người dùng | Cao | Giao dịch |
| UC-06 | Chỉnh sửa / Xóa giao dịch | Người dùng | Trung bình | Giao dịch |
| UC-07 | Quản lý danh mục thu/chi | Người dùng | Trung bình | Danh mục |
| UC-08 | Tạo và quản lý ngân sách | Người dùng | Cao | Ngân sách |
| UC-09 | Xem cảnh báo vượt ngân sách | Người dùng, AI System | Cao | Ngân sách |
| UC-10 | Xem Dashboard tổng quan | Người dùng | Cao | Báo cáo |
| UC-11 | Xem báo cáo phân tích tài chính | Người dùng | Cao | Báo cáo |
| UC-12 | Xem báo cáo dự đoán dòng tiền (AI) | Người dùng, AI System | Cao | AI/ML |
| UC-13 | Nhận cảnh báo giao dịch bất thường (AI) | Người dùng, AI System | Cao | AI/ML |
| UC-14 | Tương tác Chatbot tư vấn tài chính | Người dùng, AI System | Cao | AI/ML |
| UC-15 | Xuất báo cáo PDF/CSV | Người dùng | Thấp | Báo cáo |
| UC-16 | Quản lý tài khoản người dùng (Admin) | Admin | Trung bình | Admin |
| UC-17 | Quản lý danh mục hệ thống (Admin) | Admin | Trung bình | Admin |

## **2.5. Đặc tả kịch bản Use Case chi tiết**

### **2.5.1. UC-04: Thêm mới giao dịch có AI phân loại**

*Bảng 2.2: Đặc tả Use Case UC-04*

| Mã Use Case | UC-04 |
| :---- | :---- |
| **Tên Use Case** | Thêm mới giao dịch (có AI phân loại) |
| **Actor chính** | Người dùng đã xác thực |
| **Actor phụ** | Hệ thống AI (AI System) |
| **Mô tả ngắn** | Người dùng nhập thông tin giao dịch thu/chi. Hệ thống AI tự động gợi ý danh mục phù hợp dựa trên mô tả văn bản. Người dùng xác nhận hoặc thay đổi danh mục và lưu giao dịch. |
| **Tiền điều kiện** | Người dùng đã đăng nhập thành công. Hệ thống có ít nhất một danh mục đang hoạt động. |
| **Hậu điều kiện** | Giao dịch mới được lưu vào database. Số dư tài khoản được cập nhật. Mô hình ML được cập nhật với dữ liệu mới (batch update). |
| **Luồng sự kiện chính** | 1\. Người dùng nhấn nút "Thêm giao dịch".2. Hệ thống hiển thị form nhập liệu.3. Người dùng nhập mô tả (VD: "Ăn phở buổi sáng").4. Hệ thống gửi mô tả lên /api/ai/classify.5. Backend gọi Naive Bayes, trả về danh mục gợi ý kèm độ tin cậy.6. Hiển thị gợi ý (VD: "Ăn uống – 92%") trên form.7. Người dùng nhập số tiền, ngày và thông tin bổ sung.8. Người dùng xác nhận hoặc thay đổi danh mục.9. Người dùng nhấn "Lưu giao dịch".10. Backend validate và lưu vào PostgreSQL.11. Hệ thống cập nhật Dashboard và hiển thị thông báo thành công. |
| **Luồng thay thế** | 4a. Nếu mô tả quá ngắn, AI trả về "Chưa xác định" – người dùng tự chọn danh mục.10a. Nếu dữ liệu không hợp lệ (số tiền âm, ngày tương lai), hệ thống hiển thị lỗi cụ thể.10b. Nếu kết nối database thất bại, hệ thống yêu cầu thử lại. |
| **Yêu cầu đặc biệt** | Thời gian phân loại AI không vượt quá 200ms. Kết quả phân loại hiển thị realtime khi người dùng ngừng gõ (debounce 500ms). |

### **2.5.2. UC-12: Xem báo cáo dự đoán dòng tiền**

*Bảng 2.3: Đặc tả Use Case UC-12*

| Mã Use Case | UC-12 |
| :---- | :---- |
| **Tên Use Case** | Xem báo cáo dự đoán dòng tiền (AI) |
| **Actor chính** | Người dùng đã xác thực |
| **Actor phụ** | Hệ thống AI (AI System) |
| **Mô tả ngắn** | Người dùng xem dự báo thu/chi trong 30 ngày tới được tính toán bởi mô hình Linear Regression dựa trên lịch sử giao dịch cá nhân. |
| **Tiền điều kiện** | Người dùng đã có ít nhất 3 tháng dữ liệu giao dịch trong hệ thống. |
| **Hậu điều kiện** | Không thay đổi dữ liệu. Hiển thị kết quả dự báo trên biểu đồ. |
| **Luồng sự kiện chính** | 1\. Người dùng vào mục "Phân tích & Dự báo".2. Hệ thống gửi request đến /api/ai/predict với user\_id và khoảng thời gian.3. Backend truy vấn lịch sử giao dịch 3–12 tháng gần nhất.4. Module Linear Regression xử lý và chạy dự đoán.5. Backend trả về mảng dữ liệu dự báo kèm khoảng tin cậy.6. Frontend vẽ biểu đồ Chart.js: đường thực tế (màu xanh) và đường dự báo (màu cam, nét đứt).7. Hiển thị tóm tắt: "Dự kiến chi tiêu tháng tới: X triệu đồng".8. Người dùng có thể điều chỉnh khoảng thời gian (30/60/90 ngày). |
| **Luồng thay thế** | 3a. Nếu người dùng có ít hơn 3 tháng dữ liệu, hệ thống thông báo cần thêm dữ liệu và gợi ý nhập thêm giao dịch. |
| **Yêu cầu đặc biệt** | Biểu đồ phân biệt rõ dữ liệu thực tế và dự báo. Hiển thị thông tin về độ chính xác mô hình (MAE, R²). |

### **2.5.3. UC-13: Cảnh báo giao dịch bất thường**

*Bảng 2.4: Đặc tả Use Case UC-13*

| Mã Use Case | UC-13 |
| :---- | :---- |
| **Tên Use Case** | Nhận cảnh báo giao dịch bất thường |
| **Actor chính** | Người dùng đã xác thực |
| **Actor phụ** | Hệ thống AI (AI System) |
| **Mô tả ngắn** | Hệ thống AI tự động quét giao dịch theo batch job định kỳ và gửi cảnh báo cho người dùng khi phát hiện giao dịch bất thường theo mô hình Isolation Forest. |
| **Tiền điều kiện** | Người dùng đã đăng nhập. Hệ thống đã có đủ lịch sử giao dịch để huấn luyện mô hình (tối thiểu 30 giao dịch). |
| **Hậu điều kiện** | Cảnh báo được lưu vào bảng Alerts và hiển thị trên Dashboard người dùng. |
| **Luồng sự kiện chính** | 1\. Batch job chạy mỗi 6 giờ, gọi module Isolation Forest.2. Module trích xuất features từ giao dịch trong 24 giờ qua.3. Tính Anomaly Score cho từng giao dịch.4. Các giao dịch có score \> ngưỡng (0.7) được đánh dấu bất thường.5. Hệ thống tạo bản ghi Alert trong database.6. Dashboard người dùng hiển thị badge thông báo.7. Người dùng nhấn vào thông báo để xem chi tiết giao dịch bị đánh dấu.8. Người dùng có thể xác nhận "Đây là giao dịch bình thường" hoặc "Cần điều tra" để cải thiện mô hình. |
| **Luồng thay thế** | 3a. Nếu chưa đủ dữ liệu huấn luyện, module bỏ qua và ghi log.5a. Nếu người dùng đã bật email notification, hệ thống gửi email cảnh báo. |
| **Yêu cầu đặc biệt** | Tỷ lệ false positive phải dưới 10%. Mô hình được tái huấn luyện hàng tuần với dữ liệu mới. Người dùng có thể tùy chỉnh ngưỡng cảnh báo. |

### **2.5.4. UC-14: Tương tác Chatbot tư vấn tài chính**

*Bảng 2.5: Đặc tả Use Case UC-14*

| Mã Use Case | UC-14 |
| :---- | :---- |
| **Tên Use Case** | Tương tác Chatbot tư vấn tài chính |
| **Actor chính** | Người dùng đã xác thực |
| **Actor phụ** | Hệ thống AI (AI System – LangChain \+ Ollama) |
| **Mô tả ngắn** | Người dùng đặt câu hỏi về tình hình tài chính cá nhân và nhận câu trả lời được cá nhân hóa từ chatbot AI sử dụng dữ liệu giao dịch thực tế. |
| **Tiền điều kiện** | Người dùng đã đăng nhập. Ollama đang chạy và mô hình LLM đã được tải. |
| **Hậu điều kiện** | Lịch sử chat được lưu trong session (không lưu database). Dữ liệu giao dịch không rời khỏi hệ thống cục bộ. |
| **Luồng sự kiện chính** | 1\. Người dùng mở màn hình Chatbot.2. Hệ thống kiểm tra trạng thái Ollama và hiển thị các câu hỏi gợi ý.3. Người dùng gõ câu hỏi (VD: "Tháng này tôi chi gì nhiều nhất?").4. Backend truy vấn dữ liệu tài chính của người dùng từ PostgreSQL.5. LangChain xây dựng prompt với context dữ liệu tài chính cá nhân.6. Ollama xử lý và stream câu trả lời về Frontend.7. Frontend hiển thị câu trả lời theo hiệu ứng streaming (từng từ hiện dần).8. Người dùng có thể đặt câu hỏi tiếp theo trong cùng một conversation. |
| **Luồng thay thế** | 6a. Nếu Ollama timeout (\> 60 giây), hệ thống trả về thông báo và đề nghị thử lại.2a. Nếu Ollama không khả dụng, hiển thị banner cảnh báo màu vàng và vô hiệu hóa input. |
| **Yêu cầu đặc biệt** | Dữ liệu tài chính của người dùng không được gửi lên bất kỳ API bên ngoài nào. Chatbot phải trả lời bằng tiếng Việt. Thời gian phản hồi đầu tiên không quá 3 giây. |

# **CHƯƠNG 3: THIẾT KẾ HỆ THỐNG VÀ CƠ SỞ DỮ LIỆU**

## **3.1. Kiến trúc hệ thống tổng thể**

Hệ thống được xây dựng theo kiến trúc Client-Server với sự phân tách rõ ràng giữa các tầng (Layered Architecture) và đóng gói bằng Docker Compose. Kiến trúc tổng thể bao gồm các thành phần sau:

* Tầng Trình bày (Presentation Layer): React \+ TypeScript \+ Vite chạy trên trình duyệt người dùng, giao tiếp với Backend qua REST API. Bao gồm: Dashboard, Trang giao dịch, Trang ngân sách, Trang báo cáo, Module AI và Chatbot.

* Tầng Ứng dụng (Application Layer): FastAPI (Python) xử lý business logic, xác thực JWT, điều phối các service con. Phân tầng rõ ràng: Router → Service → Repository → Model.

* Tầng Dữ liệu (Data Layer): PostgreSQL làm cơ sở dữ liệu chính, Redis làm cache và lưu trữ token blacklist, SQLAlchemy ORM làm lớp trừu tượng hóa.

* Tầng AI/ML (AI Layer): Module Naive Bayes (scikit-learn) cho phân loại, Linear Regression cho dự đoán, Isolation Forest cho phát hiện bất thường, LangChain \+ Ollama cho chatbot.

* Tầng Cơ sở hạ tầng (Infrastructure Layer): Docker Compose điều phối toàn bộ các container, Nginx làm reverse proxy, Prometheus \+ Grafana cho monitoring.

## **3.2. Thiết kế cơ sở dữ liệu**

### **3.2.1. Sơ đồ quan hệ thực thể (ERD)**

Hệ thống gồm 6 bảng chính: Users, Categories, Transactions, Budgets, ML\_Logs và Alerts. Quan hệ giữa các bảng:

* Users 1 – N Transactions: Một người dùng có nhiều giao dịch.

* Users 1 – N Budgets: Một người dùng có nhiều ngân sách.

* Categories 1 – N Transactions: Một danh mục có nhiều giao dịch.

* Categories 1 – N Budgets: Một danh mục có thể được gán cho nhiều ngân sách.

* Transactions 1 – N ML\_Logs: Mỗi giao dịch có thể có nhiều bản ghi phân loại AI.

* Transactions 1 – 1 Alerts: Mỗi giao dịch bất thường sinh ra một Alert.

### **3.2.2. Đặc tả chi tiết các bảng dữ liệu**

*Bảng 3.1: Đặc tả bảng Users*

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- |
| id | UUID | NOT NULL | gen\_random\_uuid() | Khóa chính, định danh duy nhất |
| email | VARCHAR(255) | NOT NULL | – | Email đăng nhập, unique |
| hashed\_password | VARCHAR(255) | NOT NULL | – | Mật khẩu đã mã hóa bcrypt |
| full\_name | VARCHAR(100) | NULL | NULL | Họ và tên người dùng |
| avatar\_url | TEXT | NULL | NULL | URL ảnh đại diện |
| is\_active | BOOLEAN | NOT NULL | TRUE | Trạng thái tài khoản |
| is\_admin | BOOLEAN | NOT NULL | FALSE | Quyền quản trị viên |
| created\_at | TIMESTAMPTZ | NOT NULL | NOW() | Thời điểm tạo tài khoản |
| updated\_at | TIMESTAMPTZ | NOT NULL | NOW() | Thời điểm cập nhật cuối |

*Bảng 3.2: Đặc tả bảng Categories*

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- |
| id | UUID | NOT NULL | gen\_random\_uuid() | Khóa chính |
| user\_id | UUID | NULL | NULL | FK → Users(id); NULL \= danh mục hệ thống |
| name | VARCHAR(100) | NOT NULL | – | Tên danh mục (VD: Ăn uống, Đi lại) |
| type | ENUM | NOT NULL | – | 'income' hoặc 'expense' |
| color | VARCHAR(7) | NOT NULL | '\#3B82F6' | Màu hiển thị (hex code) |
| icon | VARCHAR(50) | NULL | NULL | Tên icon (VD: utensils, car) |
| is\_active | BOOLEAN | NOT NULL | TRUE | Danh mục có đang hoạt động không |
| sort\_order | INTEGER | NOT NULL | 0 | Thứ tự hiển thị |

*Bảng 3.3: Đặc tả bảng Transactions*

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- |
| id | UUID | NOT NULL | gen\_random\_uuid() | Khóa chính |
| user\_id | UUID | NOT NULL | – | FK → Users(id) |
| category\_id | UUID | NOT NULL | – | FK → Categories(id) |
| amount | DECIMAL(18,2) | NOT NULL | – | Số tiền giao dịch (VND), luôn dương |
| type | ENUM | NOT NULL | – | 'income' hoặc 'expense' |
| description | VARCHAR(500) | NULL | NULL | Mô tả giao dịch (đầu vào cho AI) |
| transaction\_date | DATE | NOT NULL | – | Ngày thực hiện giao dịch |
| note | TEXT | NULL | NULL | Ghi chú bổ sung |
| is\_deleted | BOOLEAN | NOT NULL | FALSE | Xóa mềm (soft delete) |
| created\_at | TIMESTAMPTZ | NOT NULL | NOW() | Thời điểm tạo bản ghi |

*Bảng 3.4: Đặc tả bảng Budgets*

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- |
| id | UUID | NOT NULL | gen\_random\_uuid() | Khóa chính |
| user\_id | UUID | NOT NULL | – | FK → Users(id) |
| category\_id | UUID | NOT NULL | – | FK → Categories(id) |
| limit\_amount | DECIMAL(18,2) | NOT NULL | – | Hạn mức ngân sách (VND) |
| period\_type | ENUM | NOT NULL | – | 'monthly', 'quarterly', 'yearly' |
| start\_date | DATE | NOT NULL | – | Ngày bắt đầu kỳ ngân sách |
| end\_date | DATE | NOT NULL | – | Ngày kết thúc kỳ ngân sách |
| is\_active | BOOLEAN | NOT NULL | TRUE | Ngân sách đang áp dụng |

*Bảng 3.5: Đặc tả bảng ML\_Logs*

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- |
| id | UUID | NOT NULL | gen\_random\_uuid() | Khóa chính |
| transaction\_id | UUID | NOT NULL | – | FK → Transactions(id) |
| model\_type | VARCHAR(50) | NOT NULL | – | 'naive\_bayes', 'isolation\_forest' |
| predicted\_category | UUID | NULL | NULL | Danh mục được dự đoán (FK → Categories) |
| confidence\_score | FLOAT | NULL | NULL | Độ tin cậy dự đoán (0.0 – 1.0) |
| is\_correct | BOOLEAN | NULL | NULL | Người dùng xác nhận đúng/sai (feedback) |
| created\_at | TIMESTAMPTZ | NOT NULL | NOW() | Thời điểm chạy model |

*Bảng 3.6: Đặc tả bảng Alerts*

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Mô tả |
| ----- | ----- | ----- | ----- | ----- |
| id | UUID | NOT NULL | gen\_random\_uuid() | Khóa chính |
| user\_id | UUID | NOT NULL | – | FK → Users(id) |
| transaction\_id | UUID | NULL | NULL | FK → Transactions(id) nếu liên quan giao dịch |
| alert\_type | VARCHAR(50) | NOT NULL | – | 'anomaly', 'budget\_warning', 'budget\_exceeded' |
| message | TEXT | NOT NULL | – | Nội dung thông báo cho người dùng |
| anomaly\_score | FLOAT | NULL | NULL | Isolation Forest score (nếu loại anomaly) |
| is\_read | BOOLEAN | NOT NULL | FALSE | Người dùng đã đọc chưa |
| created\_at | TIMESTAMPTZ | NOT NULL | NOW() | Thời điểm tạo cảnh báo |

## **3.3. Thiết kế Class Diagram**

Hệ thống được tổ chức theo kiến trúc phân lớp với các lớp chính sau:

* Lớp Model (SQLAlchemy ORM): User, Category, Transaction, Budget, MLLog, Alert – ánh xạ trực tiếp với các bảng cơ sở dữ liệu.

* Lớp Schema (Pydantic): UserCreate, UserResponse, TransactionCreate, TransactionResponse – định nghĩa cấu trúc dữ liệu cho API request/response, bao gồm validation.

* Lớp Repository: UserRepository, TransactionRepository, BudgetRepository – xử lý toàn bộ tương tác với database thông qua SQLAlchemy session.

* Lớp Service: AuthService, TransactionService, BudgetService, ReportService, AIService, ChatbotService – chứa business logic, điều phối Repository và các service bên ngoài.

* Lớp Router (FastAPI): auth\_router, transaction\_router, budget\_router, report\_router, ai\_router – định nghĩa API endpoints và dependency injection.

## **3.4. Thiết kế Sequence Diagram – Luồng chính**

### **3.4.1. Sequence Diagram: Thêm giao dịch có AI phân loại**

Luồng xử lý khi người dùng thêm giao dịch mới với phân loại AI:

* 1\. \[User → Frontend\] Nhập mô tả giao dịch vào form.

* 2\. \[Frontend → Backend\] POST /api/ai/classify {description: "Ăn phở buổi sáng"} (sau debounce 500ms).

* 3\. \[Backend → AIService\] classify\_text(description).

* 4\. \[AIService → NaiveBayesModel\] predict(tfidf\_vector).

* 5\. \[NaiveBayesModel → AIService\] Trả về {category\_id, category\_name, confidence: 0.92}.

* 6\. \[AIService → Backend\] Trả về kết quả phân loại.

* 7\. \[Backend → Frontend\] HTTP 200 {suggested\_category: "Ăn uống", confidence: 0.92}.

* 8\. \[Frontend → User\] Hiển thị badge gợi ý "Ăn uống – 92%".

* 9\. \[User → Frontend\] Nhập số tiền, ngày, xác nhận danh mục và nhấn "Lưu".

* 10\. \[Frontend → Backend\] POST /api/transactions {amount, description, category\_id, date, type}.

* 11\. \[Backend → JWTMiddleware\] Verify Access Token.

* 12\. \[Backend → TransactionService\] create\_transaction(data, user\_id).

* 13\. \[TransactionService → TransactionRepository\] save(transaction).

* 14\. \[TransactionRepository → PostgreSQL\] INSERT INTO transactions...

* 15\. \[Backend → Frontend\] HTTP 201 Created {transaction\_id, ...}.

* 16\. \[Frontend → User\] Toast "Giao dịch đã được lưu thành công". Dashboard cập nhật.

### **3.4.2. Sequence Diagram: Đăng nhập và xác thực JWT**

Luồng xử lý khi người dùng đăng nhập vào hệ thống:

* 1\. \[User → Frontend\] Nhập email và mật khẩu, nhấn "Đăng nhập".

* 2\. \[Frontend → Backend\] POST /api/auth/login {email, password}.

* 3\. \[Backend → AuthService\] authenticate(email, password).

* 4\. \[AuthService → UserRepository\] find\_by\_email(email).

* 5\. \[UserRepository → PostgreSQL\] SELECT \* FROM users WHERE email \= ?

* 6\. \[AuthService\] bcrypt.verify(password, hashed\_password).

* 7\. \[AuthService\] Tạo access\_token (JWT, TTL 30 phút) và refresh\_token (JWT, TTL 7 ngày).

* 8\. \[AuthService → Redis\] SET refresh:{user\_id}:{token\_hash} → lưu refresh token.

* 9\. \[Backend → Frontend\] HTTP 200 {access\_token, refresh\_token, user\_info}.

* 10\. \[Frontend\] Lưu access\_token vào memory, refresh\_token vào HttpOnly cookie.

* 11\. \[Frontend → User\] Redirect đến Dashboard.

# **CHƯƠNG 4: TÍCH HỢP AI/ML VÀ THIẾT KẾ GIAO DIỆN**

## **4.1. Module phân loại giao dịch (Naive Bayes)**

Module phân loại giao dịch sử dụng thuật toán Multinomial Naive Bayes kết hợp với TF-IDF vectorizer để tự động gợi ý danh mục khi người dùng nhập mô tả giao dịch. Pipeline xử lý bao gồm các bước:

* Bước 1 – Tiền xử lý văn bản: Chuyển về chữ thường, loại bỏ ký tự đặc biệt, loại bỏ stop words tiếng Việt (được, của, và, là, tại...).

* Bước 2 – Vector hóa TF-IDF: Chuyển mô tả văn bản thành vector số với max\_features=5000 và ngram\_range=(1,2) để bắt được cụm từ 2 từ có ý nghĩa ("cà phê", "xăng xe"...).

* Bước 3 – Phân loại Naive Bayes: MultinomialNB với alpha=1.0 (Laplace smoothing) tính xác suất hậu nghiệm cho từng danh mục và chọn danh mục có xác suất cao nhất.

* Bước 4 – Trả về kết quả: API trả về {category\_id, category\_name, confidence\_score} trong vòng 200ms.

Dữ liệu huấn luyện bao gồm khoảng 2,000 mẫu giao dịch được gán nhãn thủ công theo 12 danh mục. Mô hình đạt độ chính xác khoảng 87% trên tập test và được tái huấn luyện tự động khi có đủ 500 mẫu feedback mới từ người dùng.

## **4.2. Module dự đoán dòng tiền (Linear Regression)**

Module dự đoán sử dụng Linear Regression để dự báo tổng thu và tổng chi cho 30, 60 hoặc 90 ngày tiếp theo dựa trên lịch sử 3–12 tháng. Feature engineering bao gồm:

* Tổng thu nhập và tổng chi tiêu theo tháng (T-1, T-2, T-3, T-6, T-12).

* Tỷ lệ tiết kiệm trung bình (income \- expense) / income.

* Biến dummy cho tháng trong năm (12 biến nhị phân) để capture seasonal patterns.

* Chỉ số xu hướng tuyến tính (linear trend index) qua các tháng.

Mô hình được đánh giá bằng Cross-Validation 5-fold và các chỉ số MAE, RMSE, R². Khoảng tin cậy 95% được tính theo phương pháp bootstrap resample. Kết quả dự đoán hiển thị trên Chart.js với đường thực tế (màu xanh đậm), đường dự báo (màu cam nét đứt) và vùng khoảng tin cậy bóng mờ.

## **4.3. Module phát hiện bất thường (Isolation Forest)**

Module phát hiện bất thường chạy theo batch job định kỳ mỗi 6 giờ, phân tích toàn bộ giao dịch trong 24 giờ qua của từng người dùng. Features đầu vào:

* amount: Giá trị giao dịch (sau log transform để giảm skewness).

* hour\_of\_day: Giờ thực hiện giao dịch (0–23).

* category\_encoded: Mã số danh mục (label encoding).

* daily\_frequency: Số giao dịch trong cùng ngày của người dùng đó.

* amount\_zscore: Độ lệch chuẩn so với trung bình của danh mục (Z-score).

Mô hình sử dụng contamination=0.05 (ước tính 5% giao dịch bất thường) và n\_estimators=100 cây. Các giao dịch có anomaly score \> 0.7 được đánh dấu và tạo Alert. Tỷ lệ false positive được kiểm soát dưới 10% thông qua feedback của người dùng (xác nhận "Đây là giao dịch bình thường").

## **4.4. Module Chatbot tư vấn tài chính (LangChain \+ Ollama)**

Module Chatbot tích hợp LangChain framework với mô hình Llama 3.2 (8B parameters) chạy qua Ollama trên localhost. Kiến trúc chatbot bao gồm:

* Context Builder: Truy vấn PostgreSQL để lấy tóm tắt tài chính của người dùng trong tháng hiện tại (tổng thu, tổng chi, top danh mục chi tiêu, cảnh báo vượt ngân sách).

* Prompt Template: System prompt định nghĩa vai trò chatbot, hướng dẫn trả lời bằng tiếng Việt, kèm context dữ liệu tài chính được inject động.

* Conversation Memory: ConversationBufferMemory của LangChain lưu 10 lượt hội thoại gần nhất để duy trì ngữ cảnh.

* Streaming Response: Ollama stream API truyền token về Frontend theo thời gian thực (Server-Sent Events), tạo hiệu ứng streaming giống ChatGPT.

Ví dụ system prompt: "Bạn là FinanceAI – trợ lý tư vấn tài chính cá nhân thông minh. Dữ liệu tài chính tháng này của người dùng: {financial\_context}. Hãy trả lời câu hỏi về tài chính bằng tiếng Việt, ngắn gọn và hữu ích."

## **4.5. Thiết kế wireframe giao diện người dùng**

Giao diện được thiết kế theo nguyên tắc Mobile-First với breakpoints: Mobile (375px), Tablet (768px), Desktop (1280px+).

### **4.5.1. Màn hình Đăng nhập / Đăng ký**

*Bảng 5.1: Mô tả chi tiết màn hình Đăng nhập*

| Vùng / Component | Mô tả | Ghi chú thiết kế |
| ----- | ----- | ----- |
| Logo \+ Slogan | "FinanceAI – Quản lý tài chính thông minh" ở giữa, trên cùng | Font lớn, màu primary \#3B82F6 |
| Email Input | Label "Email", placeholder "your@email.com", icon mail bên trái | Validate real-time, border đỏ khi sai |
| Password Input | Label "Mật khẩu", icon eye toggle hiện/ẩn mật khẩu | Icon lock bên trái |
| Remember Me | Checkbox "Ghi nhớ đăng nhập" \+ link "Quên mật khẩu?" cùng hàng | Link float right |
| Submit Button | Button "Đăng nhập" full-width, màu primary, có loading spinner | Disable khi đang gửi request |
| Switch Form | Link "Chưa có tài khoản? Đăng ký ngay" | Chuyển form không reload trang |
| Toast Error | Toast notification khi đăng nhập thất bại | Màu đỏ, auto dismiss 4s |

### **4.5.2. Màn hình Dashboard tổng quan**

*Bảng 5.2: Layout và các thành phần Dashboard*

| Vùng | Vị trí (Desktop) | Nội dung | Tương tác |
| ----- | ----- | ----- | ----- |
| Sidebar | Fixed, trái, 240px | Logo, menu: Dashboard, Giao dịch, Ngân sách, Báo cáo, AI, Chatbot | Collapse icon-only trên tablet |
| Header | Top, full-width | Tiêu đề trang, icon chuông (badge), toggle Dark/Light | Click chuông → dropdown notifications |
| KPI Cards | Grid 2x2 (mobile) / 4x1 (desktop) | Tổng thu (xanh lá), Tổng chi (đỏ), Số dư (xanh dương), % Ngân sách (vàng khi \>70%) | Click → trang chi tiết tương ứng |
| Line Chart | 60% chiều rộng content | Thu và Chi theo ngày trong tháng, legend, tooltip | Toggle ẩn/hiện đường Thu hoặc Chi |
| Budget Summary | 40% chiều rộng, phải | Top 3 ngân sách: progress bar màu sắc theo % | Click "Xem tất cả" → Trang Ngân sách |
| Recent Transactions | Dưới, full-width | 5 giao dịch gần nhất: icon danh mục, mô tả, ngày, số tiền màu xanh/đỏ | Click hàng → Xem chi tiết |

### **4.5.3. Màn hình Thêm giao dịch**

*Bảng 5.3: Mô tả màn hình Thêm giao dịch*

| Thành phần | Mô tả | Tương tác AI |
| ----- | ----- | ----- |
| Toggle Thu/Chi | Tab 2 nút đầu form: "Thu nhập" / "Chi tiêu" | Thay đổi màu sắc form và danh sách danh mục |
| Trường Mô tả | Input text, placeholder "Nhập mô tả giao dịch..." | Sau debounce 500ms, gọi AI classify và hiển thị gợi ý |
| AI Suggestion Badge | Badge dưới mô tả: icon robot \+ "Gợi ý: Ăn uống (92%)", màu xanh lá | Nhấn badge → tự động chọn danh mục đó |
| Danh mục | Dropdown có icon màu sắc từng danh mục, nhóm theo Thu/Chi | Tự động chọn theo AI suggestion, người dùng có thể override |
| Số tiền | Input number, format tự động "1,500,000 VND" | Không có AI; bàn phím số trên mobile |
| Ngày thực hiện | Date picker, mặc định hôm nay | Không có AI |
| Ghi chú | Textarea optional | Không có AI |
| Nút Lưu | Button "Lưu giao dịch" full-width, disable khi chưa đủ thông tin | Loading state trong khi gửi API |

### **4.5.4. Màn hình Báo cáo phân tích**

*Bảng 5.4: Bố cục màn hình Báo cáo*

| Vùng | Vị trí | Nội dung |
| ----- | ----- | ----- |
| Filter Bar | Top, sticky | Date range picker (Tháng/Quý/Năm/Tùy chỉnh), Toggle Thu/Chi/Tất cả, nút Xuất CSV \+ PDF |
| Summary Row | Dưới filter | 3 metric cards nhỏ: Tổng thu, Tổng chi, Tỷ lệ tiết kiệm (%) |
| Pie Chart | 50% chiều rộng trái | Tỷ lệ % chi tiêu theo danh mục, legend với màu sắc |
| Bar Chart | 50% chiều rộng phải | So sánh Thu vs Chi theo từng tháng (2 cột xếp cạnh) |
| Line Chart | Full-width, dưới | Xu hướng chi tiêu hàng ngày, đường mượt (smooth), vùng bóng mờ |
| Top Transactions Table | Full-width, dưới cùng | 10 giao dịch lớn nhất: STT, Ngày, Mô tả, Danh mục, Số tiền |

### **4.5.5. Màn hình Chatbot tư vấn tài chính**

*Bảng 5.5: Thiết kế giao diện Chatbot*

| Thành phần | Mô tả chi tiết |
| ----- | ----- |
| Header Chatbot | Avatar robot icon \+ "FinanceAI Assistant" \+ trạng thái "Đang hoạt động" (chấm xanh) / "Không khả dụng" (chấm đỏ khi Ollama down) |
| Vùng tin nhắn | Scrollable, chiếm 80% chiều cao. Bubble user bên phải (màu primary), bubble bot bên trái (màu gray). Timestamp nhỏ dưới mỗi bubble |
| Quick Suggestions | Hàng ngang câu hỏi nhanh: "Tháng này tôi chi gì nhiều nhất?", "So sánh tháng này vs tháng trước", "Tôi có đang vượt ngân sách không?" – chỉ hiện khi conversation rỗng |
| Typing Indicator | Khi bot đang trả lời: 3 chấm nhấp nháy animation trong bubble của bot |
| Streaming Effect | Text bot hiện ra từng từ như ChatGPT, không phải hiện cả đoạn một lần |
| Input Area | Textarea 1–3 dòng auto-resize \+ nút Send (icon paper plane). Enter để gửi, Shift+Enter để xuống dòng |
| Context Info | Link nhỏ "Dữ liệu tài chính tháng X/Y đang được sử dụng" phía trên input |
| Lịch sử chat | Nút "Xóa lịch sử" để clear session. Lịch sử chỉ tồn tại trong session, không lưu database |

# **CHƯƠNG 5: THIẾT KẾ XỬ LÝ LỖI, LOGGING VÀ MONITORING**

## **5.1. Chiến lược xử lý lỗi**

### **5.1.1. Lỗi mất kết nối Database (PostgreSQL Unavailable)**

*Bảng 6.1: Chiến lược xử lý khi mất kết nối Database*

| Tình huống | Cơ chế xử lý | Thông báo người dùng |
| ----- | ----- | ----- |
| Database down khi startup | FastAPI retry kết nối mỗi 5 giây, tối đa 30 lần. Sau đó tắt service (exit code 1\) để Docker restart policy khởi động lại container | Service không khả dụng; /health trả về 503 |
| Database ngắt giữa chừng | SQLAlchemy pool\_pre\_ping=True. Mỗi request ping kết nối trước khi dùng, tự lấy connection mới nếu cũ bị đứt | HTTP 503 "Hệ thống tạm thời gián đoạn, vui lòng thử lại" |
| Query timeout | SQLAlchemy statement\_timeout \= 30 giây. Sau 30 giây trả về lỗi thay vì treo vô hạn | HTTP 504 "Yêu cầu xử lý quá lâu, vui lòng thử lại" |
| Transaction rollback | Tất cả operations dùng SQLAlchemy session với auto-rollback khi exception. Không bao giờ để partial write | HTTP 500 kèm correlation\_id để tra cứu log |

Cấu hình SQLAlchemy để xử lý mất kết nối sử dụng pool\_pre\_ping=True để ping trước mỗi request, pool\_recycle=3600 để tái sử dụng connection sau 1 giờ, pool\_size=10 và max\_overflow=20 cho connection extra khi pool đầy, connect\_timeout=10 giây.

### **5.1.2. Ollama không khả dụng (AI Chatbot Fallback)**

*Bảng 6.2: Thiết kế Fallback khi Ollama không phản hồi*

| Trường hợp | Xử lý Backend | Xử lý Frontend | Fallback Response |
| ----- | ----- | ----- | ----- |
| Ollama chưa khởi động | Health check /api/health kiểm tra connectivity port 11434 mỗi 30 giây | Hiển thị banner cảnh báo màu vàng | "Chatbot đang khởi động. Vui lòng thử lại sau 1–2 phút." |
| Ollama timeout \> 60s | asyncio.wait\_for() timeout 60s → raise TimeoutError → 503 | Hiển thị spinner; sau 65s hiển thị nút Hủy | "Chatbot mất quá nhiều thời gian. Thử câu hỏi khác." |
| Ollama trả lỗi 5xx | Bắt exception từ Ollama client, ghi log, trả về 502 Bad Gateway | Thông báo lỗi màu đỏ nhẹ | "Chatbot gặp lỗi xử lý. Vui lòng thử lại." |
| Model chưa được tải | Tự động chạy ollama pull llama3 khi startup. Ghi log kết quả | Trạng thái "Đang tải mô hình AI..." | "Hệ thống AI đang khởi tạo lần đầu. Mất 5–10 phút." |

### **5.1.3. Redis/Cache Failure**

*Bảng 6.3: Xử lý khi Redis không khả dụng*

| Chức năng dùng Redis | Hành vi khi Redis down | Impact |
| ----- | ----- | ----- |
| Lưu Refresh Token (blacklist) | Fallback: Ghi vào bảng refresh\_tokens trong PostgreSQL | Hiệu năng giảm nhẹ, bảo mật đảm bảo |
| Rate Limiting (đăng nhập) | Tắt rate limiting tạm thời, ghi log cảnh báo | Rủi ro brute force tăng, cần alert ngay |
| Cache AI Health Status | Gọi trực tiếp Ollama mỗi request thay vì dùng cache 30s | Latency tăng \~50ms mỗi chatbot request |
| Session chatbot history | Lưu vào memory của FastAPI process | Mất lịch sử chat khi server restart |

### **5.1.4. JWT Token Bị Revoke Khi Đang Sử Dụng**

Kịch bản: Người dùng A đang sử dụng ứng dụng trên 2 thiết bị. Admin vô hiệu hóa tài khoản người dùng A. Access Token của cả hai thiết bị vẫn còn hạn trong vòng 30 phút.

*Bảng 6.4: Xử lý Token Revocation*

| Cơ chế | Mô tả triển khai |
| ----- | ----- |
| **Token Blacklist trong Redis** | Khi Admin vô hiệu hóa tài khoản, tất cả Refresh Token của user bị xóa khỏi Redis. Key pattern: refresh:{user\_id}:\* bị delete. |
| **JWT Middleware kiểm tra is\_active** | Mỗi request, sau verify JWT signature, middleware query PostgreSQL check user.is\_active. Nếu false → trả về 401 ngay, dù Access Token chưa hết hạn. |
| **Frontend xử lý 401** | AuthContext intercept 401 → clear token khỏi localStorage → redirect đến /login → thông báo "Phiên đăng nhập đã hết hạn". |
| **Đăng xuất tất cả thiết bị** | POST /api/auth/logout-all xóa tất cả refresh token trong Redis. Các Access Token bị từ chối ở bước is\_active check. |
| **Performance** | Cache is\_active trong Redis TTL 30 giây để không query DB mỗi request. Khi revoke: xóa cache ngay để có hiệu lực trong tối đa 30 giây. |

### **5.1.5. Lỗi Import Dữ liệu (CSV Import)**

*Bảng 6.5: Thiết kế xử lý lỗi Import dữ liệu*

| Loại lỗi | Cơ chế xử lý | Phản hồi người dùng |
| ----- | ----- | ----- |
| File không phải CSV hợp lệ | Kiểm tra MIME type và parse 5 dòng đầu | Lỗi 400: "File không đúng định dạng. Tải template mẫu." |
| Encoding sai | Thử decode UTF-8, UTF-8-BOM, CP1258 (tiếng Việt Windows) | Lỗi 400: "Lưu file CSV với encoding UTF-8." |
| Dữ liệu dòng không hợp lệ | Validate từng dòng, gom nhóm lỗi, không dừng ở lỗi đầu tiên | "Đã import 150/200. 50 dòng bị bỏ qua (xem chi tiết)" |
| File quá lớn (\> 5MB) | Reject tại Nginx (client\_max\_body\_size 5m) | Lỗi 413: "File vượt 5MB. Chia nhỏ file." |
| Số tiền âm / 0 | Validate amount \> 0, dòng lỗi ghi vào error report | "Dòng 15: Số tiền phải \> 0 (hiện tại: \-50000)" |
| Ngày không hợp lệ | Thử parse DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY | "Dòng 23: Ngày không đúng định dạng (32/13/2024)" |

## **5.2. Thiết kế Logging Framework**

### **5.2.1. Log Levels và Use Cases**

*Bảng 7.1: Định nghĩa Log Levels và ứng dụng*

| Level | Khi nào dùng | Ví dụ thực tế | Alert? |
| ----- | ----- | ----- | ----- |
| DEBUG | Chi tiết xử lý nội bộ, chỉ bật khi debug. Tắt trong production | SQL query, request headers, AI input/output | Không |
| INFO | Sự kiện bình thường trong vận hành. Luôn bật | Đăng nhập thành công, giao dịch tạo, HTTP 200/201 | Không |
| WARNING | Tình huống không mong đợi nhưng hệ thống vẫn hoạt động | Đăng nhập thất bại 3 lần, AI confidence \< 50% | Tùy |
| ERROR | Lỗi ảnh hưởng một request, không tắt hệ thống | DB query thất bại, Ollama timeout, HTTP 4xx/5xx | Có (Slack) |
| CRITICAL | Lỗi nghiêm trọng, có thể tắt hệ thống | DB mất kết nối, Disk đầy, OOM | Có (PagerDuty) |

Hệ thống sử dụng thư viện structlog kết hợp python-json-logger để tạo log có cấu trúc JSON, xuất ra stdout để Docker log driver thu thập. Mỗi log entry chuẩn bao gồm các trường: timestamp (ISO 8601), level, logger name, message, correlation\_id (theo dõi request), user\_id (ẩn danh hóa nếu cần), duration\_ms và environment.

### **5.2.2. Middleware ghi log Request/Response**

FastAPI middleware ghi log toàn bộ request và response: correlation\_id (UUID ngắn 8 ký tự) được gán cho mỗi request và gắn vào response header X-Correlation-ID để dễ dàng trace lỗi. Các request có thời gian xử lý \> 1000ms được ghi ở mức WARNING để phát hiện endpoint chậm.

## **5.3. Health Check Endpoints**

*Bảng 7.2: Các Health Check Endpoint*

| Endpoint | Method | Mô tả | Response khi healthy |
| ----- | ----- | ----- | ----- |
| /health | GET | Health check tổng quát, dùng bởi Docker và Load Balancer | {"status": "ok", "timestamp": "..."} |
| /health/detail | GET | Chi tiết trạng thái từng service con (Admin/Internal) | {"database": "ok", "redis": "ok", "ollama": "ok"} |
| /health/ready | GET | Readiness probe: Service sẵn sàng nhận traffic chưa | {"ready": true} hoặc HTTP 503 |
| /health/live | GET | Liveness probe: Process còn hoạt động (phân biệt với deadlock) | {"alive": true} |
| /metrics | GET | Prometheus metrics endpoint (scrape mỗi 15 giây) | Text format Prometheus metrics |

## **5.4. Monitoring với Prometheus và Grafana**

### **5.4.1. Các Metrics cần thu thập**

*Bảng 7.3: Danh sách Metrics và ý nghĩa*

| Metric Name | Type | Mô tả | Alert Threshold |
| ----- | ----- | ----- | ----- |
| http\_requests\_total | Counter | Tổng số HTTP requests theo method, path, status\_code | N/A |
| http\_request\_duration\_seconds | Histogram | Phân phối thời gian xử lý request (p50, p95, p99) | p99 \> 2s → WARNING |
| db\_connection\_pool\_size | Gauge | Số connection database đang dùng / tổng pool size | \> 80% pool → WARNING |
| ai\_classify\_duration\_ms | Histogram | Thời gian phân loại giao dịch Naive Bayes | p95 \> 200ms → WARNING |
| ollama\_request\_duration\_seconds | Histogram | Thời gian phản hồi từ Ollama LLM | p50 \> 10s → WARNING |
| ollama\_availability | Gauge | Trạng thái Ollama: 1 \= online, 0 \= offline | \= 0 → CRITICAL |
| active\_users\_total | Gauge | Số người dùng có session active trong 24h | N/A (business metric) |
| transaction\_created\_total | Counter | Tổng giao dịch được tạo thành công | N/A (business metric) |
| auth\_failures\_total | Counter | Số lần đăng nhập thất bại (rate cao \= brute force) | Rate \> 10/phút → WARNING |
| anomaly\_detected\_total | Counter | Số giao dịch bất thường được phát hiện | N/A (ML metric) |

Prometheus được tích hợp vào FastAPI thông qua thư viện prometheus-fastapi-instrumentator. Custom metrics (ai\_classify\_duration, ollama\_availability) được định nghĩa bằng prometheus\_client và cập nhật trực tiếp trong service code.

### **5.4.2. Cấu hình Grafana Dashboards**

*Bảng 7.4: Cấu hình Grafana Dashboards*

| Dashboard | Panels chính | Mục đích |
| ----- | ----- | ----- |
| System Overview | CPU, RAM, Disk I/O từng container; Request rate tổng; Error rate (%) | Giám sát sức khỏe tổng quát hệ thống |
| API Performance | Heatmap latency theo endpoint; p50/p95/p99 response time; Slow queries top 10 | Phát hiện endpoint chậm và bottleneck |
| AI/ML Metrics | Ollama availability gauge; Thời gian phản hồi AI; Tỷ lệ phân loại thành công | Giám sát chất lượng và hiệu năng AI |
| Business Metrics | Người dùng đăng ký theo ngày; Giao dịch tạo mới; Tỷ lệ sử dụng chatbot | Theo dõi tăng trưởng và adoption |
| Security | Auth failure rate; IP nhiều request nhất; Rate limiting hits | Phát hiện sớm tấn công bảo mật |

### **5.4.3. Alert Rules**

*Bảng 7.5: Danh sách Alert Rules và kênh thông báo*

| Tên Alert | Điều kiện | Severity | Kênh thông báo | Hành động |
| ----- | ----- | ----- | ----- | ----- |
| DatabaseDown | db\_connection\_pool\_size \== 0 trong 2 phút | CRITICAL | Slack \#alerts \+ Email | Kiểm tra PostgreSQL container, restart |
| OllamaDown | ollama\_availability \== 0 trong 5 phút | WARNING | Slack \#alerts | Restart Ollama, check disk space |
| HighErrorRate | http\_error\_rate \> 5% trong 5 phút | WARNING | Slack \#alerts | Kiểm tra log để tìm nguyên nhân |
| SlowAPI | http\_request\_duration p99 \> 3s trong 5 phút | WARNING | Slack \#alerts | Phân tích slow query log, check DB index |
| HighMemory | container\_memory\_usage \> 80% trong 10 phút | WARNING | Slack \#alerts | Kiểm tra memory leak, tăng container limit |
| BruteForce | auth\_failures\_total rate \> 20/phút | CRITICAL | Slack \#security \+ Email | Block IP, enable CAPTCHA |

# **KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN**

## **1\. Tóm tắt kết quả đạt được**

Sau quá trình nghiên cứu, phân tích và thiết kế, đồ án đã đạt được các kết quả sau:

* Về nghiên cứu lý thuyết: Đã tìm hiểu và nắm vững kiến thức về ba thuật toán Machine Learning cốt lõi: Multinomial Naive Bayes (phân loại văn bản), Linear Regression (dự đoán chuỗi thời gian) và Isolation Forest (phát hiện bất thường). Đồng thời hiểu sâu về kiến trúc và cách tích hợp LangChain với Ollama để xây dựng chatbot AI bảo đảm bảo mật dữ liệu người dùng.

* Về xây dựng hệ thống: Đã thiết kế và đặc tả hoàn chỉnh ứng dụng web với Frontend React TypeScript có dashboard trực quan với Chart.js. Backend FastAPI cung cấp RESTful API với xác thực JWT bảo mật, kết nối PostgreSQL thông qua SQLAlchemy ORM.

* Về tích hợp AI/ML: Đã thiết kế đầy đủ bốn module AI/ML: phân loại giao dịch Naive Bayes (dự kiến 87% accuracy trên tập test), dự đoán dòng tiền Linear Regression (30/60/90 ngày), phát hiện bất thường Isolation Forest và chatbot tư vấn tài chính LangChain \+ Ollama.

* Về tài liệu kỹ thuật: Đã hoàn thành báo cáo Phân tích và Thiết kế Hệ thống với đầy đủ đặc tả yêu cầu, danh sách 17 Use Case, đặc tả 5 Use Case chi tiết, thiết kế database 6 bảng, biểu đồ Class Diagram và Sequence Diagram, wireframe 5 màn hình chính, thiết kế xử lý lỗi và hệ thống Logging/Monitoring.

## **2\. Hạn chế còn tồn tại**

* Dữ liệu huấn luyện AI còn hạn chế: Tập dữ liệu huấn luyện cho Naive Bayes chỉ có khoảng 2,000 mẫu, chưa đủ đa dạng để bao phủ toàn bộ các cách mô tả giao dịch trong thực tế, đặc biệt là các cụm từ viết tắt, slangs hoặc mix tiếng Anh-Việt.

* Mô hình dự báo chưa xử lý seasonal patterns phức tạp: Linear Regression đơn giản không capture được các seasonal patterns phi tuyến tính (chi tiêu tăng đột biến dịp Tết, mùa tựu trường). Các mô hình như LSTM hoặc Facebook Prophet sẽ phù hợp hơn.

* Chatbot phụ thuộc tài nguyên phần cứng: Ollama chạy mô hình LLM 7–8B tham số đòi hỏi ít nhất 8GB RAM và tốt nhất có GPU, gây khó khăn khi triển khai trên môi trường cloud chi phí thấp.

* Chưa có tích hợp Open Banking: Người dùng phải nhập giao dịch thủ công, không có tích hợp với API ngân hàng để tự động đồng bộ giao dịch.

* Chưa có ứng dụng mobile: Hệ thống hiện tại chỉ là ứng dụng web responsive, chưa có native app cho iOS/Android.

## **3\. Hướng phát triển tương lai**

* Ứng dụng Mobile Native (React Native / Flutter): Phát triển ứng dụng di động native để tận dụng push notification, widget nhanh trên màn hình chính để ghi chép giao dịch tức thời.

* OCR hóa đơn (Receipt OCR): Tích hợp Tesseract OCR hoặc Google Vision API, cho phép người dùng chụp ảnh hóa đơn và hệ thống tự động trích xuất thông tin để tạo giao dịch tự động.

* Open Banking Integration: Tích hợp với API của các ngân hàng Việt Nam (khi có quy định cho phép) để tự động đồng bộ lịch sử giao dịch từ tài khoản ngân hàng.

* Nâng cấp mô hình dự báo: Thay thế Linear Regression bằng LSTM hoặc Facebook Prophet để xử lý tốt hơn seasonal patterns và trend phi tuyến trong dữ liệu tài chính.

* Tính năng Mục tiêu tiết kiệm (Savings Goals): Người dùng đặt mục tiêu tiết kiệm và hệ thống tự động tính toán cần tiết kiệm bao nhiêu mỗi tháng, theo dõi tiến độ.

* Nâng cấp bảo mật: Triển khai Multi-Factor Authentication (MFA), mã hóa dữ liệu nhạy cảm at-rest, và kiểm tra bảo mật định kỳ (penetration testing).

# **TÀI LIỆU THAM KHẢO**

\[1\] Murphy, K. P. (2022). Probabilistic Machine Learning: An Introduction. MIT Press.

\[2\] Géron, A. (2022). Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow (3rd ed.). O'Reilly Media.

\[3\] Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). Isolation Forest. In 2008 Eighth IEEE International Conference on Data Mining (pp. 413-422). IEEE. https://doi.org/10.1109/ICDM.2008.17

\[4\] McCallum, A., & Nigam, K. (1998). A comparison of event models for Naive Bayes text classification. In AAAI-98 Workshop on Learning for Text Categorization (Vol. 752, pp. 41-48).

\[5\] Raschka, S., & Mirjalili, V. (2019). Python Machine Learning (3rd ed.). Packt Publishing.

\[6\] Facebook Engineering. (2024). React – A JavaScript library for building user interfaces. Meta Platforms. https://react.dev/

\[7\] FastAPI. (2024). FastAPI Documentation – Modern, Fast Web Framework for Python. Tiangolo. https://fastapi.tiangolo.com/

\[8\] Scikit-learn Developers. (2024). scikit-learn: Machine Learning in Python – API Reference. https://scikit-learn.org/

\[9\] LangChain Inc. (2024). LangChain Documentation – Building Applications with LLMs through Composability. https://docs.langchain.com/

\[10\] Ollama. (2024). Ollama – Run Llama 3, Mistral, and other large language models locally. https://ollama.com/

\[11\] PostgreSQL Global Development Group. (2024). PostgreSQL 16 Documentation. https://www.postgresql.org/docs/current/

\[12\] Pydantic. (2024). Pydantic V2 Documentation – Data Validation using Python Type Hints. https://docs.pydantic.dev/

\[13\] Docker Inc. (2024). Docker Documentation – Containerization and deployment. https://docs.docker.com/

\[14\] Chart.js. (2024). Chart.js Documentation – Simple yet flexible JavaScript charting. https://www.chartjs.org/docs/

\[15\] JSON Web Tokens. (2024). JWT.io – Introduction to JSON Web Tokens. https://jwt.io/introduction/

\[16\] SQLAlchemy. (2024). SQLAlchemy Documentation – The Database Toolkit for Python. https://docs.sqlalchemy.org/

\[17\] Ngân hàng Nhà nước Việt Nam. (2023). Báo cáo Tài chính toàn diện quốc gia năm 2023\. Ngân hàng Nhà nước Việt Nam.

\[18\] Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32. https://doi.org/10.1023/A:1010933404324

\[19\] Vaswani, A., et al. (2017). Attention is All You Need. Advances in Neural Information Processing Systems, 30\. https://arxiv.org/abs/1706.03762

\[20\] Prometheus Authors. (2024). Prometheus Documentation – Monitoring system and time series database. https://prometheus.io/docs/

\[21\] Grafana Labs. (2024). Grafana Documentation – Open source analytics & monitoring solution. https://grafana.com/docs/