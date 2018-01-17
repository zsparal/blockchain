import { connect } from "react-redux";
import { Action, Dispatch, bindActionCreators } from "redux";

import { AppState } from "data";
import { decrease, decreaseAsync, increase, increaseAsync } from "data/counter";

import Counter from "./Counter";
import { DispatchProps, PublicProps, StoreProps } from "./Counter.interfaces";

function mapStateToProps(state: AppState) {
  return { counter: state.counter.counter };
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
  return bindActionCreators(
    {
      increase,
      decrease,
      increaseAsync,
      decreaseAsync
    },
    dispatch
  );
}

export default connect<StoreProps, DispatchProps, PublicProps>(mapStateToProps, mapDispatchToProps)(
  Counter
);
