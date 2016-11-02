module.exports = function(robot) {
  var cronJob, tz;

  cronJob = require('cron').CronJob;
  tz = 'America/New_York'

  return new cronJob('* * * * * *', trelloBugBeGone(robot), null, true, tz);
}

var trelloBugBeGone = function(robot) {
  var list = "https://api.trello.com/1/lists/58063da38e3169695b4e114e/cards"
  var auth = "?key="+process.env.HUBOT_TRELLO_KEY+"&token="+process.env.HUBOT_TRELLO_TOKEN

  var getCards = robot.http(list + auth)
                  .get()(function(err, res, body) {
                      response = JSON.parse(body);
                      if (response.length >= 1) {
                        console.log("You guys have some bugs to fix!")
                        robot.messageRoom('fracturedatlas/bottesting', "@tasha!! I'm Alive <3")
                      }
                  })

  return function() {
    console.log("HEY!")
    console.log(getCards)
  }
}
