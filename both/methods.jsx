Meteor.methods({
  addPoints(userId, points) {
    Players.update(userId, { $inc: { score: +points } });
  }
});





