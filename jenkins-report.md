hint 

你是半導體工廠資訊系統開發維護部門經理，目前接到任務要提出一部門亮點報告，即季度工作成果報告。報告對象為公司副總，他是半導體工廠工程出身，對工廠管理運作熟悉。你想以「本季部門開發人員改為使用jenkins 流程取代人員自行建置並發佈」的成果，說明效益及緣由、還有未來展望。你想先做一份簡報大網，及大綱內各項目的內容規劃。並輸出report.md。

## 可用的 Pipeline

- [Angular Pipeline](./docs/angularPipeline.md)
- [Angular Library Pipeline](./docs/angularLibPipeline.md)
- [Angular pnpm Pipeline](./docs/angularPnpmPipeline.md)
- [.NET 套件 Pipeline](./docs/dotnetPkgPipeline.md)
- [.NET Api/AP Pipeline](./docs/dotnetApiPipeline.md)
- [.NET framework 套件 Pipeline](./docs/dotnetfwPkgPipeline.md)
- [.NET framework AP Pipeline](./docs/dotnetfwApPipeline.md)
- [pnpm Pipeline](./docs/pnpmPipeline.md)
- [node Pipeline](./docs/nodePipeline.md)
- [pnpm Pipeline](./docs/pnpmPipeline.md)
- [gradle Pipeline](./docs/gradlePipeline.md)
- [工具模組](./docs/utilities.md)



ci-cd-flow

# 部門 CI/CD 流程說明文件

## 1. 前言

持續整合（Continuous Integration, CI）和持續部署/交付（Continuous Deployment/Delivery, CD）是現代軟體開發的基石。它們旨在透過自動化流程，加速軟體從開發到交付的整個生命週期，同時確保程式碼品質和系統穩定性。

本文件將詳細說明本部門的 CI/CD 流程，從程式碼管理到最終部署，並提供優化建議與討論點，以期建立一個更高效、可靠且安全的開發與交付管道。

## 2. CI/CD 流程總覽

我們的 CI/CD 流程可以概括為以下幾個主要階段：

1.  **程式碼提交 (Code Commit)**：開發人員將程式碼提交至版本控制系統。

2.  **持續整合 (Continuous Integration)**：
    * 自動化建置 (Automated Build)
    * 單元測試與整合測試 (Unit/Integration Test)
    * 靜態程式碼分析 (Static Code Analysis)
    * 映像檔建立與推送 (Docker Image Build & Push)
    * 安全掃描 (Vulnerability Scanning)

3.  **持續交付/部署 (Continuous Delivery/Deployment)**：
    * 環境部署 (Deployment to Dev/Staging/Production)
    * 監控與日誌 (Monitoring & Logging)

---

## 3. 程式碼管理與開發流程

### 3.1 分支策略 (Branching Strategy)

目前部門採用類似 Gitflow 的分支模型，這是一個非常成熟且廣泛應用的策略，有助於管理複雜的開發流程。

* **`master` 分支**：
    * **用途**：此分支應始終保持可部署狀態，代表最新的穩定版本。
    * **權限**：僅 Owner 可以進行 push 及合併。
    * **[建議]**：強烈建議即使是 Owner，也應避免直接 push 到 `master`。所有變更都應透過 Pull Request (PR) 流程，確保程式碼經過審核和自動化測試後才能合併。這能有效降低引入錯誤的風險，並為所有變更留下明確的審計追蹤。
* **`release` 分支**：
    * **用途**：用於準備發布版本，從 `master` 分支建立，在此分支上進行最終的 Bug 修復和發布準備工作。
    * **權限**：僅 Owner 可以進行 push。
    * **[建議]**：建議在 Web UI 上建立 `release` 分支，並在完成發布後，將 `release` 分支的變更合併回 `master` (確保 Bug Fix 也反映在主線上) 和 `develop` (如果未來引入 `develop` 分支的話，詳見下方提問)。
* **`feature/{工作編號|需求單號}` 分支**：
    * **用途**：用於開發新功能或大型需求。
    * **命名範例**：`feature/31658-add-auth-check, feature/F240100384-new-ui-component`
* **`patch/{工作編號}` 分支**：
    * **用途**：用於修復生產環境中的緊急 Bug (Hotfix)。
    * **命名範例**：`patch/30066-fix-payment-issue`
* **`other` 分支**：
    * **用途**：用於其他臨時性或實驗性的開發。
    * **[建議]**：對於 `other` 分支，建議能有更明確的命名規範，例如 `temp/{目的}` 或 `experiment/{實驗名稱}`，以提高可讀性並避免混淆。

### 3.2 標籤策略 (Tagging Strategy)

目前部門僅定義版本標籤。

*   **版本標籤 (Version Tag)**
    *   **格式**：`v{version}`，例如 `v1.2.3`。
    *   **用途**：此標籤格式保留給 CI/CD 流程使用。當 `release` 分支的部署成功後，Jenkins 會自動在 Git Server (Gitea) 上為對應的 commit 加上此版本標籤，作為該版本的永久標記。

### 3.3 角色與職責

* **Owner (專案負責人/維護者)**：
    * 負責 `master` 及 `release` 分支的管理與維護。
    * 審核並核准 Pull Request (PR)。
    * 負責發布流程。
* **協作者 (Collaborator)**：
    * 協同開發程式碼。
    * 依工作編號或需求單號建立分支 (`feature` 或 `patch`) 並進行開發。
    * 完成開發後，提出 Pull Request (PR)。
* **審核者 (Reviewer)**：
    * 負責 Pull Request (PR) 的程式碼審核，通常由 Owner 擔任。
* **發行者 (Publisher)**：
    * 負責發布流程，通常由 Owner 擔任。

### 3.4 開發流程詳述

1.  **取得最新程式碼**：
    * 開發人員 `fetch` 最新版 `master` 分支並 `checkout`。
    * **[建議]**：在開始新工作前，`git pull origin master` 以確保本地 `master` 分支與遠端同步，避免基於過時程式碼開發。
2.  **建立分支並開發**：
    * 依修改目的建立新分支 (`feature/{工作編號|需求單號}` 或 `patch/{工作編號}`) 並進行開發。
    * **[建議]**：即使是 Owner，也應養成建立其他分支開發的好習慣，方便臨時需切換回 `master` 處理緊急事務。這也符合程式碼審核的最佳實踐。
3.  **提交變更至 Git Server**：
    * **[建議]**：在推送前，建議先 `fetch` 最新的 `master` 分支並進行 `rebase`，提前解決潛在衝突，保持提交歷史的線性與乾淨。
        ```bash
        git fetch origin master
        git rebase origin/master
        ```
    * 將修改後的本地分支 `push` 到 Git Server。
    * **[提問]**：你們的 Git Server 是什麼？(e.g., GitLab, GitHub, Bitbucket, Gitea?) 這會影響後續 CI/CD 平台的整合方式。
4.  **Pull Request (PR) 流程**：
    * **協作者**：在 Git Server 上提出 PR，目標分支通常為 `master`。
        * **[建議]**：PR 的標題和描述應清晰說明本次變更的目的、內容和相關工作編號。
        * **自動化觸發**：提出 PR 後，**Jenkins** 會自動觸發建置流程。
        * **合併衝突處理**：
            * 若 PR 出現 `merge conflict` (合併衝突)，協作者需退回步驟 3，解決衝突。
            * **[建議]**：解決衝突的最佳實踐是 `fetch` 最新 `master` 分支，然後對自己的開發分支進行 `rebase` 操作。
                ```bash
                # 假設你目前在 feature/your-branch
                git fetch origin master
                git rebase origin/master
                # 解決衝突 (若有)
                # git add .
                # git rebase --continue
                # rebase 完成後，強制推送 (因為歷史記錄已改變)
                git push --force-with-lease origin feature/your-branch
                ```rebase` 能夠保持提交歷史的線性，使提交記錄更清晰。`--force-with-lease` 則能更安全地強制推送，避免覆蓋他人提交。
    * **審核者 (Owner)**：
        * 確認程式碼品質 (有寫 Unit Test 為佳)。
        * **[建議]**：程式碼審核不僅要看功能邏輯，還要檢查程式碼風格、潛在 Bug、效能問題和安全漏洞。鼓勵審核者提供建設性意見。
        * 通過 PR 後，將修改分支合併到 `master`。

### 3.5 發行流程詳述

1.  **建立 Release 分支**：
    * 發行者 (通常是 Owner) 在 `master` 分支上建立 `release/{version}` 分支。
    * **版本號規範**：`version` 遵循 **Semantic Versioning 2.0.0 (語義化版本)** 格式。
        * **格式**：`MAJOR.MINOR.PATCH` (主版號.次版號.修訂版號)
        * **範例**：
            * `1.0.0`：初始發布。
            * `1.0.1`：修復了 Bug，且向下相容。
            * `1.1.0`：新增了功能，且向下相容。
            * `2.0.0`：有不向下相容的重大變更。
        * **[建議]**：對於預發布版本，可以使用 `1.0.0-alpha` 或 `1.0.0-beta`。
    * **自動化觸發**：建立 `release` 分支後，**Jenkins** 會自動觸發建置流程，並將部署檔案上傳至 **APP Manager 平台**。
2.  **部署到測試環境**：
    * 在 **APP Manager** 平台上，將新建立的版本部署到測試環境 (e.g., QA 環境、Staging 環境) 進行測試。
    * **[建議]**：測試環境應盡可能模擬生產環境，確保測試結果的可靠性。

---

## 4. CI/CD 關鍵階段與優化建議

### 4.1 自動化建置 (Automated Build)

* **目的**：將原始程式碼編譯成可執行檔或可部署的套件 (例如 EXE, JAR, WAR, Docker Image)。
* **為什麼必要**：確保程式碼可以在任何環境下被一致地建置，消除「在我機器上可以跑」的問題。自動化建置是 CI 的第一步，如果建置失敗，後續所有步驟都無意義。
* **[建議]**：確保建置過程是冪等的 (Idempotent)，即重複執行多次也能得到相同的結果。使用建置工具 (如 Maven, Gradle, Webpack 等) 並將建置腳本納入版本控制。

### 4.2 單元測試與整合測試 (Unit/Integration Test)

* **目的**：
    * **單元測試 (Unit Test)**：驗證程式碼中最小的可測試單元 (如函數、方法) 是否按預期工作。
    * **整合測試 (Integration Test)**：驗證不同模組或服務之間的互動是否正確。
* **為什麼必要**：在開發早期發現 Bug，降低修復成本。提供程式碼品質的即時反饋，並作為程式碼重構的信心保證。
* **[建議]**：
    * **高測試覆蓋率**：雖然不是唯一指標，但高測試覆蓋率 (例如 80% 以上) 通常意味著程式碼經過了更充分的測試。
    * **快速執行**：單元測試應該快速執行，以便在每次提交後都能迅速得到反饋。
    * **自動化執行**：確保所有測試都在 CI 流程中自動執行，並在測試失敗時阻止後續流程。

### 4.3 靜態程式碼分析 (Static Code Analysis)

* **目的**：在不執行程式碼的情況下，檢查程式碼中的潛在錯誤、程式碼風格問題、複雜度過高或潛在的安全漏洞。
* **為什麼必要**：
    * **早期發現問題**：在測試階段之前就能發現問題，降低修復成本。
    * **提高程式碼品質**：強制執行程式碼風格規範，提高程式碼的可讀性、可維護性。
    * **潛在安全漏洞**：識別常見的安全漏洞模式 (如 SQL Injection, XSS)。
    * **技術債管理**：幫助識別和管理程式碼中的「壞味道」(Code Smells)。
* **[建議]**：整合 SonarQube、ESLint (JavaScript)、Pylint (Python) 等工具到 Jenkins 流程中。設定品質門檻 (Quality Gates)，例如要求 Bug 數、安全漏洞數低於某個閾值才能通過。

### 4.4 映像檔建立與推送 (Docker Image Build & Push)

* **目的**：將應用程式及其所有依賴項打包成一個輕量級、可移植、自給自足的 Docker 映像檔。然後將其推送到 Docker Registry (如 Docker Hub, Harbor, AWS ECR)。
* **為什麼必要**：
    * **環境一致性**：解決「在我機器上可以跑」的問題，確保應用程式在任何環境 (開發、測試、生產) 中都能以相同方式運行。
    * **快速部署**：容器啟動速度快。
    * **資源隔離**：不同應用程式之間相互隔離，避免依賴衝突。
    * **[提問]**：你們使用哪個 Docker Registry？是私有的還是公共的？這會影響 Jenkins 配置和憑證管理。

### 4.5 安全掃描 (Vulnerability Scanning)

* **目的**：掃描 Docker 映像檔、程式碼依賴庫或應用程式本身，以識別已知的安全漏洞。
* **為什麼必要**：
    * **降低安全風險**：在部署到生產環境之前發現並修復漏洞，避免潛在的資料洩露或服務中斷。
    * **合規性要求**：許多行業有嚴格的安全合規性要求。
* **[建議]**：
    * **映像檔掃描**：使用 Trivy、Clair 或 Snyk 等工具掃描 Docker 映像檔中的已知漏洞。
    * **依賴掃描 (SCA)**：掃描專案使用的第三方函式庫是否存在漏洞 (如 OWASP Dependency-Check)。
    * **動態應用程式安全測試 (DAST)**：在應用程式運行時進行安全掃描 (如 OWASP ZAP)。
    * **靜態應用程式安全測試 (SAST)**：靜態程式碼分析工具通常也包含 SAST 功能。

### 4.6 環境部署 (Deployment to Dev/Staging/Production)

* **目的**：將建置好的應用程式部署到不同的環境 (開發、測試、預生產、生產)。
* **[提問]**：你們目前使用哪種部署策略？(例如：**藍綠部署 (Blue/Green Deployment)**、**滾動式更新 (Rolling Update)**、**金絲雀發布 (Canary Release)** 或其他？) 不同的策略有不同的優缺點和適用場景。
    * **藍綠部署**：維護兩個相同的生產環境 (藍色和綠色)，一次只活躍一個。新版本部署到非活躍環境，測試通過後切換流量。優點是零停機、快速回滾。
    * **滾動式更新**：逐步替換舊版本的實例。每次更新一小部分，確保新版本穩定後再繼續。優點是平滑過渡、資源利用率高。
* **[建議]**：
    * **自動化部署**：盡可能將部署過程完全自動化，減少人為錯誤。
    * **環境隔離**：確保各環境之間完全隔離，避免相互影響。
    * **配置管理**：使用配置管理工具 (如 Ansible, Terraform) 或環境變數來管理不同環境的配置。

### 4.7 監控與日誌 (Monitoring & Logging)

* **目的**：收集應用程式和基礎設施的運行數據 (指標、日誌、追蹤)，以便了解系統健康狀況、發現問題並進行故障排除。
* **為什麼必要**：
    * **即時問題發現**：在用戶發現問題之前，及早發現異常。
    * **性能優化**：透過監控數據識別性能瓶頸。
    * **故障排除**：日誌提供詳細的執行軌跡，幫助快速定位問題。
    * **業務洞察**：監控業務指標可以提供有價值的業務洞察。
* **[建議]**：
    * **監控工具**：整合 Prometheus + Grafana (指標)、ELK Stack (Elasticsearch, Logstash, Kibana) 或 Loki + Grafana (日誌) 等工具。
    * **集中式日誌**：將所有應用程式的日誌集中收集，方便查詢和分析。
    * **告警機制**：設定關鍵指標的告警閾值，當達到閾值時自動通知相關人員。
    * **可觀察性 (Observability)**：除了監控，也應關注可觀察性，即系統能夠回答任何關於其內部狀態的問題，通常透過指標 (Metrics)、日誌 (Logs) 和追蹤 (Traces) 三個支柱實現。

---

## 5. 待討論與優化點

### 5.1 CI/CD 平台

* **[提問]**：除了 Jenkins，你們是否有考慮過其他 CI/CD 平台？例如：
    * **GitLab CI/CD**：與 GitLab 深度整合，配置簡單，易於使用。
    * **GitHub Actions**：與 GitHub 深度整合，提供豐富的 Actions 生態系統。
    * **CircleCI / Travis CI**：雲端 CI/CD 服務，配置簡單。
    * **Azure DevOps / AWS CodePipeline**：雲服務商提供的 CI/CD 解決方案。
    * 選擇適合的平台可以大幅提升開發效率和流程自動化程度。

### 5.2 Secrets 管理

* **[提問]**：你們目前如何安全地管理應用程式的敏感資訊 (例如資料庫密碼、API Key、第三方服務憑證等)？
    * **[建議]**：不應將 Secrets 直接硬編碼在程式碼或版本控制中。建議使用專門的 Secrets 管理工具，例如：
        * **HashiCorp Vault**
        * **Kubernetes Secrets** (如果使用 Kubernetes)
        * **雲服務商的 Secrets Manager** (如 AWS Secrets Manager, Azure Key Vault, Google Secret Manager)
        * **Jenkins Credentials** (用於 Jenkins 內部)
        * 這些工具可以安全地儲存、分發和輪換敏感資訊。

### 5.3 部署策略與回滾 (Rollback)

* **[建議]**：無論採用何種部署策略，都必須設計完善的回滾機制。當新版本出現嚴重問題時，能夠快速、安全地恢復到上一個穩定版本。這通常涉及保留舊版本的部署包或映像檔，並能一鍵切換。

### 5.4 自動化測試的擴展

* **[建議]**：除了單元測試和整合測試，可以考慮引入：
    * **端到端測試 (End-to-End Test)**：模擬用戶行為，測試整個應用程式流程。
    * **性能測試 (Performance Test)**：評估應用程式在負載下的響應速度和穩定性。
    * **安全測試 (Security Test)**：除了漏洞掃描，還可以進行滲透測試等。

### 5.5 持續學習與改進

* **[建議]**：CI/CD 流程不是一成不變的，應定期審查和改進。鼓勵團隊成員提出優化建議，並關注業界最新的 DevOps 實踐和工具。

## 6. 結語

這份文件概述了部門的 CI/CD 流程，並提供了一些優化建議和待討論的問題。CI/CD 是一個持續演進的過程，透過不斷的自動化、測試和優化，我們可以顯著提高軟體交付的速度、品質和可靠性。



## 現有流程痛點

- 每位同仁在本地端自行建置、發行或佈署專案，流程分散且難以追蹤
- 有時會發生忘記 push 原始碼到 Git server，導致版本不同步
- 無法確保開發者遵守規範，如套件參考 local package
- 文件或版本資訊未及時更新，導致專案資訊不一致
- 缺乏自動化流程，容易產生人為疏失

## Jenkins 導入的改善目標

- 統一建置、測試、發行與佈署流程，減少人為錯誤
- 透過自動化確保每次發行皆可追蹤、記錄並驗證版本一致
- 強制發行前原始碼需 push 至 Git，確保版本與文件同步更新
- 串接內部系統，簡化並自動化流程，提升團隊協作效率
