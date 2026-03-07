# LearnSphere AI 语音引擎优化指南 (免费 & 轻量化版)

## 背景
用户在 Linux 服务器（尤其是 1G/2G 内存的小型服务器）上部署时，面临两个核心痛点：
1. **内存压力**：本地 Python 引擎（Flask + Whisper 模型）启动需占用 1GB+ 内存，容易触发 OOM (Exit Code 137)。
2. **成本问题**：云端大模型 API（如阿里云 DashScope）虽然稳定，但长期大规模使用存在计费成本。

## 最终解决方案：Java 原生 Edge TTS (Native client)
我们实现了一个**纯 Java 编写的 Microsoft Edge TTS 协议客户端**。该方案直接对接微软免费的 Edge 语音接口，具有以下显著优势：

### 核心优势
1. **完全免费**：利用 Edge 浏览器的 Read Aloud 接口，音质极佳且无需支付 API 费用。
2. **零内存占用 (无 Python)**：完全在 Java 进程内运行，不再需要启动 Flask 后端进程和加载大型 Whisper 模型。不再需要服务器安装 FFmpeg 或 Conda。
3. **极简部署**：无需安装 Python 环境，只需 Java 后端即可运行。

## 配置步骤

### 1. 禁用本地 Python 进程 (推荐)
在 `backend/src/main/resources/application-prod.yml` 中，确保禁用本地 Python 语音检查：

```yaml
voice-engine:
  enabled: false  # 设置为 false，彻底关闭 Python 进程启动，节省几百MB内存
```

### 2. 工作原理
程序代码中集成了**自适应分级机制**：
- **第一级：Java 原生合成**：系统默认使用 `EdgeTTSClient` 直接与微软 WebSocket 通信合成语音。
- **第二级：Python 备份 (可选)**：仅当原生合成失败且 `voice-engine.enabled` 为 `true` 时，才会尝试调用本地 Python 引擎。
- **STT (语音转文本)**：目前由于 STT 算法特性，仍需本地 Python 引擎 (Whisper)。如果您服务器内存极小且不需要语音输入功能，保持 `enabled: false` 即可，系统会友好提示 STT 不可用。

## 优势分析表

| 特性 | 本地 Python 引擎 | 云端大模型 API | **Java 原生 Edge TTS (当前)** |
| :--- | :--- | :--- | :--- |
| **内存压力** | 极大 (1GB+) | 极低 | **极低 (零额外进程)** |
| **使用成本** | 免费 | 昂贵 | **完全免费** |
| **音质效果** | 较好 | 极佳 (高算力) | **极佳 (微软神经网络语音)** |
| **部署难度** | 高 (各种库依赖) | 低 (需 Key) | **极低 (Java 内置)** |

---
*LearnSphere AI Team - 致力于在各类环境下提供极致的学习体验。*
