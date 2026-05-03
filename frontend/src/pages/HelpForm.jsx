import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function HelpForm() {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        // We let the form submit to the hidden iframe
        setTimeout(() => {
            setFormSubmitted(true);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-primary-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-primary-100">
                    <div className="bg-primary-600 px-8 py-10 text-white text-center">
                        <h1 className="text-3xl font-bold mb-2">Get in Touch</h1>
                        <p className="text-primary-100">Fill out the form below and we'll get back to you shortly.</p>
                    </div>

                    <div className="p-8">
                        {formSubmitted ? (
                            <div className="text-center py-12 animate-in zoom-in-95 duration-500">
                                <div className="text-6xl mb-6">✅</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
                                <p className="text-gray-600 mb-8 text-lg">Your message has been successfully sent to Sahithi Enterprises.</p>
                                <button 
                                    onClick={() => navigate('/')} 
                                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
                                >
                                    Back to Home
                                </button>
                            </div>
                        ) : (
                            <form 
                                action="https://docs.google.com/forms/d/e/1FAIpQLSd3nqsvokHV3VIosjN1sNZQjr3rxQOz68J1Gi54AzFKsxUyyg/formResponse" 
                                method="POST" 
                                target="hidden_iframe"
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        name="entry.328572814" 
                                        required 
                                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 outline-none transition-all" 
                                        placeholder="Enter your full name" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Contact Number</label>
                                    <input 
                                        type="tel" 
                                        name="entry.197711594" 
                                        required 
                                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 outline-none transition-all" 
                                        placeholder="Enter your phone number" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message / Requirement</label>
                                    <textarea 
                                        name="entry.153935912" 
                                        required 
                                        rows="5" 
                                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 outline-none transition-all resize-none" 
                                        placeholder="How can we assist you today?"
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 active:scale-[0.98]"
                                >
                                    Submit Request
                                </button>
                            </form>
                        )}
                        <iframe name="hidden_iframe" id="hidden_iframe" style={{display: 'none'}}></iframe>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 mx-auto transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
