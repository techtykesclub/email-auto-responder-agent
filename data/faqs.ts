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
  },
  {
    title: "Programs",
    url: "https://YOUR_SITE/faq",
    text:
      "Beginner Scratch Coding" +
      "This course introduces the basics of Scratch, a block-based coding language that makes learning fun and interactive. Kids will learn foundational concepts such as sequences, loops, and events while creating their own animations, games, and stories." +
      "Intermediate Scratch Coding" +
      "This course builds on the fundamentals of Scratch, introducing more complex programming concepts such as variables, conditionals, and functions. Students will create more advanced projects and gain a deeper understanding of computational thinking." +
      "Introduction to AI with Scratch" +
      "This course introduces students to the basics of artificial intelligence using Scratch. Kids will learn about machine learning, neural networks, and AI applications while creating their own AI-powered projects." +
      "Precoding: Screen-free Puzzles and Games" +
      "This course offers a variety of screen-free activities that promote problem-solving and critical thinking skills. Kids will engage in hands-on projects and collaborative challenges that encourage creativity and teamwork." 
}
];

export default FAQS;