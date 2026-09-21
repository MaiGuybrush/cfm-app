/**
 * CIM Web Portal 2.0 - 系統資料配置檔 (Data Configuration)
 * 供 CIM 維護與前端動態載入使用
 */
window.CIM_PORTAL_CONFIG = {
  version: "2.0.0",
  lastUpdated: "2026-09-21",
  fabs: ["ALL", "ARRAY", "CF", "LCD", "PLP"],
  roles: [
    { id: "ai", name: "AI 智造旗艦", icon: "sparkles", desc: "Computer Vision、智慧預測與 MLOps 平台" },
    { id: "mfg", name: "MFG 製造", icon: "factory", desc: "生產調度、派工管理、在製品與稼動追蹤" },
    { id: "eng", name: "ENG 製程設備", icon: "cpu", desc: "機台異常、FDC、SPC 排除與參數管制" },
    { id: "int", name: "INT 整合", icon: "network", desc: "跨廠關聯、良率整合分析與缺陷特徵庫" },
    { id: "qa", name: "QA 品質", icon: "shield-check", desc: "即時缺陷控管、AI 智慧判定與品質統計" },
    { id: "cim", name: "CIM 維運", icon: "wrench", desc: "值班日誌、伺服器代碼倉庫與內部工具" },
    { id: "all", name: "全部系統", icon: "layout-grid", desc: "檢視收錄之所有 CIM 廠端應用與平台" }
  ],
  aiViews: {
    scenarios: [
      { id: "vision", name: "視覺檢測與缺陷判定", desc: "即時瑕疵檢測、邊界對位與 AI 影像自動審核" },
      { id: "measure_repair", name: "精密量測與自動修補", desc: "雷射修補導引、高精度關鍵尺寸與膜厚量測" },
      { id: "security", name: "廠區安防與行為識別", desc: "智慧影像安防、無人車及禁區闖入追蹤" },
      { id: "motion", name: "人員動素與工時分析", desc: "瓶頸工站人體骨幹動態辨識與 SOP 標準工時" },
      { id: "platform", name: "AI 核心平台與工具", desc: "自主模型訓練、服務監控與統一佈署平台" }
    ],
    technologies: [
      { id: "cv", name: "電腦視覺 (Computer Vision)", desc: "Object Detection, Defect Classification, Segmentation" },
      { id: "ml", name: "數據與機器學習 (Machine Learning)", desc: "製程特徵預測、SPC 趨勢分析、參數推薦" },
      { id: "edge", name: "邊緣運算與即時推論 (Edge AI)", desc: "現場設備 Edge Box 毫秒級即時推論串流" },
      { id: "genai", name: "生成式 AI 與知識庫 (GenAI & LLM)", desc: "智慧故障排除對話機器人、SOP 語意檢索" },
      { id: "mlops", name: "MLOps 與演算法平台 (AI Platform)", desc: "模型版控、Pipeline 流程調度與推論資源池" }
    ]
  },
  contextGroups: {
    mfg: [
      { id: "dispatch", name: "生產調度與執行" },
      { id: "monitoring", name: "即時機況與異常" },
      { id: "reports", name: "報表與履歷看板" }
    ],
    eng: [
      { id: "alarm", name: "即時監控與工程警報" },
      { id: "recipe", name: "工程分析與配方管制" },
      { id: "reports", name: "工程報表與歷程" }
    ],
    int: [
      { id: "cross_fab", name: "跨製程相關性與異常分析" },
      { id: "yield_defect", name: "良率整合與缺陷特徵庫" }
    ],
    qa: [
      { id: "quality_ctrl", name: "即時缺陷監控與管制" },
      { id: "ai_adj", name: "AI 智能判定與復判" },
      { id: "manuals", name: "品保手冊與標準" }
    ],
    cim: [
      { id: "maintenance", name: "系統維護與值班" },
      { id: "resources", name: "資源與代碼資產" }
    ]
  },
  systems: [
    // --- QA & ENG ---
    {
      id: "rtqcs",
      name: "RTQCS",
      title: "即時品質缺陷監控系統",
      code: "RTQCS",
      desc: "全廠 TFT / CF 缺陷影像即時檢測、警報防堵與品質歷程追蹤分析。",
      url: "http://tncimweb.cminl.oa/rtqcs/tft3",
      icon: "http://tncimweb.cminl.oa/rtqcs/tft3/RTQCS.ico",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["qa", "eng"],
      contexts: { qa: "quality_ctrl", eng: "alarm" },
      aiMeta: null,
      docs: [{ title: "系統手冊", url: "http://tncimweb.cminl.oa/usermanual/rtqcs/" }]
    },
    {
      id: "aiadj",
      name: "AIADJ",
      title: "智能缺陷判定系統",
      code: "AIADJ",
      desc: "結合深度卷積神經網路之缺陷影像自動覆核判定，大幅減輕工程覆核負擔。",
      url: "http://tncimweb.cminl.oa/aiadj",
      icon: "http://tncimweb.cminl.oa/aiadj/favicon.ico",
      fabs: ["ARRAY", "CF"],
      roles: ["qa", "eng", "ai"],
      contexts: { qa: "ai_adj", eng: "alarm" },
      aiMeta: {
        scenario: "vision",
        tech: "cv",
        badge: "Computer Vision / 視覺判定"
      },
      docs: [{ title: "使用者手冊", url: "http://tncimweb.cminl.oa/usermanual/aiadj/" }]
    },
    {
      id: "inxadj",
      name: "INXADJ",
      title: "影像判定與人工覆核",
      code: "INXADJ",
      desc: "影像缺陷快速檢視、線上人工二次判讀與覆核資料拋轉系統。",
      url: "http://tncimweb.cminl.oa/inxadj",
      icon: "http://tncimweb.cminl.oa/inxadj/inxadj.ico",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["qa"],
      contexts: { qa: "ai_adj" },
      aiMeta: null,
      docs: []
    },
    {
      id: "inxadm",
      name: "INXADM",
      title: "品質資料統計與管理",
      code: "INXADM",
      desc: "品質統計指標、產線異常紀錄與品管基礎主檔管理維護平台。",
      url: "http://tncimweb.cminl.oa/inxadm",
      icon: "http://tncimweb.cminl.oa/inxadm/inxadm.ico",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["qa"],
      contexts: { qa: "quality_ctrl" },
      aiMeta: null,
      docs: []
    },
    {
      id: "defect-lib",
      name: "Defect Library",
      title: "缺陷影像特徵知識庫",
      code: "INSP",
      desc: "各製程站點歷史缺陷特徵圖譜、典型案例比對與防杜因應指南。",
      url: "http://tncimweb.cminl.oa/insp",
      icon: "http://tncimweb.cminl.oa/insp/favicon.ico",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["qa", "int"],
      contexts: { qa: "manuals", int: "yield_defect" },
      aiMeta: {
        scenario: "vision",
        tech: "cv",
        badge: "Feature Search / 影像檢索"
      },
      docs: [{ title: "使用手冊", url: "http://tncimweb.cminl.oa/insp/user-manual/" }]
    },
    {
      id: "spc-trouble",
      name: "SPC 異常排除手冊",
      title: "統計製程管制排除引導",
      code: "SPC",
      desc: "管制圖異常 Rule 越界時的標準處置流程、原因分析與對策引導。",
      url: "http://tncimweb.cminl.oa/SpcAssistant/zh-tw/tft3/Troubleshooting",
      icon: null,
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["eng", "qa"],
      contexts: { eng: "alarm", qa: "manuals" },
      aiMeta: null,
      docs: []
    },

    // --- ENG & FDC ---
    {
      id: "ifdc",
      name: "iFDC",
      title: "機台故障偵測與分類",
      code: "FDC",
      desc: "半導體與面板製程機台即時 SVID 數據監控、故障分類與異常早期警報。",
      url: "http://tncimweb.cminl.oa/FDC",
      icon: "http://tncimweb.cminl.oa/FDC/favicon.ico",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["eng", "qa"],
      contexts: { eng: "alarm", qa: "quality_ctrl" },
      aiMeta: null,
      docs: [{ title: "操作手冊", url: "http://tncimweb.cminl.oa/usermanual/fdc/" }]
    },
    {
      id: "eng-edcx",
      name: "ENG (EDCX,EMS,EQBK)",
      title: "工程數據與配方管理",
      code: "ENG",
      desc: "整合 EDCX 工程數據收集、EMS 設備狀態管理與 EQBK 配方版本管制。",
      url: "http://tncimweb.cminl.oa/eng/#/edc",
      icon: "http://tncimweb.cminl.oa/eng/favicon.ico",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["eng", "int"],
      contexts: { eng: "recipe", int: "cross_fab" },
      aiMeta: null,
      docs: [{ title: "使用者手冊", url: "http://tncimweb.cminl.oa/plp-eng/user-manual/" }]
    },
    {
      id: "plp-eng",
      name: "PLP ENG (EDCX)",
      title: "PLP 專屬工程數據系統",
      code: "PLP-ENG",
      desc: "針對先進封裝 PLP 產線客製化之 EDCX 數據收集與製程工程分析套件。",
      url: "http://tncimweb.cminl.oa/plp-eng/#/edc",
      icon: "http://tncimweb.cminl.oa/plp-eng/favicon.ico",
      fabs: ["PLP"],
      roles: ["eng"],
      contexts: { eng: "recipe" },
      aiMeta: null,
      docs: [{ title: "使用者手冊", url: "http://tncimweb.cminl.oa/plp-eng/user-manual/" }]
    },
    {
      id: "r2r",
      name: "R2R Web OPI",
      title: "先進製程閉迴路控制",
      code: "R2R",
      desc: "Run-to-Run 前饋與回饋動態參數補償機制，穩定關鍵站點沉積與微影精度。",
      url: "http://tncimweb.cminl.oa/r2r/#/home",
      icon: "http://tncimweb.cminl.oa/r2r/favicon.ico",
      fabs: ["ARRAY", "CF"],
      roles: ["eng"],
      contexts: { eng: "recipe" },
      aiMeta: null,
      docs: []
    },
    {
      id: "opi-kit",
      name: "Opi Kit",
      title: "現場作業工程介面工具箱",
      code: "OPI",
      desc: "提供產線機台端觸控操作快速輸入、工程標註與即時輔助小工具集。",
      url: "http://tncimweb.cminl.oa/opi-kit/",
      icon: "http://tncimweb.cminl.oa/opi-kit/assets/images/logo.svg",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["eng"],
      contexts: { eng: "recipe" },
      aiMeta: null,
      docs: [{ title: "使用手冊", url: "http://tncimweb.cminl.oa/opi-kit/user-manual" }]
    },
    {
      id: "cf-riic",
      name: "CF RIIC",
      title: "CF 製程即時警報與防錯",
      code: "RIIC",
      desc: "彩色濾光片塗布與曝光即時機況參數干預與重大防錯連鎖系統。",
      url: "http://priic.cminl.oa",
      icon: "http://priic.cminl.oa/favicon.ico",
      fabs: ["CF"],
      roles: ["eng"],
      contexts: { eng: "alarm" },
      aiMeta: null,
      docs: []
    },

    // --- MFG ---
    {
      id: "mfg-iss",
      name: "MFG (iSS)",
      title: "智慧排程與動態派工",
      code: "ISS",
      desc: "基於全廠在製品庫存與產能約束的最佳化排程調度，提升生產瓶頸通量。",
      url: "http://tncimweb.cminl.oa/mfg/#/iss",
      icon: "http://tncimweb.cminl.oa/mfg/favicon.ico",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["mfg"],
      contexts: { mfg: "dispatch" },
      aiMeta: null,
      docs: []
    },
    {
      id: "cfm",
      name: "CFM",
      title: "製造現場即時搬送監控",
      code: "CFM",
      desc: "自動化物料搬運系統 (AMHS)、卡匣在途狀態與儲區 (Stocker) 容積監控。",
      url: "http://tncimweb.cminl.oa/cfm",
      icon: "http://tncimweb.cminl.oa/cfm/favicon.ico",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["mfg"],
      contexts: { mfg: "dispatch" },
      aiMeta: null,
      docs: []
    },
    {
      id: "plp-cfm",
      name: "PLP CFM",
      title: "PLP 搬送與產線監控",
      code: "PLP-CFM",
      desc: "PLP 先進封裝產線專屬物料搬運、載具追蹤與即時動態稼動看板。",
      url: "http://tncimweb.cminl.oa/plp-cfm",
      icon: "http://tncimweb.cminl.oa/plp-cfm/favicon.ico",
      fabs: ["PLP"],
      roles: ["mfg"],
      contexts: { mfg: "dispatch" },
      aiMeta: null,
      docs: []
    },
    {
      id: "eq-status-push",
      name: "機況推播系統",
      title: "關鍵機況即時推播",
      code: "PUSH",
      desc: "機台斷線、警報停機與關鍵指標異常透過通訊軟體與簡訊秒級告警推播。",
      url: "http://tncimweb.cminl.oa/EQStatusPush",
      icon: "http://tncimweb.cminl.oa/EQStatusPush/favicon.ico",
      fabs: ["ARRAY", "CF", "LCD", "PLP"],
      roles: ["mfg", "eng"],
      contexts: { mfg: "monitoring", eng: "alarm" },
      aiMeta: null,
      docs: [{ title: "使用手冊", url: "http://tncimweb.cminl.oa/EQStatusPush/user-manual/" }]
    },
    {
      id: "umd",
      name: "UMD",
      title: "搬送與機況異常監控",
      code: "UMD",
      desc: "無人化自動搬送異常即時警報分析與卡匣壅塞診斷中央控制台。",
      url: "http://ptnecimumd.cminl.oa",
      icon: "http://ptnecimumd.cminl.oa/images/alarm.png",
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["mfg", "eng"],
      contexts: { mfg: "monitoring", eng: "alarm" },
      aiMeta: null,
      docs: [
        { title: "使用手冊", url: "http://ptnecimumd.cminl.oa/user-manual/" },
        { title: "系統說明", url: "http://tncimweb.cminl.oa/UserManual/UmdSysIntro/" }
      ]
    },

    // --- AI HUB ---
    {
      id: "ums",
      name: "UMS",
      title: "AI 統一管理服務平台",
      code: "UMS",
      desc: "企業級 AI 演算法平台，統管模型生命週期 (MLOps)、推論 API 網關與伺服器資源排程。",
      url: "http://tncimweb1.cminl.oa/ums",
      icon: "http://tncimweb1.cminl.oa/ums/favicon.ico",
      fabs: ["ALL"],
      roles: ["ai", "cim"],
      contexts: { cim: "resources" },
      aiMeta: {
        scenario: "platform",
        tech: "mlops",
        badge: "MLOps Platform / 統一架構"
      },
      docs: [{ title: "使用手冊", url: "http://tncimweb1.cminl.oa/ums/user-manual" }]
    },
    {
      id: "auto-ml",
      name: "autoML",
      title: "自主機器學習訓練平台",
      code: "AUTO-ML",
      desc: "零代碼/低代碼快速機器學習工作坊，支援工程師自主進行參數回歸與分類預測模型建立。",
      url: "http://tncimweb.cminl.oa/auto-ml",
      icon: null,
      fabs: ["ARRAY", "CF", "LCD"],
      roles: ["ai", "eng"],
      contexts: { eng: "recipe" },
      aiMeta: {
        scenario: "platform",
        tech: "ml",
        badge: "AutoML / 參數預測"
      },
      docs: []
    },

    // --- CIM MAINTENANCE & INFRA ---
    {
      id: "helpdesk",
      name: "值班工具",
      title: "CIM 值班登錄與 Issue 追蹤",
      code: "DESK",
      desc: "CIM 每日值班紀錄、產線事件登記、交接事項與緊急異常聯絡名冊。",
      url: "http://tncimweb.cminl.oa/helpdesk",
      icon: "http://tncimweb.cminl.oa/helpdesk/favicon.ico",
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "maintenance" },
      aiMeta: null,
      docs: [{ title: "使用手冊", url: "http://tncimweb.cminl.oa/helpdesk/user-manual/" }]
    },
    {
      id: "app-mgmt",
      name: "App Manager",
      title: "應用程式生命週期管理",
      code: "APPM",
      desc: "CIM 自行開發軟體部署版本管控、配置設定檔同步與健康狀態檢查。",
      url: "http://tncimweb.cminl.oa/AppManagement",
      icon: "http://tncimweb.cminl.oa/AppManagement/favicon.ico",
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "maintenance" },
      aiMeta: null,
      docs: []
    },
    {
      id: "analysis-report",
      name: "使用率報表",
      title: "CIM 服務點閱與流量統計",
      code: "METRICS",
      desc: "分析全廠各系統即時訪問量、使用者行為分佈與伺服器負載綜合報表。",
      url: "http://tncimweb.cminl.oa/AnalysisReport",
      icon: "http://tncimweb.cminl.oa/AnalysisReport/favicon.ico",
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "maintenance" },
      aiMeta: null,
      docs: []
    },
    {
      id: "uac",
      name: "UAC",
      title: "使用者權限與認證中心",
      code: "UAC",
      desc: "全廠單一簽入 (SSO)、各應用程式角色指派與 API 金鑰存取權限控管。",
      url: "http://tncimweb.cminl.oa/uac",
      icon: "http://tncimweb.cminl.oa/uac/favicon.ico",
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "maintenance" },
      aiMeta: null,
      docs: [{ title: "使用者手冊", url: "http://tncimweb.cminl.oa/uac/user-manual/" }]
    },
    {
      id: "git-server",
      name: "Git Server",
      title: "內部原始碼版本倉庫",
      code: "GIT",
      desc: "CIM 開發專案代碼管理、CI/CD 流程觸發與內部技術文件庫。",
      url: "http://tncimweb.cminl.oa/git-server",
      icon: "http://tncimweb.cminl.oa/git-server/assets/img/logo.svg",
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "resources" },
      aiMeta: null,
      docs: []
    },
    {
      id: "app-repo",
      name: "App Repository",
      title: "安裝包與工具程式庫",
      code: "REPO",
      desc: "產線工程端常用 DLL、安裝套裝軟體與 Python 模組私有鏡像庫。",
      url: "http://tncimweb1.cminl.oa:8080/files",
      icon: "http://tncimweb1.cminl.oa:8080/static/img/logo.svg",
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "resources" },
      aiMeta: null,
      docs: []
    },
    {
      id: "spms",
      name: "備品管理系統",
      title: "伺服器硬體與備品資產",
      code: "SPMS",
      desc: "CIM 機房主機、備用硬碟、記憶體與通訊模組盤點及維修歷程追蹤。",
      url: "http://tncimweb.cminl.oa/Spms",
      icon: "http://tncimweb.cminl.oa/Spms/favicon.ico",
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "resources" },
      aiMeta: null,
      docs: [{ title: "使用手冊", url: "http://tncimweb.cminl.oa/Spms/user-manual/" }]
    },
    {
      id: "cloud-drive",
      name: "Cloud Drive",
      title: "內部雲端檔案儲存盤",
      code: "DRIVE",
      desc: "跨部門大型日誌記錄檔、日報與測試影像數據安全快速儲存交換。",
      url: "http://tncimweb.cminl.oa/CloudDrive",
      icon: null,
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "resources" },
      aiMeta: null,
      docs: []
    },
    {
      id: "file-share",
      name: "內部檔案分享服務",
      title: "超高速 P2P 局域網檔案交換",
      code: "SHARE",
      desc: "內部高速傳輸節點，專門用於 Gigabyte 等級 Raw Data 與模型權重分發。",
      url: "http://10.53.216.112:31777",
      icon: "http://10.53.216.112:31777/public/static/favicon.svg",
      fabs: ["ALL"],
      roles: ["cim"],
      contexts: { cim: "resources" },
      aiMeta: null,
      docs: [{ title: "使用說明", url: "http://10.53.216.112/docs/" }]
    }
  ]
};
