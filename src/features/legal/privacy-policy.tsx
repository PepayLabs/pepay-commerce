import { Box, Typography, Container, Paper, ThemeProvider, createTheme, Divider } from '@mui/material'
import MaterialLayout from '@/features/home/history/material-layout'
import SEOMetadata from '@/components/SEOMetadata'

// Create matching theme locally
const materialTheme = createTheme({
  palette: {
    primary: {
      main: '#6750A4',
    },
    secondary: {
      main: '#625B71',
    },
    background: {
      default: '#FFFBFE',
      paper: '#FFFFFF',
    }
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Google Sans Text", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function PrivacyPolicy() {
  return (
    <>
      <SEOMetadata 
        title="Privacy Policy - Grab Me A Slice"
        description="Privacy Policy for Grab Me A Slice, explaining how we collect, use, and protect your information on our crypto donation platform. Learn about your rights and our data practices."
        keywords={['privacy policy', 'data protection', 'crypto donations', 'privacy rights', 'GDPR']}
        type="article"
        section="Legal"
        url="https://grabmeaslice.com/privacy"
      />
      
      <MaterialLayout>
        <ThemeProvider theme={materialTheme}>
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 500 }}>
                Privacy Policy
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontSize: '0.8rem' }}>
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>

              {/* 1. Scope & Purpose */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                1. Scope & Purpose
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                This Privacy Policy explains what information GMAS collects, how we use it, and your rights. It applies to:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  grabmeaslice.com, app.grabmeaslice.com, and any GMAS widgets or plug-ins;
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  donor and recipient accounts created on or through GMAS; and
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  related support or marketing channels (collectively, the "Services").
                </Typography>
              </Box>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                Because GMAS runs on Pepay's non-custodial rails, some technical data flows through Pepay infrastructure. Pepay processes that data only as GMAS's service provider and in accordance with this Policy.
              </Typography>

              {/* 2. Information We Collect */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                2. Information We Collect
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Public Blockchain Data:</strong> Wallet addresses, donation amounts, transaction IDs, token types, block times - automatically from the blockchain when you donate or receive funds.
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Account & Verification Data:</strong> Email, display name, organization name, tax-ID / EIN, jurisdiction of registration, optional social-media links - provided by you during sign-up or KYC/charity-verification.
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Payment Metadata:</strong> Invoice ID, QR-code hash, fiat equivalence at time of payment, network fee, Pepay fee - generated automatically when GMAS creates an invoice.
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Technical & Usage Data:</strong> IP address, browser type, device OS, referring page, cookie IDs, API call logs, error logs - collected automatically via cookies, analytics tags, and server logs.
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 2 }}>
                <strong>Support & Communications:</strong> Emails, chat messages, feedback, or bug reports you send to GMAS - directly from you.
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, fontWeight: 500 }}>
                GMAS does not collect or store private keys, seed phrases, or credit-card numbers.
              </Typography>

              {/* 3. Legal Bases & Purposes */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                3. Legal Bases (GDPR) & Purposes
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Provide Services:</strong> Invoice generation, donation routing, widget rendering - contractual necessity.<br/>
                <strong>Verify Recipients:</strong> Fraud prevention, KYC where required - legal obligation & legitimate interest.<br/>
                <strong>Security & Abuse:</strong> Detect abuse, enforce AUP, secure wallets and APIs - legitimate interest.<br/>
                <strong>Transactional Emails:</strong> Donation receipts, security alerts - contractual necessity.<br/>
                <strong>Analytics:</strong> Performance improvement, debugging, UX enhancement - legitimate interest; consent for non-essential cookies.<br/>
                <strong>Marketing:</strong> Newsletter updates - consent (opt-in).<br/>
                <strong>Compliance:</strong> Tax, accounting, and sanctions laws - legal obligation.
              </Typography>

              {/* 4. How We Use Information */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                4. How We Use Information
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Provide Services:</strong> create donation pages, display progress bars, issue on-chain invoices.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Security & Abuse Prevention:</strong> monitor IPs, rate-limit abusive traffic, flag suspicious donations.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Analytics:</strong> aggregate, de-identify usage statistics to understand feature adoption.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Compliance:</strong> respond to lawful requests, sanctions screenings, tax documentation.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Communication:</strong> send receipts, critical service announcements, and—if you opt in—marketing emails. We never spam.
                </Typography>
              </Box>

              {/* 5. Cookies & Similar Tech */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                5. Cookies & Similar Tech
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Essential cookies:</strong> session tokens, CSRF protection, widget settings.<br/>
                <strong>Analytics cookies:</strong> privacy-friendly counts of page views and conversion rates (e.g., Plausible or self-hosted Matomo).<br/>
                <strong>Opt-out:</strong> You may disable non-essential cookies in the banner or browser settings; essential cookies are required for core functionality.
              </Typography>

              {/* 6. Information Sharing */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                6. Information Sharing
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS does not sell personal data. We share only:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Public blockchain data (anyone can view it by design).
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Service providers – hosting (e.g., AWS), email delivery, analytics, KYC vendors – bound by confidentiality and data-processing agreements.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Legal compliance – regulators, law-enforcement, or courts when compelled.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Business transfers – if GMAS undergoes an acquisition or merger, data transfers with appropriate safeguards.
                </Typography>
              </Box>

              {/* 7. Cross-Border Transfers */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                7. Cross-Border Transfers
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                Servers may be in the United States, EU, or other jurisdictions. Where GDPR applies, transfers rely on Standard Contractual Clauses or adequacy decisions (e.g., EU-US Data Privacy Framework). We implement encryption in transit (TLS 1.2+) and at rest.
              </Typography>

              {/* 8. Security */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                8. Security
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  End-to-end TLS for all traffic.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Strict Content Security Policy (CSP) on widgets.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Least-privilege API keys, rotating credentials.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Regular penetration testing and third-party code audits.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  No private-key custody — you hold the keys.
                </Typography>
              </Box>

              {/* 9. Data Retention */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                9. Data Retention
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Account & KYC records:</strong> Until account closure + 5 years (for fraud & legal retention).<br/>
                <strong>Transaction metadata:</strong> 7 years (accounting/tax).<br/>
                <strong>Technical logs:</strong> 90 days unless needed for security investigations.<br/>
                <strong>Marketing consents:</strong> Until you withdraw consent.<br/>
                <strong>Public blockchain data:</strong> Permanently on-chain and outside GMAS control.
              </Typography>

              {/* 10. Your Rights */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                10. Your Rights
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                Depending on your jurisdiction (e.g., GDPR, CCPA/CPRA, UK DPA), you may:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Access or download your personal data we hold.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Correct inaccurate data.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Delete data (except immutable on-chain records and data we must retain by law).
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Object to processing or restrict processing.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Withdraw marketing consent at any time.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Lodge a complaint with a supervisory authority.
                </Typography>
              </Box>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                Send requests to <strong>Contact@peperuney.pizza</strong>. We will respond within 30 days (or as local law requires).
              </Typography>

              {/* 11. Children's Privacy */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                11. Children's Privacy
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS is not directed to children under 13 (or under 16 where GDPR applies). We do not knowingly collect personal data from children. If you believe a child has provided data, email <strong>Contact@peperuney.pizza</strong> and we will delete it.
              </Typography>

              {/* 12. Changes to This Policy */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                12. Changes to This Policy
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                We may update this Privacy Policy periodically. Material changes will be announced via email or in-app notice 30 days before they take effect. Continued use after the effective date signifies acceptance.
              </Typography>

              {/* 13. Contact */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                13. Contact
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                <strong>Email:</strong> Contact@peperuney.pizza<br/>
                <strong>Mail:</strong> Peperuney Pizza LLC, Attn: Privacy, Saint Vincent & the Grenadines.
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Agreement Acknowledgment */}
              <Box sx={{ 
                bgcolor: '#f5f5f5', 
                p: 2.5, 
                borderRadius: 2, 
                border: '1px solid #d0d0d0',
                textAlign: 'center' 
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.5, mb: 1 }}>
                  By using GMAS, you acknowledge that you have read and understood this Privacy Policy.
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block' }}>
                  Questions? Contact us at <strong>Contact@peperuney.pizza</strong>
                </Typography>
              </Box>
            </Paper>
          </Container>
        </ThemeProvider>
      </MaterialLayout>
    </>
  )
}
