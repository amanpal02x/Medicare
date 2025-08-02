import React from 'react';
import Header from '../components/Header';
import useDeviceDetection from '../hooks/useDeviceDetection';
import { 
  LocalPharmacy, 
  LocalShipping, 
  Security, 
  Support, 
  Star, 
  People,
  HealthAndSafety,
  Speed
} from '@mui/icons-material';

const About = () => {
  const { isMobile } = useDeviceDetection();

  const features = [
    {
      icon: <LocalPharmacy style={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Verified Pharmacies',
      description: 'All our partner pharmacies are licensed and verified by regulatory authorities.'
    },
    {
      icon: <LocalShipping style={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Fast Delivery',
      description: 'Get your medicines delivered to your doorstep within 2-4 hours.'
    },
    {
      icon: <Security style={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Secure Payments',
      description: 'Multiple secure payment options with encrypted transactions.'
    },
    {
      icon: <Support style={{ fontSize: 40, color: '#1976d2' }} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your queries and concerns.'
    },
    {
      icon: <HealthAndSafety style={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Quality Assured',
      description: 'All medicines are sourced from authorized distributors and manufacturers.'
    },
    {
      icon: <Speed style={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Easy Ordering',
      description: 'Simple and intuitive platform for hassle-free medicine ordering.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '100+', label: 'Partner Pharmacies' },
    { number: '10K+', label: 'Medicines Available' },
    { number: '24/7', label: 'Customer Support' }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      image: '/placeholder-medicine.jpg',
      description: 'Leading our medical advisory team with 15+ years of experience.'
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      image: '/placeholder-medicine.jpg',
      description: 'Driving innovation in healthcare technology and digital solutions.'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      image: '/placeholder-medicine.jpg',
      description: 'Ensuring seamless operations and exceptional customer experience.'
    }
  ];

  return (
    <>
      {!isMobile && <Header />}
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6fdff 0%, #e3f0ff 100%)',
        paddingTop: !isMobile ? '128px' : '0'
      }}>
        
        {/* Hero Section */}
        <div style={{
          padding: isMobile ? '40px 20px' : '80px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: isMobile ? '2.5rem' : '3.5rem',
              fontWeight: 700,
              marginBottom: '20px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              About MediCareX
            </h1>
            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
              opacity: 0.9
            }}>
              Revolutionizing healthcare delivery by connecting patients with verified pharmacies 
              for safe, fast, and convenient medicine delivery.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div style={{
          padding: isMobile ? '40px 20px' : '80px 40px',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 700,
              color: '#1976d2',
              marginBottom: '20px'
            }}>
              Our Mission
            </h2>
            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: '#666',
              lineHeight: 1.8,
              maxWidth: '800px',
              margin: '0 auto 40px auto'
            }}>
              To make healthcare accessible to everyone by providing a reliable platform that connects 
              patients with licensed pharmacies, ensuring timely delivery of authentic medicines while 
              maintaining the highest standards of safety and quality.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '40px',
              marginTop: '60px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #e3f0ff 0%, #f6fdff 100%)',
                padding: '40px',
                borderRadius: '20px',
                border: '1px solid rgba(25,118,210,0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1976d2',
                  marginBottom: '15px'
                }}>
                  Our Vision
                </h3>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  lineHeight: 1.6
                }}>
                  To become the most trusted healthcare delivery platform, making quality medicines 
                  accessible to every household across the country.
                </p>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #e3f0ff 0%, #f6fdff 100%)',
                padding: '40px',
                borderRadius: '20px',
                border: '1px solid rgba(25,118,210,0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1976d2',
                  marginBottom: '15px'
                }}>
                  Our Values
                </h3>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  lineHeight: 1.6
                }}>
                  Integrity, Quality, Customer First, Innovation, and Social Responsibility guide 
                  everything we do.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{
          padding: isMobile ? '40px 20px' : '60px 40px',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 700,
              marginBottom: '50px'
            }}>
              Our Impact
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '30px'
            }}>
              {stats.map((stat, index) => (
                <div key={index} style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '30px 20px',
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    fontSize: isMobile ? '2rem' : '2.5rem',
                    fontWeight: 700,
                    marginBottom: '10px'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    opacity: 0.9
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          padding: isMobile ? '40px 20px' : '80px 40px',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 700,
              color: '#1976d2',
              marginBottom: '20px'
            }}>
              Why Choose MediCareX?
            </h2>
            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: '#666',
              marginBottom: '60px',
              maxWidth: '800px',
              margin: '0 auto 60px auto'
            }}>
              We provide a comprehensive healthcare solution that prioritizes your safety and convenience.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '30px'
            }}>
              {features.map((feature, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, #f6fdff 0%, #e3f0ff 100%)',
                  padding: '40px 30px',
                  borderRadius: '20px',
                  border: '1px solid rgba(25,118,210,0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(25,118,210,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: '#1976d2',
                    marginBottom: '15px'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#666',
                    lineHeight: 1.6
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div style={{
          padding: isMobile ? '40px 20px' : '80px 40px',
          background: 'linear-gradient(135deg, #f6fdff 0%, #e3f0ff 100%)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 700,
              color: '#1976d2',
              marginBottom: '20px'
            }}>
              Meet Our Leadership
            </h2>
            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: '#666',
              marginBottom: '60px',
              maxWidth: '800px',
              margin: '0 auto 60px auto'
            }}>
              Our experienced team is dedicated to revolutionizing healthcare delivery.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '40px'
            }}>
              {team.map((member, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '40px 30px',
                  borderRadius: '20px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#e3f0ff',
                    margin: '0 auto 20px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={member.image} 
                      alt={member.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: '#1976d2',
                    marginBottom: '10px'
                  }}>
                    {member.name}
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#666',
                    marginBottom: '15px',
                    fontWeight: 500
                  }}>
                    {member.role}
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#888',
                    lineHeight: 1.6
                  }}>
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div style={{
          padding: isMobile ? '40px 20px' : '60px 40px',
          background: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 700,
              color: '#1976d2',
              marginBottom: '20px'
            }}>
              Get in Touch
            </h2>
            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: '#666',
              marginBottom: '40px',
              lineHeight: 1.6
            }}>
              Have questions or feedback? We'd love to hear from you. Our team is here to help.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '30px',
              marginBottom: '40px'
            }}>
              <div>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1976d2',
                  marginBottom: '10px'
                }}>
                  Customer Support
                </h4>
                <p style={{ color: '#666' }}>24/7 Helpline</p>
                <p style={{ color: '#666' }}>support@medicarex.com</p>
              </div>
              
              <div>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1976d2',
                  marginBottom: '10px'
                }}>
                  Business Inquiries
                </h4>
                <p style={{ color: '#666' }}>Partnership</p>
                <p style={{ color: '#666' }}>business@medicarex.com</p>
              </div>
              
              <div>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1976d2',
                  marginBottom: '10px'
                }}>
                  Office Address
                </h4>
                <p style={{ color: '#666' }}>MediCareX Headquarters</p>
                <p style={{ color: '#666' }}>Mumbai, Maharashtra, India</p>
              </div>
            </div>
            
            <button style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1565c0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1976d2'}>
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
