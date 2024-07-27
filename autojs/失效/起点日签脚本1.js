// https://blog.csdn.net/q1424966670/article/details/135627735
"auto" //系统配置初始化
auto.waitFor();
let exchanges = true;
let state = false; //是否执行成功状态
const KX = device.width / 1080; //横坐标比例系数
const KY = device.height / 2340; //纵比例系数
let step=1610* KY;//有活动1610，无活动1500
sleep(3000);
wakeup()
unlock()
device.setBrightnessMode(0);
//device.setBrightness(1);
device.setMusicVolume(0);
clearrecents()
sleep(1000);
//关闭同名脚本
onlyOne();
console.setGlobalLogConfig({ "file": "/sdcard/脚本/Signin/log/log.txt" });
console.show();
sleep(500);
console.setSize(800* KX, 500* KY);
sleep(500);
console.setPosition(0* KX, 1400* KY);
//存储记录初始化
currentTime = new Date();
var currentDate = currentTime.getFullYear() + "."
+ (currentTime.getMonth() + 1) + "."
+ currentTime.getDate()+ " "
+ currentTime.getHours()+ ":"
+ currentTime.getMinutes()+ ":"
+ currentTime.getSeconds();
currentDate.toString();
log("初始化完毕");
log('\n'+"检查当前日期：" + currentDate);
netcheck()
//启动起点读书开始执行脚本功能
launch("com.qidian.QDReader");
waitForPackage("com.qidian.QDReader");
 
text("书架").untilFind();
log("起点读书启动完毕");
console.hide();
sleep(1000);
var btnOk =id("btnOk").findOnce();
if (btnOk != null)
{
    btnOk.click();
    sleep(1000);
}
var imgclose =id("imgClose").findOnce();
if (imgclose != null)
{
    imgclose.click();
    sleep(1000);
}
var qiandao=text("签到").findOne(1000);
if (qiandao!=null)
{
    log("判断是否签到")
    click(qiandao.centerX(), qiandao.centerY());
    toastLog("签到完成！");
    log("判断退出键是否出现")
    var tuichuqiandao=className("android.widget.ImageView").depth(5).findOne(1000);
    if(tuichuqiandao!=null)
    {
    click(tuichuqiandao.bounds().centerX(), tuichuqiandao.bounds().centerY());
    sleep(1000)
    }
    var btnOk =id("btnOk").findOnce();
    if (btnOk != null)
    {
        btnOk.click();
        sleep(1000);
    }
    //奖励翻倍
    backhome();
    state = doubleReward(state);
    //去签到页看视频领点币
    videoCheckIn(state);
    freeReSignin();
    exchange()
    //抽奖
    lottery();
    backhome();
    zuorichang()
    Dailytask()
    home();
    sleep(1000);
    clearrecents()
    sleep(1000);
    lock()
    engines.stopAllAndToast();
}
else
{
    backhome();
    toastLog("您已经签到过了!");
    //奖励翻倍
    state = doubleReward(state);
    //去签到页看视频领点币
    videoCheckIn(state);
    freeReSignin()
    exchange()
    //抽奖
    lottery();
    backhome();
    zuorichang()
    Dailytask()
    home();
    sleep(1000);
    clearrecents()
    sleep(1000);
    lock()
    engines.stopAllAndToast();
}
//做日常
function zuorichang()
{
    toastLog("做日常中");
    Fulicenter()
    AutoRW()
    toastLog("看视频得章节已完成");
    sml_move(540* KX, step* KY, 540* KX, 400* KY, 600);
    sleep(2000);
    monthfuli()
    toastLog("每日福利完成");
}
//关闭广告
function closeAD()
{
text("muteOn").untilFind();
sleep(500);
    var a1= text("观看完视频，可获得奖励").exists();
    var b1= text("观看视频15秒后，可获得奖励").exists();
    if (a1||b1)
    {
        log("广告加载完毕，播放中…");
    }
    var a= text("观看完视频，可获得奖励").findOnce();
    var b= text("观看视频15秒后，可获得奖励").findOnce();
    while (a==null&&b==null)
    {
        sleep(100);
        closeAD();
        break;
    }
    if(b!=null)
    {
        closescreen()
        sleep(20000);
        floaty.closeAll()
        autoclose()
    }
    if(a!=null)
    {
        closescreen()
        sleep(16000);
        floaty.closeAll()
        autoclose()
    }
}
//关闭应用
function killApp()
{
    let packageName = currentPackage();
    app.openAppSetting(packageName);
    sleep(random(1000, 2000));
    text(app.getAppName(packageName)).waitFor();
    let is_sure = textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne();
    if (is_sure.enabled())
    {
        textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne().click();
        sleep(500);
        click(764,2178);
        log(app.getAppName(packageName) + "应用已被关闭");
        sleep(random(1000, 2000));
        back();
    }
    else
    {
        log(app.getAppName(packageName) + "应用不能被正常关闭或不在后台运行");
        back();
        sleep(random(1000, 2000));
    }
}
//自动任务
function AutoRW()
{
    //log("等待进入福利中心…");132,1401,948,1524
    var c1= text("限时彩蛋").exists();
    var d1= text("福利中心").exists();
    if (c1||d1)
    {
        log("已进入福利中心…");
    }
    var c= text("限时彩蛋").findOnce();
    var d= text("福利中心").findOnce();
    while (c==null&&d==null)
    {
        sleep(1000);
        AutoRW();
        break;
    }
    while(c!=null)
        {
            var unfold=className("android.widget.TextView").text("展开").findOne(3000);
            if (unfold!= null)
            {
            click(unfold.bounds().centerX(),unfold.bounds().centerY());
            }
            var sprw=textStartsWith("看第").exists();
            var spfl=text("看视频领福利").exists();
            var clickrw=textStartsWith("看第").findOne(1000);
            var clickp=text("看视频领福利").findOne(1000);
            var e= text("明天再来吧").findOne(1000);
            var f= text("明日再来吧").findOne(1000);
            var g= text('| 今日福利已领完！').findOne(1000);
            if(e!=null||f!=null||g!=null)
            {
                break;
            }
            if (sprw||spfl)
            {
                var e= text("明天再来吧").findOne(1000);
                if(e!=null||f!=null)
                {
                    break;
                }
                if (clickrw!=null)
                {
                    click(clickrw.bounds().centerX(), clickrw.bounds().centerY());
                    //log("点击成功1");
                    closeAD();
                    var get=text("我知道了").findOne(3000);
                    if (get!=null)
                    {
                        click(get.bounds().centerX(), get.bounds().centerY());
                        //log("点击成功2");
                        sleep(2000);
                        AutoRW();
                    }
                }
                if(clickp!=null)
                {
                    click(clickp.bounds().centerX(), clickp.bounds().centerY());
                    //log("点击成功1");
                    closeAD();
                    var get=text("我知道了").findOne(3000);
                    if (get!=null)
                    {
                        click(get.bounds().centerX(), get.bounds().centerY());
                        //log("点击成功2");
                        sleep(2000);
                        AutoRW();
                    }
                }
            }
        }
    var unfold=className("android.widget.TextView").text("展开").findOne(1000);
    if (unfold!= null)
    {
        click(unfold.bounds().centerX(),unfold.bounds().centerY());
    }
    sleep(1000);
}
//检查是否有网络
function netcheck()
{
    var r = http.get("www.baidu.com");
    html = r.body.string();
    var reg = new RegExp('百度一下，你就知道')
    if (reg.test(html))
    {
        toastLog("网络正常");
    }
    else
    {
        toastLog("无网络打开GWIFI联网");
        launch("com.gbcom.gwifi");
        waitForPackage("com.gbcom.gwifi");
        log("GWIFI启动完成");
        sleep(12000);
        home();
        sleep(1000); 
    }
}
//唤醒屏幕
function wakeup()
{
    for(let i = 1;i<11;i++)
    {
        if (!device.isScreenOn())
        {
            device.wakeUp() // 唤醒设备
            log("亮屏"+i+"次");
            sleep(1000);
        }
        else if(i==10)
        {
            log("亮屏失败退出");
            exit();
        }
        else
        {
            log("已亮屏");
            device.keepScreenOn(1200*1000); // 保持亮屏
            break;
        }
    }
}
//判断是否有屏幕锁
function isDeviceLocked()
{
    importClass(android.app.KeyguardManager);
    importClass(android.content.Context);
    var km = context.getSystemService(Context.KEYGUARD_SERVICE);
    return km.isKeyguardLocked();
}
 // 输入密码
function password_input()
{
    var password = "******"//输入你的6位解锁密码
    for(var i = 0; i < password.length; i++)
    {
        var p = text(password[i].toString()).findOne(1000)
        longClick(p.centerX(), p.centerY());
        sleep(100);
    }
    log("解锁成功");
}
//解锁屏幕
function unlock()
{
    for(let l=1;l<6;l++)
    {
        if(isDeviceLocked())
        {
            sml_move(540* KX,1800* KY,600* KX,1000* KY,500);
            log("滑动屏幕"+l+"次");
            var mima=text("输入密码").findOne(2000);
            if(mima!=null)
            {
                log("输入密码");
                password_input();
                break;
            }
        }
        else if(l==5)
        {
            log("解锁失败退出");
            exit();
        }
        else
        {
            log("无需解锁");
            break;
        }
    }
}
//翻倍
function doubleReward(state)
{
    let times = 2;
    while (state && times > 0)
    {
        sleep(600);
        //点击今日奖励翻倍
        let btn = id("btnVideoCheckIn").findOne(2000);
        if (btn) {
            if (btn.findOne(text(".*福利"))) return false;
            toastLog("点击今日奖励翻倍");
            btn.click();
            sleep(600);
            let btnRight = id("btnRight").findOne(1800);
            if (btnRight) {
                btnRight.click();
                log("点击播放");
            }
            closeAD();
            return true;
        }
        else
        {
            btn = idContains("btnToCheckIn").findOne(1500);
            if (btn) {
                toastLog("无双倍奖励，去签到页");
                if (!btn.click()) btn.parent().click();
                sleep(3 * 1000);
                return false;
            }
            if (id("browser_title").text("签到").exists()) {
                toastLog("已到签到页");
                return false;
            }
            times--;
            if (!times) {
                toastLog("重试超限，跳过奖励翻倍任务");
                return false;
            }
            back();
        }
    }
}
//签到页
function videoCheckIn(state)
{
    let times = 6;
    let btn = null;
    while (times-- > 0 && !id("browser_title").text("签到").exists()) {
        if (!times)
        {
            toastLog("重试超限,退出");
            return
        }
        btn = id("btnVideoCheckIn").findOne(1.7 * 1000);
        if (!btn)
        {
            btn = id("btnCheckIn").findOne(1.7 * 1000);
        }
        if (btn)
        {
            if (btn.findOne(textContains("奖励")))
            {
                back();
                continue;
            }
            toastLog("去签到页");
            btn.click();
            sleep(3 * 1000);
        }
        else
        {
            toastLog("找不到按钮，重试");
            back();
            sleep(1000);
        }
    }
    if (!state)
    {
        sleep(1500);
        btns = text("去翻倍").find();
        if (btns.nonEmpty())
        {
            btns.forEach(function(btn)
            {
                toastLog("去翻倍");
                btn.click();
                closeAD();
            });
        }
    }
    toastLog("查找按钮领点币");
    btn = desc("看视频再领起点币，最高10点").findOne(5 * 1000);
    if (btn)
    {
        toastLog("点击看视频领点币");
        btn.click();
        closeAD();
    }
    else
    {
    toastLog("找不到视频按钮，退出任务");
    return;
    }
}
//抽奖
function lottery()
{
    //toastLog("查找抽奖弹窗按钮");
    let bt = descMatches(/立即抽奖|看视频.+|详情||机会\+1|点击抽奖.*|明日再来抽奖哦\~|明天再来/).findOne(3 * 1000);
    if (bt)
    {
        if (!/详情|明/.test(bt.desc()))
        {
            bt.click();
            for (let i = 0; i < 8; i++)
            {
                let bt2 = descMatches(/抽 奖|看视频抽奖喜\+1||明天再来/).findOne(5000);
                if (bt2)
                {
                    if (bt2.desc() == "明天再来")
                    {
                        toastLog("无抽奖机会，退出1");
                        break;
                    }
                    else if (bt2.desc() == "抽 奖")
                    {
                        toastLog("抽奖");
                        click(bt2.bounds().centerX(), bt2.bounds().centerY());
                        sleep(7000);
                    }
                    else if (bt2.desc() == "看视频抽奖喜+1")
                    {
                        for(i=0;i<10;i++)
                        {
                        click(bt2.bounds().centerX(), bt2.bounds().centerY());
                        sleep(1000);
                        var adin= className("android.widget.RelativeLayout").depth(4).findOne(500);
                        if(adin!=null)
                        {
                        closeAD();
                        sleep(4000);
                        break;
                        }
                        }
                    }
                    else
                    {
                        toastLog("无抽奖机会，退出2");
                        break;
                    }
                }
                else
                {
                    toastLog("识别不到控件，退出任务");
                    break;
                }
            }
        }
        else
        {
            toastLog("无抽奖机会，退出3");
        }
    }
    else
    {
        toastLog("识别不到抽奖弹窗按钮，退出任务");
    }
    sleep(1000);
    back();
}
//只允许有一个同名脚本运行
function onlyOne()
{
    let g = engines.myEngine();
    var e = engines.all(),
        n = e.length;
    let r = g.getSource() + "";
    1 < n && e.forEach(e => {
        var n = e.getSource() + "";
        g.id !== e.id && n == r && e.forceStop()
    });
}
//清理后台
function clearrecents()
{
    recents()
sleep(1000);
var clearbox=id("clearbox").findOne(1000);
if (clearbox!=null)
{
    click(clearbox.bounds().centerX(), clearbox.bounds().centerY());
    sleep(1000);
    home();
}
else
{
    home();
}
}
function lock()
{
    var lockscreen=className("android.widget.TextView").desc("一键锁屏,应用在托盘上").findOne(1000);
    if (lockscreen!=null)
    {
        click(lockscreen.bounds().centerX(), lockscreen.bounds().centerY());
        sleep(1000);
    }
}
 
//关闭屏幕
function closescreen()
{
    var w = floaty.rawWindow(
    <frame gravity="center" bg="#000000"/>
    );
    w.setSize(device.width,device.height);
    w.setPosition(0, -60* KY);
    w.setTouchable(false);
    //保持脚本运行
    setInterval(()=>{}, 1000);
}
 
//每月福利
function monthfuli()
{
    //log("等待进入福利广场");
    var f1= text("限时彩蛋").exists();
    var g1= text("福利中心").exists();
    var f= text("限时彩蛋").findOnce();
    var g= text("福利中心").findOnce();
    while (f==null&&g==null)
    {
        sleep(500);
        log("正在进入福利中心");
        monthfuli()
        break;
    }
 
    while(g!=null)
    {
        var kanship=text("看视频").findOne(5000);
        if (kanship!=null)
        {
            click(kanship.bounds().centerX(),kanship.bounds().centerY());
            closeAD();
            var happyget=text("我知道了").findOne(5000);
            if (happyget!=null)
            {
                toastLog("自动点击");
                click(happyget.bounds().centerX(), happyget.bounds().centerY());
                backhome()
                sleep(2000);
                EnterFuli()
            }
        }
        else
        {
            break;
        }
    }
}
//仿真曲线滑动
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
};
 
//仿真随机带曲线滑动
//qx, qy, zx, zy, time 代表起点x,起点y,终点x,终点y,过程耗时单位毫秒
function sml_move(qx, qy, zx, zy, time) {
    var xxy = [time];
    var point = [];
    var dx0 = {
        "x": qx,
        "y": qy
    };
    var dx1 = {
        "x": random(qx - 100, qx + 100),
        "y": random(qy , qy + 50)
    };
    var dx2 = {
        "x": random(zx - 100, zx + 100),
        "y": random(zy , zy + 50),
    };
    var dx3 = {
        "x": zx,
        "y": zy
    };
    for (var i = 0; i < 4; i++) {
        eval("point.push(dx" + i + ")");
    };
    //log(point[3].x)
    for (let i = 0; i < 1; i += 0.08) {
        xxyy = [parseInt(bezier_curves(point, i).x), parseInt(bezier_curves(point, i).y)]
        xxy.push(xxyy);
    }
    //log(xxy);
    gesture.apply(null, xxy);
};
//返回主界面
function backhome()
{
    log("检测是否在主界面");
    for(let i = 1; i< 11; i++)
    {
        var homepage=id("ivSearch").findOne(2000);
        if(homepage!=null)
        {
            log("已在主界面");
            break;
        }
        else if(i==10)
        {
            log("返回主界面失败退出");
            exit();
        }
        else
        {
            back();
            log("正在返回主界面中...");
            sleep(1000);
        }
    }
}
 
//广告自动关闭
function autoclose()
{
    for(let i = 1; i< 11; i++)
    {
        //bounds(45, 150, 135, 243)
        var closead1=bounds(45* KX,150* KY,135* KX,243* KY).findOne(500);
        var closead2=bounds(63* KX, 168* KY, 117* KX, 225* KY).findOne(500);
        if(closead1==null&&closead2==null)//&&
        {
        var signal1=text("签到").untilFind;
        var signal2=text("福利中心").untilFind;
        var signal3=text("我知道了").untilFind;
        if(signal1!=null||signal2!=null||signal3!=null)
        {
        break;
        }
        else
        {
            sleep(2000);
            autoclose()
        }
    }
    else if(i==10)
    {
        log("关闭广告失败退出");
        exit();
    }
    else if (closead1!=null)
    {
        log("点击1退出按钮"+i+"次");
        click(closead1.bounds().centerX(), closead1.bounds().centerY());
        sleep(1000);
    }
    else if (closead2!=null)
    {
        log("点击2退出按钮"+i+"次");
        click(closead2.bounds().centerX(), closead2.bounds().centerY());
        sleep(1000);
    }
    else
    {
    sleep(2000);
    autoclose()
    }
    var keepview=className("android.widget.TextView").text("继续观看").findOne(1000);
    if (keepview!=null)
    {
        click(keepview.bounds().centerX(), keepview.bounds().centerY());
        closescreen()
        sleep(5000);
        floaty.closeAll()
        log("保持观看点击退出");
        autoclose()
    }
    }
}
 
//自动完成阅读任务
function Aread()
{
    let j=0;
    sleep(1000);
    for(let i=1; i<7; i++)
    {
        text("任务书单").untilFind();
        var reading=className("android.widget.Button").text("阅读").findOne(5000);
        if(reading!=null)
        {
            click(reading.centerX(), reading.centerY()+j);
            sleep(3000);
            log("第"+i+"次阅读开始");
            for(let n = 0; n< 6; n++)
            {
                sml_move(900* KX, 1334* KY, 300* KX, 1340* KY, 200)
                sleep(500);
                if(n==0)
                {
                    click(543* KX,1230* KY);
                    sleep(1000);
                    click(146* KX,2217* KY);
                    sleep(1000);
                    for(let m = 0; m< 7; m++)
                    {
                        sml_move(540* KX, 800* KY, 540* KX, 1900* KY, 200);
                    }
                    sleep(1000);
                    click(550* KX,476* KY);
                    var quxiao=text("取消").findOne(1000);
                    if(quxiao!=null)
                    {
                        click(quxiao.bounds().centerX(), quxiao.bounds().centerY());
                    }
                }
                closescreen()
                sleep(20000);
                floaty.closeAll()
                sleep(500);
            }
            log("第"+i+"次阅读结束");
            back();
            sleep(500);
            var quxiao=text("取消").findOne(2000);
            if(quxiao!=null)
            {
                click(quxiao.bounds().centerX(), quxiao.bounds().centerY());
            }
            j+=246;
        }
    }
    backhome()
    sleep(1000);
    EnterFuli()
    sml_move(540* KX, step* KY, 540* KX, 900* KY, 200);
    sleep(5000);
}
 
//自动完成听书任务
function Alisten()
{
    sleep(3000);
    var books=textEndsWith("万字").findOne(3000);
    if(books!=null)
    {
        click(books.bounds().centerX(),books.bounds().centerY());
        sleep(3000);
        var tingbook=id("tvAiAUdio").findOne(1000);
        if(tingbook!=null)
        {
            click(tingbook.bounds().centerX(),tingbook.bounds().centerY());
            sleep(3000);
        }
    }
    else
    {
        click(555,1110);
        sleep(3000);
        var tingbook=id("tvAiAUdio").findOne(1000);
        if(tingbook!=null)
        {
            click(tingbook.bounds().centerX(),tingbook.bounds().centerY());
            sleep(3000);
        }
    }
    for(let i = 1; i< 5; i++)
    {
        var play=id("ivAddBook").findOne(5000);
        if(play!=null)
        {
            var download=id("btnRight").findOne(2000);
            if(download!=null)
            {
                log("等待下载语音包");
                sleep(15000);
            }
        }
        else
        {
            var download=id("btnRight").findOne(2000);
            if(download!=null)
            {
                log("等待下载语音包");
                sleep(15000);
            }
        }
        sleep(2000);
        Imagecompare()
        if(p)
        {
            closescreen()
            log("听书开始");
            sleep(120000);
            log("听书结束");
            floaty.closeAll()
            sleep(500);
            backhome()
            id("ivClose").findOne().click();
            sleep(2000);
            EnterFuli()
            break;
        }
        else
        {
            log("未播放重试");
            click(543* KX,1949* KY);
            sleep(2000);
        }
    }
}
 
//每日任务
function Dailytask()
{
    for(let i = 0; i< 8; i++)
    {
        sleep(3000);
        var tofinish=text("去完成").findOnce(i);
        var gametxt = textMatches(/当日玩游戏\d+分钟/).findOne(1000);
        if(tofinish!=null)
        {
            click(tofinish.bounds().centerX(), tofinish.bounds().centerY());
            sleep(3000);
            var shudan=text("任务书单").findOne(1000);
            var tingshu=id("mTitleTextView").findOne(1000);
            var gamecenter=id("browser_title").text("游戏中心").findOne(1000);
            var huodong=textStartsWith("九剑").findOne(1000);
            var cartoon=id("search").bounds(972* KX,141* KY,1044* KX,213* KY).findOne(1000);
            var mainpage=id("ivSearch").bounds(792* KX,111* KY,912* KX,231* KY).findOne(1000);
            if(mainpage!=null)
            {
                log("跳过订阅任务");
                sleep(1000);
                EnterFuli()
            }
            else if(shudan!=null)
            {
                log("执行阅读任务");
                Aread()
                i=i-1;
            }
            else if(tingshu!=null)
            {
                log("执行听书任务");
                Alisten()
                i=i-1;
            }
            else if(gamecenter!=null)
            {
                if(tofinish.bounds().centerY()==gametxt.bounds().centerY()+9* KY)
                {
                    log("执行游戏任务");
                    playgame()
                    i=i-1;
                }
                else
                {
                    log("跳过充值任务");
                    back();
                    sleep(1000);
                }
            }
            else if(cartoon!=null)
            {
                log("执行漫画任务");
                Acartoon()
                i=i-1;
                }
            else if(huodong!=null)
            {
                log("执行活动任务");
                back();
                sleep(1000);
                i=i-1;
            }
            else
            {
                log("不能确定任务，退出");
                exit;
            }
        }
    }
    getjl()
}
 
//获取奖励
function getjl()
{
    let j=0;
    for(let i=0; i<6; i++)
    {
        var LJL=text("领奖励").findOnce(i);
        if(LJL!=null)
        {
            click(LJL.bounds().centerX(), LJL.bounds().centerY());
            var get=text("我知道了").findOne(5000);
            if (get!=null)
                    {
                        click(get.bounds().centerX(), get.bounds().centerY());
                        i=i-1;
                        j++;
                        log("已领取奖励"+j+"次");
                        sleep(2000);
                    }
        }
        else
        {
            log("已无奖励退出");
            break;
        }
    }
}
 
 
function Fulicenter()
{
    sleep(1000);
    var dianjiwo =id("view_tab_title_title").className("android.widget.TextView").text("我").findOne(1000);
    if (dianjiwo!= null)
    {
        click(dianjiwo.bounds().centerX(),dianjiwo.bounds().centerY());
    }
    sleep(1000);
    var fulizx=text("福利中心").findOne(5000);
    if (fulizx!= null)
    {
        click(fulizx.bounds().centerX(),fulizx.bounds().centerY());
    }
    sleep(3000)
    var tiaoguo=text("跳过教程").findOne(1000);
    if (tiaoguo!= null)
    {
        click(tiaoguo.bounds().centerX(),tiaoguo.bounds().centerY());
    }
    text("每日福利").untilFind;
    var unfold=className("android.widget.TextView").text("展开").findOne(3000);
        if (unfold!= null)
    {
        click(unfold.bounds().centerX(),unfold.bounds().centerY());
    }
    sleep(3000);
}
 
//进入福利中心
function EnterFuli()
{
    sleep(1000);
    var dianjiwo =id("view_tab_title_title").className("android.widget.TextView").text("我").findOne(1000);
    if (dianjiwo!= null)
    {
        click(dianjiwo.bounds().centerX(),dianjiwo.bounds().centerY());
    }
    sleep(1000);
    var fulizx=text("福利中心").findOne(5000);
    if (fulizx!= null)
    {
        click(fulizx.bounds().centerX(),fulizx.bounds().centerY());
    }
    sleep(3000)
    var tiaoguo=text("跳过教程").findOne(1000);
    if (tiaoguo!= null)
    {
        click(tiaoguo.bounds().centerX(),tiaoguo.bounds().centerY());
    }
    text("每日福利").untilFind;
    var unfold=className("android.widget.TextView").text("展开").findOne(3000);
        if (unfold!= null)
    {
        click(unfold.bounds().centerX(),unfold.bounds().centerY());
    }
    sleep(3000);
    sml_move(540* KX, step* KY, 540* KX, 400* KY, 600);
    sleep(3000);
}
 
//图片比对
function Imagecompare()
{
    if (!requestScreenCapture())
        {
        log("请求截图失败");
        exit();
        }
        else
        {
        log("请求截图成功");
        }
    //captureScreen("/sdcard/脚本/Listen.png");
    //var rawimg = images.read("/sdcard/脚本/Listen.png");
    //log("截图成功");
    //ROI区域(x,y,宽，高)
    //var pauseorplay = images.clip(rawimg,438,1848,204,204);
    //images.save(pauseorplay, "/sdcard/脚本/pauseorplay.png");
        var img_small=images.read("/sdcard/脚本/Signin/img/pauseorplay.png");
    //找图
    //在大图片中查找小图片的位置（模块匹配），找到时返回位置坐标(Point),找不到时返回null。
        var img=captureScreen();
        //images.save(img, "/sdcard/脚本/Listen.png");
        //var pauseorplay = images.clip(img,450,1776,174,174);
        //images.save(pauseorplay, "/sdcard/脚本/pauseorplay.png");
        p = findImage(img,img_small,{threshold: 0.6});
    img_small.recycle();
    img.recycle();
}
//看漫画任务
function Acartoon()
{
    //bounds(564, 1220, 1032, 1688)
    //(564, 1220, 1032, 1688)
    id("search").untilFind();
    sleep(3000);
    click(806* KX,1447* KY);
    sleep(2000);
    var lookcartoon=text("立即阅读").findOne(3000);
    if (lookcartoon!= null)
    {
        click(lookcartoon.bounds().centerX(),lookcartoon.bounds().centerY());
        sleep(1000);
        for(let i=1; i<16; i++)
    {
        className("android.view.View").untilFind()
            log("第"+i+"次阅读开始");
            closescreen()
                sleep(20000);
                floaty.closeAll()
                sleep(500);
            log("第"+i+"次阅读结束");
                sml_move(540* KX, 1500* KY, 540* KX, 900* KY, 200)
                sleep(500);
    }
    back();
    sleep(500);
    var buyong=text("不用了").findOne(2000);
    if(buyong!=null)
    {
        click(buyong.bounds().centerX(), buyong.bounds().centerY());
    }
    backhome()
    sleep(1000);
    EnterFuli()
    }
}
//周末兑换章节卡
function exchange() {
    log("兑换章节卡");
    if (!exchanges || new Date().getDay()) {
        log("非周日或者设置不领取");
        return;
    }
    let txt = text("周日兑换章节卡").findOne(2000);
    if (!txt) {
        log("找不到控件，结束");
        return;
    }
    click(txt, 2);
    txt = textMatches(/\d+张碎片可兑换/).findOne(2000);
    let n = txt ? txt.text().match(/\d+/)[0] - "" : 0;
    log("%d张碎片可兑换", n);
    switch (true) {
        case n < 15:
            log("碎片不够15张，结束");
            click(940 * KX, 520 * KY);
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
    click(bt, 1);
    sleep(500);
    bt = desc("兑换").depth("16").findOne(2000);
    click(bt, 0);
    click(920 * KX, 520 * KY);
}
 
function freeReSignin()
{
    textMatches(/当前连续签到.*/).findOne(4000);
    sleep(5000);
    log("查找免费补签");//bounds(45, 483, 1035, 1335)
    var buqian=text("免费补签").findOne(2000);
    if (buqian!=null)
    {
        log("有未补签，进行补签");
        sleep(2000);
        click(buqian.bounds().centerX(), buqian.bounds().centerY());
        sleep(1000);
        click("看视频，免费补签一次", 0);
        closeAD()
        autoclose()
    }
    else
    {
        log("无需补签");
    }
}
 
function playgame()
{
    // 玩游戏
    waitForActivity("com.qidian.QDReader.ui.activity.QDBrowserActivity");
    clickButton(waitView("新游"));
    waitForActivity("com.qidian.QDReader.ui.activity.GameBrowserActivity");
    clickButton(waitView("在线玩"));
    sleep(1000);
    log("保持屏幕常亮");
    device.keepScreenDim();
    closescreen()
    sleep(660000);
    floaty.closeAll()
    log("停止屏幕常亮，游戏挂机结束");
    device.cancelKeepingAwake();
    backhome()
    sleep(1000);
    EnterFuli()
}
/**
 * 根据文字查找按钮并点击
 * @Param {UiObject} view 按钮上的文字所在 view
 * @returns 是否成功点击
 */
function clickButton(view)
{
    log("点击 " + view.text());
    // 查找按钮所在控件
    let btn = view;
    while (btn && !btn.clickable()) {
        btn = btn.parent();
    }
    // 点击
    if (btn) {
        btn.click();
        return true;
    }
    return false;
}
 
/**
 * 查找带有某个文本的控件
 * home.php?mod=space&uid=952169 {string} content 查找文本
 * @param {string} mode 查找方式，默认 text，可选 match
 * @returns 第一个符合条件的控件，不存在返回 undefined
 */
function findView(content, mode) {
    log(`查找控件 ${content}`);
    let find;
    if (mode === 'match') {
        find = textMatches(content);
    } else {
        find = text(content);
    }
    return find && find.exists() ? find.findOnce() : undefined;
}
 
/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @returns 第一个符合条件的控件
 */
function waitView(content) {
    log(`等待控件 ${content}`);
    let view = text(content);
    view.waitFor();
    return view.findOnce();
}