import React from 'react';
import mobileLogo from './kino-logo.png';

export default function KinoLogo({ className }) {
  return (
    <picture>
      <source media="(min-width: 769px)" srcSet="/img/logodesktop_preview_rev_1.png" />
      <img className={className} src={mobileLogo} alt="Kino olami" />
    </picture>
  );
}
