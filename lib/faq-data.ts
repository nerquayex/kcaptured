export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'How do I book a photography session?',
    answer: 'To book a session, simply message us on Instagram @kcaptures._ with your preferred date and session type. A $20 deposit is required to hold your date, with the final amount due on the day of your session. We accept cash, Cash App ($Kenstevens2), and Zelle (kenny.stevens13@hotmail.com).',
    category: 'Booking',
  },
  {
    id: '2',
    question: 'What is your cancellation policy?',
    answer: 'If you are unable to attend your session, deposits are non-refundable. Cancellations within 24 hours of the shoot are non-refundable and count as payment for missed time.',
    category: 'Policies',
  },
  {
    id: '3',
    question: 'What if I\'m late to my session?',
    answer: 'We charge a late fee based on how late you arrive: 10-30 minutes late is a $20 upcharge, and 30+ minutes late is a $45 upcharge.',
    category: 'Policies',
  },
  {
    id: '4',
    question: 'How long does it take to receive my photos?',
    answer: 'Final edited photos are delivered within 3-5 business days. Within 48 hours after your shoot, we\'ll hold a Zoom or FaceTime call to review your album and select photos for retouching.',
    category: 'Timeline',
  },
  {
    id: '5',
    question: 'What add-ons are available?',
    answer: 'We offer express fees ($30 for expedited turnaround), lifestyle add-ons ($15), and studio add-ons ($20) to customize your session.',
    category: 'Pricing',
  },
  {
    id: '6',
    question: 'What should I wear to my session?',
    answer: 'Wear what makes you feel confident! We recommend coordinating outfits (solid colors, complementary tones) and avoiding busy patterns. Bring 2-3 outfit changes for variety.',
    category: 'Preparation',
  },
  {
    id: '7',
    question: 'Can you do outdoor sessions?',
    answer: 'Absolutely! We specialize in both studio and outdoor lifestyle sessions. We\'re based in Maryland and serve the DMV area.',
    category: 'Sessions',
  },
  {
    id: '8',
    question: 'Do you offer group or family sessions?',
    answer: 'Yes! Group sessions work great for families, friends, and corporate teams. Message us on Instagram to discuss pricing and availability.',
    category: 'Sessions',
  },
];
