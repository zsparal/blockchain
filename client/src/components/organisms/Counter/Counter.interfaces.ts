export interface PublicProps {
  counterColor: string;
}

export interface StoreProps {
  counter: number;
}

export interface DispatchProps {
  increase: (value: number) => void;
  decrease: (value: number) => void;
  increaseAsync: (value: number) => void;
  decreaseAsync: (value: number) => void;
}

export type Props = PublicProps & StoreProps & DispatchProps;
