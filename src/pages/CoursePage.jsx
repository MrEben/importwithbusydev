import { useState } from "react";
import { initiateCheckout, lead } from "../utils/metaPixel";
import MetaPixel from "../components/MetaPixel";

const pixelId = import.meta.env.VITE_META_PIXEL_ID;

const inclusions = [
  { number: "01", title: "CORE IMPORT COURSE", text: "20+ guided lessons covering product research, supplier communication, shipping, and selling.", value: "Start-to-finish guidance" },
  { number: "02", title: "SUPPLIER CONTACTS", text: "Find suppliers across popular product categories and learn how to evaluate them before ordering.", value: "200+ supplier contacts" },
  { number: "03", title: "SHIPPING KNOW-HOW", text: "Understand shipping methods, CBM calculations, etc.", value: "Plan with real costs in mind" },
  { number: "04", title: "ACCESS TO RESOURCES", text: "Get practical guides designed to help you understand the key steps involved in starting and running an importation business.", value: "Essential Resources" },
  { number: "05", title: "LEARNING COMMUNITY", text: "Get support from fellow learners and mentors as you put your sourcing plans into action.", value: "Learn with a community" },
  { number: "06", title: "MULTI-COUNTRY SOURCING", text: "Apply the core process to suppliers in China, Turkey, Dubai, and Bangladesh.", value: "More sourcing options" },
];

const benefits = [
  { icon: "▤", title: "A CLEAR LEARNING PATH", text: "Move from finding a product to placing an order with lessons arranged in a practical sequence." },
  { icon: "⌁", title: "STRAIGHTFORWARD LESSONS", text: "Learn the essentials in focused lessons you can revisit while planning your first shipment." },
  { icon: "☆", title: "BUILT FOR REAL BUSINESS", text: "Use practical checks, cost calculations, and sourcing strategies for the market you want to serve." },
];

const reviews = [
  { image: "https://i.postimg.cc/7P3ppFXw/testimonial-1.jpg", alt: "Import with BusyDev student feedback" },
  { image: "https://i.postimg.cc/NFDC5wP9/testimonial-2.jpg", alt: "Import with BusyDev student feedback" },
  { image: "https://i.postimg.cc/YqXy7MWx/testimonial-3.jpg", alt: "Import with BusyDev student feedback" },
];

const faqs = [
  { question: "WHAT SKILL LEVEL DO I NEED BEFORE TAKING THIS COURSE?", answer: "You can start as a complete beginner. The training explains each step, from choosing products to arranging delivery." },
  { question: "WILL THIS COURSE WORK FOR BUSINESSES IN GHANA?", answer: "Yes. The course covers practical sourcing, shipping, cost planning, and selling considerations for learners building a business in Ghana." },
  { question: "DO I NEED A LAPTOP TO TAKE THIS COURSE?", answer: "No. You can follow the training on a smartphone with internet access. A laptop can be useful when comparing suppliers and keeping records." },
  { question: "WHAT WILL I BE ABLE TO DO AFTER COMPLETING THE COURSE?", answer: "You'll have a clear process for researching products, checking suppliers, estimating shipping fees, and planning an import order." },
  { question: "IS THIS A ONE-TIME PAYMENT OR A SUBSCRIPTION?", answer: "This training comes by a one-time payment. You pay once and get all the items listed forever." },
];

function CourseRegistration({ onClose }) {
  const [details, setDetails] = useState({ name: "", phone: "", training: "" });
  const [isSending, setIsSending] = useState(false);

  async function submitRegistration(event) {
    event.preventDefault();
    const { name, phone, training } = details;
    const phonePattern = /^(?:\+233|233|0)(2[03456789]|5[0-9])[0-9]{7}$/;

    if (!phonePattern.test(phone.trim())) {
      window.alert("Please enter a valid Ghanaian phone number");
      return;
    }

    setIsSending(true);
    if (pixelId) {
      try {
        lead({ name: name.trim(), phone: phone.trim(), training, price: 0 });
      } catch (error) {
        console.error("Pixel tracking failed:", error);
      }
    }

    const scriptUrl = import.meta.env.VITE_APP_TITLE;
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ secret: "IMPORTWITHBUSYDEV123", name: name.trim(), phone: phone.trim(), training }),
        });
      } catch (error) {
        console.error("Registration submission failed:", error);
      }
    }

    window.open("https://chat.whatsapp.com/CtgFUM4RyxIDFEFIcAHYGA", "_blank", "noopener,noreferrer");
    setIsSending(false);
    onClose();
  }

  return (
    <div className="course-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="course-registration-title">
        <button className="course-modal__close" type="button" aria-label="Close registration" onClick={onClose}>×</button>
        <h2 id="course-registration-title">Register for free training</h2>
        <p>Enter your details to join the training community on WhatsApp.</p>
        <form onSubmit={submitRegistration}>
          <label>Full name<input value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} required /></label>
          <label>WhatsApp phone number<input type="tel" inputMode="tel" value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} required /></label>
          <label>Training interest
            <select value={details.training} onChange={(event) => setDetails({ ...details, training: event.target.value })} required>
              <option value="" disabled>Select a training</option>
              <option value="China Import Training">China Import Training</option>
              <option value="Turkey/Dubai/Bangladesh Import Training">Turkey/Dubai/Bangladesh Import Training</option>
              <option value="Both">Both</option>
            </select>
          </label>
          <button className="course-button" type="submit" disabled={isSending}>{isSending ? "SUBMITTING..." : "REGISTER FOR FREE"}</button>
        </form>
      </section>
    </div>
  );
}

export default function CoursePage() {
  const [registrationOpen, setRegistrationOpen] = useState(false);

  function openRegistration() {
    if (pixelId) {
      try {
        initiateCheckout({ name: "Import with BusyDev Masterclass", price: 0 });
      } catch (error) {
        console.error("InitiateCheckout tracking failed:", error);
      }
    }
    setRegistrationOpen(true);
  }

  return (
    <div className="course-page">
      <MetaPixel id={pixelId} />
      <main>
        <section className="course-hero" id="hero">
          <div className="course-hero__content">
            <p className="course-eyebrow">IMPORT WITH BUSYDEV</p>
            <h1>THE COMPLETE IMPORTATION<br className="course-desktop-break" /> MASTERCLASS</h1>
            <p className="course-hero__subtitle">Learn how to source, ship, and sell products from China, Turkey, Dubai, etc</p>
            <div className="course-video">
              <iframe
                src="https://www.youtube-nocookie.com/embed/WMR2w8ZK-UI"
                title="Import with BusyDev course preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
          <div className="course-hero__action">
            <button type="button" className="course-button" onClick={openRegistration}>JOIN THE TRAINING</button>
          </div>
        </section>

        <section className="course-about" aria-labelledby="course-about-title">
          <img className="course-about__image" src="https://i.postimg.cc/C1gxwwtG/gpt-image-2-5-flare-b-mnake-an-exteneded-i.jpg" alt="about me" loading="lazy" />
          <div className="course-about__copy">
            {/* <p className="course-eyebrow course-eyebrow--dark">IMPORT WITH BUSYDEV</p> */}
            <h2 id="course-about-title">ABOUT ME</h2>
            <h3>Hi, I'm Ebenezer Odame</h3>
            <p>I've spent the last 5 years in the importation business. I've seen everything when it comes to sourcing, negotiating, shipping, and selling of goods.</p>
            <p>From China and Turkey to Dubai and Bangladesh, I've worked through the same challenges many new importers face — finding the right suppliers, shipping issues, and many more.This training brings those lessons together in a practical way so you can make smarter decisions from the start.</p> <h3>AFTER GOING THROUGH THIS TRAINING, YOU WILL BE ABLE TO IMPORT PRODUCTS BY YOURSELF WITHOUT ANYONE'S HELP</h3>
          </div>
        </section>

        <section className="course-includes" id="learn" aria-labelledby="course-includes-title">
          <div className="course-section-heading course-section-heading--light">
            <p className="course-eyebrow">WHAT'S INSIDE?</p>
            <h2 id="course-includes-title">WHAT YOU WILL GET</h2>
          </div>
          <div className="course-includes__grid">
            {inclusions.map((item) => (
              <article className="course-inclusion" key={item.number}>
                <span className="course-inclusion__icon" aria-hidden="true">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <p className="course-inclusion__value">{item.value}</p>
              </article>
            ))}
          </div>
          <button type="button" className="course-button" onClick={openRegistration}>GET STARTED NOW</button>
        </section>

        <section className="course-benefits" aria-labelledby="course-benefits-title">
          <div className="course-section-heading">
            <p className="course-eyebrow course-eyebrow--dark">OVER 150 STUDENTS TRAINED</p>
            <h2 id="course-benefits-title">WHY PEOPLE LOVE THIS TRAINING</h2>
          </div>
          <div className="course-benefits__grid">
            {benefits.map((benefit) => (
              <article className="course-benefit" key={benefit.title}>
                <span className="course-benefit__icon" aria-hidden="true">{benefit.icon}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="course-reviews" aria-labelledby="course-reviews-title">
          <div className="course-section-heading">
            <p className="course-eyebrow course-eyebrow--dark">REVIEWS</p>
            <h2 id="course-reviews-title">WHAT DO OUR STUDENTS SAY</h2>
            <span className="course-heading-rule" aria-hidden="true" />
          </div>
          <div className="course-reviews__grid">
            {reviews.map((review, index) => (
              <figure className="course-review" key={review.image}>
                <img src={review.image} alt={review.alt} loading="lazy" />
                <figcaption>STUDENT REVIEW {String(index + 1).padStart(2, "0")}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="course-final-cta">
          <span className="course-heading-rule" aria-hidden="true" />
          <h2>GET STARTED TODAY!</h2>
          <button type="button" className="course-button" onClick={openRegistration}>ENROLL NOW</button>
        </section>

        <section className="course-faq" id="faq" aria-labelledby="course-faq-title">
          <div className="course-section-heading">
            <p className="course-eyebrow course-eyebrow--dark">FAQ</p>
            <h2 id="course-faq-title">YOUR QUESTIONS ANSWERED</h2>
          </div>
          <div className="course-faq__list">
            {faqs.map((item) => (
              <details className="course-faq__item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="course-footer">© 2026 Import with BusyDev</footer>
      {registrationOpen && <CourseRegistration onClose={() => setRegistrationOpen(false)} />}
    </div>
  );
}