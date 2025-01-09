import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { UserProvider } from "./usercontext";

import "./index.css";
import Navbar from "./components/Navbar";
import AuthDiscord from "./routes/auth_discord";
import Index from "./routes";
import Login from "./routes/login";
import Logout from "./routes/logout";
import Register from "./routes/register";

render(
  () => (
    <UserProvider>
      <MetaProvider>
        <Navbar />
        <Router>
          <Route path="/" component={Index} />
          <Route path='/auth_discord' component={AuthDiscord} />
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route path="/register" component={Register} />
        </Router>
      </MetaProvider>
    </UserProvider>
  ),
  document.getElementById("root")!
);
