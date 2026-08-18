* Override
1. [覆写]文明配置文件:override\cultures\{文明}\villages
2. [加写]NameList:override\cultures\{文明}\namelists
   1. 由于是加写，所以各namelists目录中的所有文件需要手动覆盖到原配置文件中!
3. 声明翻译Key
   1. 在`.kubejs\assets\millenaire\lang\zh_cn.json`中书写

* 皮肤绘制
1. 放置位置:`KubeJS\assets`下的对应位置,如`illager:textures/entity/illager/vindicator.png`
2. 绘制:
   1. 现代MC使用的是64x64的双层皮肤,而千年村庄只认64x32的旧皮肤,下载皮肤后切掉下32(第二层)即可。
   2. 当然把下32移到上32(向下8个像素)后切割效果更好!