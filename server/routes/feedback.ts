import { RequestHandler } from 'express';
import { randomUUID } from 'crypto';

// In-memory storage for development (replace with database)
interface ItineraryFeedback {
  id: string;
  itineraryId: string;
  userId?: string;
  feedbackValue: number; // -1 for thumbs down, 1 for thumbs up
  comment?: string;
  timestamp: Date;
}

const feedbackStorage = new Map<string, ItineraryFeedback>();
const userFeedback = new Map<string, Set<string>>(); // userId -> Set of itineraryIds they've given feedback for

/**
 * Submit feedback for an itinerary
 * POST /api/feedback
 */
export const submitFeedback: RequestHandler = async (req: any, res) => {
  try {
    const { itineraryId, feedbackValue, comment } = req.body;

    if (!itineraryId) {
      return res.status(400).json({
        success: false,
        message: 'Itinerary ID is required'
      });
    }

    if (feedbackValue !== 1 && feedbackValue !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Feedback value must be 1 (thumbs up) or -1 (thumbs down)'
      });
    }

    const userId = req.user?.id;

    // Check if user has already given feedback for this itinerary
    if (userId) {
      const userFeedbackSet = userFeedback.get(userId) || new Set();
      if (userFeedbackSet.has(itineraryId)) {
        return res.status(400).json({
          success: false,
          message: 'You have already provided feedback for this itinerary'
        });
      }
    }

    const feedbackId = randomUUID();
    const feedback: ItineraryFeedback = {
      id: feedbackId,
      itineraryId,
      userId,
      feedbackValue,
      comment: comment?.trim() || undefined,
      timestamp: new Date()
    };

    feedbackStorage.set(feedbackId, feedback);

    // Track user feedback to prevent duplicates
    if (userId) {
      const userFeedbackSet = userFeedback.get(userId) || new Set();
      userFeedbackSet.add(itineraryId);
      userFeedback.set(userId, userFeedbackSet);
    }

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback: {
        id: feedback.id,
        feedbackValue: feedback.feedbackValue,
        timestamp: feedback.timestamp
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

/**
 * Get feedback statistics for an itinerary
 * GET /api/feedback/:itineraryId
 */
export const getFeedbackStats: RequestHandler = async (req, res) => {
  try {
    const { itineraryId } = req.params;

    const itineraryFeedback = Array.from(feedbackStorage.values())
      .filter(feedback => feedback.itineraryId === itineraryId);

    const totalFeedback = itineraryFeedback.length;
    const positiveCount = itineraryFeedback.filter(f => f.feedbackValue === 1).length;
    const negativeCount = itineraryFeedback.filter(f => f.feedbackValue === -1).length;
    const averageRating = totalFeedback > 0 ? positiveCount / totalFeedback : 0;

    res.json({
      success: true,
      stats: {
        totalFeedback,
        positiveCount,
        negativeCount,
        averageRating: Math.round(averageRating * 100) / 100,
        recentFeedback: itineraryFeedback
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10)
          .map(f => ({
            feedbackValue: f.feedbackValue,
            comment: f.comment,
            timestamp: f.timestamp
          }))
      }
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics'
    });
  }
};

/**
 * Check if user has already given feedback for an itinerary
 * GET /api/feedback/check/:itineraryId
 */
export const checkUserFeedback: RequestHandler = async (req: any, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.json({
        success: true,
        hasGivenFeedback: false
      });
    }

    const userFeedbackSet = userFeedback.get(userId) || new Set();
    const hasGivenFeedback = userFeedbackSet.has(itineraryId);

    res.json({
      success: true,
      hasGivenFeedback
    });
  } catch (error) {
    console.error('Check user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feedback status'
    });
  }
};

/**
 * Get all feedback (admin only)
 * GET /api/admin/feedback
 */
export const getAllFeedback: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 50, itineraryId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let allFeedback = Array.from(feedbackStorage.values());

    // Filter by itinerary ID if provided
    if (itineraryId) {
      allFeedback = allFeedback.filter(f => f.itineraryId === itineraryId);
    }

    // Sort by timestamp (newest first)
    allFeedback.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const totalCount = allFeedback.length;
    const paginatedFeedback = allFeedback.slice(offset, offset + Number(limit));

    const stats = {
      totalFeedback: totalCount,
      positiveCount: allFeedback.filter(f => f.feedbackValue === 1).length,
      negativeCount: allFeedback.filter(f => f.feedbackValue === -1).length
    };

    res.json({
      success: true,
      feedback: paginatedFeedback.map(f => ({
        id: f.id,
        itineraryId: f.itineraryId,
        userId: f.userId,
        feedbackValue: f.feedbackValue,
        comment: f.comment,
        timestamp: f.timestamp
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};
