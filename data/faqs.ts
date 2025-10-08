// data/faqs.ts
export interface FaqEntry {
  title: string;
  url: string;
  text: string; // short, factual snippet
}

const FAQS: FaqEntry[] = [
  {
    title: "Refunds & Cancellations",
    url: "https://YOUR_SITE/policies",
    text:
      "Refund policy: Up to two weeks before class there is a 6% cancellation fee. " +
      "Up to one week before class there is a 20% cancellation fee. " +
      "After classes begin there are no refunds."
  },
  {
    title: "Schedules & Dates",
    url: "https://YOUR_SITE/schedule",
    text:
      "We align camps with local district breaks including Spring Break, Presidents Week, and Thanksgiving. " +
      "See the schedule page for district dates and enrollment links."
  },
  {
    title: "Devices & Laptops",
    url: "https://YOUR_SITE/faq",
    text:
      "Students need a charged laptop (Windows, Mac, or Chromebook) with a modern web browser. " +
      "Students should know their login. Limited loaners may be available on request."
  }
];

export default FAQS;