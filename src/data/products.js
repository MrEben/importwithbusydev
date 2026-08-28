const sharedProductDetails = {
  illustrationImage: "https://i.postimg.cc/nzkm7Xr2/b-I-want-the-particula.png",
  youtubeUrl: "https://www.youtube.com/embed/WhdULXZf7BY",
  faqIntro: {
    question: "Is the product ready to use out of the box?",
    answer: "Yes. It ships with easy-to-follow guidelines if needed.",
  },
  variations: [],
  testimonials: [
    {
      id: 1,
      quote: "The product arrived quickly and looked exactly like what I ordered. The team confirmed everything on WhatsApp before delivery.",
      name: "James",
      role: "Verified Buyer",
      initials: "J",
      rating: 5,
    },
    {
      id: 2,
      quote: "Good value for the price. I liked that they called first to confirm my location and delivery details.",
      name: "Ama",
      role: "Repeat Customer",
      initials: "A",
      rating: 5,
    },
    {
      id: 3,
      quote: "Smooth ordering process, helpful customer service, and the item has been working well since I received it.",
      name: "Kojo",
      role: "NextLevel Customer",
      initials: "K",
      rating: 5,
    },
  ],
};

const products = [
  {
    name: "16 Pieces Plastic Plates Black Bowls Set",
    slug: "16-pieces-plastic-plates-black-bowls-set",
    category: "Kitchenware",
    price: 230,
    image: "https://i.postimg.cc/bJJzZvNm/gpt-image-1-5-high-fidelity-a-arrange-the-bow-set.jpg",
    //  carouselImages: [
    //   "https://i.postimg.cc/bJJzZvNm/gpt-image-1-5-high-fidelity-a-arrange-the-bow-set.jpg",
    //   "https://i.postimg.cc/Sx82X4gP/seedream-5-0-lite-a-I-want-a-similar-ima.jpg",
    //   "https://i.postimg.cc/Qd0w84D1/seedream-5-0-lite-a-I-want-a-similar-ima-(3).jpg",
    // ],
    // heroImages: [
    //   "https://i.postimg.cc/bJJzZvNm/gpt-image-1-5-high-fidelity-a-arrange-the-bow-set.jpg",
    //   "/images/chair-2.webp",
    //   "/images/chair-3.webp",
    //   "/images/chair-4.webp",
    // ],
    description: "A sleek black tableware set ideal for parties, picnics, and everyday meals.",
    features: [
      "Includes 16 durable plates and bowls.",
      "Lightweight yet sturdy BPA-free plastic.",
      "Stackable design for easy storage.",
      "Matte black finish for modern table settings."
    ],
    illustrationImage: "https://i.postimg.cc/7htTLDRg/b-I-want-a-similar-ima.jpg",
    available: true,
  },
  {
    name: "Short-Sleeved T-Shirt Men",
    slug: "short-sleeved-tshirt-men",
    category: "Apparel",
    price: 70,
    image: "https://i.postimg.cc/G2Wh6Cd7/t-shirt.jpg",
    description: "A soft, breathable t-shirt designed for everyday comfort and casual style.",
    illustrationImage: "https://i.postimg.cc/mDsTsMp1/seedream-4-5-a-I-want-a-similar-ima.jpg",
    features: [
      "100% cotton fabric for a smooth feel.",
      "Classic fit with reinforced stitching.",
      "Ideal for layering or wearing alone.",
      "Easy-care machine washable material."
    ],
    available: true,
  },
  {
    name: "2 in 1 Women's Pu Leather Tote Bag",
    slug: "2-in-1-womens-pu-leather-tote-bag",
    category: "Bags",
    price: 150,
    image: "https://i.postimg.cc/7hhMtSPX/IMG-20260501-WA0012.jpg",
    description: "A versatile PU leather tote that converts between handbag and shoulder bag styles.",
    features: [
      "Convertible 2-in-1 design with detachable strap.",
      "Premium PU leather with a polished finish.",
      "Multiple interior pockets for organized storage.",
      "Perfect for work, errands, and evening outings."
    ],
    illustrationImage: "https://i.postimg.cc/Wz4LN7GD/seedream-5-0-lite-a-I-want-a-similar-ima-(5).jpg",
    available: false,
  },
  {
    name: "Luxury Black Women’s Handbag",
    slug: "luxury-black-womens-handbag",
    category: "Bags",
    price: 70,
    image: "https://i.postimg.cc/jS0PPpf2/IMG-20260504-WA0018.jpg",
    description: "A fashionable black handbag that adds elegance to any outfit.",
    features: [
      "Compact design with polished hardware.",
      "Soft-touch exterior with a luxe look.",
      "Secure zip closure and interior pouch.",
      "Ideal for evenings, dates, and special events."
    ],
    illustrationImage: "https://i.postimg.cc/Z5Nk5ndv/seedream-5-0-lite-a-I-want-a-similar-ima-(4).jpg",
    available: true,
  },
  {
    name: "Women's Clutch Bag",
    slug: "womens-clutch-bag",
    category: "Bags",
    price: 150,
    image: "https://i.postimg.cc/FFYTZQYx/d13ff697-c5dc-4866-a432-66d82113dc51.jpg",
    description: "A stylish clutch bag with enough room for essentials and a polished finish.",
    features: [
      "Sleek silhouette with a magnetic closure.",
      "Soft-lined interior and card slots.",
      "Perfect for evenings, weddings, and formal looks.",
      "Lightweight and easy to carry."
    ],
    illustrationImage: "https://i.postimg.cc/RFM2dTbw/seedream-5-0-lite-a-I-want-a-similar-ima-(6).jpg",
    available: true,
  },
  {
    name: "MTN Cat 4 Turbonet Universal Router + Backup Battery",
    slug: "mtn-cat-4-turbonet-universal-router-backup-battery",
    category: "Electronics",
    price: 480,
    image: "https://i.postimg.cc/PqFmpPQ5/1779358032016-019e49fa-b566-7428-9971-bc9aeb870f8d.jpg",
    description: "A universal Cat 4 router with backup battery support for reliable internet on the go.",
    features: [
      "Compatible with multiple SIM networks.",
      "Built-in backup battery for power continuity.",
      "Fast 4G LTE connectivity for streaming and browsing.",
      "Easy setup with stable WiFi coverage."
    ],
    illustrationImage: "https://i.postimg.cc/PqFmpPQ5/1779358032016-019e49fa-b566-7428-9971-bc9aeb870f8d.jpg",
    available: false,
  },
  {
    name: "Silvercrest Airfryer",
    slug: "silvercrest-airfryer",
    category: "Kitchen Appliances",
    price: 480,
    image: "https://i.postimg.cc/BnRSj3PR/gemini-2-5-flash-image-preview-(nano-banana)-a-put-the-product-in-a.jpg",
    description: "A compact air fryer for healthier fried foods with quick and even cooking.",
    features: [
      "Rapid hot air circulation technology.",
      "Adjustable temperature control.",
      "Non-stick cooking basket for easy cleaning.",
      "Perfect for fries, chicken, and roasted vegetables."
    ],
    illustrationImage: "https://i.postimg.cc/htTwqYkT/seedream-5-0-lite-a-I-want-a-similar-ima-(2).jpg",
    available: true,
  },
  {
    name: "12pcs Borosilicate Glass Storage Bowls",
    slug: "12pcs-borosilicate-glass-storage-bowls",
    category: "Kitchenware",
    price: 450,
    image: "https://i.postimg.cc/T2kXyxZH/IMG-20260504-WA0012.jpg",
    description: "A 12-piece set of durable glass storage bowls ideal for meal prep and leftovers.",
    features: [
      "Heat-resistant borosilicate glass.",
      "Airtight lids for secure storage.",
      "Nestable design saves cabinet space.",
      "Suitable for fridge, freezer, and microwave use."
    ],
    illustrationImage: "https://i.postimg.cc/WbgL2trg/1782023341413-019ee8dc-e039-7225-88c5-1ada018b342d.jpg",
    available: true,
  },
  {
    name: "Trendy Ladies Shoulder Bag | Hand Bag",
    slug: "trendy-ladies-shoulder-bag-hand-bag",
    category: "Bags",
    price: 110,
    image: "https://i.postimg.cc/NfrPgwYY/IMG-20260504-WA0006.jpg",
    description: "A chic shoulder bag designed for modern women with a roomy interior.",
    features: [
      "Lightweight and comfortable shoulder strap.",
      "Fashion-forward design with durable material.",
      "Multiple internal pockets for easy organization.",
      "Great for daily use and travel."
    ],
    illustrationImage: "https://i.postimg.cc/NfrPgwYY/IMG-20260504-WA0006.jpg",
    available: true,
  },
  {
    name: "Silver Crest Blender 4500w 2.5l Large Capacity",
    slug: "silver-crest-blender-4500w-2-5l-large-capacity",
    category: "Kitchen Appliances",
    price: 450,
    image: "https://i.postimg.cc/gr9swndp/blender2.jpg",
    description: "A powerful blender with a large 2.5L jug for smoothies, soups, and sauces.",
    features: [
      "4500W motor for fast blending power.",
      "Large-capacity jar for family-sized servings.",
      "Precision blade system for smooth results.",
      "Easy cleanup and dishwasher-friendly parts."
    ],
    illustrationImage: "https://i.postimg.cc/y6v4x2rY/seedream-5-0-lite-b-I-want-a-similar-ima.jpg",
    available: true,
  },
  {
    name: "Stanley Cup | 40 Oz Tumbler With Handle And Straw",
    slug: "stanley-cup-40oz-tumbler-with-handle-and-straw",
    category: "Drinkware",
    price: 150,
    image: "https://i.postimg.cc/nLVyVw3t/IMG-20260513-WA0043.jpg",
    description: "A rugged 40oz tumbler with handle and straw for cold and hot drinks.",
    features: [
      "Double-wall insulation keeps drinks hot or cold.",
      "Sturdy handle makes it easy to carry.",
      "Leak-resistant lid with reusable straw.",
      "Perfect for travel, gym, and outdoor use."
    ],
    illustrationImage: "https://i.postimg.cc/kgWT6bX2/seedream-5-0-lite-a-I-want-a-similar-ima.jpg",
    available: true,
  },
  {
    name: "Mobile Standing Desk | Adjustable Sit to Stand Table",
    slug: "mobile-standing-desk-adjustable-sit-to-stand-table",
    category: "Office",
    price: 1547,
    image: "https://i.postimg.cc/VLy20NKJ/10-88552e6b-97fa-4f62-91de-791287670045.webp",
    description: "A height-adjustable desk that lets you switch between sitting and standing effortlessly.",
    features: [
      "Smooth adjustment for ergonomic working positions.",
      "Rolling caster wheels for easy mobility.",
      "Sturdy frame supports laptops and monitors.",
      "Ideal for home offices and flexible workspaces."
    ],
    illustrationImage: "https://i.postimg.cc/T37zVRGW/Gemini-Generated-Image-47gao47gao47gao4.jpg",
    available: true,
  },
  {
    name: "Egg Cracker Tool, Egg Shell Opener",
    slug: "egg-cracker-tool-egg-shell-opener",
    category: "Kitchen Tool",
    price: 5,
    image: "https://i.postimg.cc/T30ssJfZ/61Pbpu8r7g-L-AC-SL1500.jpg",
    description: "A handy egg cracker tool that removes shell tops cleanly and quickly.",
    features: [
      "Safe, easy-to-use egg shell opener.",
      "Compact design for kitchen drawers.",
      "Clear shell separation for neat cooking.",
      "Durable material built for repeated use."
    ],
    illustrationImage: "https://i.postimg.cc/cH3R2qgB/seedream-5-0-lite-a-I-want-a-similar-ima-(1).jpg",
    available: true,
  },
  {
    name: "Wall Mounted Kitchen Rack (Multifunctional)",
    slug: "wall-mounted-kitchen-rack-multifunctional",
    category: "Home Organization",
    price: 120,
    image: "https://i.postimg.cc/tCT6BQd2/kichen-rack.jpg",
    description: "A wall-mounted rack that keeps kitchen tools, spices, and cookware organized.",
    features: [
      "Multipurpose storage for utensils and accessories.",
      "Space-saving wall installation.",
      "Durable metal frame with rust-resistant finish.",
      "Ideal for small kitchens and pantry organization."
    ],
    illustrationImage: "https://i.postimg.cc/nMbm3WGt/seedream-5-0-lite-a-I-want-a-similar-ima-(1).jpg",
    available: true,
  },
  {
    name: "Office Swivel Chair for Use",
    slug: "office-swivel-chair-for-use",
    category: "Office",
    price: 800,
    image: "https://i.postimg.cc/MpfD70XW/chair.jpg",
    description: "A comfortable swivel chair built for office use with supportive cushioning.",
    features: [
      "360-degree swivel base for easy movement.",
      "Firm seat cushioning with ergonomic support.",
      "Durable wheels for smooth rolling.",
      "Suitable for desk work and study sessions."
    ],
    available: true,
    illustrationImage: "https://i.postimg.cc/WbgL2trg/1782023341413-019ee8dc-e039-7225-88c5-1ada018b342d.jpg",
    externalUrl: "https://nextlevel-app-hazel.vercel.app/",
  },
  {
    name: "Gaming Ergonomic Chair",
    slug: "gaming-ergonomic-chair",
    category: "Furniture",
    price: 1700,
    image: "https://i.postimg.cc/0j3Sj3YL/b-put-the-chair-in-ano.jpg",
    description: "An ergonomic gaming chair designed for comfort during long play sessions.",
    features: [
      "High-back support with padded headrest.",
      "Adjustable height and tilt settings.",
      "Durable frame and comfortable foam cushions.",
      "Ideal for gamers, streamers, and home workers."
    ],

  variations: [
    {
      id: "red-black",
      name: "Red & Black",
      image: "https://i.postimg.cc/JnZwj2f1/p-image-edit-a-put-the-chair-on-the.jpg",
      available: true,
    },
    {
      id: "blue-black",
      name: "Blue & Black",
      image: "https://i.postimg.cc/xdkV1Cgd/grok-imagine-image-b-m-KE-NEW-IMAGE-I-WA.jpg",
      available: true,
    },
    {
      id: "white-black",
      name: "White & Black",
      image: "https://i.postimg.cc/GhQCM69W/zen-bear-v2-b-m-KE-NEW-IMAGE-I-WA.jpg.",
      available: false,
    },
  ],
    illustrationImage: "https://i.postimg.cc/nzkm7Xr2/b-I-want-the-particula.png",
    available: true,
    faqIntro: {
      question: "Does this chair support long gaming or office sessions?",
      answer: "Yes. The Gaming Ergonomic Chair is built with a high back, padded headrest, adjustable height, tilt support, and comfortable cushioning so you can sit longer with better posture.",
    },
    testimonials: [
      {
        id: 1,
        quote: "I can now work and game for long hours without feeling the usual back pressure. The chair feels solid and comfortable.",
        name: "James",
        role: "Video Editor",
        initials: "J",
        rating: 5,
      },
      {
        id: 2,
        quote: "I bought two gaming chairs for our setup. They look premium, feel sturdy, and the delivery process was straightforward.",
        name: "Marcus",
        role: "Content Creator",
        initials: "M",
        rating: 5,
      },
      {
        id: 3,
        quote: "I use it for remote work during the day and gaming at night. The support is much better than my old office chair.",
        name: "David Ansah",
        role: "Tech Reviewer",
        initials: "D",
        rating: 5,
      },
    ],
    // externalUrl: "/gaming-chairs",
  },
  {
    name: "Handheld Turbo Fan (Foldable)",
    slug: "handheld-turbo-fan-foldable",
    category: "Fans",
    price: 120,
    image: "https://i.postimg.cc/K8YRZnp7/hand-fan.jpg", // Standard placeholder image
    description: "Stay cool on the move with the ultimate high-performance cooling companion. Despite its massive power, it features an ultra-small, foldable body that weighs just 190 grams, allowing you to easily slip it into your pocket or bag. It delivers up to 12 hours of cooling relief on a single charge and plugs into any standard USB port.",
    features: [
      "Ultra-small, foldable body weighing just 190 grams.",
      "Long-lasting battery with up to 12 hours of cooling relief.",
      "Dual power source: Battery and Corded Electric via USB charging.",
      "Includes an anti-lost lanyard for outdoor sports and travel.",
      "Brand new condition from Uniden."
    ],
    variations: [
    {
      id: "turbo-fan",
      name: "Turbo Fan",
      image: "https://i.postimg.cc/dts0B2FV/fami-5-portable-brushless-1719313022-c254d8f3-progressive.jpg",
      available: true,
    },
    {
      id: "pro1-series",
      name: "Pro1 series",
      image: "https://i.postimg.cc/K8YRZnp7/hand-fan.jpg",
      available: true,
    },
    {
      id: "m11-turbo-fan",
      name: "M11 Turbo Fan",
      image: "https://i.postimg.cc/52TTCCzL/grok-imagine-image-quality-(20260519)-b-take-the-box-off-tgh.jpg",
      available: true,
    },
  ],
    illustrationImage: "https://i.postimg.cc/t4k7R9nc/a-I-want-a-similar-ima.jpg",
    available: true,
  },
  
  {
    name: "Portable Handheld Fan (120-Speed)",
    slug: "portable-handheld-fan-120-speed",
    category: "Fans",
    price: 150,
    image: "https://i.postimg.cc/dts0B2FV/fami-5-portable-brushless-1719313022-c254d8f3-progressive.jpg",
    description: "This mini portable fan is perfect for hot, humid days, whether you're hitting up an outdoor party, dancing at a club, or just out and about. Compact enough to slip into almost any handbag, it puts total comfort right at your fingertips.",
    features: [
      "Innovative 120-speed digital display with infinitely variable control.",
      "Powerful 1800mAh rechargeable battery offering up to 6 hours of use.",
      "Dual power source: Battery and Corded Electric.",
      "Compact and lightweight design perfect for handbags.",
      "Brand new condition from Procom in sleek black."
    ],
    illustrationImage: "https://i.postimg.cc/WbgL2trg/1782023341413-019ee8dc-e039-7225-88c5-1ada018b342d.jpg",
    available: true,
  },
  {
    name: "Handheld Fan",
    slug: "handheld-fan",
    category: "Fans",
    price: 70,
    image: "https://i.postimg.cc/52TTCCzL/grok-imagine-image-quality-(20260519)-b-take-the-box-off-tgh.jpg",
    description: "This mini portable fan is perfect for hot, humid days, whether you're hitting up an outdoor party, dancing at a club, or just out and about. Compact enough to slip into almost any handbag, it puts total comfort right at your fingertips.",
    features: [
      "Innovative 120-speed digital display with infinitely variable control.",
      "Powerful 1800mAh rechargeable battery offering up to 6 hours of use.",
      "Dual power source: Battery and Corded Electric.",
      "Compact and lightweight design perfect for handbags.",
      "Brand new condition from Procom in sleek black."
    ],
    illustrationImage: "https://i.postimg.cc/264smSVW/a-I-want-a-similar-ima.jpg",
    available: true,
  },
  {
    name: "12-in-1 Multifunctional Vegetable Chopper",
    slug: "12-in-1-multifunctional-vegetable-chopper",
    category: "Kitchen Utensils", // Or "Home Organization" based on your preference
    price: 119, // Current price (Original price: GH₵ 139)
    image: "https://i.postimg.cc/T1TTkvGB/19afef06-c045-48cf-84b5-e3a34a7049bb.jpg",
    description: "A heavy-duty, multifunctional kitchen tool designed to save time and effort. It easily cuts vegetables, onions, and fruits into different thicknesses and slices, while its large container and built-in colander basket let you wash and filter food directly without making extra dishes dirty.",
    features: [
      "Includes 8 interchangeable stainless steel blades (dicers, slicers, filamentous, mince, and egg separator).",
      "Equipped with a protective handguard tool to prevent accidental injury.",
      "Large integrated container with a built-in water-filtering colander basket.",
      "Durable, heavy-duty build with a stylish black, green, and transparent design.",
      "Perfect for dicing, slicing, grinding garlic or ginger, and separating eggs."
    ],
    illustrationImage: "https://i.postimg.cc/7ZNBT1qr/seedream-5-0-lite-a-I-want-a-similar-ima.jpg",
    available: true,
  },
  {
  name: "Ergonomic Mesh Office Swivel Chair with Neckrest",
  slug: "ergonomic-mesh-office-swivel-chair-neckrest",
  category: "Office Furniture",
  price: 1000, // Price in GH₵
  image: "https://i.postimg.cc/SR7Rrs1F/mesh.jpg", 
  description: "This high-back ergonomic mesh office chair is designed for maximum comfort and posture support during long or short working hours. Perfect for both home and executive office setups, it features a padded seat, breathable mesh fabric, and multiple adjustable mechanics for customized well-being.",
  features: [
    "Ergonomic high-back design featuring an integrated neckrest and headrest.",
    "Pneumatic height-adjustment mechanism for tailored sitting posture.",
    "360-degree swivel with 5 solid legs and smooth-rolling caster wheels.",
    "Breathable black mesh material with a comfortably padded seat and back.",
    "Pre-assembled for convenience—completely ready to use with no setup required."
  ],
    illustrationImage: "https://i.postimg.cc/43q1CLfX/seedream-5-0-lite-a-I-want-a-similar-ima.jpg",
  available: true,
},
{
  name: "Office Swivel Chair with Headrest",
  slug: "office-swivel-chair-with-headrest",
  category: "Office Furniture",
  price: 1350, // Price in GH₵
  image: "https://i.postimg.cc/gktmP8Z1/b-place-the-chair-ther.jpg", 
  description: "Work and relax in comfort with this flexible office swivel chair, designed for everyday support in offices, home studies, shops, or reception areas. It features a cushioned seat and a supportive backrest to keep you comfortable during long sitting hours.",
  features: [
    "Smooth 360-degree swivel rotation for effortless workspace mobility.",
    "Adjustable height settings to ensure proper, healthy posture.",
    "Comfortable, thick padded seat and supportive backrest with headrest.",
    "Built with a strong, highly durable base weighing 20kg for maximum stability.",
    "Versatile design ideal for office, home study, and commercial use."
  ],
  illustrationImage: "https://i.postimg.cc/NjN4DGZ2/seedream-5-0-lite-a-I-want-a-similar-ima-(1).jpg",
  available: true,
},
{
  name: "SADOER Portable Mouthwash (20 Pieces)",
  slug: "sadoer-portable-mouthwash-20-pieces",
  category: "Personal Care",
  price: 25, // Price in GH₵
  image: "https://i.postimg.cc/SNnKNgQp/He9f1bec5745645a691b05e9864ecf80cy.jpg", 
  description: "A convenient and travel-friendly oral care solution featuring a unique, refreshing coffee fragrance. This portable mouthwash helps clean the mouth, eliminate bad breath, and support overall oral hygiene anytime, anywhere.",
  features: [
    "Unique and refreshing coffee flavor/fragrance.",
    "Individually packed into 20 convenient, single-use pieces (10ml each).",
    "Highly portable and travel-friendly design for work, school, or travel.",
    "Effectively helps eliminate bad breath and supports gum care.",
    "Lightweight and easy to carry for on-the-go freshness."
  ],
   variations: [
    {
      id: "watermelon-fragrance",
      name: "Watermelon Fragrance",
      image: "https://i.postimg.cc/MGv5s2qd/86d8cb01-58cc-44ed-b37d-90512817e891-34d35318ad1bb46ef3db4bc461a6b080.jpg",
      available: true,
    },
    {
      id: "peach-fragrance",
      name: "Peach Fragrance",
      image: "https://i.postimg.cc/sfcWZHRJ/1.jpg",
      available: true,
    },
    {
      id: "mango-fragrance",
      name: "Mango Fragrance",
      image: "https://i.postimg.cc/0yN0QRMp/D-NQ-NP-885785-CBT109544486356-042026-O.jpg",
      available: true,
    },
        {
      id: "grape-fragrance",
      name: "Grape Fragrance",
      image: "https://i.postimg.cc/G2vkNbNW/SADOER-Wholesale-Probiotic-Fruit-Flavors-Liquid-Mouth-Wash-Whitening-Teeth-Oral-Care-Product-Travel.jpg",
      available: true,
    },
        {
      id: "coconut-fragrance",
      name: "Coconut Fragrance",
      image: "https://i.postimg.cc/GpyY8cbW/1-(1).jpg",
      available: true,
    },
        {
      id: "mint-fragrance",
      name: "Mint Fragrance",
      image: "https://i.postimg.cc/3rpS5TmR/s-l1600.jpg",
      available: true,
    },
  ],
  available: true,
},
{
  name: "Microfiber Extendable Ceiling Fan Duster",
  slug: "microfiber-extendable-ceiling-fan-duster",
  category: "Home Cleaning Utilities",
  price: 120, // Price in GH₵
  image: "https://i.postimg.cc/GmrDVPKy/d37409d9-df31-41a1-a0ed-18d97ac6500b-10296da8c4956268d2740631e2802ed1.jpg", 
      carouselImages: [
      "https://i.postimg.cc/BvSvcMgh/Ceiling-Fan-Duster-Dusters-Cleaning-wet-jet-Microfiber-mop-Duster-Extension-Pole-Duster-Cleaning-Cei.jpg",
      "https://i.postimg.cc/GmrDVPKy/d37409d9-df31-41a1-a0ed-18d97ac6500b-10296da8c4956268d2740631e2802ed1.jpg",
    ],
  description: "Keep your home spotless from top to bottom with this lightweight microfiber extendable duster. Specially engineered for high ceilings and tricky ceiling fan blades, its premium head utilizes a powerful static charge to trap and lock in dust rather than just pushing it around.",
  features: [
    "Extendable handle adjusts seamlessly from a compact 30cm up to 140cm (55 inches).",
    "Premium microfiber head traps and locks dust effectively using a static charge.",
    "Ultra-lightweight 0.68 lb design allows for effortless, fatigue-free cleaning.",
    "Collapsible, shortens easily for compact, space-saving storage when not in use.",
    "Package includes one single-piece fan duster ready for immediate use."
  ],
  available: true,
},
{
  name: "Unisex White Low-Top Sneakers (F805)",
  slug: "unisex-white-low-top-sneakers-f805",
  category: "Footwear",
  price: 280, // Price in GH₵
  image:     'https://i.postimg.cc/J751GXZ8/mai-image-2-5-(image-edit)-b-use-a-blue-box-intea.png', 
  carouselImages: [
    'https://i.postimg.cc/J751GXZ8/mai-image-2-5-(image-edit)-b-use-a-blue-box-intea.png', 
    'https://i.postimg.cc/nrcNsXfx/f4d8f69f-a193-4784-9a9e-dc7c0589c0d6.jpg'
  ],
  description: "A stylish and versatile pair of Korean-style low-top board shoes, perfect for daily wear across all seasons. Crafted with a breathable artificial PU upper, durable rubber sole, and comfortable EVA insole, these neutral sneakers offer a classic front lace-up design suitable for both men and women.",
  features: [
    "Premium artificial PU leather upper with breathable, wear-resistant fabric lining.",
    "Durable injection-moulded rubber sole with a comfortable low flat heel (1-3cm).",
    "Classic round-toe, low-top board shoe design with clean stitching and front lace-up closure.",
    "Comes with a soft, cushioned EVA insole for reliable all-day support.",
    "Unisex design available in versatile color variations (White Black, White, All Black)."
  ],
  illustrationImage: "https://i.postimg.cc/QCFG4F4F/seedream-5-0-lite-a-I-want-a-similar-ill.jpg",
  available: true,
}
];

export const otherProducts = products.map((product) => ({
  ...sharedProductDetails,
  ...product,
  faqIntro: product.faqIntro ?? sharedProductDetails.faqIntro,
  testimonials: product.testimonials ?? sharedProductDetails.testimonials,
}));
