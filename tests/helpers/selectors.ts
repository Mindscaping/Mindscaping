export const NAV = {
  home: { link: /mindscaping|home/i, url: "/" },
  book: { link: /book/i, url: "/book" },
  messages: { link: /messages/i, url: "/messages" },
  dashboard: { link: /dashboard/i, url: "/dashboard" },
  signIn: { link: /sign in|login/i, url: "/login" },
  register: { link: /register/i, url: "/register" },
  signOut: { link: /sign out|logout/i },
};

export const BOOKING_FORM = {
  name: "Full Name *",
  email: "Email *",
  phone: "Phone Number *",
  sessionType: "Session Type *",
  date: "Preferred Date *",
  time: "Preferred Time *",
  therapist: "Therapist Preference",
  notes: "Additional Notes",
  submit: "Request Booking",
};
