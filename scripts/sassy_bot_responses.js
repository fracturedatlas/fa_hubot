module.exports = function(robot) {
  return robot.hear(/(want to|wanna|lets|can we|are you free to|would like to)( pair)/i, function(res) {
    var response;
    responses = ["No thanks -- but here's a banana 🍌",
                 "But I already have so many 🍏🍎 apples! 🍏🍎",
                 "Peaches sound more appetizing right now 🍑",
                 "🍐 ?!?"];
    response = responses[Math.floor(Math.random() * responses.length)]
    res.reply(response);
  });
};
