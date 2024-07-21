import express, { Request, Response } from 'express';
import { setSharedSecret, setSession, setPhantomWalletPublicKey, setSuccessTransaction } from '../services/telegramService';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.post('/external-data', async (req: Request, res: Response) => {
  try {
    const requestData = req.body;
    const handler = requestData.sharedSecret;
    const sharedSecret = Uint8Array.from(atob(handler), c => c.charCodeAt(0));
    setSharedSecret(sharedSecret);
    setSession(requestData.session);
    setPhantomWalletPublicKey(requestData.phantomWalletPublicKey);
    res.status(200).send('Data received successfully');
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/sign-data', async (req: Request, res: Response) => {
  try {
    setSuccessTransaction("True");
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default app;