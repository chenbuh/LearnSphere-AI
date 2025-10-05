# Git 版本控制使用指南

## 快速开始

### 方法1：使用批处理脚本（推荐）
双击运行 `init-git.bat` 文件，它会自动完成所有初始化工作。

### 方法2：使用PowerShell脚本
右键点击 `init-git.ps1` → "使用PowerShell运行"

### 方法3：手动执行命令
打开命令提示符或Git Bash，执行以下命令：

```bash
git init
git config user.name "您的名字"
git config user.email "您的邮箱"
git add .
git commit -m "Initial commit: LearnSphere AI 英语学习平台初始版本"
```

## 日常使用

### 保存当前工作
```bash
git add .
git commit -m "描述您的更改"
```

### 查看状态
```bash
git status          # 查看文件状态
git log --oneline   # 查看提交历史
```

### 回滚操作
```bash
# 回滚到上一个提交（危险操作！）
git reset --hard HEAD~1

# 查看某个文件的历史版本
git log --follow 文件名

# 恢复某个文件到上一个版本
git checkout HEAD~1 -- 文件名
```

### 分支管理
```bash
git branch                    # 查看所有分支
git checkout -b 新分支名      # 创建并切换到新分支
git checkout main            # 切换到主分支
git merge 分支名             # 合并分支
```

## 版本控制最佳实践

1. **频繁提交**：每完成一个小功能就提交一次
2. **清晰的提交信息**：描述这次修改做了什么
3. **使用分支**：为新功能创建单独的分支
4. **定期备份**：可以推送到远程仓库（GitHub、GitLab等）

## 提交信息建议格式

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 紧急恢复

如果不小心删除或损坏了文件：

```bash
# 恢复工作目录到最后一次提交的状态
git reset --hard HEAD

# 恢复特定文件
git checkout HEAD -- 文件名
```

## 注意事项

- 在进行重要修改前，建议先创建备份分支
- `git reset --hard` 会永久删除未提交的更改，使用前请谨慎
- 定期查看 `git status` 了解当前状态
