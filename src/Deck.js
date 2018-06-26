import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

  getCardStyle() {
    const ROT_DAMPEN = 1.5; // higher === dampened & slower card rotation
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * ROT_DAMPEN, 0, SCREEN_WIDTH * ROT_DAMPEN],
      outputRange: ['-120deg', '0deg', '120deg']
    }); // linear interpolation associating dx (distance dragged) with degrees

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards = () => {
    return this.props.data.map((item, index) => {
      if (index === 0) {
        return (
          <Animated.View
            key={item.id}
            style={this.getCardStyle()}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }
      return this.props.renderCard(item);
    });
  }

  render() {
    return (
      // panHandlers is an object that contains different callbacks that
      // help intercept presses from the user
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

export default Deck;
