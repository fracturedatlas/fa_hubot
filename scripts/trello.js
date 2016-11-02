module.exports = function(robot) {
  var cronJob, tz;

  cronJob = require('cron').CronJob;
  tz = 'America/New_York'

  return new cronJob('* * * * * *', trelloBugBeGone(robot), null, true, tz);
}

var trelloBugBeGone = function(robot) {
  var list, auth, bug, jsonBugs;
  list = "https://api.trello.com/1/lists/58063da38e3169695b4e114e/cards"
  auth = "?key="+process.env.HUBOT_TRELLO_KEY+"&token="+process.env.HUBOT_TRELLO_TOKEN
  jsonBugs = {"bugs":[{"http://imgur.com/ohMwHIq":"fact!"},
                      {"http://imgur.com/ohMwHIq":"Another fact!"}]}

  randomBug = jsonBugs["bugs"][Math.floor(Math.random()*jsonBugs["bugs"].length)];

  bugFact = function() {
    return Object.keys(randomBug).map(function(key) {
      return randomBug[key]
    });
  };

  bugImage = function() {
    return Object.keys(randomBug);
  };

  var getCards = robot.http(list + auth)
                  .get()(function(err, res, body) {
                      response = JSON.parse(body);

                      if (response.length >= 10) {

                        robot.messageRoom('fracturedatlas/bottesting',
                        "👞🐛👠🐞👟🐌👞🕷👠 \n" +
                        "Did you know that " + bugFact() + " and we have " +
                        response.length + " bugs in the backlog! \n" +
                        "Squash your hearts out!" +
                        bugImage())
                      }
                  })

  return function() {
    console.log(bugFact())
    console.log(getCards)
  }
}
