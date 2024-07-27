// https://www.52pojie.cn/thread-1911482-1-1.html
//---------------------------------------------------------------------------------------
//配置项

//如不需要切换账号，可不填此项配置（accountArr），修改isSwitchAccount为false即可
//频繁切换账号会触发图形验证码，导致账号切换失败,过多账号会导致超出设备领奖上限哦
//每个账号都需要在运行脚本手机上登录过一次，防止登录时设备安全验证
//分享抖音需要绑定抖音账号，由于未做抖音切换账号，使用此功能时建议仅开启一个
//账号格式：用户名、账号、密码、[是否周末兑换章节卡、是否开宝箱、是否开启玩游戏功能、是否听书获取起点币、是否获取激励碎片、是否开启分享抖音、是否使用漫画券、是否开启免费补签、是否开启章节券订阅小说、如果开启章节券订阅小说是否仅在周末进行]、[刷激励碎片时使用的书籍(不刷可不填)、使用漫画券时使用的漫画(不刷可不填)、使用章节券订阅的小说(不订阅可不填)]————请注意除最后一个账号外，其他的账号后均需 逗号 分隔
var accountArr = [
  ["Dodying", "heyuanzuia", "Cyhqsb594213", [true, true, true, true, true, false, false, true, false, true], ["神级插班生", "修真聊天群", "柯南里的捡尸人"]],
  ["书友20240519133427622", "13144454894", "Cyhqsb594213", [true, true, true, true, true, false, false, true, false, true], ["神级插班生", "一人之下", ""]],
  // ["1111", "1111", "1111", [true, true, false, true, false, false, false, true, false, true], ["", "斗破苍穹", "深海余烬"]]
]
//单账号运行可不管上方accountArr配置，将使用以下配置
let isSwitchAccount = false;//是否需要切换账号，单账号运行请修改为 false，默认为 true
let isExchange = true;//是否周末兑换章节卡，已稳定，默认为 true，切换账号时，以账号内设置为准
let isOpenTreasureChest = true;//是否开宝箱，已稳定，默认为 true，切换账号时，以账号内设置为准
let isPlayGame = true;//是否开启玩游戏功能，已稳定，默认为 true，切换账号时，以账号内设置为准
let isListeningBooks = true;//是否听书获取起点币，已稳定，默认为 true，切换账号时，以账号内设置为准
let isGetIncentive = false;//是否获取激励碎片，暂时超多bug，默认为 false，切换账号时，以账号内设置为准
let isShareTikTok = false;//是否开启分享抖音，请注意，此功能请先自行走一次完整分享流程，保证各存储权限获取到位，默认为 false，切换账号时，以账号内设置为准
let isUseMangaTicket = false;//是否使用漫画券，默认为 false，切换账号时，以账号内设置为准
let isFreeReSignin = true;//是否开启免费补签，默认为 true，切换账号时，以账号内设置为准
let isSubscribeNovelChapter = false;//是否开启章节券订阅小说，默认为 false，切换账号时，以账号内设置为准
let isSundaySubscribeNovelChapter = true;//如果开启章节券订阅小说，是否仅在周末进行，默认为 true，仅在isSubscribeNovelChapter = true下生效，切换账号时，以账号内设置为准

//刷激励碎片时使用的书籍，需将此书添加到书架，建议选择冷门全订书籍，默认为 回到过去变成猫，切换账号时，以账号内设置为准
let bookName = "神级插班生";
//使用漫画券时使用的漫画，需将此漫画添加到书架，建议不要将同名小说加入书架，默认为 一人之下，切换账号时，以账号内设置为准
let mangaName = "修真聊天群";
//使用章节卡订阅小说，需将此小说添加到书架，默认为 柯南里的捡尸人，切换账号时，以账号内设置为准
let novelName = "柯南里的捡尸人";

//限时福利看视频的配置
let watchLimitedTimeViewPlan = "Plan2";//Plan1将观看所有视频，Plan2可选择性观看，默认为 Plan2
let isWatchThreeAdm = true;//是否额外看3次小视频得奖励-10章节卡，默认为 true，仅在watchLimitedTimeViewPlan = 'Plan2'下生效
let isObtainIncentive = true;//是否额外看1次小视频得奖励-激励碎片，默认为 true，仅在watchLimitedTimeViewPlan = 'Plan2'下生效
let isObtainDecorations = false;//是否额外看1次小视频得奖励-白泽宇航员装扮，默认为 false，仅在watchLimitedTimeViewPlan = 'Plan2'下生效


//---------------------------------------------------------------------------------------
//实体机运行时可选配置——权限控制
let isSetSilent = true;//执行脚本时是否静音，需开启 修改系统设置 权限【开启此高危权限有非法脚本注入病毒风险】，默认为 false
let iskeepScreenDim = true;//执行脚本时是否屏幕常亮(不锁屏)，结束时恢复，需开启 修改系统设置 权限【开启此高危权限有非法脚本注入病毒风险】，默认为 false
let isSetBrightness = true;//执行脚本时是否降低屏幕亮度，结束时恢复，需开启 修改系统设置 权限【开启此高危权限有非法脚本注入病毒风险】，默认为 false
let isNetcheck = false;//是否进行网络检测，默认为 false


//---------------------------------------------------------------------------------------
//实体机运行时可选配置——自动解锁

//是否在定时执行脚本时时自动唤醒并解锁屏幕，请注意此配置必须实体机才开启，且开启后，获取屏幕分辨率方式 "getViewRatioPlan" 必须修改为 "Plan1" ;
let isWakeupAndLocked = false;
//当开启自动唤醒屏幕并解锁屏幕时，请选择您的锁屏方式，Plan1 为无密码或数字密码或混合密码， Plan2 为滑动图形密码，默认为 Plan1
let unlockPlan = "Plan1";
//当开启自动唤醒屏幕并解锁屏幕时，请输入您的锁屏密码，默认为 1024，仅在isWakeupAndLocked = true下生效
//无密码时此配置置空，图形密码则将图形经过的数字作为密码，如“Z”型密码为“1235789”，其对应方式如下图：
/*
    *   *   *   ==》 1   2   3
    *   *   *   ==》 4   5   6
    *   *   *   ==》 7   8   9
*/
let lockPassword = "1024";


//---------------------------------------------------------------------------------------
//通用配置
let isOpenComplexLog = false;//是否开启复杂日志，开启后会有查找、等待、点击日志，默认为 false
let isLockScreen = false;//是否在执行完脚本后锁屏，默认为 false
let isPreventsDormancy = true;//是否开启防休眠点击（听书及玩游戏）
let isClosePopupWindow = true;//是否尝试关闭软件升级、活动广告、青少年模式等可能导致脚本卡死的弹窗
let isGetLeakageReward = true;//是否检测并获取遗漏奖励
let isClearRecents = false;//是否允许清理后台应用，请锁定脚本运行软件，如Auto.js或AutoX.js

//---------------------------------------------------------------------------------------
//部分机型及软件版本不兼容，可尝试修改以下配置

//获取屏幕分辨率，实体机且开启了自动解锁功能请使用 Plan1，虚拟云设备请尝试 Plan2 ，鉴于本人是在云设备上运行，默认为 Plan2
let getViewRatioPlan = "Plan2";
//点击我的方案，不同手机请尝试不同方案，鉴于本人仅 Plan4 生效，默认为 Plan4
let clickMePlan = "Plan4";
//切换登录账号时使用的方案，Plan1 调用登录界面控件，步骤较少；Plan2 采用了剪切板，尽量避免直接对登录界面的控件进行操作，减少机器检测风险；默认为 Plan2
let accountPlan = "Plan2";
//由于激励碎片功能完全由他人开发，且暂时无空一一验证，提供由两位作者的方案尝试,默认为 Plan1，可尝试Plan2
let getIncentivePlan = "Plan1";

//---------------------------------------------------------------------------------------
//鸣谢及参考
/**
 * 本脚本制作参考并大量copy以下大佬源码，特此鸣谢

 * @KhScript https://www.52pojie.cn/thread-1820936-1-1.html

 * @Bayonet https://www.52pojie.cn/thread-1869154-1-1.html

 * @lq2007 https://www.52pojie.cn/thread-1850134-1-1.html

 */

//---------------------------------------------------------------------------------------
//声明
/**
 * 本脚本代码可进行二次创造，唯独严禁用于 盈利 ！

 * 请勿在 起点书评区 等 不适宜场所 分享此脚本！低调 使用！

 * 如有bug，可附带录屏和运行日志评论，我很乐意继续完善这个脚本！

 * 如有其他改进意见，也请指正，我慢慢学习中……

 */

//---------------------------------------------------------------------------------------
//主函数

auto.waitFor();
//当前脚本版本号及部分全局变量
let beta = "beta.6.1.7.15";
let deviceRatio, Account, Brightness, currentDate;
const KX, KY;
//设置运行状态及部分参数
setStatus(true);
//首次执行
if (initializePackage()) {
  //确认当前账号
  accountverify();
  //执行任务
  taskStructure();
}

// 切换登录账号
for (let i = 0; i < accountArr.length && isSwitchAccount; i++) {
  if (accountArr[i][0] !== Account && switchAccount(accountPlan, accountArr[i][0], accountArr[i][1], accountArr[i][2])) {
    //设置运行参数
    setParams(i);
    //执行任务
    taskStructure();
  }
}
//设置运行状态及部分参数
setStatus(false);
engines.stopAllAndToast();

//---------------------------------------------------------------------------------------
//子函数

/**
 * 设置运行状态
 * @param {bool} switchs 开启或关闭
 */
function setStatus(switchs) {
  if (switchs) {
    onlyOne();
    console.clear();
    console.setTitle(beta);
    console.show();
    console.log("当前脚本版本号为：" + beta);
    deviceRatio = getViewRatio(getViewRatioPlan);
    KX = deviceRatio.width / 1080; //横坐标比例系数
    KY = deviceRatio.height / 2340; //纵比例系数
    console.setPosition(0, deviceRatio.height / 1.8)
    console.setSize(deviceRatio.width / 2, deviceRatio.width / 2.5)
    currentTime = new Date();
    currentDate = currentTime.getFullYear() + "."
      + (currentTime.getMonth() + 1) + "."
      + currentTime.getDate() + " "
      + currentTime.getHours() + ":"
      + currentTime.getMinutes() + ":"
      + currentTime.getSeconds();
    currentDate.toString();
    log("当前日期：" + currentDate);
    wakeupAndLocked();
    Brightness = [device.getBrightness(), device.getBrightnessMode()];

    if (auto.service == null) {
      log("请先开启无障碍服务！本次脚本已结束！");
      engines.stopAllAndToast();
    } else {
      log("无障碍服务已开启");
    }
    if (isSetSilent)
      device.setMusicVolume(0);
    if (iskeepScreenDim)
      device.keepScreenDim();
    if (isSetBrightness)
      closescreen("Plan1", false);

  } else {
    let endTime = new Date();
    let allTime = (endTime - currentTime) / 1000;
    let h = parseInt(allTime / 3600);
    let m = parseInt((allTime % 3600) / 60);
    let s = ((allTime % 3600) % 60);
    log("本次脚本运行时长：" + h + "小时 " + m + "分钟 " + s + "秒");
    if (isSetBrightness)
      closescreen("Plan1", true);
    if (iskeepScreenDim)
      device.cancelKeepingAwake();
    clearRecents();
    log("脚本已结束，记得清理auto.js后台");
    log("控制台3秒后自动关闭");
    sleep(3000);
    console.hide();
    if (isLockScreen)
      runtime.accessibilityBridge.getService().performGlobalAction(android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_LOCK_SCREEN)
  }
}

/**
* 设置运行参数
* @Param {number} i 当前切换账号下标
*/
function setParams(i) {
  log("正在依据账号数据重设运行参数");

  isExchange = accountArr[i][3][0];
  isOpenTreasureChest = accountArr[i][3][1];
  isPlayGame = accountArr[i][3][2];
  isListeningBooks = accountArr[i][3][3];
  isGetIncentive = accountArr[i][3][4];
  isShareTikTok = accountArr[i][3][5];
  isUseMangaTicket = accountArr[i][3][6];
  isFreeReSignin = accountArr[i][3][7];
  isSubscribeNovelChapter = accountArr[i][3][8];
  isSundaySubscribeNovelChapter = accountArr[i][3][9];

  bookName = accountArr[i][4][0];
  mangaName = accountArr[i][4][1];
  novelName = accountArr[i][4][2];

  log("参数重设完成");
}

/**
* 总任务结构
*/
function taskStructure() {
  //福利中心任务
  executiveWelfareCenter();
  //签到页面任务
  checkinPage();
  //开始激励碎片任务
  getIncentive();
  //使用漫画券
  useMangaTicket();
  //章节卡订阅小说
  subscribeNovelChapter();
  //检测遗漏奖励
  getLeakageReward();
}

/**
 * 根据选择方案获取全局使用的设备分辨率
 * @Param {string} mode 选择获取分辨率方案
 * @Return 返回获取到的分辨率
 */
function getViewRatio(mode) {
  let Ratio = {};
  if (mode === 'Plan1') {
    Ratio.height = device.height;
    Ratio.width = device.width;
  } else if (mode === 'Plan2') {
    let AndroidConnect = id("android:id/content").findOne(1000);
    Ratio.height = AndroidConnect.bounds().bottom;
    Ratio.width = AndroidConnect.bounds().right;
  }

  if (Object.keys(Ratio).length === 0) {
    log("请注意：获取屏幕分辨率失败，后续操作时脚本随时崩溃");
  } else {
    log("屏幕分辨率为：" + Ratio.width + "*" + Ratio.height);
  }
  return Ratio;
}

/**
 * 只允许有一个同名脚本运行
 */
function onlyOne() {
  let g = engines.myEngine();
  let e = engines.all(),
    n = e.length;
  let r = g.getSource() + "";
  1 < n && e.forEach(e => {
    let n = e.getSource() + "";
    g.id !== e.id && n == r && e.forceStop()
  });
}

/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @param {string} mode 查找方式，详见 findViewBy
 * @return 存在返回true，不存在返回 false
 */
function findView(content, mode) {
  if (isOpenComplexLog)
    log("查找控件 " + content);
  let find = findViewBy(content, mode);
  return find && find.exists() ? true : false;
}

/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @param {string} mode 查找方式，详见 findViewBy
 * @return 第一个符合条件的控件
 */
function waitView(content, mode) {
  if (isOpenComplexLog)
    log("等待控件 " + content);
  let view = findViewBy(content, mode);
  return view && view.exists() ? view.findOne(1000) : undefined;
}

/**
 * 查找控件
 * @param {string} content 查找文本
 * @param {string} mode 查找方式，默认 text，可选 match，id，textContains
 * @return selector
 */
function findViewBy(content, mode) {
  let find;
  if (mode === 'match') {
    find = textMatches(content);
  } else if (mode === 'id') {
    find = id(content)
  } else if (mode === 'textContains') {
    find = textContains(content)
  } else {
    find = text(content);
  }
  return find;
}

/**
 * 根据文字查找按钮并点击，如果点击成功，则等待2秒
 * @param {UiObject} view 按钮上的文字所在 view
 * @param {string} mode 点击方式，默认 One，可选 Two
 * @return 是否成功点击
 */
function clickButton(view, mode) {
  if (view === undefined)
    return false;
  if (isOpenComplexLog)
    log("点击 " + view.text());
  // 查找按钮所在控件
  let btn = view;

  while (btn && !btn.clickable()) {
    btn = btn.parent();
  }
  // 点击
  if (btn) {
    btn.click();
    if (mode === "Two")
      btn.click();
    sleep(2000);
    return true;
  }
  //重新尝试点击
  if (view && view.clickable()) {
    view.click();
    if (mode === "Two")
      view.click();
    sleep(2000);
    return true;
  } else if (view) {
    click(view.bounds().centerX(), view.bounds().centerY());
    if (mode === "Two")
      click(view.bounds().centerX(), view.bounds().centerY());
    sleep(2000);
    return true;
  }
  return false;
}

/**
 * 仿真随机带曲线滑动
 * @param {number} qx, qy, zx, zy 起点x,起点y,终点x,终点y
 * @param {number} time 过程耗时单位毫秒
 * @param {string} mode 滑动方式，默认swipe，可选simulation
 */
function sml_move(qx, qy, zx, zy, time, mode) {
  if (mode === "simulation") {
    let xxy = [time];
    let point = [];
    let dx0 = {
      "x": qx,
      "y": qy
    };
    let dx1 = {
      "x": random(qx - 100, qx + 100),
      "y": random(qy, qy + 50)
    };
    let dx2 = {
      "x": random(zx - 100, zx + 100),
      "y": random(zy, zy + 50),
    };
    let dx3 = {
      "x": zx,
      "y": zy
    };
    for (let i = 0; i < 4; i++) {
      eval("point.push(dx" + i + ")");
    };
    //log(point[3].x)
    for (let i = 0; i < 1; i += 0.08) {
      xxyy = [parseInt(bezier_curves(point, i).x), parseInt(bezier_curves(point, i).y)]
      xxy.push(xxyy);
    }
    //log(xxy);
    gesture.apply(null, xxy);
  } else {
    swipe(qx, qy, zx, zy, time);
  }
}

/**
 * 仿真曲线滑动
 */
function bezier_curves(cp, t) {
  cx = 3.0 * (cp[1].x - cp[0].x);
  bx = 3.0 * (cp[2].x - cp[1].x) - cx;
  ax = cp[3].x - cp[0].x - cx - bx;
  cy = 3.0 * (cp[1].y - cp[0].y);
  by = 3.0 * (cp[2].y - cp[1].y) - cy;
  ay = cp[3].y - cp[0].y - cy - by;
  tSquared = t * t;
  tCubed = tSquared * t;
  result = {
    "x": 0,
    "y": 0
  };
  result.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
  result.y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;
  return result;
}

/**
 * 切换登录账号
 * @param {string} mode 选择获取分辨率方案
 * @param {string} accountNames 用户名
 * @param {string} accountNumbers 账号
 * @param {string} accountPasswords 密码
 * @return 是否成功切换账号
 */
function switchAccount(mode, accountNames, accountNumbers, accountPasswords) {
  initializePackage()
  log("起点初始化完成");

  clickButton(id("ivSetting").findOne());
  log("点击设置成功");
  findViewBy("设置").waitFor();
  log("成功进入设置界面");
  sml_move(deviceRatio.width - 50, deviceRatio.height * 3 / 4, deviceRatio.width - 50, deviceRatio.height / 4, 400, "simulation");
  clickButton(waitView("切换账号"));
  log("正在等待登录界面，最长将等待5秒");
  text("我已阅读并同意《用户服务协议》及《隐私协议》，未注册手机登录后将自动创建起点账号").findOne(5000);
  if (clickButton(waitView("com.qidian.QDReader:id/tvLogin", "id"))) {
    sleep(1000)
    clickButton(waitView("同意并继续"));
  } else {
    log("进入账号密码登录界面失败");
    return;
  }
  log("已进入账号密码登录界面");
  if (mode === 'Plan1') {
    log("切换账号" + accountNames);
    Accountname = id('mNickNameEditText').findOne();
    if (Accountname)
      click(Accountname.bounds().centerX(), Accountname.bounds().centerY());
    sleep(1000);
    //退出输入法或密码管理器
    back();
    Accountname.setText("");
    sleep(1000);
    Accountname.setText(accountNumbers);
    sleep(1000);
    Accountpassword = id('mPwdEditText').findOne(5000);
    if (Accountpassword)
      click(Accountpassword.bounds().centerX(), Accountpassword.bounds().centerY());
    sleep(1000);
    //退出输入法或密码管理器
    back();
    Accountpassword.setText("");
    sleep(500);
    Accountpassword.setText(accountPasswords);
    sleep(1000);
    clickButton(waitView("登录"));
    let updatepassword = text("更新").findOne(5000);//更新自动填充
    if (updatepassword != null) {
      sleep(500);
      click(updatepassword.bounds().centerX(), updatepassword.bounds().centerY());
    }
    if (findView(accountNames)) {
      log(accountNames + "登录成功");
      return true;
    }
  } else if (mode === 'Plan2') {
    log("切换账号" + accountNames);
    Accountname = id('mNickNameEditText').findOne(1000);
    if (Accountname === null) {
      Accountname = id('mNickNameLayout').findOne(1000);
    }
    if (Accountname) {
      setClip(accountNumbers);
      click(Accountname.bounds().centerX(), Accountname.bounds().centerY());
      sleep(1000);
      //退出输入法或密码管理器
      back();
      longClick(Accountname.bounds().centerX(), Accountname.bounds().centerY());
      sleep(1500);
      paste();
    }
    sleep(2000);
    Accountpassword = id('mPwdEditText').findOne(1000);
    if (Accountpassword === null) {
      Accountpassword = id('mPwdLayout').findOne(1000);
    }
    if (Accountpassword) {
      setClip(accountPasswords);
      let showPwd = id('mShowPwdImageView').findOne(1000);
      if (showPwd)
        click(showPwd.bounds().centerX(), showPwd.bounds().centerY());
      click(Accountpassword.bounds().centerX(), Accountpassword.bounds().centerY());
      sleep(1000);
      //退出输入法或密码管理器
      back();
      longClick(Accountpassword.bounds().centerX(), Accountpassword.bounds().centerY());
      sleep(1500);
      paste();
    }
    sleep(2000);
    Accountlogon = text('登录').findOne(1000);
    if (Accountlogon) {
      click(Accountlogon.bounds().centerX(), Accountlogon.bounds().centerY());
      let updatepassword = text("更新").findOne(5000);//更新自动填充
      if (updatepassword != null) {
        sleep(500);
        click(updatepassword.bounds().centerX(), updatepassword.bounds().centerY());
      }
    }
    sleep(2000);
    let homepage = id('ivMoreView').findOne(2000);
    if (homepage != null) {
      log(accountNames + "登录成功");
      return true;
    }
  }

  log("切换账号失败");
  return false;
}

/**
 * 确认当前登录账号
 */
function accountverify() {
  let dianjiwo = id("view_tab_title_title").className("android.widget.TextView").text("我").findOne(1000);
  if (dianjiwo != null) {
    click(dianjiwo.bounds().centerX(), dianjiwo.bounds().centerY());
  }
  sleep(1000);
  text("福利中心").untilFind;
  let AccountID = id("tvName").findOne(3000)
  if (AccountID != null) {
    Account = AccountID.text();
    log("当前已登录账号为：" + Account);
  } else {
    log("获取当前已登录账号失败，这对于单账号运行没有影响，但多账号运行时，已登录账号将重复登录一次，这可能浪费些时间？不过脚本应该依旧可以正常往下执行。");
  }
  for (let i = 0; i < accountArr.length && isSwitchAccount; i++) {
    if (accountArr[i][0] === Account) {
      setParams(i);
    }
  }

  backhome()
}

/**
 * 返回主界面
 * @param {string} destination 返回主界面的目的地
 */
function backhome(destination) {
  for (let i = 1; i < 11; i++) {
    //bounds(792, 114, 912, 234)
    //bounds(936, 111, 1056, 231)
    let homepage = id('ivMoreView').findOne(2000);
    if (homepage != null) {
      log("已在起点主界面");
      break;
    }
    else if (i == 10) {
      if (findView("书架") && findView("我")) {
        log("已在起点主界面");
        break;
      }
      else {
        log("返回主界面失败退出，为定位问题所在，将启动调式函数");
        outputlist();
        exit();
      }

    }
    else {
      back();
      sleep(1000);
    }
  }
  let dianjiwo = id("view_tab_title_title").className("android.widget.TextView").text(destination).findOne(1000);
  if (dianjiwo != null) {
    click(dianjiwo.bounds().centerX(), dianjiwo.bounds().centerY());
  }
}

/**
 * 初始化起点页面
 * @return 是否初始化成功
 */
function initializePackage() {
  clearRecents();
  sleep(1000);
  app.launch("com.qidian.QDReader");
  log("等待起点启动");

  if (isClosePopupWindow) {
    log("已开启跳过开屏广告、升级及活动弹窗线程");
    var ClosePopupThread = threads.start(
      function () {
        sleep(1000);
        do {
          closePopupWindow();
          sleep(500);
        } while (true)
      }
    );
  }

  let isBackhome = false;
  var backhomeThread = threads.start(
    function () {
      do {
        if (isBackhome) {
          log("6秒未检测到首页，返回首页线程已开启");
          backhome();
          isBackhome = false;
        }
        sleep(500);
      } while (true)
    }
  );


  waitForPackage("com.qidian.QDReader");
  log("起点启动成功，请稍等，此过程较长");

  waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity');
  let tally = 0;
  do {
    sleep(1000);
    if (findView("书架") && findView("我")) {
      break;
    } else {
      if (tally === 0 || tally % 5 === 0)
        log("起点主页缓冲中……");
      //返回首页
      if (tally === 6) {
        isBackhome = true;
      }
      tally++;
    }
  } while (!(findView("书架") && findView("我")))

  backhomeThread.interrupt();

  if (findView("书架") && findView("我")) {
    log("起点已启动成功");
    sleep(1000);
    let thread = threads.start(
      function time() {
        //计时
        let shuzi = 0;
        do {
          sleep(1000);
          shuzi++
        }
        while (shuzi < 45);
        log("脚本运行异常,请将起点、auto.js后台清理后尝试重新运行");
        console.hide();
        clearRecents();
        device.cancelKeepingAwake();
        engines.stopAllAndToast()
      }
    );
    sml_move(deviceRatio.width - 50, deviceRatio.height / 4, deviceRatio.width - 50, deviceRatio.height / 2, 500, "simulation")
    sleep(2000);

    if (clickMe(clickMePlan)) {
      thread.interrupt();
      log("关闭纠错线程");
      if (isClosePopupWindow) {
        ClosePopupThread.interrupt();
        log("已关闭跳过开屏广告、升级及活动弹窗线程");
      }
      return true;
    } else {
      log("未成功打开“我”，初始化失败");
      return false;
    }
  } else {
    log("起点未启动成功，请查看日志查询原因");
    return false;
  }
}

/**
 * 关闭弹窗
 * 这是一个尝试性的操作，由于没有足够的测试样本，我并不能保证它一定可靠
 * 本处的逻辑及控件信息改写自GDK-AdproGDK规则订阅，特此鸣谢
 */
function closePopupWindow() {
  let skipButton = id("com.qidian.QDReader:id/splash_skip_button").findOne(1000);
  clickButton(skipButton);

  if (id("com.qidian.QDReader:id/upgrade_title").findOne(1000) !== null) {
    clickButton(waitView("com.qidian.QDReader:id/upgrade_dialog_close_btn", "id"));
  }

  if (id("button_text_id").className("android.widget.TextView").text("立即下载").exists()) {
    id("button_text_id").className("android.widget.TextView").text("以后再说").findOne(1000).click();
  }

  if (id("com.qidian.QDReader:id/imgBKT").findOne(1000) !== null)
    clickButton(waitView("com.qidian.QDReader:id/imgClose", "id"));
}

/**
 * 尝试关闭青少年弹窗
 */
function turnOffTeenMode() {
  if (findView("com.qidian.QDReader:id/btnEnterTeen", "id"))
    clickButton(waitView("com.qidian.QDReader:id/btnCancel", "id"));
}

/**
 * 根据选择方案点击“我”，并返回点击结果，实际上我一点都不想写这个……
 * @param {string} mode 选择获取分辨率方案
 * @return 返回获取到的分辨率
 */
function clickMe(mode) {
  if (mode === 'Plan1') {
    let uc = id("viewPager").className("androidx.viewpager.widget.ViewPager").scrollable(true).findOne().bounds()
    let x1 = uc.right;
    let y1 = uc.bottom;
    click((x1 - 10), (y1 + 10));
  } else if (mode === 'Plan2') {
    click(deviceRatio.width - 150, deviceRatio.height - 150);
  } else if (mode === 'Plan3') {
    id("view_tab_title_title").className("android.widget.TextView").text("我").findOne().parent().click()
  } else if (mode === 'Plan4') {
    let dianjiwo = id("view_tab_title_title").className("android.widget.TextView").text("我").findOne(1000);
    if (dianjiwo != null) {
      click(dianjiwo.bounds().centerX(), dianjiwo.bounds().centerY());
    }
  } else {
    return false;
  }

  if (isClosePopupWindow) {
    log("已开启跳过青少年模式弹窗线程");
    var turnOffTeenModeThread = threads.start(
      function () {
        sleep(500);
        do {
          turnOffTeenMode();
          sleep(500);
        } while (true)
      }
    );
  }

  if (text("福利中心").findOne(3000)) {
    log("成功打开“我”");
    if (isClosePopupWindow) {
      turnOffTeenModeThread.interrupt();
      log("已关闭跳过青少年模式弹窗线程");
    }
    return true;
  } else {
    log("未成功打开“我”");
    if (isClosePopupWindow) {
      turnOffTeenModeThread.interrupt();
      log("已关闭跳过青少年模式弹窗线程");
    }
    return false;
  }

}

/**
 * 看每日福利视频
 */
function watchView() {
  log("即将开始看每日视频福利");
  sml_move(deviceRatio.width - 50, deviceRatio.height / 4, deviceRatio.width - 50, deviceRatio.height * 3 / 4, 500, "simulation")
  clickButton(waitView("跳过"));
  let unfold = className("android.widget.TextView").text("展开").findOne(3000);
  if (unfold != null) {
    click(unfold.bounds().centerX(), unfold.bounds().centerY());
  }
  if (findView("每日福利", "textContains")) {
    do {
      log("每日视频")
      sleep(1000);
      if (clickButton(waitView("看视频领福利", "textContains"))) {
        videoLook()
        sleep(2000);
        clickButton(waitView("我知道了"));
        //此点击测试中……未知原因偶发看视频领福利被跳过
        sml_move(deviceRatio.width - 50, deviceRatio.height / 4, deviceRatio.width - 50, deviceRatio.height * 3 / 4, 500, "simulation")
        let unfold1 = className("android.widget.TextView").text("展开").findOne(2000);
        if (unfold1 != null) {
          log("此点击测试中……未知原因偶发看视频领福利被跳过");
          click(unfold1.bounds().centerX(), unfold1.bounds().centerY());
        }
      } else {
        sleep(2000)
        sml_move(deviceRatio.width - 50, deviceRatio.height / 4, deviceRatio.width - 50, deviceRatio.height * 3 / 4, 500, "simulation")
        if (findView("明日再来吧", "textContains") || findView("今日福利已领完", "textContains")) {
          log("每日福利视频领完了");
          break;
        }
        let unfold2 = className("android.widget.TextView").text("展开").findOne(3000);
        if (unfold2 != null) {
          click(unfold2.bounds().centerX(), unfold2.bounds().centerY());
        }
        do {
          sleep(1000);
          if (clickButton(waitView("看视频领福利", "textContains"))) {
            videoLook()
            sleep(2000);
            clickButton(waitView("我知道了"));
            sml_move(deviceRatio.width - 50, deviceRatio.height / 4, deviceRatio.width - 50, deviceRatio.height * 3 / 4, 500, "simulation")
            let unfold3 = className("android.widget.TextView").text("展开").findOne(2000);
            if (unfold3 != null) {
              log("此点击测试中……未知原因偶发看视频领福利被跳过");
              click(unfold3.bounds().centerX(), unfold3.bounds().centerY());
            }
          } else {
            break;
          }
        } while (findView("看视频领福利"));
        break;
      }
    } while (findView("看视频领福利"));

    let unfolds4 = className("android.widget.TextView").text("收起").findOne(3000);
    if (unfolds4 != null) {
      click(unfolds4.bounds().centerX(), unfolds4.bounds().centerY());
    }

    if (isOpenTreasureChest && clickButton(waitView("看视频开宝箱", "textContains"))) {
      log("开宝箱");
      videoLook()
      sleep(2000);
      clickButton(waitView("我知道了"));
      log("宝箱开完了");
    }
  } else {
    do {
      log("每日视频2")
      sleep(1000);
      if (findView("明天再来吧")) {
        break;
      } else {
        let video_sum = className("android.widget.Button").findOne().text()
        log(video_sum)
        let video_loop = video_sum.charAt(2);
        if (video_loop == "再") {
          break;
        } else {
          className("android.widget.Button").textContains("看视频领福利").click();
          videoLook()
          //此点击测试中……未知原因偶发看视频领福利被跳过
          let unfold = className("android.widget.TextView").text("展开").findOne(2000);
          if (unfold != null) {
            log("此点击测试中……未知原因偶发看视频领福利被跳过");
            click(unfold.bounds().centerX(), unfold.bounds().centerY());
          }
          sleep(2000);
          clickButton(waitView("我知道了"));
        }
      }
    } while (video_loop != "再" || video_loop <= 8);
  }
  sleep(3000);
  log("每日视频福利已刷完，开始刷限时任务");
}

/**
 * 看视频并在结束时退出视频
 */
function videoLook() {
  //计时
  log("———————");
  log("看视频");
  //判断是否进入视频播放页面
  let tally = 0;
  do {
    if (findView("可获得奖励", "textContains")) {
      break;
    } else {
      if (tally === 0 || tally % 5 === 0)
        log("视频缓冲中……")
      if (tally === 15) {
        log("缓冲时间过长……为避免脚本卡死，退出循环")
        break;
      }
      tally++;
      sleep(1000);
    }
  } while (!findView("可获得奖励", "textContains"))
  //获取退出坐标
  let video_quit = "";
  let x1 = 1;
  let x2 = 1;
  let y1 = 1;
  let y2 = 1;
  let thread = threads.start(
    function coordinate() {
      sleep(3000);
      if (textContains("可获得奖励").exists() && !video_quit) {
        video_quit = textContains("可获得奖励").findOne().bounds()
        x1 = 0;
        x2 = video_quit.left;
        y1 = video_quit.top;
        y2 = video_quit.bottom;
        console.log("退出坐标", parseInt((x1 + x2) / 2), parseInt((y1 + y2) / 2))
      } else {
        console.log("计算退出坐标失败，稍后重新获取")
      }
    }
  );

  let startTime = new Date().getTime();
  let isRunning = true;

  let thread2 = threads.start(
    function () {
      let video_flag = "";//视频文字信息
      //判断视频是否播放到满足领取奖励条件
      let storage = "";
      let tally = true;
      let last_video_flag = "";//上次循环视频文字信息
      do {
        if (findView("可获得奖励", "textContains")) {
          if (findView("观看完视频", "textContains")) {
            video_flag = "观看完视频,可获得奖励"
          } else if (findView("观看视频", "textContains")) {
            video_flag = textContains("观看视频").findOne().text()
          } else if (findView("有声书", "textContains")) {
            video_flag = textContains("有声书").findOne().text()
          } else {
            video_flag = "";
          }

          if (video_flag != storage && storage.length <= 0) {
            if (tally || last_video_flag != video_flag) {
              console.log(video_flag);
              last_video_flag = video_flag;
            }
          } else if (video_flag != storage && storage.length > 0) {
            if (tally || last_video_flag != video_flag) {
              console.log(video_flag);
              last_video_flag = video_flag;
            }
            if (video_flag.includes("视频0秒") || video_flag.includes("收听0秒")) {
              console.log("结束");
              sleep(1500);
              break;
            }
          } else {
            if (tally || last_video_flag != video_flag) {
              console.log(video_flag);
              last_video_flag = video_flag;
            }
          }
          storage = video_flag;
        } else {
          if (video_flag.includes("观看完视频") || video_flag === "") {
            console.log("结束");
            sleep(1500);
            break;
          }
        }
        clickButton(waitView("继续观看", "textContains"));
        clickButton(waitView("继续听完", "textContains"));
        tally = false;
      } while (!video_flag.includes("已") && isRunning);
      isRunning = false;
    }
  );

  //检测60秒，如仍未退出视频，强制退出
  while (new Date().getTime() - startTime < 60000 && isRunning) {
    sleep(1000);
  }

  // 停止循环
  isRunning = false;

  thread.interrupt();
  thread2.interrupt();

  //退出视频
  let n = 0;
  do {
    n++
    if (n == 1) {
      click(parseInt((x1 + x2) / 2), parseInt((y1 + y2) / 2))
    } else if (n > 1 && findView("可获得奖励", "textContains")) {
      log("退出失败，重新获取退出坐标")
      if (!(clickButton(waitView("跳过广告", "textContains")) || clickButton(waitView("跳过视频", "textContains")))) {
        if (findView("可获得奖励", "textContains")) {
          video_quit = textContains("可获得奖励").findOne().bounds()
        }
        x1 = 0;
        x2 = video_quit.left;
        y1 = video_quit.top;
        y2 = video_quit.bottom;
        let bounds = true;
        do {
          let x = random(x1, x2);
          let y = random(y1, y2);
          console.log("区域随机点击", x, y)
          click(x, y);
          clickButton(waitView("继续观看", "textContains"));
          clickButton(waitView("继续听完", "textContains"));
        } while (findView("可获得奖励", "textContains"));
      }
    } else if (!findView("可获得奖励", "textContains")) {
      log("尝试模拟“手势返回”")
      back()
    } else {
      log("未知原因退出失败，脚本停止运行")
      console.hide();
      clearRecents();
      device.cancelKeepingAwake();
      engines.stopAllAndToast()
    }
    sleep(3000);
  }
  while (!(findView("福利中心", "textContains") || findView("视频奖励", "textContains") || findView("签到")));
  log("关闭视频")
  log("———————");
}

/**
 * 周末兑换章节卡
 */
function exchange() {
  log("周末兑换章节卡");
  if (!isExchange || new Date().getDay()) {
    log("非周日或者设置不领取");
    return;
  }
  backhome();
  if (clickButton(waitView("签到福利"))) {
    log("已重新进入签到福利页");
  } else {
    log("重新进入签到福利页失败");
    return;
  }
  sleep(2000);
  let txt = text("周日兑换章节卡").findOne(2000);
  if (!txt) {
    log("找不到控件，结束");
    return;
  }
  clicks(txt, 2);
  sleep(2000)
  txt = textMatches(/\d+张碎片可兑换/).findOne(2000);
  let n = txt ? txt.text().match(/\d+/)[0] - "" : 0;
  log("%d张碎片可兑换", n);
  switch (true) {
    case n < 15:
      log("碎片不够15张，结束");
      back();
      return;
    case n < 20:
      n = 15;
      log("已兑换10点章节卡");
      break;
    case n < 30:
      n = 20;
      log("已兑换15点章节卡");
      break;
    case n >= 30:
      n = 30;
      log("已兑换20点章节卡");
      break;
  }
  txt = text(n + "张碎片兑换").findOne(2000);
  let bt = txt ? txt.parent().findOne(desc("兑换")) : null;
  if (!bt) {
    log("找不到控件，结束");
    return;
  }
  clicks(bt, 1);
  sleep(500);
  bt = desc("兑换").depth("16").findOne(2000);
  clicks(bt, 0);
  back();
  sleep(1000);
  backhome();
}

function clicks(o, t) {
  let p = o;
  let r = false;
  if (!o) return r;
  while (t-- && !(r = p.clickable()))
    p = p.parent();
  return r ? p.click() : click(o.bounds().centerX(), o.bounds().centerY());
}

/**
 * 抽奖活动
 */
function lottery() {
  log("———————");
  sml_move(deviceRatio.width - 50, deviceRatio.height / 4, deviceRatio.width - 50, deviceRatio.height * 3 / 4, 500, "simulation")
  if (textContains("章节卡碎片").exists()) {
    //抽奖活动
    log("抽奖活动")
    sleep(2000);
    if (textContains("抽奖机会").exists() || text("立即抽奖").exists() || text("机会+1").exists() || textContains("点击抽奖").exists()) {
      log("开始抽奖")
      if (text("立即抽奖").exists()) {
        text("立即抽奖").findOne().click()
      } else if (text("机会+1").exists()) {
        text("机会+1").findOne().click()
      } else if (textContains("抽奖机会").exists()) {
        textContains("抽奖机会").findOne().click()
      } else if (textContains("点击抽奖").exists()) {
        textContains("点击抽奖").findOne().click()
      }
      do {
        sleep(1000);
        if (className("android.view.View").text("明天再来").exists()) {
          break;
        }
        if (className("android.view.View").text("看视频抽奖喜+1").exists()) {
          log("看视频抽奖")
          className("android.view.View").text("看视频抽奖喜+1").findOne().click()
        } else if (className("android.view.View").text("抽 奖").exists()) {
          log("赠送抽奖")
          className("android.view.View").text("抽 奖").findOne().click()
        }
        let video_course = true
        let j = 0;
        do {
          j++
          sleep(1000);
          if (j > 4 || className("android.view.View").text("明天再来").exists()) {
            video_course = false
            break;
          }
          log("等待中……")
        }
        while (!(textContains("观看视频").exists() || textContains("观看完视频").exists()))
        if (video_course) {
          videoLook()
        }
        sleep(2000);
        clickButton(waitView("我知道了"));
      } while (textContains("剩余") && ((className("android.view.View").text("抽 奖").exists()) || className("android.view.View").text("看视频抽奖喜+1").exists()));

      sleep(2000);
      log("抽奖活动结束")
      log("———————");
      backhome();
    } else {
      log("抽奖活动结束");
      log("———————");
      backhome();
    }
  } else {
    sml_move(deviceRatio.width - 50, deviceRatio.height / 4, deviceRatio.width - 50, deviceRatio.height * 3 / 4, 500, "simulation")
    //签到福利——起点币
    log("概率得起点币活动");
    sleep(3000);
    do {
      if (!textContains("看视频").exists()) {
        break;
      }
      textContains("看视频").findOne().click()
      videoLook()
      sleep(3000);
      clickButton(waitView("我知道了"));
    }
    while (textContains("每天看视频").exists());
    sleep(2000);
    //抽奖
    log("概率得起点币活动结束")
    log("———————");
    log("抽奖活动")
    sleep(2000);
    if (text("立即抽奖").exists() || text("机会+1").exists()) {
      log("开始抽奖")
      if (text("立即抽奖").exists()) {
        text("立即抽奖").findOne().click()
      } else if (text("机会+1").exists()) {
        text("机会+1").findOne().click()
      }
      do {
        sleep(1000);
        if (className("android.view.View").text("明天再来").exists()) {
          break;
        }
        if (className("android.view.View").text("看视频抽奖喜+1").exists()) {
          log("看视频抽奖")
          className("android.view.View").text("看视频抽奖喜+1").findOne().click()
        } else if (className("android.view.View").text("抽 奖").exists()) {
          log("赠送抽奖")
          className("android.view.View").text("抽 奖").findOne().click()
        }
        let video_course = true
        let j = 0;
        do {
          j++
          sleep(1000);
          if (j > 4 || className("android.view.View").text("明天再来").exists()) {
            video_course = false
            break;
          }
          log("等待中……")
        }
        while (!(textContains("观看视频").exists() || textContains("观看完视频").exists()))
        if (video_course) {
          videoLook()
        }
        sleep(2000);
        clickButton(waitView("我知道了"));
      }
      while (textContains("剩余") && ((className("android.view.View").text("抽 奖").exists()) || className("android.view.View").text("看视频抽奖喜+1").exists()));
      sleep(2000);
      log("抽奖活动结束")
      log("———————");
      backhome();
    } else {
      log("抽奖活动结束");
      log("———————");
      backhome();
    }
  }
}

/**
 * 刷激励碎片
 */
function getIncentive() {
  if (!isGetIncentive)
    return false;
  log("获取激励碎片-开始");
  do {
    if (clickButton(waitView(bookName, "textContains"))) {
      console.log("已开启小说：" + bookName);
      break;
    } else {
      console.log("未找到继续下滑")
      sml_move(deviceRatio.width - 50, deviceRatio.height / 3, deviceRatio.width - 50, deviceRatio.height / 4, random(500, 1000))
    }
    sleep(1000);
  } while (true);

  if (getIncentivePlan === "Plan1") {
    let abscissa = deviceRatio.width;
    let ordinate = deviceRatio.height;
    let abscissa_new = abscissa / 2
    let ordinate_new = ordinate / 2
    sleep(3000);
    do {
      log("________");
      click(abscissa_new, ordinate_new)
      log("打开工具栏");
      sleep(1000);
      let jishu = 0;
      if (text("畅所欲言").exists() || textContains("正在讨论").exists() || textContains("发言粉丝值").exists() || textContains("书友正在讨论").exists() || (text("全部").exists() && text("配音").exists()) || id("submit").exists() || id("list_header").exists() || id("submitBtn").exists()) {
        back()
        sleep(1000);
        sml_move(deviceRatio.width * 3 / 4, deviceRatio.height / 2, deviceRatio.width * 1 / 4, deviceRatio.height / 2, random(500, 1000))
        sleep(1000);
        log("点击错误重新计算坐标");
        ordinate_new = Number(ordinate_new) + Number(10)
        console.log("点击坐标", abscissa_new, ordinate_new)
        click(abscissa_new, ordinate_new)
        if (jishu > 10) {
          log("未知原因，打开工具栏异常,刷激励碎片结束");
          backhome();
        }
        sleep(1000);
      }
    } while (!(text("订阅").exists() && text("月票").exists()));
    log("准备进入目录");
    do {
      click("目录", 0)
      sleep(3000);
    }
    while (!(text("热门").exists() || text("足迹").exists()));
    log("已进入目录");
    log("纠正初始页");
    if (text("去底部").exists()) {
      click("去底部", 0)
      sleep(3000);
    }
    if (text("去当前").exists()) {
      click("去当前", 0)
      sleep(3000);
    }
    if (text("去顶部").exists()) {
      click("去顶部", 0)
      sleep(3000);
    }
    log("纠正完毕，进入初始章节");
    click(abscissa_new, ordinate_new)
    sleep(3000);
    let bu = true
    let s = 0
    let suipian = 0
    do {
      ordinate_new = ordinate / 2
      s++
      let jishu = 0;
      do {
        log("________");
        click(abscissa_new, ordinate_new)
        log("领取碎片");
        sleep(1000);
        if (text("畅所欲言").exists() || textContains("正在讨论").exists() || textContains("发言粉丝值").exists() || textContains("书友正在讨论").exists() || (text("全部").exists() && text("配音").exists())) {
          back()
          sleep(1000);
          sml_move(deviceRatio.width / 4, deviceRatio.height / 2, deviceRatio.width - 100, deviceRatio.height / 2, random(500, 1000))
          sleep(1000);
          log("点击错误重新计算坐标");
          ordinate_new = Number(ordinate_new) + Number(10)
          console.log("点击坐标", abscissa_new, ordinate_new)
          click(abscissa_new, ordinate_new)
          if (jishu > 10) {
            log("未知原因，打开工具栏异常");
            console.hide();
            clearRecents();
            device.cancelKeepingAwake();
            engines.stopAllAndToast()
          }
          sleep(1000);
        }
      } while (!(text("订阅").exists() && text("月票").exists()));

      do {
        do {
          if (text("下一章").exists()) {
            click("下一章", 0)
            sleep(3000);
          }
          if (s > 1) {
            if (text("下一章").exists()) {
              click("下一章", 0)
              sleep(3000);
            }
            if (text("下一章").exists()) {
              click("下一章", 0)
              sleep(3000);
            }
          }
          sml_move(deviceRatio.width / 4, deviceRatio.height / 2, deviceRatio.width - 100, deviceRatio.height / 2, 500)
          sleep(3000);
        } while (!text("红包").exists());

        if (s > 1) {
          if (text("0个").exists()) {
            bu = false
          }
        }
        if (text("1个").exists()) {
          click("红包", 0)
          do {
            log("加载中……");
          }
          while (!text("红包广场").exists() || !text("马上抢").exists());
          sleep(1000);
          if (text("马上抢").exists()) {
            click("马上抢", 0)
            videoLook();
            click("立即领取", 0)
            suipian++
            log("已领取" + suipian + "个碎片");
            sleep(3000);
          }
          if (text("领取成功").exists()) {
            click("我知道了", 0)
            sleep(3000);
          }
        }
      } while (!text("0个").exists());
    } while (bu);
    if (suipian == 0) {
      log("今日碎片已领取上限，明日再来");
    }
  } else if (getIncentivePlan === "Plan2") {
    //找红包
    while (true) {
      do {
        log('找红包位置')
        while (true) {
          do {
            click(deviceRatio.width - 1, deviceRatio.height / 2);
          } while (id("tag").exists())
          click(deviceRatio.width / 2, deviceRatio.height / 2);
          log('点击屏幕')
          sleep(700)
          if (text("听书").exists()) {
            break
          }
          if (text("粉丝值说明").exists() || text("全部").exists() || textMatches(/书友圈\d+书友正在讨论/).exists() || text("快去参与讨论").exists()) {
            back()
            sleep(1000)
          } else if (text("发表").exists()) {
            back()
            back()
            sleep(1000)
          }
        }
        clickButton(text("下一章").findOne())
        // waitForActivity("com.qidian.QDReader.ui.activity.QDReaderActivity");
        click(1, deviceRatio.height / 2);
        // 如果起点app设置为单手模式，需要更改click为swipe滑动手势
        // click(1, deviceRatio.height / 2);
        swipe(200, 1400, 900, 1400, 500)
        sleep(800)
      } while (!text("红包").exists())
      log('红包位置已找到')
      if (text("0个").exists()) {
        log('没有红包')
        break
      }
      // var is
      // clickButton(text("立即领取").findOne())
      // currentPage = currentActivity();
      do {

        log('点击红包')
        clickButton(text("红包").findOne())
        log('打开红包')
        // clickButton(id("layoutHongbaoRoot").findOne())
        text("马上抢").waitFor()
        clickButton(text("马上抢").findOne())
        //看视频
        waitad()
        //领碎片
        log('领碎片')

      } while (clickButton(text("立即领取").findOne(3000)) == null)
      /*sleep(500)
      if (id("btnOk").exists()) {
          id("btnOk").findOne().click()
      }*/
      clickButton(id("btnOk").findOne(500))
      do {
        click(deviceRatio.width - 1, deviceRatio.height / 2);
      } while (text("红包").exists() || id("tag").exists())
    }
  }
  backhome();
  log("激励碎片领取完成");
}

/**
* 使用漫画券
*/
function useMangaTicket() {
  if (!isUseMangaTicket)
    return false;
  log("使用漫画券订阅漫画-开始");
  do {
    if (clickButton(waitView(mangaName, "textContains"))) {
      break;
    } else {
      console.log("未找到继续下滑")
      sml_move(deviceRatio.width - 50, deviceRatio.height / 3, deviceRatio.width - 50, deviceRatio.height / 4, random(500, 1000))
    }
    sleep(1000);
  } while (true);

  //进入漫画主页唤起目录
  let count = 0;
  do {
    count++;
    click(deviceRatio.width / 2, deviceRatio.height / 2);
    sleep(1000);
    if (clickButton(waitView("com.qidian.QDReader:id/imgMore", "id"))) {
      clickButton(waitView("com.qidian.QDReader:id/author", "id"))
      var mangaend = id("com.qidian.QDReader:id/tvLastUpdate").findOne(3000).text();
      if (mangaend) {
        let start = mangaend.indexOf("第");
        let end = mangaend.indexOf("话") + 1;
        mangaend = mangaend.substring(start, end);
        log("当前漫画更新至" + mangaend);
        clickButton(waitView("com.qidian.QDReader:id/tvDir", "id"));
        break;
      } else {
        log("获取最新话漫画失败，为避免进入未知错误，退出使用漫画券流程")
        backhome();
        return;
      }
    }
    else if (count > 10) {
      log("唤醒漫画主页异常");
      backhome();
      return;
    }
  } while (true);

  let aboveY = text("目录").findOne().parent().bounds().bottom + 1;
  let underY = text("批量订阅").findOne().parent().bounds().top - 1;
  //向上找到第1话
  do {
    swipe(deviceRatio.width / 2, aboveY, deviceRatio.width / 2, underY, random(300, 500))
    if (findView("第1话", "textContains")) {
      swipe(deviceRatio.width / 2, aboveY, deviceRatio.width / 2, underY, random(300, 500))
      break;
    }
  } while (true);

  //向下找到第未订阅话
  do {
    if (clickButton(waitView("com.qidian.QDReader:id/imgLock", "id"))) {
      break;
    } else if (findView(mangaend, "textContains")) {
      log("您选择的漫画已经全部订阅完毕");
      backhome();
      return;
    }
    swipe(deviceRatio.width / 2, underY, deviceRatio.width / 2, aboveY, random(300, 500))
  } while (true);

  let num = 0;
  //进入首个漫画待订阅界面
  if (id("com.qidian.QDReader:id/tvSection").findOne(1500).text() === mangaend) {
    if (clickButton(waitView("使用漫画券订阅本话"))) {
      clickButton(waitView("com.qidian.QDReader:id/tv_buy", "id"));
      log("本漫画订阅完毕");
      backhome();
      return;
    }
  } else {
    if (clickButton(waitView("使用漫画券订阅本话"))) {
      num = id("com.qidian.QDReader:id/tv_common_ticket_num").findOne().text().replace(/[^0-9]/ig, "");
      clickButton(waitView("com.qidian.QDReader:id/tv_buy", "id"));
    }
  }

  //循环订阅，直至无漫画券或到达最新章
  for (let k = 0; k < num - 1; k++) {
    sleep(1000)
    click(deviceRatio.width / 2, deviceRatio.height / 2);
    sleep(1000)
    if (clickButton(waitView("com.qidian.QDReader:id/iv_next_chapter", "id"))) {
      if (clickButton(waitView("com.qidian.QDReader:id/iv_section", "id"))) {
        log("你好像进入了已经订阅的章节,重新进入目录查找未订阅章节");
        //向下找到第未订阅话
        do {
          if (clickButton(waitView("com.qidian.QDReader:id/imgLock", "id"))) {
            break;
          } else if (findView(mangaend, "textContains")) {
            log("您选择的漫画已经全部订阅完毕");
            backhome();
            return;
          }
          swipe(deviceRatio.width / 2, underY, deviceRatio.width / 2, aboveY, random(300, 500))
        } while (true);
      } else if (id("com.qidian.QDReader:id/tvSection").findOne(1500).text() === mangaend) {
        clickButton(waitView("使用漫画券订阅本话"));
        clickButton(waitView("com.qidian.QDReader:id/tv_buy", "id"));
        log("本漫画订阅完毕");
        backhome();
        return;
      } else {
        clickButton(waitView("使用漫画券订阅本话"));
        clickButton(waitView("com.qidian.QDReader:id/tv_buy", "id"));
      }
    }
  }
  log("订阅漫画-结束");
  backhome();
}

/**
* 章节卡订阅小说
*/
function subscribeNovelChapter() {
  if (!isSubscribeNovelChapter)
    return false;
  if (isSundaySubscribeNovelChapter && new Date().getDay()) {
    log("非周末不进行章节卡订阅小说操作");
    return false;
  }
  log("使用章节卡订阅小说-开始");
  do {
    if (findView(novelName, "textContains")) {
      break;
    } else {
      console.log("未找到继续下滑")
      sml_move(deviceRatio.width - 50, deviceRatio.height / 3, deviceRatio.width - 50, deviceRatio.height / 4, random(500, 1000))
    }
    sleep(1000);
  } while (true);
  let Novel = waitView(novelName, "textContains");
  let NovelChapter = Novel.parent().parent().findOne(id("com.qidian.QDReader:id/tvChapterName")).text();
  let FirstNovelChapter;
  //进入小说主页唤起目录
  let boolsub = false;
  if (clickButton(Novel)) {
    click(deviceRatio.width / 2, deviceRatio.height / 2);
    sleep(1000);
    if (clickButton(waitView("com.qidian.QDReader:id/layoutCatalogue", "id"))) {
      //去获取第一章章节名-实在无法通过已订阅、免费、已下载三个状态来分辨，主要是已下载的状态无法区分
      let count = 0;
      do {
        let jumpBotton = waitView("layoutChapterLocation", "id");
        let jumpText = jumpBotton.findOne(id("tvChapterLocation")).text();
        clickButton(jumpBotton);
        if (jumpText === "去顶部") {
          FirstNovelChapter = waitView("layoutRoot", "id").findOne(id("txvChapterName")).text();
          boolsub = true;
          break;
        }
        count++;
      } while (count < 5)

      if (boolsub) {
        log("成功获取小说第一章章节名：" + FirstNovelChapter);
        boolsub = false;
      } else {
        log("获取小说第一章章节名失败，为避免脚本运行异常，本次小说订阅将中断");
        backhome()
        return;
      }

      if (clickButton(waitView("com.qidian.QDReader:id/buyChapterButton", "id"))) {
        if (clickButton(waitView("com.qidian.QDReader:id/selection_type_More", "id"))) {
          boolsub = true;
        }
      }
    }

    if (boolsub) {
      log("成功进入批量订阅环节")
      boolsub = false;
    } else {
      log("进入批量订阅环节异常，请检查此小说是否已全订");
      log("为避免脚本运行异常，本次小说订阅将中断");
      backhome()
      return;
    }

    let aboveY = id("btn_filter").findOne().parent().bounds().bottom + 1;
    let underY = id("tip_info_layout").findOne().parent().bounds().top - 1;
    //向上找到第1章
    do {
      swipe(deviceRatio.width / 2, aboveY, deviceRatio.width / 2, underY, random(300, 500))
      if (findView(FirstNovelChapter, "textContains")) {
        swipe(deviceRatio.width / 2, aboveY, deviceRatio.width / 2, underY, random(300, 500))
        break;
      }
    } while (true);

    let FirstBounds = waitView(FirstNovelChapter, "textContains").bounds();
    aboveY = aboveY + (FirstBounds.bottom - FirstBounds.top) / 2;
    underY = underY - (FirstBounds.bottom - FirstBounds.top) / 2;
    //向下找到第未订阅话并获取章节卡数据
    let pwdArray = [];//章节卡类型+每个类型数量
    let subTmpArray = [];//订阅章节卡类型+每个类型数量
    let logNUMBER = 0;//总数
    let x = 0;//10点章节卡数量
    let y = 0;//15点章节卡数量
    let z = 0;//20点章节卡数量
    let tmpTarget;
    do {
      let bounds = id("recycler_list").findOne(1000).bounds();
      let target = textMatches(/(\d+ 点)/).boundsInside(bounds.left, bounds.top, bounds.right, bounds.bottom).findOne(1000);
      if (target != null) {
        log("已找到未订阅章节")
        //获取章节卡余量
        //保险起见，重新获取一下
        target = textMatches(/(\d+ 点)/).boundsInside(bounds.left, bounds.top, bounds.right, bounds.bottom).findOne(1000);
        clickButton(target);
        tmpTarget = target.parent().parent();
        clickButton(textMatches(/(你有+\d+张章节卡可用)/).findOne(1000));

        let pwdTmpArray = [];
        for (let i = 0; i < 4; i++) {
          let ChapterCards = textMatches(/(\d+点章节卡)/).findOnce(i)
          if (ChapterCards != null) {
            let ChapterCardsNum = ChapterCards.parent().findOne(id("descTv"))
            let ChapterCardsName = ChapterCards.text().match(/\d+/g)[0]
            let ChapterCardsNumber = ChapterCardsNum.text().match(/\d+/g)[0]
            pwdTmpArray.push([ChapterCardsName, ChapterCardsNumber])
          } else {
            pwdArray.push(i, pwdTmpArray)
            break;
          }
        }

        //输出当前剩余章节卡数据
        let logTXT = "您共有" + pwdArray[0] + "种章节卡，分别是：";
        for (let i = 0; i < pwdArray[0]; i++) {
          logTXT = logTXT + pwdArray[1][i][0] + "点章节卡共" + pwdArray[1][i][1] + "张；";
          logNUMBER = logNUMBER + pwdArray[1][i][0] * pwdArray[1][i][1];
          if (pwdArray[1][i][0] === "10") {
            x = pwdArray[1][i][1];
          } else if (pwdArray[1][i][0] === "15") {
            y = pwdArray[1][i][1];
          } else if (pwdArray[1][i][0] === "20") {
            z = pwdArray[1][i][1];
          }
        }
        logTXT = logTXT + "总计" + logNUMBER + "点";
        log(logTXT);
        //回到最初批量订阅界面状态
        clickButton(waitView("ivClose", "id"));
        clickButton(target);
        break;
      } else if (findView(NovelChapter, "textContains")) {
        log("您选择的小说已经全部订阅完毕");
        backhome();
        return;
      }
      swipe(deviceRatio.width / 2, underY, deviceRatio.width / 2, aboveY, random(2000, 2500));
    } while (true);

    //每次往下滑动1格，检测是否订阅
    let bounds = tmpTarget.bounds();
    let targetName;//当前选择的章节名_一定存在，否则上一步本函数就该退出
    do {
      let target = textMatches(/(\d+ 点)/).boundsInside(bounds.left, bounds.top, bounds.right, bounds.bottom).findOne(1000);
      if (target != null) {
        log("当前章节未订阅")
        //选择当前章节
        clickButton(target);
        //获取当前选择的章节名
        targetName = target.parent().parent().findOne(id("text_Name")).text();
        //获取当前所需点数
        let CardsNumber = id("text_view_deep").findOne().text().match(/\d+/g)[0];
        //与总数相比较
        if (CardsNumber > logNUMBER) {
          //大于总数时，取消本次选择章节
          clickButton(target);
          //确认订购方案并订阅
          subOK(x, y, z);
          break;
        }
      }
      //检测是否已到达目录最下方，如已到达，需要更换向下选择订阅的方式
      if (findView(NovelChapter, "textContains")) {
        boolsub = true;
        break;
      }

      //当前章节已订阅,或所需总数小于等于总章节数，结束本次循环，继续向下滑动一格选择
      swipe(deviceRatio.width / 2, bounds.bottom, deviceRatio.width / 2, bounds.top, random(2000, 2500));

    } while (true)

    //已滑动到目录最下方，且仍在订购
    if (boolsub) {
      let target = text(targetName).findOne(1000);
      if (target != null) {
        //寻找到了最后选中的章节，取消选择此章节，以配合未找到时的情况，精简代码量，
        target = target.parent().parent();
        clickButton(target);
      } else {
        //未找到时，全列表寻找未订阅章节
        let listBounds = id("recycler_list").findOne(1000).bounds();
        target = textMatches(/(\d+ 点)/).boundsInside(listBounds.left, listBounds.top, listBounds.right, listBounds.bottom).findOne(1000);
        if (target != null) {
          target = target.parent().parent();
        }
      }

      if (target != null) {
        //已有一个未选择的未订阅章节在此界面上，往下挨个寻找并判断订阅
        bounds = target.bounds();
        do {
          let target = textMatches(/(\d+ 点)/).boundsInside(bounds.left, bounds.top, bounds.right, bounds.bottom).findOne(1000);
          if (target != null) {
            log("当前章节未订阅")
            //选择当前章节
            clickButton(target);
            //获取当前所需点数
            let CardsNumber = id("text_view_deep").findOne().text().match(/\d+/g)[0];
            //与总数相比较
            if (CardsNumber > logNUMBER) {
              //大于总数时，取消本次选择章节
              clickButton(target);
              //确认订购方案并订阅
              subOK(x, y, z);
              break;
            }
          }
          //检测是否已到达目录最下方，如已到达，直接订阅
          if (target.findOne(id("text_Name")).text() === NovelChapter) {
            subOK(x, y, z);
            break;
          }

          //将当前检测坐标向下移动一格
          let targetHeight = bounds.bottom - bounds.top;
          bounds.top = bounds.bottom;
          bounds.bottom = bounds.bottom + targetHeight;
        } while (true)
      } else {
        //已全部寻找完毕，直接订阅
        subOK(x, y, z);
      }
    }
    log("章节卡订阅小说-结束");
    backhome();
    return;
  }
}

/**
* 确认章节卡订阅小说
* @param {number} x, y, z, m 10点章节卡数量 x，15点章节卡数量 y,20点章节卡数量 z
*/
function subOK(x, y, z) {
  //重新获取所需总数
  let CardsNumber = id("text_view_deep").findOne().text().match(/\d+/g)[0];
  //进入章节卡选择界面
  clickButton(waitView("action_text", "id"))
  //并将现有所需点数与总数计算差额，选择合适章节卡
  subTmpArray = findMinXYZ(x, y, z, CardsNumber);
  log("本次选择的订阅方案为：" + subTmpArray)
  for (let i = 0; i < 3; i++) {
    let CardsText = subTmpArray[i][0] + "点章节卡";
    let ChapterCards = text(CardsText).findOne(1000);
    if (ChapterCards != null && subTmpArray[i][1] > 0) {
      //选择此类章节卡
      clickButton(ChapterCards);

      let ChapterCardsAdd = ChapterCards.parent().findOne(id("layoutAdd"))
      for (let j = 0; j < subTmpArray[i][1] - 1; j++) {
        clickButton(ChapterCardsAdd);
      }
    } else {
      log("没有" + subTmpArray[i][0] + "点章节卡或不需要使用此章节卡")
      continue;
    }
  }

  //点击确认订购
  clickButton(waitView("rightBtn", "id"));
  return true;
}

/**
 * 计算应使用章节卡种类及数量
 * 此算法存在缺陷，部分情况下会导致浪费，且循环嵌套过多浪费算力，如有大佬，恳求优化
 * @param {number} x, y, z, m 10点章节卡数量 x，15点章节卡数量 y,20点章节卡数量 z,目前所需的最低点数 m
 * @return 实际使用章节卡种类及数量数组
 */
function findMinXYZ(x, y, z, m) {
  let minSum = Infinity;
  let minX, minY, minZ;
  let subTmpArray = [];

  for (let x1 = 0; x1 <= x; x1++) {
    for (let y1 = 0; y1 <= y; y1++) {
      for (let z1 = 0; z1 <= z; z1++) {
        let sum = 10 * x1 + 15 * y1 + 20 * z1;
        if (sum >= m && sum < minSum) {
          minSum = sum;
          minX = x1;
          minY = y1;
          minZ = z1;
        }
      }
    }
  }
  subTmpArray.push([10, minX], [15, minY], [20, minZ]);
  return subTmpArray;
}

/**
 * 执行福利中心任务
 */
function executiveWelfareCenter() {
  if (clickButton(waitView("福利中心"))) {
    let tally = 0;
    do {
      if (tally === 0 || tally % 5 === 0)
        log("缓冲……")
      tally++;
      sleep(1000);
    }
    while (!(className("android.view.View").text("每日视频福利").exists() || text("每日福利").exists()));
    log("已进入福利中心");
    log("———————");
    sleep(5000);
    //每日视频
    watchView();
    log("———————");
    log("即将开始限时任务")
    //限时任务
    //看限时视频
    watchLimitedTimeView(watchLimitedTimeViewPlan);
    //听书任务
    ListeningBooks();
    //开始玩游戏
    playGames();
    //分享指定视频到抖音
    ShareTikTok();
    log("限时任务，已完成");
  } else {
    log("未进入福利中心");
  }
}

/**
 * 看限时视频
 * @param {string} mode 选择刷每日福利视频方案
 */
function watchLimitedTimeView(mode) {
  if (mode === 'Plan1') {
    let k = 0
    do {
      if (text("看视频").exists()) {
        text("看视频").findOne().click()
      } else {
        break;
      }
      sleep(3000);
      if (text("可从这里回到福利页哦").exists()) {
        click("我知道了", 0)
      }
      videoLook()
      sleep(3000);
      if (clickButton(waitView("我知道了"))) {
        k++
      }
      console.log("已完成限时任务", k);
      if (k > 2) {
        break;
      }
    } while (text("看视频").exists());
  } else if (mode === 'Plan2') {
    watchThreeAdm();
    watchOneAdm("Incentive");
    watchOneAdm("Decorations");
  }
}

/**
 * 额外看3次小视频得奖励-10章节卡
 */
function watchThreeAdm() {
  if (isWatchThreeAdm && findView("额外看3次小视频得奖励")) {
    log("额外看3次小视频得奖励-10章节卡 开始");
    for (let k = 0; k < 3; k++) {
      let textView = waitView("额外看3次小视频得奖励");
      let layout = textView.parent();
      let playView = layout.findOne(text("看视频"));
      if (playView) {
        clickButton(playView);
        sleep(2000);
        if (text("可从这里回到福利页哦").exists()) {
          click("我知道了", 0)
        }
        videoLook();
        sleep(2000);
        if (clickButton(waitView("我知道了"))) {
          break;
        }
      } else {
        break;
      }
    }
    sleep(1000);
    log("额外看3次小视频得奖励-10章节卡 结束");
  }

}

/**
 * 额外看1次小视频得奖励-激励碎片、白泽宇航员装扮
 * @param {string} reward 选择看视频奖励
 */
function watchOneAdm(reward) {
  let textView;
  let isWatchOneAdm = false;
  if (reward === 'Incentive' && isObtainIncentive && findView("额外看1次小视频得奖励")) {
    log("额外看1次小视频得奖励-激励碎片 开始");
    textView = waitView("额外看1次小视频得奖励");
    isWatchOneAdm = true;
  } else if (reward === 'Decorations' && isObtainDecorations && findView("看视频获取白泽宇航员装扮")) {
    log("额外看1次小视频得奖励-白泽宇航员装扮 开始");
    textView = waitView("看视频获取白泽宇航员装扮");
    isWatchOneAdm = true;
  } else {
    return;
  }
  if (isWatchOneAdm) {
    let layout = textView.parent();
    let playView = layout.findOne(text("看视频"));
    if (playView) {
      clickButton(playView);
      sleep(2000);
      if (text("可从这里回到福利页哦").exists()) {
        click("我知道了", 0)
      }
      videoLook();
      sleep(2000);
      clickButton(waitView("我知道了"));
    }
  }
  sleep(1000);
  log("额外看1次小视频得奖励-激励碎片、白泽宇航员装扮 结束");
}

/**
 * 听书任务
 */
function ListeningBooks() {
  if (isListeningBooks && findView("当日听书1分钟")) {
    log("听书 开始");
    let ts1 = text("当日听书1分钟").findOne().bounds()
    let x1 = ts1.right;
    let y1 = ts1.bottom;
    ts1.right = Number(ts1.right) + Number(5)
    click(x1, y1)
    sleep(3000);
    if (text("听原创小说").exists()) {
      let abscissa = deviceRatio.width;
      let ordinate = deviceRatio.height;
      let abscissa_new = abscissa / 2
      let ordinate_new = ordinate / 2
      click(abscissa_new, ordinate_new)
      sleep(3000);
      let i = 0;
      do {
        i++
        sleep(1000);
        console.log("已收听", i + "秒")
        if (!(i % 10) && isPreventsDormancy) {
          console.log("防休眠点击")
          click(1, 1)
        }
      } while (i < 70);

      back()
      do {
        log("缓冲中……");
        sleep(1000);
      } while (!text("听原创小说").exists());

      back()
      do {
        log("缓冲中……");
        sleep(1000);
      } while (!text("福利中心").exists());

      back()
      do {
        log("缓冲中……");
        sleep(1000);
      } while (!text("我的账户").exists());

      click("福利中心", 0)
      do {
        log("缓冲中……");
        sleep(1000);
      } while (!(className("android.view.View").text("每日视频福利").exists() || text("每日福利").exists()));

      sleep(1000);
      if (id("ivClose").exists()) {
        id("ivClose").findOne().click();
      } else {
        console.log("未知原因，找不到关闭按钮，请手动关闭")
      }

      sleep(1000);
      if (text("领奖励").exists()) {
        //className("android.widget.TextView").text("领奖励").findOne().click()
        click("领奖励", 0)
        sleep(2000);
        clickButton(waitView("我知道了"));
      }
      log("听书完成");
    } else {
      console.log("听书活动已完成");
    }
  } else if (!isListeningBooks) {
    console.log("未开启听书任务");
  } else {
    log("未找到听书活动");
  }
}

/**
 * 完成玩游戏10分钟任务
 */
function playGames() {
  if (isPlayGame && findView("当日玩游戏10分钟")) {
    log("玩游戏 开始");
    sml_move(deviceRatio.width - 50, deviceRatio.height * 3 / 4, deviceRatio.width - 50, deviceRatio.height / 4, 400, "simulation");
    let textView = waitView("当日玩游戏10分钟");
    let layout = textView.parent();
    let playView = layout.findOne(text("去完成"));
    if (playView) {
      // 计算剩余时间
      textView = layout.findOne(text("/10分钟")).parent();
      views = textView.find(className("TextView"));
      if (isOpenComplexLog)
        views.forEach(o => log(o));
      for (let i = 1; i <= views.length; i++) {
        textView = views[views.length - i];
        if (textView.text().indexOf("/10分钟") !== -1)
          break;
      }
      let gameTimes = parseInt(textView.text());
      if (!gameTimes) {
        log("第一次获取动态玩游戏时间失败，即将尝试第二套方案")
        textView = layout.findOne(text("/10分钟")).parent();
        views = layout.find(className("android.view.View"));
        if (isOpenComplexLog)
          views.forEach(o => log(o));
        for (let i = 1; i <= views.length; i++) {
          gameTimes = parseInt(views[views.length - i].text())
          log(gameTimes)
          if (gameTimes)
            break;
        }

        if (!gameTimes) {
          log("获取动态游戏时长失败或与默认时间相同，本次游戏时长将使用默认值11分钟")
          gameTimes = 0;
        }
      }

      if (!gameTimes)
        gameTimes = 0;
      let playMinutes = Math.max(10 - gameTimes, 1);
      // 玩游戏
      clickButton(playView);
      waitForActivity("com.qidian.QDReader.ui.activity.QDBrowserActivity");
      //部分机型在寻找控件时速度过快，未加载成功时直接执行完了点击事件
      text("新游").findOne(10000);
      if (!clickButton(waitView("新游"))) {
        //进入新游失败则尝试进去在线玩
        clickButton(waitView("在线玩"));
      }
      waitForActivity("com.qidian.QDReader.ui.activity.GameBrowserActivity");
      text("在线玩").findOne(10000);
      clickButton(waitView("在线玩"));
      sleep(1000);
      if (findView("根据国家规定，必须进行实名认证，才可体验游戏服务，为帮助未成年人防沉迷，请填写身份信息认证。")) {
        log("请注意：获取玩游戏奖励必须实名认证，否则无法获取奖励，本次玩游戏任务退出");
        return;
      }
      log("请注意：您已开始玩游戏计时，登录界面即可计算游戏时长，无需点击登录游玩")
      log("请注意：以下为玩游戏时间，时长最长为11分钟，界面不会有操作，部分机型不显示倒计时，请耐心等待");
      for (let i = playMinutes + 1; i > 0; --i) {
        log("剩余 " + i + " min");
        if (isPreventsDormancy) {
          console.log("防休眠点击")
          click(1, 1)
        }
        for (let j = 0; j < 60; ++j) {
          sleep(1100);
          device.wakeUpIfNeeded();
        }
      }
      // 游戏页(无标题) - 新游 - 游戏中心 - 福利中心
      while (!findView("福利中心")) {
        back();
        sleep(1000);
      }
      if (clickButton(waitView("领奖励")))
        clickButton(waitView("我知道了"));
    }
    sleep(1000);
    log("玩游戏 结束");
  } else if (!isPlayGame) {
    log("未开启玩游戏功能");
  } else {
    log("未找到玩游戏活动");
  }

}

/**
* 分享至抖音得章节卡-偶尔的任务，自行在配置项决定是否开启
*/
function ShareTikTok() {
  if (isShareTikTok && findView("分享指定视频到抖音")) {
    log("分享至抖音得章节卡 开始");
    sml_move(deviceRatio.width - 50, deviceRatio.height * 3 / 4, deviceRatio.width - 50, deviceRatio.height / 4, 400, "simulation");
    let textView = waitView("分享指定视频到抖音");
    let layout = textView.parent();
    let playView = layout.findOne(text("去分享"));
    if (playView) {
      clickButton(playView);
      sleep(2000);
      if (text("选择任意一个作品，分享相关视频").exists()) {
        let unfold = className("android.widget.Button").text("分享").findOne(3000);
        if (unfold != null) {
          if (!clickButton(unfold))
            click(unfold.bounds().centerX(), unfold.bounds().centerY());
          log("分享视频准备中，此过程最长将检测15秒……");
          let unfoldFB = id("com.ss.android.ugc.aweme:id/r8+").className("android.widget.TextView").text("发布").findOne(15000);
          if (unfoldFB != null) {
            if (!clickButton(unfoldFB))
              click(unfoldFB.bounds().centerX(), unfoldFB.bounds().centerY());
            let unfoldFH = id("com.ss.android.ugc.aweme:id/u0j").className("android.widget.TextView").text("返回起点读书").findOne(15000);
            if (unfoldFH != null) {
              if (!clickButton(unfoldFH))
                click(unfoldFH.bounds().centerX(), unfoldFH.bounds().centerY());
            }
          }
        }
      }
    }
    if (text("领奖励").exists()) {
      //className("android.widget.TextView").text("领奖励").findOne().click()
      click("领奖励", 0)
      sleep(2000);
      clickButton(waitView("我知道了"));
    }
    sleep(1000);
    log("分享至抖音得章节卡 结束");
  } else if (!isShareTikTok) {
    log("未开启分享至抖音得章节卡任务");
  } else {
    log("未找到分享至抖音得章节卡活动");
  }

}

/**
 * 签到页面任务
 */
function checkinPage() {
  log("———————");
  backhome("书架");
  if (clickButton(waitView("签到"))) {
    back()
    log("已点击签到");
  } else {
    log("已签到过了");
  }
  sleep(3000);
  log("———————");
  log("刷今日福利");
  log("———————");
  //今日福利
  if (text("今日福利").exists() || text("去抽奖").exists() || text("签到福利").exists()) {
    if (text("去抽奖").exists()) {
      click("去抽奖", 0)
      sleep(3000);
      if (textContains("剩余") && ((className("android.view.View").text("抽 奖").exists()) || className("android.view.View").text("看视频抽奖喜+1").exists())) {
        back()
        sleep(1000);
        click("今日福利", 0)
      }
    } else if (text("今日福利").exists()) {
      click("今日福利", 0)
    } else if (text("签到福利").exists()) {
      click("签到福利", 0)
    }

    let tally = 0;
    do {
      sleep(1000);
      if (findView("当前连续签到", "textContains")) {
        break;
      } else {
        if (tally === 0 || tally % 5 === 0)
          log("起点签到页面缓冲中……")
        tally++;
      }
    } while (!textContains("当前连续签到").exists());

    if (textContains("当前连续签到").exists()) {
      let qiandao = textContains("当前连续签到").findOne().text()
      //连签礼包
      log("连签礼包活动")
      if (clickButton(waitView("连签礼包", "textContains"))) {
        back()
        sleep(2000);
        log("连签礼包已领取")
      } else {
        log("连签礼包活动结束")
      }
      log("———————");
      if (isFreeReSignin && clickButton(waitView("免费补签"))) {
        log("有免费补签，将进行补签操作");
        sleep(1000);
        if (clickButton(waitView("看视频，免费补签一次"))) {
          videoLook();
          sleep(1000);
          log("免费补签完成");
        } else if (findView("开启签到提醒，免费补签一次")) {
          log("此类补签不做处理");
          back();
        }
      } else if (isFreeReSignin) {
        log("无需补签");
      }
      log("———————");
      if (textContains("章节卡碎片").exists()) {
        log("签到领章节卡活动");
      } else {
        log("签到翻倍经验活动");
      }
      if (clickButton(waitView("去翻倍"))) {
        videoLook()
        sleep(2000);
        clickButton(waitView("我知道了"));
        if (textContains("章节卡碎片").exists()) {
          log("签到领章节卡活动结束");
        } else {
          log("签到翻倍经验活动结束");
        }
      } else {
        if (textContains("章节卡碎片").exists()) {
          log("签到领章节卡已完成");
        } else {
          log("签到翻倍机会已用完");
        }
      }
      lottery();

      log("———————");
      //周末兑换章节卡
      exchange();
    } else {
      log("———————");
      log("未进入今日福利");
    }
  } else {
    log("———————");
    log("今日福利点击失败");
  }
  log("———————");
  sleep(1000);
}

/**
* 获取遗漏奖励
*/
function getLeakageReward() {
  if (isGetLeakageReward) {
    clickMe(clickMePlan);
    clickButton(waitView("福利中心"));
    let tally = 0;
    do {
      if (tally === 0 || tally % 5 === 0)
        log("缓冲……")
      tally++;
      sleep(1000);
    } while (!(className("android.view.View").text("每日视频福利").exists() || text("每日福利").exists()));
    log("已进入福利中心,即将检测是否遗漏奖励");
    for (let i = 0; i < 6; i++) {
      if (clickButton(waitView("领奖励"))) {
        if (clickButton(waitView("我知道了"))) {
          i = i - 1;
        }
      }
      if (i === 3) {
        sml_move(deviceRatio.width - 50, deviceRatio.height * 3 / 4, deviceRatio.width - 50, deviceRatio.height / 4, 400, "simulation");
      }
    }
    log("检测遗漏奖励完成");
    backhome();
  }
}

/**
 * 清理后台并返回桌面
 * beta.6.1.7.7后此函数加入大量冗余处理，以适配更多机型
 */
function clearRecents() {
  if (isClearRecents) {
    log("清理后台中，请提前后台锁定脚本软件");
    home();
    back();
    sleep(1000);
    recents();
    sleep(1000);
    if (!clickButton(waitView("clearImg", "id"), "Two")) {
      if (!clickButton(waitView("clearAnimView", "id"), "Two")) {
        if (!clickButton(waitView("clearbox", "id"), "Two")) {
          if (!clickButton(textMatches(/(.*清理.*|.*清除.*|.*全部.*|.*关闭.*)/).findOne(2000), "Two")) {
            log("清理后台异常，将启动模糊判断！")
            log("请观察是否有其他异常，如有异常，请在配置项关闭清理后台功能！")
            var arr = [];

            var list = className("FrameLayout").findOne(1000);
            sleep(1000);
            queryList(list, arr);

            for (var k = 0; k < arr.length; k++) {
              if (arr[k].bounds().width === arr[k].bounds().height && arr[k].bounds().centerX() > (deviceRatio.width / 2 - 10) && arr[k].bounds().centerX() < deviceRatio.width / 2 + 10 && arr[k].bounds().centerY() > 0.8 * deviceRatio.height) {
                log("尝试点击：\n" + arr[k]);
                clickButton(arr[k], "Two");
                break;
              }
            }
          }
        }
      }
    }
  }
  home();
}

/**
 * 降低屏幕亮度
 * @param {string} mode 选择降低屏幕亮度方案
 * @param {bool} switchs 开启或关闭亮度，默认 false，关闭屏幕亮度，可选 true，恢复屏幕亮度
 */
function closescreen(mode, switchs) {
  if (mode === "Plan1") {
    if (switchs) {
      device.setBrightness(Brightness[0]);
      device.setBrightnessMode(Brightness[1])
    } else {
      device.setBrightnessMode(0);
      device.setBrightness(0);
    }
  } else if (mode === "Plan2") {
    //如不懂脚本代码，请勿自行切换至此方案
    let w = floaty.rawWindow(
      <frame gravity="center" bg="#000000" />
    );
    w.setSize(device.width, device.height);
    w.setPosition(0, -60 * KY);
    w.setTouchable(false);
    //保持脚本运行
    setInterval(() => { }, 1000);
  }
}

/**
 * 检查是否有网络
 */
function netcheck() {
  if (isNetcheck) {
    let r = http.get("www.baidu.com");
    html = r.body.string();
    let reg = new RegExp('百度一下，你就知道')
    if (reg.test(html)) {
      log("网络正常");
    }
    else {
      log("无网络打开GWIFI联网");
      launch("com.gbcom.gwifi");
      waitForPackage("com.gbcom.gwifi");
      log("GWIFI启动完成");
      sleep(12000);
      home();
      sleep(1000);
    }
  }
}

/**
 * 唤醒并解锁屏幕，检查网络
 */
function wakeupAndLocked() {
  if (isWakeupAndLocked) {
    wakeup();
    unlock();
  }
  netcheck();
}

/**
 * 唤醒屏幕
 */
function wakeup() {
  for (let i = 1; i < 11; i++) {
    if (!device.isScreenOn()) {
      device.wakeUp() // 唤醒设备
      log("第" + i + "次尝试亮屏");
      sleep(1000);
    }
    else if (i == 10) {
      log("亮屏失败退出");
      exit();
    }
    else {
      log("亮屏成功");
      break;
    }
  }
}

/**
 * 判断是否有屏幕锁
 */
function isDeviceLocked() {
  importClass(android.app.KeyguardManager);
  importClass(android.content.Context);
  let km = context.getSystemService(Context.KEYGUARD_SERVICE);
  return km.isKeyguardLocked();
}

/**
 * 密码解锁
 */
function password_input() {
  for (let i = 0; i < lockPassword.length; i++) {
    let p = text(lockPassword[i].toString()).findOne(1000)
    if (p !== null) {
      longClick(p.bounds().centerX(), p.bounds().centerY());
    } else {
      log("您的手机似乎无法获取到输入法的按键控件！")
      log("解锁失败退出脚本");
      engines.stopAllAndToast();
    }
    sleep(100);
  }
  if (!clickButton(waitView("com.android.systemui:id/btn_letter_ok", "id"))) {
    clickButton(textMatches(/(.*回车.*|.*确认.*|.*完成.*|.*结束.*)/).findOne(2000));
  }
  log("解锁成功");
}

/**
 * 滑动解锁
 */
function password_sliding() {
  let pwdPoints = []
  let lockPattern = waitView("lockPatternView", "id");
  if (lockPattern != null) {
    let dx = (lockPattern.bounds().right - lockPattern.bounds().left) / 3;
    let dy = (lockPattern.bounds().bottom - lockPattern.bounds().top) / 3;
    let xStart = lockPattern.bounds().left + dx / 2;
    let yStart = lockPattern.bounds().top + dy / 2;

    //计算出9个点的坐标
    for (let index = 0; index < 9; index++) {
      pwdPoints.push([xStart + index % 3 * dx, yStart + parseInt(index / 3) * dy])
    }
  }
  //根据解锁密码按顺序构造路径点数组
  let pwdArray = []
  for (var i = 0; i < lockPassword.length; i++) {
    pwdArray.push(pwdPoints[parseInt(lockPassword[i].toString()) - 1])
  }
  //滑动解锁
  gesture(1500, pwdArray)

  log("解锁成功");
}

/**
 * 解锁屏幕
 */
function unlock() {
  for (let l = 1; l < 6; l++) {
    if (isDeviceLocked()) {
      sml_move(deviceRatio.width / 2, deviceRatio.height * 4 / 5, deviceRatio.width / 2, deviceRatio.height / 5, 500);
      log("滑动屏幕" + l + "次");
      if (unlockPlan === "Plan1") {
        log("正在尝试密码解锁");
        sleep(2000);
        let mima = className("android.widget.EditText").findOne(1000);
        if (mima != null) {
          let p = text("1").findOne(1000);
          if (p === null)
            clickButton(mima);
          log("即将输入锁屏密码……");
          password_input();
          break;
        }
      } else if (unlockPlan === "Plan2") {
        log("正在尝试图形解锁");
        sleep(2000);
        password_sliding();
      }
    }
    else if (l == 5) {
      log("解锁失败退出脚本");
      engines.stopAllAndToast();
    }
    else {
      log("无需解锁");
      break;
    }
  }
}


//---------------------------------------------------------------------------------------
//调试函数，非必要请勿调用

/**
 * 在控制台输出某个视图及所有子视图
 * @param {UiObject} view 视图
 * @param {number|undefined} level 空格等级
 */
function logView(view, level) {
  if (!level) level = 0;
  let s = "";
  for (let i = 0; i < level; ++i) s += " ";
  log(`${s}${view}`);
  view.children().forEach(v => logView(v, level + 2));
}

/**
 * 在控制台输出当前屏幕所有视图的内容
 * @param {UiObject} child 内部任意一个子视图
 */
function logRootView(child) {
  if (!child) {
    child = classNameContains("").findOnce()
  }

  let pl = 0;
  let pv = child.parent();
  while (pv) {
    pl++;
    child = pv;
    pv = child.parent();
  }
  log(pl);
  logView(child);
}

/**
 * js递归遍历数组获取所有的叶子节点
 */
function queryList(json, arr) {
  for (var i = 0; i < json.childCount(); i++) {
    var sonList = json.child(i);
    if (sonList.childCount() == 0) {
      arr.push(json.child(i));
    } else {
      queryList(sonList, arr);
    }
  }
  return arr;
}

/**
 * 输出当前页面所有子控件
 */
function outputlist() {
  log("即将输出当前页面所有子控件");
  var arr = [];
  var list = className("FrameLayout").findOne();

  queryList(list, arr);

  for (var k = 0; k < arr.length; k++) {
    log("第" + k + "个子控件");
    log("text=" + arr[k].text() + "\n" + "ID=" + arr[k].id() + "\n" + "classname=" + arr[k].className());
    log("desc=" + arr[k].desc() + "\n");
  }
}
