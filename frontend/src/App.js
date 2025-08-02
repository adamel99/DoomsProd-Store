import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route, Redirect } from "react-router-dom";

import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage/LandingPage";
import ProductList from "./components/ProductList/ProductList";
import ProductCard from "./components/ProductCard/ProductCard";
import NewProduct from "./components/NewProduct/NewProduct";
import CartPage from "./components/CartPage/CartPage";
import UpdateProduct from "./components/UpdateProduct/UpdateProduct"
import LicensesPage from "./components/LicenseSelector/LicenseSelector"
import ProductDetail from "./components/ProductDetail/ProductDetail";
// import OrdersPage from "./components/OrdersPage/OrdersPage";
// import PlaybackHistoryPage from "./components/PlaybackHistoryPage/PlaybackHistoryPage";

import LoginFormModal from "./components/LoginFormModal";
import SignUpFormModal from "./components/SignUpFormModal";
import AboutMe from "./components/AboutME/AboutMe";
import Checkout from "./components/Checkout/Checkout";
import CheckoutSuccess from "./components/CheckoutSuccess/CheckoutSuccess";
import CheckoutCancel from "./components/CheckoutCancel/CheckoutCancel";
import DownloadPage from "./components/Downloads/DownloadPage";


// import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import { restoreUser } from "./store/session";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/products" component={ProductList} />
          <Route exact path="/products/new" component={NewProduct} />
          <Route exact path="/products/:productId" component={ProductDetail} />

          <Route exact path="/cart" component={CartPage} />
          <Route exact path="/products/:productId/edit" component={UpdateProduct} />
          {/* <ProtectedRoute exact path="/orders" component={OrdersPage} /> */}
          {/* <ProtectedRoute exact path="/playback-history" component={PlaybackHistoryPage} /> */}
          <Route exact path="/licenses" component={LicensesPage} />

          <Route path="/login" component={LoginFormModal} />
          <Route path="/signup" component={SignUpFormModal} />

          <Route exact path="/about" component={AboutMe} />
          <Route exact path="/checkout" component={Checkout} />
          <Route exact path="/checkout-success" component={CheckoutSuccess} />
          <Route exact path="/checkout-cancel" component={CheckoutCancel} />
          <Route exact path="/downloads/:sessionId" component={DownloadPage} />

          {/* Optional 404 route */}
          <Route render={() => <Redirect to="/" />} />
        </Switch>
      )}
    </>
  );
}

export default App;
