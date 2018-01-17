export interface State {
  readonly isRunning: boolean;
  readonly target: number;
  readonly stepSize: number;

  readonly users: number;
  readonly attackers: number;
  readonly validProgress: number;
  readonly attackerProgress: number;
}
