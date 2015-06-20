var UI = require('ui');
var Vector2 = require('vector2');



var slideItems=[];

// CURRENT LOCAION ITEMS
var clt_1 = new UI.Text({
  position: new Vector2(0, 126),
  size: new Vector2(144, 40),
  font: 'gothic-18',
  text: 'locstr',
  textAlign: 'center'
});
slideItems.push([
  {showTime: true},
  {field: clt_1, mainPos: { x: clt_1.position().x, y: clt_1.position().y } }
]);

// CURRENT WEATHER ITEM
var cwi_1 = new UI.Image({
  position: new Vector2(10, 126),
  size: new Vector2(40, 40),
  image: 'images/01d.png',
  compositing: 'set'
});

var cwt_1 = new UI.Text({
  position: new Vector2(52, 128),
  size: new Vector2(50, 40),
  font: 'gothic-28',
  text: '?°',
  textAlign: 'left'
});
var cwt_2 = new UI.Text({
  position: new Vector2(95, 126),
  size: new Vector2(50, 40),
  font: 'gothic-18',
  text: '? m/s\n? hum',
  textAlign: 'left'
});

slideItems.push([
  {showTime: true},
  {field: cwi_1, mainPos: { x: cwi_1.position().x, y: cwi_1.position().y }},
  {field: cwt_1, mainPos: { x: cwt_1.position().x, y: cwt_1.position().y }},
  {field: cwt_2, mainPos: { x: cwt_2.position().x, y: cwt_2.position().y }}
]);

module.exports = slideItems;