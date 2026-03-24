import React, { useEffect } from 'react';

function Login() {

    document.title = "Login"

    // dont ask an already logged in user to login over and over again
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            document.location = "/"
        }
    }, []); //roda uma unica vez

    return (
        <section className='login-page-wrapper page'>
            <div className='login-page'>
                <header>
                    <h1>Login Page</h1>
                </header>
                <p className='message'></p>  {/*para mensagens de erro*/}
                <div className='from-holder'>
                    <form action="#" className='login' onSubmit={loginHandler}>
                        <label htmlFor='email'>Email</label>
                        <br />
                        <input type='email' name='email' id="email" required/>
                        <br />


                        <label htmlFor='password'>Password</label>
                        <br />
                        <input type='password' name='password' id="password" required/>
                        <br />
                        <input type='checkbox' name='remember' id="remember"/>
                        <label htmlFor='remember'>Remember Password?</label>
                        <br />
                        <br />
                        <input type='submit' value='Login' className='login btn' />
                    </form>
                </div>
                <div className='my-5'>
                    <span>Or </span>
                    <a href="/register">Register</a>
                </div>

            </div>
        </section>
    );

    async function loginHandler(e) {
        e.preventDefault()
        const form_ = e.target, submitter = document.querySelector("input.login")

        const formData = new FormData(form_, submitter)

        const dataToSend = {
            Login: formData.get("email"),
            Password: formData.get("password"),
            RememberMe: formData.get("remember") === "on"
        }

        // Use a root-relative path so the request goes to the current origin
        // (e.g. https://localhost:5173 when Vite is serving over HTTPS) and
        // is then proxied to the backend. Also ensure the content-type header
        // is lowercased correctly.
        const response = await fetch("/api/SecureWebsite/login", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(dataToSend),
            headers: {
                "content-type" : "application/json",
                "Accept" : "application/json"
            }
        })

        const data = await response.json()
        if (response.ok){
            localStorage.setItem("user", dataToSend.email)
            document.location = "/"
        }

        const messageEl = document.querySelector(".message")
        if (data.message) {
            messageEl.innerHTML = data.message
        } else {
            messageEl.innerHTML = "Something went wrong. Just try again"
        }

        console.log("login error: ", data)
    }
}

export default Login