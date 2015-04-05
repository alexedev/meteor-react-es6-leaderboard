// to compile es6 and jsx we use grigio:babel package

// "const" and "let" are the same as "var" but block-scoped,
// which prevents constant and variable hoisting
// see: http://es6-features.org/#BlockScopedConstants
// "const" here in forth is used for complex types: object, array, function
// (we work on a reference to their values)
// "let" is used with primitives (we work directly on their values)
// see: https://github.com/airbnb/javascript/tree/es6#references

// to load React, bind reactive data sources and
// DDP subscriptions to Components we use grove:react

// define Leaderboard React component
  const Leaderboard = React.createClass({
    // these mixins provide meteor subscriptions and reactivity
    // see grove:react README
    mixins: [ DDPMixin, ReactiveMixin ],
    // this is how we subscribe (from DDPMixin)

    subscriptions() {
    //ES6 allows us to declare methods this way instead of "subscriptions: function()"
      return Meteor.subscribe("players");
    },
    // and this how we make component's state reactive (from ReactiveMixin)
    getReactiveState() {

      //check if subscription is ready
      if ( this.subsReady() ) {
        // "selected_player" is set when we click on a player in the list (see func selectPlayer below)
        const selectedPlayer = Players.findOne(Session.get("selected_player"));
        // return state object
        return {
          user: Meteor.user() && Meteor.user().emails[0].address,
          players: Players.find({}, {sort: {score: -1, name: 1}}).fetch(),
          selectedPlayer: selectedPlayer,
          selectedName: selectedPlayer && selectedPlayer.name
        };
        // so we can refer fields later as this.state.user etc.
      }
    // we can also add React's getInitialState(), but it is not important in this case
    },
    // adds 5 points to a selected player
    addFivePoints() {
      Meteor.call("addPoints", Session.get("selected_player"), 5);
    },
    // selects player
    selectPlayer(id) {
      Session.set("selected_player", id);
    },
    // renders Player component that is defined at the bottom of the file
    // called inside Leaderboard component render() function as
    // this.state.players.map(this.renderPlayer),
    // which maps each player as a parameter "model" to this function
    renderPlayer(model) {
      //id of currently selected player
      const _id = this.state.selectedPlayer && this.state.selectedPlayer._id;

      return <Player
        //player id
        key={model._id}
        //player name etc.
        name={model.name}
        score={model.score}
        //if the player is selected, return class "selected"
        className={model._id === _id ? "selected" : ""}
        // here .bind sends context(this) and model._id as a parameter to selectPlayer function
        // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
        // (partial functions)
        onClick={this.selectPlayer.bind(this, model._id)}
        />;
    },
    //here describe how the Leaderboard component should be rendered
    render() {
      if (! this.state.players) return <p>loading..</p>

      //this message or button renders after the players' list
      let inputOrMessage;
      //if a player is selected
      if (this.state.selectedName) {
        inputOrMessage = <div className="details">
          <div className="name">{this.state.selectedName}</div>
          <input
            type="button"
            className="inc"
            value="Give 5 points"
            onClick={this.addFivePoints}
            />
        </div>
      } else {
        inputOrMessage = <div className="none">
          Click a player to select
        </div>
      }
      // this is what should be rendered
      return (
        <div className="leaderboard">
          { this.state.players.map(this.renderPlayer) }
          { inputOrMessage }
          <span>You are {this.state.user || 'not logged in :('}</span>
        </div>
      )

    }
  });

// Alternative to `React.createClass({...})` but no ES6 mixins support
// see: https://facebook.github.io/react/docs/reusable-components.html#no-mixins
  class Player extends React.Component {
    //props were defined in renderPlayer function inside <Player ... />
    constructor(props) {
      //in ES6 this is the same as React.Component.call(props)
      super(props);
    }

    render() {
      //create object through destructuring (ES6)
      //see: http://es6-features.org/#ObjectMatchingShorthandNotation
      // we start not from "key" but "name" because we needed "key" only
      // to define the value of className
      // in this case "rest" includes "className" and "onClick" properties
      const { name, score, ...rest } = this.props;
      //in ES6 this is the same as 'player ' + rest.className in ES5 and
      let classString = `player ${rest.className}`;
      return <div {...rest} className={classString}>
        <span className="name">{name}</span>
        <span className="score">{score}</span>
      </div>;
    }
  }

// On first pageload we render Leaderboard component inside the <div class="leaderboard_placeholder">
  Meteor.startup(
    //in ES6 we can define functions as "arg => ..." instead of "function (arg) {return ...}"
      argument => React.render(<Leaderboard />, document.getElementById('leaderboard_placeholder'))
  );