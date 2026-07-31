StartupEvents.registry('item',event=>{
    event.create('modpack:lightning_strikes_disc')
         .displayName('音乐唱片 - 你将如闪电般归来')
         .texture('modpack:item/music_disc_lightning_strikes')
         .rarity('epic')
         .maxStackSize(1)
         .jukeboxPlayable('modpack:lightning_strikes', true);
});