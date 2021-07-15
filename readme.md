## robot A.T.P

自用 QQ bot。

### 使用方式

1. Clone 代码
```bash
git clone git://github.com/Eumeryx/robot.ATP.git --recurse-submodules
```

2. 安装依赖
本体：
```bash
npm install
```
MathJax:
```bash
# apt install librsvg2-bin
```
aliyunpan:
```bash
pip3 install -r externalDepend/aliyunpan/requirements.txt
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

### PR

PR 前请先统一代码风格：
```bash
npm run lint
```
