import { csrfFetch } from "./csrf";

const GET_ALL_PRODUCTS = "products/getAllProducts";
const CREATE_PRODUCT = "products/createProduct";
const GET_SINGLE_PRODUCT = "products/getSingleProduct";
const DELETE_PRODUCT = "products/deleteProduct";
const UPDATE_PRODUCT = "products/updateProduct";

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
}

// Action Creators
const getAllProducts = (products) => ({
  type: GET_ALL_PRODUCTS,
  payload: products,
});

const getSingleProduct = (product) => ({
  type: GET_SINGLE_PRODUCT,
  payload: product,
});

const createProduct = (product) => ({
  type: CREATE_PRODUCT,
  payload: product,
});

const deleteProduct = (productToDelete) => ({
  type: DELETE_PRODUCT,
  payload: productToDelete,
});

const updateProduct = (product) => ({
  type: UPDATE_PRODUCT,
  payload: product,
});

// Thunks

export const getAllProductsThunk = () => async (dispatch, getState) => {
  try {
    const res = await csrfFetch("/api/products");
    const data = await res.json();

    dispatch(getAllProducts(data.products));
    return data.products;
  } catch (err) {
    console.error("Failed to fetch all products:", err);
    return [];
  }
};

export const getSingleProductThunk = (productId) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/products/${productId}`);
    if (res.ok) {
      const product = await res.json();
      dispatch(getSingleProduct(product));
      return product;
    }
  } catch (err) {
    console.error("Failed to fetch single product:", err);
    return null;
  }
};

// products.js (redux thunk file)

export const createProductThunk = (product) => async (dispatch) => {
  try {
    const isFormData = product instanceof FormData;

    if (isFormData) {
      const csrfToken = getCookie('XSRF-TOKEN'); // adjust name if different

      const response = await fetch("/api/products", {
        method: "POST",
        body: product,
        credentials: "include",
        headers: {
          "XSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create product");
      }

      const newProduct = await response.json();
      dispatch(createProduct(newProduct));
      return newProduct;
    } else {
      const response = await csrfFetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create product");
      }

      const newProduct = await response.json();
      dispatch(createProduct(newProduct));
      return newProduct;
    }
  } catch (err) {
    console.error("Failed to create product:", err);
    return null;
  }
};



export const deleteProductThunk = (productId) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(deleteProduct({ id: productId }));
      return data;
    }
  } catch (err) {
    console.error("Failed to delete product:", err);
    return null;
  }
};

export const updateProductThunk = (productId, updatedData) => async (dispatch) => {
  try {
    const isFormData = updatedData instanceof FormData;

    const res = await csrfFetch(`/api/products/${productId}`, {
      method: "PUT",
      ...(isFormData
        ? { body: updatedData }
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          }),
    });

    if (res.ok) {
      const updatedProduct = await res.json();
      dispatch(updateProduct(updatedProduct));
      return updatedProduct;
    }
  } catch (err) {
    console.error("Failed to update product:", err);
    return null;
  }
};




// Initial State
const initialState = { allProducts: {}, singleProduct: {} };

// Reducer
const productsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_PRODUCTS: {
      const productsById = {};
      action.payload.forEach((product) => {
        productsById[product.id] = {
          ...product,
          licenses: product.licenses || [] // safe default
        };
      });
      return { ...state, allProducts: productsById };
    }


    case GET_SINGLE_PRODUCT:
      return {
        ...state,
        singleProduct: {
          ...action.payload,
          licenses: action.payload.licenses || []
        }
      };


    case CREATE_PRODUCT:
      return {
        ...state,
        allProducts: {
          ...state.allProducts,
          [action.payload.id]: action.payload,
        },
      };

    case DELETE_PRODUCT: {
      const updatedProducts = { ...state.allProducts };
      delete updatedProducts[action.payload.id];
      return { ...state, allProducts: updatedProducts, singleProduct: {} };
    }

    case UPDATE_PRODUCT:
      console.log("✅ UPDATE_PRODUCT reducer payload:", action.payload); // ADD THIS
      return {
        ...state,
        allProducts: {
          ...state.allProducts,
          [action.payload.id]: {
            ...state.allProducts[action.payload.id],
            ...action.payload,
            licenses: action.payload.licenses || [] // always safe
          },
        },
        singleProduct: {
          ...action.payload,
          licenses: action.payload.licenses || []
        }
      };


    default:
      return state;
  }
};

export default productsReducer;
