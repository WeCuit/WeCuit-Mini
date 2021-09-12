const ci = require("miniprogram-ci");
const project = new ci.Project({
    appid: "wxfa2ea65288e28233",
    type: "miniProgram",
    projectPath: "./",
    privateKeyPath: "./private.key",
    ignores: ["node_modules/**/*", "preview/*"],
});
(async () => {
    // console.warn("==========构建NPM==========")
    // const warning = await ci.packNpm(project, {
    //     ignores: [],
    //     reporter: (infos) => { console.log(infos) }
    // })
    // console.warn(warning)
    console.warn("==========上传==========")
    const uploadResult = await ci.upload({
        project,
        version: "1.1.1",
        desc: "hello upload",
        setting: {
            es6: true,
        },
        onProgressUpdate: console.log,
    });
    console.log(uploadResult);
})();
// (async () => {
//     const previewResult = await ci.preview({
//         project,
//         desc: "hello preview", // 此备注将显示在“小程序助手”开发版列表中
//         setting: {
//             es6: true,
//         },
//         qrcodeFormat: "image",
//         qrcodeOutputDest: "/qrcode.jpg",
//         onProgressUpdate: console.log,
//         // pagePath: 'pages/index/index', // 预览页面
//         // searchQuery: 'a=1&b=2',  // 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`\&`
//     });
//     console.log(previewResult);
// })();
