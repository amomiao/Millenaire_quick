ServerEvents.recipes(event => {
    // ----------------------------------------------------------------
    // 千年村庄 (Millénaire) 货币转换配方 (比例 1 : 64)
    // 物品 ID:
    // 1. 第纳尔: millenaire:denier
    // 2. 银第纳尔: millenaire:denier_argent
    // 3. 金第纳尔: millenaire:denier_or
    // ----------------------------------------------------------------

    // ================= 1. 第纳尔 <-> 银第纳尔 =================
    
    // 64 * 第纳尔 -> 1 * 银第纳尔 (无失真无序合成)
    event.shapeless(
        'millenaire:denier_argent',
        Array(64).fill('millenaire:denier')
    ).id('kubejs:millenaire/denier_to_argent')

    // 1 * 银第纳尔 -> 64 * 第纳尔
    event.shapeless(
        Item.of('millenaire:denier', 64),
        ['millenaire:denier_argent']
    ).id('kubejs:millenaire/argent_to_denier')


    // ================= 2. 银第纳尔 <-> 金第纳尔 =================
    
    // 64 * 银第纳尔 -> 1 * 金第纳尔
    event.shapeless(
        'millenaire:denier_or',
        Array(64).fill('millenaire:denier_argent')
    ).id('kubejs:millenaire/argent_to_or')

    // 1 * 金第纳尔 -> 64 * 银第纳尔
    event.shapeless(
        Item.of('millenaire:denier_argent', 64),
        ['millenaire:denier_or']
    ).id('kubejs:millenaire/or_to_argent')
})