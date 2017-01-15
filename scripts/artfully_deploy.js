// Description:
//   Deploys Artful.ly PR
//
// Dependencies:
//   "github": "^8.0.0",
//   "heroku-client": "^3.0.0-beta3"
//   "bluebird": "^3.4.7"
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   hubot deploy artfully [pr #] - Deploys Pull Request to a review app
//
// Notes:
//   <optional notes required for the script>
//
// Author:
//   <wolfpakz>

var GitHubApi = require("github");
var Heroku = require("heroku-client");

module.exports = function (robot) {
  // Clients
  var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    headers: {
      "user-agent": "FracturedAtlas Hubot"
    },
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
  });
  var heroku = new Heroku({ token: process.env.HUBOT_HEROKU_KEY });


  // Hubot Setup
  robot.error(function (err, res) {
    if (res) {
      res.reply(err)
    }
  });

  robot.on('artfully.deploy', function(deploy) {
    deploy.user.reply('Starting deploy for ' + deploy.app)
    getPullRequest(deploy);
  });

  robot.on('artfully.pr-ready', function(deploy) {
    checkHerokuApp(deploy)
  });

  return robot.respond(/deploy artfully (pr )?(\d+)/i, function(res) {
    var deploy = {
      user: res,
      githubRepo: 'artful.ly',
      githubPr: res.match[2],
      herokuApp: 'artfully-staging-pr-' + res.match[2]
    };

    robot.emit('artfully.deploy', deploy);
  });


  // // // // // // // // // // // // // // // // // // // // // // // // // //


  // API
  //
  // All methods in the API receive a single <Deploy> object. The deploy process
  // is carried out via a series of emitted events and event handlers.
  //
  // Deploy object
  //   Collection of information about a deploy. Event handlers receive a Deploy
  //   object when they're called.
  //
  //   Example Object
  //   {  user: <hubot response object>,
  //      githubPr: '559',
  //      githubSha: 'cab1a4352ec59e1071ff99f9310642b173607029',
  //      herokuApp: 'artfully-staging-pr-<number>',
  //      herokuBuild: '...',
  //   }
  //
  // Event Handler
  //   A handler responds to Hubot events. New events are emitted when
  //   a handler's job is complete.
  //

  // Events
  //   artfully.deploy( {user: res, githubRepo: 'artful.ly', githubPr: '559'} )
  //      -> find the pr
  //      -> get tarball link
  //      -> emit artfully.pr-ready
  //

  //   artfully.pr-ready( {..., githubSha: '.', githubTarball: '.'} )
  //      -> find heroku app
  //      -> create heroku app if needed
  //      -> remove pg addon
  //      -> (future) provision db
  //      -> (future) provision solr
  //      -> configure env
  //      -> create heroku build
  //      -> emit artfully.heroku-build
  //

  //  artfully.heroku-build( {..., herokuBuild: '.'} )
  //      -> wait for build to complete
  //      -> emit artfully.heroku-ready
  //

  //  artfully.heroku-ready
  //      -> scale processes
  //      -> emit artfully.???


  function getPullRequest(deploy) {
    deploy.user.reply("Reading PR #" + deploy.githubPr);

    github.authenticate({type: "oauth", token: process.env.HUBOT_GITHUB_TOKEN});
    var getOptions = {owner: 'fracturedatlas', repo: 'artful.ly', number: deploy.pr};

    github.pullRequests.get(getOptions, function (err, res) {
      if (err) {
        deploy.user.reply("Had problems reading PR #" + deploy.githubPr + ": ");
        deploy.user.reply(err);
        return;
      }

      deploy.githubSha = res.head.githubSha;

      requestTarball(deploy);
    });
  }


  function requestTarball(deploy) {
    deploy.user.reply("Requesting Tarball of " + deploy.sha);

    var getArchiveOptions = {
      owner: 'fracturedatlas',
      repo: 'artful.ly',
      ref: deploy.githubSha,
      archive_format: "tarball"
    };

    github.repos.getArchiveLink(getArchiveOptions, function(err, res) {
      if (err) {
        deploy.user.reply("Had problems downloading Tarball of " + deploy.sha + ": ");
        deploy.user.reply(err);
        return;
      }

      deploy.githubTarball = res.meta.location;

      deploy.user.reply("Tarball location is " + deploy.githubTarball);
      robot.emit('artfully.pr-ready', deploy);
    });
  }

  function checkHerokuApp(deploy) {
    // TODO:
    //   Figure out how to make Heroku read the app.json when we trigger a build

    deploy.user.reply('Checking ')
  }
};
