NetworkService.fetchAndParseTurtleXML = function () { 
  var deferred = $.Deferred();
  deferred.resolve(JSON.parse('[{"name":"Leonardo","color":"Blue","weapon":"Katanas","description":"A serious swordsman with strong eithics, Leonard is the leader of the group.","imageSource":"img/leonardo.jpg"},{"name":"Donatello","color":"Purple","weapon":"Bo","description":"Donatello is the brains of the outfit. He has a passion for science and gadgets, but doesn\'t always understand humans.","imageSource":"img/donatello.jpg"},{"name":"Raphael","color":"Red","weapon":"Sai","description":"Witty and sarcastic Raphael is never at a loss for words.","imageSource":"img/raphael.jpg"},{"name":"Michelangelo","color":"Orange","weapon":"Nunchaku","description":"A real partty dude, Michaelangelo is known for catchphrases like \"cowabunga\" and \"totally tubular\"","imageSource":"img/michelangelo.jpg"}]'));
  return deferred;
}
