# Thuyết trình Vision Coach (PWA kiểm tra thị lực + AI) — Bản chuẩn “vì sao dùng / biết từ đâu”

Mục tiêu: Thuyết trình 7–10 phút, trả lời chắc tay câu hỏi “vì sao chọn công nghệ này”, “nguyên lý hoạt động”, “biết chuẩn/nguồn từ đâu”. Tham chiếu [số] trỏ tới mục Tài liệu tham khảo trong baocao.md.

---

1) Vấn đề – Mục tiêu giải pháp
- Vấn đề: Sàng lọc thị lực cộng đồng còn khó tiếp cận; người cao tuổi/người khiếm thị gặp rào cản sử dụng.
- Mục tiêu: Ứng dụng web (PWA) không cần cài đặt, đo các test tiêu chuẩn (Snellen, Ishihara, Amsler, Astigmatism, Duochrome) và phân tích bằng AI.
- KPI chính: TTFB thấp (edge), đo đúng kích thước optotype, báo cáo AI an toàn, UX có giọng nói.
- Vì sao web/PWA? Không cài app, chạy trên mọi thiết bị; có offline/caching; triển khai nhanh trên edge.
- Biết từ đâu: Thực hành PWA/edge, Cloudflare doc và Lighthouse audit nội bộ (baocao.md mục 3.5.1) [15][16][18].

2) Kiến trúc tổng quan (end-to-end)
- Thành phần: React 19 (client) → Cloudflare CDN/WAF (edge) → Cloudflare Workers (router/middleware) → D1 (SQL) + Workers AI (LLM) → trả JSON/HTML → UI render.
- Luồng chính:
  1) Trình duyệt tải asset tĩnh từ CDN edge (HTTPS, HTTP/2/3).  
  2) Người dùng calibration → chạy test → gửi kết quả tới Worker (JWT).  
  3) Worker ghi D1, tạo prompt, gọi LLM → validate → cache ai_reports → trả UI.  
- ASCII sơ đồ:
  Browser ──HTTPS──> CDN/WAF (Cloudflare Edge) ──> Worker (Auth, RateLimit, Handlers)
                                         ├──> D1 (SQL)
                                         └──> Workers AI (Llama 3.1)
  <────── HTML/CSS/JS/JSON + ETag/Cache-Control ──────
- Vì sao: Giảm độ trễ nhờ edge; serverless isolates ~no cold-start; đơn giản vận hành [7][15][17][18][20].
- Biết từ đâu: Tài liệu Cloudflare Workers/D1/How Workers works [15][17][19][20].

3) Nguyên lý đo Snellen/Ishihara/Amsler (chốt nguồn)
- Snellen (Visual Angle): 1 nét ký tự chắn 1 arcminute; ký tự chắn 5 arcminutes ở khoảng cách chuẩn. Kích thước tính theo:  
  gapSizeMm = d × tan(π / (180×60));  charMm ≈ 5 × gap; quy đổi 20/x → tỉ lệ kích thước.  
  Chuyển đổi mm→px: px = mm × PPI / 25.4.  
  Calibration: đo PPI thực tế bằng vật chuẩn (ATM/CCCD) đặt trên màn hình → đảm bảo kích thước vật lý đúng.  
  • Vì sao: chuẩn lâm sàng từ 1862, còn là “gold standard” [8][9].  
  • Biết từ đâu: Nghiên cứu Snellen/WHO/NIH; tài liệu calibration của Optonet [8][9].
- Ishihara (pseudo-isochromatic plates): yêu cầu sRGB đúng, độ tương phản chuẩn; UI ép không gian màu và tránh hiệu ứng nén sai lệch.  
  • Vì sao: sàng lọc mù màu nhanh, tiêu chuẩn phổ biến lâm sàng.  
  • Biết từ đâu: Mô tả test gốc và thực hành hiển thị sRGB (tổng hợp trong chương 1 của báo cáo).
- Amsler: phát hiện méo, scotoma vùng hoàng điểm; hiển thị lưới 10×10 cm quy đổi px bằng PPI calibration.  
  • Vì sao: sàng lọc AMD/phù hoàng điểm sớm, công cụ đơn giản nhưng nhạy.  
  • Biết từ đâu: giáo trình nhãn khoa và tài liệu tổng hợp trong báo cáo.

4) Frontend: React 19 + PWA (vì sao/nguồn)
- React 19: React Compiler tự tối ưu, giảm re-render; RSC stream nội dung, giảm bundle; phù hợp giao diện test cần mượt [6][11][12][13][14].
- PWA: Service Worker cache tĩnh, offline hướng dẫn, sync lại khi online.  
- UX: Web Speech API (SpeechRecognition/TTS) điều khiển/đọc kết quả cho người thị lực kém.  
- Vì sao: giảm FCP/TTI, trải nghiệm mượt kể cả máy tầm trung; trợ năng voice.  
- Biết từ đâu: bài viết kỹ thuật React 19, docs W3C Web Speech; đo Lighthouse nội bộ [6][11–14].

5) Backend/Edge: Cloudflare Workers + D1 (vì sao/nguồn)
- Workers: V8 isolates, cold-start ~<5ms, phân phối toàn cầu 300+ PoP, HTTP/3/QUIC; WAF/Rate-limit ở biên [15][17][18].
- D1 (SQL ở edge): quan hệ, read replicas, chi phí thấp; đủ cho workload sàng lọc (ghi ngắn, đọc nhiều) [19][20].
- Vì sao: latency thấp tại VN; chi phí gần 0 cho MVP; vận hành đơn giản.
- Biết từ đâu: Docs Cloudflare Workers/D1, “How Workers Works” [15][17][19][20].
- Trade-off: So với AWS Lambda + RDS, Workers+D1 đơn giản và rẻ hơn cho MVP; hạn chế advanced SQL/throughput cao → có thể nâng cấp Neon/PlanetScale khi cần.

6) AI: Llama 3.1 8B trên Workers AI (guardrails)
- Chọn 8B: cân bằng tốc độ/chi phí trên edge, đủ cho tư vấn sơ cấp; prompt có quy tắc an toàn (không chẩn đoán khẳng định; VA<20/50 → khuyên đi khám).  
- Vì sao: tương tác thời gian ngắn (2–3s/500 từ), chi phí thấp, chủ động triển khai.  
- Biết từ đâu: trải nghiệm Workers AI + tài liệu nền tảng về AI y tế của Google Health (nguyên tắc ứng dụng) [15][21][22].
- Trade-off: GPT-4/gemini-1.5 cho chất lượng cao hơn nhưng chi phí/độ trễ/tuân thủ dữ liệu khó hơn; lộ trình có thể hỗn hợp (hybrid routing) nếu cần.

7) Bảo mật và tuân thủ (ngắn, đúng trọng tâm)
- HTTPS + HSTS; JWT ngắn hạn (Bearer) → giảm CSRF; nếu dùng cookie: Secure, HttpOnly, SameSite và CSRF token.  
- CSP nghiêm ngặt; tránh chèn HTML thô từ AI; sanitize khi cần; headers bảo mật (X-Frame-Options, X-Content-Type-Options).  
- WAF + Rate limiting; logging có correlation-id, không log PII thô.  
- Email (nếu có): SPF/DKIM/DMARC.  
- Biết từ đâu: OWASP best practices; kết quả ZAP audit trong báo cáo (3.5.2).

8) Hiệu năng và cache
- Core Web Vitals: LCP/CLS/INP; đo Lighthouse 96–100 (baocao.md) → nhờ edge cache + tối ưu bundle.  
- HTTP caching: Cache-Control, ETag (ai_reports) → 304 Not Modified giảm băng thông.  
- Redis? Không cần ở MVP nhờ D1 + edge; có thể bổ sung KV/Cache API khi quy mô tăng.  
- Biết từ đâu: kết quả đo nội bộ + kiến trúc edge [15][18].

9) Dữ liệu và tính đúng (consistency)
- D1: giao dịch ngắn khi ghi test; đọc từ replica; ai_reports làm lớp cache chống gọi AI lặp.  
- Calibration là bắt buộc trước Snellen; Ishihara ép sRGB; Amsler quy đổi mm→px.  
- Biết từ đâu: D1 docs [19][20], Optonet calibration [9].

10) Demo script (2–3 phút)
- B1: Mở trang lần đầu → đo Lighthouse nhanh (đã đo sẵn). Nói: “Asset tĩnh phục vụ từ edge, HTTPS/TLS/HTTP3”.
- B2: Calibration: đặt ATM/CCCD → app tính PPI, hiển thị số PPI. Nói công thức px = mm×PPI/25.4.  
- B3: Snellen: đứng 2m; nói “Trên/Dưới/Trái/Phải”; cho thấy logic thích ứng tăng/giảm độ khó.  
- B4: Kết thúc → POST /api/test-results (JWT) → trả id.  
- B5: Phân tích AI → POST /api/analyze → trả JSON {severity, recommendations[]} + ETag.  
- B6: Bật TTS đọc khuyến nghị cho người kém thị lực.

11) FAQ “vì sao dùng / biết từ đâu” (mẫu trả lời)
- Q: Vì sao chọn Cloudflare Workers thay vì AWS Lambda?  
  A: Workers dùng V8 isolates, cold-start ~<5ms, phân phối toàn cầu sẵn; phù hợp latency thấp tại VN và chi phí MVP gần 0 [15][17][18].
- Q: Làm sao đảm bảo kích thước Snellen đúng trên web?  
  A: Calibration PPI bằng vật chuẩn (ATM/CCCD) + công thức arcminute và mm→px; tham chiếu Optonet/NIH [8][9].
- Q: Ishihara có sai lệch màu do màn hình?  
  A: Ép sRGB, độ tương phản chuẩn, cảnh báo chất lượng màn; ghi rõ hạn chế trong báo cáo (4.2).  
- Q: Vì sao Llama 3.1 8B, không GPT-4?  
  A: Cân bằng tốc độ/chi phí/triển khai edge; guardrails nội bộ đủ cho sàng lọc sơ cấp; tương lai có thể hybrid [15][21].
- Q: Bảo mật gì khi dùng JWT?  
  A: TTL ngắn; Bearer giảm CSRF; nếu chuyển cookie → dùng Secure/HttpOnly/SameSite + CSRF token; CSP/XSS bảo vệ UI; ZAP không phát hiện High/Critical (3.5.2).  
- Q: Nếu mic bị chặn/AI lỗi/D1 đọc chậm?  
  A: Fallback phím; retry AI với backoff + template an toàn; SW cache offline; đọc từ bản ai_reports gần nhất.
- Q: Pháp lý/tuân thủ?  
  A: PDPD VN: tối thiểu hóa PII, minh bạch; không xử lý dữ liệu thẻ trực tiếp (nếu thanh toán thì dùng cổng trung gian).

12) Rủi ro – giới hạn – kế hoạch
- Rủi ro: màn hình rẻ gây sai Ishihara; người dùng không giữ đúng khoảng cách; LLM đôi khi chung chung.  
- Kế hoạch: MediaPipe đo khoảng cách webcam, auto pause; native app tận dụng cảm biến; kết nối HIS đặt lịch (baocao.md 4.3).  
- Biết từ đâu: mục 4.2–4.3 trong báo cáo + roadmaps công nghệ liên quan.

13) Kết luận
- Vision Coach = chuẩn lâm sàng cổ điển + edge/serverless + AI an toàn + PWA trợ năng.  
- Chỉ số thực nghiệm tốt; kiến trúc sẵn sàng scale; định vị đúng bài toán sàng lọc cộng đồng.

Phụ lục A — Mẫu thoại 60–90 giây (cheat sheet)
“Sau khi người dùng mở ứng dụng, asset tĩnh được phục vụ từ Cloudflare Edge qua HTTPS, thời gian phản hồi thấp. Trước đo, hệ thống calibrate PPI bằng thẻ ATM để quy đổi mm→px đảm bảo kích thước Snellen chuẩn theo góc thị giác. Trong bài test, người dùng trả lời bằng giọng nói qua Web Speech API, logic thích ứng tăng/giảm độ khó. Kết quả được lưu vào D1, sau đó gửi tới AI Llama 3.1 chạy trên Workers AI; prompt có guardrails y tế nên chỉ cảnh báo nguy cơ và khuyến nghị đi khám khi VA < 20/50. Phản hồi được cache bằng ETag/ai_reports để giảm chi phí lần sau. Chúng tôi chọn React 19 để tối ưu re-render và PWA để hỗ trợ offline, tất cả vì mục tiêu tốc độ, chính xác, dễ tiếp cận.”

Phụ lục B — HTTP mẫu (cache)
Request:
GET /api/ai-reports/{result_id} HTTP/1.1
If-None-Match: "etag-abc"
Authorization: Bearer <JWT>

Response (hit điều kiện):
HTTP/1.1 304 Not Modified

Phụ lục C — Tham chiếu
- [6][11][12][13][14]: React 19 và tối ưu hiệu năng frontend.
- [7][15][17][18][19][20]: Cloudflare Workers/D1/edge và hiệu năng serverless.
- [8][9][10]: Snellen, calibration, test thị lực chuẩn.
- [21][22]: Hướng dẫn/ứng dụng AI trong y tế (nguyên tắc an toàn, năng lực mô hình).
- Lưu ý: Số tham chiếu khớp “Tài liệu tham khảo” trong baocao.md.

