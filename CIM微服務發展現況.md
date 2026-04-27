# CIM微服務發展現況

## page 1. 軟體架構模式演進

1. Mainframe Monolithic 
2. Client-Server
3. Web Application
4. ServiceOriented Architecture
5. Microservices

## page 2. RESTful API over HTTP (REpresentational State Transfer)

### 優點

1. 簡單易用
   - GET/POST/DELETE
2. 可擴展性
   - 無狀態架構/分層架構
3. 廣泛支持
   - 程式語言支持
   - 操作系統支援
  
### 效益

1. 減少防火牆開通
2. 加速系統整合
3. 簡化技術整合

## page 3. 微服務架構的優點

### 優點

1. 持續交付
2. 可擴展性
3. 故障隔離
4. 靈活性
5. 可重用性
   
### 效益

1. 減少重複工作
2. 專業分工、並行開發
3. 降低系統風險
4. 橫向擴充、快速調節
   
## page 4. CIM微服務發展歷程

日期	事件
2011	REST MesMobileAp restlet (android) 
2012	REST ASP.NET MVC (MES API)
2013	REST RTQCS Service
2014	*多人協同開發 GIT
2015	REST MES Service (CFM)
2018	SPA/REST .NETCore + angular
2019	*gateway/Consul (Service discovery/routing)
2019	CFM mobile
2020	*App Management (快速佈署)
2021	開放外部單位申請API供取得資料
2023	API performance collection
2024	consul K/V使用

## page 5. CIM服務專案/佈署數量

年份	上線數	累積數
2019	3	3
2020	6	9
2021	6	15
2022	3	18
2023	7	25
2024	9	34
2025	3	37

*已佈署服務實體618項

## page 6. 服務監控

<網頁監控畫面截圖>

## page 7. CIM通用服務介紹

1. File Service 
   - 上傳/下載/刪除檔案
   - 支援SMB/FTP/SFTP
   - Defect file/image 下載
   - Defect file parsing
2. UAC API
   - AD/UAC認證
   - UAC 授權檢查
   - 人員資訊查詢
3. UMD API
   - UMD alarm訊息發送
4. APP Management
   - 主機/程式狀態回報
   - 程式版本查詢
5. MES API 
   - 發送MES TRX
   - PUT/GET Queue (MQ)
6. CFM API
   - 設備狀態查詢
7. DefectMap API
   - Defect 資訊轉Map
   - Chart資訊轉圖表
8. AP Analysis API
   - 上報AP使用率
9. User API
   - 存取User 喜好設定

## page 8. 外部系統合作

1. MES API (檔案轉MES TRX)
   - PLP廠客戶Wafer Map上傳至MES
   - 康寧素玻璃defect拋送
2. MES API plus
   - LCD RFID廠商合作
3. CFM API
   - 地震壓降復機回報系統
4. UAC API
   - 人員基本資訊查詢
5. RTQCS/MES API
   - 廠內戰情系統
6. File Service 
   - PLP 客戶測試程式及結果回傳

## page 9. 未來發展

- 持續與外單位合作，進行資料分享及系統對接*1。
- 進行服務品質管理，監控服務效能。
- 持續開發整合性應用，增強用戶體驗。

註*1: 目前運行中有31件。

## page 10. 重點總結

- 公司內部資料分享。
- 跨系統應用開發。
- 跨部門專業分工。
- 微服務介面設計上應考慮可重用性。


