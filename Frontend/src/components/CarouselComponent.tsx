import React from 'react';
import { Carousel } from 'antd';

interface ArteDestacado {
  id: number;
  title: string;
  image: string;
  category: string;
}

interface CarouselComponentProps {
  items: ArteDestacado[];
}

const CarouselComponent: React.FC<CarouselComponentProps> = ({ items }) => {
  return (
    <section className="bienestar-featured-section">
      <Carousel autoplay>
        {items.map((item) => (
          <div key={item.id} className="bienestar-featured-card">
            <img
              src={item.image}
              alt={item.title}
              className="bienestar-featured-image"
            />
            <div className="bienestar-featured-overlay" />
            <div className="bienestar-featured-content">
              <span className="bienestar-featured-category">{item.category}</span>
              <h2 className="bienestar-featured-title">{item.title}</h2>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default CarouselComponent;