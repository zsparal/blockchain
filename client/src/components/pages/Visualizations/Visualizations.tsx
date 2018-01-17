import React from "react";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { Badge, Button, Icon, Divider } from "antd";

import { repeat } from "core/util";
import { AppState } from "data";
import { start, pause, reset, setAttackers } from "data/proof-of-work";

import "./Visualizations.scss";

interface Node {
  readonly index: number;
  readonly type: "attacker" | "user" | "boundary";
}

interface StoreProps {
  attackers: number;
  users: number;
  nodes: Node[];
  target: number;
  validProgress: number;
  attackerProgress: number;
}

interface DispatchProps {
  start(): void;
  pause(): void;
  reset(): void;
  setAttackers(attackers: number): void;
}

const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",

  // change background colour if dragging
  border: isDragging ? "1px solid #1890ff" : "inherit",

  // styles we need to apply on draggables
  ...draggableStyle
});

const FixedDraggable = Draggable as any;

export class Visualizations extends React.PureComponent<StoreProps & DispatchProps> {
  render() {
    const { nodes, attackers, users } = this.props;
    return (
      <div className="visualizations">
        <div className="controls">
          <Button onClick={this.start} className="simulation-control" type="primary">
            Start
          </Button>
          <Button onClick={this.pause} className="simulation-control">
            Pause
          </Button>
          <Button onClick={this.reset} className="simulation-control" type="danger">
            Reset
          </Button>
        </div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {provided => (
              <div
                className="ant-list ant-list-sm ant-list-split ant-list-bordered "
                ref={provided.innerRef}
              >
                {nodes.map(item => (
                  <FixedDraggable
                    key={item.index}
                    draggableId={`vis-${item.index}`}
                    index={item.index}
                  >
                    {(provided: any, snapshot: any) => (
                      <div>
                        <div
                          className="ant-list-item"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          {item.type === "boundary" ? (
                            <Divider className="boundary">
                              <div>
                                <Icon type="up" />
                                <span className="adversaries">Adversaries ({attackers})</span>
                                <span className="users">Users ({users - attackers})</span>
                                <Icon type="down" />
                              </div>
                              <div>{Math.round(attackers * 100 / users)}%</div>
                            </Divider>
                          ) : (
                            this.renderProgress(item)
                          )}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </FixedDraggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }

  start = () => {
    this.props.start();
  };

  pause = () => {
    this.props.pause();
  };

  reset = () => {
    this.props.reset();
  };

  renderProgress(node: Node) {
    const { validProgress, attackerProgress } = this.props;
    const elements = node.type === "attacker" ? attackerProgress : validProgress;
    return (
      <div className="mining-progress">
        {[...Array(elements).keys()].map((_, index) => (
          <Badge key={index} status={node.type === "attacker" ? "error" : "success"} />
        ))}
      </div>
    );
  }

  onDragEnd = (result: DropResult) => {
    if (result.destination) {
      this.props.setAttackers(result.destination.index);
    }
  };
}

export default connect<StoreProps, DispatchProps>(
  ({ proofOfWork }: AppState) => ({
    target: proofOfWork.target,
    attackers: proofOfWork.attackers,
    users: proofOfWork.users,
    nodes: [
      ...repeat<Node>(proofOfWork.attackers, index => ({ index, type: "attacker" })),
      { index: proofOfWork.attackers, type: "boundary" } as Node,
      ...repeat<Node>(proofOfWork.users - proofOfWork.attackers, index => ({
        index: proofOfWork.attackers + 1 + index,
        type: "user"
      }))
    ],
    validProgress: proofOfWork.validProgress,
    attackerProgress: proofOfWork.attackerProgress
  }),
  (dispatch: Dispatch<any>) => bindActionCreators({ setAttackers, start, pause, reset }, dispatch)
)(Visualizations);
