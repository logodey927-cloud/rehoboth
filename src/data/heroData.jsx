// src/data/heroData.jsx
import slideImag2 from "../assets/images/Slider-02-scaled.png";
import slideImag5 from "../assets/images/Slider-05-scaled.png";
import logoImg from "../assets/images/logo.webp";

// Reuse desktop slides for mobile (dedicated mobile assets not in repo)
const slideImag2Mobile = slideImag2;
const slideImag4 = slideImag5;
const slideImag4Mobile = slideImag5;
const slideImag5Mobile = slideImag5;

const heroData = [
  {
    id: 1,
    subtitle: "Welcome to Rehoboth Spa",
    title: "Relax, Rejuvenate, Renew",
    description:
      "Experience the ultimate wellness and beauty treatments with our expert therapists.",
    btn: "Book Now",
    href: "/book-appointment",
    img: slideImag2,
    imgMobile: slideImag2Mobile,
    align: "left",
    colorText: "#000000",
    titleWidthxs: "80%",
    titleWidthsm: "90%",
    titleWidthmd: "100%",
    descriptionWidthxs: "60%",
    descriptionWidthsm: "70%",
    descriptionWidthmd: "50%",
  },
  {
    id: 2,
    subtitle: "Feel Refreshed",
    title: "Luxury Spa Experience",
    description:
      "Indulge in our luxurious treatments and let stress melt away.",
    btn: "Explore Services",
    href: "/services",
    img: slideImag4,
    imgMobile: slideImag4Mobile,
    align: "left",
    colorText: "#000000 ",
    titleWidthxs: "80%",
    titleWidthsm: "90%",
    titleWidthmd: "100%",
    descriptionWidthxs: "60%",
    descriptionWidthsm: "70%",
    descriptionWidthmd: "50%",
  },
  {
    id: 3,
    // subtitle: "Feel Refreshed",
    subtitleImg: true,
    subtitleImgUrl: logoImg,
    title: "Rehoboth health and Wellness Clinic",
    description:
      "RELAX, REVIVE, RECONNECT",
    btn: "Book Appointment",
    href: "/book-appointment",
    img: slideImag5,
    imgMobile: slideImag5Mobile,
    align: "center",
    colorText: "#000000",
    titleWidthxs: "100%",
    titleWidthsm: "100%",
    titleWidthmd: "100%",
    descriptionWidthxs: "100%",
    descriptionWidthsm: "100%",
    descriptionWidthmd: "100%",
  },
];

export default heroData;
