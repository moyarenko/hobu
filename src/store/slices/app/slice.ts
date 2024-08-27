import { createSlice } from '@reduxjs/toolkit';

import { State } from './types';

const initialState: State = {
  isLoading: true,
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clear: () => initialState,
  },
});

export const actions = {
  ...slice.actions,
};

export default slice.reducer;
