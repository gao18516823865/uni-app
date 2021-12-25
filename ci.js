const ci = require('miniprogram-ci')
const fs = require('fs');
const inquirer = require('inquirer');
const projectConfig = require('./project.config.json');
// const versionConfig = require('./version.config.json');
const pkg = require('./package.json');
/*ci实例*/
const project = new ci.Project({
        appid: projectConfig.appid,
        type: projectConfig.type,
        projectPath: projectConfig.projectPath,
        privateKeyPath: './ci-private.key',
        ignores: ['node_modules/**/*'],
    })
    /*ci上传*/
async function upload({ version = '0.0.0', versionDesc = 'test' }) {
    await ci.upload({
        project,
        version,
        desc: versionDesc,
        setting: {
            es7: true,
            minify: true,
            autoPrefixWXSS: true
        },
        onProgressUpdate: console.log,
    })
}
/** 增加版本号 */
function versionNext(array, idx) {
    let arr = [].concat(array);
    ++arr[idx];
    arr = arr.map((v, i) => i > idx ? 0 : v);
    if (!parseInt(arr[arr.length - 1])) arr.pop();
    return arr.join('.');
}
/** 获取版本选项 */
function getVersionChoices(version) {
    const vArrsDesc = ['raise major: ', 'raise minor: ', 'raise patch: ', 'raise alter: '];
    let vArrs = version.split('.');
    let choices = vArrsDesc.map((item, index, array) => {
        array.length > vArrs.length ? vArrs.push(0) : '';
        return vArrsDesc[index] + versionNext(vArrs, index)
    }).reverse();
    // 添加选项
    choices.unshift('no change');
    return choices;
}

function inquirerResult({
    version,
    versionDesc
} = {}) {
    return inquirer.prompt([
        // 设置版本号
        {
            type: 'list',
            name: 'version',
            message: `设置上传的版本号(当前版本号: ${version}):`,
            default: 1,
            choices: getVersionChoices(version),
            filter(opts) {
                if (opts === 'no change') {
                    return version;
                }
                return opts.split(': ')[1];
            }
        },

        // 设置上传描述
        {
            type: 'input',
            name: 'versionDesc',
            message: `写一个简单的介绍来描述这个版本的改动过:`,
        },
    ]);
}
/*ci入口函数*/
async function init() {
    // Get modification information
    let versionData = await inquirerResult(pkg);
    //upload
    await upload(versionData);
    //修改版本号
    fs.writeFileSync('./package.json', JSON.stringify(pkg), err => {
        if (err) {
            console.log('自动写入app.json文件失败，请手动填写，并检查错误');
        }
    });
}
init()