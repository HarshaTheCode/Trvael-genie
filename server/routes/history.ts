import { Router } from 'express';
import { authenticateJWT } from '../services/auth';
import { SupabaseService } from '../services/supabase';

const router = Router();

router.get('/', authenticateJWT, async (req: any, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const history = await SupabaseService.getSearchHistory(userId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const item = await SupabaseService.getSearchHistoryById(id);
    if (!item || item.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error('Get history item error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;

