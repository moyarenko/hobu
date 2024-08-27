import { ReduxState } from '../../store';

export const getLoading = (state: ReduxState) => state.app.isLoading;
