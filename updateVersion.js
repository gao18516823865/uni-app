const semver = require('semver')
let { version } = require('./package.json')
const fs = require('fs')

// 先更新小版本
let patchVersion = semver.inc(version, 'patch')

// 更新以后，进行parse
let patchVersionObject = semver.parse(patchVersion)

// 小版本满10. 就直接更新中版本
if (patchVersionObject && patchVersionObject.patch > 10) {
  // 更新中版本
  patchVersion = semver.inc(patchVersionObject, 'minor')
}

// 中版本满20，则进位
if (patchVersionObject && patchVersionObject.minor > 20) {
  patchVersion = semver.inc(patchVersionObject, 'major')
}

function updateVersion () {
  let strem = fs.readFileSync('./package.json').toString()
  // 转换成json
  strem = JSON.parse(strem)

  strem.version = patchVersion

  // 写入文件
  fs.writeFileSync('./package.json', JSON.stringify(strem, null, 2))

  console.log('版本更新成功')
}

/**
 * 根据不同的发布环境，如果是生产环境打包发布，则执行updateVersion()
 */

module.exports = updateVersion
