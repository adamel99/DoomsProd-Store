import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import productsReducer from "./products";
import sessionReducer from "./session";
import cartsReducer from "./carts";        // or cartReducer if singular
import ordersReducer from "./orders";
import licensesReducer from "./licenses";
import playbackHistoryReducer from "./playbackHistory";
import cartItemsReducer from "./cartItems"; // Add if you have cartItems slice

const rootReducer = combineReducers({
  session: sessionReducer,
  products: productsReducer,
  orders: ordersReducer,
  licenses: licensesReducer,
  playbackHistory: playbackHistoryReducer,
  carts: cartsReducer,
  cartItems: cartItemsReducer,          // Uncomment if applicable
});

let enhancer;

if (process.env.NODE_ENV === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require("redux-logger").default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
