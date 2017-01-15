// Description:
//   Deploys Artful.ly PR
//
// Dependencies:
//   "<module name>": "<module version>"
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
// output: Sure boss, one second while I deploy PR 585 ..

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

module.exports = function (robot) {

  var github = robot.http("https://api.github.com")
    .header('Accept', 'application/vnd.github.v3+json')
    .header('Authorization', 'Basic Z2VtaW5pc2JzOmI5ZWZlMWY0OWM4ZWFkMDUzZTIxZmNlYjg0NjYyOTRjYjE2YWZiOWQ=');


  function deployPullRequest(number, response) {

    response.reply("Reading PR #" + number);
    getPullRequest(number, response);

    var sha = pr['head']['sha'];
    var blob = getGithubBlob(sha, response);
    createHerokuBuild(blob)


    removePgAddon(app);
    provisionDatabase(app);
    provisionSolrIndex(app);
    configureApp(app);
    scaleProcesses(app);
  }

  function createReviewApp(number) {
  }

  function getPullRequest(number, response) {

    github.path("/repos/fracturedatlas/artful.ly/pulls/" + number)
      .get()(function (err, res, body) {
        var data = null;

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
        robot.emit('get-pull-request', {
          sha: data['head']['sha']
        });
      });
  }

  function getGithubBlob(sha, response) {
    github.path("/repos/fracturedatlas/artful.ly/tarball/" + sha)
      .get()(function(err, res, body) {
        var data = null;

        if (err) {
          errorHandler(err, res);
          return;
        }


      });
  }

  function errorHandler(err, res) {
    robot.logger.error(err);

    if (res) { res.reply(err) }
  }

  robot.error(errorHandler);

  /////////////////////////////


  return robot.respond(/deploy artfully (pr )?(\d+)/i, function(response) {
    var number = response.match[2];

    deployPullRequest(number, response);
  });
};
