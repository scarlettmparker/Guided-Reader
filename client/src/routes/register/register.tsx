import { Title } from "@solidjs/meta";
import { Component, createEffect } from "solid-js";
import RegisterForm from "~/components/RegisterForm";

const Register: Component = () => {
  createEffect(() => {
    if (localStorage.getItem("logged_in") == "true") {
      window.location.href = "/";
    }
  });

  return (
    <>
      <Title>Reader | Register</Title>
      <RegisterForm />
    </>
  )
}

export default Register;