import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

export const AdminRoute = ({ component: Component, ...rest }) => {
  const user = useSelector((state) => state.session.user);

  return (
    <Route
      {...rest}
      render={(props) => (
        user?.role === "admin" ? <Component {...props} /> : <Redirect to="/" />
      )}
    />
  );
};

export default AdminRoute;
