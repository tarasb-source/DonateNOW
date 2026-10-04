import { useState } from "react";
import Page from "../components/ui/Page.jsx";
import SuccessMessage from "../components/ui/SuccessMessage.jsx";
import { buttonStyles } from "../components/ui/buttonStyles.js";

const fieldStyles = "col-start-2 rounded border border-gray-300 p-3 placeholder:text-gray-400 focus:border-brand focus:outline-none";

export default function Contact() { 
const [submitted, setSubmitted] = useState(false);

    return (
        <Page title="Contact us!">
            <p className="mb-12 w-full text-center">We would love to hear from you! Whether you have questions, feedback, or would like to get involved, please fill out the form below and we will get back to you as soon as possible.</p>
            <form className="grid grid-cols-[1fr_2fr] gap-1 md:[&>label]:pl-[150px]"
                onSubmit={ (e) => { 
                    e.preventDefault();
                    e.target.reset();
                    setSubmitted(true);
                }}
                onFocus={() => setSubmitted(false)}
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
                <button type="submit" className={`${buttonStyles()} col-span-full mt-4 justify-self-center`}>Submit</button>
            </form>

            { submitted && (
                <SuccessMessage>Your form was succesfully submitted!🎉<br />Thank you for your interest!</SuccessMessage>
            )}
        </Page>
    );
}
