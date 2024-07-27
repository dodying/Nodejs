/* eslint-disable no-undef */
// https://easydoc.net/doc/39405522/qhmgVc4G/uE9IVfHQ
// https://easydoc.net/s/64330161/uw2FUUiw/UAvHrchT
// https://docs.hamibot.com/reference/coordinatesBasedAutomation/

'auto';

const appName = 'com.kuangxiangciweimao.novel';
const getViewRatioPlan = 'Plan2';

let xRaw, yRaw, brightnessMode, brightness, battery;
let count = 1;
const start = new Date();

function main() {
  console.time('总共耗时');
  setScreenMetrics(1440, 2560);
  brightnessMode = device.getBrightnessMode();
  brightness = device.getBrightness();
  battery = device.getBattery();

  device.setBrightnessMode(0);
  device.setBrightness(9);

  console.show(true);
  // console.setPosition(0, device.height - 800);
  // console.setSize(device.width - 100, 600);
  const deviceRatio = getViewRatio(getViewRatioPlan);
  console.setPosition(0, deviceRatio.height / 1.8);
  console.setSize(deviceRatio.width / 2, deviceRatio.width / 2.5);

  events.observeKey();
  events.onKeyDown('volume_down', onexit);

  const window = floaty.rawWindow('<frame id="action" gravity="center" bg="#77ff0000" />');
  window.setSize(-1, 400);
  window.setPosition(0, device.height - 400);
  window.action.on('click', onexit);

  console.log('打开起点');
  launch(appName);
  waitForPackage(appName);

  console.log('开始阅读');
  xRaw = parseInt(device.width / 2 - 100, 10);
  yRaw = parseInt(device.height / 2 - 100, 10);
  setTimeout(read, random(3000, 5000));
}

function read() {
  // 模拟一段仿生学滑屏曲线手势，当然您也可以直接一段粗暴的swipe滑动替代
  const x1 = random(xRaw, xRaw + 200);
  const y1 = random(yRaw, yRaw + 200);
  const x2 = x1 + random(-4, -2);
  const y2 = y1 + random(-8, -3);
  const x3 = x2 + random(-15, -10);
  const y3 = y2 + random(-10, -8);
  const x4 = x3 + random(-60, -30);
  const y4 = y3 + random(-5, 0);
  const x5 = x4 + random(-100, -60);
  const y5 = y4 + random(0, 5);
  const x6 = x5 + random(-150, -80);
  const y6 = y5 + random(8, 15);
  const passed = (new Date() - start) / 1000;
  const h = parseInt(passed / 3600, 10);
  const m = parseInt((passed % 3600) / 60, 10);
  const s = parseInt((passed % 3600) % 60, 10);
  console.log(`翻页x${count}`, `${h}h ${m}m ${s}s`); // new Date().toLocaleTimeString()
  gesture(random(360, 500), [x1, y1], [x2, y2], [x3, y3], [x4, y4], [x5, y5], [x6, y6]);
  count = count + 1;
  setTimeout(read, random(20000, 25000));
}
function onexit() {
  console.log('脚本已停止');
  console.timeEnd('总共耗时');
  console.log('总共耗电:', battery - device.getBattery());
  launch('org.autojs.autoxjs.v6');
  device.setBrightnessMode(brightnessMode);
  device.setBrightness(brightness);
  exit();
}
function getViewRatio(mode) {
  const Ratio = {};
  if (mode === 'Plan1') {
    Ratio.height = device.height;
    Ratio.width = device.width;
  } else if (mode === 'Plan2') {
    const AndroidConnect = id('android:id/content').findOne(1000);
    Ratio.height = AndroidConnect.bounds().bottom;
    Ratio.width = AndroidConnect.bounds().right;
  }

  if (Object.keys(Ratio).length === 0) {
    log('请注意：获取屏幕分辨率失败，后续操作时脚本随时崩溃');
  } else {
    log(`屏幕分辨率为：${Ratio.width}*${Ratio.height}`);
  }
  return Ratio;
}

auto.waitFor();
main();
