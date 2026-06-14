import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Grid, Box } from "@mui/material";
import "swiper/css";
import heroData from "../../data/heroData";
import CarouselSlide from "../common09/CarouselSlide";
import { getPublicSiteSettings } from "../../api/api";

const HERO_KEYS = [
  { desktop: "hero_slide_1_image_desktop", mobile: "hero_slide_1_image_mobile" },
  { desktop: "hero_slide_2_image_desktop", mobile: "hero_slide_2_image_mobile" },
  { desktop: "hero_slide_3_image_desktop", mobile: "hero_slide_3_image_mobile" },
];

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [adminImages, setAdminImages] = useState({});

  useEffect(() => {
    getPublicSiteSettings()
      .then((res) => {
        if (res.data?.success) {
          setAdminImages(res.data.settings || {});
        }
      })
      .catch(() => {
        // Silently ignore — fall back to static images
      });
  }, []);

  return (
    <Swiper
      modules={[Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      loop={true}
      autoplay={{ delay: 5000 }}
      onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
    >
      {heroData.map((slide, index) => {
        const keys = HERO_KEYS[index];
        const imgDesktop = (keys && adminImages[keys.desktop]) || slide.img;
        const imgMobile  = (keys && adminImages[keys.mobile])  || slide.imgMobile;

        return (
          <SwiperSlide key={slide.id}>
            <Box
              component="section"
              sx={{
                height: { xs: "auto", md: "100vh" },
                overflow: "hidden",
                p: { xs: 0, sm: 0 },
              }}
            >
              <Grid
                container
                spacing={2}
                sx={{
                  height: "100%",
                }}
              >
                <CarouselSlide
                  subtitle={slide.subtitle}
                  subtitleImg={slide.subtitleImg}
                  subtitleImgUrl={slide.subtitleImgUrl}
                  title={slide.title}
                  description={slide.description}
                  btn={slide.btn}
                  href={slide.href}
                  img={imgDesktop}
                  imgMobile={imgMobile}
                  align={slide.align}
                  colorText={slide.colorText}
                  isActive={activeIndex === index}
                  titleWidthxs={slide.titleWidthxs}
                  titleWidthsm={slide.titleWidthsm}
                  titleWidthmd={slide.titleWidthmd}
                  descriptionWidthxs={slide.descriptionWidthxs}
                  descriptionWidthsm={slide.descriptionWidthsm}
                  descriptionWidthmd={slide.descriptionWidthmd}
                />
              </Grid>
            </Box>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default HeroCarousel;
