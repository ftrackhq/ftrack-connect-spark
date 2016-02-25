import { applyMiddleware, createStore } from 'redux';

import rootReducer from './rootReducer';

export default function configureStore(initialState = {}) {
  // Compose redux middleware
  let middleware = applyMiddleware();

  const store = middleware(createStore)(rootReducer, initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./rootReducer', () => {
      const nextRootReducer = require('./rootReducer').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
