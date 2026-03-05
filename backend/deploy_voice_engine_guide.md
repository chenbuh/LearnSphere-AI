# LearnSphere AI 语音引擎部署服务器指南

在部署到服务器（如 Linux/CentOS/Ubuntu）时，关于 scipy 包及语音引擎报错的说明与解决办法如下：

## 1. 为什么本地会报 ModuleNotFoundError: No module named 'scipy'？
由于本地直接使用的 python （即 Python 3.10.19 的 Base 环境）中并未全局安装 scipy，导致 Java 在启动时首轮检查报错。
**但系统并未奔溃，因为您的 Java 代码 (\VoiceEngineRunner.java\) 编写得非常健壮：** 它自带一套「回退机制 (Fallback)」，自动去您的 Conda 环境 (\D:\anaconda3\pkgs\...\) 中找到了 scipy 并成功激活了语音服务。

## 2. 在服务器上应该如何部署才不会受影响？
因为服务器环境是没有本地的这些 Conda 退路目录机制的，所以在服务器上部署前，只需确保两步操作：

### 第一步：确保安装了 FFmpeg
语音合成 (Edge TTS) 和语音识别 (Whisper) 都强依赖于 FFmpeg 进行音频切片和编解码：
- **Ubuntu/Debian**: \sudo apt update && sudo apt install -y ffmpeg\
- **CentOS/RHEL**: \sudo yum install epel-release && sudo yum install -y ffmpeg\

### 第二步：提前通过依赖清单安装 (推荐)
其实项目配置里已经包含了一个名为 \equirements-voice.txt\ 的清单，里面**早已写好了** scipy、edge-tts、openai-whisper 等包！

在服务器启动后端服务**之前**，请在项目 ackend/ 目录下手动执行一次：
\\\ash
pip install -r requirements-voice.txt
\\\
（注意：如果您的服务器环境是多版本 Python，请使用您指定运行该大程序的解释器，比如 \python3 -m pip install -r requirements-voice.txt\）

> **TIPS：**
> 其实您的 \pplication.yml\ 里配置了 \oice-engine.auto-install-deps: true\。这意味着只要服务器里的 \python\ 和 \pip\ 命令能正常调用，Java 甚至会在启动时**自动帮您执行 pip install -r requirements-voice.txt** 来拉取 \scipy\，您什么都不用改也能顺利起飞。

---
总结：本地代码**不存在漏洞或配置遗漏**。服务器上只要保证装了 fmpeg，然后用 pip install -r requirements-voice.txt 跑一下就万无一失了。