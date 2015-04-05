// On server startup, create some players if the database is empty.
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      const names = ["Ada Lovelace",
        "Grace Hopper",
        "Marie Curie",
        "Carl Friedrich Gauss",
        "Nikola Tesla",
        "Claude Shannon"];
      for (let i = 0; i < names.length; i++) {
        Players.insert({
          name: names[i],
          score: Math.floor(Random.fraction()*10)*5
        });
      }
    }
  });

