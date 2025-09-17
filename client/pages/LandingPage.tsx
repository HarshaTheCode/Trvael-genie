import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './LandingPage.css';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <span role="img" aria-label="Map" style={{ fontSize: 24 }}>🗺️</span>,
      title: 'Smart Route Planning',
      description: 'Minimize travel time with AI-optimized routes across your entire trip.',
      linkText: 'Learn more'
    },
    {
      icon: <span role="img" aria-label="Settings" style={{ fontSize: 24 }}>⚙️</span>,
      title: 'Personalized Picks',
      description: 'Tailored recommendations based on interests, budget, and pace.',
      linkText: 'Learn more'
    },
    {
      icon: <span role="img" aria-label="Calendar" style={{ fontSize: 24 }}>📅</span>,
      title: 'Day-by-Day Itineraries',
      description: 'Clear schedules, opening hours, and buffer times built-in.',
      linkText: 'Learn more'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Tell us your plan',
      description: 'Where you\'re going, dates, interests, and budget.'
    },
    {
      number: '2',
      title: 'Get your itinerary',
      description: 'AI builds a smart route with activities and timing.'
    },
    {
      number: '3',
      title: 'Tweak and book',
      description: 'Adjust details and export or share with friends.'
    }
  ];

  const testimonials = [
    {
      name: 'Alicia Gomez',
      role: 'Solo Traveler',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      text: 'I saved hours planning my Japan trip. The route suggestions were spot-on and made each day flow naturally.'
    },
    {
      name: 'Marcus Lee',
      role: 'Foodie Couple',
      avatar: 'https://i.pravatar.cc/150?img=2',
      rating: 5,
      text: 'Loved the personalized picks for food and activities. It felt like having a local guide in my pocket.'
    },
    {
      name: 'Priya Nair',
      role: 'Family Trip',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
      text: 'The day-by-day schedule made traveling with kids so much easier. Zero stress, maximum fun.'
    }
  ];

  const tokyoItinerary = [
    { time: '08:30', activity: 'Tsukiji Outer Market', description: 'Breakfast sushi and morning stroll.' },
    { time: '11:00', activity: 'TeamLab Planets', description: 'Immersive digital art exhibit.' },
    { time: '14:00', activity: 'Asakusa & Senso-ji', description: 'Historic temple and street snacks.' },
    { time: '18:30', activity: 'Shibuya Sky', description: 'Sunset views over the city.' }
  ];

  return (
    <div className="landing-page">
      <header className="header">
        <div className="nav-container">
          <div className="nav-content">
            <div className="logo-container">
              <div className="logo-icon">
                <span role="img" aria-label="Map" style={{ fontSize: 20, color: 'white' }}>🗺️</span>
              </div>
              <span className="logo-text">TravelGenie</span>
            </div>
            <nav className="nav-links">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it works</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#resources" className="nav-link">Resources</a>
            </nav>
            <div className="auth-buttons">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary hover-scale">Sign in</button>
              </Link>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary hover-scale">Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="hero-section animate-gradient">
        <div className="floating-shape" style={{ width: '200px', height: '200px', top: '10%', left: '10%', animationDuration: '8s' }}></div>
        <div className="floating-shape" style={{ width: '150px', height: '150px', top: '60%', right: '15%', animationDuration: '12s', animationDelay: '-3s' }}></div>
        <div className="floating-shape" style={{ width: '100px', height: '100px', top: '30%', right: '30%', animationDuration: '10s', animationDelay: '-5s' }}></div>
        
        <div className="hero-content-grid">
          <div 
            id="hero-content"
            data-animate="true"
            className={`hero-text-content ${isVisible['hero-content'] ? 'animate-fade-in-left' : ''}`}
          >
            <div className="badge">
              <span role="img" aria-label="Star" style={{ fontSize: 14, marginRight: 4 }}>⭐</span>
              AI trip designer
            </div>
            
            <h1 className="hero-title">
              Plan Your Perfect Journey
              <span className="hero-title-highlight">with AI</span>
            </h1>
            
            <p className="hero-description">
              Create day-by-day itineraries, optimize routes, and discover hidden gems—
              personalized to your interests, budget, and time.
            </p>
            
            <div className="hero-buttons">
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary btn-hero">
                  <span role="img" aria-label="Play" style={{ fontSize: 20 }}>▶️</span>
                  Start Planning Now
                </button>
              </Link>
              <Link to="/demo" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary btn-hero">
                  <span role="img" aria-label="Play" style={{ fontSize: 20 }}>▶️</span>
                  Watch Demo
                </button>
              </Link>
            </div>
          </div>

          <div 
            id="hero-card"
            data-animate="true"
            className={`hero-card-container ${isVisible['hero-card'] ? 'animate-fade-in-right' : ''} animate-float`}
          >
            <div className="itinerary-card">
              <div className="itinerary-card-header">
                <div className="itinerary-card-header-content">
                  <h3 className="itinerary-card-title">Your AI Travel Plan</h3>
                  <div className="itinerary-card-badge">7 days • Tokyo</div>
                </div>
              </div>
              <div>
                {tokyoItinerary.map((item, index) => (
                  <div key={index} className="itinerary-item">
                    <div className="itinerary-item-time">{item.time}</div>
                    <div className="itinerary-item-content">
                      <h4 className="itinerary-item-activity">{item.activity}</h4>
                      <p className="itinerary-item-description">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              id={`feature-${index}`}
              data-animate="true"
              className={`feature-card ${isVisible[`feature-${index}`] ? 'animate-fade-in-up' : ''}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="feature-icon-container">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <a href="#" className="feature-link">
                {feature.linkText}
                <span role="img" aria-label="Arrow" style={{ fontSize: 16, marginLeft: 4 }}>➡️</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="section section-light">
        <div className="nav-container">
          <div className="section-header">
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle">From idea to itinerary in minutes.</p>
          </div>

          <div className="how-it-works-grid">
            {steps.map((step, index) => (
              <div 
                key={index} 
                id={`step-${index}`}
                data-animate="true"
                className={`how-it-works-step ${isVisible[`step-${index}`] ? 'animate-fade-in-up' : ''}`}
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                <div className="step-number-container">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="nav-container">
          <div className="section-header">
            <h2 className="section-title">Loved by travelers</h2>
            <p className="section-subtitle">Real stories from people who used AI to travel better.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                id={`testimonial-${index}`}
                data-animate="true"
                className={`testimonial-card ${isVisible[`testimonial-${index}`] ? 'animate-fade-in-up' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} role="img" aria-label="Star" style={{ fontSize: 20, color: '#fbbf24' }}>⭐</span>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author-container">
                  <div className="testimonial-avatar">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  </div>
                  <div>
                    <p className="testimonial-author-name">{testimonial.name}</p>
                    <p className="testimonial-author-role">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="cta-container">
          <h2 className="cta-title">Ready to plan your next adventure?</h2>
          <p className="cta-subtitle">Start for free, upgrade anytime. No credit card required.</p>
          <div className="cta-buttons">
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <button className="btn-cta-primary">
                <span role="img" aria-label="Play" style={{ fontSize: 20 }}>▶️</span>
                Start Planning Free
              </button>
            </Link>
            <Link to="/demo" style={{ textDecoration: 'none' }}>
              <button className="btn-cta-secondary">
                <span role="img" aria-label="Play" style={{ fontSize: 20 }}>▶️</span>
                Watch Demo
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-text">
            <p>AI-powered trip planning to help you travel smarter and stress-free.</p>
            <p className="footer-copyright">© 2025 Trailwise Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
