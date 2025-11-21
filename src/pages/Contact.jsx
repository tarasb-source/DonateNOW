import { useState } from "react";
import '../CSS/Contact.css';

export default function Contact() { 
const [submitted, setSubmitted] = useState(false);

    return (
        <div className="page-content contact-page">
            <h1>Contact us!</h1>
            <p>We would love to hear from you! Whether you have questions, feedback, or would like to get involved, please fill out the form below and we will get back to you as soon as possible.</p>
            <form className="newsletter"
                onSubmit={ (e) => { 
                    e.preventDefault();
                    e.target.reset();
                    setSubmitted(true);
                }}
                onFocus={() => setSubmitted(false)}
                >
                <label for="name">Name:</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name"
                    placeholder="Enter you name here" 
                    required />
                <br />
                <label for="email">Email:</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="example@domain.com" 
                    required />
                <br />
                <label for="message">Message:</label>
                <textarea 
                    type="message" 
                    id="message" 
                    name="message" 
                    maxlength="750" 
                    placeholder="Your message here..." 
                    onInput={ (textarea) => {
                        textarea.target.style.height = "auto";
                        textarea.target.style.height = (textarea.target.scrollHeight) + "px";
                    }}
                    required>    
                </textarea>
                <br />
                <div className="checkbox-row">
                    <input type="checkbox" id="newsletter" name="newsletter" value="Subscribe"></input>
                    <label for="newsletter" htmlFor="newsletter"> Do you want to subscribe to our newsletter?</label>
                 </div>
                <button type="submit" className="primary-btn">Submit</button>
            </form>

            { submitted && (
                <p className="submit-msg"> Your form was succesfully submitted!🎉<br />Thank you for your interest!</p>
            )}
        </div>
    );
}
