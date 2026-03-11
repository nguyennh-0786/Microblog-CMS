# API Contract: Comments & Moderation

---

## Comments (Public)

### POST `/api/posts/[id]/comments`

Gửi bình luận mới. Không yêu cầu đăng nhập. Bình luận luôn tạo với `status = 'pending'`.

**Request body**:
```json
{
  "content": "string (1-2000 chars, required)",
  "author_name": "string (optional)",
  "author_email": "string (optional, valid email format)"
}
```

**Response 201**:
```json
{
  "data": {
    "id": "uuid",
    "status": "pending",
    "created_at": "ISO8601"
  },
  "message": "Bình luận của bạn đang chờ kiểm duyệt."
}
```

**Errors**:
- `400` — Nội dung trống hoặc quá dài
- `404` — Bài không tồn tại hoặc chưa Published
- `429` — Quá giới hạn tần suất (5 comment/IP/10 phút)

---

### GET `/api/posts/[id]/comments`

Lấy danh sách bình luận **Approved** của một bài, theo thứ tự thời gian cũ nhất trước.

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "string",
      "author_name": "string | null",
      "created_at": "ISO8601"
    }
  ]
}
```

*Note*: `author_email` không bao giờ được trả về trong response public.

---

## Moderation (Moderator only)

Tất cả endpoint dưới đây yêu cầu đăng nhập và `role = 'moderator'`. Trả về `403` nếu không đủ quyền.

### GET `/api/moderation/comments`

Lấy danh sách bình luận đang ở trạng thái `pending`, sắp xếp cũ nhất trước (FIFO).

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Trang hiện tại |
| `limit` | `number` | `50` | Số item mỗi trang |

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "post_title": "string",
      "content": "string",
      "author_name": "string | null",
      "author_email": "string | null",
      "created_at": "ISO8601"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 12, "has_more": false }
}
```

---

### PUT `/api/moderation/comments/[id]`

Duyệt hoặc từ chối một bình luận.

**Request body**:
```json
{
  "status": "'approved' | 'rejected'"
}
```

**Response 200**:
```json
{
  "data": { "id": "uuid", "status": "approved" }
}
```

**Errors**:
- `400` — `status` không hợp lệ hoặc bình luận đã được xử lý trước đó
- `401` — Chưa đăng nhập
- `403` — Không phải moderator
- `404` — Bình luận không tồn tại
