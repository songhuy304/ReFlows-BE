---
name: flow-spec
description: Đọc một feature trong src và viết "flow spec" ngắn gọn để dán vào chat AI của màn workflow, giúp AI sinh flowchart đúng. Dùng khi người dùng muốn chuyển một feature/luồng code sẵn có thành workflow, hoặc nhắc tới flow spec, gen flow, vẽ workflow từ code.
disable-model-invocation: true
---

# Flow Spec

Đọc một feature trong codebase hiện tại (backend hoặc frontend, framework nào cũng được) rồi viết **flow spec**: mô tả luồng nghiệp vụ súc tích để dán vào chat AI của màn workflow RecruitHub, nơi AI sẽ sinh flowchart.

Output cuối cùng là **một khối text dán được ngay vào chat box**, không phải tài liệu kỹ thuật. Flowchart phải đủ để dev nhìn vào biết **gọi API nào** và **rẽ nhánh theo field/giá trị nào**.

## Ràng buộc bắt buộc

- Spec tối đa **3800 ký tự**. Chat workflow chặn cứng 4000 ký tự mỗi tin nhắn, vượt là lỗi 400.
- Spec dài không đồng nghĩa graph tốt hơn. Nếu feature quá lớn, **tách thành nhiều workflow** và nói rõ cho người dùng, đừng nhồi hết vào một spec.
- Câu mô tả viết **bằng tiếng Việt**. Riêng **định danh kỹ thuật giữ nguyên như trong code**, đặt trong ngoặc đơn sau phần mô tả: tên API/query/mutation, tên field, giá trị enum. Ví dụ: `Gọi API nhập kho (coImportWarehouse)`, `import_type = 1`.
- Không dịch hay viết lại định danh kỹ thuật (không đổi `coImportWarehouse` thành "API nhập kho" mà bỏ tên gốc).

## Quy trình

### Bước 1: Trace luồng trong code

Skill này cài vào nhiều repo khác nhau nên **đừng giả định cấu trúc thư mục**. Luôn bắt đầu bằng glob/grep để tìm điểm vào, rồi lần theo lời gọi.

**Tìm điểm vào**

- Backend: nơi khai báo route — `@Controller`/`@Get`/`@Post` (NestJS), `router.post`/`app.get` (Express), `@RestController` (Spring), `urls.py` (Django), `config/routes.rb` (Rails), hoặc handler serverless.
- Frontend: file route hoặc page, component chứa form hoặc nút mở đầu luồng, hàm xử lý submit.

**Lần theo luồng**

- Backend: từ handler xuống lớp nghiệp vụ. Mỗi `if`/`switch`/guard clause là một điểm quyết định, mỗi `throw` hoặc early return là một nhánh thất bại.
- Frontend: từ sự kiện người dùng qua validate form, gọi API, cập nhật state, điều hướng, thông báo. Mỗi màn trung gian (modal xác nhận, bước wizard) là một bước.

**Năm thứ phải tìm bằng được**

1. **API được gọi** — mọi query/mutation/endpoint trong luồng. Lấy **tên thật**: tên field GraphQL bên trong document (vd `coFindReturnOrderDetail`, không phải tên biến `FIND_DETAIL_RETURN_WAREHOUSE`), hoặc `METHOD /path` với REST. Lần vào hook/service bọc API để lấy tên gốc.
2. **Điều kiện rẽ nhánh nghiệp vụ** — ghi rõ **field + giá trị so sánh** và **giá trị được gán** ở mỗi nhánh. Tra constant/enum để ra giá trị số thật (vd `CREATION_METHOD.NO_IMPORT` → `import_type = 1`).
3. Enum hoặc union trạng thái (`status`, `state`, `step`) — giá trị của chúng thường chính là node trạng thái.
4. Việc chạy nền — queue, job, cron, worker, webhook. Chạy nền là một bước riêng và "chờ kết quả" là node riêng.
5. Vòng lặp nghiệp vụ — retry, gửi lại, quay về bước trước, polling. AI hay bỏ sót nếu spec không nói rõ.

**Bỏ qua**: DTO/schema validation chi tiết, mapper, request body, header, response schema, logging, cấu hình DI, test, middleware xác thực.

Nếu không xác định được điểm vào, hỏi người dùng tên feature hoặc đường dẫn thay vì đoán.

### Bước 2: Viết spec theo template

```
Vẽ workflow cho luồng "<tên luồng>" dưới đây.

Bắt đầu: <điều kiện/hành động mở đầu>.
1. Gọi API <mô tả>:
   - <mô tả> (<tênApi1>).
   - <mô tả> (<tênApi2>).
2. <động từ + bước>.
3. Quyết định: <câu hỏi> (<field> = <giá trị>)?
   - Có: <bước tiếp theo> (<field_gán> = <giá trị>).
   - Không: <bước tiếp theo> (<field_gán> = <giá trị>).
4. Gọi API <mô tả> (<tênApi>).
5. Quyết định: kết quả API?
   - Thành công: toast thành công, refetch (<tênApi>).
   - Thất bại: toast lỗi.
Kết thúc: <trạng thái kết thúc>.

Nhãn node bằng tiếng Việt, giữ nguyên tên API và field trong ngoặc.
```

### Quy tắc viết

**Bước thường**

- Mỗi bước một dòng, bắt đầu bằng động từ, ngắn gọn (AI bị giới hạn nhãn khoảng 6 từ, phần trong ngoặc là định danh nên giữ ngắn).

**Gọi API**

- Mỗi lần gọi API là **một node riêng**, dạng `Gọi API <mô tả> (<tênApi>)`.
- Nhiều API gọi cùng lúc khi mở màn: liệt kê từng API thành gạch đầu dòng dưới một bước.
- API gọi sau hành động người dùng (bấm nút, chọn option): ghi hành động → API → kết quả chính.

**Điểm quyết định**

- Luôn viết `Quyết định: <câu hỏi> (<điều kiện kỹ thuật>)?` rồi liệt kê từng nhánh có nhãn.
- Điều kiện có nhiều giá trị thì liệt kê đủ: `(reason = logistic_fail hoặc delivery_packing_cancel)`.
- Nhánh nào gán giá trị thì ghi giá trị đó: `Không nhập kho (import_type = 1)`.

**Response API — giữ đơn giản**

- Chỉ hai nhánh: **Thành công** → toast thành công + refetch (ghi tên API refetch) và hành động kế tiếp (đóng modal, điều hướng); **Thất bại** → toast lỗi.
- Chỉ tách thêm nhánh lỗi khi code xử lý các lỗi đó **theo luồng khác nhau** (vd lỗi A mở modal khác, lỗi B quay lại bước trước). Cùng một toast thì gộp.

**Vòng lặp và nhánh thất bại**

- Vòng lặp phải nói rõ **quay về bước số mấy**, nếu không AI sẽ bỏ edge ngược.
- Nêu cả nhánh thất bại của validate, không chỉ happy path.

### Bước 3: Giao cho người dùng

Đưa spec trong một code block để copy, kèm một câu cho biết nó bao nhiêu ký tự và sẽ sinh ra khoảng bao nhiêu node.

## Quy ước shape của hệ thống

AI tự chọn shape, nhưng spec viết đúng ngữ nghĩa sẽ ra shape đúng:

| Shape | Dùng cho | Viết trong spec |
| --- | --- | --- |
| `circle` | Bắt đầu / kết thúc | Dòng "Bắt đầu:" và "Kết thúc:" |
| `rounded` | Hành động của người hoặc hệ thống, gọi API | Bước bắt đầu bằng động từ, "Gọi API ... (tênApi)" |
| `rectangle` | Bước hoặc trạng thái chung | "Đặt trạng thái = X", "Chờ tới giờ" |
| `diamond` | Điều kiện | "Quyết định: ...?" |
| `text` | Ghi chú, không nối edge | Hiếm dùng, bỏ qua |

Flowchart phải có đúng một node bắt đầu và ít nhất một node kết thúc, nên spec luôn có cả dòng "Bắt đầu:" và "Kết thúc:".

## Ví dụ

**Frontend — modal xử lý trả hàng** (gọi nhiều API, rẽ nhánh theo field, response đơn giản):

```
Vẽ workflow cho luồng "Xử lý trả hàng - nhập kho hoàn" dưới đây.

Bắt đầu: user bấm xử lý trả hàng trên đơn hoàn.
1. Gọi API lấy dữ liệu modal:
   - Chi tiết đơn hoàn (coFindReturnOrderDetail).
   - Lịch sử nhập hoàn theo sản phẩm (coGetReturnImportsByOrderItem).
2. Quyết định: lý do hoàn (logistic_fail hoặc delivery_packing_cancel)?
   - Đúng: mặc định không nhập kho (import_type = 1).
   - Sai: mặc định nhập kho (import_type = 2).
3. Chọn kho nhận hàng, nhập số lượng, ảnh, ghi chú.
4. Bấm Xác nhận.
5. Quyết định: đã chọn kho và form hợp lệ?
   - Không: hiện lỗi, quay về bước 3.
   - Có: sang bước 6.
6. Gọi API nhập kho hoàn (coImportWarehouse).
7. Quyết định: kết quả API?
   - Thành công: toast thành công, đóng modal, refetch danh sách đơn hoàn.
   - Thất bại: toast lỗi.
Kết thúc: modal đóng, đơn hoàn được cập nhật.

Nhãn node bằng tiếng Việt, giữ nguyên tên API và field trong ngoặc.
```

**Frontend — đăng nhập** (validate + API):

```
Vẽ workflow cho luồng "Đăng nhập" dưới đây.

Bắt đầu: user mở trang đăng nhập.
1. Nhập email và mật khẩu.
2. Quyết định: form hợp lệ?
   - Không: hiện lỗi dưới ô nhập, quay về bước 1.
   - Có: sang bước 3.
3. Gọi API đăng nhập (POST /auth/login).
4. Quyết định: kết quả API?
   - Thành công: lưu token, chuyển sang trang chủ.
   - Thất bại: toast lỗi, quay về bước 1.
Kết thúc: user vào được trang chủ.

Nhãn node bằng tiếng Việt, giữ nguyên tên API và field trong ngoặc.
```

**Backend — đăng bài nhiều channel** (job nền + retry):

```
Vẽ workflow cho luồng "Đăng bài lên nhiều channel" dưới đây.

Bắt đầu: user gửi yêu cầu tạo bài (POST /posts).
1. Lưu bài và danh sách kênh đã chọn.
2. Quyết định: có đặt lịch (scheduled_at != null)?
   - Có: đặt trạng thái (status = SCHEDULED), chờ tới giờ rồi đẩy vào hàng đợi.
   - Không: đặt trạng thái (status = PUBLISHING), đẩy vào hàng đợi ngay.
3. Worker đăng bài lên từng kênh.
4. Quyết định: kết quả các kênh?
   - Tất cả thành công: đặt trạng thái (status = PUBLISHED). Kết thúc.
   - Có kênh thất bại: đặt trạng thái (status = FAILED), hiện nút thử lại.
5. User bấm thử lại (POST /posts/:id/retry) -> quay về bước 3.
Kết thúc: bài đã đăng hoặc user bỏ qua.

Nhãn node bằng tiếng Việt, giữ nguyên tên API và field trong ngoặc.
```
