# Demo Script for Customer Presentations

This script provides a structured walkthrough for presenting the Okta BYOT + Twilio Verify demo to customers.

## Presentation Context

**Duration:** 5-7 minutes
**Audience:** Technical decision makers, developers, security architects
**Goal:** Show how Okta BYOT integrates with Twilio Verify and demystify the API flow

## Pre-Demo Setup

### 1 Day Before

- [ ] Test the complete demo flow
- [ ] Verify ngrok or production deployment is working
- [ ] Check that test phone number receives SMS
- [ ] Prepare backup phone number if needed
- [ ] Clear event history for clean demo

### 1 Hour Before

- [ ] Start backend and frontend
- [ ] Verify WebSocket connection
- [ ] Test login flow once
- [ ] Reset demo for clean start
- [ ] Open demo in browser
- [ ] Prepare Twilio Console in another tab (for logs)
- [ ] Have test user credentials ready

### Right Before

- [ ] Clear browser cache and events
- [ ] Zoom/Teams screen share ready
- [ ] Have phone visible if showing SMS receipt
- [ ] Reset demo one final time

## Demo Script

### Introduction (30 seconds)

**Script:**

> "Today I'm going to show you how Okta's Bring Your Own Telephony feature integrates with Twilio Verify for SMS-based two-factor authentication. This is a live demo—on the left, you'll see a real Okta login experience, and on the right, we'll watch every API call happen in real-time. This makes the abstract integration concrete and helps you understand exactly what's happening behind the scenes."

**Actions:**
- Show the split-screen interface
- Point to left pane: "User experience"
- Point to right pane: "API activity monitor"
- Point to connection indicator: "Live WebSocket connection"

### The Problem (30 seconds)

**Script:**

> "The challenge many customers face is understanding the API flow. Okta's documentation shows you the endpoints, but it's hard to visualize how it all fits together. You might be wondering: What does Okta send to my webhook? What does Twilio Verify need? How do I handle errors? This demo answers all of those questions."

**Actions:**
- Briefly mention common customer questions
- No screen actions—keep focus on the overview

### Walkthrough: Step 1 - User Enters Credentials (45 seconds)

**Script:**

> "Let's start the login process. I'm going to enter credentials for a test user who has SMS MFA enabled."

**Actions:**
1. Enter username in Okta widget
2. Enter password
3. Click "Sign In"

**Script (while waiting for MFA prompt):**

> "Watch the right pane—here's the first API call. Okta has just called our Twilio Function via a telephony inline hook."

**Actions:**
4. Point to Event #1 appearing in real-time
5. Click to expand the event

**Script:**

> "Let's look at what Okta sent us. Notice the structure: we get the user's phone number in E.164 format, the OTP code that Okta generated, and metadata about the user. This is everything we need to send the SMS."

**Actions:**
6. Click "Request" tab
7. Highlight key fields:
   - `phoneNumber`
   - `otpCode`
   - `channel` (SMS)
8. Click "Response" tab

**Script:**

> "And here's our response back to Okta. We return 'SUCCESSFUL' status and the Twilio Verify verification SID, which Okta stores for tracking."

**Actions:**
9. Highlight `status: "SUCCESSFUL"`
10. Highlight `transactionId` (verification SID)

### Walkthrough: Step 2 - SMS Delivery (30 seconds)

**Script:**

> "Inside that Twilio Function—which you saw the code for in our blog post—we're calling the Twilio Verify API. The function passes the custom OTP code from Okta to Verify, and Verify handles the SMS delivery."

**Actions:**
1. Point to metadata section showing `verificationSid`
2. If available, show second event for Verify API call

**Script (optional, if showing phone):**

> "And here on my phone, you can see the SMS just arrived with the 6-digit code."

**Actions:**
3. Show phone with SMS (if setup allows)
4. Read the OTP code

### Walkthrough: Step 3 - OTP Verification (45 seconds)

**Script:**

> "Now the user enters the code they received. I'll type it into Okta..."

**Actions:**
1. Enter the OTP code in Okta widget
2. Click "Verify"

**Script (while verification happens):**

> "Okta validates the code—they're handling the verification logic, not us. This is key: Twilio Verify delivered the SMS with Okta's code, but Okta is doing the actual OTP validation."

**Actions:**
3. Wait for success screen
4. Point to success indicator in left pane

**Script:**

> "And we're in! The user is now authenticated with SMS two-factor authentication powered by Twilio Verify and Okta BYOT."

**Actions:**
5. Show the success screen
6. Point to step indicator showing "3/3"

### Deep Dive: Examining the Payloads (60 seconds)

**Script:**

> "Let me take you deeper into the technical details. This is where this demo really shines—you can see the exact JSON that's being exchanged."

**Actions:**
1. Scroll to Event #1
2. Click to expand if collapsed
3. Click "Request" tab

**Script:**

> "Here's what Okta sends to your webhook:
> - The user identifier—in this case, their email
> - Phone number in E.164 format—this is important for international numbers
> - The OTP code Okta generated—we'll pass this to Verify
> - The delivery channel—SMS or voice
> - Factor type and other metadata"

**Actions:**
4. Slowly scroll through the request JSON
5. Point out each field mentioned

**Script:**

> "Now let's look at the response we send back to Okta."

**Actions:**
6. Click "Response" tab

**Script:**

> "We return a command object with:
> - Status: 'SUCCESSFUL' tells Okta we sent the SMS
> - Transaction ID: the Verify verification SID for tracking
> - Transaction metadata: additional details from Verify
>
> If there's an error—say, the phone number is invalid—we'd return an error object instead, and Okta would show that to the user."

**Actions:**
7. Highlight the response structure
8. Mention error handling

### Timing and Performance (20 seconds)

**Script:**

> "Notice the timestamps here. The entire flow—from user clicking 'Sign In' to receiving the SMS—took about 2-3 seconds. That includes:
> - Okta calling our Function
> - Our Function calling Twilio Verify
> - Verify sending the SMS
> - The response going back to Okta
>
> This is well within user expectations for MFA."

**Actions:**
1. Point to timestamps on events
2. Calculate rough duration

### Reset and Show Repeatability (15 seconds)

**Script:**

> "Let me reset the demo to show you how clean this is. Watch—I'll click 'Reset Demo' and we're back to a fresh state. All the events clear, and we can run through it again. This is great for testing during development."

**Actions:**
1. Click "Reset Demo" button
2. Show that events clear
3. Show login widget resets

### Implementation Discussion (45 seconds)

**Script:**

> "So how do you implement this? There are three main steps:
>
> 1. Set up a Twilio Function to handle Okta's webhook. We have sample code in our blog post that you can use as-is or customize.
>
> 2. Configure the telephony inline hook in Okta to point to your Function. You'll add your Function URL and an authentication secret.
>
> 3. Enable the phone authenticator in your Okta MFA policy.
>
> The entire setup takes about 30 minutes. We have a detailed guide that walks you through every step, including the Okta configuration and Twilio setup."

**Actions:**
- Show the README or setup guide if appropriate
- Mention blog post and documentation

### Use Cases and Benefits (30 seconds)

**Script:**

> "Why would you use this? Here are a few reasons:
>
> - **Control:** You manage the telephony, so you can customize messages, use your own numbers, and handle international requirements.
>
> - **Cost:** You're billed at Twilio's Verify rates, which may be more economical at scale.
>
> - **Branding:** The SMS comes from your Twilio number with your custom messaging.
>
> - **Compliance:** For organizations with specific telecom requirements or regional restrictions.
>
> - **Observability:** You get full access to Twilio's logs, analytics, and debugging tools."

**Actions:**
- No screen actions needed
- Can show Twilio Console briefly if relevant

### Q&A Transition (15 seconds)

**Script:**

> "That's the core demo. Before we jump into questions, let me quickly show you one more thing—the Twilio Console logs."

**Actions:**
1. Switch to Twilio Console tab
2. Navigate to Verify → Logs
3. Show the verification record

**Script:**

> "Here in the Twilio Console, you can see the same verification. You get delivery status, timing, errors if any, and you can even see the carrier information. This is invaluable for troubleshooting."

**Actions:**
4. Highlight key fields in the log entry
5. Return to demo screen

**Script:**

> "I'll leave the demo running in case you want to see it again, but I'm happy to answer any questions about the integration, setup, or customization."

## Common Questions & Answers

### Q: Can I customize the SMS message?

**A:** Yes! In your Twilio Function, you can customize the message by using Verify's content templates or by sending the SMS directly via Twilio's Messaging API instead of Verify. Verify gives you customization options through the API as well.

### Q: What about voice calls instead of SMS?

**A:** Absolutely. Twilio Verify supports both SMS and voice. In the Function, you just need to handle the `channel` parameter that Okta sends—it can be "sms" or "call". The demo focuses on SMS, but voice works the same way.

### Q: How do I handle errors?

**A:** The Function includes error handling. If Verify returns an error—like an invalid phone number—you return an error object to Okta with a user-friendly message. Okta displays that to the user. You can see the error structure in the sample code.

### Q: Does this work for Okta Verify push notifications?

**A:** No, this demo is specifically for SMS/voice MFA via BYOT. Okta Verify push uses a different mechanism. However, you can use both in the same Okta org—users can choose their preferred MFA method.

### Q: What's the cost?

**A:** You'll pay Twilio's standard Verify rates, which vary by country. In the US, it's around $0.05 per verification attempt. Check Twilio's pricing page for your regions.

### Q: Can I use this in production?

**A:** Yes, this is production-ready. Make sure to:
- Use environment variables for secrets
- Add proper error handling and logging
- Test with your target phone numbers and regions
- Review Twilio's best practices for Verify

### Q: How do I troubleshoot if it's not working?

**A:** Check three places:
1. Twilio Function logs—verify the webhook is being called
2. Twilio Verify logs—verify the SMS was sent
3. Okta system logs—verify the inline hook succeeded

The demo helps here because you can see exactly where the flow breaks.

### Q: Can I see the source code?

**A:** Yes! The demo app is open source. You can find it on GitHub, and the blog post has the complete Function code. Feel free to clone it and customize it for your needs.

## Post-Demo Follow-Up

After the demo, send:

1. **Link to blog post** with implementation guide
2. **Link to demo repository** (if public)
3. **Twilio Verify documentation** link
4. **Okta BYOT documentation** link
5. **Your contact info** for questions

## Demo Variations

### Short Version (3 minutes)

- Skip deep dive into JSON
- Skip reset demonstration
- Focus on: intro, one login flow, key benefits

### Technical Deep Dive (10 minutes)

- Show Function code in detail
- Explain error handling
- Show Twilio Console logs
- Discuss customization options
- Live edit and redeploy Function

### Executive Version (2 minutes)

- Skip technical details
- Focus on: problem, solution, benefits, ROI
- Quick visual of the flow
- High-level implementation steps

## Tips for a Smooth Demo

### Before

- Test the demo 10 minutes before
- Have backup credentials ready
- Ensure good internet connection
- Close unnecessary tabs and apps
- Silence notifications

### During

- Speak clearly and at a moderate pace
- Pause for the API calls to appear
- Ask if audience can see the screen
- Check chat for questions
- Point with cursor to guide attention

### After

- Ask for questions
- Offer to run through again
- Provide resources
- Schedule follow-up if needed

### If Something Goes Wrong

**SMS doesn't arrive:**
- Check Twilio Console logs immediately
- Explain what you're checking
- Offer to try alternative phone number
- Can still show the API calls even if SMS fails

**WebSocket disconnects:**
- Refresh the page
- Reconnect should be automatic
- Explain that this is a demo limitation
- Can continue with cached events

**Function errors:**
- Show the error in the event detail
- Use it as teaching moment for error handling
- Check Function logs to diagnose
- Explain how you'd fix it

**Okta errors:**
- Check Okta system logs
- Verify user has phone number set
- Check MFA policy settings
- May need to use different test user

## Success Metrics

A successful demo should result in:

- [ ] Customer understands the API flow
- [ ] Customer sees value in BYOT approach
- [ ] Customer asks implementation questions
- [ ] Customer requests follow-up or POC
- [ ] Customer shares with their team

## Additional Resources for Customers

After the demo, point customers to:

1. **Twilio Blog Post:** Complete implementation guide
2. **Okta Documentation:** BYOT configuration steps
3. **Twilio Verify Docs:** API reference and best practices
4. **Demo Repository:** Full source code to customize
5. **Twilio Support:** For implementation assistance
6. **Okta Support:** For inline hook questions

---

**Remember:** The goal is not just to show the technology working, but to help customers understand how they'll implement it in their own environment. Focus on clarity, real-world applicability, and answering their specific use case questions.
