import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '@/services/authService';
import { setAccessToken, getErrorMessage } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

const rejectValue = (error, thunkAPI) =>
  thunkAPI.rejectWithValue(getErrorMessage(error));

export const registerThunk = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const { user, accessToken } = await authService.register(payload);
    setAccessToken(accessToken);
    return user;
  } catch (e) {
    return rejectValue(e, thunkAPI);
  }
});

export const loginThunk = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const { user, accessToken } = await authService.login(payload);
    setAccessToken(accessToken);
    return user;
  } catch (e) {
    return rejectValue(e, thunkAPI);
  }
});

/** Called on app boot: try the refresh cookie, then load the current user. */
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, thunkAPI) => {
  try {
    const { accessToken } = await authService.refresh();
    setAccessToken(accessToken);
    const { user } = await authService.me();
    return user;
  } catch (e) {
    return thunkAPI.rejectWithValue(null); // silent — just means "not logged in"
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } finally {
    // Full teardown: memory token, then all cached server data so the next
    // user never sees the previous session's feed/chats/notifications.
    setAccessToken(null);
    queryClient.clear();
  }
  return null;
});

const initialState = {
  user: null,
  isAuthenticated: false,
  status: 'idle', // idle | loading | succeeded | failed
  bootstrapped: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    clearError(state) {
      state.error = null;
    },
    forceLogout(state) {
      state.user = null;
      state.isAuthenticated = false;
      setAccessToken(null);
    },
  },
  extraReducers: (builder) => {
    const onAuthSuccess = (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    };

    builder
      .addCase(registerThunk.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(registerThunk.fulfilled, onAuthSuccess)
      .addCase(registerThunk.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload;
      })
      .addCase(loginThunk.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(loginThunk.fulfilled, onAuthSuccess)
      .addCase(loginThunk.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload;
      })
      .addCase(bootstrapAuth.fulfilled, (s, a) => {
        s.user = a.payload;
        s.isAuthenticated = true;
        s.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (s) => {
        s.bootstrapped = true;
      })
      .addCase(logoutThunk.fulfilled, (s) => {
        s.user = null;
        s.isAuthenticated = false;
        s.status = 'idle';
      });
  },
});

export const { setUser, clearError, forceLogout } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
