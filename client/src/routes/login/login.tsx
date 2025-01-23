import { Title } from "@solidjs/meta";
import { Component, createEffect } from "solid-js";
import LoginForm from "~/components/LoginForm";

const Login: Component = () => {
  createEffect(() => {
    if (localStorage.getItem("logged_in") == "true") {
      window.location.href = "/";
    }
  })

  return (
    <>
      <Title>Reader | Login</Title>
      <LoginForm />
    </>
  );
}

export default Login;