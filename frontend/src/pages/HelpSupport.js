import React, { useState } from 'react';
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    setShowContactForm(false);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <>
      {!isMobile && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f3e7fa 0%, #e3eeff 100%)',
          minHeight: '100vh',
          padding: '40px 0'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h1 style={{ 
                fontSize: 36, 
                fontWeight: 800, 
                color: '#2186eb', 
                marginBottom: 12,
                letterSpacing: 1
              }}>
                Help & Support
              </h1>
              <p style={{ 
                fontSize: 18, 
                color: '#666', 
                maxWidth: 600, 
                margin: '0 auto',
                lineHeight: 1.6
              }}>
                Find answers to common questions or get in touch with our support team
              </p>
            </div>

            {/* Support Categories */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: 24, 
              marginBottom: 48 
            }}>
              {supportCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    border: activeCategory === category.id ? '2px solid #2186eb' : '2px solid transparent',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{category.icon}</div>
                  <h3 style={{ 
                    fontSize: 20, 
                    fontWeight: 700, 
                    color: '#2186eb', 
                    marginBottom: 8 
                  }}>
                    {category.name}
                  </h3>
                  <p style={{ color: '#666', fontSize: 14 }}>
                    {category.id === 'general' && 'General questions about our services'}
                    {category.id === 'medicines' && 'Questions about medicines and prescriptions'}
                    {category.id === 'payment' && 'Payment methods and billing information'}
                    {category.id === 'account' && 'Account management and settings'}
                  </p>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: 48
            }}>
              <h2 style={{ 
                fontSize: 28, 
                fontWeight: 700, 
                color: '#2186eb', 
                marginBottom: 24,
                textAlign: 'center'
              }}>
                Frequently Asked Questions
              </h2>
              
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {faqData[activeCategory].map((faq, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #e0e7ef',
                      borderRadius: '12px',
                      marginBottom: 16,
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      style={{
                        width: '100%',
                        padding: '20px',
                        background: expandedFaq === index ? '#f8fbff' : 'white',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#2186eb'
                      }}
                    >
                      {faq.question}
                      <span style={{ 
                        fontSize: 20, 
                        transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}>
                        ▼
                      </span>
                    </button>
                    {expandedFaq === index && (
                      <div style={{ 
                        padding: '0 20px 20px 20px',
                        background: '#f8fbff',
                        color: '#666',
                        lineHeight: 1.6
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                fontSize: 28, 
                fontWeight: 700, 
                color: '#2186eb', 
                marginBottom: 16 
              }}>
                Still Need Help?
              </h2>
              <p style={{ 
                fontSize: 16, 
                color: '#666', 
                marginBottom: 24,
                maxWidth: 500,
                margin: '0 auto 24px auto'
              }}>
                Can't find what you're looking for? Our support team is here to help you.
              </p>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowContactForm(true)}
                  style={{
                    background: 'linear-gradient(90deg, #2186eb 0%, #8ec5fc 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '24px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px #8ec5fc33'
                  }}
                >
                  Contact Support
                </button>
                <button
                  onClick={() => window.open('mailto:support@medicare.com', '_blank')}
                  style={{
                    background: 'white',
                    color: '#2186eb',
                    border: '2px solid #2186eb',
                    padding: '12px 24px',
                    borderRadius: '24px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Email Us
                </button>
              </div>
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
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: 500,
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: '#2186eb' }}>Contact Support</h3>
                  <button
                    onClick={() => setShowContactForm(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 24,
                      cursor: 'pointer',
                      color: '#666'
                    }}
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
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f3e7fa 0%, #e3eeff 100%)',
          minHeight: '100vh',
          padding: '20px 0'
        }}>
          <div style={{ padding: '0 16px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{ 
                fontSize: 28, 
                fontWeight: 800, 
                color: '#2186eb', 
                marginBottom: 8,
                letterSpacing: 1
              }}>
                Help & Support
              </h1>
              <p style={{ 
                fontSize: 16, 
                color: '#666', 
                lineHeight: 1.6
              }}>
                Find answers to common questions or get in touch with our support team
              </p>
            </div>

            {/* Support Categories */}
            <div style={{ marginBottom: 32 }}>
              {supportCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: activeCategory === category.id ? '2px solid #2186eb' : '2px solid transparent',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    marginBottom: 16,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{category.icon}</div>
                  <h3 style={{ 
                    fontSize: 18, 
                    fontWeight: 700, 
                    color: '#2186eb', 
                    marginBottom: 6 
                  }}>
                    {category.name}
                  </h3>
                  <p style={{ color: '#666', fontSize: 13 }}>
                    {category.id === 'general' && 'General questions about our services'}
                    {category.id === 'medicines' && 'Questions about medicines and prescriptions'}
                    {category.id === 'payment' && 'Payment methods and billing information'}
                    {category.id === 'account' && 'Account management and settings'}
                  </p>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              marginBottom: 32
            }}>
              <h2 style={{ 
                fontSize: 22, 
                fontWeight: 700, 
                color: '#2186eb', 
                marginBottom: 20,
                textAlign: 'center'
              }}>
                Frequently Asked Questions
              </h2>
              
              {faqData[activeCategory].map((faq, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #e0e7ef',
                    borderRadius: '8px',
                    marginBottom: 12,
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: expandedFaq === index ? '#f8fbff' : 'white',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#2186eb'
                    }}
                  >
                    {faq.question}
                    <span style={{ 
                      fontSize: 16, 
                      transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}>
                      ▼
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <div style={{ 
                      padding: '0 16px 16px 16px',
                      background: '#f8fbff',
                      color: '#666',
                      lineHeight: 1.6,
                      fontSize: 14
                    }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                fontSize: 22, 
                fontWeight: 700, 
                color: '#2186eb', 
                marginBottom: 12 
              }}>
                Still Need Help?
              </h2>
              <p style={{ 
                fontSize: 14, 
                color: '#666', 
                marginBottom: 20
              }}>
                Can't find what you're looking for? Our support team is here to help you.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => setShowContactForm(true)}
                  style={{
                    background: 'linear-gradient(90deg, #2186eb 0%, #8ec5fc 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '24px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px #8ec5fc33'
                  }}
                >
                  Contact Support
                </button>
                <button
                  onClick={() => window.open('mailto:support@medicare.com', '_blank')}
                  style={{
                    background: 'white',
                    color: '#2186eb',
                    border: '2px solid #2186eb',
                    padding: '14px 24px',
                    borderRadius: '24px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Email Us
                </button>
              </div>
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
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '90%',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2186eb' }}>Contact Support</h3>
                  <button
                    onClick={() => setShowContactForm(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 20,
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleContactSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600,
                      color: '#2186eb',
                      fontSize: 14
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
                        padding: '10px',
                        border: '1.5px solid #e0e7ef',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#f6fbff'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600,
                      color: '#2186eb',
                      fontSize: 14
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
                        padding: '10px',
                        border: '1.5px solid #e0e7ef',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#f6fbff'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600,
                      color: '#2186eb',
                      fontSize: 14
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
                        padding: '10px',
                        border: '1.5px solid #e0e7ef',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#f6fbff'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 600,
                      color: '#2186eb',
                      fontSize: 14
                    }}>
                      Message *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.5px solid #e0e7ef',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#f6fbff',
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
                      padding: '12px 0',
                      borderRadius: '24px',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 4px 18px #8ec5fc33'
                    }}
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Window for Mobile */}
      {isMobile && user && (
        <ChatWindow />
      )}
    </>
  );
};

export default HelpSupports;
