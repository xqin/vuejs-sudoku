function chunk (arr, len) {
  var chunks = [],
    i = 0,
    n = arr.length
  while (i < n) {
    chunks.push(arr.slice(i, i += len))
  }
  return chunks
}
function pad(str, length, character) {
  str = '' + str
  while (str.length < length) {
    str = character + str
  }
  return str
}
function formatTimeFromSeconds(sec) {
  var str = ''

  hour = Math.floor(sec / 60.0 / 60.0)
  str += pad(hour, 2, '0')

  minute = Math.floor(sec / 60.0)
  while (minute >= 60) {
    minute -= 60
  }
  str += ':' + pad(minute, 2, '0')

  sec = Math.floor(sec)
  while (sec >= 60) {
    sec -= 60
  }
  str += ':' + pad(sec, 2, '0')

  return str
}

new Vue({
  el: '#app',
  data: {
    loading: true,
    game: null,
    scell: null, // 当前用户选中的单元格
    x: -1, // 当前选中的单元格的 x 坐标
    y: -1, // 当前选中的单元格的 y 坐标
    difficulty: 'easy', // 游戏难度默认为 Easy
    autoTag: false,
    time: null
  },
  created: function () {
    var vm = this

    if (vm.hasExistingGame()) { // 如果之前有保存的游戏, 则直接展示
      this.continueGame()
    } else {
      this.startGame(this.difficulty)
    }
  },
  computed: {
    isComplete: function(vm) {
      for (var i=0; i<9; i++) {
        for (var j=0; j<9; j++) {
          // 每个格子里都必须有值, 且和其他的格子不冲突
          if (vm.game[i][j].value === null || vm.game[i][j].hasConflict) {
            return false
          }
        }
      }

      return true
    },
    // 当前没有选中的, 或者选中的本身就没有值, 或者选中的这个是不可修改的
    caniuse: function(vm) {
      return vm.scell === null || vm.scell.editable === false || vm.scell.value === null
    },
    disabled: function(vm) {
      var ret = {}

      if (vm.scell === null || vm.scell.editable === false) {// 当前没有选中的,或者选中的是不可编辑的, 则将下方的数字全部灰掉
        return null
      }

      if (vm.autoTag) {
        var item, I = vm.scell.i, J = vm.scell.j

        for (var i=0; i<9; i++) {

          item = this.game[vm.x][i]
          if (item.editable === false) {
            ret[item.value] = 1
          }

          item = this.game[i][vm.y]
          if (item.editable === false) {
            ret[item.value] = 1
          }

          for (var j=0; j<9; j++) {
            item = this.game[i][j]
            if (item.editable === false && item.i === I && item.j === J) {
              ret[item.value] = 1
            }
          }
        }
      }

      return ret
    }
  },
  methods: {
    eraseValue: function(){
      var vm = this

      if (vm.caniuse) {
        return
      }

      vm.scell.value = null
      vm.scell.tag = false
      vm.checkConflicts()
      vm.saveToLocalStorage()
    },
    addTag: function(){
      var vm = this

      if (vm.caniuse || vm.scell.hasConflict) {
        return
      }

      vm.scell.tag = !vm.scell.tag
      vm.saveToLocalStorage()
    },
    hasMark: function(irow, icell, cell) {
      var vm = this

      if (vm.scell !== null) { // 当前有选中的情况下
        if (vm.scell.value !== null) { // 且选中的这个已经填上数字了
          return cell.value === vm.scell.value
        }

        return (irow === vm.x || icell === vm.y || (vm.scell.i === cell.i && vm.scell.j === cell.j))
      }

      return false
    },
    toggleAutoTag: function() {
      this.autoTag = !this.autoTag
      this.saveToLocalStorage()
    },
    difficultyClick: function(event) {
      event.preventDefault()

      this.startGame(event.target.getAttribute('data-difficulty'))
    },
    startGame: function(difficulty) {
      var board = randomBoard(difficulty)
      var game = []

      for (var i = 0; i < 81; i++) {
        if (board[i] === '0') {
          game.push(null)
        } else {
          game.push(parseInt(board[i]))
        }
      }

      game = chunk(game, 9)

      for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
          var value = game[i][j]
          game[i][j] = {
            focus: false,
            i: Math.floor(i/3),
            j: Math.floor(j/3),
            value: value,
            tag: false,
            editable: value === null,
            hasConflict: false
          }
        }
      }

      this.difficulty = difficulty
      this.game = game
      this.time = 0
      this.saveToLocalStorage()
    },
    continueGame: function() {
      this.game = JSON.parse(localStorage.currentGame)
      this.time = parseInt(localStorage.time) || 0
      this.difficulty = localStorage.difficulty
      this.autoTag = localStorage.autoTag === 'true'
      var x = parseInt(localStorage.x)
      var y = parseInt(localStorage.y)

      if (!isNaN(x) && !isNaN(y)) {
        if (x !== -1 && y !== -1) {
          this.x = x
          this.y = y
          this.scell = this.game[x][y]
        }
      }
    },
    hasExistingGame: function() {
      return !!localStorage.currentGame
    },
    markAllWithoutConflict: function() {
      for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
          this.game[i][j].hasConflict = false
        }
      }
    },
    checkSubset: function(array) {
      var nums = {}
      for (var i = 0; i < 9; i++) {
        if (array[i].value !== null && nums.hasOwnProperty(array[i].value)) {
          array[i].hasConflict = true
          array[nums[array[i].value]].hasConflict = true
        }
        nums[array[i].value] = i
      }
    },
    checkConflicts: function() {
      this.markAllWithoutConflict()

      // check horizontal lines
      for (var i = 0; i < 9; i++) {
        this.checkSubset(this.game[i])
      }

      // check vertical lines
      for (var j = 0; j < 9; j++) {
        var arr = []
        for (var i = 0; i < 9; i++) {
          arr.push(this.game[i][j])
        }
        this.checkSubset(arr)
      }
      // check squares
      var c = this.game
      this.checkSubset([c[0][0], c[0][1], c[0][2], c[1][0], c[1][1], c[1][2], c[2][0], c[2][1], c[2][2]])
      this.checkSubset([c[3][0], c[3][1], c[3][2], c[4][0], c[4][1], c[4][2], c[5][0], c[5][1], c[5][2]])
      this.checkSubset([c[6][0], c[6][1], c[6][2], c[7][0], c[7][1], c[7][2], c[8][0], c[8][1], c[8][2]])

      this.checkSubset([c[0][3], c[0][4], c[0][5], c[1][3], c[1][4], c[1][5], c[2][3], c[2][4], c[2][5]])
      this.checkSubset([c[3][3], c[3][4], c[3][5], c[4][3], c[4][4], c[4][5], c[5][3], c[5][4], c[5][5]])
      this.checkSubset([c[6][3], c[6][4], c[6][5], c[7][3], c[7][4], c[7][5], c[8][3], c[8][4], c[8][5]])

      this.checkSubset([c[0][6], c[0][7], c[0][8], c[1][6], c[1][7], c[1][8], c[2][6], c[2][7], c[2][8]])
      this.checkSubset([c[3][6], c[3][7], c[3][8], c[4][6], c[4][7], c[4][8], c[5][6], c[5][7], c[5][8]])
      this.checkSubset([c[6][6], c[6][7], c[6][8], c[7][6], c[7][7], c[7][8], c[8][6], c[8][7], c[8][8]])
    },
    cellFillValue: function(value) {
      var vm = this

      if (vm.scell === null || vm.scell.editable === false || vm.disabled === null || vm.disabled[value] === 1) {// 当前没有选中的
        return
      }

      vm.game[vm.x][vm.y].value = value

      vm.checkConflicts()

      vm.saveToLocalStorage()
    },
    cellClick: function(cell, X, Y) {
      var vm = this

      if (vm.scell !== null && vm.scell !== cell) { // 如果当前有选中的, 则先清除之前的那个的选中状态
        vm.scell.focus = false
      }

      cell.focus = !cell.focus

      var x = -1, y = -1

      if (cell.focus) {
        vm.scell = cell
        x = X
        y = Y
      } else {
        vm.scell = null
      }

      localStorage.x = vm.x = x
      localStorage.y = vm.y = y

      vm.saveToLocalStorage()
    },
    formatedTime: function() {
      return formatTimeFromSeconds(this.time)
    },
    saveToLocalStorage: function() {
      var vm = this
      vm.$nextTick(function() {
        localStorage.currentGame = JSON.stringify(vm.game)
        localStorage.time = vm.time >> 0
        localStorage.difficulty = vm.difficulty
        localStorage.autoTag = vm.autoTag
      })
    },
    moveTo: function(direction, val) {
      var vm = this

      if (vm.scell === null) {
        vm.cellClick(vm.game[0][0], 0, 0)
        return
      }

      val = vm[direction] + val

      // 更新后的值 不在合理的范围内, 则忽略
      if (val < 0 || val > 8) {
        return
      }

      vm[direction] = val

      vm.cellClick(vm.game[vm.x][vm.y], vm.x, vm.y)
    },
    onkeydown: function(e){
      var keyCode = (e || window.event).keyCode >> 0
      var vm = this

      // number 1 ... 9
      if (keyCode >= 49 && keyCode <= 57) {
        vm.cellFillValue(keyCode - 48)
        return
      }

      switch(keyCode) {
        case 38: // up
          vm.moveTo('x', -1)
          break
        case 40: // down
          vm.moveTo('x', 1)
          break
        case 37: // left
          vm.moveTo('y', -1)
          break
        case 39: // right
          vm.moveTo('y', 1)
          break
        case 46: //delete
        case 67: //c
          vm.eraseValue()
          break
        case 32: // space
        case 77: // m
          vm.addTag()
          break
        case 84: // t
          vm.toggleAutoTag()
          break
      }
    }
  },
  ready: function() {
    var vm = this

    setTimeout(function(){
      vm.loading = false
    }, 666 + Math.random() * 1000)

    vm.timer = setInterval(function() { // 开计时器, 更新游戏耗时时间, 及 保存游戏时间至本地存储中
      if (vm.time !== null) {
        vm.time++
        localStorage.time = vm.time
      }
    }, 1000)

    document.body.onkeydown = function(){
      vm.onkeydown.apply(vm, arguments)
    }
  },
  beforeDestory: function() {
    clearInterval(this.timer)
    document.body.onkeydown = null
  }
})

// vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2:
