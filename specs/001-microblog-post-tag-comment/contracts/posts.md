# API Contract: Posts

**Base path**: `/api/posts`  
**Auth**: Supabase session cookie (required for write operations)

---

## GET `/api/posts`

Lấy danh sách bài **Published** theo thứ tự thời gian mới nhất. Dùng cho trang chủ timeline.

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Trang hiện tại |
| `limit` | `number` | `20` | Số bài mỗi trang (max 50) |

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "published_at": "ISO8601",
      "author": { "username": "string" },
      "tags": [{ "id": "uuid", "name": "string", "slug": "string" }]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "has_more": true
  }
}
```

---

## POST `/api/posts`

Tạo bài mới. Yêu cầu đăng nhập (role: `author` hoặc `moderator`).

**Request body**:
```json
{
  "title": "string (1-200 chars, required)",
  "content": "string (1-1000 chars, required)",
  "status": "'draft' | 'published'",
  "tag_names": ["string"]
}
```

**Response 201**:
```json
{
  "data": { "id": "uuid", "status": "draft", "...": "..." }
}
```

**Errors**:
- `401` — Chưa đăng nhập
- `400` — Validation error (content/title quá dài/ngắn)

---

## GET `/api/posts/[id]`

Lấy chi tiết một bài. Bài Draft chỉ trả về nếu đang là tác giả của bài đó.

**Response 200**: Full post object với tags và author.  
**Response 404**: Bài không tồn tại hoặc Draft không phải của user hiện tại.

---

## PUT `/api/posts/[id]`

Cập nhật bài. Chỉ tác giả của bài.

**Request body** (tất cả optional, chỉ gửi field cần thay đổi):
```json
{
  "title": "string",
  "content": "string",
  "status": "'draft' | 'published'",
  "tag_names": ["string"]
}
```

**Notes**:
- Khi `status` chuyển sang `published` lần đầu: `published_at` được set tự động
- `tag_names` thay thế toàn bộ tags hiện tại (full replace, không merge)

**Response 200**: Updated post object.  
**Errors**: `401`, `403` (không phải tác giả), `404`, `400`

---

## DELETE `/api/posts/[id]`

Xóa bài. Chỉ tác giả của bài.

**Response 204**: No content.  
**Errors**: `401`, `403`, `404`
