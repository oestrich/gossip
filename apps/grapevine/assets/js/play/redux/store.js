import {combineReducers, createStore, compose} from 'redux';

import {mediaReducer} from "./mediaReducer";
import {modalReducer} from "./modalReducer";
import {promptReducer} from "./promptReducer";
import {settingsReducer} from "./settingsReducer";
import {socketReducer} from "./socketReducer";
import {voiceReducer} from "./voiceReducer";

// Selectors

export const getModals = (state) => {
  return state.modal.modals;
};

export const getPromptState = (state) => {
  return state.prompt;
};

export const getPromptDisplayText = (state) => {
  return getPromptState(state).displayText;
};

export const getSettingsState = (state) => {
  return state.settings;
};

export const getSettingsFont = (state) => {
  return getSettingsState(state).font;
};

export const getSettingsFontSize = (state) => {
  return getSettingsState(state).fontSize;
};

export const getSettingsLineHeight = (state) => {
  return getSettingsState(state).lineHeight;
};

export const getSettingsOpen = (state) => {
  return getSettingsState(state).open;
};

export const getSocketState = (state) => {
  return state.socket;
};

export const getSocketConnectionState = (state) => {
  return getSocketState(state).connected;
}

export const getSocketConnection = (state) => {
  return getSocketState(state).connection;
}

export const getSocketPromptType = (state) => {
  return getSocketState(state).options.promptType;
};

export const getSocketLines = (state) => {
  let socketState = getSocketState(state);

  if (socketState.lastLine) {
    return [...socketState.lines, socketState.lastLine];
  };

  return socketState.lines;
};

export const getSocketGMCP = (state) => {
  return getSocketState(state).gmcp;
};

export const getSocketOAuth = (state) => {
  return getSocketState(state).oauth;
};

export const getVoiceState = (state) => {
  return state.voice;
};

export const getVoiceSynthesisPresent = (state) => {
  return getVoiceState(state).synthesisPresent;
};

export const getVoiceCurrentVoice = (state) => {
  return getVoiceState(state).currentVoice;
};

export const getVoiceVoices = (state) => {
  return getVoiceState(state).voices;
};

// Reducers

let rootReducer = combineReducers({
  media: mediaReducer,
  modal: modalReducer,
  prompt: promptReducer,
  settings: settingsReducer,
  socket: socketReducer,
  voice: voiceReducer
});

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

const enhancer = composeEnhancers();

export const makeStore = () => {
  return createStore(rootReducer, enhancer);
};
