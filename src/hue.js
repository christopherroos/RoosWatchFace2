/* jshint undef: true, unused: false */
/*global require, module */
var UI = require('ui');
var ajax = require('ajax');

var hueIP = '192.168.0.18';
var hueUser = 'newdeveloper';
var hueApiCall = 'http://'+hueIP+'/api/'+hueUser;

  
module.exports.hueSelectLightsObj = {
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
    console.log('hueApiCall+/lights/');
    console.log(hueApiCall+'/lights/');

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

module.exports.hueMenuObj = {
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
    console.log('hueApiCall+/groups/');
    console.log(hueApiCall+'/groups/');
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