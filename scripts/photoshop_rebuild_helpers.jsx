#target photoshop
/*
  Copy this file to a task workspace and append task-specific reconstruction.
  Keep visible CJK copy as Unicode escapes in the task-specific tail.
*/
// Preferences are caller-scoped; importing helpers must not change them.

var EditablePoster = (function () {
  function rgb(r, g, b) {
    var c = new SolidColor();
    c.rgb.red = r;
    c.rgb.green = g;
    c.rgb.blue = b;
    return c;
  }

  function newDocument(name, width, height, dpi, fillMode) {
    var oldUnits=app.preferences.rulerUnits;try{app.preferences.rulerUnits=Units.PIXELS;return app.documents.add(
      UnitValue(width, 'px'), UnitValue(height, 'px'), dpi || 72, name,
      NewDocumentMode.RGB, fillMode || DocumentFill.TRANSPARENT
    );}finally{app.preferences.rulerUnits=oldUnits;}
  }

  function group(doc, name) {
    var g = doc.layerSets.add();
    g.name = name;
    return g;
  }

  function moveInto(layer, targetGroup) {
    if (targetGroup) layer.move(targetGroup, ElementPlacement.INSIDE);
    return layer;
  }

  function fillRect(doc, name, x, y, width, height, fillColor, targetGroup) {
    app.activeDocument = doc;
    var layer = doc.artLayers.add();
    layer.name = name;
    doc.selection.select([
      [x, y], [x + width, y],
      [x + width, y + height], [x, y + height]
    ]);
    doc.selection.fill(fillColor);
    doc.selection.deselect();
    return moveInto(layer, targetGroup);
  }

  function fillEllipse(doc, name, left, top, right, bottom, fillColor, targetGroup) {
    app.activeDocument = doc;
    var layer = doc.artLayers.add();
    layer.name = name;
    var setDesc = new ActionDescriptor();
    var selRef = new ActionReference();
    selRef.putProperty(charIDToTypeID('Chnl'), charIDToTypeID('fsel'));
    setDesc.putReference(charIDToTypeID('null'), selRef);
    var ellipse = new ActionDescriptor();
    ellipse.putUnitDouble(charIDToTypeID('Top '), charIDToTypeID('#Pxl'), top);
    ellipse.putUnitDouble(charIDToTypeID('Left'), charIDToTypeID('#Pxl'), left);
    ellipse.putUnitDouble(charIDToTypeID('Btom'), charIDToTypeID('#Pxl'), bottom);
    ellipse.putUnitDouble(charIDToTypeID('Rght'), charIDToTypeID('#Pxl'), right);
    setDesc.putObject(charIDToTypeID('T   '), charIDToTypeID('Elps'), ellipse);
    executeAction(charIDToTypeID('setd'), setDesc, DialogModes.NO);
    doc.selection.fill(fillColor);
    doc.selection.deselect();
    return moveInto(layer, targetGroup);
  }

  function strokeLine(doc, name, x1, y1, x2, y2, thickness, color, targetGroup) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var length = Math.sqrt(dx * dx + dy * dy);
    if (!(length > 0) || !(thickness > 0)) throw new Error('Invalid line dimensions: ' + name);
    if (!(length > 0) || !(thickness > 0)) throw new Error('Invalid line dimensions: ' + name);
    var px = -dy / length * thickness / 2;
    var py = dx / length * thickness / 2;
    app.activeDocument = doc;
    var layer = doc.artLayers.add();
    layer.name = name;
    doc.selection.select([
      [x1 + px, y1 + py], [x2 + px, y2 + py],
      [x2 - px, y2 - py], [x1 - px, y1 - py]
    ]);
    doc.selection.fill(color);
    doc.selection.deselect();
    return moveInto(layer, targetGroup);
  }

  function addText(doc, options, targetGroup) {
    app.activeDocument = doc;
    var layer = doc.artLayers.add();
    layer.kind = LayerKind.TEXT;
    layer.name = options.name;
    layer.textItem.contents = options.contents;
    layer.textItem.position = [UnitValue(options.x, 'px'), UnitValue(options.y, 'px')];
    layer.textItem.size = UnitValue(options.size, 'px');
    layer.textItem.font = options.font || 'ArialMT';
    layer.textItem.color = options.color || rgb(0, 0, 0);
    layer.textItem.antiAliasMethod = options.antiAlias || AntiAlias.SHARP;
    if (options.center) layer.textItem.justification = Justification.CENTER;
    if (options.right) layer.textItem.justification = Justification.RIGHT;
    if (options.tracking !== undefined) layer.textItem.tracking = options.tracking;
    if (options.leading !== undefined) layer.textItem.leading = UnitValue(options.leading, 'px');
    return moveInto(layer, targetGroup);
  }

  function copySelectionAsSmartObject(sourceDoc, targetDoc, rect, options, targetGroup) {
    app.activeDocument = sourceDoc;
    sourceDoc.selection.select([
      [rect[0], rect[1]], [rect[2], rect[1]],
      [rect[2], rect[3]], [rect[0], rect[3]]
    ]);
    // Flattened or single-layer sources must use copy(), not copy(true).
    sourceDoc.selection.copy();
    sourceDoc.selection.deselect();
    app.activeDocument = targetDoc;
    var layer = targetDoc.paste();
    var bounds = layer.bounds;
    layer.translate(UnitValue(options.left, 'px') - bounds[0], UnitValue(options.top, 'px') - bounds[1]);
    if (options.multiply) layer.blendMode = BlendMode.MULTIPLY;
    executeAction(stringIDToTypeID('newPlacedLayer'), undefined, DialogModes.NO);
    layer = targetDoc.activeLayer;
    layer.name = options.name;
    return moveInto(layer, targetGroup);
  }

  function importAssetAsSmartObject(assetPath, targetDoc, options, targetGroup) {
    var assetFile = File(assetPath);
    if (!assetFile.exists) throw new Error('Missing asset: ' + assetPath);
    var assetDoc = app.open(assetFile);
    var layer = assetDoc.activeLayer.duplicate(targetDoc, ElementPlacement.PLACEATBEGINNING);
    assetDoc.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = targetDoc;
    targetDoc.activeLayer = layer;
    var bounds = layer.bounds;
    layer.translate(UnitValue(options.left, 'px') - bounds[0], UnitValue(options.top, 'px') - bounds[1]);
    executeAction(stringIDToTypeID('newPlacedLayer'), undefined, DialogModes.NO);
    layer = targetDoc.activeLayer;
    layer.name = options.name;
    return moveInto(layer, targetGroup);
  }

  function savePSD(doc, absolutePath) {
    app.activeDocument = doc;
    var options = new PhotoshopSaveOptions();
    options.layers = true;
    options.embedColorProfile = true;
    options.maximizeCompatibility = true;
    doc.saveAs(File(absolutePath), options, true, Extension.LOWERCASE);
  }

  function savePNG(doc, absolutePath) {
    app.activeDocument = doc;
    var options = new PNGSaveOptions();
    options.compression = 6;
    options.interlaced = false;
    doc.saveAs(File(absolutePath), options, true, Extension.LOWERCASE);
  }

  return {
    rgb: rgb,
    newDocument: newDocument,
    group: group,
    fillRect: fillRect,
    fillEllipse: fillEllipse,
    strokeLine: strokeLine,
    addText: addText,
    copySelectionAsSmartObject: copySelectionAsSmartObject,
    importAssetAsSmartObject: importAssetAsSmartObject,
    savePSD: savePSD,
    savePNG: savePNG
  };
}());

/*
  Task-specific tail example:

  var doc = EditablePoster.newDocument('Poster', 1080, 1350, 72);
  var background = EditablePoster.group(doc, '00_BACKGROUND');
  var effects = EditablePoster.group(doc, '01_EFFECTS');
  var shapes = EditablePoster.group(doc, '02_SHAPES_AND_GEOMETRY');
  var images = EditablePoster.group(doc, '03_IMAGES_AND_ICONS_SMART_OBJECTS');
  var type = EditablePoster.group(doc, '04_LIVE_TEXT');

  EditablePoster.fillRect(doc, 'BG_BASE', 0, 0, 1080, 1350,
    EditablePoster.rgb(245, 245, 245), background);
  EditablePoster.addText(doc, {
    name: 'TYPE_HEADLINE',
    contents: '\u53ef\u7f16\u8f91\u6807\u9898',
    x: 540, y: 160, size: 64,
    font: 'HiraginoSansGB-W6',
    color: EditablePoster.rgb(20, 20, 20), center: true
  }, type);

  EditablePoster.savePSD(doc, '/absolute/ascii/path/poster_editable.psd');
  EditablePoster.savePNG(doc, '/absolute/ascii/path/poster_editable.png');
*/

