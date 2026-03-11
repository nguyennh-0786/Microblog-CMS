# Feature Specification: Microblog Post, Tag & Comment

**Feature Branch**: `001-microblog-post-tag-comment`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "Tác giả viết bài ngắn (draft/publish), gắn Tag, người dùng đọc & comment (moderation). Trang chủ theo timeline, trang Tag"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Tác giả soạn và đăng bài ngắn (Priority: P1)

Một tác giả đã đăng nhập muốn viết một bài ngắn, lưu nháp để xem lại, rồi xuất bản để độc giả có thể đọc.

**Why this priority**: Đây là hành động cốt lõi của hệ thống. Không có bài viết thì không có nội dung để đọc, tag hay bình luận.

**Independent Test**: Có thể kiểm tra độc lập bằng cách: đăng nhập với tài khoản tác giả → tạo bài ngắn → lưu nháp → xác nhận bài không hiển thị công khai → xuất bản → xác nhận bài xuất hiện trên trang chủ.

**Acceptance Scenarios**:

1. **Given** tác giả đã đăng nhập, **When** tác giả soạn nội dung và chọn "Lưu nháp", **Then** bài được lưu với trạng thái Draft và chỉ tác giả nhìn thấy.
2. **Given** tác giả có bài ở trạng thái Draft, **When** tác giả chọn "Xuất bản", **Then** bài chuyển sang trạng thái Published và xuất hiện trên trang chủ theo thứ tự thời gian.
3. **Given** tác giả đã xuất bản bài, **When** tác giả chỉnh sửa và lưu lại, **Then** bài được cập nhật ngay lập tức mà không cần xuất bản lại.
4. **Given** người dùng chưa đăng nhập, **When** truy cập trang soạn bài, **Then** hệ thống yêu cầu đăng nhập trước.

---

### User Story 2 — Tác giả gắn Tag cho bài viết (Priority: P2)

Tác giả muốn gắn một hoặc nhiều tag vào bài viết để phân loại nội dung, giúp độc giả tìm kiếm theo chủ đề.

**Why this priority**: Tag là tính năng phân loại cơ bản; bài viết vẫn hoạt động nếu không có tag, nhưng tag làm tăng khả năng khám phá nội dung đáng kể.

**Independent Test**: Tạo bài viết → thêm một hoặc nhiều tag → xuất bản → truy cập trang Tag tương ứng → xác nhận bài xuất hiện đúng tag.

**Acceptance Scenarios**:

1. **Given** tác giả đang soạn bài, **When** tác giả nhập tên tag và xác nhận, **Then** tag được gắn vào bài; tag có thể là tag đã tồn tại hoặc tag mới.
2. **Given** bài đã có tag, **When** tác giả xóa một tag khỏi bài, **Then** tag đó bị gỡ khỏi bài nhưng tag vẫn tồn tại trong hệ thống.
3. **Given** bài được xuất bản với tag, **When** độc giả truy cập trang Tag tương ứng, **Then** bài xuất hiện trong danh sách bài của tag đó.

---

### User Story 3 — Độc giả đọc bài và gửi bình luận (Priority: P3)

Độc giả (có hoặc không có tài khoản) muốn đọc bài ngắn và để lại bình luận phản hồi.

**Why this priority**: Tương tác là giá trị gia tăng; bài viết vẫn hữu ích khi đọc một mình, nhưng bình luận tạo cộng đồng và làm tăng sự gắn kết.

**Independent Test**: Truy cập bài đã xuất bản → điền tên/email và nội dung bình luận → gửi → xác nhận bình luận chờ kiểm duyệt hoặc hiển thị tuỳ cấu hình.

**Acceptance Scenarios**:

1. **Given** độc giả xem một bài Published, **When** điền nội dung bình luận và gửi, **Then** bình luận được ghi nhận và chuyển sang hàng chờ kiểm duyệt.
2. **Given** bình luận đang chờ kiểm duyệt, **When** người kiểm duyệt duyệt chấp thuận, **Then** bình luận hiển thị công khai bên dưới bài viết theo thứ tự thời gian.
3. **Given** bình luận đang chờ kiểm duyệt, **When** người kiểm duyệt từ chối, **Then** bình luận bị ẩn vĩnh viễn và tác giả bình luận không nhận phản hồi công khai.
4. **Given** bài chưa có bình luận được duyệt, **When** độc giả xem bài, **Then** hệ thống hiển thị thông báo "Chưa có bình luận" hoặc tương tự.

---

### User Story 4 — Độc giả duyệt trang chủ theo timeline (Priority: P2)

Độc giả muốn xem các bài mới nhất theo thứ tự thời gian trên trang chủ.

**Why this priority**: Trang chủ timeline là điểm khám phá nội dung chính; quan trọng ngang bằng với trang Tag.

**Independent Test**: Truy cập trang chủ → xác nhận chỉ bài Published được liệt kê → xác nhận thứ tự từ mới nhất đến cũ nhất → sau khi đăng bài mới, tải lại trang, bài mới xuất hiện ở đầu danh sách.

**Acceptance Scenarios**:

1. **Given** có nhiều bài Published, **When** độc giả truy cập trang chủ, **Then** hệ thống hiển thị danh sách bài theo thứ tự thời gian xuất bản, mới nhất ở trên cùng.
2. **Given** trang chủ đang hiển thị, **When** bài ở trạng thái Draft tồn tại trong hệ thống, **Then** bài Draft không xuất hiện trong danh sách trang chủ.
3. **Given** số lượng bài vượt quá giới hạn hiển thị mỗi trang, **When** độc giả cuộn xuống hoặc chuyển trang, **Then** hệ thống tải thêm bài cũ hơn.

---

### User Story 5 — Độc giả duyệt trang Tag (Priority: P3)

Độc giả muốn xem tất cả bài Published thuộc một tag cụ thể.

**Why this priority**: Trang Tag hỗ trợ khám phá theo chủ đề; hữu ích nhưng thứ yếu so với timeline và tính năng đăng bài.

**Independent Test**: Truy cập trang `/tags/[tên-tag]` → xác nhận chỉ bài Published có tag đó được liệt kê → xác nhận thứ tự thời gian.

**Acceptance Scenarios**:

1. **Given** tồn tại tag có ít nhất một bài Published, **When** độc giả truy cập trang Tag, **Then** hệ thống liệt kê tất cả bài Published có tag đó theo thứ tự thời gian mới nhất.
2. **Given** tag không có bài Published nào, **When** độc giả truy cập trang Tag, **Then** hệ thống hiển thị thông báo "Chưa có bài viết nào" thay vì danh sách rỗng không giải thích.
3. **Given** tag không tồn tại, **When** độc giả truy cập URL trang Tag, **Then** hệ thống trả về trang lỗi 404 phù hợp.

---

### Edge Cases

- Tác giả lưu bài Draft nhưng chưa có nội dung — hệ thống xử lý thế nào? (Cho phép Draft rỗng hay yêu cầu ít nhất 1 ký tự?)
- Tác giả thêm tag trùng tên nhưng khác chữ hoa/thường (e.g., "Tech" vs "tech") — hệ thống chuẩn hóa hay tạo tag riêng?
- Độc giả gửi bình luận nhiều lần liên tiếp trong thời gian ngắn — hệ thống giới hạn tần suất để tránh spam?
- Bài có tag bị xóa hoàn toàn — tag đó còn xuất hiện trên trang Tag hay biến mất?
- Bình luận chứa nội dung quá dài hoặc ký tự đặc biệt — hệ thống cắt ngắn hay báo lỗi?

---

## Requirements *(mandatory)*

### Functional Requirements

**Bài viết (Post)**

- **FR-001**: Hệ thống PHẢI cho phép tác giả đã xác thực tạo bài ngắn với ít nhất tiêu đề và nội dung.
- **FR-002**: Hệ thống PHẢI hỗ trợ hai trạng thái bài viết: Draft (nháp) và Published (đã xuất bản).
- **FR-003**: Hệ thống PHẢI cho phép tác giả chuyển bài từ Draft sang Published và ngược lại.
- **FR-004**: Hệ thống PHẢI ghi lại thời điểm xuất bản để sắp xếp theo timeline.
- **FR-005**: Hệ thống PHẢI cho phép tác giả chỉnh sửa và xóa bài của chính mình.
- **FR-006**: Hệ thống PHẢI ngăn người dùng không phải tác giả chỉnh sửa hoặc xóa bài của người khác.

**Tag**

- **FR-007**: Hệ thống PHẢI cho phép tác giả gắn một hoặc nhiều tag vào bài khi soạn hoặc chỉnh sửa.
- **FR-008**: Hệ thống PHẢI tự động tạo tag mới nếu tác giả nhập tên tag chưa tồn tại.
- **FR-009**: Hệ thống PHẢI chuẩn hóa tên tag (không phân biệt chữ hoa/thường) để tránh trùng lặp.
- **FR-010**: Hệ thống PHẢI cung cấp trang riêng cho mỗi tag, liệt kê các bài Published thuộc tag đó theo thứ tự thời gian.

**Bình luận (Comment) & Kiểm duyệt**

- **FR-011**: Hệ thống PHẢI cho phép bất kỳ ai gửi bình luận dưới bài Published (không yêu cầu tài khoản).
- **FR-012**: Hệ thống PHẢI đưa tất cả bình luận mới vào hàng chờ kiểm duyệt trước khi hiển thị công khai.
- **FR-013**: Người kiểm duyệt PHẢI có khả năng chấp thuận hoặc từ chối từng bình luận trong hàng chờ.
- **FR-014**: Hệ thống PHẢI hiển thị bình luận đã được duyệt theo thứ tự thời gian bên dưới bài viết.
- **FR-015**: Hệ thống PHẢI ẩn vĩnh viễn bình luận bị từ chối khỏi giao diện công khai.

**Trang chủ & Khám phá**

- **FR-016**: Hệ thống PHẢI hiển thị trang chủ liệt kê tất cả bài Published theo thứ tự thời gian xuất bản mới nhất.
- **FR-017**: Hệ thống PHẢI hỗ trợ phân trang hoặc tải thêm khi danh sách bài vượt giới hạn hiển thị.
- **FR-018**: Hệ thống PHẢI đảm bảo bài Draft không xuất hiện trên bất kỳ trang công khai nào.

### Key Entities

- **Post (Bài viết)**: Nội dung ngắn do tác giả tạo; có tiêu đề, nội dung, trạng thái (Draft/Published), thời điểm tạo, thời điểm xuất bản, tác giả.
- **Tag**: Nhãn phân loại; có tên duy nhất (chuẩn hóa chữ thường); liên kết nhiều-nhiều với Post.
- **Comment (Bình luận)**: Phản hồi của độc giả trên một Post; có nội dung, tên/email người gửi, thời điểm gửi, trạng thái (Pending/Approved/Rejected).
- **Author (Tác giả)**: Người dùng có quyền tạo, chỉnh sửa, xóa Post của mình.
- **Moderator (Người kiểm duyệt)**: Người dùng có quyền duyệt/từ chối bình luận trong hàng chờ.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tác giả hoàn thành việc soạn, lưu nháp và xuất bản một bài trong vòng dưới 2 phút.
- **SC-002**: Bài Published xuất hiện trên trang chủ trong vòng dưới 5 giây sau khi tác giả xác nhận xuất bản.
- **SC-003**: Bình luận mới gửi xuất hiện trong hàng chờ kiểm duyệt ngay lập tức (dưới 3 giây).
- **SC-004**: Người kiểm duyệt xử lý (chấp thuận/từ chối) một bình luận trong vòng dưới 30 giây.
- **SC-005**: Trang chủ và trang Tag tải danh sách bài trong dưới 2 giây với tối thiểu 100 bài Published.
- **SC-006**: 100% bình luận chưa được duyệt không xuất hiện trên giao diện công khai.
- **SC-007**: Tag được tạo và gắn vào bài mà không yêu cầu thao tác ngoài luồng soạn bài.

### Assumptions

- Tác giả và Người kiểm duyệt có thể là cùng một người hoặc hai vai trò tách biệt — giả định hệ thống hỗ trợ phân quyền theo vai trò.
- Bình luận không yêu cầu tài khoản; tên và email người gửi là tuỳ chọn (không bắt buộc xác thực).
- Giới hạn độ dài bài ngắn không được chỉ định — giả định tối đa 1000 ký tự theo tiêu chuẩn microblog phổ biến.
- Số lượng tag tối đa trên một bài không được chỉ định — giả định tối đa 10 tag/bài.
- Trang chủ và trang Tag mặc định hiển thị 20 bài mỗi trang.
