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
  var heroku = new Heroku({debug: false, token: process.env.HUBOT_HEROKU_KEY});


  // Hubot Setup
  robot.error(function (err, res) {
    if (res) {
      res.reply(err)
    }
  });

  robot.on('artfully.deploy', function (deploy) {
    deploy.user.reply('Starting deploy for ' + deploy.herokuApp)
    getPullRequest(deploy);
  });

  robot.on('artfully.pr-ready', function (deploy) {
    readAppJson(deploy);
  });

  robot.on('artfully.app-json-ready', function (deploy) {
    getEnvOverrides(deploy);
  });

  robot.on('artfully.env-ready', function (deploy) {
    checkHerokuApp(deploy);
  });

  robot.on('artfully.heroku-build', function(deploy) {
    monitorBuild(deploy);
  });

  robot.on('artfully.heroku-pipeline-attached', function(deploy) {
  });

  return robot.respond(/deploy artfully (pr )?(\d+)/i, function (res) {
    var deploy = {
      user: res,
      githubRepo: 'artful.ly',
      githubPr: res.match[2],
      herokuParentApp: 'artfully-staging',
      herokuApp: 'artfully-staging-pr-' + res.match[2]
    };

    robot.emit('artfully.deploy', deploy);
  });


  // // // // // // // // // // // // // // // // // // // // // // // // // //
  //
  // Inspiration drawn from:
  //    https://github.com/boxxenapp/hubot-deploy/blob/master/src/deploy/heroku.coffee
  //
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
  //      -> configure env
  //      -> emit artfully.heroku-build
  //

  //  artfully.heroku-build( {..., herokuBuild: '.'} )
  //      -> (future) couple to pipeline
  //      -> wait for build to complete
  //      -> remove pg addon
  //      -> emit artfully.heroku-build-success
  //

  //  artfully.heroku-build-success
  //      -> (future) provision db
  //      -> emit artfully.database-attached

  // artfully.database-attached
  //      -> (future) provision solr
  //      -> emit artfully.deploy-complete



  function getPullRequest(deploy) {
    deploy.user.reply("Reading PR #" + deploy.githubPr);

    github.authenticate({type: "oauth", token: process.env.HUBOT_GITHUB_TOKEN});
    var getOptions = {owner: 'fracturedatlas', repo: 'artful.ly', number: deploy.githubPr};

    github.pullRequests.get(getOptions, function (err, res) {
      if (err) {
        deploy.user.reply("Had problems reading PR #" + deploy.githubPr + ": ");
        deploy.user.reply(err);
        return;
      }

      deploy.githubSha = res.head.sha;

      requestTarball(deploy);
    });
  }


  function requestTarball(deploy) {
    deploy.user.reply("Requesting Tarball of " + deploy.githubSha);

    var getArchiveOptions = {
      owner: 'fracturedatlas',
      repo: 'artful.ly',
      ref: deploy.githubSha,
      archive_format: "tarball"
    };

    github.repos.getArchiveLink(getArchiveOptions, function (err, res) {
      if (err) {
        deploy.user.reply("Had problems downloading Tarball of " + deploy.githubSha + ": ");
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
    // We need to remember what endpoint we were looking at.
    // Figure out how to make Heroku read the app.json when we trigger a build

    deploy.user.reply('Checking if Heroku app ' + deploy.herokuApp + ' exists');
    heroku.get('/apps/' + deploy.herokuApp).then(app => {
      deploy.herokuUrl = app.web_url;

      deploy.user.reply("Looks like your app's already deployed dude: " + deploy.herokuUrl);
    }, err => {
      if (err.statusCode == '404') {
        createHerokuBuild(deploy);
      } else {
        deploy.user.reply('Had problems checking for Heroku app ' + deploy.herokuApp + ':' + err.message);
      }
    });
  }

  function createHerokuApp(deploy) {
    deploy.user.reply("Creating Heroku app " + deploy.herokuApp + "...");

    heroku.post('/apps', {body: {name: deploy.herokuApp}}).then(app => {
        deploy.herokuUrl = app.web_url;
      },
      err => {
        deploy.user.reply('Had problems creating Heroku app: ' + err.message);
      });
  }

  function readAppJson(deploy) {
    deploy.user.reply("Requesting app.json ...");

    var getContentsOptions = {
      owner: 'fracturedatlas',
      repo: 'artful.ly',
      path: 'app.json'
    };

    github.repos.getContent(getContentsOptions, function (err, res) {
      if (err) {
        deploy.user.reply("Had problems downloading app.json");
        deploy.user.reply(err);
        return;
      }

      let buffer = new Buffer(res.content, 'base64');
      deploy.appJson = JSON.parse(buffer.toString('ascii'));

      deploy.user.reply("Contents of app.json: " + deploy.appJson);
      robot.emit('artfully.app-json-ready', deploy);
    });
  };


  function getEnvOverrides(deploy) {
    let requiredVars = [];
    let env = deploy.appJson.env;

    for (let i in env) {
      if (typeof env[i] == 'object' && env[i].required === true) {
        requiredVars.push(i);
      }
    }

    deploy.user.reply("Required vars: " + JSON.stringify(requiredVars));

    heroku.get('/apps/' + deploy.herokuParentApp + '/config-vars').then(config => {
      deploy.envOverrides = {};

      for (let i in requiredVars) {
        let key = requiredVars[i];

        deploy.envOverrides[key] = config[key];
      }

      deploy.user.reply("ENV overrides are:");
      deploy.user.reply(JSON.stringify(deploy.envOverrides));
      robot.emit('artfully.env-ready', deploy);

    }, err => {
      deploy.user.reply('Had problems reading config vars for Heroku app ' + deploy.herokuApp + ':' + err.message);
    });
  }

  function createHerokuBuild(deploy) {
    var buildParams = {
      body: {
        app: {name: deploy.herokuApp},
        source_blob: {
          url: deploy.githubTarball,
          checksum: '',
          version: deploy.githubSha
        },
        overrides: {
          env: deploy.envOverrides
        }
      }
    };

    deploy.user.reply("Creating Heroku build ...");
    deploy.user.reply("Build params: " + JSON.stringify(buildParams));
    // var appUrl = '/app/' + deploy.herokuApp + '/builds';
    heroku.post('/app-setups', buildParams).then(data => {
        deploy.user.reply('Build started ' + data.id);
        deploy.user.reply("The data is " + JSON.stringify(data))
        //TODO ⬇️ figure out wtf the data.outbput_stream_url is supposed to be
        //is this from the old endpoint?
        deploy.user.reply('Watch the log stream here ' + data.output_stream_url);
        deploy.herokuBuild = data.id;

        robot.emit('artfully.heroku-build', deploy);
      },
      err => {
        deploy.user.reply('Had problems starting build: ' + err.message);
        deploy.user.reply(JSON.stringify(err.body));
      });
  }


  function monitorBuild(deploy) {
    setTimeout(function() {
      checkBuild(deploy);
    }, 10000);
  }


  function checkBuild(deploy) {
    deploy.user.reply("Checking on build " + deploy.herokuBuild);
    heroku.get('/app-setups/' + deploy.herokuBuild).then(build => {
      if (deploy.isAttached !== true) { 
        attachToPipeline(deploy); 
        deploy.isAttached = true;
      }
  
      if (build.status === 'pending') {
        monitorBuild(deploy);
      } else {
        if (build.status === 'succeeded') {
          deploy.user.reply("Success! Deploy complete");
          deploy.user.reply(deploy.herokuUrl);

          robot.emit('artfully.heroku-build-success', deploy);
          return;
        }

        deploy.user.reply("Had problems building: build status is " + build.status);
        deploy.user.reply(JSON.stringify(build));
      }
    },
    err => {
      deploy.user.reply("Had problems checking build status: " + err.message);
      deploy.user.reply(JSON.stringify(err.body));
    });
  }

  function attachToPipeline(deploy) {
     var pipeline_id = '78003e87-0c91-4bb2-b68f-412b38a07155' 
     var params = {
       body: {
         app: deploy.herokuApp,
         pipeline: pipeline_id, 
         stage: 'review'
       }
     }

      heroku.post('/pipeline-couplings', params).then(response => {
        deploy.user.reply("Your app has been attached to the pipeline!");
        robot.emit('artfully.heroku-pipeline-attached', deploy);
      },

      err => {
        deploy.user.reply("Had a problem attaching your app to the pipeline: " + JSON.stringify(err) + ", The body is: " + JSON.stringify(err.body));
     });
   }  
};
