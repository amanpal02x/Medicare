import React, { useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import useDeviceDetection from '../hooks/useDeviceDetection';

const HelpSupports = () => {
  const { user } = useAuth();
  const { isMobile } = useDeviceDetection();
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqData = {
    general: [
      {
        question: 'How do I place an order?',
        answer: 'To place an order, simply browse our medicines, add them to your cart, and proceed to checkout. You can pay using various payment methods including credit cards, debit cards, and digital wallets.'
      },
      {
        question: 'What is your delivery time?',
        answer: 'We typically deliver within 2-4 hours in metro cities and 24-48 hours in other areas. Delivery times may vary based on your location and medicine availability.'
      },
      {
        question: 'Do you deliver to all locations?',
        answer: 'We currently deliver to most major cities and towns. You can check delivery availability by entering your pincode on our website or app.'
      },
      {
        question: 'How can I track my order?',
        answer: 'You can track your order through your account dashboard or by using the tracking number sent to your registered mobile number and email.'
      }
    ],
    medicines: [
      {
        question: 'Are all medicines genuine?',
        answer: 'Yes, all medicines sold on MediCare are 100% genuine and sourced directly from authorized distributors and manufacturers. We maintain strict quality control measures.'
      },
      {
        question: 'Do you require prescriptions?',
        answer: 'For prescription medicines, we require a valid prescription from a registered medical practitioner. Over-the-counter medicines can be ordered without prescriptions.'
      },
      {
        question: 'What if my medicine is out of stock?',
        answer: 'If a medicine is out of stock, we will notify you immediately and suggest alternatives if available. You can also choose to be notified when the medicine is back in stock.'
      },
      {
        question: 'Can I return medicines?',
        answer: 'Medicines cannot be returned once delivered due to safety regulations. However, if there are any quality issues, please contact our support team immediately.'
      }
    ],
    payment: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, UPI, net banking, and digital wallets like Paytm, PhonePe, and Google Pay.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete card details on our servers.'
      },
      {
        question: 'Do you offer cash on delivery?',
        answer: 'Yes, we offer cash on delivery for orders up to ₹2000. For higher value orders, advance payment is required.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds are processed within 3-5 business days for cancelled orders or in case of payment issues. The refund will be credited to your original payment method.'
      }
    ],
    account: [
      {
        question: 'How do I create an account?',
        answer: 'You can create an account by clicking on the "Sign Up" button and providing your basic information including name, email, and mobile number.'
      },
      {
        question: 'I forgot my password. How can I reset it?',
        answer: 'You can reset your password by clicking on "Forgot Password" on the login page and following the instructions sent to your registered email or mobile number.'
      },
      {
        question: 'How do I update my delivery address?',
        answer: 'You can update your delivery address by going to your profile settings and editing the address information. You can also add multiple addresses for convenience.'
      },
      {
        question: 'How do I view my order history?',
        answer: 'You can view your complete order history in your account dashboard under the "My Orders" section.'
      }
    ]
  };

  const supportCategories = [
    { id: 'general', name: 'General', icon: '📋' },
    { id: 'medicines', name: 'Medicines', icon: '💊' },
    { id: 'payment', name: 'Payment', icon: '💳' },
    { id: 'account', name: 'Account', icon: '👤' }
  ];

  const contactMethods = [
    {
      icon: '📞',
      title: 'Call Us',
      details: '+91 1800-123-4567',
      description: 'Available 24/7 for urgent support'
    },
    {
      icon: '✉️',
      title: 'Email Us',
      details: 'support@medicare.com',
      description: 'Get detailed responses within 24 hours'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      details: 'Chat with us',
      description: 'Instant support during business hours'
    },
    {
      icon: '📱',
      title: 'WhatsApp',
      details: '+91 98765-43210',
      description: 'Quick support via WhatsApp'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert('Thank you for contacting us! We will get back to you soon.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setShowContactForm(false);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <>
      {!isMobile && <Header />}
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        fontFamily: 'Poppins, Roboto, Arial, sans-serif',
        paddingTop: !isMobile ? '128px' : '0'
      }}>
        {/* Background image with overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
            pointerEvents: 'none',
            transition: 'opacity 0.3s',
          }}
        />
        {/* Overlay for extra readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            background: 'linear-gradient(135deg, #e0c3fc99 0%, #8ec5fc99 100%)',
            opacity: 0.18,
            pointerEvents: 'none',
          }}
        />
        {/* Main content (zIndex 2) */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Contact Support and Contact Us - side by side container */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'stretch', // stretch for equal height
              gap: 0,
              background: 'rgba(255,255,255,0.38)',
              boxShadow: '0 8px 32px #8ec5fc33',
              borderRadius: '28px',
              margin: '32px auto 0',
              maxWidth: 950,
              padding: '0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Contact Support Form Card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.38)',
                borderRadius: '0',
                padding: '32px 32px',
                boxShadow: 'none',
                borderRight: '1.5px solid #e0e7ef',
                borderTopLeftRadius: '28px',
                borderBottomLeftRadius: '28px',
                borderTopRightRadius: window.innerWidth < 800 ? '28px' : '0',
                borderBottomRightRadius: window.innerWidth < 800 ? '28px' : '0',
                minWidth: 320,
                width: '60%',
                maxWidth: 540,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1.2,
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 32, color: '#2186eb', marginBottom: 10, filter: 'drop-shadow(0 2px 8px #8ec5fc33)' }}>📬</div>
              <h2 style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#2186eb',
                textAlign: 'center',
                marginBottom: '16px',
                letterSpacing: 0.3
              }}>
                Contact Support
              </h2>
              <form onSubmit={handleContactSubmit} style={{ width: '100%' }}>
                {/* Floating label input group for Name */}
                <div style={{ position: 'relative', marginBottom: '22px' }}>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '18px 12px 10px 12px',
                      border: '1.5px solid #e0e7ef',
                      borderRadius: '12px',
                      fontSize: '1.08rem',
                      background: 'rgba(255,255,255,0.32)',
                      fontWeight: 500,
                      boxShadow: '0 2px 12px #8ec5fc22',
                      outline: 'none',
                      transition: 'border 0.2s, box-shadow 0.2s',
                      backdropFilter: 'blur(6px)',
                      color: '#1a2a3a',
                    }}
                    onFocus={e => e.target.style.border = '1.5px solid #2186eb'}
                    onBlur={e => e.target.style.border = '1.5px solid #e0e7ef'}
                  />
                  <label
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: contactForm.name ? 4 : 18,
                      fontSize: contactForm.name ? '0.92rem' : '1.08rem',
                      color: '#2186eb',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.7)',
                      padding: '0 4px',
                      borderRadius: 4,
                      pointerEvents: 'none',
                      transition: 'all 0.18s',
                    }}
                  >
                    Name *
                  </label>
                </div>

                {/* Floating label input group for Email */}
                <div style={{ position: 'relative', marginBottom: '22px' }}>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '18px 12px 10px 12px',
                      border: '1.5px solid #e0e7ef',
                      borderRadius: '12px',
                      fontSize: '1.08rem',
                      background: 'rgba(255,255,255,0.32)',
                      fontWeight: 500,
                      boxShadow: '0 2px 12px #8ec5fc22',
                      outline: 'none',
                      transition: 'border 0.2s, box-shadow 0.2s',
                      backdropFilter: 'blur(6px)',
                      color: '#1a2a3a',
                    }}
                    onFocus={e => e.target.style.border = '1.5px solid #2186eb'}
                    onBlur={e => e.target.style.border = '1.5px solid #e0e7ef'}
                  />
                  <label
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: contactForm.email ? 4 : 18,
                      fontSize: contactForm.email ? '0.92rem' : '1.08rem',
                      color: '#2186eb',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.7)',
                      padding: '0 4px',
                      borderRadius: 4,
                      pointerEvents: 'none',
                      transition: 'all 0.18s',
                    }}
                  >
                    Email *
                  </label>
                </div>

                {/* Floating label input group for Subject */}
                <div style={{ position: 'relative', marginBottom: '22px' }}>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '18px 12px 10px 12px',
                      border: '1.5px solid #e0e7ef',
                      borderRadius: '12px',
                      fontSize: '1.08rem',
                      background: 'rgba(255,255,255,0.32)',
                      fontWeight: 500,
                      boxShadow: '0 2px 12px #8ec5fc22',
                      outline: 'none',
                      transition: 'border 0.2s, box-shadow 0.2s',
                      backdropFilter: 'blur(6px)',
                      color: '#1a2a3a',
                    }}
                    onFocus={e => e.target.style.border = '1.5px solid #2186eb'}
                    onBlur={e => e.target.style.border = '1.5px solid #e0e7ef'}
                  />
                  <label
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: contactForm.subject ? 4 : 18,
                      fontSize: contactForm.subject ? '0.92rem' : '1.08rem',
                      color: '#2186eb',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.7)',
                      padding: '0 4px',
                      borderRadius: 4,
                      pointerEvents: 'none',
                      transition: 'all 0.18s',
                    }}
                  >
                    Subject *
                  </label>
                </div>

                {/* Floating label textarea group for Message */}
                <div style={{ position: 'relative', marginBottom: '28px' }}>
                  <textarea
                    required
                    rows="4"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '18px 12px 10px 12px',
                      border: '1.5px solid #e0e7ef',
                      borderRadius: '12px',
                      fontSize: '1.08rem',
                      background: 'rgba(255,255,255,0.32)',
                      fontWeight: 500,
                      boxShadow: '0 2px 12px #8ec5fc22',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border 0.2s, box-shadow 0.2s',
                      backdropFilter: 'blur(6px)',
                      color: '#1a2a3a',
                    }}
                    onFocus={e => e.target.style.border = '1.5px solid #2186eb'}
                    onBlur={e => e.target.style.border = '1.5px solid #e0e7ef'}
                  />
                  <label
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: contactForm.message ? 4 : 18,
                      fontSize: contactForm.message ? '0.92rem' : '1.08rem',
                      color: '#2186eb',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.7)',
                      padding: '0 4px',
                      borderRadius: 4,
                      pointerEvents: 'none',
                      transition: 'all 0.18s',
                    }}
                  >
                    Message *
                  </label>
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(90deg, #2186eb 0%, #8ec5fc 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 0',
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 2px 8px #8ec5fc22',
                    letterSpacing: 0.1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>📨</span> Send Message
                </button>
              </form>
            </div>

            {/* Vertical Divider (desktop only) */}
            <div
              className="support-divider"
              style={{
                width: 0,
                borderRight: '1.5px solid #e0e7ef',
                margin: '32px 0',
                display: window.innerWidth < 800 ? 'none' : 'block',
                height: 'auto',
              }}
            />

            {/* Contact Info Card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.38)',
                borderRadius: '0',
                boxShadow: 'none',
                borderTopRightRadius: '28px',
                borderBottomRightRadius: '28px',
                borderTopLeftRadius: window.innerWidth < 800 ? '28px' : '0',
                borderBottomLeftRadius: window.innerWidth < 800 ? '28px' : '0',
                minWidth: 260,
                width: '40%',
                maxWidth: 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center',
                padding: '32px 24px',
              }}
            >
              {/* Enhanced heading with lines */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                marginBottom: 18,
                gap: 12,
              }}>
                <div style={{ flex: 1, height: 1, background: '#2186eb33', borderRadius: 2 }} />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#2186eb',
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 0.2,
                  background: 'rgba(255,255,255,0.7)',
                  padding: '0 10px',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px #8ec5fc11',
                }}>
                  <span style={{ fontSize: 20, marginRight: 8 }}></span> Contact Us
                </div>
                <div style={{ flex: 1, height: 1, background: '#2186eb33', borderRadius: 2 }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                flexWrap: 'wrap',
                gap: 24,
              }}>
                {/* Phone */}
                <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, color: '#2186eb', marginBottom: 4 }}>📞</div>
                  <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 2 }}>Phone</div>
                  <div style={{ color: '#444', fontSize: 14 }}>+91-9876543210</div>
                </div>
                {/* Email */}
                <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, color: '#2186eb', marginBottom: 4 }}>📧</div>
                  <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 2 }}>Email</div>
                  <div style={{ color: '#444', fontSize: 14 }}>support@yourapp.com</div>
                </div>
                {/* Live Chat */}
                <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, color: '#25D366', marginBottom: 4 }}>🟢</div>
                  <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 2 }}>Live Chat</div>
                  <div style={{ color: '#25D366', fontSize: 14 }}>WhatsApp</div>
                </div>
                {/* Support Hours */}
                <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, color: '#2186eb', marginBottom: 4 }}>⏰</div>
                  <div style={{ fontWeight: 700, color: '#222', fontSize: 15, marginBottom: 2 }}>Support Hours</div>
                  <div style={{ color: '#444', fontSize: 14 }}>Mon–Sat, 9 AM to 9 PM IST</div>
                </div>
              </div>
            </div>
        </div>

        {/* FAQ Section */}
        <div style={{
            maxWidth: 1100,
            margin: '60px auto 0',
            padding: '0 16px',
        }}>
          <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
            color: '#2186eb',
            textAlign: 'center',
              marginBottom: '32px',
              letterSpacing: 0.5
          }}>
            Frequently Asked Questions
          </h2>

          {/* FAQ Categories */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
              gap: '14px',
              marginBottom: '28px',
              flexWrap: 'wrap',
          }}>
            {supportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                style={{
                    background: activeCategory === category.id ? 'linear-gradient(90deg, #2186eb 0%, #8ec5fc 100%)' : '#f8faff',
                    color: activeCategory === category.id ? 'white' : '#2186eb',
                    border: activeCategory === category.id ? 'none' : '1.5px solid #e0e7ef',
                    padding: '10px 22px',
                    borderRadius: '18px',
                  fontSize: '1rem',
                    fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                    gap: '8px',
                    boxShadow: activeCategory === category.id ? '0 4px 18px #8ec5fc33' : 'none',
                    transition: 'all 0.2s',
                    letterSpacing: 0.2
                  }}
                >
                  <span style={{ fontSize: 20 }}>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '28px',
              boxShadow: '0 4px 24px rgba(31, 38, 135, 0.10)',
              border: '1.5px solid #e0e7ef',
          }}>
            {faqData[activeCategory].map((faq, index) => (
              <div key={index} style={{
                  borderLeft: '4px solid #8ec5fc',
                  borderBottom: index < faqData[activeCategory].length - 1 ? '1px solid #e0e7ef' : 'none',
                  padding: '18px 0 18px 18px',
                  marginBottom: index < faqData[activeCategory].length - 1 ? '0' : '0',
                  background: expandedFaq === index ? 'linear-gradient(90deg, #eaf4ff 0%, #f6fbff 100%)' : 'none',
                  borderRadius: expandedFaq === index ? '12px' : '0',
                  transition: 'all 0.2s',
              }}>
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    justifyContent: 'space-between',
                      alignItems: 'center',
                  }}
                >
                  <h3 style={{
                      fontSize: '1.08rem',
                      fontWeight: 700,
                      color: '#2186eb',
                      margin: '0',
                      letterSpacing: 0.2
                  }}>
                    {faq.question}
                  </h3>
                  <span style={{
                      fontSize: '1.7rem',
                      color: '#8ec5fc',
                      transition: 'transform 0.3s',
                      transform: expandedFaq === index ? 'rotate(45deg)' : 'rotate(0deg)',
                      fontWeight: 700
                    }}>
                      {expandedFaq === index ? '−' : '+'}
                  </span>
                </button>
                {expandedFaq === index && (
                  <div style={{
                      marginTop: '12px',
                      padding: '14px 0 0 0',
                      color: '#444',
                      lineHeight: 1.7,
                      fontSize: '0.99rem',
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
              padding: '20px',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.85)',
                borderRadius: '28px',
                padding: '44px 32px',
                maxWidth: '480px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 8px 32px #8ec5fc33',
                position: 'relative',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid #e0e7ef',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                  marginBottom: '28px',
              }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                  color: '#2186eb',
                    margin: 0,
                    letterSpacing: 0.5
                }}>
                  Contact Support
                </h2>
                <button
                  onClick={() => setShowContactForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: 'pointer',
                      color: '#8ec5fc',
                      fontWeight: 700
                  }}
                    aria-label="Close contact form"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleContactSubmit}>
                  <div style={{ marginBottom: '18px' }}>
                  <label style={{
                    display: 'block',
                      marginBottom: '7px',
                      fontWeight: 600,
                      color: '#2186eb',
                      letterSpacing: 0.2
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    style={{
                      width: '100%',
                        padding: '11px',
                        border: '1.5px solid #e0e7ef',
                      borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#f6fbff',
                        fontWeight: 500
                    }}
                  />
                </div>

                  <div style={{ marginBottom: '18px' }}>
                  <label style={{
                    display: 'block',
                      marginBottom: '7px',
                      fontWeight: 600,
                      color: '#2186eb',
                      letterSpacing: 0.2
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    style={{
                      width: '100%',
                        padding: '11px',
                        border: '1.5px solid #e0e7ef',
                      borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#f6fbff',
                        fontWeight: 500
                    }}
                  />
                </div>

                  <div style={{ marginBottom: '18px' }}>
                  <label style={{
                    display: 'block',
                      marginBottom: '7px',
                      fontWeight: 600,
                      color: '#2186eb',
                      letterSpacing: 0.2
                  }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    style={{
                      width: '100%',
                        padding: '11px',
                        border: '1.5px solid #e0e7ef',
                      borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#f6fbff',
                        fontWeight: 500
                    }}
                  />
                </div>

                  <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                      marginBottom: '7px',
                      fontWeight: 600,
                      color: '#2186eb',
                      letterSpacing: 0.2
                  }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows="5"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    style={{
                      width: '100%',
                        padding: '11px',
                        border: '1.5px solid #e0e7ef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                        background: '#f6fbff',
                        fontWeight: 500,
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                      background: 'linear-gradient(90deg, #2186eb 0%, #8ec5fc 100%)',
                    color: 'white',
                    border: 'none',
                      padding: '13px 0',
                      borderRadius: '24px',
                      fontSize: '1.08rem',
                      fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                      boxShadow: '0 4px 18px #8ec5fc33',
                      letterSpacing: 0.2
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default HelpSupports;
