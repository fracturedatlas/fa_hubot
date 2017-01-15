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
////////////
// command: @hubot artfully deploy 585
// output: Deploying PR #585 ..

// output: ...bebe..de..beep..

// output: PR 585 is ready to go -> http://artfully-staging-pr-585.herokuapp.com
//   - or -
// output: Had a problem deploying PR 585 -> https://dashboard.heroku.com/pipelines/78003e87-0c91-4bb2-b68f-412b38a07155
// Github API:
//    Must include header - Accept: application/vnd.github.v3+json
//    Fetch PR details like - /repos/geminisbs/nche-helpline/pulls
//       (note the PR response['head']['sha'] is used in the tarball request below)
//    Fetch Tarball of PR   - /repos/fracturedatlas/artful.ly/tarball/cab1a4352ec59e1071ff99f9310642b173607029
//       (read tarball URL from Location header in response)
// TODO:
//   Download the tarball
//   Compute tarball checksum
//   Upload tarball somewhere temporary (S3)
//   Create a Heroku build using the checksum and temporary tarball link
// Heroku API:
//    Must include header - Accept: application/vnd.heroku+json; version=3
// TODO:
//   Figure out how to make Heroku read the app.json when we trigger a build
var GitHubApi = require("github");
var Heroku = require("heroku-client");

// API
// // // // // // // // // // // // // // // // // // // // // // // // // //

function deploy(github, heroku, response, number) {
  response.reply("Deploying PR #" + number);
  github.authenticate({type: "oauth", token: process.env.HUBOT_GITHUB_TOKEN});

  getPrTarball(github, response, number);

  // var sha = pr['head']['sha'];
  // var blob = getPrTarball(sha, response);

  // createHerokuBuild(blob)
  // removePgAddon(app);
  // provisionDatabase(app);
  // provisionSolrIndex(app);
  // configureApp(app);
  // scaleProcesses(app);
}

function createReviewApp(number)
{
}

function getPullRequest(number, response) {

  github.path("/repos/fracturedatlas/artful.ly/pulls/" + number)
    .get()(function (err, res, body) {
      var data = null;
      res.reply("Reading PR #" + number);

      if (err) {
        res.reply("Had problems reading PR #" + number);
        errorHandler(err, res);
        return;
      }

      if (res.statusCode !== 200) {
        res.reply("Response from reading PR #" + number + " was NOT 200 OK");
        return;
      }

      data = JSON.parse(body);

      robot.emit('artfully-pr-read', {
        sha: data['head']['sha']
      });
    });
}

function getPrTarball(github, response, number) {
  // github.path("/repos/fracturedatlas/artful.ly/tarball/" + sha)
  //   .get()(function (err, res, body) {
  //     var data = null;
  //
  //     if (err) {
  //       res.reply("Had problems getting tarball for SHA " + sha);
  //       errorHandler(err, res);
  //       return;
  //     }
  //
  //     if (res.statusCode !== 200) {
  //       res.reply("Response from getting tarball for SHA " + number + " was NOT 200 OK");
  //       return;
  //     }
  //
  //     data = JSON.parse(body);
  //   });

  var getPrOptions = {
    owner: 'fracturedatlas',
    repo: 'artful.ly',
    number: number
  };
  github.pullRequests.get(getPrOptions, function(err, res) {

  });

  var getArchiveOptions = {
    owner: 'fracturedatlas',
    repo: 'artful.ly',
    ref: sha,
    archive_format: "tarball"
  };
  github.repos.getArchiveLink(getArchiveOptions);
}

function errorHandler(err, res) {
  if (res) {
    res.reply(err)
  }
}

module.exports = function (robot) {
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

  robot.error(errorHandler);

  return robot.respond(/deploy artfully (pr )?(\d+)/i, function(response) {
    var number = response.match[2];
    deploy(github, heroku, response, number);
  });
};
