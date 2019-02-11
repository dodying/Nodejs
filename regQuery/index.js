#!/usr/bin/env node

// ==Headers==
// @Name:               regQuery
// @Description:        请求注册表并复制为 batch/powershell 格式
// @Version:            1.0.5
// @Author:             dodying
// @Date:               2019-2-2 16:42:11
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            clipboardy,iconv-lite
// ==/Headers==

// 设置

// 导入原生模块
const fs = require('fs')
const cp = require('child_process')

// 导入第三方模块
const clipboardy = require('clipboardy')
const iconv = require('iconv-lite')

//
const Type = ['REG_BINARY', 'REG_DWORD', 'REG_DWORD_LITTLE_ENDIAN', 'REG_DWORD_BIG_ENDIAN', 'REG_EXPAND_SZ', 'REG_LINK', 'REG_MULTI_SZ', 'REG_NONE', 'REG_QWORD', 'REG_QWORD_LITTLE_ENDIAN', 'REG_SZ']
const defaultKeyName = ['(Default)', '(默认)']
// const copy = text => cp.execSync(`echo ${text} | clip`).toString()
const regQuery = (key, value = undefined) => { // key: 路径, value: 键名
  key = key.replace(/\//g, '\\')
  let query = `reg query "${key}" `
  query += typeof value !== 'undefined' ? (defaultKeyName.includes(value) ? '/ve' : `/v "${value}"`) : '/s'
  let out = cp.execSync(query).toString()
  return out
}
const typeConvert = text => {
  let obj = {
    'REG_SZ': 'String',
    'REG_EXPAND_SZ': 'ExpandString',
    'REG_BINARY': 'Binary',
    'REG_DWORD': 'DWord',
    'REG_MULTI_SZ': 'MultiString',
    'REG_QWORD': 'Qword'
  }
  return text in obj ? obj[text] : 'Unknown'
}

if (process.argv[2] === undefined) {
  console.log('')
  console.log('Usage: rq [Format] [KeyName [ValueName] | RegFile]')
  console.log('')
  console.log('  Format: Supprot array/ps1/bat')
  console.log('  KeyName: [\\\\Machine\\]FullKey')
  console.log('  RegFile: path to file of .reg')
  console.log('')
  console.log('Examples:')
  console.log('')
  console.log('  Get Format of Array')
  console.log('    rq HKLM\\EXAMPLE')
  console.log('    rq HKLM\\EXAMPLE (Default)')
  console.log('    rq .\\1.reg')
  console.log('  Get Format of Powershell Command')
  console.log('    rq -ps1 HKLM\\EXAMPLE')
  console.log('    rq -ps1 .\\1.reg')
  console.log('  Get Format of Batch Command')
  console.log('    rq -bat HKLM\\EXAMPLE')
  console.log('    rq -bat .\\1.reg')
  process.exit()
}

let parm = process.argv.splice(2)
let cmdMode
if (parm[0] === '-bat') {
  cmdMode = 'batch'
  parm = parm.splice(1, 2)
} else if (parm[0] === '-ps1') {
  cmdMode = 'powershell'
  parm = parm.splice(1, 2)
} else {
  cmdMode = 'array'
  parm = parm.splice(0, 2)
}

let regMode = !!(parm[0].match(/\.reg("|)$/i) && fs.existsSync(parm[0]))
if (regMode) {
  try {
    fs.writeFileSync('C:\\Windows\\checkIsAdmin.txt', '')
  } catch (error) {
    console.log('Please run as Administrator')
    process.exit()
  }
  let content = fs.readFileSync(parm[0])
  content = iconv.decode(content, 'utf-16').split(/\r\n/).map(i => i.match(/^\[/) ? i.replace(/^\[/, '[HKEY_CURRENT_USER\\Temp\\') : i).join('\r\n')
  fs.writeFileSync('1_[temp].reg', iconv.encode(Buffer.from(content, 'utf-8'), 'utf-16'))
  cp.execSync('regedit /s "1_[temp].reg"')
  fs.unlinkSync('1_[temp].reg')
  parm[0] = 'HKEY_CURRENT_USER\\Temp'
}

let keyName, valueName, type, data
let lst = regQuery(...parm).split(/[\r\n]+/)
let tocpoy = []
for (let i = 0; i < lst.length - 1; i++) {
  if (lst[i].match(/^\S+/)) { // keyName
    keyName = lst[i]
    if (cmdMode === 'powershell') {
      keyName = keyName.replace(/HKEY_CURRENT_USER/g, 'HKCU:').replace(/HKEY_LOCAL_MACHINE/g, 'HKLM:').replace(/HKEY_CLASSES_ROOT/g, 'HKCR:')
    } else if (cmdMode === 'array') {
      keyName = keyName.replace(/HKEY_CURRENT_USER/g, 'HKCU').replace(/HKEY_LOCAL_MACHINE/g, 'HKLM').replace(/HKEY_CLASSES_ROOT/g, 'HKCR').replace(/\\/g, '\\\\')
    } else {
      keyName = keyName.replace(/HKEY_CURRENT_USER/g, 'HKCU').replace(/HKEY_LOCAL_MACHINE/g, 'HKLM').replace(/HKEY_CLASSES_ROOT/g, 'HKCR')
    }

    if (lst[i + 1].match(/^\S+/) || lst[i + 1] === '') { // next line is keyName again
      if (!lst[i + 1].match(lst[i].replace(/\\/g, '\\\\'))) { // next line doesn't include this line
        if (cmdMode === 'powershell') {
          tocpoy.push(`RegSet "${keyName}";`)
        } else if (cmdMode === 'batch') {
          tocpoy.push(`reg add "${keyName}" /f`)
        } else if (cmdMode === 'array') {
          tocpoy.push(`["${keyName}", "", ""],`)
        }
      }
    }
  } else if (lst[i].match(/^\s+\S+/)) { // NOT empty
    let arr = lst[i].trim().split(/\s+/)
    let j
    for (j = 1; j < arr.length - 1; j++) {
      if (Type.includes(arr[j])) {
        break
      }
    }
    valueName = [...arr].splice(0, j).join(' ')
    valueName = defaultKeyName.includes(valueName) ? '' : valueName
    type = arr[j]
    data = [...arr].splice(j + 1).join(' ')

    if (cmdMode === 'powershell') {
      if (valueName === '' && data === '(value not set)') {
        tocpoy.push(`Clear-ItemProperty -Path "${keyName}" -Name "(default)"`)
        continue
      }
      if (['REG_SZ', 'REG_EXPAND_SZ'].includes(type)) {
        data = '"' + data.replace(/"/g, '`"') + '"'
      } else if (type === 'REG_DWORD') {
        data = parseInt(data)
      } else if (type === 'REG_BINARY') {
        data = data.split(/(.{2})/).filter(i => i).map(i => ('0x' + i).toLowerCase()).join(', ')
        data = '([byte[]](' + data + '))'
      }
      let end
      if (valueName === '' && type === 'REG_SZ') {
        end = ''
      } else if (valueName === '' && type !== 'REG_SZ') {
        end = ` "(Default)" "${typeConvert(type)}"`
      } else if (valueName !== '' && type === 'REG_SZ') {
        end = ` "${valueName}"`
      } else {
        end = ` "${valueName}" "${typeConvert(type)}"`
      }
      tocpoy.push(`RegSet "${keyName}" ${data}${end};`)
    } else if (cmdMode === 'batch') {
      if (valueName === '' && data === '(value not set)') {
        tocpoy.push(`reg delete "${keyName}" /ve`)
        continue
      }
      if (['REG_SZ', 'REG_EXPAND_SZ'].includes(type)) data = '"' + data.replace(/"/g, '\\"').replace(/%/g, '%%') + '"'
      tocpoy.push(`reg add "${keyName}" /v "${valueName}" /t ${type} /d ${data} /f`)
    } else if (cmdMode === 'array') {
      valueName = valueName.replace(/\\/g, '\\\\')
      data = data.replace(/\\/g, '\\\\')

      if (type === 'REG_DWORD') {
        data = parseInt(data)
      } else {
        data = '"' + data.replace(/"/g, '\\"') + '"'
      }

      tocpoy.push(`["${keyName}", "${valueName}", ${data}, "${type}"],`)
    }
  }
}

if (regMode) {
  cp.execSync('reg delete HKEY_CURRENT_USER\\Temp /f')
  tocpoy = tocpoy.map(i => i.replace(/HKEY_CURRENT_USER\\Temp\\/g, ''))
}
console.log(tocpoy)
clipboardy.writeSync(tocpoy.join('\r\n'))
