const StringArgumentType =
    Java.loadClass(
        'com.mojang.brigadier.arguments.StringArgumentType'
    )

ServerEvents.commandRegistry(event => {
    event.register(
        event.commands.literal('vname')
            .then(
                event.commands.argument(
                    'name',
                    StringArgumentType.greedyString()
                )
                .executes(ctx => {
                    let name = ctx.getArgument(
                        'name',
                        Java.loadClass('java.lang.String')
                    )
                    // ctx.source.server.runCommand // 这样写只有服务器(管理员)会得到回执
                    ctx.source.server.getCommands().performPrefixedCommand(
                        ctx.source,
                        `millenaire dev renamevillage "${name}"`
                    )
                    return 1
                })
            )
    )

})