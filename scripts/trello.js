module.exports = function(robot) {
  var cronJob, tz;

  cronJob = require('cron').CronJob;
  tz = 'America/New_York'

  return new cronJob('* * * * * *', trelloBugBeGone(robot), null, true, tz);
}

var trelloBugBeGone = function(robot) {
  var list = "https://api.trello.com/1/lists/57c9b8a1e1b0111e5f373301/cards"
  var auth = "?key="+process.env.HUBOT_TRELLO_KEY+"&token="+process.env.HUBOT_TRELLO_TOKEN

  var getCards = robot.http(list + auth)
                  .get()(function(err, res, body) {
                      res = JSON.parse(body);
                      if (res.length >= 1) {
                        console.log("You guys have some bugs to fix!")
                      }
                    // then figure out posting to flowdock
                  })

  return function() {
    console.log(getCards)
  }
}
