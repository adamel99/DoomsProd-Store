import { csrfFetch } from "./csrf";

// Action Types
const GET_ALL_LICENSES = "licenses/getAllLicenses";
const CREATE_LICENSE = "licenses/createLicense";
const DELETE_LICENSE = "licenses/deleteLicense";

// Action Creators
const getAllLicenses = (licenses) => ({
  type: GET_ALL_LICENSES,
  payload: licenses,
});

const createLicense = (license) => ({
  type: CREATE_LICENSE,
  payload: license,
});

const deleteLicense = (licenseId) => ({
  type: DELETE_LICENSE,
  payload: licenseId,
});

// Thunks

// Get all licenses (independent licenses, mostly for beats)
export const getAllLicensesThunk = () => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/licenses`);
    const data = await res.json(); // <- data is the array of licenses
    dispatch(getAllLicenses(data)); // NOT data.licenses
    return data;
  } catch (err) {
    console.error("Error fetching licenses:", err);
    return err;
  }
};


// Create a license (Admin only)
export const createLicenseThunk = (licenseData) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/licenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(licenseData),
    });

    if (res.ok) {
      const newLicense = await res.json();
      dispatch(createLicense(newLicense));
      return newLicense;
    }
  } catch (err) {
    console.error("Error creating license:", err);
    return err;
  }
};

// Delete a license
export const deleteLicenseThunk = (licenseId) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/licenses/${licenseId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      dispatch(deleteLicense(licenseId));
      return "License deleted successfully";
    }
  } catch (err) {
    console.error("Error deleting license:", err);
    return err;
  }
};

// Reducer
const initialState = {
  licenses: {}, // all licenses keyed by id
};

const licensesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_LICENSES: {
      const licensesMap = {};
      action.payload.forEach((license) => {
        licensesMap[license.id] = license;
      });
      return { ...state, licenses: licensesMap };
    }

    case CREATE_LICENSE: {
      return {
        ...state,
        licenses: {
          ...state.licenses,
          [action.payload.id]: action.payload,
        },
      };
    }

    case DELETE_LICENSE: {
      const updatedLicenses = { ...state.licenses };
      delete updatedLicenses[action.payload];
      return { ...state, licenses: updatedLicenses };
    }

    default:
      return state;
  }
};

export default licensesReducer;
