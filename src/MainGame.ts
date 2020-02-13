import { MainScene } from "./MainScene";
declare function require(x: string): any;

//メインのゲーム画面
export class MainGame extends g.E {
	public reset: () => void;
	public setMode: (num: number) => void;

	constructor(scene: MainScene) {
		const tl = require("@akashic-extension/akashic-timeline");
		const timeline = new tl.Timeline(scene);
		const sizeW = 640;
		const sizeH = 360;
		super({ scene: scene, x: 0, y: 0, width: sizeW, height: sizeH, touchable: true });

		const mapSize = 90;
		let px = 0;
		let py = 0;
		let pCoin: g.FrameSprite;
		const values = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
		const maps: g.E[][] = [];

		const mapBase = new g.Pane({
			scene: scene,
			x: 0, y: 0,
			width: mapSize * 3 + 100,
			height: mapSize * 3 + 80
		});
		this.append(mapBase);

		const bg = new g.Sprite({
			scene: scene,
			x: 0, y: 0,
			src: scene.assets["map"]
		});
		mapBase.append(bg);

		//入れ替え用のタッチ範囲
		const touchBase = new g.E({
			scene: scene,
			x: 100,
			y: 80,
			width: mapSize * 3,
			height: mapSize * 3,
			touchable: true
		});
		mapBase.append(touchBase);

		touchBase.pointDown.add(e => {
			if (isStop || !scene.isStart) return;
			px = Math.floor(e.point.x / mapSize);
			py = Math.floor(e.point.y / mapSize);
			const map = maps[py][px];
			pCoin = map.tag as g.FrameSprite;
			cursor.moveTo(map.x, map.y);
			cursor.modified();
		});

		touchBase.pointMove.add(e => {
			if (!pCoin || isStop || !scene.isStart) return;
			const x = e.point.x + e.startDelta.x - (mapSize / 2) + touchBase.x;
			const y = e.point.y + e.startDelta.y - (mapSize / 2) + touchBase.y;
			pCoin.x = x;
			pCoin.y = y;
			pCoin.modified();
		});

		touchBase.pointUp.add(e => {
			if (!pCoin || isStop || !scene.isStart) return;
			const x = Math.floor((e.point.x + e.startDelta.x) / mapSize);
			const y = Math.floor((e.point.y + e.startDelta.y) / mapSize);
			const bkPx = px;
			const bkPy = py;
			let flg = true;
			if (px !== x || py !== y) {
				if (x >= 0 && y >= 0 && x < stageSize[level].x && y < stageSize[level].y) {
					py = y; px = x;

					//移動・入れ替え
					const mapSrc = maps[bkPy][bkPx];
					const mapDst = maps[py][px];
					cursor.moveTo(mapDst.x, mapDst.y);
					[mapSrc.tag, mapDst.tag] = [mapDst.tag, mapSrc.tag];
				} else {
					//削除
					maps[py][px].tag = undefined;
					pCoin.hide();
					coins.push(pCoin);
					scene.playSound("se_miss");
					flg = false;
				}
			}

			maps.forEach(mm => {
				mm.forEach(m => {
					if (m.tag) {
						const coin = m.tag as g.FrameSprite;
						coin.moveTo(m.x, m.y);
					}
				});
			});

			calc(flg);
		});

		//コイン設置フィールド
		for (let y = 0; y < 3; y++) {
			maps[y] = [];
			for (let x = 0; x < 3; x++) {
				const map = new g.E({
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
		const cursor = new g.FilledRect({
			scene: scene,
			width: mapSize + 2,
			height: mapSize + 2,
			cssColor: "yellow",
			opacity: 0.5
		});
		mapBase.append(cursor);

		//合計数表示
		//列
		const labelNumColumns: g.Label[] = [];
		const labelAnsColumns: g.Label[] = [];
		const sprAnsColumns: g.FrameSprite[] = [];
		const ansColumns = [0, 0, 0];
		for (let i = 0; i < 3; i++) {
			let label = new g.Label({
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

			const spr = new g.FrameSprite({
				scene: scene,
				x: i * mapSize + 100 + 5,
				y: 46,
				src: scene.assets["star"] as g.ImageAsset,
				width: 36,
				height: 36,
				frames:[0,1]
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
		const labelNumRows: g.Label[] = [];
		const labelAnsRows: g.Label[] = [];
		const sprAnsRows: g.FrameSprite[] = [];
		const ansRows = [0, 0, 0];
		for (let i = 0; i < 3; i++) {
			let label = new g.Label({
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

			const spr = new g.FrameSprite({
				scene: scene,
				x: 15,
				y: i * mapSize + 126,
				src: scene.assets["star"] as g.ImageAsset,
				width: 36,
				height: 36,
				frames:[0,1]
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

		const handBG = new g.Sprite({
			scene: scene,
			src: scene.assets["hand"],
			x: 420,
			y: 80
		});
		this.append(handBG);
		//コイン選択エリア
		const coinBases: g.E[] = [];

		const coinValues = [1, 5, 10, 50, 100, 500];
		for (let i = 0; i < 6; i++) {
			const spr = new g.E({
				scene: scene,
				x: Math.floor(i / 3) * mapSize + 420,
				y: (i % 3) * mapSize + 80,
				width: mapSize,
				height: mapSize,
				touchable: true
			});
			this.append(spr);
			coinBases[i] = spr;

			spr.pointDown.add(e => {
				if (isStop || !scene.isStart) return;
				//コインを盤面に設置
				const map = maps[py][px];

				if (map.tag) {
					const c = map.tag as g.FrameSprite;
					c.hide();
					coins.push(c);
				}

				const coin = spr.tag as g.FrameSprite;
				this.append(coin);
				timeline.create(coin).moveTo(map.x, map.y, 120);
				coin.modified();
				const value = coinValues[coin.frameNumber];
				values[py][px] = value;
				map.tag = coin;

				//コインを手札にセット
				setCoinBase(i);
				calc(true);
			});
		}

		const setCoinBase = (i: number) => {
			const base = coinBases[i];
			const coin = coins.pop();
			coin.show();
			coin.moveTo(base.x, base.y);
			coin.frameNumber = i;
			coin.modified();
			base.tag = coin;
		};

		//コイン
		const coins: g.FrameSprite[] = [];
		for (let i = 0; i < 16; i++) {
			const spr = new g.FrameSprite({
				scene: scene,
				src: scene.assets["coin"] as g.ImageAsset,
				width: mapSize,
				height: mapSize,
				frames: [0, 1, 2, 3, 4, 5]
			});
			this.append(spr);
			coins[i] = spr;
		}

		//クリア表示ラベル
		const sprClear = new g.Sprite({
			scene: scene,
			src: scene.assets["clear"],
			x: 150,
			y: 150,
			height: 80
		});
		this.append(sprClear);

		//ステージ選択エリア
		const stageBase = new g.E({
			scene: scene
		});
		this.append(stageBase);

		const stageBG = new g.FilledRect({
			scene: scene,
			width: 640,
			height: 360,
			cssColor: "black",
			opacity: 0.8
		});
		stageBase.append(stageBG);

		const labelSlect = new g.Sprite({
			scene: scene,
			src: scene.assets["select"],
			x: 235,
			y: 70
		});
		stageBase.append(labelSlect);

		const stages: g.Sprite[] = [];
		for (let i = 0; i < 3; i++) {
			const stage = new g.Sprite({
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
			stage.pointDown.add(e => {
				if (!scene.isStart) return;
				level = i;
				stageBase.hide();
				createHands();
				initStage();
				scene.playSound("se_select");
			});
		}

		//コインの額の取得
		const getCoinValue = (x: number, y: number): number => {
			if (maps[y][x].tag === undefined) return 0;
			return coinValues[(maps[y][x].tag as g.FrameSprite).frameNumber];
		};

		//計算結果表示
		const calc = (flg: boolean) => {
			let isClear = true;
			let score = 0;
			//列の計算
			for (let x = 0; x < stageSize[level].x; x++) {
				let ans = 0;
				for (let y = 0; y < stageSize[level].y; y++) {
					ans += getCoinValue(x, y);
				}
				const label = labelNumColumns[x];
				label.text = "" + ans;
				label.invalidate();
				if (ansColumns[x] === ans) {
					if (sprAnsColumns[x].state & 1) {
						score += Math.floor(ans * (1 + (level * 0.5)));
						sprAnsColumns[x].show();
					}
					sprAnsColumns[x].frameNumber = 0;
					sprAnsColumns[x].modified();
				} else {
					sprAnsColumns[x].frameNumber = 1;
					sprAnsColumns[x].modified();
					isClear = false;
				}
			}

			//行の計算
			for (let y = 0; y < stageSize[level].y; y++) {
				let ans = 0;
				for (let x = 0; x < stageSize[level].x; x++) {
					ans += getCoinValue(x, y);
				}
				const label = labelNumRows[y];
				label.text = "" + ans;
				label.invalidate();
				if (ansRows[y] === ans) {
					if (sprAnsRows[y].state & 1) {
						score += Math.floor(ans * (1 + (level * 0.5)));
						sprAnsRows[y].show();
					}
					sprAnsRows[y].frameNumber = 0;
					sprAnsRows[y].modified();
				} else {
					sprAnsRows[y].frameNumber = 1;
					sprAnsRows[y].modified();
					isClear = false;
				}
			}

			if (flg) {
				if (score > 0) {
					scene.addScore(score);
					scene.playSound("se_coin");
				} else {
					scene.playSound("se_move");
				}
			}

			//全て揃っている場合
			if (isClear) {
				isStop = true;

				timeline.create().wait(150).call(() => {
					this.append(sprClear);
					sprClear.show();

					maps.forEach(mm => {
						mm.forEach(m => {
							if (m.tag) {
								const c = m.tag as g.FrameSprite;
								timeline.create(c).scaleTo(0, 1, 100).scaleTo(1, 1, 100);
							}
						});
					});
				}).wait(1350).call(() => {
					sprClear.hide();
					if (level < 2) level++;

					maps.forEach(mm => {
						mm.forEach(m => {
							if (m.tag) {
								const c = m.tag as g.FrameSprite;
								c.hide();
							}
						});
					});

					timeline.create(mapBase).moveTo(0, 360, 150).call(() => {
						mapBase.y = -360;
						mapBase.modified();
						createHands();
						initStage();
					}).moveTo(0, 0, 150).call(() => {
						scene.playSound("se_select");
					});
				});

				scene.playSound("se_clear");
			}
		};

		let isStop = false;
		let level = 0;
		let stageCnt = 0;
		const stageSize = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }];

		const createHands = () => {
			for (let y = 0; y < 3; y++) {
				for (let x = 0; x < 3; x++) {
					if (maps[y][x].tag) {
						const coin = maps[y][x].tag as g.FrameSprite;
						coins.push(coin);
						maps[y][x].tag = undefined;
					}
				}
			}

			coinBases.forEach(e => {
				if (e.tag) {
					const coin = e.tag as g.FrameSprite;
					coins.push(coin);
				}
			});

			//コインを手札にセット
			coins.forEach(e => e.hide());
			for (let i = 0; i < coinBases.length; i++) {
				setCoinBase(i);
			}
		};

		const initStage = () => {
			isStop = false;

			const size = stageSize[level];
			mapBase.resizeTo(mapSize * size.x + 100, mapSize * size.y + 80);
			mapBase.modified();

			//問題作成
			const answers = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
			const minArr = [100, 300, 500];
			const maxArr = [1000, 1000, 1000];
			while (true) {
				let total = 0;
				for (let y = 0; y < 3; y++) {
					for (let x = 0; x < 3; x++) {
						if (x < stageSize[level].x && y < stageSize[level].y) {
							answers[y][x] = coinValues[scene.random.get(0, 5)];
							total += answers[y][x];
						} else {
							answers[y][x] = 0;
						}
					}
				}
				if (minArr[level] <= total && maxArr[level] > total) break;
			}

			//列の計算
			for (let x = 0; x < 3; x++) {
				let ans = 0;
				for (let y = 0; y < 3; y++) {
					ans += answers[y][x];
				}
				const label = labelAnsColumns[x];
				ansColumns[x] = ans;
				label.text = "" + ans;
				label.invalidate();
				labelNumColumns[x].text = "0";
				labelNumColumns[x].invalidate();
				sprAnsColumns[x].hide();
			}

			//行の計算
			for (let y = 0; y < 3; y++) {
				let ans = 0;
				for (let x = 0; x < 3; x++) {
					ans += answers[y][x];
				}
				const label = labelAnsRows[y];
				ansRows[y] = ans;
				label.text = "" + ans;
				label.invalidate();
				labelNumRows[y].text = "0";
				labelNumRows[y].invalidate();
				sprAnsRows[y].hide();
			}

			px = 0;
			py = 0;
			const map = maps[py][px];
			cursor.moveTo(map.x, map.y);
			cursor.modified();

			stageCnt++;

			scene.labelStage.text = "" + stageCnt;
			scene.labelStage.invalidate();
			scene.labelLevel.text = "" + (level + 1);
			scene.labelLevel.invalidate();
		};

		//リセット
		this.reset = () => {
			isStop = true;
			createHands();

			px = 0;
			py = 0;
			const map = maps[py][px];
			cursor.moveTo(map.x, map.y);
			cursor.modified();

			sprClear.hide();

			this.append(stageBase);
			stageBase.show();

			stageCnt = 0;

			scene.labelStage.text = "-";
			scene.labelStage.invalidate();
			scene.labelLevel.text = "-";
			scene.labelLevel.invalidate();
		};

	}
}
