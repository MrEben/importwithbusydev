import { useEffect, useRef, useState } from "react";
import {
  initiateCheckout as trackInitiateCheckout,
  lead as trackLead,
  viewContent as trackViewContent,
} from "./utils/metaPixel";
import MetaPixel from "./components/MetaPixel";
import { Link } from "react-router-dom";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_APP_TITLE;
const PIXEL_ID = import.meta.env.PIXEL_ID;
const PIXEL_ENABLED = Boolean(PIXEL_ID);
const BASE_TRAINING_PRICE_GHS = 20;
const GHANA_PAYMENT_URL = "https://paystack.shop/pay/9nil5lyodo";
const NIGERIA_PAYMENT_URL = "https://nestuge.com/checkout?items=%5B%7B%22id%22%3A%22pr_mvath4cjmibi9d9cb2cjxx3jjb6kl%22%2C%22type%22%3A%22registration%22%2C%22plan%22%3A%22pl_mvats770fxry0iv8mcf8dtgjdihpc%22%2C%22count%22%3A1%2C%22affiliate%22%3Anull%7D%5D&currency=NGN&redirectUrl=https%3A%2F%2Fnestuge.com%2Fc0ntm5nqj";
const KENYA_PAYMENT_URL = NIGERIA_PAYMENT_URL.replace("currency=NGN", "currency=KES");

const COUNTRY_SETTINGS = {
  GH: {
    currency: "GHS",
    locale: "en-GH",
    name: "Ghanaian",
    phonePattern: "^(\\+?233|0)[2357]\\d{8}$",
    phoneRegex: /^(?:\+?233|0)[2357]\d{8}$/,
    phoneExample: "0241234567 or +233241234567",
  },
  NG: {
    currency: "NGN",
    locale: "en-NG",
    name: "Nigerian",
    phonePattern: "^(\\+234|234|0)[789]\\d{9}$",
    phoneRegex: /^(?:\+234|234|0)[789]\d{9}$/,
    phoneExample: "08012345678 or +2348012345678",
  },
  KE: {
    currency: "KES",
    locale: "en-KE",
    name: "Kenyan",
    phonePattern: "^(\\+254|254|0)[17]\\d{8}$",
    phoneRegex: /^(?:\+254|254|0)[17]\d{8}$/,
    phoneExample: "0712345678 or +254712345678",
  },
};

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

const TRAINING_PAGE_CSS = `
.training-page {
  --brand: #6926e8;
  --accent: #6926e8;
  --ink: #111720;
  --muted: #5d6470;
  --line: #e5e7eb;
  --light: #f5f5f5;
  min-height: 100vh;
  color: var(--ink);
  background: #fff;
  font-family: Inter, "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.training-page *,
.training-page *::before,
.training-page *::after {
  box-sizing: border-box;
}
.training-page .training-navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  height: 76px;
  padding: 0 32px;
  border-bottom: 1px solid rgba(17, 23, 32, 0.07);
  background: rgba(255, 255, 255, 0.9);
  color: var(--ink);
  box-shadow: 0 8px 24px rgba(17, 23, 32, 0.04);
  backdrop-filter: blur(18px);
}
.training-page .training-navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 1160px);
  height: 100%;
  margin: 0 auto;
}
.training-page .training-brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: var(--ink);
  text-decoration: none;
}
.training-page .training-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--brand);
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -0.06em;
  box-shadow: 0 5px 12px rgba(105, 38, 232, 0.2);
}
.training-page .training-brand-name {
  font-size: 19px;
  font-weight: 650;
  letter-spacing: -0.045em;
  white-space: nowrap;
}
.training-page .training-brand-name span {
  color: var(--brand);
  font-weight: 850;
}
.training-page .training-brand-name strong {
  font-weight: 850;
}
.training-page .training-navbar nav {
  display: flex;
  align-items: center;
}
.training-page .training-navbar-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid var(--brand);
  border-radius: 999px;
  background: var(--brand);
  color: #fff;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.015em;
  transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}
.training-page .training-navbar-cta:hover {
  transform: translateY(-1px);
  background: #5720c4;
  box-shadow: 0 7px 16px rgba(105, 38, 232, 0.22);
}
.training-page .training-navbar-cta svg {
  width: 15px;
  height: 15px;
  transition: transform 160ms ease;
}
.training-page .training-navbar-cta:hover svg {
  transform: translateX(2px);
}
.training-page [class*="bg-orange-"] {
  background-color: var(--brand) !important;
}
.training-page .training-brand-name > span,
.training-page [class*="text-orange-"] {
  color: var(--brand) !important;
}
.training-page main {
  padding-top: 0;
}
.training-page main > section {
  padding: 44px 24px;
  color: var(--ink);
  background: #fff;
}
.training-page main > section > div {
  width: min(100%, 900px);
  margin-right: auto;
  margin-left: auto;
}
.training-page #hero {
  padding-top: 72px;
  padding-bottom: 56px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(105, 38, 232, 0.1), transparent 58%),
    linear-gradient(180deg, #faf8ff 0%, #fff 82%);
}
.training-page #hero > div {
  max-width: 960px;
}
.training-page #learn,
.training-page #faq,
.training-page main > section:last-of-type {
  background: var(--light);
}
.training-page main > section:last-of-type h2,
.training-page main > section:last-of-type p {
  color: var(--ink);
}
.training-page main > section h1 {
  margin: 20px 0;
  color: var(--ink);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.training-page #hero h1 {
  margin: 24px 0;
  font-size: clamp(40px, 6.2vw, 76px);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 1.04;
}
.training-page #hero h1 span {
  display: block;
}
.training-page main > section h2 {
  color: var(--ink);
  font-size: 26px;
  font-weight: 700;
  line-height: 1.3;
}
.training-page main > section h3 {
  color: var(--ink);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
}
.training-page main > section p,
.training-page main > section li {
  color: var(--muted);
  line-height: 1.65;
}
.training-page #hero p {
  max-width: 700px;
  margin-right: auto;
  margin-left: auto;
  font-size: 20px;
  line-height: 1.65;
}
.training-page #hero .border-t {
  margin-top: 12px;
  padding-top: 26px;
}
.training-page #hero .border-t > div > div > div:first-child {
  font-size: 36px;
  letter-spacing: -0.04em;
}
.training-page #hero .border-t > div > div > div:last-child {
  margin-top: 3px;
  font-size: 14px;
}
.training-page #hero .border-t {
  border-color: var(--line);
}
.training-page #hero .border-t [class*="text-slate-"] {
  color: var(--muted);
}
.training-page #learn .mb-16,
.training-page #faq .mb-16 {
  margin-bottom: 28px;
}
.training-page #learn h3 {
  margin-bottom: 20px;
  font-size: 19px;
}
.training-page #learn ul {
  gap: 10px;
}
.training-page main > div {
  padding: 18px 24px;
  background: #fff;
}
.training-page main > div > button,
.training-page button[class*="bg-orange-"] {
  border-radius: 6px;
  background-color: var(--brand);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  box-shadow: none;
  animation: none;
  transition: background-color 160ms ease, transform 160ms ease;
}
.training-page button[class*="hover:bg-orange-"]:hover,
.training-page main > div > button:hover {
  background-color: #5720c4;
}
.training-page main > div > button {
  padding: 14px 24px;
}
.training-page #learn .grid {
  gap: 32px;
}
.training-page figure {
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: none;
}
.training-page #faq .border-2 {
  border-width: 1px;
  border-color: var(--line);
  border-radius: 6px;
}
.training-page #faq button {
  padding: 18px 20px;
  color: var(--ink);
  background: #fff;
}
.training-page #faq button:hover,
.training-page #faq [class*="bg-slate-50"] {
  background: var(--light);
}
.training-page #faq h3 {
  font-size: 18px;
}
.training-page #faq .border-t-2 {
  border-top-width: 1px;
  border-color: var(--line);
}
.training-page footer {
  padding: 40px 24px 28px;
  color: var(--ink);
  background: #fff;
  border-top: 1px solid var(--line);
}
.training-page footer h3,
.training-page footer h4,
.training-page footer a,
.training-page footer p {
  color: var(--ink);
}
.training-page footer p,
.training-page footer li,
.training-page footer a {
  font-size: 14px;
}
.training-page footer .border-t {
  border-color: var(--line);
}
.training-page footer .text-slate-400 {
  color: var(--muted);
}
.training-page [role="dialog"] {
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: 0 18px 48px rgba(17, 23, 32, 0.18);
}
.training-page [role="dialog"] h2 {
  color: var(--ink);
  font-size: 24px;
}
.training-page [role="dialog"] input,
.training-page [role="dialog"] select {
  border: 1px solid var(--line);
  border-radius: 4px;
}
.training-page [role="dialog"] input:focus,
.training-page [role="dialog"] select:focus {
  border-color: var(--brand);
  outline: 2px solid rgba(105, 38, 232, 0.16);
}
.training-page button:focus-visible {
  outline: 3px solid rgba(105, 38, 232, 0.3);
  outline-offset: 2px;
}
@media (max-width: 640px) {
  .training-page .training-navbar {
    height: 66px;
    padding: 0 18px;
  }
  .training-page .training-brand {
    gap: 8px;
  }
  .training-page .training-brand-mark {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    font-size: 12px;
  }
  .training-page .training-brand-name {
    font-size: 15px;
  }
  .training-page .training-navbar-cta {
    min-height: 40px;
    gap: 6px;
    padding: 0 12px;
    font-size: 11px;
  }
  .training-page .training-navbar-cta svg {
    width: 13px;
    height: 13px;
  }
  @media (max-width: 380px) {
    .training-page .training-brand-mark {
      display: none;
    }
    .training-page .training-brand-name {
      font-size: 14px;
    }
    .training-page .training-navbar {
      padding: 0 16px;
    }
  }
  .training-page main > section {
    padding: 32px 20px;
  }
  .training-page #hero {
    padding-top: 44px;
    padding-bottom: 36px;
  }
  .training-page #hero h1 {
    margin: 20px 0;
    font-size: clamp(38px, 10vw, 52px);
    letter-spacing: -0.045em;
  }
  .training-page main > section h2 {
    font-size: 20px;
  }
  .training-page main > section h3 {
    font-size: 18px;
  }
  .training-page #hero p {
    font-size: 17px;
  }
  .training-page #hero .border-t {
    margin-top: 4px;
    padding-top: 22px;
  }
  .training-page #hero .border-t > div > div > div:first-child {
    font-size: 28px;
  }
  .training-page #hero .border-t > div > div > div:last-child {
    font-size: 12px;
  }
  .training-page #hero .border-t > div {
    gap: 18px;
  }
  .training-page #learn .grid {
    gap: 28px;
  }
  .training-page main > div {
    padding: 16px 20px;
  }
  .training-page main > div > button {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
  }
  .training-page #faq button {
    padding: 16px;
  }
  .training-page #faq h3 {
    font-size: 16px;
  }
  .training-page footer {
    padding: 32px 20px 24px;
  }
}
`;

export default function App() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [hasAcknowledgedRegistrationNotice, setHasAcknowledgedRegistrationNotice] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countryCode, setCountryCode] = useState("GH");
  const [trainingPrice, setTrainingPrice] = useState(BASE_TRAINING_PRICE_GHS);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [registrationDetails, setRegistrationDetails] = useState({
    name: "",
    phone: "",
    training: "",
    importGoal: "",
    startTimeframe: "",
    productIdea: "",
    budget: "",
    hasCapital: "",
    canAttendLive: "",
    trainingExpectation: "",
  });
  const testimonialCarouselRef = useRef(null);
  const viewContentTracked = useRef(false);

  useEffect(() => {
    if (!PIXEL_ENABLED || viewContentTracked.current) return;
    viewContentTracked.current = true;

    try {
      trackViewContent({
        name: "Import with BusyDev Training Registration",
        price: BASE_TRAINING_PRICE_GHS,
      });
    } catch (error) {
      console.error("ViewContent tracking failed:", error);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function detectCountryAndPrice() {
      try {
        const locationResponse = await fetch("https://ipapi.co/json/");
        if (!locationResponse.ok) {
          throw new Error(`Location lookup failed with status ${locationResponse.status}`);
        }

        const location = await locationResponse.json();
        const detectedCountry = location.country_code;
        if (!Object.hasOwn(COUNTRY_SETTINGS, detectedCountry)) {
          if (isActive) setCountryCode("GH");
          return;
        }

        if (detectedCountry === "GH") {
          if (isActive) setCountryCode("GH");
          return;
        }

        const ratesResponse = await fetch("https://open.er-api.com/v6/latest/GHS");
        if (!ratesResponse.ok) {
          throw new Error(`Exchange rate lookup failed with status ${ratesResponse.status}`);
        }

        const ratesData = await ratesResponse.json();
        const exchangeRate = ratesData.rates?.[COUNTRY_SETTINGS[detectedCountry].currency];
        if (ratesData.result !== "success" || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
          throw new Error(`A valid GHS to ${COUNTRY_SETTINGS[detectedCountry].currency} exchange rate was not returned`);
        }

        if (isActive) {
          setCountryCode(detectedCountry);
          setTrainingPrice(BASE_TRAINING_PRICE_GHS * exchangeRate);
        }
      } catch (error) {
        console.error("Unable to detect location or convert the training price; using GHS.", error);
        if (isActive) {
          setCountryCode("GH");
          setTrainingPrice(BASE_TRAINING_PRICE_GHS);
        }
      } finally {
        if (isActive) setIsPriceLoading(false);
      }
    }

    detectCountryAndPrice();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!PIXEL_ENABLED) {
      console.warn("PIXEL_ID is not configured. Meta Pixel events will be skipped.");
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
          name: "Import with BusyDev Training Registration",
          price: trainingPrice,
        });
      } catch (error) {
        console.error("InitiateCheckout tracking failed:", error);
      }
    }

    setHasAcknowledgedRegistrationNotice(false);
    setIsRegistrationOpen(true);
  }

  async function handleRegistrationSubmit(event) {
    event.preventDefault();

    const name = registrationDetails.name.trim();
    const phone = registrationDetails.phone.trim();
    const training = registrationDetails.training.trim();
    const importGoal = registrationDetails.importGoal;
    const startTimeframe = registrationDetails.startTimeframe;
    const productIdea = registrationDetails.productIdea.trim();
    const budget = registrationDetails.budget;
    const hasCapital = registrationDetails.hasCapital;
    const canAttendLive = registrationDetails.canAttendLive;
    const trainingExpectation = registrationDetails.trainingExpectation;
    const leadQualityByExpectation = {
      "Step-by-step masterclass for first import": "high",
      "Planning to import in the coming months": "mid",
      "Looking for free information, not ready to invest": "low",
    };
    const leadQuality = leadQualityByExpectation[trainingExpectation];
    const phoneRule = COUNTRY_SETTINGS[countryCode];

    if (!name || !phone || !training || !trainingExpectation) {
      alert("Please fill all fields");
      return;
    }

    if (!phoneRule.phoneRegex.test(phone)) {
      alert(`Please enter a valid ${phoneRule.name} phone number, e.g. ${phoneRule.phoneExample}`);
      return;
    }

    setIsSending(true);

    if (PIXEL_ENABLED) {
      try {
        trackLead({ name: "Import with BusyDev Training Registration", price: trainingPrice });
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
            countryCode,
            trainingExpectation,
            leadQuality,
          }), 
        });

        console.log("Registration sent to Google Sheets");
      } catch (error) {
        console.error("Registration submission failed:", error);
      }
    };

    sendRegistrationInBackground();
    window.open("https://chat.whatsapp.com/BtTNHlrXWRJJQ5yjVTahUs", "_blank", "noopener,noreferrer");
    // const paymentUrl = countryCode === "GH"
    //   ? GHANA_PAYMENT_URL
    //   : countryCode === "KE"
    //     ? KENYA_PAYMENT_URL
    //     : NIGERIA_PAYMENT_URL;
    // window.open(paymentUrl, "_blank", "noopener,noreferrer");
    // setIsRegistrationOpen(false);
    // setRegistrationDetails({ name: "", phone: "", training: "" });
    // setIsSending(false);
  }

  const priceSettings = COUNTRY_SETTINGS[countryCode];
  const formattedTrainingPrice = new Intl.NumberFormat(priceSettings.locale, {
    style: "currency",
    currency: priceSettings.currency,
    maximumFractionDigits: priceSettings.currency === "GHS" ? 2 : 0,
  }).format(trainingPrice);

  return (
    <div className="training-page min-h-screen">
      <style>{TRAINING_PAGE_CSS}</style>
      <MetaPixel id={PIXEL_ID} />
      {/* Navigation */}
      <header className="training-navbar">
        <div className="training-navbar-inner">
          <a href="#hero" className="training-brand" aria-label="Import with BusyDev home">
            <span className="training-brand-mark" aria-hidden="true">IB</span>
            <span className="training-brand-name"><span>Import</span> with <strong>BusyDev</strong></span>
          </a>
          <nav aria-label="Main navigation">
            <button
              type="button"
              onClick={handleJoinClick}
              className="training-navbar-cta"
            >
              Join free training
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4.5 10h11m0 0-4.5-4.5M15.5 10 11 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section id="hero" className="px-6 py-16 lg:px-10 bg-gradient-to-b from-slate-50 to-white ">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              {/* <div className="hero-eyebrow">Free Mini Importation Training</div> */}
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
                  <div className="text-2xl font-bold text-orange-600">700+</div>
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
              <div className="min-w-0">
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-950 mb-8 uppercase tracking-wide break-words">{trainingSections.china.title}</h3>
                <ul className="space-y-3">
                  {trainingSections.china.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700 leading-relaxed break-words">
                      <span className="text-orange-600 font-bold flex-shrink-0 pt-1">•</span>
                      <span className="min-w-0 break-words">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gadget Importation */}
              <div className="min-w-0">
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-950 mb-8 uppercase tracking-wide break-words">{trainingSections.gadget.title}</h3>
                <ul className="space-y-3">
                  {trainingSections.gadget.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700 leading-relaxed break-words">
                      <span className="text-orange-600 font-bold flex-shrink-0 pt-1">•</span>
                      <span className="min-w-0 break-words">{point}</span>
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
                disabled={isSending || isPriceLoading}
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
            className={`relative flex ${hasAcknowledgedRegistrationNotice ? "h-[min(38rem,calc(100dvh-4rem))]" : "max-h-[calc(100dvh-4rem)]"} w-full max-w-md flex-col overflow-hidden rounded-lg bg-white p-6 text-slate-950 shadow-2xl sm:p-8`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={hasAcknowledgedRegistrationNotice ? "registration-title" : "registration-notice-title"}
          >
            <button
              type="button"
              onClick={() => setIsRegistrationOpen(false)}
              aria-label="Close registration form"
              className="absolute right-4 top-3 cursor-pointer text-2xl leading-none text-slate-500 transition hover:text-slate-950"
            >
              &times;
            </button>
            {!hasAcknowledgedRegistrationNotice ? (
              <div>
                <h2 id="registration-notice-title" className="pr-8 text-2xl font-bold">Please note</h2>
                <p className="mt-3 text-slate-600">
                  The free class only covers the basics of importation. You can get the full paid course after the class ends.
                </p>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setHasAcknowledgedRegistrationNotice(true)}
                  className="mt-6 w-full cursor-pointer rounded-md bg-orange-600 px-5 py-3 font-bold text-white transition hover:bg-orange-700"
                >
                  I understand
                </button>
              </div>
            ) : (
              <>
                <h2 id="registration-title" className="pr-8 text-2xl font-bold">Register for training</h2>
                <p className="text-sm mt-2 text-slate-600">Enter your details to join the training community on WhatsApp.</p>

                <form onSubmit={handleRegistrationSubmit} className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
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
                      pattern={COUNTRY_SETTINGS[countryCode].phonePattern}
                      title={`Enter a valid ${COUNTRY_SETTINGS[countryCode].name} phone number, for example ${COUNTRY_SETTINGS[countryCode].phoneExample}`}
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
                      <option value="China Import Training">China Import Training</option>
                      <option value="Turkey/Dubai/Bangladesh Import Training">Turkey/Dubai/Bangladesh Import Training</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  {/* <div>
                    <label htmlFor="registration-live" className="mb-1 block text-sm font-semibold">
                      Can you attend the free class live?
                    </label>
                    <select
                      id="registration-live"
                      value={registrationDetails.canAttendLive}
                      onChange={(event) => setRegistrationDetails({ ...registrationDetails, canAttendLive: event.target.value })}
                      required
                      className="w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3 focus:border-orange-600 focus:outline-none"
                    >
                      <option value="" disabled>Select an answer</option>
                      <option value="Yes">Yes, I will be there</option>
                      <option value="Not sure yet">Not sure yet</option>
                      <option value="No">No</option>
                    </select>
                  </div> */}
                  <div>
                    <label htmlFor="registration-expectation" className="mb-1 block text-sm font-semibold">
                      What are you hoping to get out of this free training?
                    </label>
                    <select
                      id="registration-expectation"
                      value={registrationDetails.trainingExpectation}
                      onChange={(event) => setRegistrationDetails({ ...registrationDetails, trainingExpectation: event.target.value })}
                      required
                      className="w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3 focus:border-orange-600 focus:outline-none"
                    >
                      <option value="" disabled>Select what best describes you</option>
                      <option value="Step-by-step masterclass for first import">
                        I’m looking for a step-by-step masterclass to help me source and ship my first batch of products.
                      </option>
                      <option value="Planning to import in the coming months">
                        I plan to import in the coming months and want to see if this program is the right fit.
                      </option>
                      <option value="Looking for free information, not ready to invest">
                        I'm mainly looking for free information at the moment, not ready to import yet.
                      </option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full cursor-pointer rounded-md bg-orange-600 px-5 py-2 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending ? "Submitting..." : `Join Free Training`}
                    {/* {isSending ? "Submitting..." : isPriceLoading ? "Loading local price..." : `Pay ${formattedTrainingPrice} to Join Training`} */}
                  </button>

                </form>
             {/* <div className="mt-2 text-left text-xs text-slate-600">
                You’ll be taken to the checkout provider to complete your payment. Please ensure your phone number is active on WhatsApp for training updates.
              </div>
              <div className="mt-2 text-left text-xs text-slate-600">
                Need some more info? Send me a message on Whatsapp{" "}
                <Link className="font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800" to="https://tinyurl.com/ymanwze6">
                  Send Message
                </Link>
              </div> */}
              </>
            )}
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
