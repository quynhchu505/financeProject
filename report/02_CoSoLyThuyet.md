# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

## 2.1 Tổng quan về quản lý tài chính cá nhân

### 2.1.1 Khái niệm

Quản lý tài chính cá nhân (Personal Finance Management) là quá trình lập kế hoạch, tổ chức, kiểm soát và đánh giá việc sử dụng các nguồn lực tài chính của một cá nhân hoặc hộ gia đình nhằm đạt được các mục tiêu tài chính đã đề ra. Theo định nghĩa của Viện Quản lý Tài chính Cá nhân Hoa Kỳ (AFP), quản lý tài chính cá nhân bao gồm việc quản lý thu nhập, chi tiêu, tiết kiệm, đầu tư và bảo hiểm một cách hiệu quả.

### 2.1.2 Vai trò của quản lý tài chính

Quản lý tài chính cá nhân đóng vai trò quan trọng trong cuộc sống hiện đại vì nhiều lý do. Trước hết, nó giúp kiểm soát chi tiêu và tránh tình trạng chi tiêu quá mức thu nhập. Tiếp theo, việc lập kế hoạch tài chính rõ ràng giúp đạt được các mục tiêu ngắn hạn như mua sắm, du lịch, và dài hạn như mua nhà, tự do tài chính. Bên cạnh đó, quản lý tài chính tốt còn tạo cảm giác an tâm về tương lai, giảm stress liên quan đến tiền bạc. Cuối cùng, nó giúp chuẩn bị cho các tình huống khẩn cấp thông qua quỹ dự phòng.

### 2.1.3 Các nguyên tắc cơ bản

Một số nguyên tắc nền tảng được áp dụng rộng rãi trong quản lý tài chính cá nhân bao gồm:

**Nguyên tắc 50/30/20** do Thượng nghị sĩ Elizabeth Warren đề xuất: 50% thu nhập cho nhu cầu thiết yếu (nhà ở, thực phẩm, đi lại, bảo hiểm), 30% cho mong muốn (giải trí, mua sắm, du lịch), và 20% cho tiết kiệm và trả nợ (bao gồm quỹ khẩn cấp, nghỉ hưu).

**Quỹ khẩn cấp**: Số tiền dự trữ bằng 3-6 tháng chi phí sinh hoạt, đặt trong tài khoản dễ truy cập, chỉ sử dụng cho trường hợp thực sự khẩn cấp.

**Ghi chép thu chi**: Theo dõi mọi khoản thu chi để có cái nhìn rõ ràng về dòng tiền. Nhiều nghiên cứu cho thấy việc ghi chép thường xuyên giúp giảm 10-15% chi tiêu không cần thiết.

### 2.1.4 Quản lý tài chính trong kỷ nguyên số

Sự phát triển của công nghệ đã tạo ra bước tiến lớn trong việc quản lý tài chính cá nhân. Từ các phương pháp ghi chép thủ công bằng sổ kế toán, con người đã chuyển sang sử dụng bảng tính điện tử (Excel, Google Sheets), và hiện nay là các ứng dụng quản lý tài chính thông minh trên điện thoại và web. Xu hướng tất yếu là tích hợp trí tuệ nhân tạo để tự động hóa, cá nhân hóa và dự đoán xu hướng tài chính.

## 2.2 Các khái niệm AI/ML trong tài chính

### 2.2.1 Học có giám sát (Supervised Learning)

Học có giám sát là phương pháp học máy trong đó mô hình được huấn luyện trên dữ liệu đã được gán nhãn (labeled data). Mỗi mẫu huấn luyện bao gồm một cặp input-output, trong đó output là nhãn đúng của input. Mục tiêu của mô hình là học cách ánh xạ từ input đến output sao cho có thể dự đoán chính xác cho các dữ liệu mới chưa từng thấy.

Trong bài toán phân loại giao dịch, mỗi giao dịch được biểu diễn bằng vector đặc trưng (TF-IDF của mô tả, số tiền, thời gian), và nhãn là danh mục tương ứng. Mô hình Naive Bayes hoặc Random Forest được sử dụng để học mối quan hệ giữa các đặc trưng và danh mục. Đây là bài toán phân loại đa lớp (multi-class classification).

Trong bài toán dự đoán dòng tiền, mô hình Linear Regression học cách dự đoán thu nhập/chi tiêu tháng tiếp theo dựa trên các giá trị quá khứ (lag features). Đây là bài toán hồi quy (regression).

### 2.2.2 Học không giám sát (Unsupervised Learning)

Học không giám sát là phương pháp học máy trong đó mô hình được huấn luyện trên dữ liệu không có nhãn. Mục tiêu là khám phá cấu trúc hoặc mẫu ẩn trong dữ liệu.

Thuật toán Isolation Forest được sử dụng trong bài toán phát hiện chi tiêu bất thường. Isolation Forest hoạt động dựa trên nguyên lý: các điểm bất thường (outliers) dễ bị "cô lập" hơn các điểm bình thường trong không gian đặc trưng. Thuật toán xây dựng cây ngẫu nhiên bằng cách chọn ngẫu nhiên một đặc trưng và một ngưỡng chia, sau đó đếm số bước cần thiết để cô lập một điểm. Điểm có số bước thấp hơn ngưỡng được coi là bất thường.

### 2.2.3 Xử lý ngôn ngữ tự nhiên (NLP)

Xử lý ngôn ngữ tự nhiên là một lĩnh vực con của AI, tập trung vào việc tương tác giữa máy tính và ngôn ngữ con người. Trong hệ thống này, NLP được sử dụng ở hai cấp độ:

**TF-IDF (Term Frequency - Inverse Document Frequency)**: Được sử dụng trong mô hình phân loại giao dịch để chuyển đổi mô tả văn bản thành vector số. TF-IDF đo lường tầm quan trọng của một từ trong văn bản dựa trên tần suất xuất hiện trong văn bản đó (TF) và mức độ phổ biến của từ trong toàn bộ corpus (IDF). Điều này giúp phân biệt các từ quan trọng (như "cơm", "xe", "vé") khỏi các từ phổ biến nhưng không mang nhiều ý nghĩa.

**RAG (Retrieval Augmented Generation)**: Đây là kiến trúc tiên tiến kết hợp khả năng truy xuất thông tin (retrieval) và sinh văn bản (generation). Trong chatbot tư vấn tài chính, RAG hoạt động theo quy trình: (1) mô tả tài liệu thành các chunks và tạo vector embedding; (2) lưu trữ vào vector database (Chroma/FAISS); (3) khi có câu hỏi, truy xuất các chunks liên quan nhất; (4) đưa context vào prompt của LLM để sinh câu trả lời. Kiến trúc này giúp chatbot có kiến thức chuyên biệt về tài chính mà không cần fine-tune LLM.

## 2.3 Các công nghệ sử dụng

### 2.3.1 FastAPI - Web Framework

FastAPI là một web framework hiện đại của Python, được xây dựng trên Starlette cho web routing và Pydantic cho data validation. FastAPI cung cấp nhiều ưu điểm nổi bật: tốc độ cao, có thể so sánh với Node.js và Go nhờ sử dụng ASGI (Asynchronous Server Gateway Interface); tự động tạo API documentation (Swagger UI, ReDoc) từ type hints; hỗ trợ async/await cho xử lý bất đồng bộ; validation dữ liệu mạnh mẽ với Pydantic; và dễ dàng mở rộng.

Trong hệ thống này, FastAPI được sử dụng để xây dựng REST API với các endpoint cho người dùng, tài khoản, giao dịch, ngân sách, báo cáo và chatbot. Tất cả các endpoint đều được bảo vệ bằng JWT authentication và có documentation tự động.

### 2.3.2 React - Frontend Framework

React là thư viện JavaScript phổ biến nhất để xây dựng giao diện người dùng. React sử dụng component-based architecture, cho phép tái sử dụng code và dễ dàng bảo trì. Virtual DOM giúp tối ưu hóa hiệu suất rendering. Với hệ sinh thái phong phú và cộng đồng lớn, React là lựa chọn hàng đầu cho các dự án frontend.

Trong hệ thống này, React được sử dụng kết hợp với TypeScript để đảm bảo type safety, Vite làm build tool cho tốc độ nhanh, Tailwind CSS cho styling, React Router cho navigation, và Recharts cho visualization.

### 2.3.3 PostgreSQL - Database

PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ đối tượng (ORDBMS) mã nguồn mở, nổi tiếng với độ tin cậy, tính toàn vẹn dữ liệu và hỗ trợ SQL đầy đủ. PostgreSQL có nhiều ưu điểm vượt trội: hỗ trợ ACID transactions đầy đủ, kiểu dữ liệu phong phú (JSON, ARRAY, UUID, HSTORE), indexing hiệu quả cho truy vấn phức tạp, và có khả năng mở rộng cao với extension.

Trong hệ thống này, PostgreSQL lưu trữ tất cả dữ liệu quan hệ: users, accounts, categories, transactions, budgets. SQLAlchemy ORM được sử dụng như interface giữa Python code và database.

### 2.3.4 LangChain - Chatbot Framework

LangChain là framework mã nguồn mở giúp xây dựng ứng dụng dựa trên LLM (Large Language Model). LangChain cung cấp các components trừu tượng hóa cho: prompt templates, document loaders, text splitters, vector stores, embeddings, chains, và agents.

Kiến trúc chatbot trong hệ thống này sử dụng LangChain với retrieval chain để kết hợp context từ knowledge base vào câu trả lời của LLM. Ollama được sử dụng để chạy LLM local (model llama3), đảm bảo privacy và giảm chi phí API.

### 2.3.5 scikit-learn - ML Library

scikit-learn là thư viện học máy mã nguồn mở phổ biến nhất cho Python. Thư viện cung cấp các thuật toán classification, regression, clustering, dimensionality reduction, model selection và preprocessing trong một API thống nhất, dễ sử dụng.

Trong hệ thống này, scikit-learn được sử dụng cho: TF-IDF Vectorizer chuyển đổi văn bản thành vector số; MultinomialNB (Naive Bayes) cho phân loại giao dịch; LinearRegression cho dự đoán dòng tiền; IsolationForest cho phát hiện bất thường; và các utilities như train_test_split, classification_report, mean_absolute_error để đánh giá mô hình.

## 2.4 Khảo sát các hệ thống tương tự

### 2.4.1 Mint

Mint là ứng dụng quản lý tài chính miễn phí phổ biến nhất tại Mỹ, do Intuit phát triển. Mint có các tính năng: tự động import giao dịch từ ngân hàng, theo dõi điểm tín dụng, lập ngân sách tự động, cảnh báo hóa đơn và hạn thanh toán. Tuy nhiên, Mint có hạn chế: giao diện chủ yếu bằng tiếng Anh, không hỗ trợ tiếng Việt, không có tính năng AI dự đoán, và không có chatbot tư vấn.

### 2.4.2 YNAB (You Need A Budget)

YNAB là phương pháp quản lý ngân sách theo nguyên tắc "lập kế hoạch cho từng đồng tiền trước khi chi tiêu". YNAB cung cấp: phương pháp 4 quy tắc (Give every dollar a job, Save for a rainy day, Roll with the punches, Live on last month's income), hỗ trợ nhiều người dùng cùng lúc, báo cáo chi tiết. Nhược điểm: phí subscription cao ($14.99/tháng), không có AI, không hỗ trợ tiếng Việt.

### 2.4.3 Money Lover (Ví của tôi)

Money Lover là ứng dụng Việt Nam, hỗ trợ tiếng Việt tốt, giao diện đơn giản, có phiên bản miễn phí và trả phí. Tính năng: ghi chép thu chi nhanh, quản lý ví nhiều loại tiền, lập kế hoạch tiết kiệm, báo cáo thống kê. Hạn chế: thiếu AI phân loại tự động thông minh, không có chatbot, không có dự đoán dòng tiền.

### 2.4.4 Bảng so sánh tính năng

| Tính năng | Mint | YNAB | Money Lover | Hệ thống đề xuất |
|---|---|---|---|---|
| Ghi chép thu chi | Có | Có | Có | Có |
| Quản lý ngân sách | Có | Có | Có | Có |
| Báo cáo thống kê | Có | Có | Có | Có |
| Hỗ trợ tiếng Việt | Không | Không | Có | Có |
| Phân loại tự động (AI) | Cơ bản | Không | Không | Nâng cao |
| Dự đoán dòng tiền | Không | Không | Không | Có |
| Phát hiện bất thường | Không | Không | Không | Có |
| Chatbot tư vấn | Không | Không | Không | Có |
| Chi phí | Miễn phí | $14.99/tháng | Miễn phí | Miễn phí |

Qua khảo sát, có thể thấy điểm khác biệt cốt lõi của hệ thống đề xuất là tích hợp sâu AI vào quản lý tài chính cá nhân, bao gồm phân loại tự động, dự đoán và chatbot — điều mà các hệ thống hiện tại chưa hoặc chỉ làm ở mức cơ bản.
