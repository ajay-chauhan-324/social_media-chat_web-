import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  commandPaletteOpen: false,
  aiAssistantOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state, action) {
      state.sidebarOpen = action.payload ?? !state.sidebarOpen;
    },
    toggleAiAssistant(state, action) {
      state.aiAssistantOpen = action.payload ?? !state.aiAssistantOpen;
    },
    toggleCommandPalette(state, action) {
      state.commandPaletteOpen = action.payload ?? !state.commandPaletteOpen;
    },
  },
});

export const { toggleSidebar, toggleAiAssistant, toggleCommandPalette } = uiSlice.actions;
export default uiSlice.reducer;
