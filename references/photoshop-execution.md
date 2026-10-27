# Photoshop 执行规范

## 工具路径

必须通过可用的电脑控制能力操作本机 Adobe Photoshop。Shell 可以检查文件、准备透明素材、复制 JSX 和查看输出，但不能代替 Photoshop 创建与验证 PSD。

## 推荐执行顺序

1. 查询 Photoshop 当前状态。
2. 对重复布局生成任务专用 JSX。
3. 在 Photoshop 中进入 `文件 > 脚本 > 浏览…`。
4. 通过文件选择窗口运行 JSX。
5. 等待完成提示或错误日志。
6. 重新打开 PSD，执行可编辑性检查。
7. 由 PSD 导出 PNG，再做视觉检查。

每次打开菜单、文件对话框或文档后重新读取界面状态；可访问性元素索引会变化，不要复用旧索引。

## 路径兼容

Photoshop ExtendScript 在部分环境中无法正确解析中文脚本路径或文件路径。稳妥做法：

- 将运行中的 JSX、源图临时副本和中间输出放在 ASCII 路径；
- 在 Photoshop 中完成 PSD、PNG 保存与验证；
- 最后把验证通过的文件复制到用户指定中文文件夹和中文文件名；
- 不修改用户原始输入。

在 macOS 文件窗口中无法直接输入中文路径时，可使用 `Cmd+Shift+G`，选择历史路径，或把运行脚本复制到简单的 ASCII 文件名。

## 错误记录包装器

为任务脚本增加包装器：

```jsx
#target photoshop
app.bringToFront();
try {
  $.evalFile(File('/absolute/ascii/path/task.jsx'));
} catch (e) {
  var f = File('/absolute/ascii/path/error.txt');
  f.open('w');
  f.write('ERROR: ' + e.toString() + '\nLINE: ' + e.line + '\nFILE: ' + e.fileName);
  f.close();
  alert('Task failed. Error log saved.');
}
```

若前一次失败留下临时文档，只关闭本次任务创建的文档。不要关闭用户已有的其他工作或丢弃用户未保存的文档。

## 常见错误

- `Expected a reference to an existing file/folder`：路径或中文编码损坏；改用 ASCII 临时路径。
- `Copy Merged is not available`：单层源图使用 `selection.copy()`，不要使用 `copy(true)`。
- 画面只有背景：顶层分组顺序错误；背景必须在最底部。
- PSD 打开后扁平：确认 `PhotoshopSaveOptions.layers = true` 且重新打开文件。
- PNG 与 PSD 不一致：检查隐藏组、活动画板、颜色模式和最后一次保存对象。

