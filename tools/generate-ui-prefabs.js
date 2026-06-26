/**
 * UI 预制体 JSON 生成器
 * 基于 Cocos Creator 3.8.x 序列化格式
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CLIENT_DIR = path.join(__dirname, '..', 'client');
const UI_PREFAB_DIR = path.join(CLIENT_DIR, 'assets', 'prefabs', 'ui');
const GAME_PREFAB_DIR = path.join(CLIENT_DIR, 'assets', 'prefabs', 'game');

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

class PrefabBuilder {
  constructor(name) {
    this.name = name;
    this.objects = [];
    this.rootId = null;
    // Placeholder prefab at index 0; data will point to root
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
      _parent: parent ? { __id__: parent } : null,
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

  addRoot({ name, pos = vec3(0, 0), rot = quat(), eulerAngles = euler(), scale = vec3(1, 1, 1) }) {
    this.rootId = this.addNode({ name, pos, rot, eulerAngles, scale });
    return this.rootId;
  }

  addChild(parentId, { name, pos = vec3(0, 0), rot = quat(), eulerAngles = euler(), scale = vec3(1, 1, 1) }) {
    const childId = this.addNode({ name, parent: parentId, pos, rot, eulerAngles, scale });
    this.objects[parentId]._children.push({ __id__: childId });
    return childId;
  }

  setComponents(nodeId, nodeSize, componentIds) {
    const uiTransformId = this.addUITransform(nodeId, nodeSize);
    this.objects[nodeId]._components = [uiTransformId, ...componentIds].map(id => ({ __id__: id }));
    this.objects[nodeId]._prefab = { __id__: this.addPrefabInfo(nodeId) };
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

  finalize() {
    this.objects[this.prefabId].data.__id__ = this.rootId;
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
  const spriteId = b.addSprite(rootId, PALETTE.inkGray);
  b.setComponents(rootId, size(64, 64), [spriteId]);
  return b.finalize();
}

function buildBambooCage() {
  const b = new PrefabBuilder('BambooCage');
  const rootId = b.addRoot({ name: 'BambooCage' });
  const spriteId = b.addSprite(rootId, PALETTE.greenPale);
  b.setComponents(rootId, size(64, 64), [spriteId]);
  return b.finalize();
}

function main() {
  [UI_PREFAB_DIR, GAME_PREFAB_DIR].forEach(dir => {
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

  console.log('All prefabs generated.');
}

main();
