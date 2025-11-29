import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      backgroundColor: '#111827',
      color: 'white',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#f9fafb',
            }}>
              FashionStore
            </h3>
            <p style={{
              color: '#d1d5db',
              lineHeight: '1.6',
              marginBottom: '1rem',
            }}>
              Discover the latest fashion trends with our modern ecommerce platform. 
              We offer premium quality clothing and accessories for every style.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" style={{ color: '#9ca3af' }}>
                <Facebook size={20} />
              </a>
              <a href="#" style={{ color: '#9ca3af' }}>
                <Twitter size={20} />
              </a>
              <a href="#" style={{ color: '#9ca3af' }}>
                <Instagram size={20} />
              </a>
              <a href="#" style={{ color: '#9ca3af' }}>
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#f9fafb',
            }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/products', label: 'All Products' },
                { href: '/categories', label: 'Categories' },
                { href: '/sale', label: 'Sale' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '0.5rem' }}>
                  <Link
                    href={link.href}
                    style={{
                      color: '#d1d5db',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#f9fafb',
            }}>
              Customer Service
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/shipping', label: 'Shipping Info' },
                { href: '/returns', label: 'Returns & Exchanges' },
                { href: '/size-guide', label: 'Size Guide' },
                { href: '/faq', label: 'FAQ' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '0.5rem' }}>
                  <Link
                    href={link.href}
                    style={{
                      color: '#d1d5db',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#f9fafb',
            }}>
              Contact Us
            </h4>
            <div style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <p>123 Fashion Street</p>
              <p>Nairobi, Kenya</p>
              <p>Email: info@fashionstore.com</p>
              <p>Phone: +254 712 345 678</p>
              <p style={{ marginTop: '1rem' }}>
                <strong>Payment Methods:</strong><br />
                M-Pesa • Credit Cards • PayPal
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.875rem',
        }}>
          <p>
            &copy; {new Date().getFullYear()} Hangazo Fashion House. All rights reserved. 
            Built with Next.js and Django.
          </p>
        </div>
      </div>
    </footer>
  );
}