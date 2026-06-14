// src/data/treatmentData.js
// import img01 from "../assets/images/img-008.webp";

const treatments = [
  {
    id: 1,
    title: "Facial Treatments",
    desc: "Our Facial Treatments are expertly designed to rejuvenate, renew, and restore your skin’s natural glow. Each facial begins with a professional double-cleanse and in-depth skin analysis to assess your skin type and specific needs. We combine advanced techniques with premium skincare formulas to target dullness, congestion, dryness, or signs of aging. Whether you choose a classic facial for relaxation or a high-frequency or microdermabrasion session for visible results, every treatment helps stimulate circulation, detoxify the pores, and enhance overall skin texture. You’ll leave feeling refreshed, hydrated, and confident with luminous, youthful skin.",
    image:
      "https://i.pinimg.com/474x/19/54/c7/1954c7ec0320d36cd7748985619ee011.jpg",
    benefits: [
      {
        heading: "Deep Cleansing & Exfoliation",
        des: "Each session begins with a deep cleansing process that removes impurities, makeup residue, and excess oil, followed by gentle exfoliation to eliminate dead skin cells. This prepares the skin for active ingredient absorption and reveals a smoother, more radiant complexion.",
      },
      {
        heading: "Hydration Boosts for Glow",
        des: "Our hydrating masks and serums are infused with nourishing botanical extracts and essential vitamins that help to lock in moisture. These hydration therapies leave the skin feeling soft, plump, and revitalized with a youthful glow.",
      },
      {
        heading: "Galvanic & High Frequency Options",
        des: "For clients seeking advanced care, galvanic and high-frequency treatments use safe electrical currents to penetrate nutrients deeper into the skin. These techniques improve blood circulation, enhance product absorption, and reduce acne-causing bacteria.",
      },
      {
        heading: "Paraffin and Peel Therapies",
        des: "Our paraffin facials deliver deep warmth that opens pores and softens skin, while chemical peels gently resurface the top layer to minimize fine lines, pigmentation, and blemishes. These result in visibly brighter and smoother skin.",
      },
      {
        heading: "Microdermabrasion & Light Therapy",
        des: "Microdermabrasion polishes away dull surface cells, stimulating collagen renewal, while light therapy uses LED technology to promote healing, even tone, and balance oil production. Ideal for all skin types seeking a radiant finish.",
      },
    ],
    items: [
      {
        name: "Classic facials",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      { name: "Galvanic facials", durations: [{ minutes: 60, price: 80 }] },
      { name: "Paraffin facials", durations: [{ minutes: 60, price: 80 }] },
      {
        name: "Chemical peel facials",
        durations: [{ minutes: 60, price: 80 }],
      },
      {
        name: "High frequency facials",
        durations: [{ minutes: 60, price: 80 }],
      },
      {
        name: "Aromatherapy facials",
        durations: [
          { minutes: 60, price: 80 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Microdermabrasion facials",
        durations: [{ minutes: 60, price: 80 }],
      },
      {
        name: "Light Therapy facials",
        durations: [{ minutes: 60, price: 80 }],
      },
    ],
    price: { min: 40, max: 80 },
  },
  {
    id: 2,
    title: "Holistic Spa Treatments",
    desc: "Immerse yourself in our Holistic Spa Treatments, where traditional wellness practices meet modern relaxation techniques. Each session is designed to promote harmony between body, mind, and spirit. Our therapies relieve deep-seated stress, improve circulation, and enhance your body’s natural energy flow. Experience a gentle detox through therapeutic methods like ear candling, dry brushing, and soothing paraffin wraps. These treatments not only restore balance but also nurture emotional calm, leaving you feeling grounded and renewed.",
    image:
      "https://i.pinimg.com/474x/8e/1e/0c/8e1e0cc1bc8fa12d20e7669f7ee84a5e.jpg",
    benefits: [
      {
        heading: "Heat Therapy for Deep Comfort",
        des: "Gentle heat is applied through warm towels and paraffin wax, melting away muscle stiffness and stimulating blood flow. This technique enhances relaxation and promotes the release of stored tension throughout the body.",
      },
      {
        heading: "Traditional Ear Candling",
        des: "Hopi ear candling is a soothing ritual that helps remove impurities and relieve sinus pressure. The gentle heat and rhythmic movement of the flame create a calming effect on the mind and promote better sleep and clarity.",
      },
      {
        heading: "Detoxifying Dry Brushing",
        des: "Dry brushing uses natural bristles to stimulate the lymphatic system, helping eliminate toxins and improve skin tone. It promotes smoother, firmer skin and leaves you feeling energized and refreshed.",
      },
      {
        heading: "Nourishing Paraffin for Hands & Feet",
        des: "Warm paraffin wax deeply hydrates dry, cracked skin on the hands and feet. The treatment locks in moisture, boosts circulation, and provides instant softness, making it ideal for anyone suffering from fatigue or dryness.",
      },
    ],
    items: [
      {
        name: "Paraffin full back treatment",
        durations: [{ minutes: 60, price: 70 }],
      },
      { name: "Hopi Ear candling", durations: [{ minutes: 60, price: 70 }] },
      {
        name: "Dry back brushing and back scrub",
        durations: [{ minutes: 60, price: 70 }],
      },
      {
        name: "Hands and feet paraffin treatments",
        durations: [{ minutes: 60, price: 70 }],
      },
    ],
    price: { min: 70, max: 70 },
  },
  {
    id: 3,
    title: "Waxing Treatments",
    desc: "Our Waxing Treatments offer smooth, silky skin using premium-quality wax that’s gentle on all skin types. From full-body to targeted areas, each session is performed with precision and care to minimize discomfort and irritation. Our therapists follow the highest hygiene standards, finishing each treatment with soothing aftercare to reduce redness and hydrate the skin. Enjoy long-lasting results that leave your skin feeling clean, refreshed, and beautifully soft.",
    image:
      "https://i.pinimg.com/736x/26/e4/d2/26e4d2cf52534582c6fe7734cbb28b66.jpg",
    benefits: [
      {
        heading: "Full Body & Targeted Areas",
        des: "Whether you need a complete full-body wax or a quick touch-up, our specialists use advanced techniques for precision and comfort. Areas include arms, legs, underarms, bikini, and face.",
      },
      {
        heading: "Quick, Refined Finish",
        des: "Our waxing process is efficient and detail-oriented, removing even fine hair for an even finish. We ensure minimal pain and maximum smoothness in every session.",
      },
      {
        heading: "Comfort-Focused Technique",
        des: "We use warm wax that adheres only to the hair—not the skin—to reduce irritation. The process is followed by a calming lotion enriched with aloe and chamomile to soothe and nourish the skin.",
      },
    ],
    items: [
      { name: "Full body waxing", durations: [{ minutes: 90, price: 100 }] },
      { name: "Full legs", durations: [{ minutes: 90, price: 70 }] },
      { name: "Full arms", durations: [{ minutes: 60, price: 40 }] },
      {
        name: "Underarm and facial waxing",
        durations: [{ minutes: 30, price: 40 }],
      },
    ],
    price: { min: 40, max: 100 },
  },
  {
    id: 4,
    title: "Massages",
    desc: "Our Massage Therapies are designed to restore harmony to your body and mind through expert touch and soothing techniques. Each session is fully personalized to address your needs—whether you’re relieving muscle tension, improving flexibility, or seeking deep relaxation. Using high-quality oils and traditional methods, our therapists combine rhythm, pressure, and flow to encourage circulation and promote natural healing. You’ll experience renewed energy, reduced stress, and a profound sense of well-being after every treatment.",
    image:
      "https://i.pinimg.com/736x/82/53/e7/8253e77a82965d8ffb1f53ea67e6f6c5.jpg",
    benefits: [
      {
        heading: "Stress Relief & Better Sleep",
        des: "Massage therapy activates the body’s relaxation response, lowering cortisol levels and promoting the release of serotonin. This helps calm the nervous system and improves the quality of your sleep.",
      },
      {
        heading: "Reduced Muscle Tension",
        des: "Gentle to deep pressure helps relax tight muscles, relieve knots, and ease chronic pain. It enhances mobility, flexibility, and muscle recovery for both active and sedentary lifestyles.",
      },
      {
        heading: "Improved Circulation",
        des: "Long, flowing strokes encourage healthy blood flow, carrying oxygen and nutrients to tissues and removing toxins. The result is a revitalized feeling throughout the body.",
      },
      {
        heading: "Enhanced Flexibility & Mobility",
        des: "Regular massages keep joints supple, improve range of motion, and prevent stiffness—especially beneficial for athletes or those with desk-bound jobs.",
      },
      {
        heading: "Mental Calm & Clarity",
        des: "By releasing built-up tension, massages quiet the mind and bring emotional balance. The soothing atmosphere allows for mental clarity and a peaceful sense of grounding.",
      },
    ],
    items: [
      {
        name: "Swedish massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Deep Tissue massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Aromatherapy massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Hot stone massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Indian head massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Thai massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Thai foot massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Therapeutic massage/Lymphatic",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Bamboo massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Columbia wood therapy massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
      {
        name: "Back Neck and Shoulders massage",
        durations: [
          { minutes: 60, price: 70 },
          { minutes: 30, price: 40 },
        ],
      },
    ],
    price: { min: 40, max: 70 },
  },
  {
    id: 5,
    title: "Manicure & Pedicure",
    desc: "Indulge your hands and feet in a pampering ritual that revitalizes, nourishes, and beautifies. Our Manicure & Pedicure treatments go beyond simple grooming—they are rejuvenating experiences designed to restore softness and elegance. Each session includes exfoliation, nail shaping, cuticle care, hydration, and soothing massage. Choose from classic or gel finishes for long-lasting shine and perfection. You’ll leave with refreshed, healthy skin and perfectly polished nails that elevate your confidence.",
    image:
      "https://i.pinimg.com/736x/8e/1e/0c/8e1e0cc1bc8fa12d20e7669f7ee84a5e.jpg",
    benefits: [
      {
        heading: "Cuticle Care & Shaping",
        des: "Our specialists gently trim and shape your nails to perfection, maintaining nail health while ensuring a polished appearance. Cuticles are softened and tidied for a neat, professional finish.",
      },
      {
        heading: "Hydration & Massage",
        des: "A nourishing blend of oils and creams is used to hydrate and soften the skin, followed by a gentle massage to relieve tension in the hands and feet. This enhances circulation and leaves your skin silky smooth.",
      },
      {
        heading: "Classic or Gel Finish",
        des: "Choose between our traditional polish for a timeless look or a durable gel finish for longer wear. Both options come in a variety of shades and provide a flawless, glossy result.",
      },
    ],
    items: [
      { name: "Manicure", durations: [{ minutes: 60, price: 70 }] },
      { name: "Pedicure", durations: [{ minutes: 60, price: 70 }] },
      { name: "Gel Nails hands only", durations: [{ minutes: 60, price: 70 }] },
      { name: "Gel Nails toes only", durations: [{ minutes: 60, price: 70 }] },
    ],
    price: { min: 70, max: 70 },
  },
];
export default treatments;
