# Video SDK for React JS
[![Discord](https://img.shields.io/discord/876774498798551130?label=Join%20on%20Discord)](https://discord.gg/kgAvyxtTxv)
[![Register](https://img.shields.io/badge/Contact-Know%20More-blue)](https://app.videosdk.live/signup)

在 Video SDK，我们正在构建工具来帮助公司创建具有实时音频/视频功能、编写云录制/RMTP/HLS 和交互 API 的世界级协作产品

## 演示应用
查看演示[这里](https://videosdk.live/prebuilt/)

## 整合步骤

### 先决条件
- ReactJS 16 或以后
- Node 10 或以后
- 有效的 [Video SDK 帐户](https://app.videosdk.live/signup)

### 第 1 步：克隆示例项目
将存储库克隆到本地环境。
```js
git clone https://github.com/videosdk-live/videosdk-rtc-react-native-sdk-example.git
```

### 第 2 步： 将 .env.example 文件复制到 .env 文件。
打开您喜欢的代码编辑器并将 `.env.example` 复制到 `.env` 文件。
```js 
cp .env.example .env
```

### 第三步：修改 .env 文件
生成临时令牌 [Video SDK 帐户](https://app.videosdk.live/signup).
```js title=".env"
REACT_APP_VIDEOSDK_TOKEN = "TEMPORARY-TOKEN"
```

### 第 4 步：安装依赖
安装依赖项所有项目依赖项。
```js
npm install
```

### 第 5 步：运行示例应用程序
Bingo，是时候按下启动按钮了。
```js
npm run start
```


## 例子
- [Prebuilt SDK 例子](https://github.com/videosdk-live/videosdk-rtc-prebuilt-examples)
- [JavaScript SDK 例子](https://github.com/videosdk-live/videosdk-rtc-javascript-sdk-example)
- [React JS SDK 例子](https://github.com/videosdk-live/videosdk-rtc-react-sdk-example)
- [React Native SDK 例子](https://github.com/videosdk-live/videosdk-rtc-react-native-sdk-example)
- [Flutter SDK 例子](https://github.com/videosdk-live/videosdk-rtc-flutter-sdk-example)
- [Android SDK 例子](https://github.com/videosdk-live/videosdk-rtc-android-java-sdk-example)
- [iOS SDK 例子](https://github.com/videosdk-live/videosdk-rtc-ios-sdk-example)

## 文档
[阅读文档](https://docs.videosdk.live/) 开始使用 VideoSDK.

## 社区
- [Discord](https://discord.gg/Gpmj6eCq5u) - 要参与视频 SDK 社区，请提出问题并分享提示。
- [Twitter](https://twitter.com/video_sdk) - 接收更新、公告、博客文章和一般视频 SDK 提示。
