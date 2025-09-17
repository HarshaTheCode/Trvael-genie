import { Request, Response, Router } from 'express';
import { Webhook } from 'svix';

const webhookSecret: string = process.env.CLERK_WEBHOOK_SECRET || '';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const payload = req.body;
  const headers = req.headers;

  // Get the headers
  const svix_id = headers['svix-id'] as string;
  const svix_timestamp = headers['svix-timestamp'] as string;
  const svix_signature = headers['svix-signature'] as string;

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).send('Error occured -- no svix headers');
  }

  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: any;

  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err: any) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', payload);

  // Handle the webhook event
  // For example, if you need to create a user in your own database:
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    console.log(`User ${first_name} ${last_name} (${email_addresses[0].email_address}) created in Clerk.`);
    // Here you would typically save this user to your own database
    // Example: await myDatabase.createUser({ clerkId: id, email: email_addresses[0].email_address, firstName: first_name, lastName: last_name });
  } else if (eventType === 'user.deleted') {
    const { id } = evt.data;
    console.log(`User with ID ${id} deleted from Clerk.`);
    // Here you would typically delete this user from your own database
    // Example: await myDatabase.deleteUser(id);
  }

  res.status(200).json({ success: true });
});

export default router;