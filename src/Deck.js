import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
} from 'react-native';

class Deck extends Component {
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      // called when user presses on the screen that decides whether this
      // PanResponder instance should be responsible for this touch event
      onStartShouldSetPanResponder: () => true,

      // called many times as the user drags the draggable around the screen
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },

      // called when user removes touch from screen
      onPanResponderRelease: () => {},
    });

    this.state = { panResponder, position };
  }

  renderCards = () => {
    return this.props.data.map((item) => {
      return this.props.renderCard(item);
    });
  }

  render() {
    return (
      // panHandlers is an object that contains different callbacks that
      // help intercept presses from the user
      <Animated.View
        style={this.state.position.getLayout()}
        {...this.state.panResponder.panHandlers}
      >
        {this.renderCards()}
      </Animated.View>
    );
  }
}

export default Deck;
