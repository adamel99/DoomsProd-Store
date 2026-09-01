import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";

import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage/LandingPage";
import ProductList from "./components/ProductList/ProductList";
import PluginsPage from "./components/Plugins/Plugins";
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
import AdminRoute, { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import AccountPage from "./components/Account/Account";
import AdminOrders from "./components/AdminOrders/AdminOrders";
import Footer from "./components/Footer/Footer";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Terms from "./components/Terms";


import { restoreUser } from "./store/session";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const showFooter = location.pathname !== "/admin/orders";

  useEffect(() => {
    dispatch(restoreUser())
      .then(() => setIsLoaded(true))
      .catch(() => setIsLoaded(true)); // ← add this
  }, [dispatch]);

  useEffect(() => {
    let scrollTimeout;

    const updateScrollbar = () => {
      const root = document.documentElement;
      const scrollableHeight = root.scrollHeight - window.innerHeight;
      const viewportRatio = window.innerHeight / root.scrollHeight;
      const thumbHeight = Math.max(window.innerHeight * viewportRatio, 32);
      const thumbTravel = window.innerHeight - thumbHeight;
      const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

      root.style.setProperty("--scrollbar-thumb-height", `${thumbHeight}px`);
      root.style.setProperty("--scrollbar-thumb-y", `${thumbTravel * progress}px`);
    };

    const showScrollbar = () => {
      updateScrollbar();
      document.documentElement.classList.add("is-scrolling");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 900);
    };

    updateScrollbar();
    window.addEventListener("scroll", showScrollbar, { passive: true });
    window.addEventListener("resize", updateScrollbar);

    return () => {
      window.removeEventListener("scroll", showScrollbar);
      window.removeEventListener("resize", updateScrollbar);
      clearTimeout(scrollTimeout);
      document.documentElement.classList.remove("is-scrolling");
    };
  }, []);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/products" component={ProductList} />
          <Route exact path="/plugins" component={PluginsPage} />
          <AdminRoute exact path="/products/new" component={NewProduct} />
          <Route exact path="/products/:productId" component={ProductDetail} />

          <Route exact path="/cart" component={CartPage} />
          <AdminRoute exact path="/products/:productId/edit" component={UpdateProduct} />
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
          <ProtectedRoute exact path="/account" component={AccountPage} />
          <AdminRoute exact path="/admin/orders" component={AdminOrders} />
          <Route exact path="/privacy-policy" component={PrivacyPolicy} />
          <Route exact path="/terms" component={Terms} />

          {/* Optional 404 route */}
          <Route render={() => <Redirect to="/" />} />
        </Switch>
      )}
      {isLoaded && showFooter && <Footer />}
    </>
  );
}

export default App;
