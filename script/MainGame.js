"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//メインのゲーム画面
var MainGame = /** @class */ (function (_super) {
    __extends(MainGame, _super);
    function MainGame(scene) {
        var _this = this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(scene);
        var sizeW = 640;
        var sizeH = 360;
        _this = _super.call(this, { scene: scene, x: 0, y: 0, width: sizeW, height: sizeH, touchable: true }) || this;
        var mapSize = 90;
        var px = 0;
        var py = 0;
        var pCoin;
        var values = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        var maps = [];
        var mapBase = new g.Pane({
            scene: scene,
            x: 0, y: 0,
            width: mapSize * 3 + 100,
            height: mapSize * 3 + 80
        });
        _this.append(mapBase);
        var bg = new g.Sprite({
            scene: scene,
            x: 0, y: 0,
            src: scene.assets["map"]
        });
        mapBase.append(bg);
        //入れ替え用のタッチ範囲
        var touchBase = new g.E({
            scene: scene,
            x: 100,
            y: 80,
            width: mapSize * 3,
            height: mapSize * 3,
            touchable: true
        });
        mapBase.append(touchBase);
        touchBase.pointDown.add(function (e) {
            if (isStop || !scene.isStart)
                return;
            px = Math.floor(e.point.x / mapSize);
            py = Math.floor(e.point.y / mapSize);
            var map = maps[py][px];
            pCoin = map.tag;
            cursor.moveTo(map.x, map.y);
            cursor.modified();
        });
        touchBase.pointMove.add(function (e) {
            if (!pCoin || isStop || !scene.isStart)
                return;
            var x = e.point.x + e.startDelta.x - (mapSize / 2) + touchBase.x;
            var y = e.point.y + e.startDelta.y - (mapSize / 2) + touchBase.y;
            pCoin.x = x;
            pCoin.y = y;
            pCoin.modified();
        });
        touchBase.pointUp.add(function (e) {
            if (!pCoin || isStop || !scene.isStart)
                return;
            var x = Math.floor((e.point.x + e.startDelta.x) / mapSize);
            var y = Math.floor((e.point.y + e.startDelta.y) / mapSize);
            var bkPx = px;
            var bkPy = py;
            var flg = true;
            if (px !== x || py !== y) {
                if (x >= 0 && y >= 0 && x < stageSize[level].x && y < stageSize[level].y) {
                    py = y;
                    px = x;
                    //移動・入れ替え
                    var mapSrc = maps[bkPy][bkPx];
                    var mapDst = maps[py][px];
                    cursor.moveTo(mapDst.x, mapDst.y);
                    _a = [mapDst.tag, mapSrc.tag], mapSrc.tag = _a[0], mapDst.tag = _a[1];
                }
                else {
                    //削除
                    maps[py][px].tag = undefined;
                    pCoin.hide();
                    coins.push(pCoin);
                    scene.playSound("se_miss");
                    flg = false;
                }
            }
            maps.forEach(function (mm) {
                mm.forEach(function (m) {
                    if (m.tag) {
                        var coin = m.tag;
                        coin.moveTo(m.x, m.y);
                    }
                });
            });
            calc(flg);
            var _a;
        });
        //コイン設置フィールド
        for (var y = 0; y < 3; y++) {
            maps[y] = [];
            for (var x = 0; x < 3; x++) {
                var map = new g.E({
                    scene: scene,
                    x: x * mapSize + 100,
                    y: y * mapSize + 80,
                    width: mapSize - 2,
                    height: mapSize - 2
                });
                mapBase.append(map);
                maps[y][x] = map;
            }
        }
        //カーソル
        var cursor = new g.FilledRect({
            scene: scene,
            width: mapSize + 2,
            height: mapSize + 2,
            cssColor: "yellow",
            opacity: 0.5
        });
        mapBase.append(cursor);
        //合計数表示
        //列
        var labelNumColumns = [];
        var labelAnsColumns = [];
        var sprAnsColumns = [];
        var ansColumns = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
            var label = new g.Label({
                scene: scene,
                font: scene.numFont,
                fontSize: 30,
                text: "",
                x: i * mapSize + 100,
                y: 10,
                width: mapSize - 5,
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            mapBase.append(label);
            labelAnsColumns.push(label);
            var spr = new g.FrameSprite({
                scene: scene,
                x: i * mapSize + 100 + 5,
                y: 46,
                src: scene.assets["star"],
                width: 36,
                height: 36,
                frames: [0, 1]
            });
            mapBase.append(spr);
            sprAnsColumns.push(spr);
            spr.hide();
            label = new g.Label({
                scene: scene,
                font: scene.numFont,
                fontSize: 20,
                text: "",
                x: i * mapSize + 100,
                y: 55,
                width: mapSize - 5,
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            mapBase.append(label);
            labelNumColumns.push(label);
        }
        //行
        var labelNumRows = [];
        var labelAnsRows = [];
        var sprAnsRows = [];
        var ansRows = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
            var label = new g.Label({
                scene: scene,
                font: scene.numFont,
                fontSize: 30,
                text: "",
                x: 0,
                y: i * mapSize + 90,
                width: 100,
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            mapBase.append(label);
            labelAnsRows.push(label);
            var spr = new g.FrameSprite({
                scene: scene,
                x: 15,
                y: i * mapSize + 126,
                src: scene.assets["star"],
                width: 36,
                height: 36,
                frames: [0, 1]
            });
            mapBase.append(spr);
            sprAnsRows.push(spr);
            spr.hide();
            label = new g.Label({
                scene: scene,
                font: scene.numFont,
                fontSize: 20,
                text: "",
                x: 0,
                y: i * mapSize + 135,
                width: 100,
                textAlign: g.TextAlign.Right, widthAutoAdjust: false
            });
            mapBase.append(label);
            labelNumRows.push(label);
        }
        var handBG = new g.Sprite({
            scene: scene,
            src: scene.assets["hand"],
            x: 420,
            y: 80
        });
        _this.append(handBG);
        //コイン選択エリア
        var coinBases = [];
        var coinValues = [1, 5, 10, 50, 100, 500];
        var _loop_1 = function (i) {
            var spr = new g.E({
                scene: scene,
                x: Math.floor(i / 3) * mapSize + 420,
                y: (i % 3) * mapSize + 80,
                width: mapSize,
                height: mapSize,
                touchable: true
            });
            this_1.append(spr);
            coinBases[i] = spr;
            spr.pointDown.add(function (e) {
                if (isStop || !scene.isStart)
                    return;
                //コインを盤面に設置
                var map = maps[py][px];
                if (map.tag) {
                    var c = map.tag;
                    c.hide();
                    coins.push(c);
                }
                var coin = spr.tag;
                _this.append(coin);
                timeline.create(coin).moveTo(map.x, map.y, 120);
                coin.modified();
                var value = coinValues[coin.frameNumber];
                values[py][px] = value;
                map.tag = coin;
                //コインを手札にセット
                setCoinBase(i);
                calc(true);
            });
        };
        var this_1 = this;
        for (var i = 0; i < 6; i++) {
            _loop_1(i);
        }
        var setCoinBase = function (i) {
            var base = coinBases[i];
            var coin = coins.pop();
            coin.show();
            coin.moveTo(base.x, base.y);
            coin.frameNumber = i;
            coin.modified();
            base.tag = coin;
        };
        //コイン
        var coins = [];
        for (var i = 0; i < 16; i++) {
            var spr = new g.FrameSprite({
                scene: scene,
                src: scene.assets["coin"],
                width: mapSize,
                height: mapSize,
                frames: [0, 1, 2, 3, 4, 5]
            });
            _this.append(spr);
            coins[i] = spr;
        }
        //クリア表示ラベル
        var sprClear = new g.Sprite({
            scene: scene,
            src: scene.assets["clear"],
            x: 150,
            y: 150,
            height: 80
        });
        _this.append(sprClear);
        //ステージ選択エリア
        var stageBase = new g.E({
            scene: scene
        });
        _this.append(stageBase);
        var stageBG = new g.FilledRect({
            scene: scene,
            width: 640,
            height: 360,
            cssColor: "black",
            opacity: 0.8
        });
        stageBase.append(stageBG);
        var labelSlect = new g.Sprite({
            scene: scene,
            src: scene.assets["select"],
            x: 235,
            y: 70
        });
        stageBase.append(labelSlect);
        var stages = [];
        var _loop_2 = function (i) {
            var stage = new g.Sprite({
                scene: scene,
                x: 190 * i + 50,
                y: 120,
                src: scene.assets["stage"],
                srcX: 160 * i,
                width: 160,
                touchable: true
            });
            stages.push(stage);
            stageBase.append(stage);
            stage.pointDown.add(function (e) {
                if (!scene.isStart)
                    return;
                level = i;
                stageBase.hide();
                createHands();
                initStage();
                scene.playSound("se_select");
            });
        };
        for (var i = 0; i < 3; i++) {
            _loop_2(i);
        }
        //コインの額の取得
        var getCoinValue = function (x, y) {
            if (maps[y][x].tag === undefined)
                return 0;
            return coinValues[maps[y][x].tag.frameNumber];
        };
        //計算結果表示
        var calc = function (flg) {
            var isClear = true;
            var score = 0;
            //列の計算
            for (var x = 0; x < stageSize[level].x; x++) {
                var ans = 0;
                for (var y = 0; y < stageSize[level].y; y++) {
                    ans += getCoinValue(x, y);
                }
                var label = labelNumColumns[x];
                label.text = "" + ans;
                label.invalidate();
                if (ansColumns[x] === ans) {
                    if (sprAnsColumns[x].state & 1) {
                        score += Math.floor(ans * (1 + (level * 0.5)));
                        sprAnsColumns[x].show();
                    }
                    sprAnsColumns[x].frameNumber = 0;
                    sprAnsColumns[x].modified();
                }
                else {
                    sprAnsColumns[x].frameNumber = 1;
                    sprAnsColumns[x].modified();
                    isClear = false;
                }
            }
            //行の計算
            for (var y = 0; y < stageSize[level].y; y++) {
                var ans = 0;
                for (var x = 0; x < stageSize[level].x; x++) {
                    ans += getCoinValue(x, y);
                }
                var label = labelNumRows[y];
                label.text = "" + ans;
                label.invalidate();
                if (ansRows[y] === ans) {
                    if (sprAnsRows[y].state & 1) {
                        score += Math.floor(ans * (1 + (level * 0.5)));
                        sprAnsRows[y].show();
                    }
                    sprAnsRows[y].frameNumber = 0;
                    sprAnsRows[y].modified();
                }
                else {
                    sprAnsRows[y].frameNumber = 1;
                    sprAnsRows[y].modified();
                    isClear = false;
                }
            }
            if (flg) {
                if (score > 0) {
                    scene.addScore(score);
                    scene.playSound("se_coin");
                }
                else {
                    scene.playSound("se_move");
                }
            }
            //全て揃っている場合
            if (isClear) {
                isStop = true;
                timeline.create().wait(150).call(function () {
                    _this.append(sprClear);
                    sprClear.show();
                    maps.forEach(function (mm) {
                        mm.forEach(function (m) {
                            if (m.tag) {
                                var c = m.tag;
                                timeline.create(c).scaleTo(0, 1, 100).scaleTo(1, 1, 100);
                            }
                        });
                    });
                }).wait(1350).call(function () {
                    sprClear.hide();
                    if (level < 2)
                        level++;
                    maps.forEach(function (mm) {
                        mm.forEach(function (m) {
                            if (m.tag) {
                                var c = m.tag;
                                c.hide();
                            }
                        });
                    });
                    timeline.create(mapBase).moveTo(0, 360, 150).call(function () {
                        mapBase.y = -360;
                        mapBase.modified();
                        createHands();
                        initStage();
                    }).moveTo(0, 0, 150).call(function () {
                        scene.playSound("se_select");
                    });
                });
                scene.playSound("se_clear");
            }
        };
        var isStop = false;
        var level = 0;
        var stageCnt = 0;
        var stageSize = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }];
        var createHands = function () {
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    if (maps[y][x].tag) {
                        var coin = maps[y][x].tag;
                        coins.push(coin);
                        maps[y][x].tag = undefined;
                    }
                }
            }
            coinBases.forEach(function (e) {
                if (e.tag) {
                    var coin = e.tag;
                    coins.push(coin);
                }
            });
            //コインを手札にセット
            coins.forEach(function (e) { return e.hide(); });
            for (var i = 0; i < coinBases.length; i++) {
                setCoinBase(i);
            }
        };
        var initStage = function () {
            isStop = false;
            var size = stageSize[level];
            mapBase.resizeTo(mapSize * size.x + 100, mapSize * size.y + 80);
            mapBase.modified();
            //問題作成
            var answers = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
            var minArr = [100, 300, 500];
            var maxArr = [1000, 1000, 1000];
            while (true) {
                var total = 0;
                for (var y = 0; y < 3; y++) {
                    for (var x = 0; x < 3; x++) {
                        if (x < stageSize[level].x && y < stageSize[level].y) {
                            answers[y][x] = coinValues[scene.random.get(0, 5)];
                            total += answers[y][x];
                        }
                        else {
                            answers[y][x] = 0;
                        }
                    }
                }
                if (minArr[level] <= total && maxArr[level] > total)
                    break;
            }
            //列の計算
            for (var x = 0; x < 3; x++) {
                var ans = 0;
                for (var y = 0; y < 3; y++) {
                    ans += answers[y][x];
                }
                var label = labelAnsColumns[x];
                ansColumns[x] = ans;
                label.text = "" + ans;
                label.invalidate();
                labelNumColumns[x].text = "0";
                labelNumColumns[x].invalidate();
                sprAnsColumns[x].hide();
            }
            //行の計算
            for (var y = 0; y < 3; y++) {
                var ans = 0;
                for (var x = 0; x < 3; x++) {
                    ans += answers[y][x];
                }
                var label = labelAnsRows[y];
                ansRows[y] = ans;
                label.text = "" + ans;
                label.invalidate();
                labelNumRows[y].text = "0";
                labelNumRows[y].invalidate();
                sprAnsRows[y].hide();
            }
            px = 0;
            py = 0;
            var map = maps[py][px];
            cursor.moveTo(map.x, map.y);
            cursor.modified();
            stageCnt++;
            scene.labelStage.text = "" + stageCnt;
            scene.labelStage.invalidate();
            scene.labelLevel.text = "" + (level + 1);
            scene.labelLevel.invalidate();
        };
        //リセット
        _this.reset = function () {
            isStop = true;
            createHands();
            px = 0;
            py = 0;
            var map = maps[py][px];
            cursor.moveTo(map.x, map.y);
            cursor.modified();
            sprClear.hide();
            _this.append(stageBase);
            stageBase.show();
            stageCnt = 0;
            scene.labelStage.text = "-";
            scene.labelStage.invalidate();
            scene.labelLevel.text = "-";
            scene.labelLevel.invalidate();
        };
        return _this;
    }
    return MainGame;
}(g.E));
exports.MainGame = MainGame;
