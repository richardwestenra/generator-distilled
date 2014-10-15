/* jshint ignore: start */
/* jshint ignore: end */
/* globals */
$(function(){
	'use strict';



  //--- Global & cached variables ---//



  //--- Helper functions ---//

  // Round to the nearest 2 large digits (e.g. 12345 => 12000)
  function roundLarge(x) {
    for(var i=1000000; i>=10; i=i/10){
      if (x>(i*10)) {
        return Math.round(x/i)*i;
      }
    }
    return Math.round(x);
  }
  // Round to SI prefixes
  function si(x) {
    var n = { 'M': 1000000, 'K': 1000};
    for(var key in n){
      if (x>n[key]) {
        return roundLarge(x) / n[key] + key;
      }
    }
    return Math.round(x);
  }




  
  //--- Embed button ---//

  var $embed = $('#embed');
  $('.embedLink').on('click',function(e) {
    e.preventDefault();
    if ($embed.hasClass('visible')) {
      $embed.animate({bottom:'-200px'},'slow').fadeOut({queue:false}).removeClass('visible');
    } else {
      $embed.animate({bottom:'0px'},'slow').fadeIn({queue:false}).addClass('visible');
    }
  });



  //--- Reformat counter share number ---//
  
  $('.social-likes').socialLikes().on('counter.social-likes', function(event, service, number) {
    if(number > 0){
      $('.social-likes__counter_'+service).text( si(number) );
    }
  });


});