import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { ServicesSection } from '@/components/services-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { ContactForm } from '@/components/contact-form';
import { Footer } from '@/components/footer';
import { ClearUploadAuth } from '@/components/clear-upload-auth';

export const metadata = {
  title: 'KCAPTURED STUDIOS',
  description: 'Affordable lifestyle, studio, and portrait photography in Jessup, Maryland and the DMV. Book KCAPTURED for creative shoots, portraits, etc..',
  keywords: [
    'KCAPTURED',
    'DMV photography',
    'Jessup Maryland photographer',
    'portrait photography',
    'studio portraits',
    'affordable photography',
    'Best photography',
    'free pictures',
    'lifestyle photography',
    'Award Winning Photographer',
  'KCAPTURED STUDIOS',
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <ClearUploadAuth />
      <Header />
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <ContactForm />
      <Footer />
    </div>
  );
}
