## robot A.T.P

自用 QQ bot。

### 使用方式

1. Clone 代码
```bash
git clone git://github.com/Eumeryx/robot.ATP.git
```

2. 安装依赖

本体：
```bash
npm install
```
MathJax:
```bash
sudo apt install librsvg2-bin
```
Wolfram|Alpha:
```bash
sudo apt install imagemagick
```

3. 生成 CommonJs
```bash
npm run build
```

4. 填写配置
```bash
cp config.example.json5 config.json5
```
按 `config.json5` 内的说明填写。

5. 运行
```bash
npm run atpbot
```
