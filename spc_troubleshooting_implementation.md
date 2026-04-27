# 工程師助理 SPC Troubleshooting 系統設計方案

## 需求分析

**核心需求：**
- 基礎對話能力：回答一般工程問題
- 結構化流程：執行特定 SPC troubleshooting 流程
- 指令系統：透過 `/[指令]` 觸發特定流程
- 流程上下文：在流程中保持狀態和數據

---

## 架構設計：三種實現方案對比

### 方案一：路由 Agent 模式（推薦 ⭐⭐⭐⭐⭐）

**核心思想：**主 Agent 作為路由器，解析指令並將任務分發給專門的流程 Agent

**架構圖：**
```
用戶輸入
    ↓
指令解析器（Toolkit Function）
    ↓
├─ 一般對話 → 主 Agent 直接回應
├─ /spc_cpk → CPK 分析流程 Agent
├─ /spc_xbar → X-bar R Chart 流程 Agent
├─ /spc_p → P Chart 流程 Agent
└─ /root_cause → 根因分析流程 Agent
```

**實現代碼：**

```python
import os
import re
from typing import Optional
from enum import Enum
from agentscope.agent import ReActAgent, AgentBase
from agentscope.model import DashScopeChatModel
from agentscope.formatter import DashScopeChatFormatter
from agentscope.memory import InMemoryMemory
from agentscope.tool import Toolkit, ToolResponse
from agentscope.message import Msg, TextBlock
from agentscope.pipeline import sequential_pipeline


class SPCCommand(Enum):
    """SPC Troubleshooting 指令枚舉"""
    CPK_ANALYSIS = "/spc_cpk"
    XBAR_CHART = "/spc_xbar"
    P_CHART = "/spc_p"
    ROOT_CAUSE = "/root_cause"
    PROCESS_AUDIT = "/process_audit"
    LIST_COMMANDS = "/help"


class SPCFlowAgent(ReActAgent):
    """
    專門執行 SPC 流程的 Agent
    每個流程 Agent 都有固定的執行步驟
    """
    def __init__(self, flow_name: str, flow_steps: list[str], **kwargs):
        self.flow_name = flow_name
        self.flow_steps = flow_steps
        self.current_step = 0
        self.flow_data = {}  # 存儲流程中收集的數據
        
        super().__init__(**kwargs)
    
    async def execute_flow(self, initial_msg: Msg) -> Msg:
        """執行完整流程"""
        self.current_step = 0
        self.flow_data = {}
        
        msg = initial_msg
        
        # 流程開始提示
        flow_intro = Msg(
            "system",
            f"開始執行 {self.flow_name} 流程，共 {len(self.flow_steps)} 個步驟。",
            "assistant"
        )
        
        # 逐步執行流程
        for step_idx, step in enumerate(self.flow_steps, 1):
            self.current_step = step_idx
            
            step_prompt = Msg(
                "user",
                f"【步驟 {step_idx}/{len(self.flow_steps)}】{step}\n\n"
                f"請根據當前步驟提供指導或請求用戶提供必要信息。",
                "user"
            )
            
            msg = await self(step_prompt)
            
            # 檢查是否需要用戶輸入
            if "請提供" in msg.get_text_content() or "需要" in msg.get_text_content():
                # 這裡實際應用中會等待用戶輸入
                # 目前簡化處理
                pass
        
        # 流程結束
        summary = Msg(
            "system",
            f"{self.flow_name} 流程已完成。是否需要生成報告？",
            "assistant"
        )
        
        return summary


class EngineerAssistant:
    """
    工程師助理主控類
    負責指令解析和 Agent 路由
    """
    
    def __init__(self):
        # 基礎配置
        self.model = DashScopeChatModel(
            model_name="qwen-max",
            api_key=os.environ["DASHSCOPE_API_KEY"],
        )
        self.formatter = DashScopeChatFormatter()
        self.memory = InMemoryMemory()
        
        # 創建主對話 Agent
        self.main_agent = self._create_main_agent()
        
        # 創建流程 Agent 字典
        self.flow_agents = self._create_flow_agents()
        
        # 當前活躍的流程
        self.active_flow: Optional[SPCFlowAgent] = None
    
    def _create_main_agent(self) -> ReActAgent:
        """創建主對話 Agent"""
        toolkit = Toolkit()
        
        # 註冊指令解析工具
        toolkit.register_tool_function(self.parse_command)
        toolkit.register_tool_function(self.list_available_commands)
        
        return ReActAgent(
            name="EngineerAssistant",
            sys_prompt="""你是一位專業的工程師助理，專精於 SPC（統計製程管制）。

你的職責包括：
1. 回答一般工程和 SPC 相關問題
2. 識別用戶的指令（以 / 開頭）並執行對應的 SPC troubleshooting 流程
3. 在流程執行中提供專業指導

當用戶輸入以 / 開頭的指令時，使用 parse_command 工具來解析並執行對應流程。
如果用戶詢問可用指令，使用 list_available_commands 工具。""",
            model=self.model,
            formatter=self.formatter,
            memory=self.memory,
            toolkit=toolkit,
        )
    
    def _create_flow_agents(self) -> dict[str, SPCFlowAgent]:
        """創建各種 SPC 流程 Agent"""
        flows = {
            SPCCommand.CPK_ANALYSIS.value: SPCFlowAgent(
                flow_name="CPK 製程能力分析",
                flow_steps=[
                    "收集製程數據：請提供至少 30 個連續的測量數據點",
                    "計算基本統計量：平均值、標準差、範圍",
                    "計算 Cp 和 Cpk 值",
                    "判定製程能力等級（Cpk >= 1.33 為優良）",
                    "識別改善方向：是精度問題還是準度問題？",
                    "提供改善建議"
                ],
                name="CPK_Agent",
                sys_prompt="你是 CPK 製程能力分析專家，引導用戶完成分析流程。",
                model=self.model,
                formatter=self.formatter,
                memory=InMemoryMemory(),
                toolkit=Toolkit(),
            ),
            
            SPCCommand.XBAR_CHART.value: SPCFlowAgent(
                flow_name="X-bar & R Chart 分析",
                flow_steps=[
                    "定義子組：確定合理的子組大小（通常 3-5）",
                    "收集數據：每個子組的測量值",
                    "計算 X-bar（子組平均值）和 R（全距）",
                    "計算管制界限：UCL、CL、LCL",
                    "繪製管制圖並識別異常點",
                    "判定製程是否在管制狀態",
                    "分析特殊原因（8 大判異法則）"
                ],
                name="XbarChart_Agent",
                sys_prompt="你是管制圖分析專家，協助建立和解讀 X-bar R Chart。",
                model=self.model,
                formatter=self.formatter,
                memory=InMemoryMemory(),
                toolkit=Toolkit(),
            ),
            
            SPCCommand.ROOT_CAUSE.value: SPCFlowAgent(
                flow_name="根因分析（5 Why + 魚骨圖）",
                flow_steps=[
                    "定義問題：明確描述製程異常現象",
                    "收集數據：異常發生的時間、頻率、影響範圍",
                    "進行 5 Why 分析：連續詢問 5 次「為什麼」",
                    "繪製魚骨圖：從人、機、料、法、環 5M 分析",
                    "驗證根因：設計實驗或收集證據",
                    "制定對策：SMART 原則（具體、可衡量、可達成）",
                    "追蹤效果：設定 KPI 和追蹤機制"
                ],
                name="RootCause_Agent",
                sys_prompt="你是根因分析專家，使用系統化方法找出問題的真正原因。",
                model=self.model,
                formatter=self.formatter,
                memory=InMemoryMemory(),
                toolkit=Toolkit(),
            ),
        }
        
        return flows
    
    def parse_command(self, user_input: str) -> ToolResponse:
        """
        解析用戶指令
        
        Args:
            user_input: 用戶的完整輸入
            
        Returns:
            解析結果，包含指令類型和參數
        """
        # 檢查是否為指令格式
        command_pattern = r'^/(\w+)(?:\s+(.*))?$'
        match = re.match(command_pattern, user_input.strip())
        
        if not match:
            return ToolResponse(
                content=[TextBlock(
                    type="text",
                    text="這不是有效的指令格式。使用 /help 查看可用指令。"
                )]
            )
        
        command = f"/{match.group(1)}"
        params = match.group(2) or ""
        
        # 檢查指令是否存在
        if command in self.flow_agents:
            return ToolResponse(
                content=[TextBlock(
                    type="text",
                    text=f"識別到指令：{command}，準備執行對應流程。參數：{params}"
                )]
            )
        elif command == SPCCommand.LIST_COMMANDS.value:
            return self.list_available_commands()
        else:
            return ToolResponse(
                content=[TextBlock(
                    type="text",
                    text=f"未知指令：{command}。使用 /help 查看可用指令。"
                )]
            )
    
    def list_available_commands(self) -> ToolResponse:
        """列出所有可用指令"""
        commands_text = "可用的 SPC Troubleshooting 指令：\n\n"
        
        for cmd in SPCCommand:
            if cmd.value in self.flow_agents:
                flow = self.flow_agents[cmd.value]
                commands_text += f"{cmd.value} - {flow.flow_name}\n"
        
        commands_text += "\n使用方式：直接輸入指令，例如 /spc_cpk"
        
        return ToolResponse(
            content=[TextBlock(type="text", text=commands_text)]
        )
    
    async def process_message(self, user_input: str) -> Msg:
        """
        處理用戶輸入的主要接口
        
        Args:
            user_input: 用戶輸入的文本
            
        Returns:
            Agent 的回應消息
        """
        user_msg = Msg("user", user_input, "user")
        
        # 檢查是否為指令
        if user_input.strip().startswith("/"):
            command_match = re.match(r'^/(\w+)', user_input.strip())
            if command_match:
                command = f"/{command_match.group(1)}"
                
                # 執行對應的流程
                if command in self.flow_agents:
                    self.active_flow = self.flow_agents[command]
                    response = await self.active_flow.execute_flow(user_msg)
                    return response
                elif command == SPCCommand.LIST_COMMANDS.value:
                    help_info = self.list_available_commands()
                    return Msg("assistant", help_info.content[0].text, "assistant")
        
        # 一般對話
        response = await self.main_agent(user_msg)
        return response


# 使用示例
async def main():
    import asyncio
    
    assistant = EngineerAssistant()
    
    print("工程師助理已啟動！輸入 /help 查看可用指令。\n")
    
    # 模擬對話
    test_inputs = [
        "你好，我想了解 SPC 的基本概念",
        "/help",
        "/spc_cpk",
        "什麼是 Cpk？",
    ]
    
    for user_input in test_inputs:
        print(f"\n用戶：{user_input}")
        response = await assistant.process_message(user_input)
        print(f"助理：{response.get_text_content()}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

---

### 方案二：Skill + Tool 組合模式（推薦 ⭐⭐⭐⭐）

**核心思想：**將流程定義為 Agent Skill，流程步驟作為 Tool 實現

**優勢：**
- 流程邏輯清晰可見（在 SKILL.md 中）
- 靈活組合不同流程
- 易於維護和版本控制

**實現架構：**

```
skills/
├── spc_cpk/
│   ├── SKILL.md           # CPK 分析流程說明
│   ├── scripts/
│   │   └── cpk_calc.py   # 計算工具
│   └── examples/
│       └── sample_data.csv
│
├── spc_xbar/
│   ├── SKILL.md
│   └── scripts/
│       └── control_chart.py
│
└── root_cause/
    ├── SKILL.md
    └── references/
        └── 5why_template.md
```

**SKILL.md 示例（spc_cpk/SKILL.md）：**

```yaml
---
name: spc_cpk_analysis
description: 引導用戶完成 CPK 製程能力分析的完整流程，用於評估製程品質
---

# CPK 製程能力分析流程

## 何時使用此 Skill
當用戶輸入 `/spc_cpk` 或提到「製程能力分析」、「Cpk 計算」時，啟用此 Skill。

## 流程步驟

### 步驟 1：數據收集
請用戶提供以下信息：
- 規格上限（USL）和規格下限（LSL）
- 至少 30 個連續的測量數據點
- 測量單位和頻率

**工具調用：**使用 `view_text_file` 讀取用戶上傳的 CSV 文件

### 步驟 2：數據驗證
- 檢查數據完整性
- 識別異常值（使用 3σ 原則）
- 確認數據呈常態分布（如需要可進行常態性檢驗）

### 步驟 3：計算統計量
調用 `calculate_cpk` 工具計算：
- 平均值 (μ)
- 標準差 (σ)
- Cp = (USL - LSL) / 6σ
- Cpk = min((USL - μ)/3σ, (μ - LSL)/3σ)

### 步驟 4：結果解讀
根據 Cpk 值給出判定：
- Cpk >= 1.67：製程能力優異
- 1.33 <= Cpk < 1.67：製程能力良好
- 1.00 <= Cpk < 1.33：製程能力尚可，需改善
- Cpk < 1.00：製程能力不足，需立即改善

### 步驟 5：改善建議
- 若 Cp 高但 Cpk 低：製程偏移問題（準度），建議調整製程中心
- 若 Cp 和 Cpk 都低：變異太大（精度），建議減少製程變異

### 步驟 6：生成報告
使用 `generate_cpk_report` 工具生成包含以下內容的報告：
- 數據摘要統計
- CPK 計算結果
- 製程能力判定
- 改善建議

## 相關工具
- `calculate_cpk(data, usl, lsl)`: 計算 Cpk 值
- `generate_cpk_report(results)`: 生成分析報告
- `plot_histogram(data, usl, lsl)`: 繪製直方圖

## 注意事項
- 確保數據來自穩定製程（先用管制圖確認）
- 數據需呈常態分布
- 至少需要 30 個數據點，建議 100+ 個
```

**實現代碼：**

```python
from agentscope.tool import Toolkit
from agentscope.agent import ReActAgent
import pandas as pd
import numpy as np


# 定義 CPK 計算工具
async def calculate_cpk(data_csv_path: str, usl: float, lsl: float) -> ToolResponse:
    """
    計算製程能力指標 Cpk
    
    Args:
        data_csv_path: 測量數據的 CSV 文件路徑
        usl: 規格上限
        lsl: 規格下限
    """
    # 讀取數據
    df = pd.read_csv(data_csv_path)
    data = df['measurement'].values
    
    # 計算統計量
    mean = np.mean(data)
    std = np.std(data, ddof=1)  # 樣本標準差
    
    # 計算 Cp 和 Cpk
    cp = (usl - lsl) / (6 * std)
    cpk = min((usl - mean) / (3 * std), (mean - lsl) / (3 * std))
    
    result = {
        "mean": mean,
        "std": std,
        "cp": cp,
        "cpk": cpk,
        "sample_size": len(data)
    }
    
    return ToolResponse(
        content=[TextBlock(
            type="text",
            text=f"CPK 分析結果：\n"
                 f"- 平均值：{mean:.4f}\n"
                 f"- 標準差：{std:.4f}\n"
                 f"- Cp：{cp:.4f}\n"
                 f"- Cpk：{cpk:.4f}\n"
                 f"- 樣本數：{len(data)}"
        )]
    )


# 創建 Agent 並註冊 Skill 和 Tool
toolkit = Toolkit()
toolkit.register_agent_skill("skills/spc_cpk")
toolkit.register_tool_function(calculate_cpk)
toolkit.register_tool_function(view_text_file)

agent = ReActAgent(
    name="SPC_Assistant",
    sys_prompt="你是 SPC 製程管制專家，使用 Skill 引導用戶完成分析流程。",
    model=model,
    formatter=formatter,
    toolkit=toolkit,
)
```

---

### 方案三：狀態機模式（適合複雜流程 ⭐⭐⭐）

**核心思想：**將流程建模為狀態機，Agent 在不同狀態間轉換

**適用場景：**
- 流程有複雜的分支邏輯
- 需要頻繁的狀態回滾
- 用戶可能在流程中途切換任務

**實現示例：**

```python
from enum import Enum, auto
from typing import Optional

class CPKFlowState(Enum):
    """CPK 分析流程的狀態"""
    IDLE = auto()
    COLLECTING_SPEC = auto()      # 收集規格
    COLLECTING_DATA = auto()      # 收集數據
    VALIDATING_DATA = auto()      # 驗證數據
    CALCULATING = auto()          # 計算中
    INTERPRETING = auto()         # 解讀結果
    GENERATING_REPORT = auto()    # 生成報告
    COMPLETED = auto()            # 完成


class CPKFlowStateMachine:
    """CPK 分析流程的狀態機"""
    
    def __init__(self):
        self.state = CPKFlowState.IDLE
        self.data = {}
        self.history = []  # 狀態歷史，支持回退
    
    def transition_to(self, new_state: CPKFlowState):
        """狀態轉換"""
        self.history.append(self.state)
        self.state = new_state
        print(f"狀態轉換：{self.history[-1].name} -> {new_state.name}")
    
    def can_transition_to(self, target_state: CPKFlowState) -> bool:
        """檢查是否可以轉換到目標狀態"""
        # 定義允許的狀態轉換規則
        transitions = {
            CPKFlowState.IDLE: [CPKFlowState.COLLECTING_SPEC],
            CPKFlowState.COLLECTING_SPEC: [CPKFlowState.COLLECTING_DATA],
            CPKFlowState.COLLECTING_DATA: [CPKFlowState.VALIDATING_DATA],
            CPKFlowState.VALIDATING_DATA: [
                CPKFlowState.CALCULATING, 
                CPKFlowState.COLLECTING_DATA  # 數據無效時回到收集
            ],
            CPKFlowState.CALCULATING: [CPKFlowState.INTERPRETING],
            CPKFlowState.INTERPRETING: [CPKFlowState.GENERATING_REPORT],
            CPKFlowState.GENERATING_REPORT: [CPKFlowState.COMPLETED],
        }
        
        return target_state in transitions.get(self.state, [])
    
    def rollback(self) -> bool:
        """回退到上一個狀態"""
        if self.history:
            self.state = self.history.pop()
            print(f"回退到狀態：{self.state.name}")
            return True
        return False
    
    def get_prompt_for_current_state(self) -> str:
        """根據當前狀態生成提示詞"""
        prompts = {
            CPKFlowState.COLLECTING_SPEC: 
                "請提供規格上限（USL）和規格下限（LSL）。",
            CPKFlowState.COLLECTING_DATA: 
                "請上傳測量數據的 CSV 文件，或直接貼上數據。",
            CPKFlowState.VALIDATING_DATA: 
                "正在驗證數據完整性和常態性...",
            CPKFlowState.CALCULATING: 
                "正在計算 Cp 和 Cpk 值...",
            CPKFlowState.INTERPRETING: 
                "分析完成，正在解讀結果並提供建議...",
            CPKFlowState.GENERATING_REPORT: 
                "正在生成詳細報告...",
            CPKFlowState.COMPLETED: 
                "CPK 分析流程已完成。輸入 /new 開始新的分析。",
        }
        return prompts.get(self.state, "")


class StateMachineAgent(ReActAgent):
    """整合狀態機的 Agent"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.state_machine = None
    
    def start_flow(self, flow_type: str):
        """啟動特定流程"""
        if flow_type == "cpk":
            self.state_machine = CPKFlowStateMachine()
            self.state_machine.transition_to(CPKFlowState.COLLECTING_SPEC)
    
    async def reply(self, msg: Msg) -> Msg:
        """重寫 reply 方法以整合狀態機邏輯"""
        # 如果有活躍的狀態機
        if self.state_machine and self.state_machine.state != CPKFlowState.IDLE:
            prompt = self.state_machine.get_prompt_for_current_state()
            enhanced_msg = Msg(
                "system",
                f"{prompt}\n\n原始輸入：{msg.get_text_content()}",
                "system"
            )
            response = await super().reply(enhanced_msg)
            
            # 根據回應決定狀態轉換（這裡簡化處理）
            # 實際應用中需要更複雜的邏輯判斷
            
            return response
        else:
            return await super().reply(msg)
```

---

## 推薦實現方案

**針對你的需求，我推薦「方案一 + 方案二」的混合架構：**

### 混合架構設計

```python
class HybridEngineerAssistant:
    """
    混合架構的工程師助理
    - 使用路由 Agent 模式處理指令分發
    - 使用 Skill 模式定義流程知識
    - 使用專門的 Tool 實現計算邏輯
    """
    
    def __init__(self):
        self.main_toolkit = Toolkit()
        
        # 1. 註冊所有 SPC Skill
        self.main_toolkit.register_agent_skill("skills/spc_cpk")
        self.main_toolkit.register_agent_skill("skills/spc_xbar")
        self.main_toolkit.register_agent_skill("skills/root_cause")
        
        # 2. 註冊計算和分析工具
        self.main_toolkit.register_tool_function(calculate_cpk)
        self.main_toolkit.register_tool_function(plot_control_chart)
        self.main_toolkit.register_tool_function(five_why_analysis)
        
        # 3. 註冊指令路由工具
        self.main_toolkit.register_tool_function(self.route_to_flow)
        
        # 4. 創建主 Agent
        self.agent = ReActAgent(
            name="EngineerAssistant",
            sys_prompt="""你是專業的 SPC 工程師助理。

**工作模式：**
1. 一般對話：直接回答工程和 SPC 相關問題
2. 流程執行：當用戶輸入 /指令 時，啟用對應的 Skill 並引導完成流程

**可用指令：**
- /spc_cpk：CPK 製程能力分析
- /spc_xbar：X-bar R 管制圖分析
- /root_cause：根因分析（5 Why + 魚骨圖）
- /help：顯示所有可用指令

當識別到指令時，調用 route_to_flow 工具來啟用對應的 Skill。""",
            model=model,
            formatter=formatter,
            toolkit=self.main_toolkit,
        )
    
    def route_to_flow(self, command: str) -> ToolResponse:
        """路由到對應的流程 Skill"""
        skill_mapping = {
            "/spc_cpk": "spc_cpk_analysis",
            "/spc_xbar": "spc_xbar_analysis",
            "/root_cause": "root_cause_analysis",
        }
        
        skill_name = skill_mapping.get(command)
        if skill_name:
            # 載入 Skill 內容
            skill_content = self.main_toolkit.load_skill_through_path(skill_name)
            return ToolResponse(
                content=[TextBlock(
                    type="text",
                    text=f"已啟用 {skill_name}，開始執行流程。\n\n{skill_content}"
                )]
            )
        else:
            return ToolResponse(
                content=[TextBlock(
                    type="text",
                    text=f"未知指令：{command}。使用 /help 查看可用指令。"
                )]
            )
    
    async def chat(self, user_input: str) -> str:
        """主要對話接口"""
        msg = Msg("user", user_input, "user")
        response = await self.agent(msg)
        return response.get_text_content()
```

---

## 進階功能實現

### 1. 流程中斷與恢復

```python
class FlowStateManager:
    """流程狀態管理器"""
    
    def __init__(self):
        self.active_flows = {}  # user_id -> flow_state
    
    def save_flow_state(self, user_id: str, flow_data: dict):
        """保存流程狀態"""
        self.active_flows[user_id] = {
            "flow_type": flow_data["type"],
            "current_step": flow_data["step"],
            "collected_data": flow_data["data"],
            "timestamp": datetime.now()
        }
    
    def resume_flow(self, user_id: str) -> Optional[dict]:
        """恢復流程"""
        return self.active_flows.get(user_id)
    
    def clear_flow(self, user_id: str):
        """清除流程狀態"""
        if user_id in self.active_flows:
            del self.active_flows[user_id]
```

### 2. 流程進度追蹤

```python
def create_progress_tracker(total_steps: int):
    """創建進度追蹤器"""
    def track_progress(current_step: int) -> str:
        progress = (current_step / total_steps) * 100
        bar_length = 20
        filled = int(bar_length * current_step / total_steps)
        bar = "█" * filled + "░" * (bar_length - filled)
        
        return f"進度：[{bar}] {progress:.0f}% ({current_step}/{total_steps})"
    
    return track_progress
```

### 3. 多語言支持

```python
# 在 SKILL.md 中使用多語言模板
class I18nSkillLoader:
    """國際化 Skill 載入器"""
    
    def load_skill(self, skill_name: str, language: str = "zh-TW"):
        """根據語言載入對應的 Skill"""
        skill_path = f"skills/{skill_name}/SKILL_{language}.md"
        return self.toolkit.load_skill_through_path(skill_path)
```

---

## 部署建議

### 1. 本地開發環境

```bash
# 目錄結構
engineer_assistant/
├── main.py                    # 主程式入口
├── agents/
│   ├── __init__.py
│   ├── main_agent.py         # 主對話 Agent
│   └── flow_agents.py        # 流程 Agent
├── skills/
│   ├── spc_cpk/
│   ├── spc_xbar/
│   └── root_cause/
├── tools/
│   ├── __init__.py
│   ├── calculations.py       # 計算工具
│   └── visualization.py      # 視覺化工具
├── utils/
│   ├── state_manager.py      # 狀態管理
│   └── command_parser.py     # 指令解析
└── requirements.txt
```

### 2. 生產環境部署（使用 AgentScope Runtime）

```python
from agentscope_runtime.engine import AgentApp
from agentscope_runtime.engine.deployers import LocalDeployManager

app = AgentApp()

@app.on_init()
async def init_assistant():
    global assistant
    assistant = HybridEngineerAssistant()
    print("工程師助理初始化完成")

@app.query()
async def handle_query(request):
    response = await assistant.chat(request.message)
    return {"response": response}

@app.on_shutdown()
async def cleanup():
    # 保存所有活躍的流程狀態
    assistant.state_manager.save_all_states()
    print("狀態已保存，清理完成")

# 部署為 API 服務
await app.deploy(LocalDeployManager(host="0.0.0.0", port=8091))
```

---

## 總結與選擇建議

| 需求場景 | 推薦方案 | 理由 |
|---------|---------|------|
| 快速原型開發 | 方案一（路由 Agent） | 實現簡單，易於測試 |
| 流程知識管理重要 | 方案二（Skill + Tool） | 流程文檔化，易於維護 |
| 複雜流程分支 | 方案三（狀態機） | 邏輯清晰，支持回退 |
| **生產級應用** | **混合架構** | **結合各方案優勢** |

**我的建議：**
從混合架構開始，先實現 2-3 個核心流程（如 CPK 分析），驗證可行性後再擴展其他功能。
