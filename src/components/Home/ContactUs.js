import React, { useState } from "react";
import NavBar from '../Home/NavBar';

const ACCENT_COLOR = 'rgb(9, 96, 29)'; // Signature Green
const TEXT_COLOR = '#f8f9fa'; // Light Text
const DARK_BG = "black";
// const MD_BREAKPOINT = 768; 


//TODO: Integrate with backend API for actual form submission
const ContactUs = (props) => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    
    // Simulating a form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        
        // In a real application, you would send this data to an API endpoint here.
        
        props.showAlert("Thank you for contacting us! We will respond shortly.", "success");
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Style Definitions ---
    const pageStyle = { backgroundColor: DARK_BG, minHeight: "100vh", color: TEXT_COLOR, paddingTop: '3.5rem' };
    const formContainerStyle = { 
        backgroundColor: '#1a1a1a', 
        padding: '10px', 
        borderRadius: '10px', 
        boxShadow: `0 0 15px rgba(0, 0, 0, 0.5)`,
        maxWidth: '700px',
        margin: '0 auto',
        marginTop: '30px'
    };
    const inputStyle = {
        backgroundColor: "#212529", 
        borderColor: "#495057",     
        color: "white",             
        resize: 'vertical',
    };
    const buttonStyle = {
        backgroundColor: ACCENT_COLOR,
        color: "white",
        borderColor: ACCENT_COLOR,
        fontWeight: "bold",
        transition: 'background-color 0.3s',
    };

    return (
        <div style={pageStyle}>
            <NavBar />
            
            <div className="container ">
                <div style={formContainerStyle}>
                    <h1 className="fw-bold mb-1" style={{ color: ACCENT_COLOR, textAlign: 'center' }}>
                        Get In Touch 📧
                    </h1>
                    <p className="text-secondary mb-4" style={{ textAlign: 'center' }}>
                        Have questions about the simulator, partnership inquiries, or need support? Send us a message!
                    </p>

                    <form onSubmit={handleSubmit}>
                        
                        {/* Name and Email Row */}
                        <div className="row mb-3">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <label className="form-label text-light" htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={onChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-light" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={onChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="mb-3">
                            <label className="form-label text-light" htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                className="form-control"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={onChange}
                                required
                                style={inputStyle}
                            />
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label className="form-label text-light" htmlFor="message">Message</label>
                            <textarea
                                className="form-control"
                                id="message"
                                name="message"
                                rows="4"
                                value={formData.message}
                                onChange={onChange}
                                required
                                style={inputStyle}
                            ></textarea>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <button type="submit" className="btn w-50" style={buttonStyle}>
                                Send Message
                            </button>
                        </div>
                    </form>
                    
                    <hr style={{ borderColor: '#363636', marginTop: '30px' }} />

                    <div className="mt-4" style={{ textAlign: 'center' }}>
                        <h3 className="h6" style={{ color: TEXT_COLOR }}>Direct Contact Information:</h3>
                        <p className="mb-1 text-secondary">Email: tanishkagupta2207@gmail.com</p>
                        <p className="mb-0 text-secondary">Phone: +91 9149014514</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactUs;