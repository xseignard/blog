(function($){
  var script = '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?\'http\':\'https\';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';
  var html = ['<a class="twitter-timeline" href="https://twitter.com/' + twitter_conf[0] + '" ',
              'data-chrome="noheader transparent" ',
              'data-widget-id="' + twitter_conf[1].replace('-','') + '">Tweets by @' + twitter_conf[0] + '</a>'].join('');
  var result = html + script;
  $('#tweets').html(result);
})(jQuery);
