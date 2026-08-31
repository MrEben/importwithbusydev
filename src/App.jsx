import { useEffect, useRef, useState } from "react";
import { initiateCheckout as trackInitiateCheckout, lead as trackLead } from "./utils/metaPixel";
import MetaPixel from "./components/MetaPixel";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_APP_TITLE;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const PIXEL_ENABLED = Boolean(PIXEL_ID);

const trainingSections = {
  china: {
    title: "CHINA/TURKEY/DUBAI/BANGLADESH IMPORTATION MASTERCLASS",
    points: [
      "Navigate major Chinese marketplaces (Alibaba, 1688, Pinduoduo, Global Sources)",
      "Find trustworthy suppliers and negotiate the best factory prices",
      "Master international shipping logistics and CBM calculations",
      "Understand payment methods, MOQs, and payment protection",
      "Learn quality inspection techniques before accepting shipments",
      "Access our network of 200+ verified suppliers across industries",
      "Get contacts for shipping agents, customs brokers, and logistics partners",
      "Calculate landed costs and pricing strategies for profitability",
    ]
  },
  gadget: {
    title: "GADGET & ELECTRONICS IMPORTATION MASTERCLASS",
    points: [
      "Source smartphones, laptops, accessories from certified distributors from China, UK and the US",
      "Evaluate gadget specifications and authentication to avoid counterfeits",
      "Handle warranty, returns, and repair processes for electronics",
      "Navigate tech product compliance and import regulations",
      "Build relationships with reliable gadget wholesalers in Asia",
      "Understand markup strategies for competitive gadget pricing",
      "Master logistics for fragile electronics and insurance options",
      "Access our curated list of 100+ gadget suppliers and distributors",
    ]
  }
};

const testimonialScreenshots = [
  { image: "https://i.postimg.cc/7P3ppFXw/testimonial-1.jpg", alt: "Student testimonial screenshot 1" },
  { image: "https://i.postimg.cc/NFDC5wP9/testimonial-2.jpg", alt: "Student testimonial screenshot 2" },
  { image: "https://i.postimg.cc/YqXy7MWx/testimonial-3.jpg", alt: "Student testimonial screenshot 3" },
];

const faqItems = [
  {
    question: "Do I need capital to join this training?",
    answer: "No, this training is completely FREE. You only need internet access and a genuine desire to learn how to import products."
  },
  {
    question: "How long is the training?",
    answer: "The training is comprehensive and covers everything you need to know. You'll get lifetime access to all materials and updates."
  },
  {
    question: "Will I get supplier contacts?",
    answer: "Yes! As a student, you'll get access to 200+ verified Chinese supplier contacts across multiple product categories."
  },
  {
    question: "What if I have questions after the training?",
    answer: "You'll have access to our community and mentors who can help answer your questions and guide you through your first importation."
  },
  {
    question: "Can I apply this to other countries besides China?",
    answer: "Yes! The principles and strategies you learn can be applied to importing from other countries as well."
  },
  {
    question: "Is this only for e-commerce?",
    answer: "No, you can use these skills for local retail, wholesale, dropshipping, and other business models."
  },
];

export default function App() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState({ name: "", phone: "", training: "" });
  const testimonialCarouselRef = useRef(null);

  useEffect(() => {
    if (!PIXEL_ENABLED) {
      console.warn("VITE_META_PIXEL_ID is not configured. Meta Pixel events will be skipped.");
    }
  }, []);

  function moveTestimonials(direction) {
    testimonialCarouselRef.current?.scrollBy({
      left: direction * testimonialCarouselRef.current.clientWidth * 0.82,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sections = Array.from(document.querySelectorAll("section[id]"));
    if (!sections.length) return;

    const updateCurrentSection = () => {
      const viewportMid = window.innerHeight * 0.35;
      let currentSection = "hero";
      let closestDistance = Infinity;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - viewportMid);
        if (distance < closestDistance) {
          closestDistance = distance;
          currentSection = section.id;
        }
      });

      sessionStorage.setItem("returnSection", currentSection);
    };

    updateCurrentSection();
    window.addEventListener("scroll", updateCurrentSection, { passive: true });
    window.addEventListener("resize", updateCurrentSection);

    return () => {
      window.removeEventListener("scroll", updateCurrentSection);
      window.removeEventListener("resize", updateCurrentSection);
    };
  }, []);

  useEffect(() => {
    const carousel = testimonialCarouselRef.current;
    if (!carousel) return;

    const autoSlide = window.setInterval(() => {
      const hasReachedEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8;
      carousel.scrollTo({
        left: hasReachedEnd ? 0 : carousel.scrollLeft + carousel.clientWidth * 0.82,
        behavior: "smooth",
      });
    }, 4500);

    return () => window.clearInterval(autoSlide);
  }, []);

  function handleJoinClick() {
    if (PIXEL_ENABLED) {
      try {
        trackInitiateCheckout({
          name: "Import with BusyDev Masterclass",
          price: 0,
        });
      } catch (error) {
        console.error("InitiateCheckout tracking failed:", error);
      }
    }

    setIsRegistrationOpen(true);
  }

  async function handleRegistrationSubmit(event) {
    event.preventDefault();

    const name = registrationDetails.name.trim();
    const phone = registrationDetails.phone.trim();
    const training = registrationDetails.training.trim();
    const phoneRegex = /^(?:\+233|233|0)(2[03456789]|5[0-9])[0-9]{7}$/;

    if (!name || !phone || !training) {
      alert("Please fill all fields");
      return;
    }

    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid Ghanaian phone number");
      return;
    }

    setIsSending(true);

    if (PIXEL_ENABLED) {
      try {
        trackLead({ name, phone, training, price: 0 });
      } catch (error) {
        console.error("Pixel tracking failed:", error);
      }
    }

    const sendRegistrationInBackground = async () => {
      if (!GOOGLE_SCRIPT_URL) {
        console.error("Google Script URL is missing");
        return;
      }

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            secret: "IMPORTWITHBUSYDEV123",
            name,
            phone,
            training,
          }),
        });

        console.log("Registration sent to Google Sheets");
      } catch (error) {
        console.error("Registration submission failed:", error);
      }
    };

    sendRegistrationInBackground();
    window.open("https://chat.whatsapp.com/CtgFUM4RyxIDFEFIcAHYGA", "_blank", "noopener,noreferrer");
    setIsRegistrationOpen(false);
    setRegistrationDetails({ name: "", phone: "", training: "" });
    setIsSending(false);
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text)]">
      <MetaPixel id={PIXEL_ID} />
      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur-xl text-slate-950 shadow-sm sm:px-10">
        <div className="text-lg font-bold uppercase tracking-wide">
          <span className="text-orange-600">Import</span> with BusyDev
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold">
          <a href="#learn" className="text-slate-700 transition hover:text-slate-950">What You'll Learn</a>
          <a href="#faq" className="text-slate-700 transition hover:text-slate-950">FAQ</a>
          <button 
            onClick={handleJoinClick}
            className="rounded-sm cursor-pointer bg-orange-600 px-6 py-2 text-white font-semibold hover:bg-orange-700 transition "
          >
            Join Free
          </button>
        </nav>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section id="hero" className="px-6 py-16 lg:px-10 bg-gradient-to-b from-slate-50 to-white ">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-950">
                Join Our Mini Importation <span className="text-orange-600">Business Training</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Learn how to source, ship, and sell profitable products from China, Turkey, Dubai, etc. Complete training covering everything from finding suppliers to shipping to your country.
              </p>
            </div>

            {/* Main CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button 
                onClick={handleJoinClick}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl cursor-pointer transition bump-animation"
              >
                CLICK HERE TO JOIN THE FREE IMPORTATION TRAINING
              </button>
            </div>

            {/* Trust Badge */}
            <div className="pt-8 border-t border-slate-200">
              {/* <p className="text-sm text-slate-600 mb-4">Trusted by entrepreneurs across Africa</p> */}
              <div className="flex justify-center gap-8 text-slate-700">
                <div>
                  <div className="text-2xl font-bold text-orange-600">500+</div>
                  <div className="text-sm">Students Trained</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">100%</div>
                  <div className="text-sm">Free Training</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">200+</div>
                  <div className="text-sm">Supplier Contacts</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What You'll Learn Section */}
        <section id="learn" className="px-6 py-20 lg:px-10 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-950">Here Is What You Are Going To Learn</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* China Importation */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-950 mb-8 uppercase tracking-wide">{trainingSections.china.title}</h3>
                <ul className="space-y-3">
                  {trainingSections.china.points.map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-700 leading-relaxed">
                      <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gadget Importation */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-950 mb-8 uppercase tracking-wide">{trainingSections.gadget.title}</h3>
                <ul className="space-y-3">
                  {trainingSections.gadget.points.map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-700 leading-relaxed">
                      <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 justify-center p-8">
              <button 
                onClick={handleJoinClick}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl cursor-pointer transition bump-animation"
              >
                CLICK HERE TO JOIN THE FREE IMPORTATION TRAINING
              </button>
            </div>

        {/* Student testimonial screenshots */}
        <section className="px-6 py-20 lg:px-10 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-950">What Our Students Say</h2>
              <p className="text-xl text-slate-600">Dont be Left out</p>
            </div>

            <div className="relative">
              <div
                ref={testimonialCarouselRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:thin]"
                aria-label="Student testimonial screenshots"
              >
                {testimonialScreenshots.map((testimonial) => (
                  <figure key={testimonial.image} className="w-[84vw] max-w-[420px] shrink-0 snap-start overflow-hidden rounded-lg bg-white shadow-md">
                    <img src={testimonial.image} alt={testimonial.alt} className="block h-auto max-h-[620px] w-full object-contain" />
                  </figure>
                ))}
              </div>

              <button
                type="button"
                onClick={() => moveTestimonials(-1)}
                aria-label="Show previous testimonial"
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-2xl text-slate-950 shadow-lg transition hover:bg-orange-600 hover:text-white"
              >
                &#8592;
              </button>
              <button
                type="button"
                onClick={() => moveTestimonials(1)}
                aria-label="Show next testimonial"
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-2xl text-slate-950 shadow-lg transition hover:bg-orange-600 hover:text-white"
              >
                &#8594;
              </button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-20 lg:px-10 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-950">How The Training Works</h2>
              <p className="text-xl text-slate-600">A simple 3-step process to get you importing</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-600 text-white text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-2xl font-bold text-slate-950 mb-3">Enroll Free</h3>
                <p className="text-slate-600">Join our free training program with no hidden charges or conditions.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-600 text-white text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold text-slate-950 mb-3">Learn & Master</h3>
                <p className="text-slate-600">Access comprehensive modules covering every aspect of China importation.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-600 text-white text-2xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-2xl font-bold text-slate-950 mb-3">Start Importing</h3>
                <p className="text-slate-600">Get mentorship and supplier contacts to launch your first profitable order.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-6 py-20 lg:px-10 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-950">Frequently Asked Questions</h2>
              <p className="text-xl text-slate-600">Have questions? We've got answers</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <div 
                  key={idx}
                  className="border-2 border-slate-200 rounded-lg overflow-hidden hover:border-orange-600 transition"
                >
                  <button 
                    onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between bg-white hover:bg-slate-50 transition"
                  >
                    <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
                    <span className={`text-2xl text-orange-600 transition transform ${expandedFAQ === idx ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {expandedFAQ === idx && (
                    <div className="px-6 py-4 bg-slate-50 border-t-2 border-slate-200">
                      <p className="text-slate-700 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        {/* <section className="px-6 py-20 lg:px-10 bg-white">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-950">Don't Miss Out</h2>
              <p className="text-xl text-slate-600">Subscribe to get exclusive tips and updates about the training</p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
              <input 
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="flex-1 px-6 py-4 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-600 bg-white"
              />
              <button 
                type="submit"
                disabled={isSending}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition disabled:opacity-50"
              >
                {isSending ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            {emailSubscribed && (
              <p className="text-green-600 font-semibold">Thank you for subscribing!</p>
            )}
          </div>
        </section> */}

        {/* Final CTA Section */}
        <section className="px-6 py-20 lg:px-10 bg-gradient-to-r from-orange-600 to-orange-700">
          <div className="max-w-4xl mx-auto text-center text-white space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">Ready to Start Your Importation Journey?</h2>
            <p className="text-xl opacity-90">Join hundreds of successful entrepreneurs who've transformed their businesses with our training.</p>
            
            <button 
              onClick={handleJoinClick}
              className="px-10 py-5 bg-white text-orange-600 font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition bump-animation"
            >
              CLICK HERE TO JOIN THE FREE IMPORTATION TRAINING
            </button>

            <p className="text-sm opacity-75">It's 100% FREE. No credit card required. Join now!</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 lg:px-10 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span className="text-orange-600">Import</span> with BusyDev
            </h3>
            <p className="text-slate-400 text-sm">Making China importation accessible to everyone.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#learn" className="hover:text-white transition">What You'll Learn</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Training</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">China Importation</a></li>
              <li><a href="#" className="hover:text-white transition">Supplier Sourcing</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping Guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Follow Us</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p><a href="#" className="hover:text-white transition">Facebook</a></p>
              <p><a href="#" className="hover:text-white transition">Instagram</a></p>
              <p><a href="#" className="hover:text-white transition">WhatsApp</a></p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2026 Import with BusyDev. All rights reserved. Made with ❤️</p>
        </div>
      </footer>

      {isRegistrationOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsRegistrationOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-lg bg-white p-6 text-slate-950 shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
          >
            <button
              type="button"
              onClick={() => setIsRegistrationOpen(false)}
              aria-label="Close registration form"
              className="absolute right-4 top-3 cursor-pointer text-2xl leading-none text-slate-500 transition hover:text-slate-950"
            >
              &times;
            </button>
            <h2 id="registration-title" className="pr-8 text-2xl font-bold">Register for free training</h2>
            <p className="mt-2 text-slate-600">Enter your details to join the training community on WhatsApp.</p>

            <form onSubmit={handleRegistrationSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="registration-name" className="mb-1 block text-sm font-semibold">Full name</label>
                <input
                  id="registration-name"
                  type="text"
                  value={registrationDetails.name}
                  onChange={(event) => setRegistrationDetails({ ...registrationDetails, name: event.target.value })}
                  required
                  autoFocus
                  className="w-full rounded-md border-2 border-slate-200 px-4 py-3 focus:border-orange-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="registration-phone" className="mb-1 block text-sm font-semibold">
                  Phone number <span className="text-xs font-normal text-slate-400">(must be active on WhatsApp)</span>
                </label>
                <input
                  id="registration-phone"
                  type="tel"
                  value={registrationDetails.phone}
                  onChange={(event) => setRegistrationDetails({ ...registrationDetails, phone: event.target.value })}
                  required
                  inputMode="tel"
                  pattern="^(\+?233|0)[2357]\d{8}$"
                  title="Enter a valid Ghanaian phone number, for example 0241234567 or +233241234567"
                  className="w-full rounded-md border-2 border-slate-200 px-4 py-3 focus:border-orange-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="registration-training" className="mb-1 block text-sm font-semibold">
                  Which training are you most interested in?
                </label>
                <select
                  id="registration-training"
                  value={registrationDetails.training}
                  onChange={(event) => setRegistrationDetails({ ...registrationDetails, training: event.target.value })}
                  required
                  className="w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3 focus:border-orange-600 focus:outline-none"
                >
                  <option value="" disabled>Select a training</option>
                  <option value="China/Turkey/Dubai Import Training">China/Turkey/Dubai Import Training</option>
                  <option value="Gadget Import Training">Gadget Import Training</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="w-full cursor-pointer rounded-md bg-orange-600 px-5 py-3 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? "Submitting..." : "Register For Free Training"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        html { scroll-behavior: smooth; }
        body { background: var(--page-bg); color: var(--text); }
      `}</style>
    </div>
  );
}
