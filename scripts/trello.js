module.exports = function(robot) {
  var cronJob, tz;

  cronJob = require('cron').CronJob;
  tz = 'America/New_York'

  return new cronJob('* * * * * *', trelloBugBeGone(robot), null, true, tz);

}

var trelloBugBeGone = function() {
  return function() {
    return console.log("I'm Alive!!")
  }

  // var bugList = function()
}
//
// new CronJob('* * * * * *', function() {
//   console.log('You will see this message every second');
// }, null, true, 'America/Los_Angeles');


// var cronJob, tz;
//
// cronJob = require('cron').CronJob;
//
// tz = 'America/Los_Angeles';
//
// new cronJob('0 0 9 * * 1-5', workdaysNineAm, null, true, tz);
//
// new cronJob('0 */5 * * * *', everyFiveMinutes, null, true, tz);
//
// module.exports = function(robot) {
//   var cronJob;
//   cronJob = require('cron').CronJob;
//   return new cronJob('0 */1 * * * *', everyMinute(robot), null, true);
// };
//
// var everyMinute = function(robot) {
//   return function() {
//     return robot.messageRoom('#billing', 'hey brah!');
//   };
// };



  // the number of items in the Incoming (Prod) list or Prioritized Backlog (Eng)?
  // if the number is greater than x, post message to Flowdock
  // there's an example here https://leanpub.com/automation-and-monitoring-with-hubot/read

  // runs at 9am and 12pm every Monday-Friday 00 00 09,12 * * 1-5
