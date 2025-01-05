import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { UserProvider } from "./usercontext";

import "./index.css";
import Navbar from "./components/Navbar";
import Index from "./routes";
import Login from "./routes/login";
import Logout from "./routes/logout";
import AuthDiscord from "./routes/auth_discord";

render(
  () => (
    <UserProvider>
      <MetaProvider>
        <Navbar />
        <Router>
          <Route path="/" component={Index} />
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route path='/auth_discord' component={AuthDiscord} />
        </Router>
      </MetaProvider>
    </UserProvider>
  ),
  document.getElementById("root")!
);
