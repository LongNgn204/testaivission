TRƯỜNG ĐẠI HỌC SƯ PHẠM HÀ NỘI

  

KHOA SƯ PHẠM KỸ THUẬT
PHÁT TRIỂN HỆ THỐNG TƯƠNG TÁC GIỌNG NÓI VÀ PHÂN TÍCH DỮ LIỆU THỊ LỰC ỨNG DỤNG MÔ HÌNH NGÔN NGỮ LỚN (LLM)
Sinh viên thực hiện: Trịnh Linh Nga


HÀ NỘI, 11/2025
BỘ GIÁO DỤC VÀ ĐÀO TẠO
TRƯỜNG ĐẠI HỌC SƯ PHẠM HÀ NỘI
 

HỌ VÀ TÊN
Trịnh Linh Nga
PHÁT TRIỂN HỆ THỐNG TƯƠNG TÁC GIỌNG NÓI VÀ PHÂN TÍCH DỮ LIỆU THỊ LỰC ỨNG DỤNG MÔ HÌNH NGÔN NGỮ LỚN (LLM)

Học phần: Đồ án công nghệ – STEM
Mã số: TECH477-‘K72SPCN.02_LT
ĐỒ ÁN CÔNG NGHỆ - GIÁO DỤC STEM
Người hướng dẫn khoa học: Ths. Phùng Công Phi Khanh
HÀ NỘI, NĂM 2025



LỜI CAM ĐOAN
Tôi xin cam đoan bản đồ án này là kết quả nghiên cứu của cá nhân tôi. Các số liệu và tài liệu được trích dẫn trong đồ án là trung thực. Kết quả nghiên cứu này không trùng với bất cứ công trình nào đã được công bố trước đó. 
Tôi chịu trách nhiệm với lời cam đoan của mình.

Hà Nội, tháng     năm 20












LỜI CẢM ƠN
Đồ án tốt nghiệp này là kết quả của quá trình học tập, nghiên cứu nghiêm túc và sự nỗ lực không ngừng nghỉ. Để hoàn thành đồ án này, tôi đã nhận được sự quan tâm, giúp đỡ và hướng dẫn tận tình từ quý Thầy Cô và bạn bè.
Trước hết, tôi xin bày tỏ lòng biết ơn sâu sắc đến ThS. Phùng Công Phi Khanh, người đã trực tiếp hướng dẫn, định hướng đề tài và tận tình chỉ bảo tôi trong suốt quá trình thực hiện nghiên cứu.
Tôi xin chân thành cảm ơn Ban Giám hiệu Trường Đại học Sư phạm Hà Nội và các Thầy Cô giáo trong Khoa Kỹ thuật và Công nghệ đã trang bị cho tôi những kiến thức nền tảng vững chắc và tạo điều kiện thuận lợi về cơ sở vật chất để tôi hoàn thành tốt khóa học.
Cuối cùng, tôi xin gửi lời cảm ơn đến gia đình và các thành viên trong cộng đồng mã nguồn mở đã luôn động viên, chia sẻ tài nguyên và hỗ trợ tôi vượt qua những khó khăn về mặt kỹ thuật.
Dù đã rất cố gắng, nhưng do giới hạn về thời gian và kiến thức, đồ án khó tránh khỏi những thiếu sót. Tôi rất mong nhận được những ý kiến đóng góp quý báu của quý Thầy Cô và các bạn để đề tài được hoàn thiện hơn.
Xin trân trọng cảm ơn!
Sinh viên thực hiện
Trịnh Linh Nga





MỤC LỤC
LỜI CAM ĐOAN 
LỜI CẢM ƠN 
DANH MỤC CÁC TỪ VIẾT TẮT 
MỞ ĐẦU
	Lý do chọn đề tài
	Mục đích nghiên cứu
	Khách thể và đối tượng nghiên cứu
	Giả thuyết khoa học
	Nhiệm vụ nghiên cứu
	Giới hạn phạm vi nghiên cứu
	Phương pháp nghiên cứu
	Đóng góp mới của đồ án
	Cấu trúc đồ án

 
 
DANH MỤC CÁC TỪ VIẾT TẮT

Từ viết tắt	Tiếng Anh	Tiếng Việt
AI	Artificial Intelligence	Trí tuệ nhân tạo
AMD	Age-related Macular Degeneration	Thoái hóa điểm vàng tuổi già
API	Application Programming Interface	Giao diện lập trình ứng dụng
CSRF	Cross-Site Request Forgery	Giả mạo yêu cầu chéo trang
DOM	Document Object Model	Mô hình đối tượng tài liệu
JWT	JSON Web Token	Mã thông báo web JSON
LLM	Large Language Model	Mô hình ngôn ngữ lớn
PWA	Progressive Web App	Ứng dụng web tiến bộ
RSC	React Server Components	Thành phần máy chủ React
STEM	Science, Technology, Engineering, Math	Khoa học, Công nghệ, Kỹ thuật, Toán
TTS	Text-to-Speech	Chuyển đổi văn bản thành giọng nói
WHO	World Health Organization	Tổ chức Y tế Thế giới
XSS	Cross-Site Scripting	Tấn công chèn mã độc













TÓM TẮT ĐỒ ÁN
Tên đề tài: Phát triển hệ thống tương tác giọng nói và phân tích dữ liệu thị lực ứng dụng mô hình ngôn ngữ lớn (LLM).
Sinh viên thực hiện: Trịnh Linh Nga Lớp: K72 - Sư phạm Công nghệ
Nội dung tóm tắt:
Đồ án tập trung nghiên cứu và phát triển "Vision Coach" (Phiên bản 2.3.0)- một nền tảng Web Application (PWA) toàn diện hỗ trợ kiểm tra và tư vấn sức khỏe thị lực cộng đồng. Trong bối cảnh các bệnh lý khúc xạ gia tăng nhanh chóng, hệ thống cung cấp giải pháp tiếp cận y tế số "không chạm", tích hợp bộ 5 bài kiểm tra tiêu chuẩn lâm sàng (Snellen, Ishihara, Amsler, Astigmatism, Duochrome).
Điểm đột phá của đồ án là việc ứng dụng Mô hình ngôn ngữ lớn (LLM - Llama 3.1) để xây dựng trợ lý ảo y tế "Dr. Eva". Hệ thống có khả năng phân tích dữ liệu thị lực thô, đối chiếu với lịch sử người dùng và đưa ra các khuyến nghị y tế cá nhân hóa với độ chính xác cao. Đồng thời, tính năng tương tác giọng nói (Voice Interface) được tích hợp sâu giúp xóa bỏ rào cản công nghệ cho người cao tuổi và người khiếm thị.
Về mặt kỹ thuật, ứng dụng được xây dựng trên kiến trúc Serverless Edge Computing (Cloudflare Workers) và Frontend hiện đại (React 19), đảm bảo hiệu năng vượt trội, độ trễ thấp và khả năng bảo mật dữ liệu y tế theo tiêu chuẩn.
Từ khóa: Telemedicine, AI Vision Test, React 19, Cloudflare Workers, Llama 3.1, Voice Control. 
 

SCAN MÃ QR TRANG WEB, 
HOẶC LINK WEB: https://testaivision.pages.dev/









MỞ ĐẦU
1. Lý do chọn đề tài
Trong kỷ nguyên số, thị lực con người đang chịu áp lực chưa từng có do sự bùng nổ của các thiết bị điện tử và lối sống đô thị hóa. Tại Việt Nam, tỷ lệ tật khúc xạ, đặc biệt là cận thị học đường và các bệnh lý như thoái hóa điểm vàng (AMD), đang gia tăng ở mức báo động. Mặc dù nhu cầu chăm sóc mắt là rất lớn, hệ thống y tế hiện tại vẫn gặp nhiều hạn chế về sự phân bố địa lý và tình trạng quá tải cục bộ, khiến người dân khó tiếp cận dịch vụ chẩn đoán sớm.
Bên cạnh đó, sự phát triển của Trí tuệ nhân tạo (AI), đặc biệt là các Mô hình ngôn ngữ lớn (LLM) và kiến trúc điện toán biên (Edge Computing), đã mở ra cơ hội mới cho lĩnh vực Y tế số (Digital Health). Xuất phát từ thực tiễn trên, đề tài "Phát triển hệ thống tương tác giọng nói và phân tích dữ liệu thị lực ứng dụng mô hình ngôn ngữ lớn (LLM)" (Ứng dụng Vision Coach) được lựa chọn nghiên cứu nhằm cung cấp giải pháp sàng lọc thị lực tự động, dễ tiếp cận và có độ tin cậy cao.
2. Mục đích nghiên cứu
Mục đích cốt lõi của đồ án là xây dựng một nền tảng Web Application (PWA) toàn diện, tích hợp trí tuệ nhân tạo để:
	Số hóa quy trình kiểm tra thị lực chuẩn y khoa (Snellen, Ishihara, Amsler) lên môi trường web.
	Tự động hóa việc phân tích kết quả và cung cấp tư vấn y tế cá nhân hóa thông qua trợ lý ảo AI.
	Xóa bỏ rào cản tiếp cận công nghệ thông qua giao diện tương tác giọng nói, hỗ trợ người cao tuổi và người khiếm thị.
3. Khách thể và đối tượng nghiên cứu
	Khách thể nghiên cứu: Nhu cầu chăm sóc sức khỏe thị lực cộng đồng; quy trình khám nghiệm nhãn khoa lâm sàng cơ bản.
	Đối tượng nghiên cứu: Hệ thống ứng dụng web "Vision Coach"; các thuật toán số hóa bài kiểm tra thị lực; kỹ thuật Prompt Engineering trên mô hình Llama 3.1.
4. Giả thuyết khoa học
Nếu kết hợp các bài kiểm tra thị lực được số hóa dựa trên nguyên lý quang học chuẩn với khả năng phân tích ngữ nghĩa của Mô hình ngôn ngữ lớn (LLM) và cơ sở dữ liệu y khoa chính thống, thì có thể xây dựng được một hệ thống sàng lọc thị lực trực tuyến có độ chính xác tương đương với các phương pháp sơ cứu lâm sàng, đồng thời nâng cao đáng kể nhận thức và hành vi chăm sóc mắt chủ động của người dùng.
5. Nhiệm vụ nghiên cứu
	Nghiên cứu lý thuyết: Tổng hợp tiêu chuẩn WHO/AAO và công nghệ React 19, Cloudflare.
	Xây dựng hệ thống: Phát triển ứng dụng Vision Coach với đầy đủ module kiểm tra.
	Tích hợp AI: Huấn luyện trợ lý ảo Dr. Eva đảm bảo tư vấn an toàn.
	Thực nghiệm: Triển khai thử nghiệm và đánh giá hiệu năng.
6. Phạm vi và Phương pháp nghiên cứu
	Phạm vi: Các bài test sàng lọc (Screening) tật khúc xạ, mù màu trên nền tảng Web.
	Phương pháp: Nghiên cứu tài liệu, Mô hình hóa hệ thống (UML), Thực nghiệm phần mềm.
7. Cấu trúc đồ án
Đồ án gồm 3 chương chính:
	Chương I: Tổng quan nghiên cứu và Cơ sở lý thuyết.
	Chương II: Phân tích, thiết kế và xây dựng hệ thống.
	Chương III: Kết quả thực nghiệm và đánh giá.

 


CHƯƠNG I. TỔNG QUAN NGHIÊN CỨU VÀ CƠ SỞ LÝ THUYẾT
1.1. Tổng quan về các phương pháp kiểm tra thị lực và bệnh học nhãn khoa
1.1.1. Cơ chế sinh học của hệ thống thị giác
Thị giác là giác quan quan trọng nhất của con người, chiếm khoảng 80% lượng thông tin thu nhận từ thế giới bên ngoài. Quá trình nhìn bắt đầu khi ánh sáng đi qua giác mạc, thủy tinh thể và hội tụ trên võng mạc. Tại đây, các tế bào cảm thụ ánh sáng (tế bào nón và tế bào que) chuyển đổi tín hiệu quang học thành tín hiệu thần kinh, truyền qua dây thần kinh thị giác về vỏ não thùy chẩm để xử lý.
Bất kỳ sai lệch nào trong hệ thống quang học này (giác mạc quá cong, trục nhãn cầu quá dài...) đều dẫn đến các tật khúc xạ. Theo thống kê của Tổ chức Y tế Thế giới (WHO) năm 2024, có khoảng 2.2 tỷ người trên toàn cầu bị suy giảm thị lực, trong đó ít nhất 1 tỷ trường hợp có thể phòng ngừa hoặc chưa được điều trị kịp thời.
 
Hình 1.1. Cấu tạo giải phẫu của mắt người và cơ chế khúc xạ.

1.1.2. Đo thị lực (Visual Acuity - VA) và Bảng Snellen
a. Lịch sử và Nguyên lý: Được phát triển bởi bác sĩ nhãn khoa người Hà Lan Hermann Snellen vào năm 1862, bảng Snellen vẫn là "tiêu chuẩn vàng" trong khám nghiệm thị lực. Nguyên lý của bảng dựa trên khái niệm "góc thị giác" (visual angle). Một ký tự trên bảng Snellen được thiết kế sao cho ở khoảng cách chuẩn (thường là 20 feet hoặc 6 mét), toàn bộ ký tự chắn một góc 5 phút cung (5 arcminutes), và nét của ký tự chắn một góc 1 phút cung (1 arcminute).
b. Công thức tính thị lực: Thị lực thường được ghi dưới dạng phân số Snellen: 
V A=d/D
Trong đó:
	d: Khoảng cách thực tế người đo đứng (thường là 6m hoặc 20ft).
	D: Khoảng cách mà một người có thị lực bình thường có thể đọc được dòng chữ đó. Ví dụ: Thị lực 20/200 nghĩa là ở khoảng cách 20 feet, bệnh nhân chỉ đọc được chữ cái mà người bình thường có thể đọc rõ từ khoảng cách 200 feet. Đây là ngưỡng của mù lòa pháp lý tại Hoa Kỳ.
c. Thách thức khi số hóa trên nền tảng Web: Khác với bảng in vật lý có kích thước cố định, việc hiển thị bảng Snellen trên màn hình máy tính gặp phải vấn đề về mật độ điểm ảnh (PPI - Pixels Per Inch) khác nhau giữa các thiết bị. Để giải quyết vấn đề này, đồ án sử dụng thuật toán quy đổi kích thước vật lý sang pixel dựa trên công thức: 
Px=Size(mm)×PPI/25.4

Hệ thống yêu cầu người dùng thực hiện bước hiệu chuẩn (Calibration) bằng một vật thể có kích thước chuẩn (thẻ ATM/CCCD) để xác định chính xác chỉ số PPI của màn hình thiết bị.
1.1.3. Tính cấp thiết của đề tài
Trong kỷ nguyên số, đôi mắt của con người đang phải chịu áp lực chưa từng có. Sự bùng nổ của các thiết bị điện tử, thời gian làm việc trước màn hình kéo dài và lối sống đô thị hóa đã dẫn đến sự gia tăng đột biến các bệnh lý về mắt. Tại Việt Nam, tình trạng này đang trở nên đáng báo động. Theo các thống kê y tế gần đây, tỷ lệ tật khúc xạ (cận thị, viễn thị, loạn thị) đang gia tăng nhanh chóng, đặc biệt là ở lứa tuổi học đường và người lao động trí óc.1 Một khảo sát tại Hà Nội cho thấy tỷ lệ trẻ em mắc tật khúc xạ lên tới 51%, trong đó cận thị chiếm đa số.1 Bên cạnh đó, các bệnh lý nguy hiểm gây mù lòa như thoái hóa điểm vàng (AMD) hay Glôcôm cũng đang có xu hướng trẻ hóa.1
Mặc dù nhu cầu chăm sóc mắt là rất lớn, nhưng khả năng đáp ứng của hệ thống y tế hiện tại còn nhiều hạn chế. Các bệnh viện chuyên khoa mắt thường tập trung ở các thành phố lớn, gây khó khăn cho người dân ở vùng sâu, vùng xa trong việc tiếp cận dịch vụ.2 Hơn nữa, tình trạng quá tải bệnh viện khiến quy trình khám chữa bệnh trở nên tốn kém thời gian và công sức. Trong bối cảnh đó, Telemedicine (Y tế từ xa) nổi lên như một giải pháp cứu cánh, giúp xóa bỏ rào cản địa lý và giảm tải cho hệ thống y tế công.2 Tuy nhiên, phần lớn các ứng dụng Telemedicine hiện nay tại Việt Nam mới chỉ dừng lại ở mức kết nối cuộc gọi video giữa bác sĩ và bệnh nhân, thiếu vắng các công cụ hỗ trợ chẩn đoán lâm sàng tự động, chính xác và có khả năng hoạt động độc lập.4
Đề tài "Vision Coach" ra đời nhằm lấp đầy khoảng trống này bằng cách cung cấp một công cụ kiểm tra thị lực "không chạm", tự động hóa và thông minh, giúp người dùng chủ động sàng lọc sức khỏe mắt ngay tại nhà với độ tin cậy cao.
1.1.4. Cơ sở lý thuyết về sắc giác và bài test Ishihara
a. Phân loại mù màu: Thị giác màu của con người dựa trên thuyết ba màu (Trichromatic theory) với ba loại tế bào nón nhạy cảm với ánh sáng Đỏ (L-cones), Xanh lá (M-cones) và Xanh dương (S-cones). Sự thiếu hụt hoặc bất thường của các sắc tố quang học trong tế bào nón dẫn đến các dạng mù màu:
	Protanopia/Protanomaly: Mù/Yếu màu đỏ.
	Deuteranopia/Deuteranomaly: Mù/Yếu màu xanh lá (phổ biến nhất).
	Tritanopia/Tritanomaly: Mù/Yếu màu xanh dương (hiếm gặp).
b. Nguyên lý bài test Ishihara: Bài test do bác sĩ Shinobu Ishihara (ĐH Tokyo) phát triển năm 1917. Nó sử dụng các tấm giả đẳng sắc (pseudo-isochromatic plates). Mỗi tấm chứa một vòng tròn các chấm màu có kích thước và độ sáng ngẫu nhiên.
	Tấm biến đổi (Transformation plates): Người bình thường nhìn thấy một số, người mù màu nhìn thấy số khác.
	Tấm ẩn (Vanishing plates): Chỉ người bình thường mới thấy số.
	Tấm ẩn giấu (Hidden digit plates): Chỉ người mù màu mới thấy số. Việc triển khai trên màn hình đòi hỏi việc quản lý không gian màu (sRGB) chính xác để đảm bảo các sắc thái màu (hues) không bị sai lệch do tấm nền màn hình.
1.1.5. Lưới Amsler và bệnh lý Hoàng điểm
Lưới Amsler là một mạng lưới các ô vuông (thường là kích thước 10x10cm), dùng để kiểm tra 20 độ trung tâm của thị trường. Đây là công cụ đơn giản nhưng nhạy bén nhất để phát hiện sớm Thoái hóa hoàng điểm tuổi già (AMD) và Phù hoàng điểm do đái tháo đường. Dấu hiệu bệnh lý trên lưới Amsler bao gồm:
	Metamorphopsia: Các đường thẳng bị nhìn thấy cong, méo mó.
	Scotoma: Xuất hiện các điểm đen hoặc vùng mất thị lực.
1.2. Cơ sở công nghệ và Nền tảng kỹ thuật
1.2.1. React 19 và Hệ sinh thái Frontend hiện đại
a. Tại sao chọn React 19? Trong bối cảnh phát triển Web App y tế, độ mượt mà của giao diện (UI Fluidity) và tốc độ phản hồi là yếu tố sống còn. React 19 (ra mắt 2024) mang đến những cải tiến mang tính cách mạng so với các phiên bản trước:
	React Compiler (Tự động Memoization): Trước đây, lập trình viên phải thủ công sử dụng useMemo và useCallback để tối ưu hiệu năng, tránh việc re-render không cần thiết. React 19 tích hợp Compiler tự động phân tích luồng dữ liệu, giúp giảm 30-40% lượng code boilerplate và tăng hiệu năng render lên đáng kể. Điều này đặc biệt quan trọng với bài test Snellen khi các ký tự cần thay đổi tức thì mà không có độ trễ (jank).
	Server Components (RSC): Cho phép render các component nặng ngay trên server và stream HTML về client. Kỹ thuật này giúp giảm kích thước bundle JavaScript (Bundle Size) ban đầu, cải thiện chỉ số First Contentful Paint (FCP) và Time to Interactive (TTI), giúp ứng dụng chạy mượt trên cả các điện thoại tầm trung.
b. Cơ chế quản lý trạng thái (State Management): Đồ án không sử dụng Redux (quá cồng kềnh) mà tận dụng React Context API kết hợp với Hooks (useReducer) để quản lý trạng thái cục bộ của từng bài test và trạng thái toàn cục (User Session).
1.2.2. Kiến trúc Serverless và Điện toán biên (Edge Computing) với Cloudflare Workers
a. So sánh Mô hình Server truyền thống và Serverless:
	Mô hình truyền thống (Monolithic/VPS): Yêu cầu thuê máy chủ cố định, tốn kém chi phí duy trì 24/7 ngay cả khi không có người dùng, khó mở rộng (scale) tức thì khi lượng truy cập tăng đột biến.
	Mô hình Serverless (FaaS): Chỉ chạy code khi có request. Tuy nhiên, các nền tảng như AWS Lambda thường gặp vấn đề "Cold Start" (thời gian khởi động container mất 200ms - 1s).
b. Ưu điểm của Cloudflare Workers: Đồ án lựa chọn Cloudflare Workers vì kiến trúc V8 Isolates. Thay vì khởi chạy một container Linux ảo (như Docker), Workers chạy code trực tiếp trên engine V8 của Chrome đã được tối ưu hóa.
	Zero Cold Start: Thời gian khởi động < 5ms.
	Global Distribution: Code được deploy tự động tới hơn 300 thành phố trên thế giới. Người dùng ở Việt Nam sẽ được phục vụ bởi server tại Hà Nội hoặc TP.HCM thay vì Singapore hay Mỹ, giảm độ trễ (latency) xuống mức thấp nhất (< 30ms).
c. Cơ sở dữ liệu D1 (Distributed SQLite): D1 là cơ sở dữ liệu SQL đầu tiên được thiết kế cho Edge. Nó cho phép thực hiện các truy vấn quan hệ (Relational Queries) phức tạp nhưng vẫn đảm bảo tốc độ truy xuất nhanh nhờ cơ chế Read Replication (nhân bản dữ liệu đọc) tự động.
1.2.3. Trí tuệ nhân tạo tạo sinh (Generative AI) và Mô hình ngôn ngữ lớn (LLM)
a. Kiến trúc Transformer: Hệ thống sử dụng các mô hình LLM dựa trên kiến trúc Transformer (được Google giới thiệu năm 2017). Kiến trúc này sử dụng cơ chế "sự chú ý" (Self-Attention) để hiểu mối liên hệ ngữ nghĩa giữa các từ trong một câu văn dài, thay vì xử lý tuần tự như các mạng RNN cũ.
b. Mô hình Llama 3.1 8B: Đồ án lựa chọn Llama 3.1 (phiên bản 8 tỷ tham số) của Meta vì sự cân bằng hoàn hảo giữa hiệu năng và chi phí:
	Khả năng suy luận y khoa: Llama 3.1 đã được huấn luyện trên tập dữ liệu khổng lồ bao gồm các văn bản y khoa, cho phép nó hiểu và giải thích các thuật ngữ chuyên ngành.
	Tốc độ phản hồi: Với kích thước 8B, mô hình có thể chạy cực nhanh trên hạ tầng Workers AI, cho phép tạo ra báo cáo dài 500 từ chỉ trong 2-3 giây.
c. Kỹ thuật Prompt Engineering trong Y tế: Để đảm bảo an toàn, đồ án áp dụng kỹ thuật Chain-of-Thought (CoT) prompting. Thay vì hỏi AI "Kết quả này là bệnh gì?", hệ thống yêu cầu AI thực hiện từng bước suy luận:
	Phân tích dữ liệu thô.
	Đối chiếu với bảng tiêu chuẩn.
	Loại trừ các trường hợp ngoại lệ.
	Đưa ra kết luận và khuyến nghị.
1.2.4. Công nghệ Tương tác Giọng nói (Web Speech API)
Web Speech API là một giao diện lập trình ứng dụng tiêu chuẩn của W3C, bao gồm hai phần chính:
	SpeechRecognition (Nhận dạng giọng nói): Chuyển đổi sóng âm thanh từ microphone thành văn bản (Text). Đồ án sử dụng chế độ continuous: false để nhận lệnh ngắn gọn từ người dùng (ví dụ: "Chữ E quay lên", "Không nhìn thấy").
	SpeechSynthesis (Tổng hợp giọng nói): Chuyển đổi văn bản phản hồi từ AI thành âm thanh. Điều này giúp tạo ra trải nghiệm hai chiều, đặc biệt hữu ích cho người dùng có thị lực kém không thể đọc màn hình.
1.3. Tổng kết chương 1
Chương 1 đã trình bày chi tiết cơ sở lý thuyết y sinh học của các phương pháp đo thị lực cũng như nền tảng công nghệ tiên tiến được sử dụng trong đồ án. Sự kết hợp giữa các nguyên lý quang học cổ điển (Snellen, Ishihara) với sức mạnh tính toán hiện đại (Cloudflare Workers, AI LLM) tạo nên tiền đề vững chắc cho việc thiết kế và xây dựng hệ thống Vision Coach được trình bày trong Chương 2.
CHƯƠNG II. PHÂN TÍCH, THIẾT KẾ VÀ XÂY DỰNG HỆ THỐNG
2.1. Phân tích yêu cầu hệ thống
2.1.1. Yêu cầu chức năng (Functional Requirements)
Dựa trên khảo sát nhu cầu người dùng và quy trình khám mắt lâm sàng, hệ thống Vision Coach cần đáp ứng các nhóm chức năng sau:
a. Nhóm chức năng dành cho Người dùng (Patient/User):
	Quản lý tài khoản: Đăng ký, đăng nhập (xác thực qua số điện thoại/email), cập nhật hồ sơ sức khỏe (tuổi, tiền sử bệnh lý).
	Thực hiện bài kiểm tra (Testing):
	Thực hiện các bài test tiêu chuẩn: Snellen (thị lực xa), Ishihara (mù màu), Amsler (hoàng điểm), Astigmatism (loạn thị).
	Tương tác bằng giọng nói (Voice Command) để điều khiển bài test không cần chạm tay.
	Xem kết quả và Báo cáo:
	Xem điểm số thị lực ngay sau khi test.
	Nhận báo cáo phân tích chi tiết từ AI (Dr. Eva).
	Theo dõi biểu đồ tiến trình sức khỏe theo thời gian.
	Trợ lý ảo y tế: Chat trực tiếp với AI để hỏi đáp về các triệu chứng mắt và nhận lời khuyên phòng ngừa.
b. Nhóm chức năng dành cho Quản trị viên (Admin):
	Dashboard tổng quan: Thống kê số lượng người dùng mới, tổng số bài test đã thực hiện.
	Quản lý dữ liệu: Xem danh sách người dùng, can thiệp hoặc xóa các hồ sơ spam/không hợp lệ.
	Cấu hình hệ thống: Tinh chỉnh các tham số của bài test (ví dụ: ngưỡng điểm cảnh báo) mà không cần can thiệp vào code.
2.1.2. Yêu cầu phi chức năng (Non-functional Requirements)
	Hiệu năng (Performance):
	Thời gian tải trang ban đầu (Initial Load Time) < 1.5 giây.
	Độ trễ phản hồi của các thao tác tương tác trên bài test < 50ms (để đảm bảo tính chính xác khi user phản xạ).
	Hệ thống Backend phải đạt chuẩn "Zero Cold Start" để phục vụ tức thì.
	Độ tin cậy (Reliability):
	Hệ thống hoạt động ổn định 24/7 (Uptime 99.9%).
	Dữ liệu kết quả đo phải được lưu trữ toàn vẹn, không bị mất mát khi mất kết nối mạng đột ngột (Offline capability của PWA).
	Bảo mật (Security):
	Tuân thủ tiêu chuẩn bảo mật dữ liệu y tế cơ bản.
	Mã hóa thông tin cá nhân người dùng.
	Chống các cuộc tấn công phổ biến: SQL Injection, XSS, CSRF.
2.2. Mô hình hóa hệ thống bằng ngôn ngữ UML
Để hiện thực hóa các yêu cầu trên, đồ án sử dụng Ngôn ngữ mô hình hóa thống nhất (UML) để thiết kế chi tiết.
2.2.1. Biểu đồ Ca sử dụng (Use Case Diagram)
Biểu đồ Use Case cung cấp cái nhìn tổng quan về các tác nhân (Actors) và chức năng của hệ thống.
Mô tả các tác nhân:
	Guest (Khách): Người chưa đăng nhập, chỉ có thể xem trang chủ và thông tin giới thiệu.
	User (Người dùng): Người đã đăng nhập, có quyền thực hiện test và xem hồ sơ cá nhân.
	AI Service (Dr. Eva): Tác nhân hệ thống, tự động phân tích và phản hồi.
	Admin (Quản trị viên): Có toàn quyền quản lý hệ thống.
Giải thích biểu đồ: Tác nhân User có mối quan hệ <<include>> với Use Case "Đăng nhập" khi thực hiện chức năng "Lưu kết quả". Use Case "Phân tích kết quả" có mối quan hệ <<extend>> với tác nhân AI Service, nghĩa là AI chỉ tham gia khi có yêu cầu phân tích chuyên sâu.
2.2.2. Biểu đồ Hoạt động (Activity Diagram) - Quy trình Test Snellen
Đây là quy trình nghiệp vụ quan trọng nhất của hệ thống, mô tả thuật toán thích ứng (Adaptive Algorithm) của bài đo thị lực.
Luồng sự kiện:
	Bắt đầu: Hệ thống khởi tạo bài test ở mức thị lực 20/100 (Chữ cái lớn).
	Hiển thị: Random một ký tự chữ E (trên, dưới, trái, phải).
	Người dùng phản hồi: Nhập hướng của chữ E (qua bàn phím hoặc giọng nói).
	Kiểm tra đúng/sai:
	Nếu Đúng: Tăng bộ đếm đúng. Nếu số câu đúng > 3, chuyển xuống mức thị lực khó hơn (ví dụ 20/70).
	Nếu Sai: Tăng bộ đếm sai. Nếu số câu sai > 2, dừng bài test tại mức hiện tại.
	Kết thúc: Tính toán chỉ số thị lực (Visual Acuity Score) và lưu vào Database.
2.2.3. Biểu đồ Tuần tự (Sequence Diagram) - Chức năng AI Analysis
Biểu đồ này mô tả chi tiết sự tương tác giữa các đối tượng trong hệ thống khi người dùng yêu cầu AI phân tích kết quả.
Các đối tượng tham gia:
	Client (React UI): Giao diện người dùng.
	APIGateway (Worker): Cổng tiếp nhận request.
	AuthMiddleware: Bộ kiểm tra quyền truy cập.
	AIService: Service xử lý logic AI.
	LlamaModel (External): API của mô hình ngôn ngữ lớn.
	Database (D1): Nơi lưu trữ lịch sử.
Luồng thông điệp:
	Client gửi request POST /api/analyze kèm theo test_result_id.
	AuthMiddleware kiểm tra JWT Token. Nếu hợp lệ -> chuyển tiếp.
	AIService truy vấn Database để lấy history_records (lịch sử khám) của user.
	AIService tạo Prompt (kết hợp kết quả hiện tại + lịch sử).
	AIService gửi Prompt đến LlamaModel.
	LlamaModel trả về chuỗi JSON phân tích.
	AIService validate định dạng JSON và trả về cho Client hiển thị.
2.3. Thiết kế Cơ sở dữ liệu (Database Design)
Hệ thống sử dụng Cloudflare D1, một cơ sở dữ liệu quan hệ dựa trên SQLite, được thiết kế tối ưu cho các truy vấn tại biên (Edge).
2.3.1. Sơ đồ Thực thể - Liên kết (ERD)
Hệ thống bao gồm các thực thể chính: Users, TestResults, AiReports, Routines.
Mối quan hệ:
	Một User có nhiều TestResults (quan hệ 1-n).
	Một TestResult có thể có một AiReport tương ứng (quan hệ 1-1).
	Một User có một Routine (lộ trình chăm sóc) duy nhất tại một thời điểm (quan hệ 1-1).
2.3.2. Chi tiết các bảng dữ liệu (Data Dictionary)
a. Bảng users (Người dùng) 
Tên trường	Kiểu dữ liệu	Ràng buộc	Mô tả
id	TEXT (UUID)	PK, Not Null	Mã định danh duy nhất (Guid)
phone	TEXT	Unique, Not Null	Số điện thoại đăng nhập
password	TEXT	Not Null	Mật khẩu đã mã hóa (Bcrypt)
full_name	TEXT	Nullable	Tên hiển thị
yob	INTEGER	Check > 1900	Năm sinh (quan trọng để tính lão thị)
gender	TEXT	'Nam'/'Nu'	Giới tính
created_at	INTEGER	Default Now	Thời điểm tạo (Unix Timestamp)

b. Bảng test_results (Kết quả kiểm tra) 
Tên trường	Kiểu dữ liệu	Ràng buộc	Mô tả
id	TEXT (UUID)	PK, Not Null	Mã kết quả
user_id	TEXT	FK (users.id)	Người thực hiện test
type	TEXT	Not Null	Loại test ('SNELLEN', 'ISHIHARA',...)
score	REAL	Not Null	Điểm số quy đổi (0-100)
details	TEXT (JSON)	Not Null	Dữ liệu chi tiết (VD: Mắt trái 20/30, Mắt phải 20/20)
severity	TEXT	'LOW'/'HIGH'	Mức độ nghiêm trọng do hệ thống đánh giá

c. Bảng ai_reports (Báo cáo AI) 
Lưu trữ cache kết quả phân tích của AI để tránh gọi API nhiều lần tốn phí. 
Tên trường	Kiểu dữ liệu	Mô tả
id	TEXT	Khóa chính
result_id	TEXT (FK)	Liên kết với bảng kết quả
content	TEXT	Nội dung phân tích đầy đủ (định dạng Markdown)
recommendations	TEXT (JSON)	Danh sách các lời khuyên dạng mảng

2.4. Thiết kế Kiến trúc phần mềm và Công nghệ
Hệ thống được thiết kế theo mô hình Micro-frontend kết hợp Serverless Microservices.
2.4.1. Cấu trúc thư mục dự án (Project Structure)
Mã nguồn được tổ chức khoa học để dễ dàng bảo trì và mở rộng:

/src
├── components        # Các UI component nhỏ (Button, Card)
├── features          # Các module chức năng lớn
│   ├── snellen-test  # Logic bài test thị lực
│   ├── dashboard     # Logic biểu đồ
│   └── ai-chat       # Logic Chatbot
├── hooks             # Custom React Hooks (useAuth, useVoice)
├── services          # Các hàm gọi API (AIService, StorageService)
└── worker            # Backend code (Cloudflare Workers)
├── handlers      # Xử lý logic từng endpoint
└── schema.sql    # Định nghĩa database
2.4.2. Thiết kế logic Dr. Eva (AI Persona Design)
Để biến mô hình ngôn ngữ Llama 3.1 thành "Dr. Eva", hệ thống sử dụng kỹ thuật System Prompt Injection. Mỗi khi người dùng chat, hệ thống âm thầm chèn đoạn chỉ dẫn sau vào đầu ngữ cảnh:
System Prompt (Trích đoạn): "Bạn là Dr. Eva, một chuyên gia nhãn khoa AI tận tâm và chuyên nghiệp. Nhiệm vụ của bạn là phân tích dữ liệu thị lực JSON được cung cấp và đưa ra lời khuyên. QUY TẮC AN TOÀN:
	Không bao giờ đưa ra chẩn đoán y khoa khẳng định (ví dụ: 'Bạn bị ung thư mắt'). Chỉ dùng từ ngữ cảnh báo nguy cơ.
	Nếu chỉ số Snellen dưới 20/50, BẮT BUỘC khuyến nghị người dùng đến bệnh viện.
	Trả lời ngắn gọn, đồng cảm, sử dụng tiếng Việt chuẩn."
2.5. Kết luận chương 2
Chương 2 đã hoàn thành việc mô hình hóa chi tiết hệ thống Vision Coach từ mức độ yêu cầu người dùng đến thiết kế cơ sở dữ liệu và thuật toán xử lý. Các biểu đồ UML và sơ đồ thiết kế được trình bày là cơ sở vững chắc để tiến hành cài đặt và lập trình hệ thống trong Chương 3. Việc thiết kế database chuẩn hóa và kiến trúc serverless ngay từ đầu sẽ đảm bảo hệ thống có khả năng mở rộng và hiệu năng cao như mục tiêu đã đề ra.

CHƯƠNG III. XÂY DỰNG, TRIỂN KHAI VÀ ĐÁNH GIÁ KẾT QUẢ
3.1. Môi trường và Công cụ phát triển
3.1.1. Hạ tầng phần cứng và phần mềm
Để đảm bảo quá trình phát triển và triển khai hệ thống được đồng bộ, đồ án sử dụng cấu hình môi trường như sau:
	Hệ điều hành: macOS Sonoma / Windows 11.
	IDE: Visual Studio Code (phiên bản 1.90+) với các extensions hỗ trợ: ES7+ React Snippets, Tailwind CSS IntelliSense, Pretty TypeScript.
	Trình quản lý gói: npm (Node Package Manager) phiên bản 10.x.
	Môi trường Runtime: Node.js v20 (LTS) cho môi trường dev và Cloudflare Workers Runtime cho môi trường production.
	Công cụ kiểm thử API: Postman & Thunder Client.
3.1.2. Cấu trúc tổ chức mã nguồn (Project Structure)
Mã nguồn được tổ chức theo kiến trúc Monorepo, tách biệt rõ ràng giữa Client (Frontend) và Worker (Backend) để dễ dàng bảo trì.
	src/components: Chứa các thành phần UI tái sử dụng (Button, Modal, Input).
	src/features: Chứa logic nghiệp vụ chính (SnellenTest, ColorBlindTest).
	src/services: Các hàm giao tiếp với API (Axios instance, Interceptors).
	worker/src: Mã nguồn backend chạy trên Edge.
3.2. Triển khai các module chức năng cốt lõi
3.2.1. Module Đo thị lực (Snellen Test Logic)
Đây là chức năng phức tạp nhất, yêu cầu tính toán tỷ lệ khung hình và kích thước hiển thị chính xác.
	Thách thức: Đảm bảo kích thước chữ "E" tương ứng với khoảng cách 50cm, 1m, 2m tùy thiết bị.
	Giải pháp: Sử dụng hook useCalibration để tính toán chỉ số mmToPx.
Đoạn mã triển khai logic tính toán kích thước Optotype:
// Tính toán kích thước ký tự dựa trên thị lực mục tiêu (ví dụ 20/20)
const calculateOptotypeSize = (targetAcuity: number, distanceMm: number) => {
  // 1 phút cung (arcminute) tại khoảng cách d
  const gapSizeMm = distanceMm * Math.tan(Math.PI / (180 * 60));
  // Ký tự E chuẩn 20/20 gấp 5 lần kích thước gap
  const baseSizeMm = gapSizeMm * 5; 
  // Quy đổi tỉ lệ Snellen ngược (ví dụ 20/40 thì chữ to gấp đôi 20/20)
  return baseSizeMm * (20 / targetAcuity); 
};
3.2.2. Module Trợ lý ảo Dr. Eva (AI Integration)
Module này xử lý việc gửi dữ liệu và nhận phản hồi từ Llama 3.1.
	Quy trình Prompting: Dữ liệu JSON thô từ bài test được "gói" trong một template văn bản tự nhiên để AI dễ hiểu.
Đoạn mã xây dựng Context cho AI (trong chatbotService.ts):
const buildPrompt = (userProfile: User, testResult: TestResult) => {
  return `
    Vai trò: Bạn là Bác sĩ Nhãn khoa Dr. Eva.
    Dữ liệu bệnh nhân: ${userProfile.age} tuổi, giới tính ${userProfile.gender}.
    Kết quả đo Snellen: ${testResult.score}/100 (Tương đương 20/${testResult.visualAcuity}).
    Triệu chứng kèm theo: ${testResult.symptoms.join(', ')}.
    
    Yêu cầu: Hãy phân tích nguyên nhân có thể gây suy giảm thị lực và đưa ra 3 lời khuyên cụ thể.
    Lưu ý: Không kê đơn thuốc, chỉ khuyên thay đổi thói quen sinh hoạt.
  `;
};
3.2.3. Triển khai Bảo mật trên Cloudflare Workers
Backend sử dụng middleware để chặn các request không hợp lệ trước khi chúng đến được database.
Đoạn mã xác thực JWT (trong auth.ts):
export const verifyAuth = async (request: Request, env: Env) => {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  
  try {
    const payload = await jwt.verify(token, env.JWT_SECRET);
    return payload; // Trả về user_id nếu token hợp lệ
  } catch (err) {
    throw new Error('Invalid Token');
  }
};
3.3. Kết quả Giao diện và Trải nghiệm người dùng
Hệ thống đã hoàn thiện với giao diện hiện đại, tối ưu cho trải nghiệm người dùng (UX).
3.3.1. Trang chủ và Dashboard
Trang chủ được thiết kế theo phong cách tối giản, tập trung vào các nút hành động (Call-to-Action) lớn để người dùng dễ dàng bắt đầu bài test.
Hình 3.1. Giao diện Trang chủ với các tùy chọn bài test
Dashboard hiển thị biểu đồ sức khỏe trực quan, giúp người dùng theo dõi tiến trình cải thiện thị lực sau các bài tập.
Hình 3.2. Biểu đồ theo dõi tiến trình thị lực theo thời gian
3.3.2. Giao diện bài test Snellen và Tương tác giọng nói
Giao diện bài test có độ tương phản cao (chữ đen nền trắng hoặc ngược lại), tích hợp biểu tượng microphone rung động khi nhận lệnh giọng nói.
Hình 3.3. Giao diện bài test Snellen đang hoạt động
3.4. Kịch bản kiểm thử và Kết quả (Test Scenarios)
Để đảm bảo độ tin cậy, hệ thống đã trải qua quy trình kiểm thử chức năng (Black-box testing) nghiêm ngặt.



Bảng 3.1. Kịch bản kiểm thử Chức năng Xác thực 
STT	Tên kịch bản	Các bước thực hiện	Kết quả mong đợi	Kết quả thực tế	Trạng thái
1	Đăng nhập thành công	1. Nhập SĐT đúng format
2. Nhập mật khẩu đúng
3. Nhấn "Đăng nhập"
	Chuyển hướng vào Dashboard, lưu token vào LocalStorage.	Đúng như mô tả.	Đạt
2	Đăng nhập sai pass	1. Nhập SĐT đúng
2. Nhập mật khẩu sai
3. Nhấn "Đăng nhập"	Hiển thị thông báo đỏ: "Thông tin đăng nhập không chính xác".	Hiển thị đúng thông báo lỗi.	Đạt
3	SQL Injection	1. Nhập SĐT: ' OR 1=1 
2. Nhập pass bất kỳ
	Hệ thống từ chối, báo lỗi định dạng SĐT.	Backend chặn thành công.	Đạt


Bảng 3.2. Kịch bản kiểm thử Chức năng Đo thị lực (Snellen)
STT	Tên kịch bản	Các bước thực hiện	Kết quả mong đợi	Kết quả thực tế	Trạng thái
1	Điều hướng bằng giọng nói	1. Bật mic


2. Nói "Trên" khi chữ E quay lên	Hệ thống ghi nhận đáp án đúng, chuyển sang ký tự tiếp theo.	Độ trễ khoảng 0.5s, nhận diện chính xác.	Đạt
2	Kết thúc bài test sớm	1. Trả lời sai liên tiếp 3 lần ở mức 20/70	Hệ thống dừng bài test, hiển thị kết quả thị lực 20/100 (mức trước đó).	Logic dừng chính xác.	Đạt
3	Tính toán điểm số	1. Hoàn thành bài test với kết quả 20/20	Điểm số hiển thị là 100/100.	Hiển thị đúng 100 điểm.	Đạt








Bảng 3.3. Kịch bản kiểm thử AI Analysis 
STT	Tên kịch bản	Các bước thực hiện	Kết quả mong đợi	Kết quả thực tế	Trạng thái
1	Phân tích ca bệnh nặng	1. Giả lập kết quả Snellen 20/200 (Mù lòa)
2. Yêu cầu AI phân tích	AI đưa ra cảnh báo ĐỎ, khuyên đi bệnh viện gấp, không đưa ra bài tập tại nhà.	Phản hồi của Dr. Eva rất nghiêm trọng và khẩn thiết.	Đạt
2	Phân tích ca bình thường	1. Kết quả 20/20
2. Yêu cầu phân tích	AI chúc mừng, đưa ra lời khuyên duy trì (ăn uống, nghỉ ngơi).	Phản hồi tích cực, giọng văn vui vẻ.	Đạt
3.5. Đánh giá Hiệu năng và Bảo mật
3.5.1. Đánh giá hiệu năng với Google Lighthouse
Kiểm thử hiệu năng được thực hiện trên trình duyệt Chrome (Chế độ ẩn danh) để đảm bảo khách quan. Kết quả trung bình sau 5 lần đo:
Chỉ số (Metric)	Giá trị đo được	Đánh giá	Ý nghĩa
Performance	96/100	Xuất sắc	Tốc độ tải trang cực nhanh nhờ Cloudflare Edge Cache.
Accessibility	100/100	Tuyệt đối	Hỗ trợ tốt cho trình đọc màn hình (Screen Readers).
Best Practices	95/100	Tốt	Tuân thủ chuẩn bảo mật HTTPS và hình ảnh tối ưu.
SEO	100/100	Tuyệt đối	Cấu trúc thẻ Meta và Semantic HTML chuẩn.
Hình 3.4. Báo cáo hiệu năng từ Google Lighthouse
3.5.2. Đánh giá bảo mật (Security Audit)
Đồ án đã sử dụng công cụ OWASP ZAP để quét các lỗ hổng bảo mật cơ bản.
	Kết quả: Không phát hiện lỗ hổng mức độ Cao (High) hoặc Nghiêm trọng (Critical).
	Các biện pháp đã áp dụng:
	Content Security Policy (CSP): Chặn các script lạ không phải từ domain chính chủ.
	Rate Limiting: Giới hạn mỗi IP chỉ được gọi API 60 lần/phút, ngăn chặn tấn công DDoS vào endpoint AI đắt tiền.
3.6. Kết luận chương 3
Chương 3 đã trình bày chi tiết quá trình hiện thực hóa hệ thống Vision Coach từ những dòng code đầu tiên đến sản phẩm hoàn thiện. Các kết quả kiểm thử thực nghiệm cho thấy hệ thống hoạt động ổn định, đáp ứng tốt các yêu cầu chức năng và phi chức năng đã đề ra. Đặc biệt, việc tích hợp thành công AI và Voice Control đã tạo ra trải nghiệm người dùng vượt trội so với các ứng dụng truyền thống. Đây là cơ sở vững chắc để khẳng định tính thực tiễn và khả năng ứng dụng của đồ án.

CHƯƠNG IV. KẾT LUẬN VÀ KIẾN NGHỊ
4.1. Kết luận chung
Sau quá trình nghiên cứu và phát triển, đồ án "Phát triển hệ thống tương tác giọng nói và phân tích dữ liệu thị lực ứng dụng mô hình ngôn ngữ lớn (LLM)" đã hoàn thành các mục tiêu đề ra ban đầu, đóng góp một giải pháp công nghệ thiết thực cho bài toán y tế cộng đồng.
Những kết quả chính đạt được bao gồm:
	Xây dựng thành công nền tảng Vision Coach: Một ứng dụng Web (PWA) hoàn chỉnh, hoạt động ổn định trên đa nền tảng, tích hợp 5 bài kiểm tra thị lực chuẩn lâm sàng (Snellen, Ishihara, Amsler, Astigmatism, Duochrome).
	Ứng dụng hiệu quả Trí tuệ nhân tạo: Đồ án đã chứng minh tính khả thi của việc sử dụng LLM (Llama 3.1) trong vai trò trợ lý y tế sơ cấp. Thông qua kỹ thuật Prompt Engineering, hệ thống có khả năng phân tích dữ liệu y tế thô và đưa ra các khuyến nghị cá nhân hóa với độ an toàn cao.
	Đột phá về công nghệ tương tác: Việc tích hợp điều khiển bằng giọng nói (Voice Interaction) đã xóa bỏ rào cản công nghệ, giúp người cao tuổi và người khiếm thị dễ dàng tiếp cận dịch vụ.
	Tối ưu hóa chi phí và hiệu năng: Kiến trúc Serverless trên Cloudflare Workers giúp hệ thống đạt độ trễ thấp (Low Latency) và khả năng mở rộng (Scalability) cao với chi phí vận hành gần như bằng 0.
4.2. Những hạn chế tồn tại
Bên cạnh những ưu điểm, hệ thống vẫn còn một số hạn chế cần khắc phục:
	Phụ thuộc vào phần cứng người dùng: Độ chính xác của bài test Ishihara (mù màu) phụ thuộc lớn vào khả năng tái tạo màu sắc của màn hình thiết bị. Màn hình chất lượng thấp có thể gây sai lệch kết quả.
	Chưa tự động hóa đo khoảng cách: Hiện tại, người dùng phải tự giác duy trì khoảng cách đo (ví dụ: đứng cách màn hình 2 mét). Hệ thống chưa có cơ chế cưỡng chế hoặc cảnh báo tự động nếu người dùng đứng sai vị trí.
	Giới hạn của AI: Mặc dù đã có các quy tắc an toàn (Guardrails), nhưng AI đôi khi vẫn có thể đưa ra các lời khuyên chung chung nếu dữ liệu đầu vào không đủ chi tiết.
4.3. Hướng phát triển trong tương lai
Để nâng cao chất lượng và tính ứng dụng thực tiễn, hướng phát triển tiếp theo của đề tài bao gồm:
	Tích hợp Thị giác máy tính (Computer Vision): Sử dụng thư viện MediaPipe hoặc TensorFlow.js để truy cập webcam, đo khoảng cách khuôn mặt người dùng theo thời gian thực và tự động tạm dừng bài test nếu khoảng cách không đạt chuẩn.
	Phát triển Ứng dụng di động (Mobile App): Xây dựng phiên bản Native App trên iOS/Android để tận dụng các cảm biến chuyên sâu (Con quay hồi chuyển, Camera chiều sâu) cho các bài đo phức tạp hơn.
	Hợp tác Telemedicine: Kết nối API với các hệ thống quản lý bệnh viện (HIS) để cho phép người dùng đặt lịch khám trực tiếp với bác sĩ khi hệ thống phát hiện dấu hiệu bất thường nghiêm trọng.
PHỤ LỤC
PHỤ LỤC A: HƯỚNG DẪN SỬ DỤNG HỆ THỐNG
1. Đăng ký và Đăng nhập Người dùng truy cập địa chỉ https://testaivision.pages.dev. Tại màn hình chào mừng, chọn "Bắt đầu ngay" để tạo hồ sơ sức khỏe cơ bản (Tuổi, Giới tính, Tiền sử bệnh).
Hình PL.1. Màn hình tạo hồ sơ sức khỏe
2. Thực hiện bài kiểm tra Snellen
	Chọn mục "Kiểm tra thị lực xa".
	Hệ thống yêu cầu cấp quyền Microphone. Nhấn "Cho phép".
	Đứng cách màn hình 2 mét (đối với Laptop) hoặc 1 mét (đối với Tablet).
	Đọc to hướng của chữ E (Trên, Dưới, Trái, Phải) hoặc nhấn các phím mũi tên tương ứng.
Hình PL.2. Hướng dẫn tư thế ngồi đo
3. Xem Báo cáo AI Sau khi hoàn thành bài test, nhấn nút "Phân tích kết quả". Hệ thống sẽ kết nối với Dr. Eva và trả về báo cáo sau 2-3 giây.
Hình PL.3. Báo cáo chi tiết và lời khuyên từ Dr. Eva
PHỤ LỤC B: CÁC ĐOẠN MÃ NGUỒN QUAN TRỌNG
1. Cấu hình Cloudflare Worker (wrangler.toml) Đây là file cấu hình hạ tầng Serverless, định nghĩa các biến môi trường và liên kết cơ sở dữ liệu D1.
name = "vision-coach-worker"
main = "src/index.ts"
compatibility_date = "2024-04-05"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB" # Tên biến gọi trong code
database_name = "vision-db-prod"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[ai]
binding = "AI" # Binding cho Workers AI
2. Logic Prompt Engineering cho Dr. Eva (src/prompts/report.ts) Đoạn mã TypeScript xây dựng câu lệnh hệ thống (System Prompt) để định hình tính cách và kiến thức cho AI.
export const REPORT_SYSTEM_PROMPT = `
You are Dr. Eva, a senior ophthalmologist with 20 years of experience.
Your goal is to analyze vision test results and provide actionable advice.

RULES:
1. Tone: Professional, empathetic, and encouraging.
2. Language: Vietnamese (Tiếng Việt) only.
3. Structure your response in JSON format:
   {
     "summary": "Brief medical summary",
     "severity": "LOW" | "MEDIUM" | "HIGH",
     "recommendations": ["Tip 1", "Tip 2", "Tip 3"],
     "followUpRequired": boolean
   }
4. SAFETY: If visual acuity is worse than 20/50, you MUST recommend seeing a doctor immediately.
`;
3. Hook React xử lý Giọng nói (hooks/useVoiceControl.ts) Custom Hook sử dụng Web Speech API để điều khiển ứng dụng.
import { useState, useEffect } from 'react';

export const useVoiceControl = (onCommand: (cmd: string) => void) => {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'vi-VN'; // Nhận diện tiếng Việt

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      const command = transcript.trim().toLowerCase();
      
      if (command.includes('trên')) onCommand('UP');
      else if (command.includes('dưới')) onCommand('DOWN');
      else if (command.includes('trái')) onCommand('LEFT');
      else if (command.includes('phải')) onCommand('RIGHT');
    };

    if (isListening) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [isListening]);

  return { isListening, toggleMic: () => setIsListening(!isListening) };
};














TÀI LIỆU THAM KHẢO
1.    Khám chữa bệnh từ xa mang lại nhiều lợi ích cho người bệnh được các bệnh viện chú trọng - Sở Y tế Hà Nội, truy cập vào tháng 12 9, 2025, https://soyte.hanoi.gov.vn/bao-hiem-y-te/kham-chua-benh-tu-xa-mang-lai-nhieu-loi-ich-cho-nguoi-benh-duoc-cac-benh-vien-chu-trong-284925071618440178.htm
2.    Telemedicine: Từ thế giới nhìn về Việt Nam, truy cập vào tháng 12 9, 2025, https://baochinhphu.vn/telemedicine-tu-the-gioi-nhin-ve-viet-nam-102297618.htm
3.    Telemedicine - khám chữa bệnh từ xa và xu hướng trong thập kỷ qua - SUNS Software JSC, truy cập vào tháng 12 9, 2025, https://suns.com.vn/telemedicine-kham-chua-benh-tu-xa-va-xu-huong-trong-thap-ky-qua
4.    Telemedicine và Telehealth: Mở ra giải pháp chăm sóc sức khỏe mới, truy cập vào tháng 12 9, 2025, https://mediexpress.com.vn/telemedicine-va-telehealth-mo-ra-giai-phap-cham-soc-suc-khoe-moi
5.    https://github.com/LongNgn204/testaivission 
6.    React's latest evolution: a deep dive into React 19 - QED42, truy cập vào tháng 12 9, 2025, https://www.qed42.com/insights/reacts-latest-evolution-a-deep-dive-into-react-19
7.    Global Serverless Functions Platform - Cloudflare Workers, truy cập vào tháng 12 9, 2025, https://workers.cloudflare.com/product/workers
8.    Creation of an Accurate Algorithm to Detect Snellen Best Documented Visual Acuity from Ophthalmology Electronic Health Record Notes - NIH, truy cập vào tháng 12 9, 2025, https://pmc.ncbi.nlm.nih.gov/articles/PMC4871992/
9.    Charts Calibration - Optonet Project, truy cập vào tháng 12 9, 2025, https://optonet.online/charts-calibration/
10.  The Stanford Acuity Test: A Precise Vision Test Using Bayesian Techniques and a Discovery in Human Visual Response, truy cập vào tháng 12 9, 2025, https://stanford.edu/~cpiech/bio/papers/StAT.pdf
11.  React 19: Exploring Its Most Powerful Features | by Batuhanmuzafferoglu | DevOps.dev, truy cập vào tháng 12 9, 2025, https://blog.devops.dev/react-19-exploring-its-most-powerful-features-8e256a1f785c
12.  Exploring React 19: Revolutionizing Web Development with Performance, Simplicity, and Interoperability - DEV Community, truy cập vào tháng 12 9, 2025, https://dev.to/melvinprince/exploring-react-19-revolutionizing-web-development-with-performance-simplicity-and-34nk
13.  What's New in React 19? A Developer's Guide to Next-Gen Features | VAIRIX, truy cập vào tháng 12 9, 2025, https://www.vairix.com/tech-blog/whats-new-in-react-19
14.  React 19: The Game-Changing Features That Will Transform Your Development in 2025, truy cập vào tháng 12 9, 2025, https://ramkumarkhub.medium.com/react-19-the-game-changing-features-that-will-transform-your-development-in-2025-f0bde7a13378
15.  Cloudflare Workers | Build and deploy code with Easy-to Use Developer Tools, truy cập vào tháng 12 9, 2025, https://www.cloudflare.com/developer-platform/products/workers/
16.  Serverless Functions: Vercel Edge & Cloudflare Workers Guide - Digital Marketing Agency, truy cập vào tháng 12 9, 2025, https://www.digitalapplied.com/blog/serverless-functions-vercel-cloudflare-guide
17.  How Workers works - Cloudflare Docs, truy cập vào tháng 12 9, 2025, https://developers.cloudflare.com/workers/reference/how-workers-works/
18.  How can serverless computing improve performance? | Lambda performance - Cloudflare, truy cập vào tháng 12 9, 2025, https://www.cloudflare.com/learning/serverless/serverless-performance/
19.  Overview · Cloudflare D1 docs, truy cập vào tháng 12 9, 2025, https://developers.cloudflare.com/d1/
20.  Building D1: a Global Database - The Cloudflare Blog, truy cập vào tháng 12 9, 2025, https://blog.cloudflare.com/building-d1-a-global-database/
21.  Advancing Cutting-edge AI Capabilities - Google for Health, truy cập vào tháng 12 9, 2025, https://health.google/ai-models
22.  Advancing healthcare and scientific discovery with AI - Google Blog, truy cập vào tháng 12 9, 2025, https://blog.google/technology/health/google-research-healthcare-ai/


