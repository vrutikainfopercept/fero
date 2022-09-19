function imageChange(e) {
  let updateImg = document.getElementById("updateImg")
  updateImg.src = e.target.src
}

$(document).ready(function () {
  $(".customer-logos").slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    //autoplaySpeed: 1,
    arrows: false,
    dots: false,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });
});