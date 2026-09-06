/* Generate VAPID keys for web push. Usage: pnpm vapid */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("Add these to your environment:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:you@yourdomain.com`);
