import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { UserProvider } from "./usercontext";

import "./index.css";
import Navbar from "./components/Navbar";
import Index from "./routes";
import Login from "./routes/login";
import Logout from "./routes/logout";

render(
  () => (
    <MetaProvider>
      <UserProvider>
        <Navbar />
        <Router>
          <Route path="/" component={Index} />
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
        </Router>
      </UserProvider>
    </MetaProvider>
  ),
  document.getElementById("root")!
);
