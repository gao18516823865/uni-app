const ci = require('miniprogram-ci')
const inquirer = require('inquirer');
const projectConfig = require('./project.config.json');
const updateVersion = require('./updateVersion.js')
const pkg = require('./package.json');
let { version } = require('./package.json')
const NODE_ENV = process.env.NODE_ENV;
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
    // 当最后一位是0的时候, 删除
    if (!parseInt(arr[arr.length - 1])) arr.pop();
    return arr.join('.');
}
/** 获取版本选项 */
function getVersionChoices(version) {
    // 描述数组
    const vArrsDesc = ['raise major: ', 'raise minor: ', 'raise patch: ']; //, 'raise alter: '暂时无第4位
    // 版本号(数组形态)
    let vArrs = version.split('.');
    // 版本号选项
    let choices = vArrsDesc.map((item, index, array) => {
        // 当配置文件内的版本号，位数不够时补0
        array.length > vArrs.length ? vArrs.push(0) : '';
        // 版本号拼接
        return vArrsDesc[index] + versionNext(vArrs, index)
    }).reverse();
    // 添加选项
    choices.unshift('no change');
    return choices;
}

function inquirerResult({
    version
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
    let versionData = {}
    if (NODE_ENV === 'production') {
        // Get modification information
        versionData = await inquirerResult(pkg);
        //updata package.json version
        updateVersion();
    }
    //upload
    await upload(versionData);
}
init()
