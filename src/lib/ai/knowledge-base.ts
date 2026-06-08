export interface KnowledgeDocument {
  id: string;
  collection: string;
  title: string;
  content: string;
  source: string;
}

export const knowledgeDocuments: KnowledgeDocument[] = [
  {
    id: "beauty-tips-1",
    collection: "Beauty Tips",
    title: "Daily Skin Care Routine",
    content:
      "For glowing skin, cleanse twice daily, exfoliate gently once or twice a week, and moisturize with natural ingredients. Use sunscreen during the day and hydrate from within by drinking water.",
    source: "Beauty Tips",
  },
  {
    id: "beauty-tips-2",
    collection: "Beauty Tips",
    title: "Healthy Hair Care Habits",
    content:
      "Massage the scalp with warm oil regularly, avoid harsh chemical shampoos, and rinse with cool water to lock in shine. Trim split ends and use a nourishing mask for damaged hair.",
    source: "Beauty Tips",
  },
  {
    id: "product-information-1",
    collection: "Product Information",
    title: "How to Choose Skin Care Products",
    content:
      "Pick products for your skin type and concern: hydrating creams for dry skin, oil-control formulas for oily skin, and gentle, fragrance-free options for sensitive skin. Natural ingredients like aloe vera and turmeric support healthy skin.",
    source: "Product Information",
  },
  {
    id: "product-information-2",
    collection: "Product Information",
    title: "How to Choose Hair Care Products",
    content:
      "Choose products based on your hair goals: anti-dandruff shampoos for flakes, strengthening oils for hair fall, and nourishing serums for frizz control. Herbal ingredients help restore natural shine.",
    source: "Product Information",
  },
  {
    id: "ingredients-information-1",
    collection: "Ingredients Information",
    title: "Benefits of Natural Oils",
    content:
      "Coconut oil, almond oil, and olive oil deeply moisturize the skin and hair. They help preserve the skin barrier, reduce dryness, and support hair strength without harmful chemicals.",
    source: "Ingredients Information",
  },
  {
    id: "ingredients-information-2",
    collection: "Ingredients Information",
    title: "Benefits of Turmeric and Neem",
    content:
      "Turmeric has natural antioxidants and can help even skin tone. Neem supports skin clarity and helps soothe irritated skin. Both are common in handmade organic soaps.",
    source: "Ingredients Information",
  },
  {
    id: "faqs-1",
    collection: "FAQs",
    title: "Order Processing Time",
    content:
      "Orders are usually processed within 24 hours. Delivery takes 5–7 business days depending on your location. You can track orders in the My Orders page after login.",
    source: "FAQs",
  },
  {
    id: "faqs-2",
    collection: "FAQs",
    title: "How to Contact the Owner",
    content:
      "For product suggestions, availability, or custom orders, customers can contact the business owner directly through WhatsApp at +91 96293 54868.",
    source: "FAQs",
  },
  {
    id: "shipping-information-1",
    collection: "Shipping Information",
    title: "Shipping Timeline",
    content:
      "Shipping usually takes 5–7 business days after order confirmation. We ship from Rima Cosmetics with carefully packaged herbal and organic products.",
    source: "Shipping Information",
  },
  {
    id: "return-policy-1",
    collection: "Return Policy",
    title: "Return and Exchange Policy",
    content:
      "We accept returns and exchanges for damaged or incorrect products within 3 days of delivery. Contact the owner on WhatsApp before returning items.",
    source: "Return Policy",
  },
  {
    id: "business-information-1",
    collection: "Business Information",
    title: "About Rima Cosmetics",
    content:
      "Rima Cosmetics creates handcrafted natural beauty products using organic ingredients. The brand focuses on skincare, hair care, lip care, baby care, and handmade soaps.",
    source: "Business Information",
  },
  {
    id: "owner-information-1",
    collection: "Owner Information",
    title: "Owner Credentials",
    content:
      "M.K. Mounica is certified by NIFDTB Academy in Skincare Formulation and the business is ISO 9001:2015 certified. The owner believes in safe, natural, handmade cosmetics.",
    source: "Owner Information",
  },
];

export const knowledgeCollections = Array.from(
  new Set(knowledgeDocuments.map((doc) => doc.collection))
);