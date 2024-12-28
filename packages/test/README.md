## Usage

1. 先在 subsets 文件夹 build `pnpm prepublish`

2. 安装依赖

```sh
pnpm install
pnpm playwright install
```

```sh
node ./script/downloadFonts.mjs # 先下载字体包，然后才能够本地测试, 失败可以多次执行
node ./script/build.mjs # 使用 cn-font-split 进行切割
pnpm dev # 开启服务， 测试之前要开启 Vite 打包服务
pnpm test # 直接进行测试
```

可以使用 VSCode Playwright 插件进行测试，比较简单。
一定需要 MacOS 搭配 webkit 组合来进行测试, 保证测试稳定性。

1. 回归测试

```sh
pnpm dev # 开启服务
node ./script/build.mjs # 使用 cn-font-split 进行切割
```
