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

  function deployPullRequest(number) {
    var app = createReviewApp(number);
    removePgAddon(app);
    provisionDatabase(app);
    provisionSolrIndex(app);
    configureApp(app);
    scaleProcesses(app);
  }

  function getPullRequest(number) {
    // GET /repos/fracturedatlas/artful.ly/pulls/:number
    // response['head']['sha']
    robot.http("https://api.github.com/repos/fracturedatlas/artful.ly/pulls/" + number)
      .header('Accept', 'application/vnd.github.v3+json')
      .header('Authorize', 'Basic Z2VtaW5pc2JzOmI5ZWZlMWY0OWM4ZWFkMDUzZTIxZmNlYjg0NjYyOTRjYjE2YWZiOWQ=')
      .get(function (err, res, body) {
        var data = null;
        robot.logger.info('-- Error');
        robot.logger.info(err);
        robot.logger.info('--');

        robot.logger.info('--- Body');
        robot.logger.info(body);
        robot.logger.info('--');


        if (err) {
          robot.logger.info("Er, whoops: ");
          robot.logger.info(err);
          return;
        }

        try {
          data = JSON.parse(body);
          robot.logger.info("PR SHA is " + data['head']['sha']);
        } catch (error) {
          robot.logger.info('--- JSON error');
          robot.logger.info(err);
          robot.logger.info('--');
          robot.logger.info("Had a problem parsing JSON - Sorry.. :(");
          return;
        }
      });
  }

  function createReviewApp(number) {
    // GET /repos/:owner/:repo/git/blobs/:sha
    var pr = getPullRequest(number);
    var blob = getGithubBlob(pr['head']['sha']);
    createHerokuBuild(blob)
  }

  function processCommand(res) {
    var number = res.match[2]
    res.send('Deploying PR ' + number);
    deployPullRequest(number);
    return;
  }

  function errorHandler(err, res) {
    robot.logger.error("DOES NOT COMPUTE")
    robot.logger.error(err);

    if (res) {
      res.reply("DOES NOT COMPUTE")
    }
  }

  /////////////////////////////
  robot.error(errorHandler);
  robot.respond(/artfully deploy (pr |PR )?(\d+)/, processCommand);
};
