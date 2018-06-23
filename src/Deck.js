import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
} from 'react-native';

class Deck extends Component {
  constructor(props) {
    super(props);

    const panResponder = PanResponder.create({
      // called when user presses on the screen that decides whether this
      // PanResponder instance should be responsible for this touch event
      onStartShouldSetPanResponder: () => {},

      // called many times as the user drags the draggable around the screen
      onPanResponderMove: () => {},

      // called when user removes touch from screen
      onPanResponderRelease: () => {},
    });

    this.state = { panResponder };
  }

  renderCards = () => {
    return this.props.data.map((item) => {
      return this.props.renderCard(item);
    });
  }

  render() {
    return(
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

export default Deck;
