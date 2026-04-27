# Conductor 開發流程報告（草稿）

---

# 封面
- 標題：Conductor + Gemini CLI 開發流程總結
- 專案：ums-frontend
- 日期：2026-01-15

**講稿要點**：簡短介紹本簡報目的 - 從對話紀錄與 Conductor 檔案抽取的流程、規範與實務建議。

---

# 總覽摘要
- Conductor 是以 tracks/plan/spec 為中心的流程管理方法
- 每個 track 對應一個功能開發週期（phase/task）
- 強制 TDD、可稽核提交與文件同步

**講稿要點**：說明 Conductor 的核心價值：可追溯、可驗證、以規範驅動開發。

---

# 重要檔案（位置與用途）
- conductor/tracks.md：Tracks 清單與指向資料夾
- conductor/tracks/<track_id>/plan.md：每個 track 的任務列表與階段
- conductor/tracks/<track_id>/spec.md：功能規格
- conductor/workflow.md：任務執行與品質門檻
- conductor/tech-stack.md：技術棧變更規範
- conductor/product.md：產品願景（需同步時更新）

**講稿要點**：快速介紹每個檔案用途和互動方式。

---

# Track 與 Task 流程（精要）
1. 選擇 Track（從 `tracks.md`）
2. 將 task 設為 `[~]`（進行中）
3. 寫失敗測試（Red）→ 實作（Green）→ 重構
4. 驗證 coverage (>80%)、style、lint
5. commit 並使用 `git notes` 附上任務摘要
6. 更新 `plan.md` 為 `[x]` 並附上 short SHA

**講稿要點**：逐步解釋每個步驟背後的理由，強調 TDD 與可稽核紀錄的重要性。

---

# Phase Checkpoint 與驗證
- 完成 phase 後：
  - 用 `git diff --name-only <prev_sha> HEAD` 決定變更範圍
  - 補齊缺失測試
  - 在 CI 下執行測試（範例：`CI=true npm test`）
  - 生成手動驗證計畫（給 QA 的步驟）
  - 建立 checkpoint commit 並附上驗證報告為 git note

**講稿要點**：強調 checkpoint 的可追溯性與 QA 流程整合。

---

# 文件同步流程（Docs Sync）
- 觸發時機：track 標為 `[x]`
- 分析 `spec.md` 對 `product.md`、`tech-stack.md`、`product-guidelines.md` 的影響
- 提出 diff 並要求使用者確認，確認後再修改

**講稿要點**：說明審核與確認機制，避免任意修改產品層級文件。

---

# 常見指令與實務範例
- /conductor:implement <track_id>
- /conductor:newTrack <desc>
- /conductor:status
- 測試：`CI=true npm test`
- commit 範例：`feat(team): Implement CreateTeamModalComponent`
- git note：`git notes add -m "Task summary" <commit_hash>`

**講稿要點**：列出可在報告中直接引用的命令行示例。

---

# 專案中觀察到的實例（證據）
- `team_management_20260113`：plan/spec 與 workflow 的實際應用
- `MockBackendInterceptor`：在前端使用 mock 以便在後端未完成時進行整合測試
- 多個 session 中使用 `/conductor:implement` 指令來啟動流程

**講稿要點**：以具體專案檔案與 session 指令作為證據支撐報告。

---

# 風險與建議
- 風險：後端 API 未完成時，整合測試受阻
- 建議：維持完善 mock（如 `MockBackendInterceptor`），把 `MOCK_*` 資料放在明確位置；必要時先用 contract tests 驗證 API 規格
- 建議：把 `conductor` 目錄列為 review 重點，定期同步 `tech-stack.md`

**講稿要點**：提出明確可執行的風險緩解方法。

---

# 結語與下一步建議
- 建議一：把此簡報轉為 PPT（可由我轉檔）
- 建議二：為主要 track 產出完整證據包（包含 commit、git notes、測試結果）
- 建議三：每週檢視 `conductor/tracks.md` 做優先序與狀態更新

**講稿要點**：呼籲採取下一步，並提供我協助轉檔或匯出成 PPT 的選項。
