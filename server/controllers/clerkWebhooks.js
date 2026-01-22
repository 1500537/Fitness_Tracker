import User from "../models/userModal.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        // Create a Svix instance with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        // Getting Headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // Veryfying Headers
        await whook.verify(JSON.stringify(req.body), headers)

        // Getting Data from request body
        const {data, type} = req.body
        
        console.log('Webhook received:', type, 'for user:', data.id);

           const userData = {
                    clerkId: data.id,
                    email: data.email_addresses?.[0]?.email_address || '',
                    username: (data.first_name || '') + " " + (data.last_name || ''),
                    image: data.image_url || ''
                }

        // Swtch Cases for different Events
        switch (type) {
            case "user.created": {
                const newUser = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || '',
                    username: (data.first_name || '') + " " + (data.last_name || ''),
                    image: data.image_url || '',
                    role: 'user',
                    pricing: 'starter'
                };
                await User.create(newUser);
                console.log('User created in database:', data.id);
                break;
            }

            case "user.updated": {
                const result = await User.findByIdAndUpdate(
                    data.id,
                    {
                        email: data.email_addresses?.[0]?.email_address || '',
                        username: (data.first_name || '') + " " + (data.last_name || ''),
                        image: data.image_url || ''
                    }
                );
                console.log('User updated in database:', data.id, result ? 'success' : 'not found');
                break;
            }

            case "user.deleted": {
                const result = await User.findByIdAndDelete(data.id);
                console.log('User deletion attempt:', data.id, result ? 'DELETED' : 'NOT FOUND');
                if (result) {
                    console.log('✅ User successfully deleted from database:', data.id);
                } else {
                    console.log('❌ User not found in database:', data.id);
                }
                break;
            }

            default:
                break;
        }
        res.json({ success: true, message: "Webhook Recieved" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
export default clerkWebhooks;