# API Contract: Tags

**Base path**: `/api/tags`  
**Auth**: Không yêu cầu (public read)

---

## GET `/api/tags`

Lấy danh sách tất cả tags, sắp xếp theo tên.

**Response 200**:
```json
{
  "data": [
    { "id": "uuid", "name": "javascript", "slug": "javascript" }
  ]
}
```

---

## GET `/api/tags/[slug]`

Lấy danh sách bài **Published** thuộc tag có slug tương ứng.

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Trang hiện tại |
| `limit` | `number` | `20` | Số bài mỗi trang (max 50) |

**Response 200**:
```json
{
  "tag": { "id": "uuid", "name": "javascript", "slug": "javascript" },
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
    "total": 15,
    "has_more": false
  }
}
```

**Response 404**: Tag không tồn tại.

---

## Tag Creation (implicit)

Tags **không** có endpoint tạo riêng. Tags được tạo tự động khi tác giả gắn tag vào bài qua `POST /api/posts` hoặc `PUT /api/posts/[id]` với `tag_names` chứa tên tag chưa tồn tại.

**Normalization rule**: Tên tag được `toLowerCase().trim()` trước khi lưu. Slug tạo từ tên: thay space bằng `-`, bỏ ký tự đặc biệt.
