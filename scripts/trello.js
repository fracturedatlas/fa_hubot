module.exports = function(robot) {
  var cronJob, tz;

  cronJob = require('cron').CronJob;
  tz = 'America/New_York'

  new cronJob('* 10 * * 1-5', (function(){return trelloBugBeGone(robot)}), null, true, tz);
}

return trelloBugBeGone = function(robot) {
  var list, auth;
  list = "https://api.trello.com/1/lists/58063da38e3169695b4e114e/cards"
  auth = "?key="+process.env.HUBOT_TRELLO_KEY+"&token="+process.env.HUBOT_TRELLO_TOKEN

  var getBugs = function() {
    return {"bugs":[
            {
            "http://imgur.com/ohMwHIq":"there may be as many as 3,000 different kinds of insects — more than all the other animal and plant species combined"
            },
            {
            "http://imgur.com/qoxb11l":"bugs do not have lungs, most have compound eyes and they are cold-blooded"
            },
            {
            "http://imgur.com/yMmlvTj": "bugs are the only group of invertebrates to have developed flight"
            },
            {
            "http://imgur.com/JOxfVFO": "insects were the earliest organisms to produce sounds and to sense them"
            },
            {
            "http://imgur.com/pIzcWKm": "most insects can fly"
            },
            {
            "http://imgur.com/QF4zMjc": 'the word "insect" comes from the Latin word insectum, meaning "with a notched or divided body"'
            },
            {
            "http://imgur.com/bUjIjWp": "insects were among the earliest terrestrial herbivores and acted as major selection agents on plants"
            },
            {
            "http://imgur.com/OzAj7nQ":"in contrast to eggs of other arthropods, most insect eggs are drought resistant"
            },
            {
            "http://imgur.com/Ug9peol":"the life cycles of insects vary but most hatch from eggs"
            },
            {
            "http://imgur.com/9pXes4f":"over its lifetime, a ladybug may consume as many as 5,000 aphids"
            },
            {
            "http://imgur.com/wbYC6kI":"bugs often refers to insects or arachnids and other non-aquatic arthropods"
            },
            {
            "http://imgur.com/H66YYTp":"an arthropod (from Greek arthro-, joint + podos, foot) is an invertebrate animal having an exoskeleton (external skeleton), a segmented body, and jointed appendages"
            },
            {
            "http://imgur.com/SeojoRh":"insects make up more than half of all living things in the world"
            },
            {
            "http://imgur.com/IlDUe89":"snails can have lungs or gills depending on the species and their habitat. Some marine snails actually can have lungs and some land based snails can have gills"
            },
            {
            "http://imgur.com/Z024lO9":"it's estimated that there are about 10 quintillion insects in the world"
            },
            {
            "http://imgur.com/JdvBuKw":"mantids have binocular vision, but only one ear"
            },
            {
            "http://imgur.com/A87UMHQ":"there are typically up to 40 million insects in a piece of land about the area of a football field at any given time"
            },
            {
            "http://imgur.com/8vdSe3g":'to survive the cold of winter months, many insects replace their body water with a chemical called glycerol, which acts as an "antifreeze" against the temperatures'
            },
            {
            "http://imgur.com/RUzl8Ai":"insects have been present for about 350 million years, and humans for only 130,000 years"
            },
            {
            "http://imgur.com/VqSS7CN":"army ants are individually small but travel in huge numbers - often hundreds of thousands – attacking animals in their path. Small workers sting prey to death, while larger soldier ants with big jaws defend the troop against any threat"
            },
            {
            "http://imgur.com/kgMBJ1H":"one of the most dangerous scorpions in the deathstalker scorpion, which lives in Africa and the Middle East. It uses its highly toxic venom to kill insects and other small animals"
            },
            {
            "http://imgur.com/DsIIbnE":"the golden orb-web spider spins the largest of all orb weaver spider webs, and is believed to make the strongest silk. Its web can be 1-2 metres across, and is built to catch insects such as flies, wasps and butterflies"
            },
            {
            "http://imgur.com/5wVhhfy":"hercules beetles can lift 850 times their own weight. That’s equivalent to a human lifting 10 elephants"
            },
            {
            "http://imgur.com/orOMtJy":"bees are probably the most useful of all insects to humans, because they make it possible for plants to grow by pollinating them. Some species also make honey – it’s thought they make about 10 million nectar-collecting trips to produce enough honey to fill a 450g jar"
            },
            {
            "http://imgur.com/ROnNV7f":"ladybirds can eat as many as 5,000 aphids in its lifetime, which makes them a gardener’s best friend"
            },
            {
            "http://imgur.com/e0Rdakf":"some midges – which are actually tiny bloodsucking flies – beat their wings faster than any other creature. One type achieves an astonishing 1,000 beats a second"
            },
            {
            "http://imgur.com/uTib4ap":"the raft spider is the largest spider in Britain. It spends half its life in water, and can stay under the surface for as long as an hour. It does this by using air bubbles trapped under the hairs on its body"
            },
            {
            "http://imgur.com/OUZtaVE":"an Australian tiger beetle is probably the world’s fastest running insect. A fierce hunter, it can reach speeds of 9 kilometres an hour when chasing prey. That’s pretty incredible for a little insect"
            },
            {
            "http://imgur.com/sl02xLb":"have you ever wondered if insects have ears? They do, but they’re not like mammal ears. Crickets have ‘ears’ on their legs, some hawk moths have ears on their mouthparts and mantid ears are between their back legs"
            }]
          }
  };

  var getCards = robot.http(list + auth)
                  .get()(function(err, res, body) {
                      response = JSON.parse(body);
                      jsonBugs = getBugs()
                      randomBug = jsonBugs["bugs"][Math.floor(Math.random()*jsonBugs["bugs"].length)];

                      bugFact = function() {
                        return Object.keys(randomBug).map(function(key) {
                          return randomBug[key]
                        });
                      };

                      bugImage = function() {
                        return Object.keys(randomBug);
                      };

                      if (response.length >= 10) {
                        robot.messageRoom('fracturedatlas/bottesting',
                        "Did you know that " + bugFact() + "? \n Looks like we have " +
                        response.length + " bugs in the backlog today. \n" +
                        bugImage() +
                        "👞🐛👠🐞👟🐌👞🕷👠 \n" +
                        "Squash your hearts out!")
                      }
                  })

  return function() {
    getCards
  }

}
