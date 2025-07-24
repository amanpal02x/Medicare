import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
      description: 'Leading healthcare innovation with 15+ years of pharmaceutical experience.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      description: 'Technology expert driving digital transformation in healthcare delivery.'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Head of Pharmacy Operations',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
      description: 'Ensuring quality and safety in all pharmaceutical operations.'
    },
    {
      name: 'David Kim',
      role: 'Head of Customer Experience',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      description: 'Dedicated to providing exceptional customer service and support.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '1000+', label: 'Pharmacies Partnered' },
    { number: '24/7', label: 'Customer Support' },
    { number: '99.9%', label: 'Order Accuracy' }
  ];

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#fafbfc' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '120px 20px 100px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 300,
              marginBottom: '30px',
              letterSpacing: '2px'
            }}>
              About MediCare
            </h1>
            <p style={{
              fontSize: '1.4rem',
              maxWidth: 700,
              margin: '0 auto',
              lineHeight: 1.8,
              fontWeight: 300,
              opacity: 0.95
            }}>
              Revolutionizing healthcare delivery by connecting patients with trusted pharmacies, 
              ensuring affordable medicines reach every doorstep with care and convenience.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{
          padding: '80px 20px',
          background: 'white'
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '60px',
            textAlign: 'center'
          }}>
            {stats.map((stat, index) => (
              <div key={index}>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: 200,
                  color: '#667eea',
                  marginBottom: '15px',
                  lineHeight: 1
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  color: '#666',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section style={{
          padding: '100px 20px',
          background: '#f8f9fa'
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '80px',
              alignItems: 'start'
            }}>
              <div>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 300,
                  color: '#333',
                  marginBottom: '30px',
                  letterSpacing: '1px'
                }}>
                  Our Mission
                </h2>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#555',
                  lineHeight: 1.8,
                  fontWeight: 300
                }}>
                  To make healthcare accessible, affordable, and convenient for everyone. 
                  We believe that quality medicines should be available to all, regardless 
                  of location or economic status. Through our innovative platform, we connect 
                  patients with trusted pharmacies, ensuring timely delivery and competitive pricing.
                </p>
              </div>
              <div>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 300,
                  color: '#333',
                  marginBottom: '30px',
                  letterSpacing: '1px'
                }}>
                  Our Vision
                </h2>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#555',
                  lineHeight: 1.8,
                  fontWeight: 300
                }}>
                  To become the leading healthcare platform that transforms how people access 
                  medicines and healthcare services. We envision a future where healthcare 
                  delivery is seamless, transparent, and patient-centric, powered by technology 
                  and driven by compassion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section style={{
          padding: '100px 20px',
          background: 'white'
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 300,
              color: '#333',
              textAlign: 'center',
              marginBottom: '80px',
              letterSpacing: '2px'
            }}>
              Our Values
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '60px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '25px'
                }}>
                  🏥
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#333',
                  marginBottom: '20px',
                  letterSpacing: '1px'
                }}>
                  Quality & Safety
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.7,
                  fontSize: '1.1rem',
                  fontWeight: 300
                }}>
                  We maintain the highest standards of quality and safety in all our operations.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '25px'
                }}>
                  🤝
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#333',
                  marginBottom: '20px',
                  letterSpacing: '1px'
                }}>
                  Trust & Transparency
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.7,
                  fontSize: '1.1rem',
                  fontWeight: 300
                }}>
                  Building lasting relationships through honest and transparent practices.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '25px'
                }}>
                  💡
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#333',
                  marginBottom: '20px',
                  letterSpacing: '1px'
                }}>
                  Innovation
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.7,
                  fontSize: '1.1rem',
                  fontWeight: 300
                }}>
                  Continuously innovating to improve healthcare delivery and user experience.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '25px'
                }}>
                  ❤️
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#333',
                  marginBottom: '20px',
                  letterSpacing: '1px'
                }}>
                  Customer First
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.7,
                  fontSize: '1.1rem',
                  fontWeight: 300
                }}>
                  Every decision we make is centered around our customers' needs and well-being.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section style={{
          padding: '100px 20px',
          background: '#f8f9fa'
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 300,
              color: '#333',
              textAlign: 'center',
              marginBottom: '80px',
              letterSpacing: '2px'
            }}>
              Meet Our Team
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '60px'
            }}>
              {teamMembers.map((member, index) => (
                <div key={index} style={{
                  textAlign: 'center'
                }}>
                  <img
                    src={member.image}
                    alt={member.name}
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '30px',
                      border: '3px solid #667eea'
                    }}
                  />
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: 400,
                    color: '#333',
                    marginBottom: '10px',
                    letterSpacing: '1px'
                  }}>
                    {member.name}
                  </h3>
                  <p style={{
                    fontSize: '1.1rem',
                    color: '#667eea',
                    fontWeight: 500,
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {member.role}
                  </p>
                  <p style={{
                    color: '#666',
                    lineHeight: 1.7,
                    fontSize: '1rem',
                    fontWeight: 300
                  }}>
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section style={{
          padding: '100px 20px',
          background: 'white'
        }}>
          <div style={{
            maxWidth: 900,
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 300,
              color: '#333',
              marginBottom: '50px',
              letterSpacing: '2px'
            }}>
              Our Story
            </h2>
            <p style={{
              fontSize: '1.3rem',
              color: '#555',
              lineHeight: 1.9,
              marginBottom: '30px',
              fontWeight: 300
            }}>
              Founded in 2020, MediCare emerged from a simple yet powerful vision: to make healthcare 
              accessible to everyone. Our journey began when our founder, Dr. Sarah Johnson, witnessed 
              the challenges patients faced in accessing affordable medicines, especially in remote areas.
            </p>
            <p style={{
              fontSize: '1.3rem',
              color: '#555',
              lineHeight: 1.9,
              fontWeight: 300
            }}>
              Today, we've grown into a trusted platform serving thousands of customers across the country, 
              partnering with hundreds of pharmacies, and maintaining the highest standards of quality and 
              service. Our commitment to innovation and customer care continues to drive us forward.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
