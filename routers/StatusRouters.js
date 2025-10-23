import express from 'express';
import { getUserStatus, getOnlineUsers } from '../controllers/StatusController.js';

const router = express.Router();

router.get('/online', getOnlineUsers);
router.get('/:id', getUserStatus);

export default router;