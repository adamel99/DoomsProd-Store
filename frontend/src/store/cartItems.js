import { csrfFetch } from "./csrf";

// Action Types
const SET_ITEMS = "cartItems/SET_ITEMS";
const ADD_ITEM = "cartItems/ADD_ITEM";
const REMOVE_ITEM = "cartItems/REMOVE_ITEM";
const UPDATE_ITEM = "cartItems/UPDATE_ITEM";
const CLEAR_ITEMS = "cartItems/CLEAR_ITEMS";

// Action Creators
const setItems = (items) => ({ type: SET_ITEMS, payload: items });
const addItem = (item) => ({ type: ADD_ITEM, payload: item });
const removeItem = (itemId) => ({ type: REMOVE_ITEM, payload: itemId });
const updateItem = (item) => ({ type: UPDATE_ITEM, payload: item });
export const clearItems = () => ({ type: CLEAR_ITEMS });

// Thunks

// Fetch all cart items
export const fetchCartItemsThunk = () => async (dispatch) => {
  try {
    const res = await csrfFetch("/api/cart-items");
    if (res.ok) {
      const data = await res.json(); // { items: [...] }
      dispatch(setItems(data.items));
      return data.items;
    }
  } catch (err) {
    console.error("Failed to fetch cart items:", err);
    return err;
  }
};

// Add item to cart
export const addToCartThunk = (productId, licenseId = null) => async (dispatch) => {
  try {
    const body = { productId };
    if (licenseId) body.licenseId = licenseId;

    const res = await csrfFetch("/api/cart-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json(); // { item: {...} }
      dispatch(addItem(data.item));
      return data.item;
    }
  } catch (err) {
    console.error("Failed to add item:", err);
    return err;
  }
};

// Update existing cart item (e.g., license change)
export const updateCartItemThunk = (itemId, updates) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/cart-items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const data = await res.json(); // { item: {...} }
      dispatch(updateItem(data.item));
      return data.item;
    }
  } catch (err) {
    console.error("Failed to update cart item:", err);
    return err;
  }
};

// Delete item from cart
export const deleteCartItemThunk = (itemId) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/cart-items/${itemId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      dispatch(removeItem(itemId));
      return "Item deleted";
    }
  } catch (err) {
    console.error("Failed to delete cart item:", err);
    return err;
  }
};

// Reducer
const initialState = {
  allItems: {},
};

const cartItemsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ITEMS: {
      const itemsMap = {};
      action.payload.forEach((item) => {
        itemsMap[item.id] = item;
      });
      return { ...state, allItems: itemsMap };
    }
    case ADD_ITEM:
    case UPDATE_ITEM:
      return {
        ...state,
        allItems: { ...state.allItems, [action.payload.id]: action.payload },
      };
    case REMOVE_ITEM: {
      const newItems = { ...state.allItems };
      delete newItems[action.payload];
      return { ...state, allItems: newItems };
    }
    case CLEAR_ITEMS:
      return { ...state, allItems: {} };
    default:
      return state;
  }
};

export default cartItemsReducer;
