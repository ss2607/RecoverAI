const Item = require('../models/Item');
const Match = require('../models/Match');
const { apiError } = require('../utils/apiError');

const getMatches = async () => {
  return await Match.find()
    .populate('lostItem')
    .populate('foundItem')
    .sort({ confidenceScore: -1 });
};

const getMatchById = async (id) => {
  const match = await Match.findById(id)
    .populate('lostItem')
    .populate('foundItem');
  if (!match) {
    throw new apiError('Match not found', 404);
  }
  return match;
};

const getMatchesByItemId = async (itemId) => {
  return await Match.find({
    $or: [{ lostItem: itemId }, { foundItem: itemId }]
  })
    .populate('lostItem')
    .populate('foundItem')
    .sort({ confidenceScore: -1 });
};

const deleteMatch = async (id) => {
  const match = await Match.findByIdAndDelete(id);
  if (!match) {
    throw new apiError('Match not found', 404);
  }
  return match;
};

const calculateMatchScore = (itemA, itemB) => {
  let score = 0;
  const matchedFields = [];

  // Category = 25%
  if (itemA.category && itemB.category && itemA.category.toLowerCase() === itemB.category.toLowerCase()) {
    score += 25;
    matchedFields.push('category');
  }

  // Location = 20%
  if (itemA.location && itemB.location) {
    const locA = itemA.location.toLowerCase();
    const locB = itemB.location.toLowerCase();
    if (locA.includes(locB) || locB.includes(locA)) {
      score += 20;
      matchedFields.push('location');
    }
  }

  // AI Tags = 20%
  if (itemA.aiTags && itemA.aiTags.length > 0 && itemB.aiTags && itemB.aiTags.length > 0) {
    const tagsA = itemA.aiTags.map(t => t.toLowerCase());
    const tagsB = itemB.aiTags.map(t => t.toLowerCase());
    const intersection = tagsA.filter(t => tagsB.includes(t));
    if (intersection.length > 0) {
      const maxTags = Math.min(tagsA.length, tagsB.length);
      const tagScore = (intersection.length / maxTags) * 20;
      score += tagScore;
      matchedFields.push('aiTags');
    }
  }

  // Date = 15%
  if (itemA.dateLostFound && itemB.dateLostFound) {
    const diffTime = Math.abs(new Date(itemA.dateLostFound) - new Date(itemB.dateLostFound));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays <= 7) {
      const dateScore = 15 * (1 - (diffDays / 7));
      score += dateScore;
      matchedFields.push('dateLostFound');
    }
  }

  // Color = 10%
  if (itemA.color && itemB.color && itemA.color.toLowerCase() === itemB.color.toLowerCase()) {
    score += 10;
    matchedFields.push('color');
  }

  // Description = 10%
  if (itemA.description && itemB.description) {
    const wordsA = itemA.description.toLowerCase().split(/\W+/);
    const wordsB = itemB.description.toLowerCase().split(/\W+/);
    const intersection = wordsA.filter(w => w.length > 3 && wordsB.includes(w));
    if (intersection.length >= 2) {
      score += 10;
      matchedFields.push('description');
    }
  }

  return { score: Math.round(score), matchedFields };
};

const runMatchingForItem = async (newItem) => {
  const targetType = newItem.type === 'lost' ? 'found' : 'lost';
  const potentialMatches = await Item.find({ type: targetType, status: 'open' });

  for (const item of potentialMatches) {
    const { score, matchedFields } = calculateMatchScore(newItem, item);
    
    if (score >= 60) {
      const lostItem = newItem.type === 'lost' ? newItem._id : item._id;
      const foundItem = newItem.type === 'found' ? newItem._id : item._id;

      const existingMatch = await Match.findOne({ lostItem, foundItem });
      if (!existingMatch) {
        await Match.create({
          lostItem,
          foundItem,
          confidenceScore: score,
          matchedFields,
          status: 'pending'
        });
      }
    }
  }
};

module.exports = {
  getMatches,
  getMatchById,
  getMatchesByItemId,
  deleteMatch,
  runMatchingForItem
};
