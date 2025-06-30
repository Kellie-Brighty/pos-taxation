# Terra Switching Integration Documentation

## Overview

This document provides a comprehensive guide to the Terra Switching integration implemented in the POS Tax Management System. The integration enables automated tax payment processing and settlement to government accounts.

## Architecture

### Components

1. **Terra Switching Configuration** (`src/config/terraswitch.config.ts`)

   - Environment variables and API endpoints
   - TypeScript interfaces for API responses
   - Utility functions for amount formatting and validation

2. **Terra Switching Service** (`src/services/terraswitch.service.ts`)

   - Core API integration logic
   - Payment initialization and verification
   - Government settlement processing
   - Error handling and logging

3. **Terra Switching Context** (`src/context/TerraswitchContext.tsx`)

   - React context for managing Terra operations
   - Real-time settlement tracking
   - Payment status management
   - Integration with Firebase for data persistence

4. **Webhook Service** (`src/services/webhook.service.ts`)

   - Webhook signature verification
   - Event processing for payment/settlement updates
   - Database updates based on Terra events

5. **Government Settlements Dashboard** (`src/components/dashboard/GovernmentSettlements.tsx`)

   - Real-time settlement monitoring
   - Statistics and reporting
   - Export functionality

6. **Enhanced PayInvoice Component** (`src/components/dashboard/PayInvoice.tsx`)
   - Terra Switching payment link generation
   - Dual payment methods (Terra + manual)
   - Payment status tracking

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Terra Switching Configuration
VITE_TERRASWITCH_ENV=sandbox  # or 'live' for production
VITE_TERRASWITCH_SECRET_KEY=your_secret_key
VITE_TERRASWITCH_PUBLIC_KEY=your_public_key
VITE_TERRASWITCH_WEBHOOK_SECRET=your_webhook_secret

# Government Account Details
VITE_GOVERNMENT_ACCOUNT_NUMBER=your_account_number
VITE_GOVERNMENT_BANK_CODE=your_bank_code
VITE_GOVERNMENT_ACCOUNT_NAME=Government Tax Account

# Firebase Configuration (existing)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Terra Switching Account Setup

1. **Create Terra Switching Account**

   - Visit [Terra Switching Dashboard](https://dashboard.terraswitch.com)
   - Complete business verification
   - Obtain API keys

2. **Configure Webhook URLs**

   - Set webhook URL to: `https://your-domain.com/api/webhooks/terraswitch`
   - Configure the following events:
     - `charge.success`
     - `charge.failed`
     - `transfer.success`
     - `transfer.failed`

3. **Government Account Setup**
   - Create a transfer recipient for the government account
   - Note the recipient code for transfers

### 3. Firebase Collections

The integration creates the following Firestore collections:

#### `settlements`

```typescript
{
  id: string;
  type: 'tax_payment';
  invoiceId: string;
  bankId: string;
  bankName: string;
  amount: number;
  originalPaymentRef: string;
  settlementRef: string;
  terraTransferId?: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: Timestamp;
  terraTransferData?: any;
  error?: string;
}
```

#### `terraTransactionLogs`

```typescript
{
  type: 'payment_initialized' | 'payment_verified' | 'transfer_initiated' | 'webhook_received';
  data: any;
  invoiceId?: string;
  bankId?: string;
  timestamp: Timestamp;
  environment: 'sandbox' | 'live';
}
```

#### `webhookLogs`

```typescript
{
  eventType: string;
  eventData: any;
  headers: Record<string, string>;
  receivedAt: Timestamp;
  environment: "sandbox" | "live";
}
```

## Usage Guide

### For Banks (Payment Flow)

1. **Generate Payment Link**

   ```typescript
   const { initializePayment } = useTerraswitch();

   const response = await initializePayment({
     invoiceId: "INV-123",
     amount: 50000,
     bankName: "GTBank",
     description: "Tax payment for January 2024",
   });

   // Redirect user to payment link
   window.open(response.data.authorization_url, "_blank");
   ```

2. **Track Payment Status**

   ```typescript
   const { getPaymentStatus } = useTerraswitch();
   const status = getPaymentStatus("INV-123");

   console.log(status?.status); // 'initializing' | 'payment_link_generated' | 'success' | 'failed'
   ```

### For Government (Settlement Monitoring)

1. **View Real-time Settlements**

   ```typescript
   const { settlements, getTotalSettlements } = useTerraswitch();

   console.log(`Total settlements: ₦${getTotalSettlements().toLocaleString()}`);
   ```

2. **Filter Settlements**
   ```typescript
   const { getSettlementsForBank } = useTerraswitch();
   const bankSettlements = getSettlementsForBank("bank-uid");
   ```

### For Developers (API Integration)

1. **Direct Service Usage**

   ```typescript
   import { terraswitchService } from "../services/terraswitch.service";

   // Initialize payment
   const payment = await terraswitchService.initializePayment({
     invoiceId: "INV-123",
     amount: 50000,
     email: "bank@example.com",
     bankId: "bank-uid",
     bankName: "GTBank",
   });

   // Verify payment
   const verification = await terraswitchService.verifyPayment(
     "payment-reference"
   );
   ```

## API Reference

### Terra Switching Service Methods

#### `initializePayment(params)`

Creates a payment link for invoice payment.

**Parameters:**

- `invoiceId: string` - Invoice identifier
- `amount: number` - Amount in Naira
- `email: string` - Bank contact email
- `bankId: string` - Bank user ID
- `bankName: string` - Bank name
- `taxReportId?: string` - Optional tax report ID
- `description?: string` - Payment description

**Returns:** `InitializeTransactionResponse`

#### `verifyPayment(reference)`

Verifies payment status by reference.

**Parameters:**

- `reference: string` - Payment reference

**Returns:** `PaymentVerificationResponse`

#### `initiateGovernmentSettlement(params)`

Initiates transfer to government account.

**Parameters:**

- `originalTransactionRef: string` - Original payment reference
- `amount: number` - Settlement amount
- `invoiceId: string` - Invoice ID
- `bankId: string` - Bank ID
- `bankName: string` - Bank name

**Returns:** `TransferResponse`

### Webhook Events

#### Payment Success (`charge.success`)

Triggered when a payment is completed successfully.

```typescript
{
  event: 'charge.success',
  data: {
    id: number,
    status: 'success',
    reference: string,
    amount: number,
    metadata: {
      invoiceId: string,
      bankId: string,
      bankName: string
    }
    // ... other Terra Switching fields
  }
}
```

#### Payment Failed (`charge.failed`)

Triggered when a payment fails.

#### Transfer Success (`transfer.success`)

Triggered when government settlement completes.

#### Transfer Failed (`transfer.failed`)

Triggered when government settlement fails.

## Error Handling

### Common Error Scenarios

1. **Configuration Errors**

   ```typescript
   // Missing environment variables
   throw new TerraApiError(
     "Terra Switching configuration invalid",
     "CONFIG_ERROR"
   );
   ```

2. **Network Errors**

   ```typescript
   // API request failed
   throw new TerraApiError(
     "Network error: Connection timeout",
     "NETWORK_ERROR"
   );
   ```

3. **Payment Errors**
   ```typescript
   // Payment processing failed
   throw new TerraApiError("Insufficient funds", "PAYMENT_ERROR");
   ```

### Error Recovery

1. **Automatic Retry Logic**

   - Payment verification retries
   - Settlement retry mechanisms
   - Webhook processing retries

2. **Manual Recovery**
   - Admin dashboard for failed payments
   - Settlement status monitoring
   - Manual settlement initiation

## Security Considerations

### Webhook Security

1. **Signature Verification**

   ```typescript
   const isValid = terraswitchService.verifyWebhookSignature(
     payload,
     signature
   );
   ```

2. **HTTPS Requirements**

   - All webhook URLs must use HTTPS
   - SSL certificate validation

3. **IP Whitelisting**
   - Configure firewall to only allow Terra Switching IPs
   - Monitor webhook sources

### API Security

1. **Key Management**

   - Store API keys securely
   - Rotate keys regularly
   - Use environment variables

2. **Request Signing**
   - All API requests are signed
   - Timestamp validation
   - Replay attack prevention

## Testing

### Sandbox Environment

1. **Test API Keys**

   - Use sandbox API keys for development
   - Test all payment flows
   - Verify webhook handling

2. **Test Cards**

   - Use Terra Switching test cards
   - Test different scenarios (success, failure, insufficient funds)

3. **Webhook Testing**
   - Use ngrok for local webhook testing
   - Test webhook signature verification
   - Verify event processing

### Test Scenarios

1. **Successful Payment Flow**

   - Initialize payment
   - Complete payment with test card
   - Verify webhook receipt
   - Confirm settlement initiation

2. **Failed Payment Flow**

   - Initialize payment
   - Use declined test card
   - Verify failure webhook
   - Confirm proper error handling

3. **Settlement Flow**
   - Complete successful payment
   - Verify settlement creation
   - Test settlement success webhook
   - Confirm government dashboard update

## Deployment

### Production Checklist

1. **Environment Configuration**

   - [ ] Switch to live API keys
   - [ ] Update webhook URLs
   - [ ] Configure production environment variables

2. **Security Setup**

   - [ ] Enable HTTPS
   - [ ] Configure firewall rules
   - [ ] Set up monitoring

3. **Webhook Configuration**

   - [ ] Set production webhook URLs
   - [ ] Test webhook delivery
   - [ ] Monitor webhook logs

4. **Government Account**
   - [ ] Set up production government account
   - [ ] Create transfer recipient
   - [ ] Test settlement flow

### Monitoring

1. **Payment Monitoring**

   - Track payment success rates
   - Monitor failed payments
   - Alert on anomalies

2. **Settlement Monitoring**

   - Track settlement completion
   - Monitor failed settlements
   - Generate settlement reports

3. **Webhook Monitoring**
   - Monitor webhook delivery
   - Track processing times
   - Alert on failures

## Troubleshooting

### Common Issues

1. **Payment Link Not Generated**

   - Check API keys
   - Verify environment configuration
   - Check network connectivity

2. **Webhook Not Received**

   - Verify webhook URL configuration
   - Check firewall settings
   - Monitor webhook logs

3. **Settlement Failed**
   - Check government account details
   - Verify recipient configuration
   - Check Terra Switching dashboard

### Debug Tools

1. **Browser Console**

   ```typescript
   // Enable debug logging
   localStorage.setItem("DEBUG", "terraswitch:*");
   ```

2. **Firestore Logs**

   - Check `terraTransactionLogs` collection
   - Monitor `webhookLogs` collection
   - Review settlement records

3. **Terra Switching Dashboard**
   - Monitor payment transactions
   - Check transfer status
   - Review webhook delivery logs

## Support

### Resources

1. **Terra Switching Documentation**

   - [API Documentation](https://docs.terraswitch.com)
   - [Dashboard](https://dashboard.terraswitch.com)
   - [Support](https://support.terraswitch.com)

2. **Internal Support**
   - Check implementation logs
   - Review error messages
   - Contact development team

### Contact Information

- **Development Team**: your-dev-team@company.com
- **Terra Switching Support**: support@terraswitch.com
- **Emergency Contact**: emergency@company.com
