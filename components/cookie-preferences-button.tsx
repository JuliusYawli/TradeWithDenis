"use client";

import { consentStorageKey } from "./cookie-consent";

export function CookiePreferencesButton() {
  return <button className="text-left hover:text-white" type="button" onClick={() => {
    localStorage.removeItem(consentStorageKey);
    window.location.reload();
  }}>Cookie preferences</button>;
}
