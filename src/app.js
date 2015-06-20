/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 
   http://openweathermap.org/
   https://developers.google.com/maps/documentation/javascript/geocoding
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');

var hueIP = '192.168.0.18';
var hueUser = 'newdeveloper';
var hueApiCall = 'http://'+hueIP+'/api/'+hueUser;

var hueMenuColor = {
      backgroundColor: 'black',
      textColor: 'blue',
      highlightBackgroundColor: 'blue',
      highlightTextColor: 'black',
      sections: []
    };

var coordinates = false;
var locationinfo = false;
var units = 'metric';
var windspeed = 'm/s';
var hum = 'hum';

var curSlideItem = 0;
var nextSlideItem = 1;
var slideItems = [];

var main = new UI.Window({
  fullscreen: true,
});
var image = new UI.Image({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  image: 'images/pebble-bgnd1.png'
});

var datefield = new UI.TimeText({
  position: new Vector2(0, 0),
  size: new Vector2(144, 30),
  font: 'gothic-24',
  text: '%a. %d. %b',
  textAlign: 'center'
});

var timefield = new UI.TimeText({
  position: new Vector2(0, 55),
  size: new Vector2(144, 30),
  font: 'bitham-42-bold',
  text: '%H:%M',
  textAlign: 'center'
});



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


var curSlides = require('slides');
console.log(JSON.stringify(curSlides[0]));


main.add(image);
main.add(datefield);
main.add(timefield);
main.add(clt_1); // CURRENT LOCAION ITEMS
main.add(cwi_1); // CURRENT WEATHER ITEMS
main.add(cwt_1); // CURRENT WEATHER ITEMS
main.add(cwt_2); // CURRENT WEATHER ITEMS
main.show();


// Move slides offscreen - except for the first
function initSlides(){
  var pos;
  slideItems.forEach(function (elem, index) {
    if (index>0){
      elem.forEach(function(item, index2){
        if (index2>0){
          pos = item.field.position();
          pos.x = pos.x + 144;
          item.field.position(pos);
        }
      });
    }
  });
}
initSlides();


function nextBottomSlide(){
  var pos;
  if (curSlideItem >= slideItems.length-1){
    nextSlideItem = 0;
  }else{
    nextSlideItem = curSlideItem+1;
  }
  
  // Check if we need to animate the time item
  if (!slideItems[curSlideItem][0].showTime && slideItems[nextSlideItem][0].showTime){
      pos = timefield.position();
      pos.x = 144;
      timefield.position(pos);
      pos.x = 0;
      timefield.animate('position', pos, 200);
  }
  
  // Check if we need to animate the time item
  if (slideItems[curSlideItem][0].showTime && !slideItems[nextSlideItem][0].showTime){
      pos = timefield.position();
      pos.x = 0;
      timefield.position(pos);
      pos.x = -144;
      timefield.animate('position', pos, 200);
  }
  
  // first set next slides to startPos
  for (var i = 1; i < slideItems[nextSlideItem].length; i++) { 
    pos = slideItems[nextSlideItem][i].field.position();
    pos.x = slideItems[nextSlideItem][i].mainPos.x + 144;
    slideItems[nextSlideItem][i].field.position(pos);
  }

  // animate items out
  for (i = 1; i < slideItems[curSlideItem].length; i++) { 
    pos = slideItems[curSlideItem][i].field.position();
    pos.x -= 144;
    slideItems[curSlideItem][i].field.animate('position', pos, 200);
  } 

  // animate items in
  for (i = 1; i < slideItems[nextSlideItem].length; i++) { 
    pos = slideItems[nextSlideItem][i].field.position();
    pos.x = slideItems[nextSlideItem][i].mainPos.x;
    slideItems[nextSlideItem][i].field.animate('position', pos, 200);
  } 
  
  curSlideItem=nextSlideItem;
}

// currentLocation object
var locationObj = locationObj || {
  getLocation: function(){
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.locationSuccess, this.locationError, {maximumAge:60000, timeout:5000, enableHighAccuracy:true});
    } else {
      console.log('No geolocation');
    }    
  },
  locationSuccess: function(pos){
    coordinates = pos.coords;
    // http://maps.googleapis.com/maps/api/geocode/json?latlng=55.66268129528441,12.302745318828144
    ajax({ url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+coordinates.latitude+','+coordinates.longitude, type: 'json' },
      function(data) {
        //console.log(JSON.stringify(data.results[0].formatted_address));       
        locationinfo = {};
        data.results[0].address_components.forEach(function (element, index) {
          locationinfo[element.types[0]] = element;
        });        
        //console.log(JSON.stringify(locationinfo));
        var locstr = locationinfo.route.short_name +' '+ locationinfo.street_number.short_name + '\n' + locationinfo.locality.short_name;      
        clt_1.text(locstr);
        weatherObj.getCurrent();
    });   
  },
  locationError: function(err){
    console.warn('location error (' + err.code + '): ' + err.message);
  }
  
};
// End: currentLocation object
locationObj.getLocation();

// Watch Location Var and update


// End: Watch Location

// weather object
var weatherObj = weatherObj || {
  getCurrent: function(){
    //http://api.openweathermap.org/data/2.5/weather?q=Taastrup,dk&units=metric
    var callUrl = 'http://api.openweathermap.org/data/2.5/weather?q='+locationinfo.locality.long_name+','+locationinfo.country.short_name+'&units='+units;
    ajax({ url: callUrl, type: 'json'},
      function(data) {
        console.log('weather:'+callUrl);
        console.log(JSON.stringify(data));
        console.log('icon: '+data.weather[0].icon);
        cwt_1.text(parseInt(data.main.temp)+'°');
        var str = parseInt(data.wind.speed) + ' ' + windspeed + '\n'+data.main.humidity+' '+hum;
        cwt_2.text(str);
        cwi_1.image('images/'+data.weather[0].icon+'.png');
    });
  }
};
// End: weather object


var hueSelectLightsObj = hueSelectLightsObj || {
    init: function(){
    this.Menu = new UI.Menu(hueMenuColor);
    this.Menu.on('select', function(e) {
      hueSelectLightsObj.selectItem(e);
    });
    this.Menu.on('hide', function(e){
      var newGroup = {name:"Group1", lights: []};
      for (var key in hueSelectLightsObj.allLights){
        console.log(JSON.stringify(hueSelectLightsObj.allLights[key]));
        if (hueSelectLightsObj.allLights[key].added){
          console.log('added :)');
          newGroup.lights.push( hueSelectLightsObj.allLights[key].lightNb );
        }
      }
      console.log(JSON.stringify(newGroup));
      var callUrl = hueApiCall+'/groups/';
      ajax({ url: callUrl, method: 'post', data:newGroup, type: 'json'},
        function(data) {
          console.log(JSON.stringify(data));
        });

    });
    this.updateSections();
    this.Menu.show();
  },
  updateSections: function(){
    this.allLights = [{
        title: 'Group Settings',
        //icon: 'images/menu_icon.png',
        subtitle: 'Set levels for lights'
      }];
    //var callUrl = hueApiCall+'/lights/';
    ajax({ url: hueApiCall+'/lights/', method: 'get', type: 'json'},
        function(data) {
          console.log(JSON.stringify(data));
          for (var key in data) {
            var curLight = {
              title: decodeURIComponent(data[key].name),
              icon: 'images/pebble-checkmark-off.png',
              //subtitle: ' ',
              lightNb: key,
              added: false,
            };
            console.log(JSON.stringify(curLight));
            hueSelectLightsObj.allLights.push(curLight);
          }
          hueSelectLightsObj.Menu.items(0, hueSelectLightsObj.allLights);
        });
    
    this.Menu.items(0, this.allLights);
  },
  selectItem: function(e){
    if (e.itemIndex>0){
      //var callUrl = 'http://192.168.0.18/api/newdeveloper/lights/'+e.item.lightNb+'/state';
      //ajax({ url: callUrl, method: 'put', data:{"on":e.item.state}, type: 'json'},
      //  function(data) {
      //    console.log(JSON.stringify(data));
      //  });
      console.log(JSON.stringify(e.item));
      if (e.item.added){
        hueSelectLightsObj.Menu.item(e.sectionIndex, e.itemIndex, { icon: 'images/pebble-checkmark-off.png', added: false } );
      }else{
        hueSelectLightsObj.Menu.item(e.sectionIndex, e.itemIndex, { icon: 'images/pebble-checkmark-on.png', added: true } );
      }      
    }
  }
};
var hueMenuObj = hueMenuObj || {
  init: function(){
    this.Menu = new UI.Menu(hueMenuColor);
    this.Menu.on('select', function(e) {
      hueMenuObj.selectItem(e);
    });
    this.updateSections();
    this.Menu.show();
  },
  updateSections: function(){
    this.allLights = [{
        title: 'Add Group',
        //icon: 'images/menu_icon.png',
        subtitle: 'Select lights',
        action: function(){ hueSelectLightsObj.init(); }
      }];
    ajax({ url: hueApiCall+'/groups/', method: 'get', type: 'json'},
         function(data){
           for (var key in data){
             console.log(JSON.stringify(data[key]));           
             var thisGroup = {
               title: data[key].name,
               subtitle: (data[key].action.on ? "Turn Off" : "Turn On"),
               on: data[key].action.on,
               groupID: key,
               action: function(e){
                 console.log(e.item.on);
                 var nextState = (e.item.on) ? false : true;
                 console.log(nextState);
                 hueMenuObj.Menu.item(e.sectionIndex, e.itemIndex, { on: nextState, subtitle: (nextState ? "Turn Off" : "Turn On") } );
                 ajax({ url: hueApiCall+'/groups/'+e.item.groupID+'/action', data:{on: nextState, "bri":255,"sat":50,"hue":1000}, method: 'put', type: 'json'},
                      function(data) {
                      });
               }
             };
             hueMenuObj.allLights.push(thisGroup);
           }
           hueMenuObj.Menu.items(0, hueMenuObj.allLights);
         });
    this.Menu.items(0, this.allLights);
  },
  selectItem: function(e){
    e.item.action(e);
  }
};

var hueGroupSettingObj = hueGroupSettingObj || {
    init: function(){
    this.Menu = new UI.Menu(hueMenuColor);
    this.Menu.on('select', function(e) {
      hueMenuObj.selectItem(e);
    });
    this.updateSections();
    this.Menu.show();
  }
};

main.on('click', 'up', function(e) {
  console.log('hueClick');
  hueMenuObj.init();
});

main.on('longClick', 'up', function(e) {
  var menu = new UI.Menu({
    backgroundColor: 'black',
    textColor: 'blue',
    highlightBackgroundColor: 'blue',
    highlightTextColor: 'black',
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      },{
        title: 'Philips Hue',
        subtitle: '?',
        lightNb: 1,
        state: true
      }]
    }]
  });
  menu.on('select', function(e) {
    if (e.itemIndex==2){
      var callUrl = hueApiCall+'/lights/'+e.item.lightNb+'/state';

      ajax({ url: callUrl, method: 'put', data:{"on":e.item.state}, type: 'json'},
        function(data) {
          console.log(JSON.stringify(data));
        });
      if (e.item.state){
        menu.item(e.sectionIndex, e.itemIndex, { subtitle: 'Turn Off', state: false } );
      }else{
        menu.item(e.sectionIndex, e.itemIndex, { subtitle: 'Turn On', state: true } );
      }
    }
    
    //menu.items(0, items);
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    console.log('The item subtitle is "' + e.item.subtitle + '"');
    console.log('The item state is "' + e.item.state + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    fullscreen: true,
  });
  var textfield1 = new UI.Text({
    position: new Vector2(0,40),
    size: new Vector2(144,20),
    font: 'gothic-28',
    text: 'christopher',
    textAlign: 'center'
  });
  var textfield2 = new UI.Text({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'bitham-42-bold',
    text: 'ROOS',
    textAlign: 'center'
  });
  
  var image = new UI.Image({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    image: 'images/pebble-bgnd1.png'
  });
  wind.add(image);
  wind.add(textfield1);
  wind.add(textfield2);
  wind.show();
});

main.on('click', 'down', function(e) {
  nextBottomSlide();
});
