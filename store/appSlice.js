import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isLoggedIn: false,
    user: null,
  },
  reducers: {
    setLoggedIn(state, action) {
      state.isLoggedIn = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setLoggedIn, setUser, clearUser } = appSlice.actions;
export default appSlice.reducer;
