import React from "react";

import { Button } from "antd";

import { Props } from "./Counter.interfaces";
import "./Counter.scss";

export default class Counter extends React.PureComponent<Props> {
  render() {
    const { counter, counterColor } = this.props;
    return (
      <div>
        <div>
          <span>Counter</span>
          <span id="counter" style={{ color: counterColor, marginLeft: "6px" }}>
            {counter}
          </span>
        </div>
        <div className="Counter__actions">
          <Button className="Counter__button" onClick={this.increase}>
            Increase
          </Button>
          <Button className="Counter__button" onClick={this.decrease}>
            Decrease
          </Button>
          <Button className="Counter__button" onClick={this.increaseAsync}>
            Increase (async)
          </Button>
          <Button className="Counter__button" onClick={this.decreaseAsync}>
            Decrease (async)
          </Button>
        </div>
      </div>
    );
  }

  private increase = () => {
    this.props.increase(1);
  };
  private decrease = () => {
    this.props.decrease(1);
  };
  private increaseAsync = () => {
    this.props.increaseAsync(10);
  };
  private decreaseAsync = () => {
    this.props.decreaseAsync(10);
  };
}
