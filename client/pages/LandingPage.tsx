import { Link } from 'react-router-dom';
// All UI and icon imports removed. Use HTML and emojis instead.
import { useState, useEffect, useRef } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <>
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Navigation Header */}
      <header style={{ 
        position: 'relative', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #f3f4f6',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 1rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '64px' 
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#4f46e5', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span role="img" aria-label="Map" style={{ fontSize: 20, color: 'white' }}>🗺️</span>
                </div>
                <span style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: '#111827',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                 TravelGenie
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '2rem'
            }}>
              <a href="#features" style={{ 
                color: '#6b7280', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>
                Features
              </a>
              <a href="#how-it-works" style={{ 
                color: '#6b7280', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>
                How it works
              </a>
              <a href="#pricing" style={{ 
                color: '#6b7280', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>
                Pricing
              </a>
              <a href="#resources" style={{ 
                color: '#6b7280', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>
                Resources
              </a>
            </nav>
            {/* Auth Buttons */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem'
            }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  backgroundColor: 'white',
                  color: '#4f46e5',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }} className="hover-scale">Sign in</button>
              </Link>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px 0 rgba(79, 70, 229, 0.3)'
                }} className="hover-scale">Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
        backgroundSize: '400% 400%',
        padding: '5rem 0'
      }} className="animate-gradient">
        {/* Floating Background Elements */}
        <div className="floating-shape" style={{
          width: '200px',
          height: '200px',
          top: '10%',
          left: '10%',
          animationDuration: '8s'
        }}></div>
        <div className="floating-shape" style={{
          width: '150px',
          height: '150px',
          top: '60%',
          right: '15%',
          animationDuration: '12s',
          animationDelay: '-3s'
        }}></div>
        <div className="floating-shape" style={{
          width: '100px',
          height: '100px',
          top: '30%',
          right: '30%',
          animationDuration: '10s',
          animationDelay: '-5s'
        }}></div>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div 
            id="hero-content"
            data-animate="true"
            className={isVisible['hero-content'] ? 'animate-fade-in-left' : ''}
            style={{ opacity: isVisible['hero-content'] ? 1 : 0 }}
          >
            <div className="badge" style={{ marginBottom: '1.5rem' }}>
              <span role="img" aria-label="Star" style={{ fontSize: 14, marginRight: 4 }}>⭐</span>
              AI trip designer
            </div>
            
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              color: '#111827', 
              lineHeight: '1.1', 
              marginBottom: '1.5rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Plan Your Perfect Journey
              <span style={{ display: 'block', color: '#4f46e5' }}>with AI</span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280', 
              marginBottom: '2rem', 
              maxWidth: '32rem',
              lineHeight: '1.6'
            }}>
              Create day-by-day itineraries, optimize routes, and discover hidden gems—
              personalized to your interests, budget, and time.
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem'
            }}>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '1.125rem',
                  padding: '1rem 2rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -1px rgba(79, 70, 229, 0.2)'
                }}>
                  <span role="img" aria-label="Play" style={{ fontSize: 20 }}>▶️</span>
                  Start Planning Now
                </button>
              </Link>
              <Link to="/demo" style={{ textDecoration: 'none' }}>
                <button style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '1.125rem',
                  padding: '1rem 2rem',
                  backgroundColor: 'white',
                  color: '#4f46e5',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <span role="img" aria-label="Play" style={{ fontSize: 20 }}>▶️</span>
                  Watch Demo
                </button>
              </Link>
            </div>
          </div>

          {/* Tokyo Itinerary Card */}
          <div 
            id="hero-card"
            data-animate="true"
            className={`${isVisible['hero-card'] ? 'animate-fade-in-right hover-lift' : ''} animate-float`}
            style={{ 
              position: 'relative',
              opacity: isVisible['hero-card'] ? 1 : 0
            }}
          >
            <div className="card" style={{ 
              backgroundColor: 'white', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ 
                background: 'linear-gradient(to right, #4f46e5, #7c3aed)', 
                color: 'white', 
                padding: '1.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}>
                  <h3 style={{ 
                    color: 'white', 
                    fontSize: '1.25rem', 
                    fontWeight: '600',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Your AI Travel Plan
                  </h3>
                  <div className="badge" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white', 
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontWeight: 500
                  }}>
                      7 days • Tokyo
                  </div>
                </div>
              </div>
              <div style={{ padding: '0' }}>
                {tokyoItinerary.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    padding: '1rem', 
                    borderBottom: index < tokyoItinerary.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      color: '#6b7280', 
                      width: '4rem', 
                      flexShrink: 0, 
                      marginTop: '0.25rem' 
                    }}>
                      {item.time}
                    </div>
                    <div style={{ flex: 1, marginLeft: '1rem' }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        color: '#111827', 
                        marginBottom: '0.25rem',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {item.activity}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              id={`feature-${index}`}
              data-animate="true"
              className={`card hover-scale ${isVisible[`feature-${index}`] ? 'animate-fade-in-up' : ''}`}
              style={{
                padding: '2rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                opacity: isVisible[`feature-${index}`] ? 1 : 0,
                animationDelay: `${index * 0.2}s`
              }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#eef2ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                {feature.description}
              </p>
              <a href="#" style={{
                color: '#4f46e5',
                fontWeight: '500',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none'
              }}>
                {feature.linkText}
                <span role="img" aria-label="Arrow" style={{ fontSize: 16, marginLeft: 4 }}>➡️</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ 
        padding: '6rem 0', 
        backgroundColor: '#f9fafb' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: '#111827', 
              marginBottom: '1rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              How it works
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
              From idea to itinerary in minutes.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem' 
          }}>
            {steps.map((step, index) => (
              <div 
                key={index} 
                id={`step-${index}`}
                data-animate="true"
                className={isVisible[`step-${index}`] ? 'animate-fade-in-up' : ''}
                style={{ 
                  textAlign: 'center',
                  opacity: isVisible[`step-${index}`] ? 1 : 0,
                  animationDelay: `${index * 0.3}s`
                }}
              >
                <div style={{ 
                  width: '4rem', 
                  height: '4rem', 
                  backgroundColor: '#4f46e5', 
                  color: 'white', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  margin: '0 auto 1.5rem auto' 
                }}>
                  {step.number}
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '0.75rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {step.title}
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '6rem 0', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: '#111827', 
              marginBottom: '1rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Loved by travelers
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
              Real stories from people who used AI to travel better.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                id={`testimonial-${index}`}
                data-animate="true"
                className={`card hover-lift ${isVisible[`testimonial-${index}`] ? 'animate-fade-in-up' : ''}`}
                style={{ 
                  padding: '1.5rem',
                  opacity: isVisible[`testimonial-${index}`] ? 1 : 0,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem' 
                }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} role="img" aria-label="Star" style={{ fontSize: 20, color: '#fbbf24' }}>⭐</span>
                  ))}
                </div>
                <p style={{ 
                  color: '#374151', 
                  marginBottom: '1.5rem', 
                  lineHeight: '1.6',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="avatar" style={{ marginRight: '0.75rem' }}>
                    <img src={testimonial.avatar} alt={testimonial.name} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  </div>
                  <div>
                    <p style={{ 
                      fontWeight: '600', 
                      color: '#111827',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {testimonial.name}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '6rem 0', 
        backgroundColor: '#111827', 
        color: 'white' 
      }}>
        <div style={{ 
          maxWidth: '64rem', 
          margin: '0 auto', 
          padding: '0 1rem', 
          textAlign: 'center' 
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Ready to plan your next adventure?
          </h2>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#d1d5db', 
            marginBottom: '2rem' 
          }}>
            Start for free, upgrade anytime. No credit card required.
          </p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '1.125rem',
                padding: '1rem 2rem'
              }}>
                <span role="img" aria-label="Play" style={{ fontSize: 20 }}>▶️</span>
                Start Planning Free
              </button>
            </Link>
            <Link to="/demo" style={{ textDecoration: 'none' }}>
              <button style={{ 
                backgroundColor: 'transparent',
                color: '#d1d5db',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: '1px solid #4b5563',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.125rem'
              }}>
                <span role="img" aria-label="Play" style={{ fontSize: 20 }}>▶️</span>
                Watch Demo
              </button>
            </Link>
          </div>
        </div>
      </section>
    {/* Footer */}
      </div>
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem' }}>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>AI-powered trip planning to help you travel smarter and stress-free.</p>
            <p style={{ marginTop: '0.5rem', color: '#9ca3af' }}>© 2025 Trailwise Inc.</p>
          </div>
        </div>
      </footer>
    </>
  );
}