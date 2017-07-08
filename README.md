# VueJS Sudoku

VueJS implementation of Sudoku. [Play][play].

See the [ReactJS version here][reactsudoku].

### Features

- Mobile-friendly
- Uses [LocalStorage] to save the current game state

[play]: https://andreynering.github.io/vuejs-sudoku
[reactsudoku]: https://github.com/andreynering/sudoku


### DEMO (在线演示)

[Play](https://xqin.net/sudoku/)

### 修改

- 调整游戏进入流程及界面展示
- 增加自动计算用户选中的单元格中不可能填写的数字并将其选项标记为灰色的功能
- 增加将用户填写的数字标记为已确认完全正确(类似标注)的功能
- 当填入数字后自动将相同的数字标亮
- 增加 PWA 的离线功能, 使游戏在第一次加载之后, 即便断网也可正常运行.
- 增加对键盘按键的支持, 可在单击格子后直接按 1-9 填入数字, 按 `DELETE` 清除当前格子中填入的内容, 按 空格(space) 键 对当前的格子进行标注

