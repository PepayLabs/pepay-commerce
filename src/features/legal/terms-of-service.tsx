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

export default function TermsOfService() {
  return (
    <>
      <SEOMetadata 
        title="Terms of Service - Grab Me A Slice"
        description="Terms of Service for Grab Me A Slice, the first creator and non-profit crypto donation platform. Read our comprehensive terms covering non-custodial services, wallet security, and user responsibilities."
        keywords={['terms of service', 'legal', 'crypto donations', 'non-custodial', 'blockchain terms']}
        type="article"
        section="Legal"
        url="https://grabmeaslice.com/terms"
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
                Terms of Service
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontSize: '0.8rem' }}>
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>

              {/* 0. Acceptance */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                0. Acceptance
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 2 }}>
                By clicking "I Agree," creating an account, embedding GMAS widgets, or otherwise using GrabMeASlice (the "Services"), you acknowledge that you have read, understood, and agreed to these Terms of Service (the "Terms"). If you do not agree, do not use GMAS.
              </Typography>

              {/* 1. Definitions */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                1. Definitions
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                  <strong>GMAS / we / us / our:</strong> GrabMeASlice, a business unit of Peperuney Pizza LLC, and its affiliates.<br/>
                  <strong>User / you:</strong> Any individual or entity that accesses or uses the Services.<br/>
                  <strong>Donor:</strong> A User that sends Digital Assets through GMAS.<br/>
                  <strong>Recipient:</strong> A verified nonprofit organization, charitable cause, or crowdfunding campaign that receives donations through GMAS.<br/>
                  <strong>Digital Assets:</strong> Cryptographically-secured tokens or virtual currencies recorded on a blockchain.<br/>
                  <strong>Pepay:</strong> The non-custodial payment rails powering GMAS.<br/>
                  <strong>MPC:</strong> Multi-party computation key-generation process.
                </Typography>
              </Box>

              {/* 2. Non-Custodial Service */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                2. Non-Custodial Service — No Control of Funds
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                GMAS is strictly non-custodial. We never hold, store, or control Digital Assets, private keys, seed phrases, recovery phrases, or donor funds. All donations move directly from a Donor-controlled wallet to a Recipient wallet designated via Pepay. GMAS only:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>displays donation links or widgets;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>generates invoices and QR codes;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>records on-chain references and metadata.</Typography>
              </Box>

              {/* 3. Technology Platform */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                3. Technology Platform — Not a Payment Processor, Charity, or Escrow
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                GMAS is not a bank, money-services business, payment processor, escrow, fiduciary, or registered charity. We do not:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>collect or hold donations in custody;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>convert Digital Assets to fiat;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>guarantee tax-deductible status of any donation;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>provide investment, legal, tax, or accounting advice.</Typography>
              </Box>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                Using GMAS creates no banking, escrow, fiduciary, or donor-advised-fund relationship.
              </Typography>

              {/* 4. Eligibility */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                4. Eligibility
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>You must be at least 18 years old and legally able to contract.</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>You must not appear on any sanctions or restricted-party list, nor reside in a comprehensively embargoed jurisdiction.</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>You warrant that donating, fundraising, or receiving Digital Assets is lawful where you operate.</Typography>
              </Box>

              {/* 5. Wallet Security */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                5. Wallet Security & Private-Key Responsibility
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                You are solely responsible for safeguarding private keys, seed phrases, MPC shards, hardware wallets, credentials, and API keys. GMAS and Pepay cannot restore lost keys and are not liable for resulting loss of access or funds.
              </Typography>

              {/* 6. Irreversibility */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                6. Irreversibility & User Errors
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                Blockchain donations are final, non-refundable, and irreversible once broadcast. Verify the Recipient address, network, asset, and amount before sending. GMAS bears no responsibility for errors, typos, wrong networks, or unintended tokens.
              </Typography>

              {/* 7. Fees */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                7. Fees
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS may charge platform or integration fees shown at checkout or in documentation. Pepay network fees also apply. GMAS makes no representation regarding market impact of any token-burn events linked to fees.
              </Typography>

              {/* 8. Acceptable Use Policy */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                8. Acceptable-Use Policy (AUP)
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                You may not use GMAS to facilitate or promote:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>Money-laundering, terrorist financing, ransomware, sanctioned activity;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>Fraudulent or misleading fundraising;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>Extremist, violent, or hate-based organizations;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>Child-exploitation, illicit pornography, or human-trafficking content;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>Malware, stolen data, intellectual-property infringement;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>Privacy-coin tumblers or mixers designed to conceal illicit proceeds.</Typography>
              </Box>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                The full AUP at grabmeaslice.com/aup is incorporated by reference. GMAS may suspend or terminate access for suspected violations.
              </Typography>

              {/* 9. Beta Features */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                9. Beta / Experimental Features
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                Features marked "Beta," "Preview," or "Experimental" are provided AS IS, may change without notice, and may have usage limits. GMAS disclaims all liability from Beta-Feature use.
              </Typography>

              {/* 10. MPC Wallet Generation */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                10. MPC Wallet Generation for Recipients
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                If a Recipient opts for MPC wallet creation, cryptographic shards remain client-side. GMAS never holds enough information to assemble a full private key and cannot recover lost shards.
              </Typography>

              {/* 11. API Rate Limits */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                11. API Rate-Limits & Fair-Use
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS may enforce request, bandwidth, or donation-volume caps. Excessive or abusive traffic may result in throttling, key suspension, or termination without liability.
              </Typography>

              {/* 12. Service Availability */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                12. Service Availability & Maintenance
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS targets high uptime but does not guarantee continuous service. Scheduled maintenance, Internet outages, blockchain congestion, or force-majeure events may affect availability.
              </Typography>

              {/* 13. Feedback License */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                13. Feedback Licence
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                You grant GMAS a perpetual, irrevocable, royalty-free, worldwide licence to use, modify, and incorporate any feedback without obligation to you.
              </Typography>

              {/* 14. Force Majeure */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                14. Force Majeure
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS is not liable for delays or failures caused by events beyond reasonable control—e.g., natural disasters, labor disputes, Internet-backbone failures, denial-of-service attacks, pandemics, blockchain forks, or network congestion.
              </Typography>

              {/* 15. Export Control */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                15. Export-Control & Sanctions Compliance
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                You represent that you are not located in, organized under, or a resident of a comprehensively sanctioned jurisdiction and not on any restricted-party list. You agree not to export, re-export, or transfer GMAS software in violation of applicable export laws. GMAS may suspend access to ensure compliance.
              </Typography>

              {/* 16. Taxes */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                16. Taxes & Regulatory Compliance
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Donors:</strong> You are responsible for determining whether a donation is tax-deductible and for any required reporting.
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                <strong>Recipients:</strong> You are responsible for regulatory filings, charity registrations, AML/KYC obligations, donor acknowledgments, and tax receipts in your jurisdiction. GMAS provides no tax, legal, or accounting advice.
              </Typography>

              {/* 17. Donor-Recipient Relationship */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                17. Donor–Recipient Relationship
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS merely connects Donors and Recipients. GMAS does not verify the legitimacy, charitable status, or use-of-funds of a Recipient beyond basic checks. Donations are at the Donor's risk. Disputes, refund requests, or misallocation of funds are solely between Donor and Recipient; GMAS will not mediate.
              </Typography>

              {/* 18. Indemnification */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                18. Indemnification
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                You will indemnify, defend, and hold harmless GMAS, Pepay, and their officers, directors, employees, and agents from any claim, loss, or liability (including reasonable legal fees) arising from:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>your use of the Services;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>false or misleading fundraising claims;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>breach of these Terms, the AUP, or applicable law;</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>security breaches or misconfigured wallets under your control.</Typography>
              </Box>

              {/* 19. Limitation of Liability */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                19. Limitation of Liability
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                To the fullest extent permitted by law:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>GMAS is not liable for indirect, incidental, special, consequential, punitive, or exemplary damages; loss of profits, data, reputation, or Digital-Asset value.</Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>GMAS's aggregate liability for direct damages will not exceed the greater of USD $100 or the fees you paid to GMAS in the three (3) months preceding the claim.</Typography>
              </Box>

              {/* 20. No Warranties */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                20. No Warranties
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                The Services are provided "AS IS" and "AS AVAILABLE," without warranties of any kind—express, implied, or statutory. GMAS does not guarantee error-free operation, uninterrupted uptime, or that donations will be used for any particular purpose.
              </Typography>

              {/* 21. Modifications */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                21. Modifications to Terms
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS may amend these Terms at any time by posting a revised version and updating the "Last updated" date. Continued use after the effective date constitutes acceptance.
              </Typography>

              {/* 22. Termination */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                22. Termination
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                GMAS may suspend or terminate your access immediately for AUP violations, unlawful activity, non-payment of fees, or legal compliance. Sections on Intellectual Property, AUP, Fees, Indemnification, Limitation of Liability, Dispute Resolution, and General Provisions survive termination.
              </Typography>

              {/* 23. Dispute Resolution */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                23. Dispute-Resolution Ladder & Governing Law
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Informal Resolution (30 days):</strong> Email Contact@peperuney.pizza with "Notice of Dispute," claim summary, and requested relief. Parties will negotiate in good faith for 30 days.
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Small-Claims Court:</strong> Eligible disputes ≤ USD $10,000 may be filed in small-claims court in Saint Vincent & the Grenadines (SVG) or your local venue.
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Binding Arbitration (Last Resort):</strong> Unresolved disputes will be settled by confidential, individual arbitration (AAA Commercial Rules), seated in SVG, conducted in English. Class actions and jury trials are waived.
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>
                <strong>Opt-Out:</strong> You may opt out of arbitration by written notice within 30 days of accepting these Terms.
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                <strong>Governing Law:</strong> These Terms are governed by SVG law, without regard to conflict-of-laws principles.
              </Typography>

              {/* 24. General Provisions */}
              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                24. General Provisions
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Notices:</strong> sent via email to your registered address or in-Service posting; deemed received 24 hours after dispatch.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Assignment:</strong> You may not assign these Terms without GMAS's consent; GMAS may assign freely.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Severability:</strong> If any provision is unenforceable, the remainder remains in effect.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Entire Agreement:</strong> These Terms, the AUP, and any executed addenda constitute the entire agreement and supersede prior agreements.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Waiver:</strong> GMAS's failure to enforce a provision is not a waiver of future enforcement.
                </Typography>
                <Typography component="li" variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Survival:</strong> Sections 5, 6, 8, 11 – 22, 23, and 24 survive termination.
                </Typography>
              </Box>

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
                  By using our services, you acknowledge that you have read and agree to these Terms of Service and understand the risks inherent in non-custodial Digital-Asset donations.
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