export interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    clientName: 'Happy Client',
    clientRole: 'Lifestyle Session',
    content: 'The photos are absolutely stunning! Perfect captures of our special moments.',
    videoUrl: 'https://res.cloudinary.com/dq4tkpuu4/video/upload/v1773351713/IMG_4097_wpvm2t.mov',
    imageUrl: 'https://via.placeholder.com/100x100',
  },
  {
    id: '2',
    clientName: 'Professional',
    clientRole: 'Studio Session',
    content: 'Amazing headshots! The quality and professionalism exceeded expectations.',
    videoUrl: 'https://res.cloudinary.com/dq4tkpuu4/video/upload/v1773351707/IMG_1792_vankcs.mov',
    imageUrl: 'https://via.placeholder.com/100x100',
  },
  {
    id: '3',
    clientName: 'Creative Director',
    clientRole: 'Brand Shoot',
    content: 'Fantastic work! The photographer really understood our vision and delivered brilliantly.',
    videoUrl: 'https://res.cloudinary.com/dq4tkpuu4/video/upload/v1773351706/FAC3213C-DDD1-465F-A2D3-713549EC094E_n5hscs.mov',
    imageUrl: 'https://via.placeholder.com/100x100',
  },
];
