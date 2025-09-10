import { assets } from "../assets/assets";

const slides = [
  {
    img: assets.t2,
    title: "Best Collection of Fresh Fruits",
    subtitle: "Shop Now",
    bgColor: "bg-emerald-600",
  },
  {
    img: assets.t3,
    title: "Delicious Mangoes",
    subtitle: "Taste the Sweetness",
    bgColor: "bg-emerald-600",
  },
  {
    img: assets.t4,
    title: "Refreshing Watermelons",
    subtitle: "Perfect for Hot Summer Days",
    bgColor: "bg-emerald-600",
  },
];

const Carousel = () => {
  return (
    <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
      
      {/* Indicator buttons */}
      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to={index}
            className={index === 0 ? "active" : ""}
            aria-current={index === 0 ? "true" : undefined}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slides */}
      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
            <div className="d-flex align-items-center w-100 h-[350px]">
              <div className="w-1/2 h-full">
                <img
                  src={slide.img}
                  className="w-full h-full object-cover"
                  alt={`Slide ${index + 1}`}
                />
              </div>
              <div className={`w-1/2 h-full flex flex-col justify-center px-5 text-left ${slide.bgColor} bg-opacity-70`}>
                <h2 className="text-3xl font-extrabold text-white mb-2">{slide.title}</h2>
                <p className="text-lg font-medium text-white">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default Carousel;
