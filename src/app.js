/* jshint undef: true, unused: false */
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
var Accel = require('ui/accel');
var Settings = require('settings');

var hueIP = '192.168.0.18';
var hueUser = 'newdeveloper';
var hueApiCall = 'http://'+hueIP+'/api/'+hueUser;

var coordinates = false;
var locationinfo = false;
var units = 'metric';
var windspeed = 'm/s';
var hum = 'hum';

var curSlideItem = 0;
var nextSlideItem = 1;
var slideItems = [];




//Settings.option('group_names', undefined );
//Settings.option('0', undefined );
//Settings.option('1', undefined );


var initialized = false;
var options = {};

Pebble.addEventListener("ready", function() {
  console.log("ready called!");
  initialized = true;
});

Pebble.addEventListener("showConfiguration", function() {
  console.log("showing configuration");
  console.log("Options = " + JSON.stringify(options));
  Pebble.openURL('http://192.168.0.62/GIT/privat/pebble-settings/index.php?'+encodeURIComponent(JSON.stringify(options)));
});

Pebble.addEventListener("webviewclosed", function(e) {
  console.log("configuration closed");
  // webview closed
  //Using primitive JSON validity and non-empty check
  if (e.response.charAt(0) == "{" && e.response.slice(-1) == "}" && e.response.length > 5) {
    options = JSON.parse(decodeURIComponent(e.response));
    
    console.log("Options = " + JSON.stringify(options));
  } else {
    console.log("Cancelled");
  }
});


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

// FORECAST WEATHER ITEM
var fwi_1 = new UI.Image({
  position: new Vector2(10, 46),
  size: new Vector2(40, 40),
  image: 'images/01d.png',
  compositing: 'set'
});
var fwi_2 = new UI.Image({
  position: new Vector2(10, 86),
  size: new Vector2(40, 40),
  image: 'images/01d.png',
  compositing: 'set'
});
var fwi_3 = new UI.Image({
  position: new Vector2(10, 126),
  size: new Vector2(40, 40),
  image: 'images/01d.png',
  compositing: 'set'
});
var fwt_1 = new UI.Text({
  position: new Vector2(60, 48),
  size: new Vector2(150, 40),
  font: 'gothic-28',
  text: '?°',
  textAlign: 'left'
});
var fwt_2 = new UI.Text({
  position: new Vector2(60, 88),
  size: new Vector2(150, 40),
  font: 'gothic-28',
  text: '?°',
  textAlign: 'left'
});
var fwt_3 = new UI.Text({
  position: new Vector2(60, 128),
  size: new Vector2(150, 40),
  font: 'gothic-28',
  text: '?°',
  textAlign: 'left'
});

slideItems.push([
  {showTime: false},
  {field: fwi_1, mainPos: { x: fwi_1.position().x, y: fwi_1.position().y }},
  {field: fwi_2, mainPos: { x: fwi_2.position().x, y: fwi_2.position().y }},
  {field: fwi_3, mainPos: { x: fwi_3.position().x, y: fwi_3.position().y }},
  {field: fwt_1, mainPos: { x: fwt_1.position().x, y: fwt_1.position().y }},
  {field: fwt_2, mainPos: { x: fwt_2.position().x, y: fwt_2.position().y }},
  {field: fwt_3, mainPos: { x: fwt_3.position().x, y: fwt_3.position().y }},
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
main.add(fwi_1); // FORECAST WEATHER ITEMS
main.add(fwi_2); // FORECAST WEATHER ITEMS
main.add(fwi_3); // FORECAST WEATHER ITEMS
main.add(fwt_1); // FORECAST WEATHER ITEMS
main.add(fwt_2); // FORECAST WEATHER ITEMS
main.add(fwt_3); // FORECAST WEATHER ITEMS

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

// weather object
var weatherObj = weatherObj || {
  getCurrent: function(){
    //http://api.openweathermap.org/data/2.5/weather?q=Taastrup,dk&units=metric
    //var callUrl = 'http://api.openweathermap.org/data/2.5/weather?q='+locationinfo.locality.short_name+','+locationinfo.country.short_name+'&units='+units;
    //var callUrl = 'http://api.openweathermap.org/data/2.5/find?lat=55.68225839999999&lon=12.5806846&cnt=1'+'&units='+units;
    var callUrl = 'http://api.openweathermap.org/data/2.5/find?lat='+coordinates.latitude+'&lon='+coordinates.longitude+'&cnt=1&units='+units;
    console.log(JSON.stringify(locationinfo));
    ajax({ url: callUrl, type: 'json'},
      function(data) {
        data = data.list[0];
        console.log('weather: '+callUrl);
        console.log(JSON.stringify(data));
        console.log('icon: '+data.weather[0].icon);
        cwt_1.text(parseInt(data.main.temp)+'°');
        var str = parseInt(data.wind.speed) + ' ' + windspeed + '\n'+data.main.humidity+' '+hum;
        cwt_2.text(str);
        cwi_1.image('images/'+data.weather[0].icon+'.png');
    });
    callUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+coordinates.latitude+'&lon='+coordinates.longitude+'&cnt=5&units='+units;
    console.log(JSON.stringify(locationinfo));
    ajax({ url: callUrl, type: 'json'},
      function(data) {
        console.log(JSON.stringify(data));
        var d_names = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
        d_names = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
        fwi_1.image('images/'+data.list[1].weather[0].icon+'.png');
        fwi_2.image('images/'+data.list[2].weather[0].icon+'.png');
        fwi_3.image('images/'+data.list[3].weather[0].icon+'.png');

        var d = new Date(data.list[1].dt*1000);
        fwt_1.text(parseInt(data.list[1].temp.day)+'°  '+d_names[d.getDay()] );
        d = new Date(data.list[2].dt*1000);
        fwt_2.text(parseInt(data.list[2].temp.day)+'°  '+d_names[d.getDay()]);
        d = new Date(data.list[3].dt*1000);
        fwt_3.text(parseInt(data.list[3].temp.day)+'°  '+d_names[d.getDay()]);
    });    
    
  }
};
// End: weather object

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
    console.log('coordinates != pos.coords');
    console.log(JSON.stringify(coordinates));
    console.log(JSON.stringify(pos.coords));
    console.log(coordinates != pos.coords);
    
    // JS cannot compare two objects -- so stringify them first!
    if ( JSON.stringify(coordinates) !== JSON.stringify(pos.coords) ) {
      coordinates = pos.coords;
      //coordinates = {latitude: '55.682401', longitude: '12.580773'};// Kbh
      //coordinates = {latitude: '55.662363', longitude: '12.302768'};// Taastrup
      // http://maps.googleapis.com/maps/api/geocode/json?latlng=55.66268129528441,12.302745318828144
      ajax({ url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+coordinates.latitude+','+coordinates.longitude, type: 'json' },
        function(data) {
          //console.log(JSON.stringify(data.results[0].formatted_address));       
          locationinfo = {latitude: coordinates.latitude, longitude: coordinates.longitude};
          data.results[0].address_components.forEach(function (element, index) {
            locationinfo[element.types[0]] = element;
          });        
          //console.log(JSON.stringify(locationinfo));
          var locstr = locationinfo.route.short_name +' '+ locationinfo.street_number.short_name + '\n' + locationinfo.locality.short_name;      
          clt_1.text(locstr);
          weatherObj.getCurrent();
      });
    }else{
      console.log('Same Location');
    }
  },
  locationError: function(err){
    console.warn('location error (' + err.code + '): ' + err.message);
  }
  
};
// End: currentLocation object
locationObj.getLocation();

// Watch Location Var and update


// End: Watch Location



//var hueSelectLightsObj = require('hue.js').hueSelectLightsObj;
var hueSelectLightsObj = hueSelectLightsObj || {
    init: function(){
    this.Menu = new UI.Menu({
      backgroundColor: 'black',
      textColor: 'blue',
      highlightBackgroundColor: 'blue',
      highlightTextColor: 'black',
      compositing: 'set',
      sections: []
    });
      
    this.Menu.on('select', function(e) {
      //console.log('hueSelectLightsObj > self.selectItem(e)');
      this.selectItem(e);
    }.bind(this));
      
    this.Menu.on('hide', function(e){
      var newGroup = {name:"Group1", lights: []};
      for (var key in this.allLights){
        //console.log(JSON.stringify(this.allLights[key]));
        if (this.allLights[key].added){
          //console.log('added :)');
          newGroup.lights.push( this.allLights[key].lightNb );
        }
      }
      //console.log(JSON.stringify(newGroup));
      newGroup.name = "Lights: "+ newGroup.lights.join();
      var callUrl = hueApiCall+'/groups/';
      ajax({ url: callUrl, method: 'post', data:newGroup, type: 'json'},
        function(data) {
          //console.log(JSON.stringify(data));
          hueMenuObj.updateSections(); // Hvad gør vi her?
        });
    }.bind(this));
      
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
          //console.log(JSON.stringify(data));
          for (var key in data) {
            var curLight = {
              title: decodeURIComponent(data[key].name),
              icon: 'images/pebble-checkmark-off.png',
              //subtitle: ' ',
              lightNb: key,
              added: false,
            };
            //console.log(JSON.stringify(curLight));
            this.allLights.push(curLight);
          }
          this.Menu.items(0, this.allLights);
        }.bind(this));
    
    this.Menu.items(0, this.allLights);
  },
  selectItem: function(e){
    if (e.itemIndex>0){
      //var callUrl = 'http://192.168.0.18/api/newdeveloper/lights/'+e.item.lightNb+'/state';
      //ajax({ url: callUrl, method: 'put', data:{"on":e.item.state}, type: 'json'},
      //  function(data) {
      //    console.log(JSON.stringify(data));
      //  });
      //console.log(JSON.stringify(e.item));
      if (e.item.added){
        this.Menu.item(e.sectionIndex, e.itemIndex, { icon: 'images/pebble-checkmark-off.png', added: false } );
      }else{
        this.Menu.item(e.sectionIndex, e.itemIndex, { icon: 'images/pebble-checkmark-on.png', added: true } );
      }      
    }
  }
};

// var hueMenuObj = require('hue.js').hueMenuObj;
var hueMenuObj = hueMenuObj || {
  init: function(){
    var self = this;
    this.Menu = new UI.Menu({
      backgroundColor: 'black',
      textColor: 'blue',
      highlightBackgroundColor: 'blue',
      highlightTextColor: 'black',
      sections: []
    });
    
    this.Menu.on('select', function(e) {
      //console.log('hueMenuObj > self.selectItem(e)');
      this.selectItem(e);
    }.bind(this));
    
    this.Menu.on('longSelect', function(e){
      console.log(JSON.stringify(e.item));
      // Delete current group (groupID);
      ajax({ url: hueApiCall+'/groups/'+e.item.groupID+'/', method: 'delete', type: 'json'},
        function(data) {
          //console.log(JSON.stringify(data));
          this.updateSections();
        }.bind(this));
    }.bind(this));
    
    this.updateSections();
    this.Menu.show();
  },
  updateSections: function(){
    this.allLights = [{
        title: 'Add Group',
        //icon: 'images/menu_icon.png',
        subtitle: 'Select lights',
        action: function(){ hueSelectLightsObj.init(); } // Hvad gør vi her?
      }];
    ajax({ url: hueApiCall+'/groups/', method: 'get', type: 'json'},
         function(data){
           for (var key in data){
             //console.log(JSON.stringify(data[key]));           
             var thisGroup = {
               title: data[key].name,
               subtitle: (data[key].action.on ? "Turn Off" : "Turn On"),
               on: data[key].action.on,
               groupID: key,
               action: function(e){
                 //console.log(e.item.on);
                 var nextState = (e.item.on) ? false : true;
                 //console.log(nextState);
                 this.Menu.item(e.sectionIndex, e.itemIndex, { on: nextState, subtitle: (nextState ? "Turn Off" : "Turn On") } );
                 ajax({ url: hueApiCall+'/groups/'+e.item.groupID+'/action', data:{on: nextState, "bri":150,"sat":100,"hue":2000}, method: 'put', type: 'json'},
                      function(data) {
                      });
               }.bind(this)
             };
             this.allLights.push(thisGroup);
           }
           //console.log('hueMenuObj.allLights');
           //console.log(JSON.stringify(this.allLights));
           //console.log(JSON.stringify(this.allLights[this.allLights.length-1]));
           //console.log(this.allLights.length-1);
           this.Menu.items(0, this.allLights);
         }.bind(this));
    this.Menu.items(0, this.allLights);
  },
  selectItem: function(e){
    e.item.action(e);
  }
};

var hueGroupSettingObj = hueGroupSettingObj || {
    init: function(){
    this.Menu = new UI.Menu({
      backgroundColor: 'black',
      textColor: 'blue',
      highlightBackgroundColor: 'blue',
      highlightTextColor: 'black',
      sections: []
    });
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

// TIMERS AND INTERVALS
  setInterval(function(){ 
    locationObj.getLocation();
    console.log('interval geolocation');
  }, 60000);
//////////////////////////

Accel.init();
Accel.on('tap', function(e) {
  //clt_1.text('Searching');
  locationObj.getLocation();
  console.log('Tap event on axis: ' + e.axis + ' and direction: ' + e.direction);
});
