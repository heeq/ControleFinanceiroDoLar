import React, { useEffect } from 'react';

function Register() {

    document.title = "Register"

    // dont ask an already registered in user to register over and over again
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            document.location = "/"
        }
    }, []);

    return (
        <section className='register-page-wrapper page'>
            <div className='register-page'>
                <header>
                    <h1>Register Page</h1>
                </header>
                <p className='message'></p>  {/*para mensagens de erro*/}
                <div className='from-holder'>
                    <form action="#" className='register' onSubmit={registerHandler}>

                        <label htmlFor='Name'>Name</label>
                        <br />
                        <input type='text' name='Name' id="Name" required />
                        <br />

                        <label htmlFor='Login'>Email / Login</label>
                        <br />
                        <input type='email' name='Login' id="Login" required />
                        <br />

                        <label htmlFor='Password'>Password</label>
                        <br />
                        <input type='password' name='Password' id="Password" required />

                        <br />
                        <input type='submit' value='Register' className='register btn' />
                    </form>
                </div>

                <div className='my-5'>
                    <span>Or </span>
                    <a href="/login">Login</a>
                </div>

            </div>
        </section>
    );

    async function registerHandler(e) {
        e.preventDefault()
        const form_ = e.target, submitter = document.querySelector("input.register")

        const formData = new FormData(form_, e.submitter), dataToSend = {}

        for (const [key, value] of formData) {
            dataToSend[key] = value
        }

        const response = await fetch("api/SecureWebSite/register", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(dataToSend),
            headers: {
                "Content-Type": "Application/json",
                "Accept": "application/json"
            }
        })

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro completo:", {
                status: response.status,
                headers: [...response.headers.entries()],
                body: errorText
            });
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const data = await response.json()

        if (response.ok) {
            localStorage.setItem("user", dataToSend.Email)
            //document.location = "/login"
        }

        const messageEl = document.querySelector(".message")
        if (data.message) {
            messageEl.innerHTML = data.message
        } else {
            let errorMessages = "<div>Attention please: </div><div class='normal'>"
            data.errors.forEach(error => {
                errorMessages += error.description + " "
            })
            errorMessages += "</div>"
            messageEl.innerHTML = "Something went wrong. Just try again"
        }

        console.log("register error: ", data.response)
    }
}

export default Register;