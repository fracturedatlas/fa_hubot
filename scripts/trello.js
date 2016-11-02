module.exports = function(robot) {
  var cronJob, tz;

  cronJob = require('cron').CronJob;
  tz = 'America/New_York'

  return new cronJob('* * * * * *', trelloBugBeGone(robot), null, true, tz);
}

var trelloBugBeGone = function(robot) {
  var list = "https://api.trello.com/1/lists/58063da38e3169695b4e114e/cards"
  var auth = "?key="+process.env.HUBOT_TRELLO_KEY+"&token="+process.env.HUBOT_TRELLO_TOKEN

  var bugs = [
    "http://imgur.com/ohMwHIq",
    "http://imgur.com/qoxb11l"
  ]

  var getCards = robot.http(list + auth)
                  .get()(function(err, res, body) {
                      response = JSON.parse(body);
                      if (response.length >= 10) {
                        robot.messageRoom('fracturedatlas/bottesting',
                        "👞🐛👠🐞👟🐌👞🕷👠 \n" +
                        response.length + " bugs in the backlog! \n" +
                        "Squash your hearts out!" +
                        bugs.random +
                        "\n 👞🐛👠🐞👟🐌👞🕷👠")
                      }
                  })

  return function() {
    console.log("HEY!")
    console.log(getCards)
  }
}
