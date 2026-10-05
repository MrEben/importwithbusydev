import { useState } from "react";

/* ---------- DATA (edit freely) ---------- */
const PAYSTACK_CHECKOUT_URL = "https://paystack.shop/pay/jpsodftqus";

const COURSE = {
  title: "The Complete Importation Masterclass",
  category: "Importation Business",
  rating: 5.0,
  price: "GH₵420.00",
  level: "Beginner Friendly",
  enrolled: 220,
  updated: "Sept 12, 2026",
  author: "Ebenezer Odame",
  videoSrc: "https://play.gumlet.io/embed/6ac32813d6a6ba7c2cc3baeb",
  poster: "",
  headline: "LEARN HOW TO SOURCE, SHIP, AND SELL PRODUCTS FROM CHINA, TURKEY, DUBAI, AND BANGLADESH.",
  about: [
    "I've spent the last 5 years in the importation business, working through the challenges of sourcing, negotiating, shipping, and selling goods.",
    "This training brings practical lessons together so you can make smarter decisions, find reliable suppliers, understand shipping and CBM calculations, and import products by yourself.",
  ],
  sections: [
    {
      title: "Module 1: Introduction to China Importation in Ghana",
      lessons: [
        { name: "Understand how the China importation business works", time: "02:00", locked: true },
        { name: "Discover why importation is one of the fastest ways to build a profitable business with low capital", time: "04:15", locked: true },
      ],
    },
    {
      title: "Module 2: Finding Winning Products (Optional)",
      lessons: [
        { name: "Learn how to identify hot selling products", time: "03:20", locked: true },
        { name: "Understand product research techniques and market validation", time: "05:10", locked: true },
        { name: "Discover low competition, high demand products that generate consistent profits", time: "04:05", locked: true },
      ],
    },
    {
      title: "Module 3: Essential Apps & Tools for Importation",
      lessons: [
        { name: "Master 1688, Pinduoduo, Alibaba, Taobao, Alipay, WeChat, Google Translate, and Hi Dictionary", time: "06:45", locked: true },
        { name: "Learn how to use your smartphone as a complete importation business system", time: "03:55", locked: true },
      ],
    },
    {
      title: "Module 4: How to Buy from 1688, Alibaba & Pinduoduo",
      lessons: [
        { name: "Understand how to search products using images and keywords", time: "02:20", locked: true },
        { name: "Learn how to identify trusted suppliers and avoid fake sellers", time: "03:10", locked: true },
        { name: "Master supplier communication even without speaking Chinese", time: "04:40", locked: true },
        { name: "4.1.1 Intro to 1688 App", time: "02:10", locked: true },
        { name: "4.1.2 How to Enter Shipping Mark/Address on 1688", time: "03:05", locked: true },
        { name: "4.1.3 How to Buy from 1688", time: "04:25", locked: true },
        { name: "4.1.4 Master supplier communication", time: "03:15", locked: true },
        { name: "4.1.5 What happens next?", time: "02:50", locked: true },
        { name: "4.2.1 Intro to Alibaba App", time: "02:15", locked: true },
        { name: "4.2.2 What to do before you buy from Alibaba", time: "02:55", locked: true },
        { name: "4.2.3 Buying from Alibaba. Next Steps", time: "03:40", locked: true },
        { name: "4.3.1 Intro to Pinduoduo", time: "02:25", locked: true },
        { name: "4.3.2 Buying from Pinduoduo. Next Steps", time: "03:35", locked: true },
      ],
    },
    {
      title: "Module 5: Payment Methods & Currency Exchange",
      lessons: [
        { name: "Discover the safest ways to pay Chinese suppliers from Ghana", time: "04:10", locked: true },
        { name: "5.1 Learn how to create, verify and fund your Alipay for all your payments", time: "05:20", locked: true },
        { name: "5.2 Payment with Virtual Card", time: "03:40", locked: true },
      ],
    },
    {
      title: "Module 6: Shipping & Clearing to Ghana",
      lessons: [
        { name: "Understand air shipping vs sea shipping and when to use each", time: "04:30", locked: true },
        { name: "Learn shipping timelines, costs, weight calculations, and cargo procedures", time: "05:15", locked: true },
        { name: "Discover how to ship products safely from China without stress", time: "04:05", locked: true },
      ],
    },
    {
      title: "Module 7: Selling & Marketing Your Products",
      lessons: [
        { name: "Learn how to sell imported products online and offline", time: "03:35", locked: true },
        { name: "Master WhatsApp marketing, Facebook Ads, TikTok marketing, and Instagram promotion", time: "06:20", locked: true },
        { name: "Discover how to create irresistible offers that make customers buy fast", time: "04:15", locked: true },
      ],
    },
    {
      title: "Bonus Module: Secrets, Mistakes & Supplier Contacts",
      lessons: [
        { name: "Common mistakes beginners make and how to avoid them", time: "03:50", locked: true },
        { name: "Important importation tips that save money and reduce losses", time: "04:00", locked: true },
        { name: "Access to trusted supplier and shipping agent contacts", time: "02:45", locked: true },
      ],
    },
  ],
};

const OFFER_ITEMS = [
  { title: "Complete Importation Masterclass", value: 500 },
  { title: "Mentorship", value: 200 },
  { title: "Supplier & shipping-agent contacts", value: 250 },
  { title: "Product research, selling & marketing training", value: 250 },
];
const OFFER_TOTAL = OFFER_ITEMS.reduce((total, item) => total + item.value, 0);

const REVIEWS = [
  { initials: "AA", name: "Ama Agyeman", when: "2 months ago", stars: 5,
    text: "This course helped me to understand how to communicate with suppliers before ordering. I feel confident starting my own import business." },
  { initials: "DW", name: "Daniel Wiafe", when: "4 months ago", stars: 5,
    text: "I loved how practical the lessons were. It was not just theory. I learned how to make handle payments to my suppliers" },
  { initials: "EO", name: "Efua Owusu", when: "7 months ago", stars: 5,
    text: "The training was easy to follow and very practical. I especially liked the part on supplier communication and payment methods. It saved me from making costly mistakes before I even started." },
  { initials: "KY", name: "Kojo Yeboah", when: "1 month ago", stars: 5,
    text: "I have taken an importation course before but this one was more detailed. I now know how to source for products, communicate with suppliers, and pay my suppliers. The lessons are beginner-friendly and very practical." },
  { initials: "MB", name: "Mabel Boateng", when: "5 months ago", stars: 5,
    text: "I was scared to start, but now I know how to avoid fake sellers and identify genuine suppliers and shipping agents." },
];

/* ---------- ICONS ---------- */
const I = ({ children, size = 24, fill = "none", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
);
const Star = ({ size = 24, filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
       fill={filled ? "#f4b942" : "none"} stroke="#f4b942" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z" />
  </svg>
);
const Stars = ({ n = 5, size = 24 }) => (
  <div className="stars">{Array.from({ length: n }).map((_, i) => <Star key={i} size={size} />)}</div>
);

/* ---------- COMPONENT ---------- */
export default function CourseDetail() {
  const [tab, setTab] = useState("info");
  const [open, setOpen] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const handleCheckout = () => {
    window.open(PAYSTACK_CHECKOUT_URL, "_blank", "noopener,noreferrer");
  };

  const total = 35;
  // const total = REVIEWS.length;
  const bars = [5, 4, 3, 2, 1].map((s) => ({ s, c: REVIEWS.filter((r) => r.stars === s).length }));

  return (
    <div className="cep">
      <style>{CSS}</style>

      {/* NAVBAR */}
      <header className="nav">
       <div className="text-lg font-bold uppercase tracking-wide">
          <span className="text-purple-700">Import</span>withBusyDev
        </div>
        <div className="flex items-center gap-4">
         <button
            type="button"
            onClick={handleCheckout}
            className="rounded-sm bg-purple-700 px-6 py-2 text-white font-semibold transition hover:bg-orange-700"
          >
            ENROLL
          </button>
          </div>
        {/* <div className="logo">Create &amp; <span>Earn</span> <small>PROGRAM</small></div> */}
        {/* <button className="burger" aria-label="Menu">
          <svg width="28" height="28" viewBox="0 0 24 24" stroke="#6926E8" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button> */}
      </header>

      <main className="page">
        {/* TOP INFO */}
        <div className="rating-row">
          <Stars size={26} />
          <b>{COURSE.rating.toFixed(2)}</b>
          <span className="muted">({total} Ratings)</span>
        </div>
        <h1>{COURSE.title}</h1>
        <div className="meta-row">
          <span className="muted cat">Lesson 1</span>
          <div className="actions">
            <button><I size={22}><path d="M6 3h12v18l-6-4-6 4z" /></I>Wishlist</button>
            <button><I size={22}><path d="M14 4l7 7-7 7v-4c-6 0-9 2-11 6 1-7 4-12 11-12z" /></I>Share</button>
          </div>
        </div>

        {/* VIDEO */}
        <div className="video">
          {COURSE.videoSrc ? (
            <iframe
              src={COURSE.videoSrc}
              title="Importation course video"
              loading="lazy"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
              referrerPolicy="origin"
              style={{ border: "none", width: "100%", height: "100%", display: "block" }}
            />
          ) : (
            <>
              <div className="video-bg" style={COURSE.poster ? { backgroundImage: `url(${COURSE.poster})` } : {}} />
              <button className="big-play" onClick={() => setPlaying(!playing)} aria-label="Play">
                {playing
                  ? <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
                  : <svg width="38" height="38" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>}
              </button>
              <div className="controls">
                <button onClick={() => setPlaying(!playing)} aria-label="Play/Pause">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <div className="seek"><i /></div>
                <span className="time">02:21</span>
                <button onClick={() => setMuted(!muted)} aria-label="Mute">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M4 9v6h4l5 4V5L8 9z" stroke="none" />
                    {!muted && <path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" fill="none" />}
                  </svg>
                </button>
                <div className="vol"><i /><b /></div>
                <button aria-label="Settings">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M19.4 13a7.6 7.6 0 000-2l2.1-1.6-2-3.4-2.5 1a7.5 7.5 0 00-1.7-1L15 3.3h-4l-.4 2.7a7.5 7.5 0 00-1.7 1l-2.5-1-2 3.4L6.6 11a7.6 7.6 0 000 2l-2.1 1.6 2 3.4 2.5-1c.5.4 1.1.7 1.7 1l.4 2.7h4l.4-2.7c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.4zM13 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" transform="translate(-1 0)"/></svg>
                </button>
                <button aria-label="Fullscreen">
                  <I size={26} style={{ color: "#fff" }}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></I>
                </button>
              </div>
            </>
          )}
        </div>

        {/* TABS */}
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "info"} className={tab === "info" ? "on" : ""} onClick={() => setTab("info")}>Course Info</button>
          <button role="tab" aria-selected={tab === "reviews"} className={tab === "reviews" ? "on" : ""} onClick={() => setTab("reviews")}>Reviews</button>
        </div>

        {/* COURSE INFO */}
        {tab === "info" && (
          <section>
            <h2>About Course</h2>
            <p className="headline">{COURSE.headline}</p>
            {COURSE.about.map((t, i) => <p className="body" key={i}>{t}</p>)}

            <h2 className="content-h">Course Content</h2>
            {COURSE.sections.map((sec, i) => {
              const isOpen = open === i;
              return (
                <div className={"acc" + (isOpen ? " open" : "")} key={sec.title}>
                  <button className="acc-head" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                    <span>{sec.title}</span>
                    <svg className="chev" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {isOpen && sec.lessons.map((l) => (
                    <div className="lesson" key={l.name}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="#9aa0a6"><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M10 9v6l5-3z" fill="#fff" /></svg>
                      <span className="l-name">{l.name}</span>
                      <span className="l-time">{l.time}</span>
                      {l.locked && (
                        <I size={24} style={{ color: "#5b6470" }}><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" /></I>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </section>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <section>
            <h2>Student Ratings &amp; Reviews</h2>
            <div className="rev-card">
              <div className="rev-summary">
                <div className="big">{COURSE.rating.toFixed(1)}</div>
                <Stars size={30} />
                <p className="total">Ratings</p>
                {bars.map(({ s, c }) => (
                  <div className="bar-row" key={s}>
                    <Star size={24} filled={false} />
                    <span className="num">{s}</span>
                    <div className="track"><div className="fill" style={{ width: `${(c / total) * 100}%` }} /></div>
                    <span className="cnt">{c} Rating{c > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
              {REVIEWS.map((r, i) => (
                <article className={"review" + (i % 2 ? " alt" : "")} key={r.name}>
                  <div className="avatar">{r.initials}</div>
                  <h4>{r.name}</h4>
                  <span className="when">{r.when}</span>
                  <Stars n={r.stars} size={22} />
                  <p>{r.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* PURCHASE CARD */}
        <div className="buy">
          <div className="buy-top">
            <p className="bundle-intro">Here’s everything included in your package:</p>
            <div className="breakdown" aria-label="Package value breakdown">
              {OFFER_ITEMS.map((item) => (
                <div className="breakdown-row" key={item.title}>
                  <span>{item.title}</span>
                  <span>GH₵{item.value.toLocaleString("en-GH")}</span>
                </div>
              ))}
            </div>
            <div className="value-total">
              <span>Total value</span>
              <strong className="original-value">GH₵{OFFER_TOTAL.toLocaleString("en-GH")}</strong>
            </div>
            <p className="offer-message">I’m offering you all of this for:</p>
            <div className="price">{COURSE.price}</div>
            <button type="button" className="cart" onClick={handleCheckout}>
              <I size={24}><path d="M2 3h3l2.4 12.2a1 1 0 001 .8h9.3a1 1 0 001-.8L20 7H6" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></I>
              ENROLL NOW
            </button>
          </div>
          <ul>
            <li><I size={24}><path d="M5 20V10M11 20V4M17 20v-7" /></I>{COURSE.level}</li>
            <li><I size={24}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" /></I>{COURSE.enrolled} Total Enrolled</li>
            <li><I size={24}><path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3" /><path d="M18 3v4h-4M6 21v-4h4" /></I>{COURSE.updated} Last Updated</li>
          </ul>
        </div>

        {/* AUTHOR */}
        <div className="author">
          <p>A course by</p>
          <div className="a-row"><div className="avatar lg">{COURSE.author[0]}</div><b>{COURSE.author}</b></div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="foot">
        <span>Copyright © 2026 ImportWithBusydev</span>
        <button className="top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 15l7-7 7 7" /></svg>
        </button>
      </footer>
    </div>
  );
}

/* ---------- CSS ---------- */
const CSS = `
.cep{--brand:#6926E8;--accent:#BF0000;--white:#FFFFFF;--light:#F5F5F5;--ink:#111720;--muted:#5d6470;--line:#e5e7eb;--soft:#F5F5F5;
  font-family:Inter,"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;color:var(--ink);
  background:var(--white);min-height:100vh;-webkit-font-smoothing:antialiased}
.cep *{box-sizing:border-box}
.cep button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
.cep h1,.cep h2,.cep h4,.cep p,.cep ul{margin:0;padding:0}
.cep ul{list-style:none}

.cep .nav{display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:74px;
  background:var(--white);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:10}
.cep .logo{font-size:26px;font-weight:800;letter-spacing:-.02em}
.cep .logo span{color:var(--brand)}
.cep .logo small{font-size:18px;font-weight:400;letter-spacing:0;color:#111720}

.cep .page{max-width:640px;margin:0 auto;padding:36px 38px 40px;background:#fff}
.cep .rating-row{display:flex;align-items:center;gap:10px;font-size:22px}
.cep .stars{display:flex;gap:6px}
.cep .rating-row .stars{margin-right:10px}
.cep .muted{color:var(--muted)}
.cep h1{font-size:28px;font-weight:700;margin:26px 0 30px;letter-spacing:-.01em}
.cep .meta-row{display:flex;justify-content:space-between;align-items:flex-start;font-size:22px}
.cep .cat{padding-top:20px}
.cep .actions{display:flex;gap:28px;margin-top:22px;color:var(--muted)}
.cep .actions button{display:flex;align-items:center;gap:10px;font-size:22px;color:var(--muted)}

.cep .video{position:relative;margin-top:38px;aspect-ratio:509/270;background:#2b2b2b;overflow:hidden}
.cep .video video{width:100%;height:100%;object-fit:cover;display:block}
.cep .video-bg{position:absolute;inset:0;background:
  radial-gradient(circle at 30% 25%,#f0a35a 0,#6b5a4e 25%,transparent 45%),
  linear-gradient(180deg,#8d8d8d,#4d4d4d);background-size:cover;background-position:center}
.cep .video::after{content:"";position:absolute;inset:auto 0 0 0;height:40%;
  background:linear-gradient(transparent,rgba(0,0,0,.55));pointer-events:none}
.cep .big-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:72px;height:72px;border-radius:50%;
  background:var(--brand);display:grid;place-items:center;z-index:2;padding-left:4px}
.cep .controls{position:absolute;left:0;right:0;bottom:0;padding:0 18px 12px;display:flex;align-items:center;gap:14px;z-index:2;color:#fff}
.cep .seek{width:46px;height:3px;background:rgba(255,255,255,.35);position:relative;border-radius:2px;margin-left:-4px}
.cep .seek i{position:absolute;left:-8px;top:50%;width:18px;height:18px;border-radius:50%;background:#fff;transform:translateY(-50%)}
.cep .time{font-size:19px}
.cep .vol{flex:1;height:4px;background:var(--brand);border-radius:2px;position:relative}
.cep .vol i{position:absolute;right:-2px;top:50%;width:18px;height:18px;border-radius:50%;background:#fff;transform:translateY(-50%)}

.cep .tabs{display:flex;gap:0;margin-top:44px;border-bottom:1px solid var(--line)}
.cep .tabs button{padding:16px 30px;font-size:24px;color:#333;border-bottom:3px solid transparent;margin-bottom:-1px}
.cep .tabs button.on{color:var(--brand);border-color:var(--brand)}
.cep .tabs button:focus-visible,.cep .acc-head:focus-visible,.cep .cart:focus-visible{outline:3px solid #9db4ff;outline-offset:2px}

.cep h2{font-size:26px;font-weight:700;margin:42px 0 26px}
.cep .headline{font-size:22px;font-weight:700;line-height:1.6;color:#2b2f36;text-transform:uppercase;margin-bottom:34px}
.cep .body{font-size:22px;line-height:1.6;color:#444b55;font-weight:300;margin-bottom:34px}
.cep .content-h{margin-top:56px}

.cep .acc{border:1px solid var(--line);border-radius:6px;margin-bottom:18px;overflow:hidden;background:#fff}
.cep .acc-head{width:100%;display:flex;align-items:center;justify-content:space-between;padding:24px 30px;
  font-size:28px;text-align:left;color:#1f2937}
.cep .acc.open .acc-head{background:var(--light);color:var(--brand);font-weight:500;padding:26px 30px}
.cep .chev{color:var(--brand);transition:transform .2s}
.cep .acc.open .chev{transform:rotate(-90deg)}
.cep .lesson{display:flex;align-items:center;gap:16px;padding:16px 24px;font-size:22px;border-top:1px solid var(--line)}
.cep .l-name{flex:1;line-height:1.45}
.cep .l-time{display:inline-flex;align-items:center;justify-content:center;min-width:68px;color:var(--muted);font-size:17px;margin-right:12px;padding:6px 8px;border-radius:999px;background:var(--light);font-weight:600}

.cep .rev-card{border:1px solid var(--line);border-radius:6px;overflow:hidden;margin-top:10px}
.cep .rev-summary{padding:38px 26px 42px;text-align:center;border-bottom:1px solid var(--line);background:#fff}
.cep .big{font-size:96px;font-weight:600;line-height:1;margin-bottom:22px;letter-spacing:-.02em}
.cep .rev-summary .stars{justify-content:center;gap:8px}
.cep .total{font-size:21px;color:#333;margin:28px 0 30px}
.cep .bar-row{display:flex;align-items:center;gap:14px;margin-bottom:20px;font-size:21px}
.cep .bar-row .num{width:18px;text-align:left}
.cep .track{flex:1;height:8px;border-radius:4px;background:#e4e6ea;overflow:hidden}
.cep .fill{height:100%;background:var(--brand);border-radius:4px}
.cep .cnt{width:96px;text-align:left;color:#333}
.cep .review{padding:32px 26px 36px;border-bottom:1px solid var(--line);background:#fff}
.cep .review.alt{background:var(--light)}
.cep .review:last-child{border-bottom:0}
.cep .avatar{width:72px;height:72px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-size:21px}
.cep .avatar.lg{width:72px;height:72px;font-size:24px}
.cep .review h4{font-size:21px;font-weight:400;margin:22px 0 10px}
.cep .when{display:block;color:var(--muted);font-size:19px;margin-bottom:22px}
.cep .review .stars{gap:6px;margin-bottom:24px}
.cep .review p{font-size:19px;line-height:1.75;color:#4b5563}

.cep .buy{margin-top:72px;border:1px solid var(--line);border-radius:6px;background:#fff;overflow:hidden}
.cep .buy-top{background:var(--soft);padding:44px 48px 48px}
.cep .bundle-intro{font-size:22px;font-weight:700;margin-bottom:18px}
.cep .breakdown{display:grid;gap:14px;padding-bottom:20px;border-bottom:1px solid #d9dce2}
.cep .breakdown-row,.cep .value-total{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;font-size:18px;line-height:1.45}
.cep .breakdown-row span:last-child{font-weight:600;white-space:nowrap}
.cep .original-value{text-decoration:line-through}
.cep .value-total{align-items:center;padding-top:18px;font-size:20px}
.cep .value-total strong{font-size:32px;color:var(--brand);white-space:nowrap}
.cep .offer-message{font-size:18px;font-weight:600;margin:28px 0 8px}
.cep .price{font-size:42px;font-weight:800;color:var(--accent);margin-bottom:26px}
.cep .cart{width:100%;display:flex;align-items:center;justify-content:center;gap:12px;background:var(--accent);color:#fff;
  font-size:24px;border-radius:6px;height:74px;transition:filter .15s}
.cep .cart:hover{filter:brightness(1.1)}
.cep .buy ul{padding:44px 20px 34px;border-top:1px solid var(--line)}
.cep .buy li{display:flex;align-items:center;gap:18px;font-size:22px;color:#333;margin-bottom:26px}
.cep .buy li svg{color:#333;flex:none}

.cep .author{margin-top:36px;border:1px solid var(--line);border-radius:6px;background:var(--light);padding:48px 48px 54px}
.cep .author p{font-size:23px;margin-bottom:30px}
.cep .a-row{display:flex;align-items:center;gap:24px}
.cep .a-row b{font-size:23px}
.cep .a-row .avatar{width:72px;height:72px}

.cep .foot{border-top:1px solid var(--line);display:flex;align-items:center;justify-content:center;gap:60px;
  padding:56px 24px 60px;color:#333;position:relative}
.cep .top{width:54px;height:54px;background:var(--brand);display:grid;place-items:center;border-radius:3px}

@media (min-width:700px){
  .cep .page{padding-top:44px}
}
@media (max-width:420px){
  .cep{font-size:14px}
  .cep .nav{height:56px;padding:0 20px}.cep .logo{font-size:22px}.cep .logo small{font-size:15px}
  .cep .page{padding:28px 20px 30px}
  .cep .rating-row{font-size:17px}.cep .rating-row svg{width:20px;height:20px}
  .cep h1{font-size:22px;margin:20px 0 22px}
  .cep .meta-row,.cep .actions button{font-size:17px}.cep .actions{gap:20px;margin-top:14px}
  .cep .actions svg{width:18px;height:18px}
  .cep .video{margin-top:26px}.cep .big-play{width:56px;height:56px}
  .cep .time{font-size:14px}.cep .controls{gap:10px;padding:0 12px 8px}.cep .controls svg{width:22px;height:22px}
  .cep .tabs{margin-top:30px}.cep .tabs button{font-size:18px;padding:12px 24px}
  .cep h2{font-size:20px;margin:30px 0 20px}
  .cep .headline,.cep .body{font-size:17px;margin-bottom:24px}
  .cep .acc-head{font-size:22px;padding:18px 24px}.cep .acc.open .acc-head{padding:20px 24px}
  .cep .lesson{font-size:17px;padding:12px 20px}.cep .l-time{font-size:13px;min-width:58px;padding:5px 7px}
  .cep .big{font-size:72px}.cep .total,.cep .bar-row{font-size:15px}.cep .cnt{width:74px}
  .cep .avatar,.cep .a-row .avatar{width:56px;height:56px;font-size:16px}
  .cep .review h4{font-size:16px}.cep .when{font-size:14px}.cep .review p{font-size:14px}
  .cep .buy-top{padding:32px 24px 28px}
  .cep .bundle-intro{font-size:18px}
  .cep .breakdown-row{font-size:15px}
  .cep .value-total{font-size:17px}.cep .value-total strong{font-size:26px}
  .cep .offer-message{font-size:16px;margin-top:22px}
  .cep .price{font-size:32px;margin-bottom:20px}
  .cep .cart{height:56px;font-size:19px}
  .cep .buy ul{padding:32px 36px 20px}.cep .buy li{font-size:17px}
  .cep .author{padding:34px 36px 40px}.cep .author p,.cep .a-row b{font-size:18px}
  .cep .foot{font-size:17px;gap:30px;padding:40px 16px}
}
`;