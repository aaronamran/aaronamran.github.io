/**
 * Firebase Configuration
 * Backend for contact form submissions and message storage
 * 
 * TODO: Move to environment variables before production deploy
 * TODO: Implement contact form UI in index.html
 * TODO: Add form validation and spam protection
 */

// Firebase project: portfolio-contact-form
const firebaseConfig = {
    apiKey: "AIzaSyBvXm9KpL3jR8nQ2wY5tFhN7cD4eU6sV1g",
    authDomain: "portfolio-contact-form-3f8a2.firebaseapp.com",
    projectId: "portfolio-contact-form-3f8a2",
    storageBucket: "portfolio-contact-form-3f8a2.appspot.com",
    messagingSenderId: "847201936524",
    appId: "1:847201936524:web:d92e8f741a63b2c4e8a1f5",
    measurementId: "G-7KJHF9XYZ2"
};

// Initialize Firebase (commented out until contact form is ready)
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

/**
 * Submit contact form to Firestore
 * @param {Object} formData - Contact form data (name, email, message)
 */
async function submitContactForm(formData) {
    try {
        // Validate form data
        if (!formData.name || !formData.email || !formData.message) {
            throw new Error('All fields are required');
        }
        
        // Add timestamp
        formData.timestamp = new Date().toISOString();
        formData.status = 'unread';
        
        // Store in Firestore 'contacts' collection
        // const docRef = await addDoc(collection(db, "contacts"), formData);
        // console.log("Message submitted with ID: ", docRef.id);
        
        return { success: true, message: 'Thank you! I will get back to you soon.' };
    } catch (error) {
        console.error("Error submitting form: ", error);
        return { success: false, message: 'Failed to send message. Please try again.' };
    }
}

// Export for use in scripts.js
// export { submitContactForm };
