# 工廠 AI 影像智能專案進度報告 (2026)

## 第一部分：專案群組進度總覽 (Executive Summary)

### 1. 核心願景
利用工廠預計採購的 IP Camera 資源，結合邊緣運算（Edge AI）與大數據分析，將傳統「被動監看」轉變為「自動辨識、即時預警、精準溯源」，全面提升工廠的安全管理、品質監控與作業合規性。

### 2. 四大方案布局與進度
*   **模型建置平台 (UMS)**：**[預計 5/4 發佈]** AI 模型的孵化中心。統一 GPU 資源管理與自動化訓練流程，確保模型品質可追蹤。
*   **邊緣端安防監控 (Edge Safety)**：**[已發佈 4/23]** 廠區安全守護者。落實 PPE 防護具辨識、電子圍籬與人員昏倒偵測，目前已進入現場部署階段。
*   **邊緣端 SOP 監控 (Edge SOP)**：**[預計 5/21 發佈]** 作業品質稽核員。透過手部與工具追蹤，確保作業步驟完整性與正確順序。
*   **影像監控分析系統 (ARGUS)**：**[預計 6/30 發佈]** 影像數據決策大腦。整合跨廠區 200+ 攝影機，提供語意搜尋與警報分級管理。

---

## 第二部分：分頁簡報內容 (Slide Deck Detail)

### Slide 1: 標題頁
*   **標題**：智慧影像‧安全領航：工廠 AI 影像監控系統規畫與時程報告
*   **副標題**：從邊緣推論到統一管理的智慧工廠轉型路徑
*   **演講重點**：介紹資訊部門如何透過四項關鍵專案，將 AI 技術深耕於工廠一線。
*   **AI 提示詞**：A high-tech factory control room with AI holographic displays showing video feeds and analytics, professional and minimalist style.

### Slide 2: 現況痛點與轉型目標
*   **標題**：為何我們需要 AI 影像監控？
*   **關鍵內容**：
    *   **挑戰**：監控畫面過多看不過來、事故回溯耗時長、SOP 稽核全靠人工抽檢。
    *   **轉型目標**：**100% 自動辨識**避免工安意外及違規稽核、**即時**收集 SOP 作業資訊及異常告警。
*   **AI 提示詞**：Comparison chart showing "Human Observation" (slow, error-prone) vs "AI Vision" (fast, precise).

### Slide 3: 方案架構總覽
*   **標題**：全方位 AI 影像解決方案佈局
*   **關鍵內容**：
    *   **研發端**：UMS 建模平台（持續優化模型準確率）。
    *   **執行端**：Edge Predictor (Safety/SOP) 邊緣推論（現場即時反應）。
    *   **決策端**：ARGUS 管理平台（跨廠區數據整合與搜尋）。
*   **AI 提示詞**：Diagram showing a 3-layer architecture: Training Platform -> Edge Computing -> Management Hub.

### Slide 4: UMS - 高效 AI 模型研發中心
*   **標題**：UMS：從數據到模型的自動化流水線
*   **關鍵內容**：
    *   **核心價值**：統一 GPU 資源管理，解決多任務競爭衝突。
    *   **品質確保**：自動產出混淆矩陣 (Confusion Matrix) 驗證，確保模型精準度符合工廠標準。
*   **AI 提示詞**：Software interface showing a neural network training progress with a confusion matrix chart.

### Slide 5: Edge Safety - 廠區工安守護 (已上線)
*   **標題**：Edge Safety：零時差安全防護
*   **關鍵內容**：
    *   **PPE 偵測**：自動辨識安全帽、無塵服配戴。
    *   **電子圍籬**：危險區域、禁制區即時入侵警報。
    *   **人員狀態**：昏倒、跌倒偵測，縮短急救黃金時間。
*   **AI 提示詞**：Split screen showing 3 AI video feeds: 1. Person with red box around head (helmet), 2. Electronic fence intrusion (red zone), 3. Person on floor (fall detection).

### Slide 6: Edge SOP - 作業行為數位化
*   **標題**：Edge SOP：確保品質的最後一哩路
*   **關鍵內容**：
    *   **動素分析**：追蹤手部、工具位置與作業時間。
    *   **邏輯判斷**：支援「嚴格順序」與「無序但必做」判斷。
    *   **即時通報**：漏做步驟或順序錯誤時，立即觸發通報。
*   **AI 提示詞**：An operator at a workstation with AI skeletal tracking overlay, showing a checklist of SOP steps on the side.

### Slide 7: ARGUS - 跨廠區影像管理大腦
*   **標題**：ARGUS：跨廠區 200+ 攝影機統一管理
*   **關鍵內容**：
    *   **語意搜尋**：透過語意條件（如：找特定時段未戴安全帽者）快速定位影像。
    *   **高性能播放**：支援 MP4 直接串流與秒級裁切，節省轉檔資源。
    *   **自動化維運**：ONVIF 自動探測設備，降低部署複雜度。
*   **AI 提示詞**：A clean, modern dashboard showing multiple camera feeds, a search bar with tags like "No Helmet", "Fab 3", "Camera 12".

### Slide 8: 技術實力與效能表現
*   **標題**：高效能與高兼容性的技術基石
*   **關鍵內容**：
    *   **極速推論**：GPU 版本 YOLOv11n 每一張影像推論僅需 18~28ms。
    *   **靈活部署**：支援 GPU 極速運算（效能極致）與 CPU 基礎部署（節省成本）。
    *   **儲存管理**：預設保留 15 天歷史影像，關鍵警報永久存檔。
*   **AI 提示詞**：Bar chart comparing GPU vs CPU inference speed, emphasizing the 18ms speed mark.

### Slide 9: 預期效益 (ROI)
*   **標題**：數位轉型所帶來的實質效益
*   **關鍵內容**：
    *   **效率提升**：減少人工監看與事故調閱時間達 80% 以上。
    *   **安全保障**：由「發生後翻找」進化為「發生時即時阻斷」。
    *   **品質穩定**：SOP 自動化監測，降低人為失誤造成的產品損耗。
*   **AI 提示詞**：Infographic showing icons for "Cost Reduction", "Risk Mitigation", and "Efficiency Increase".

### Slide 10: 專案發佈里程碑
*   **標題**：專案開發進度與發佈時程
*   **關鍵內容**：
    *   🚀 **UMS (建模平台)**：**5/4 預計發佈**
    *   ✅ **Edge Safety (安防監控)**：**4/23 已發佈上線**
    *   🚀 **Edge SOP (作業檢測)**：**5/21 預計發佈**
    *   🚀 **ARGUS (分析系統)**：**6/30 預計發佈**
*   **AI 提示詞**：A horizontal timeline with 4 milestones, each with a date and project name, modern and clean graphics.

### Slide 11: 附錄：系統演進與差異分析
*   **標題**：UMS vs. AI ADJ：為何 UMS 是更優的平台？
*   **關鍵內容**：
    *   **資料管理**：AI ADJ 無資料集概念，須重覆上傳；**UMS 提供資料集版本化與線上標註**，資產可重用。
    *   **協作模式**：AI ADJ 缺乏權限與專案劃分；**UMS 支援專案管理與團隊設定**，實現跨部門協作。
    *   **平台特性**：AI ADJ 專注於 AOI 瑕疵檢測；**UMS 為通用型平台**，支援工廠全場景 AI 模型研發。
*   **AI 提示詞**：A professional comparison table with green checkmarks highlighting UMS's advantages over AI ADJ.
