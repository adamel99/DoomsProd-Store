import { csrfFetch } from "./csrf";

// Action Types
const SET_CART = "cart/SET_CART";
const CLEAR_CART = "cart/CLEAR_CART";

// Action Creators
const setCart = (cart) => ({
  type: SET_CART,
  payload: cart,
});

const clearCartAction = () => ({
  type: CLEAR_CART,
});

// Thunks

// Fetch or create the cart for the current user
export const fetchOrCreateCartThunk = () => async (dispatch) => {
  try {
    const res = await csrfFetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      dispatch(setCart(data.cart));
      return data.cart;
    }
  } catch (err) {
    console.error("Failed to fetch or create cart:", err);
    return err;
  }
};

// Update cart total (optional if computed client-side)
export const updateCartTotalThunk = (total) => async (dispatch) => {
  try {
    const res = await csrfFetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total }),
    });
    if (res.ok) {
      const data = await res.json();
      dispatch(setCart(data.cart));
      return data.cart;
    }
  } catch (err) {
    console.error("Failed to update cart total:", err);
    return err;
  }
};

// Delete the user's cart
export const deleteCartThunk = () => async (dispatch) => {
  try {
    const res = await csrfFetch("/api/cart", {
      method: "DELETE",
    });
    if (res.ok) {
      dispatch(clearCartAction());
      return "Cart deleted";
    }
  } catch (err) {
    console.error("Failed to delete cart:", err);
    return err;
  }
};

// Initial State
const initialState = {
  currentCart: null,
};

// Reducer
const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CART:
      return { ...state, currentCart: action.payload };
    case CLEAR_CART:
      return { ...state, currentCart: null };
    default:
      return state;
  }
};

export default cartReducer;
