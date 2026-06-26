/**
 * UI 预制体与场景 JSON 生成器
 * 基于 Cocos Creator 3.8.x 序列化格式
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CLIENT_DIR = path.join(__dirname, '..', 'client');
const UI_PREFAB_DIR = path.join(CLIENT_DIR, 'assets', 'prefabs', 'ui');
const GAME_PREFAB_DIR = path.join(CLIENT_DIR, 'assets', 'prefabs', 'game');
const SCENE_DIR = path.join(CLIENT_DIR, 'assets', 'scenes');

const SCRIPT_UUIDS = {
  BootSceneCtrl: 'a47c985b-f77c-4a00-a9c5-054d744af5d6',
  TitleSceneCtrl: '3123c334-8968-46d3-8227-967978fd646f',
  LevelMapSceneCtrl: '5b853fbf-6939-4cc5-a374-11fd2b065bd5',
  GameSceneCtrl: 'eb6d4b3f-6e49-48da-95a7-287ff633ddfb'
};

function uuid() {
  return crypto.randomUUID();
}

function fileId() {
  const u = uuid().replace(/-/g, '');
  return `${u.slice(0, 22)}/${u.slice(22)}`;
}

function color(r, g, b, a = 255) {
  return { __type__: 'cc.Color', r, g, b, a };
}

function vec2(x, y) {
  return { __type__: 'cc.Vec2', x, y };
}

function vec3(x, y, z = 0) {
  return { __type__: 'cc.Vec3', x, y, z };
}

function quat(x = 0, y = 0, z = 0, w = 1) {
  return { __type__: 'cc.Quat', x, y, z, w };
}

function euler(x = 0, y = 0, z = 0) {
  return { __type__: 'cc.Vec3', x, y, z };
}

function size(w, h) {
  return { __type__: 'cc.Size', width: w, height: h };
}

class BaseBuilder {
  constructor() {
    this.objects = [];
  }

  add(obj) {
    this.objects.push(obj);
    return this.objects.length - 1;
  }

  addNode({ name, parent = null, children = [], pos = vec3(0, 0), rot = quat(), eulerAngles = euler(), scale = vec3(1, 1, 1) }) {
    return this.add({
      __type__: 'cc.Node',
      _name: name,
      _objFlags: 0,
      __editorExtras__: {},
      _parent: parent !== null ? { __id__: parent } : null,
      _children: children.map(id => ({ __id__: id })),
      _active: true,
      _components: [],
      _prefab: null,
      _lpos: pos,
      _lrot: rot,
      _lscale: scale,
      _mobility: 0,
      _layer: 1073741824,
      _euler: eulerAngles,
      _id: ''
    });
  }

  addChild(parentId, { name, pos = vec3(0, 0), rot = quat(), eulerAngles = euler(), scale = vec3(1, 1, 1) }) {
    const childId = this.addNode({ name, parent: parentId, pos, rot, eulerAngles, scale });
    this.objects[parentId]._children.push({ __id__: childId });
    return childId;
  }

  setComponents(nodeId, nodeSize, componentIds) {
    const uiTransformId = this.addUITransform(nodeId, nodeSize);
    this.objects[nodeId]._components = [uiTransformId, ...componentIds].map(id => ({ __id__: id }));
  }

  addUITransform(nodeId, contentSize, anchor = vec2(0.5, 0.5)) {
    return this.add({
      __type__: 'cc.UITransform',
      _name: '',
      _objFlags: 0,
      __editorExtras__: {},
      node: { __id__: nodeId },
      _enabled: true,
      __prefab: { __id__: this.addCompPrefabInfo() },
      _contentSize: contentSize,
      _anchorPoint: anchor,
      _id: ''
    });
  }

  addSprite(nodeId, colorValue, type = 0, sizeMode = 0) {
    return this.add({
      __type__: 'cc.Sprite',
      _name: '',
      _objFlags: 0,
      __editorExtras__: {},
      node: { __id__: nodeId },
      _enabled: true,
      __prefab: { __id__: this.addCompPrefabInfo() },
      _customMaterial: null,
      _srcBlendFactor: 2,
      _dstBlendFactor: 4,
      _color: colorValue,
      _spriteFrame: null,
      _type: type,
      _fillType: 0,
      _sizeMode: sizeMode,
      _fillCenter: vec2(0, 0),
      _fillStart: 0,
      _fillRange: 0,
      _isTrimmedMode: true,
      _useGrayscale: false,
      _atlas: null,
      _id: ''
    });
  }

  addLabel(nodeId, text, fontSize, colorValue, lineHeight) {
    return this.add({
      __type__: 'cc.Label',
      _name: '',
      _objFlags: 0,
      __editorExtras__: {},
      node: { __id__: nodeId },
      _enabled: true,
      __prefab: { __id__: this.addCompPrefabInfo() },
      _customMaterial: null,
      _srcBlendFactor: 2,
      _dstBlendFactor: 4,
      _color: colorValue,
      _string: text,
      _horizontalAlign: 1,
      _verticalAlign: 1,
      _actualFontSize: fontSize,
      _fontSize: fontSize,
      _fontFamily: 'Arial',
      _lineHeight: lineHeight,
      _overflow: 0,
      _enableWrapText: true,
      _font: null,
      _isSystemFontUsed: true,
      _spacingX: 0,
      _isItalic: false,
      _isBold: false,
      _isUnderline: false,
      _underlineHeight: 2,
      _cacheMode: 0,
      _enableOutline: false,
      _outlineColor: color(0, 0, 0),
      _outlineWidth: 2,
      _enableShadow: false,
      _shadowColor: color(0, 0, 0),
      _shadowOffset: vec2(2, 2),
      _shadowBlur: 2,
      _id: ''
    });
  }

  addButton(nodeId, normalColor, pressedColor, hoverColor, disabledColor) {
    return this.add({
      __type__: 'cc.Button',
      _name: '',
      _objFlags: 0,
      __editorExtras__: {},
      node: { __id__: nodeId },
      _enabled: true,
      __prefab: { __id__: this.addCompPrefabInfo() },
      _id: '',
      _transition: 1,
      _normalColor: normalColor,
      _hoverColor: hoverColor,
      _pressedColor: pressedColor,
      _disabledColor: disabledColor,
      _normalSprite: null,
      _hoverSprite: null,
      _pressedSprite: null,
      _disabledSprite: null,
      _duration: 0.1,
      _zoomScale: 1.2,
      _target: { __id__: nodeId },
      _clickEvents: []
    });
  }

  addScript(nodeId, className) {
    return this.add({
      __type__: className,
      _name: '',
      _objFlags: 0,
      __editorExtras__: {},
      node: { __id__: nodeId },
      _enabled: true,
      __prefab: null,
      _id: ''
    });
  }

  addCompPrefabInfo() {
    return this.add({
      __type__: 'cc.CompPrefabInfo',
      fileId: fileId()
    });
  }

  addPrefabInfo(rootId) {
    return this.add({
      __type__: 'cc.PrefabInfo',
      root: { __id__: rootId },
      asset: { __id__: 0 },
      fileId: fileId(),
      instance: null,
      targetOverrides: null,
      nestedPrefabInstanceRoots: null
    });
  }
}

class PrefabBuilder extends BaseBuilder {
  constructor(name) {
    super();
    this.name = name;
    this.rootId = null;
    this.prefabId = this.add({
      __type__: 'cc.Prefab',
      _name: name,
      _objFlags: 0,
      __editorExtras__: {},
      _native: '',
      data: { __id__: 0 },
      optimizationPolicy: 0,
      persistent: false
    });
  }

  addRoot({ name, pos = vec3(0, 0), rot = quat(), eulerAngles = euler(), scale = vec3(1, 1, 1) }) {
    this.rootId = this.addNode({ name, pos, rot, eulerAngles, scale });
    return this.rootId;
  }

  setComponents(nodeId, nodeSize, componentIds) {
    super.setComponents(nodeId, nodeSize, componentIds);
    this.objects[nodeId]._prefab = { __id__: this.addPrefabInfo(nodeId) };
  }

  finalize() {
    this.objects[this.prefabId].data.__id__ = this.rootId;
    return this.objects;
  }
}

class SceneBuilder extends BaseBuilder {
  constructor(name) {
    super();
    this.name = name;
    this.canvasId = null;
    this.cameraId = null;
    this.sceneAssetId = this.add({
      __type__: 'cc.SceneAsset',
      _name: name,
      _objFlags: 0,
      __editorExtras__: {},
      _native: '',
      scene: { __id__: 0 },
      _id: ''
    });
  }

  buildCanvas() {
    const sceneId = this.add({
      __type__: 'cc.Scene',
      _name: this.name,
      _objFlags: 0,
      _parent: null,
      _children: [],
      _active: true,
      _components: [],
      _prefab: null,
      autoReleaseAssets: false,
      _id: ''
    });

    const canvasId = this.addNode({ name: 'Canvas', parent: sceneId });
    this.canvasId = canvasId;

    const cameraId = this.addChild(canvasId, { name: 'Camera', pos: vec3(0, 0, 1000) });
    this.cameraId = cameraId;

    const cameraCompId = this.add({
      __type__: 'cc.Camera',
      _name: '',
      _objFlags: 0,
      __editorExtras__: {},
      node: { __id__: cameraId },
      _enabled: true,
      __prefab: null,
      _projection: 0,
      _priority: 0,
      _fov: 45,
      _fovAxis: 0,
      _orthoHeight: 10,
      _near: 0,
      _far: 1000,
      _color: color(0, 0, 0, 255),
      _depth: 1,
      _stencil: 0,
      _clearFlags: 6,
      _rect: { __type__: 'cc.Rect', x: 0, y: 0, width: 1, height: 1 },
      _aperture: 19,
      _shutter: 7,
      _iso: 0,
      _screenScale: 1,
      _visibility: 1108344832,
      _targetTexture: null,
      _id: ''
    });

    const canvasTransformId = this.addUITransform(canvasId, size(1280, 720));
    const canvasCompId = this.add({
      __type__: 'cc.Canvas',
      _name: '',
      _objFlags: 0,
      __editorExtras__: {},
      node: { __id__: canvasId },
      _enabled: true,
      __prefab: null,
      _cameraComponent: { __id__: cameraCompId },
      _alignCanvasWithScreen: true,
      _id: ''
    });

    this.objects[sceneId]._children.push({ __id__: canvasId });
    this.objects[cameraId]._components.push({ __id__: cameraCompId });
    this.objects[canvasId]._components.push({ __id__: canvasTransformId }, { __id__: canvasCompId });

    return canvasId;
  }

  addUICanvasScript(className) {
    const scriptId = this.addScript(this.canvasId, className);
    this.objects[this.canvasId]._components.push({ __id__: scriptId });
  }

  finalize() {
    this.objects[this.sceneAssetId].scene.__id__ = 1;
    return this.objects;
  }
}

const PALETTE = {
  inkBlack: color(26, 26, 26),
  inkDark: color(45, 45, 45),
  inkGray: color(90, 90, 90),
  inkLight: color(138, 138, 138),
  paper: color(245, 240, 232),
  paperDark: color(232, 224, 212),
  ochre: color(196, 167, 125),
  greenPale: color(168, 197, 181),
  redInk: color(139, 58, 58),
  water: color(58, 74, 90),
  waterLight: color(90, 122, 138),
  white: color(255, 255, 255)
};

function savePrefab(dir, name, objects) {
  const filePath = path.join(dir, `${name}.prefab`);
  const metaPath = `${filePath}.meta`;
  fs.writeFileSync(filePath, JSON.stringify(objects, null, 2));
  const meta = {
    ver: '1.1.50',
    importer: 'prefab',
    imported: true,
    uuid: uuid(),
    files: ['.json'],
    subMetas: {},
    userData: { syncNodeName: name }
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`Generated: ${filePath}`);
}

function saveScene(dir, name, objects) {
  const filePath = path.join(dir, `${name}.scene`);
  const metaPath = `${filePath}.meta`;
  fs.writeFileSync(filePath, JSON.stringify(objects, null, 2));
  const meta = {
    ver: '1.1.50',
    importer: 'scene',
    imported: true,
    uuid: uuid(),
    files: [`${name}.scene.json`],
    subMetas: {},
    userData: {}
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`Generated: ${filePath}`);
}

function buildButton() {
  const b = new PrefabBuilder('Button');
  const rootId = b.addRoot({ name: 'Button' });
  const labelId = b.addChild(rootId, { name: 'Label' });
  const labelCompId = b.addLabel(labelId, '按钮', 24, PALETTE.inkDark, 32);
  b.setComponents(labelId, size(160, 48), [labelCompId]);
  const spriteId = b.addSprite(rootId, PALETTE.paper);
  const buttonId = b.addButton(rootId, PALETTE.paper, PALETTE.paperDark, PALETTE.white, PALETTE.inkLight);
  b.setComponents(rootId, size(160, 48), [spriteId, buttonId]);
  return b.finalize();
}

function buildToast() {
  const b = new PrefabBuilder('Toast');
  const rootId = b.addRoot({ name: 'Toast' });
  const labelId = b.addChild(rootId, { name: 'Label' });
  const labelCompId = b.addLabel(labelId, '提示文本', 20, PALETTE.paper, 32);
  b.setComponents(labelId, size(280, 40), [labelCompId]);
  const spriteId = b.addSprite(rootId, PALETTE.inkDark);
  b.setComponents(rootId, size(280, 40), [spriteId]);
  return b.finalize();
}

function buildScrollModal() {
  const b = new PrefabBuilder('ScrollModal');
  const rootId = b.addRoot({ name: 'ScrollModal' });
  const titleId = b.addChild(rootId, { name: 'Title', pos: vec3(0, 120) });
  const titleLabelId = b.addLabel(titleId, '标题', 28, PALETTE.inkDark, 36);
  b.setComponents(titleId, size(416, 40), [titleLabelId]);
  const contentId = b.addChild(rootId, { name: 'Content', pos: vec3(0, 0) });
  const contentLabelId = b.addLabel(contentId, '内容', 20, PALETTE.inkDark, 28);
  b.setComponents(contentId, size(416, 240), [contentLabelId]);
  const spriteId = b.addSprite(rootId, PALETTE.paper);
  b.setComponents(rootId, size(480, 320), [spriteId]);
  return b.finalize();
}

function buildSeal() {
  const b = new PrefabBuilder('Seal');
  const rootId = b.addRoot({
    name: 'Seal',
    rot: quat(0, 0, -0.052335956242943835, 0.9986295347545738),
    eulerAngles: euler(0, 0, -6)
  });
  const labelId = b.addChild(rootId, { name: 'Label' });
  const labelCompId = b.addLabel(labelId, '印', 20, PALETTE.paper, 48);
  b.setComponents(labelId, size(48, 48), [labelCompId]);
  const spriteId = b.addSprite(rootId, PALETTE.redInk);
  b.setComponents(rootId, size(48, 48), [spriteId]);
  return b.finalize();
}

function buildLevelNode() {
  const b = new PrefabBuilder('LevelNode');
  const rootId = b.addRoot({ name: 'LevelNode' });
  const labelId = b.addChild(rootId, { name: 'Label' });
  const labelCompId = b.addLabel(labelId, '1', 28, PALETTE.inkDark, 80);
  b.setComponents(labelId, size(80, 80), [labelCompId]);
  const spriteId = b.addSprite(rootId, PALETTE.paper);
  b.setComponents(rootId, size(80, 80), [spriteId]);
  return b.finalize();
}

function buildMoneyBar() {
  const b = new PrefabBuilder('MoneyBar');
  const rootId = b.addRoot({ name: 'MoneyBar' });
  const labelId = b.addChild(rootId, { name: 'Label', pos: vec3(10, 0) });
  const labelCompId = b.addLabel(labelId, '100', 24, PALETTE.inkDark, 32);
  b.setComponents(labelId, size(120, 32), [labelCompId]);
  const spriteId = b.addSprite(rootId, PALETTE.paperDark);
  b.setComponents(rootId, size(140, 36), [spriteId]);
  return b.finalize();
}

function buildBlockCard() {
  const b = new PrefabBuilder('BlockCard');
  const rootId = b.addRoot({ name: 'BlockCard' });
  const nameId = b.addChild(rootId, { name: 'Name', pos: vec3(0, 22) });
  const nameLabelId = b.addLabel(nameId, '石墙', 16, PALETTE.inkDark, 20);
  b.setComponents(nameId, size(64, 20), [nameLabelId]);
  const countId = b.addChild(rootId, { name: 'Count', pos: vec3(0, -22) });
  const countLabelId = b.addLabel(countId, 'x5', 18, PALETTE.inkDark, 20);
  b.setComponents(countId, size(64, 20), [countLabelId]);
  const spriteId = b.addSprite(rootId, PALETTE.paper);
  b.setComponents(rootId, size(64, 80), [spriteId]);
  return b.finalize();
}

function buildDeleteZone() {
  const b = new PrefabBuilder('DeleteZone');
  const rootId = b.addRoot({ name: 'DeleteZone' });
  const labelId = b.addChild(rootId, { name: 'Label' });
  const labelCompId = b.addLabel(labelId, '拖\n删', 16, PALETTE.redInk, 20);
  b.setComponents(labelId, size(56, 56), [labelCompId]);
  const spriteId = b.addSprite(rootId, color(245, 240, 232, 128));
  b.setComponents(rootId, size(56, 56), [spriteId]);
  return b.finalize();
}

function buildWaterButton() {
  const b = new PrefabBuilder('WaterButton');
  const rootId = b.addRoot({ name: 'WaterButton' });
  const labelId = b.addChild(rootId, { name: 'Label' });
  const labelCompId = b.addLabel(labelId, '放水', 20, PALETTE.paper, 64);
  b.setComponents(labelId, size(64, 64), [labelCompId]);
  const spriteId = b.addSprite(rootId, PALETTE.water);
  const buttonId = b.addButton(rootId, PALETTE.water, PALETTE.waterLight, PALETTE.waterLight, PALETTE.inkLight);
  b.setComponents(rootId, size(64, 64), [spriteId, buttonId]);
  return b.finalize();
}

function buildStoneWall() {
  const b = new PrefabBuilder('StoneWall');
  const rootId = b.addRoot({ name: 'StoneWall' });
  const labelId = b.addChild(rootId, { name: 'Label' });
  const labelCompId = b.addLabel(labelId, '石', 24, PALETTE.paper, 64);
  b.setComponents(labelId, size(64, 64), [labelCompId]);
  const spriteId = b.addSprite(rootId, PALETTE.inkGray);
  b.setComponents(rootId, size(64, 64), [spriteId]);
  return b.finalize();
}

function buildBambooCage() {
  const b = new PrefabBuilder('BambooCage');
  const rootId = b.addRoot({ name: 'BambooCage' });
  const labelId = b.addChild(rootId, { name: 'Label' });
  const labelCompId = b.addLabel(labelId, '竹', 24, PALETTE.inkDark, 64);
  b.setComponents(labelId, size(64, 64), [labelCompId]);
  const spriteId = b.addSprite(rootId, PALETTE.greenPale);
  b.setComponents(rootId, size(64, 64), [spriteId]);
  return b.finalize();
}

function buildBootScene() {
  const b = new SceneBuilder('BootScene');
  b.buildCanvas();
  b.addUICanvasScript('BootSceneCtrl');

  const titleId = b.addChild(b.canvasId, { name: 'Title', pos: vec3(0, 120) });
  b.setComponents(titleId, size(600, 80), [b.addLabel(titleId, '都江堰治水', 56, PALETTE.inkDark, 72)]);

  const subtitleId = b.addChild(b.canvasId, { name: 'Subtitle', pos: vec3(0, 40) });
  b.setComponents(subtitleId, size(600, 40), [b.addLabel(subtitleId, '国风水利解谜', 24, PALETTE.inkGray, 32)]);

  const progressId = b.addChild(b.canvasId, { name: 'ProgressBar', pos: vec3(0, -80) });
  b.setComponents(progressId, size(400, 12), [b.addSprite(progressId, PALETTE.inkDark)]);

  const loadingId = b.addChild(b.canvasId, { name: 'LoadingText', pos: vec3(0, -120) });
  b.setComponents(loadingId, size(400, 32), [b.addLabel(loadingId, '正在引水入渠…', 20, PALETTE.inkGray, 32)]);

  return b.finalize();
}

function buildTitleScene() {
  const b = new SceneBuilder('TitleScene');
  b.buildCanvas();
  b.addUICanvasScript('TitleSceneCtrl');

  const titleId = b.addChild(b.canvasId, { name: 'Title', pos: vec3(0, 80) });
  b.setComponents(titleId, size(600, 80), [b.addLabel(titleId, '都江堰治水', 64, PALETTE.inkDark, 80)]);

  const startId = b.addChild(b.canvasId, { name: 'StartButton', pos: vec3(0, -40) });
  b.setComponents(startId, size(200, 56), [b.addSprite(startId, PALETTE.paper), b.addButton(startId, PALETTE.paper, PALETTE.paperDark, PALETTE.white, PALETTE.inkLight)]);
  const startLabelId = b.addChild(startId, { name: 'Label' });
  b.setComponents(startLabelId, size(200, 56), [b.addLabel(startLabelId, '开始治水', 28, PALETTE.inkDark, 40)]);

  const settingsId = b.addChild(b.canvasId, { name: 'SettingsButton', pos: vec3(260, 140) });
  b.setComponents(settingsId, size(64, 64), [b.addSprite(settingsId, PALETTE.paperDark), b.addButton(settingsId, PALETTE.paperDark, PALETTE.paper, PALETTE.white, PALETTE.inkLight)]);
  const settingsLabelId = b.addChild(settingsId, { name: 'Label' });
  b.setComponents(settingsLabelId, size(64, 64), [b.addLabel(settingsLabelId, '设置', 20, PALETTE.inkDark, 40)]);

  return b.finalize();
}

function buildLevelMapScene() {
  const b = new SceneBuilder('LevelMapScene');
  b.buildCanvas();
  b.addUICanvasScript('LevelMapSceneCtrl');

  const titleId = b.addChild(b.canvasId, { name: 'Title', pos: vec3(-440, 280) });
  b.setComponents(titleId, size(240, 48), [b.addLabel(titleId, '治水卷轴', 36, PALETTE.inkDark, 48)]);

  const backId = b.addChild(b.canvasId, { name: 'BackButton', pos: vec3(-560, 280) });
  b.setComponents(backId, size(80, 40), [b.addSprite(backId, PALETTE.paper), b.addButton(backId, PALETTE.paper, PALETTE.paperDark, PALETTE.white, PALETTE.inkLight)]);
  const backLabelId = b.addChild(backId, { name: 'Label' });
  b.setComponents(backLabelId, size(80, 40), [b.addLabel(backLabelId, '返回', 18, PALETTE.inkDark, 28)]);

  const node1Id = b.addChild(b.canvasId, { name: 'LevelNode1', pos: vec3(-200, 0) });
  b.setComponents(node1Id, size(80, 80), [b.addSprite(node1Id, PALETTE.paper)]);
  const node1LabelId = b.addChild(node1Id, { name: 'Label' });
  b.setComponents(node1LabelId, size(80, 80), [b.addLabel(node1LabelId, '1', 28, PALETTE.inkDark, 80)]);

  const node2Id = b.addChild(b.canvasId, { name: 'LevelNode2', pos: vec3(0, 0) });
  b.setComponents(node2Id, size(80, 80), [b.addSprite(node2Id, PALETTE.ochre)]);
  const node2LabelId = b.addChild(node2Id, { name: 'Label' });
  b.setComponents(node2LabelId, size(80, 80), [b.addLabel(node2LabelId, '2', 28, PALETTE.inkDark, 80)]);

  return b.finalize();
}

function buildGameScene() {
  const b = new SceneBuilder('GameScene');
  b.buildCanvas();
  b.addUICanvasScript('GameSceneCtrl');

  const headerId = b.addChild(b.canvasId, { name: 'Header', pos: vec3(0, 310) });
  b.setComponents(headerId, size(1280, 80), [b.addSprite(headerId, PALETTE.paperDark)]);

  const backId = b.addChild(headerId, { name: 'BackButton', pos: vec3(-560, 0) });
  b.setComponents(backId, size(80, 40), [b.addSprite(backId, PALETTE.paper), b.addButton(backId, PALETTE.paper, PALETTE.paperDark, PALETTE.white, PALETTE.inkLight)]);
  const backLabelId = b.addChild(backId, { name: 'Label' });
  b.setComponents(backLabelId, size(80, 40), [b.addLabel(backLabelId, '返回', 18, PALETTE.inkDark, 28)]);

  const levelNameId = b.addChild(headerId, { name: 'LevelName', pos: vec3(-380, 0) });
  b.setComponents(levelNameId, size(200, 40), [b.addLabel(levelNameId, 'L1 堵', 28, PALETTE.inkDark, 40)]);

  const moneyId = b.addChild(headerId, { name: 'MoneyBar', pos: vec3(420, 0) });
  b.setComponents(moneyId, size(140, 36), [b.addSprite(moneyId, PALETTE.paper)]);
  const moneyLabelId = b.addChild(moneyId, { name: 'Label' });
  b.setComponents(moneyLabelId, size(120, 32), [b.addLabel(moneyLabelId, '100', 24, PALETTE.inkDark, 32)]);

  const boardId = b.addChild(b.canvasId, { name: 'GameBoard', pos: vec3(0, 20) });
  b.setComponents(boardId, size(1200, 480), [b.addSprite(boardId, PALETTE.paper)]);

  const toolbarId = b.addChild(b.canvasId, { name: 'Toolbar', pos: vec3(0, -280) });
  b.setComponents(toolbarId, size(1280, 120), [b.addSprite(toolbarId, PALETTE.paperDark)]);

  const waterBtnId = b.addChild(toolbarId, { name: 'WaterButton', pos: vec3(560, 0) });
  b.setComponents(waterBtnId, size(64, 64), [b.addSprite(waterBtnId, PALETTE.water), b.addButton(waterBtnId, PALETTE.water, PALETTE.waterLight, PALETTE.waterLight, PALETTE.inkLight)]);
  const waterLabelId = b.addChild(waterBtnId, { name: 'Label' });
  b.setComponents(waterLabelId, size(64, 64), [b.addLabel(waterLabelId, '放水', 18, PALETTE.paper, 64)]);

  return b.finalize();
}

function main() {
  [UI_PREFAB_DIR, GAME_PREFAB_DIR, SCENE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  savePrefab(UI_PREFAB_DIR, 'Button', buildButton());
  savePrefab(UI_PREFAB_DIR, 'Toast', buildToast());
  savePrefab(UI_PREFAB_DIR, 'ScrollModal', buildScrollModal());
  savePrefab(UI_PREFAB_DIR, 'Seal', buildSeal());
  savePrefab(UI_PREFAB_DIR, 'LevelNode', buildLevelNode());
  savePrefab(UI_PREFAB_DIR, 'MoneyBar', buildMoneyBar());
  savePrefab(UI_PREFAB_DIR, 'BlockCard', buildBlockCard());
  savePrefab(UI_PREFAB_DIR, 'DeleteZone', buildDeleteZone());
  savePrefab(UI_PREFAB_DIR, 'WaterButton', buildWaterButton());
  savePrefab(GAME_PREFAB_DIR, 'StoneWall', buildStoneWall());
  savePrefab(GAME_PREFAB_DIR, 'BambooCage', buildBambooCage());

  saveScene(SCENE_DIR, 'BootScene', buildBootScene());
  saveScene(SCENE_DIR, 'TitleScene', buildTitleScene());
  saveScene(SCENE_DIR, 'LevelMapScene', buildLevelMapScene());
  saveScene(SCENE_DIR, 'GameScene', buildGameScene());

  console.log('All prefabs and scenes generated.');
}

main();
