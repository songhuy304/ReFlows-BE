---
name: flow-spec
description: Đọc một feature trong src và viết "flow spec" ngắn gọn để dán vào chat AI của màn workflow, giúp AI sinh flowchart đúng. Dùng khi người dùng muốn chuyển một feature/luồng code sẵn có thành workflow, hoặc nhắc tới flow spec, gen flow, vẽ workflow từ code.
disable-model-invocation: true
---

# Flow Spec

Đọc một feature trong codebase hiện tại (backend hoặc frontend, framework nào cũng được) rồi viết **flow spec**: mô tả luồng nghiệp vụ súc tích để dán vào chat AI của màn workflow RecruitHub, nơi AI sẽ sinh flowchart.

Output cuối cùng là **một khối text tiếng Việt dán được ngay vào chat box**, không phải tài liệu kỹ thuật.

## Ràng buộc bắt buộc

- Spec tối đa **3800 ký tự**. Chat workflow chặn cứng 4000 ký tự mỗi tin nhắn, vượt là lỗi 400.
- Spec dài không đồng nghĩa graph tốt hơn. 775 ký tự đã sinh được graph 16 node. Nếu feature quá lớn, **tách thành nhiều workflow** và nói rõ cho người dùng, đừng nhồi hết vào một spec.
- Viết **hoàn toàn bằng tiếng Việt**, kể cả khi code và tên API là tiếng Anh. Spec lẫn tiếng Anh làm AI trả nhãn tiếng Anh.

## Quy trình

### Bước 1: Trace luồng trong code

Skill này cài vào nhiều repo khác nhau nên **đừng giả định cấu trúc thư mục**. Luôn bắt đầu bằng glob/grep để tìm điểm vào, rồi lần theo lời gọi. Tên thư mục có thể số ít hoặc số nhiều, tuỳ repo.

**Tìm điểm vào**

- Backend: nơi khai báo route — `@Controller`/`@Get`/`@Post` (NestJS), `router.post`/`app.get` (Express), `@RestController`/`@RequestMapping` (Spring), `urls.py`/`@api_view` (Django), `config/routes.rb` (Rails), hoặc handler của serverless.
- Frontend: file route hoặc page (`app/**/page.tsx`, `pages/**`, `routes/**`), component chứa form hoặc nút mở đầu luồng, hàm xử lý submit.

**Lần theo luồng**

- Backend: từ handler xuống lớp nghiệp vụ (service, usecase, domain). Ghi lại thứ tự lời gọi. Mỗi `if`/`switch`/guard clause là một điểm quyết định, mỗi `throw` hoặc early return là một nhánh thất bại.
- Frontend: từ sự kiện người dùng qua validate form, gọi API, cập nhật state, điều hướng, thông báo. Mỗi trạng thái `loading`/`error`/`success` là một node, mỗi màn trung gian (modal xác nhận, bước wizard) là một bước.

**Bốn thứ phải tìm bằng được**

1. Enum hoặc union trạng thái (`status`, `state`, `step`) — giá trị của chúng thường chính là node trạng thái.
2. Việc chạy nền — queue, job, cron, worker, webhook. Chạy nền là một bước riêng và "chờ kết quả" là node riêng.
3. Vòng lặp nghiệp vụ — retry, gửi lại, quay về bước trước, polling. Đây là thứ AI hay bỏ sót nhất nếu spec không nói rõ.
4. Điều kiện chặn luồng — nếu nó quyết định luồng đi đâu thì là điểm quyết định; nếu chỉ là middleware xác thực thì bỏ.

**Bỏ qua**: DTO và schema validation, mapper, truy vấn DB, response wrapper, logging, cấu hình DI, test. Chúng không phải bước nghiệp vụ.

Nếu không xác định được điểm vào, hỏi người dùng tên feature hoặc đường dẫn thay vì đoán.

### Bước 2: Viết spec theo template

```
Vẽ workflow cho luồng "<tên luồng>" dưới đây.

Bắt đầu: <điều kiện/hành động mở đầu>.
1. <động từ + bước>.
2. <động từ + bước>.
3. Quyết định: <câu hỏi>?
   - <nhãn nhánh>: <bước tiếp theo>.
   - <nhãn nhánh>: <bước tiếp theo>.
4. <động từ + bước>.
5. <bước> -> quay về bước <n>.
Kết thúc: <trạng thái kết thúc>.

Nhãn node và edge dùng tiếng Việt.
```

Quy tắc viết:

- Mỗi bước một dòng, bắt đầu bằng động từ, càng ngắn càng tốt (AI bị giới hạn nhãn 6 từ).
- Điểm quyết định luôn viết dạng `Quyết định: <câu hỏi>?` rồi liệt kê từng nhánh. Thiếu nhãn nhánh thì AI tự đặt nhãn sai ý.
- Vòng lặp phải nói rõ **quay về bước số mấy**, nếu không AI sẽ bỏ edge ngược.
- Nêu rõ cả nhánh thất bại, không chỉ happy path.

### Bước 3: Giao cho người dùng

Đưa spec trong một code block để copy, kèm một câu cho biết nó bao nhiêu ký tự và sẽ sinh ra khoảng bao nhiêu node.

## Quy ước shape của hệ thống

AI tự chọn shape, nhưng spec viết đúng ngữ nghĩa sẽ ra shape đúng:

| Shape | Dùng cho | Viết trong spec |
| --- | --- | --- |
| `circle` | Bắt đầu / kết thúc | Dòng "Bắt đầu:" và "Kết thúc:" |
| `rounded` | Hành động của người hoặc hệ thống | Bước bắt đầu bằng động từ |
| `rectangle` | Bước hoặc trạng thái chung | "Đặt trạng thái = X", "Chờ tới giờ" |
| `diamond` | Điều kiện | "Quyết định: ...?" |
| `text` | Ghi chú, không nối edge | Hiếm dùng, bỏ qua |

Flowchart phải có đúng một node bắt đầu và ít nhất một node kết thúc, nên spec luôn có cả dòng "Bắt đầu:" và "Kết thúc:".

## Ví dụ

**Input**: feature đăng bài lên nhiều channel (upload video, chọn kênh, đặt lịch, worker đăng, retry khi fail).

**Spec** (775 ký tự, sinh ra graph 14–17 node):

```
Vẽ workflow cho luồng "Đăng bài lên nhiều channel" dưới đây.

Bắt đầu: user mở màn Create Post.
1. Upload video -> nhận link media.
2. Nhập tiêu đề, mô tả, quyền xem.
3. Chọn kênh đã kết nối, tối thiểu 1.
4. Quyết định: có đặt lịch không?
   - Có: đặt trạng thái chờ lịch, chờ tới giờ rồi đẩy vào hàng đợi.
   - Không: đặt trạng thái đang đăng, đẩy vào hàng đợi ngay.
5. Worker đăng bài lên từng kênh.
6. Quyết định: tất cả kênh thành công?
   - Tất cả thành công: đặt trạng thái đã đăng. Kết thúc.
   - Một số thất bại: đặt trạng thái đăng một phần, hiện nút thử lại.
   - Tất cả thất bại: đặt trạng thái thất bại, hiện nút thử lại.
7. User bấm thử lại -> đẩy lại các kênh thất bại vào hàng đợi -> quay về bước 5.
Kết thúc: bài đã đăng hoặc user bỏ qua.

Nhãn node và edge dùng tiếng Việt.
```

Với feature frontend, bước là hành động trên UI và quyết định là nhánh validate hoặc kết quả API:

```
Vẽ workflow cho luồng "Đăng nhập" dưới đây.

Bắt đầu: user mở trang đăng nhập.
1. Nhập email và mật khẩu.
2. Quyết định: form hợp lệ?
   - Không: hiện lỗi dưới ô nhập, quay về bước 1.
   - Có: gọi API đăng nhập, hiện trạng thái đang xử lý.
3. Quyết định: API trả thành công?
   - Thành công: lưu token, chuyển sang trang chủ.
   - Sai thông tin: hiện lỗi sai email hoặc mật khẩu, quay về bước 1.
   - Lỗi mạng: hiện thông báo thử lại, quay về bước 1.
Kết thúc: user vào được trang chủ.

Nhãn node và edge dùng tiếng Việt.
```

## Nhắc người dùng sau khi giao spec

- Dán spec vào chat box màn workflow, AI trả về graph dạng preview, bấm Áp dụng rồi Save mới lưu.
- Muốn chỉnh graph thì **chat tiếp** ("gộp bước 2 và 3", "thêm nhánh huỷ sau phỏng vấn"), đừng sửa spec rồi gen lại: gen lại sinh id node mới nên mất toàn bộ `position` đã sắp trên canvas.

Nếu repo hiện tại là backend RecruitHub, chi tiết API và error code nằm ở `docs/workflow-api.md`.
