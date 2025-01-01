import React from 'react';

export default function StoreBadges() {
  return (
    <div className="flex space-x-4">
      {/* App Store Badge */}
      <a
        href="#"
        className="h-10"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
          alt="Download on the App Store"
          className="h-full"
        />
      </a>

      {/* Google Play Badge */}
      <a
        href="#"
        className="h-10"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
          alt="Get it on Google Play"
          className="h-full"
        />
      </a>
    </div>
  );
}
