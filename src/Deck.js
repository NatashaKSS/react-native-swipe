/**
 * Refer to React Native Advanced Concepts Sections 2 - 5 for full tutorial
 */

import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {
    onSwipeLeft: () => {},
    onSwipeRight: () => {},
  }

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
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('RIGHT');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('LEFT');
        } else {
          this.resetPosition();
        }
      },
    });

    this.state = {
      panResponder,
      position,
      index: 0,
    };
  }

  // Ensures that whenever the component is about to be re-rendered with a new
  // set of props, if we receive new data, we reset state's swipable card index
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) { // receiving new set of items
      this.setState({ index: 0 });
    }
  }

  // At every update cycle, we are changing the position of our cards by
  // 10 pixels (cascading deck effect). Hence we want to animate that change
  // of 10 pixels
  componentWillUpdate() {
    // GOTCHA 2: Android compatibility issues
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    if (direction === 'RIGHT') {
      onSwipeRight(item);
    } else if (direction === 'LEFT') {
      onSwipeLeft(item);
    }
    // reset next top card's position, if not, the next card's "initial" position
    // will be the last card's swiped out position, that is, out of the screen
    this.state.position.setValue({ x: 0, y: 0 });

    this.setState({ index: this.state.index + 1 }); // set index of next top card
  }

  getCardStyle() {
    const ROT_DAMPEN = 1.5; // higher === dampened & slower card rotation
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * ROT_DAMPEN, 0, SCREEN_WIDTH * ROT_DAMPEN],
      outputRange: ['-120deg', '0deg', '120deg'],
    }); // linear interpolation associating dx (distance dragged) with degrees

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 },
    }).start();
  }

  forceSwipe(direction) {
    let x = SCREEN_WIDTH; // implicit: default direction is 'RIGHT'
    if (direction === 'LEFT') {
      x = -SCREEN_WIDTH;
    }

    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
    }).start(() => this.onSwipeComplete(direction));
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if (i < this.state.index) {
        // Cards we've already swiped as tracked by our "index" var in state
        return null;
      }

      if (i === this.state.index) {
        // The card that is swipable
        // GOTCHA 1: When you promote a <View> to an <Animated.View>, React Native
        // re-renders and thus causes the image to "flash" for a brief moment
        // as it searches for the image URL to render.
        return (
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle]}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }

      // All other cards below the swipable one are uninteractable
      // GOTCHA 1: So, instead of just using <View> here, we use <Animated.View>
      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();
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

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH,
  },
};

export default Deck;
