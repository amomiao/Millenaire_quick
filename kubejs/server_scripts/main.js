// Visit the wiki for more info - https://kubejs.com/
// console.info('Hello, World! (Loaded server example script)')

// 注册服务端配方事件
ServerEvents.recipes(event => {

    // 添加 2 个竖直排列的任意原木 -> 16 根木棍
    event.shaped('16x minecraft:stick', [
        'A',
        'A'
    ], {
        A: '#minecraft:logs' // # 表示使用 Tag 标签，匹配所有原生和 Mod 原木
    }).id('kubejs:sticks_from_vertical_logs')

})