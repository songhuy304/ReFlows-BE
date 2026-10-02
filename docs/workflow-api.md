# Workflow API & AI Chat

Base URL: `/api/v1`  
Auth: `Authorization: Bearer <accessToken>` (tất cả endpoint bên dưới)  
User chỉ thao tác được workflow do chính mình tạo.

---

## 1. Data model

### Workflow

```ts
type WorkflowStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface Workflow {
  id: number;
  name: string;
  status: WorkflowStatus;
  publishedAt: string | null; // ISO date, set khi chuyển sang PUBLISHED
  graph: WorkflowGraph;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}
```

### Graph

Khớp với React Flow ở FE (`ShapeNode`, `LabeledEdge`).

- `position` là **optional**: node đã được đặt trên canvas thì có, node AI mới sinh thì không. FE auto-layout các node thiếu `position`.
- BE không lưu `viewport`, FE dùng `fitView` khi mở trang.

```ts
type NodeShape = 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'text';

interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowNode {
  id: string;
  type?: string; // FE dùng 'shape'
  position?: { x: number; y: number };
  data: { label: string; shape: NodeShape } & Record<string, unknown>;
}

interface WorkflowEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  type?: string; // FE dùng 'labeled'
  data?: { label?: string } & Record<string, unknown>;
}
```

Ý nghĩa shape (AI cũng dùng quy ước này):

| Shape | Ý nghĩa |
| --- | --- |
| `circle` | Bắt đầu / kết thúc |
| `rounded` | Hành động |
| `rectangle` | Bước / trạng thái chung |
| `diamond` | Điều kiện, edge đi ra có label `Yes` / `No` |
| `text` | Ghi chú, không nối edge |

### Response envelope

```ts
// Thành công
{ success: true, message: 'success', data: T }

// Danh sách có phân trang
{
  success: true,
  message: 'success',
  data: T[],
  meta: { currentPage, itemsPerPage, totalItems, totalPages }
}

// Lỗi (format mặc định của Nest)
{ statusCode: 404, message: 'error.workflow.not-found' }

// Lỗi validate body/query
{ statusCode: 400, message: ['name should not be empty', ...], error: 'Bad Request' }
```

---

## 2. Endpoints

### 2.1 Tạo workflow

```ts
POST /api/v1/workflows

Body:
{
  name: string;          // bắt buộc, tối đa 255 ký tự
  graph: WorkflowGraph;  // bắt buộc, workflow mới có thể gửi { nodes: [], edges: [] }
}

Response 201: { success, message, data: Workflow }  // status luôn là DRAFT
```

### 2.2 Danh sách workflow của tôi

```ts
GET /api/v1/workflows?page=1&limit=10&keyword=onboarding&status=DRAFT

Query:
  page     number, >= 1, mặc định 1
  limit    number, 1..100, mặc định 10
  keyword  string, tìm theo name (không phân biệt hoa thường), optional
  status   DRAFT | PUBLISHED | ARCHIVED, optional

Response 200: { success, message, data: Workflow[], meta }
// sắp xếp updatedAt DESC
```

### 2.3 Chi tiết workflow

```ts
GET /api/v1/workflows/:id

Response 200: { success, message, data: Workflow }
```

### 2.4 Cập nhật workflow

Tất cả field đều optional, gửi field nào cập nhật field đó.

```ts
PATCH /api/v1/workflows/:id

Body:
{
  name?: string;
  graph?: WorkflowGraph;   // gửi cả graph, BE thay toàn bộ
  status?: WorkflowStatus;
}

Response 200: { success, message, data: Workflow }
```

Quy tắc `publishedAt`:

- Chuyển sang `PUBLISHED` → `publishedAt = now`
- Chuyển về `DRAFT` → `publishedAt = null`
- Chuyển sang `ARCHIVED` hoặc gửi status không đổi → giữ nguyên

### 2.5 Xoá workflow

Soft delete.

```ts
DELETE /api/v1/workflows/:id

Response 200: { success: true, message: 'Workflow deleted successfully' }
```

### 2.6 Chat với AI để sinh / sửa graph

Stateless: BE **không lưu lịch sử chat**, FE gửi toàn bộ history mỗi lần.  
BE **không lưu graph** AI trả về, đó chỉ là bản preview.

```ts
POST /api/v1/workflows/:id/chat

Body:
{
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;            // 1..4000 ký tự
  }>;                           // 1..20 phần tử, phần tử cuối phải là 'user'
  graph?: WorkflowGraph;        // graph đang hiển thị trên canvas (kể cả chưa save)
                                // không gửi → BE dùng graph đã lưu trong DB
}

Response 200:
{
  success: true,
  message: 'success',
  data: {
    reply: string;               // câu trả lời để hiển thị trong chat
    graph: WorkflowGraph | null; // null = chỉ trả lời câu hỏi, không đổi canvas
  }
}
```

Graph AI trả về đã được BE kiểm tra: id node/edge không trùng, edge không trỏ tới node không tồn tại, `shape` hợp lệ, node có `type: 'shape'`, edge có `type: 'labeled'`.

`position` trong graph AI trả về:

- Node giữ nguyên id so với `graph` gửi lên → BE gắn lại `position` cũ, user không mất bố cục.
- Node mới AI thêm → không có `position`, FE auto-layout node đó.

Ví dụ:

```json
// Request
{
  "messages": [
    { "role": "user", "content": "Tạo quy trình tuyển dụng: lọc CV, phỏng vấn, offer" }
  ],
  "graph": { "nodes": [], "edges": [] }
}

// Response
{
  "success": true,
  "message": "success",
  "data": {
    "reply": "Mình đã tạo quy trình tuyển dụng gồm 6 bước.",
    "graph": {
      "nodes": [
        { "id": "start", "type": "shape", "data": { "label": "Bắt đầu", "shape": "circle" } },
        { "id": "screen", "type": "shape", "data": { "label": "Lọc CV", "shape": "rounded" } },
        { "id": "pass", "type": "shape", "data": { "label": "CV đạt?", "shape": "diamond" } },
        { "id": "interview", "type": "shape", "data": { "label": "Phỏng vấn", "shape": "rounded" } },
        { "id": "offer", "type": "shape", "data": { "label": "Gửi offer", "shape": "rounded" } },
        { "id": "end", "type": "shape", "data": { "label": "Kết thúc", "shape": "circle" } }
      ],
      "edges": [
        { "id": "e1", "source": "start", "target": "screen", "type": "labeled" },
        { "id": "e2", "source": "screen", "target": "pass", "type": "labeled" },
        { "id": "e3", "source": "pass", "target": "interview", "type": "labeled", "data": { "label": "Yes" } },
        { "id": "e4", "source": "pass", "target": "end", "type": "labeled", "data": { "label": "No" } },
        { "id": "e5", "source": "interview", "target": "offer", "type": "labeled" },
        { "id": "e6", "source": "offer", "target": "end", "type": "labeled" }
      ]
    }
  }
}
```

---

## 3. Error codes

| HTTP | `message` | Khi nào |
| --- | --- | --- |
| 400 | mảng lỗi validate | Body/query sai format |
| 400 | `error.workflow.chat-last-message-not-user` | Tin nhắn cuối trong `messages` không phải `user` |
| 400 | `AI provider request failed` | Gọi AI provider thất bại (hết quota, sai key, timeout...) |
| 403 | `error.workflow.forbidden` | Workflow không thuộc user hiện tại |
| 404 | `error.workflow.not-found` | Không tìm thấy workflow (hoặc đã xoá) |
| 502 | `error.workflow.ai-invalid-response` | AI trả JSON hỏng / graph không hợp lệ, FE cho user thử lại |

---

## 4. Flow sử dụng

### 4.1 Danh sách → tạo mới → mở chi tiết

```
Màn /workflows
  → GET /api/v1/workflows?page=1&limit=10
  → User bấm "New workflow"
  → POST /api/v1/workflows { name: 'Untitled workflow', graph: { nodes: [], edges: [] } }
  → router.push(`/workflows/${data.id}`)
```

### 4.2 Mở trang chi tiết

```
Màn /workflows/:id
  → GET /api/v1/workflows/:id
  → graph = data.graph
  → layoutMissingPositions(graph)  // dagre / elkjs, chỉ cho node chưa có position
  → render React Flow (fitView)
```

### 4.3 Chat để AI sinh workflow

```
User mở chat panel (AgentChatTrigger) → gõ prompt
  → FE thêm { role: 'user', content } vào messages (state local)
  → POST /api/v1/workflows/:id/chat { messages, graph: canvasGraph }
  → thêm { role: 'assistant', content: data.reply } vào messages
  → data.graph !== null ?
       có  → layoutMissingPositions(data.graph) → hiển thị preview trên canvas, đánh dấu "unsaved"
       null → giữ nguyên canvas
  → User tiếp tục chat để chỉnh ("thêm bước test kỹ thuật sau phỏng vấn")
       → gửi lại toàn bộ messages + graph hiện tại trên canvas
```

```ts
const [messages, setMessages] = useState<ChatMessage[]>([]);

async function sendMessage(content: string) {
  const next = [...messages, { role: 'user', content }].slice(-20);
  setMessages(next);

  try {
    const { data } = await api.post(`/workflows/${id}/chat`, {
      messages: next,
      graph: toWorkflowGraph(nodes, edges),
    });

    setMessages([...next, { role: 'assistant', content: data.reply }]);

    if (data.graph) {
      const { nodes, edges } = layoutMissingPositions(data.graph);
      setNodes(nodes);
      setEdges(edges);
      setDirty(true);
    }
  } catch (error) {
    // 502 error.workflow.ai-invalid-response → toast "AI trả kết quả lỗi, thử lại"
    // giữ tin nhắn user để user bấm gửi lại
  }
}
```

Lưu ý:

- `messages` tối đa 20 phần tử, FE cắt bớt tin cũ (`slice(-20)`).
- Luôn gửi `graph` đang trên canvas để AI sửa đúng bản user đang thấy, kể cả khi user đã kéo/sửa tay mà chưa save.
- Request AI có thể mất vài giây, nên disable input + hiển thị loading.

Helper phía FE:

```ts
// React Flow → payload gửi BE: giữ id, type, position, data; bỏ width, height, selected, measured...
function toWorkflowGraph(nodes: ShapeNodeType[], edges: LabeledEdgeType[]): WorkflowGraph {
  return {
    nodes: nodes.map(({ id, type, position, data }) => ({
      id,
      type,
      position: { x: position.x, y: position.y },
      data,
    })),
    edges: edges.map(({ id, source, target, type, data }) => ({ id, source, target, type, data })),
  };
}

// BE → React Flow: node đã có position giữ nguyên, node thiếu position thì chạy dagre/elkjs
function layoutMissingPositions(graph: WorkflowGraph) {
  // 1. Chạy layout cho toàn graph để có vị trí gợi ý
  // 2. Node có position → dùng position đã lưu
  //    Node không có → dùng vị trí từ layout (bù width/height theo getShapeConfig(shape))
  // 3. Map sang ShapeNodeType / LabeledEdgeType
}
```

### 4.4 Lưu / publish

```
User bấm Save
  → PATCH /api/v1/workflows/:id { graph: toWorkflowGraph(nodes, edges) }   // có position của mọi node
  → setDirty(false)
  → lần sau mở trang, mọi node đều có position → không cần layout lại

User bấm Publish
  → PATCH /api/v1/workflows/:id { status: 'PUBLISHED' }

User bấm Discard (bỏ preview AI)
  → GET /api/v1/workflows/:id → render lại graph đã lưu
```

### 4.5 Xoá

```
User bấm Delete
  → confirm
  → DELETE /api/v1/workflows/:id
  → router.push('/workflows')
```
