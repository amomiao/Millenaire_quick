# 欢迎使用 `millenaire-custom/`

这个文件夹是**完全属于你**的。即使模组（Mod）更新，Millénaire 也绝不会覆盖或删除你在此处放置的任何内容。你可以用它来添加新的建筑、村民、文化、语言、任务或任何其他自定义内容。

同级文件夹 `millenaire/` 归模组所有，并在每次版本更新时重新部署。你可以查阅其中的文件作为参考，但**请勿直接修改它**。

## 子模组（Sub-mod）机制

自定义内容以**子模组（sub-mods）**的形式提供：`millenaire-custom/` 下的每一个直接子目录都是一个独立的子模组，拥有属于自己的 `cultures/`、`languages/`、`gathering_type/` 和/或 `quests/` 子树。多个子模组可以共存；它们的内容会按照确定性的逻辑进行叠加（对于 REPLACE 替换类文件，按字母顺序最靠前的子模组优先生效，其他文件则按增量累加贡献）。

子模组的目录名称必须匹配 `[A-Za-z0-9_-]+` 正则表达式。名称 `cultures`、`languages`、`gathering_type`、`quests` 和 `exports` 是顶层保留字——**请勿**将内容直接丢在 `millenaire-custom/cultures/...` 下。模组会拒绝加载此类文件，并在启动时记录警告日志（WARN）。

## 快速开始 1 — 为诺曼（Norman）文化添加新建筑

```text
millenaire-custom/
└── my-norman-tweaks/             # 任意符合 [A-Za-z0-9_-]+ 的名称 — 你的子模组目录
    └── cultures/
        └── norman/
            └── buildings/
                └── houses/
                    ├── my_house.json    # 建筑蓝图元数据（从 _templates/ 复制）
                    └── my_house.nbt     # 结构模板文件（从游戏内导出）
```

`.nbt` 文件是通过游戏内的**导入桌（Import Table）**方块生成的。`.json` 文件是从 `millenaire/_templates/_template_building.json` 复制并修改而来的。

## 快速开始 2 — 创建全新的文化

```text
millenaire-custom/
└── viking-pack/                          # 你的子模组目录
    ├── cultures/
    │   └── viking/                       # 文化 ID（必须匹配 [a-z0-9]+）
    │       ├── culture.json              # 必需：名称、语言、生物群系等配置
    │       ├── namelists/
    │       │   ├── men_names.txt         # 必需：至少包含一个名字列表
    │       │   ├── women_names.txt
    │       │   └── family_names.txt
    │       ├── villagers/
    │       │   └── leaders/
    │       │       └── leader.json       # 必需：至少一种村民类型
    │       ├── villages/
    │       │   └── basic_village.json    # 必需：至少一种村庄类型
    │       ├── buildings/
    │       │   └── townhalls/
    │       │       ├── townhall.json     # 必需：至少一个市政厅
    │       │       └── townhall_a_0.nbt
    │       └── shops/
    │           └── townhall.json         # 必需：市政厅对应的商店配置
    └── languages/
        └── en_us/
            └── viking_sentences.txt      # 必需：至少包含 en_us 语言包
```

## 不支持热重载

内容仅在服务器启动时加载一次。修改 `millenaire-custom/` 下的任何文件后，**必须重启服务器**才能使更改生效。

## 导入 Millénaire 1.12 旧版附加包（Addon）

将旧版附加包作为子文件夹直接放入 `millenaire-custom/` 目录下（例如 `millenaire-custom/MyOldPack/`）。在下次启动时，Millénaire 会自动将其转换为 `MyOldPack_converted/`。转换后的 `_converted/` 同级目录将作为实际运行的子模组，而原始文件夹将被保留作为源码备份。

## 参考指引

- **完整指南**：`millenaire/_docs/content-guide.en.md`（每次模组启动时自动生成/更新）
- **模板（Templates）**（可复制的基础骨架）：`millenaire/_templates/`
- **参考目录（Reference）**（目标 ID、特殊坐标点等）：`millenaire/_reference/`
- **GitHub 仓库**：<https://github.com/Kinniken/Millenaire>
