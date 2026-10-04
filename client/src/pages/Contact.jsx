import { useState } from "react";
import Page from "../components/ui/Page.jsx";
import SuccessMessage from "../components/ui/SuccessMessage.jsx";
import { buttonStyles } from "../components/ui/buttonStyles.js";
import { sendContactMessage } from "../api/contact.js";

const fieldStyles = "col-start-2 rounded border border-gray-300 p-3 placeholder:text-gray-400 focus:border-brand focus:outline-none";

export default function Contact() { 
// "idle" | "sending" | "sent" | "error"
const [status, setStatus] = useState("idle");
const [errorMessage, setErrorMessage] = useState("");

async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    setStatus("sending");
    try {
        await sendContactMessage({
            name: data.get("name"),
            email: data.get("email"),
            message: data.get("message"),
            newsletter: data.get("newsletter") !== null,
        });
        form.reset();
        setStatus("sent");
    } catch (error) {
        setErrorMessage(error.message);
        setStatus("error");
    }
}

    return (
        <Page title="Contact us!">
            <p className="mb-12 w-full text-center">We would love to hear from you! Whether you have questions, feedback, or would like to get involved, please fill out the form below and we will get back to you as soon as possible.</p>
            <form className="grid grid-cols-[1fr_2fr] gap-1 md:[&>label]:pl-[150px]"
                onSubmit={handleSubmit}
                onFocus={() => status !== "sending" && setStatus("idle")}
                >
                <label htmlFor="name">Name:</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name"
                    className={fieldStyles}
                    placeholder="Enter you name here" 
                    required />
                <label htmlFor="email">Email:</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className={fieldStyles}
                    placeholder="example@domain.com" 
                    required />
                <label htmlFor="message">Message:</label>
                <textarea 
                    id="message" 
                    name="message" 
                    maxLength="750" 
                    className={`${fieldStyles} resize-none sm:min-h-[200px] sm:w-[350px] md:w-[500px]`}
                    placeholder="Your message here..." 
                    onInput={ (textarea) => {
                        textarea.target.style.height = "auto";
                        textarea.target.style.height = (textarea.target.scrollHeight) + "px";
                    }}
                    required>    
                </textarea>
                <div className="col-span-full mt-2 flex items-center gap-2 justify-self-center">
                    <input type="checkbox" id="newsletter" name="newsletter" value="Subscribe" className="cursor-pointer hover:opacity-80" />
                    <label htmlFor="newsletter" className="cursor-pointer hover:opacity-80">Do you want to subscribe to our newsletter?</label>
                 </div>
                <button
                    type="submit"
                    disabled={status === "sending"}
                    className={`${buttonStyles()} col-span-full mt-4 justify-self-center disabled:cursor-wait disabled:opacity-60`}
                >
                    {status === "sending" ? "Sending..." : "Submit"}
                </button>
            </form>

            { status === "sent" && (
                <SuccessMessage>Your form was successfully submitted!🎉<br />Thank you for your interest!</SuccessMessage>
            )}
            { status === "error" && (
                <p className="mt-6 rounded-[7px] border border-red-600 bg-red-100 p-4 text-center">
                    {errorMessage === "Invalid request" ? "Please check your details and try again." : errorMessage}
                </p>
            )}
        </Page>
    );
}
