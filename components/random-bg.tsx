"use client";

import React, { useEffect, useState } from 'react';

interface Props {
  images: string[];
  className?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export function RandomBg({ images, className = '', overlayOpacity = 0.6, children }: Props) {
  const [bg, setBg] = useState<string>(images?.[0] ?? '');

  useEffect(() => {
    if (!images || images.length === 0) return;
    const idx = Math.floor(Math.random() * images.length);
    setBg(images[idx]);
  }, [images]);

  return (
    <section
      className={`${className} relative bg-cover bg-center bg-fixed`}
      style={{ backgroundImage: bg ? `url(${bg})` : undefined }}
    >
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayOpacity})` }} />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export default RandomBg;
