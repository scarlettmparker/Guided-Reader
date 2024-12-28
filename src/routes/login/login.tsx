import { Title } from "@solidjs/meta";
import { Component, createEffect } from "solid-js";
import { useUser } from "~/usercontext";
import LoginForm from "~/components/LoginForm";

const Login: Component = () => {
  const { logged_in } = useUser();

  createEffect(() => {
    if (logged_in()) {
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