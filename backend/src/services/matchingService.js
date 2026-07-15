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

        // Emit Socket.IO Events
        try {
          const { emitToUser } = require('../config/socket');
          emitToUser(newItem.reportedBy.toString(), 'new_match', { item: newItem, score });
          emitToUser(item.reportedBy.toString(), 'new_match', { item, score });
        } catch (err) {
          console.error('Error emitting new_match socket events:', err);
        }
      }
    }
  }
};

const getItemMatches = async (itemId) => {
  const currentItem = await Item.findById(itemId);
  if (!currentItem) {
    throw new apiError('Item not found', 404);
  }

  const oppositeType = currentItem.type === 'lost' ? 'found' : 'lost';

  // Find opposite-type open/matched items, excluding this item
  const candidates = await Item.find({
    type: oppositeType,
    status: { $in: ['open', 'matched'] },
    _id: { $ne: itemId }
  });

  const matches = [];

  for (const candidate of candidates) {
    let score = 0;
    const matchedFieldsList = [];
    const matchingTags = [];

    // Category = 40
    if (currentItem.category && candidate.category && currentItem.category.toLowerCase() === candidate.category.toLowerCase()) {
      score += 40;
      matchedFieldsList.push('category');
    }

    // Color = 20
    if (currentItem.color && candidate.color && currentItem.color.toLowerCase() === candidate.color.toLowerCase()) {
      score += 20;
      matchedFieldsList.push('color');
    }

    // Brand = 15
    if (currentItem.brand && candidate.brand && currentItem.brand.toLowerCase() === candidate.brand.toLowerCase()) {
      score += 15;
      matchedFieldsList.push('brand');
    }

    // Each matching tag = 5
    if (currentItem.aiTags && currentItem.aiTags.length > 0 && candidate.aiTags && candidate.aiTags.length > 0) {
      const currentTags = currentItem.aiTags.map(t => t.toLowerCase());
      const candidateTags = candidate.aiTags.map(t => t.toLowerCase());
      
      const intersecting = currentTags.filter(t => candidateTags.includes(t));
      if (intersecting.length > 0) {
        score += intersecting.length * 5;
        matchedFieldsList.push('aiTags');
        intersecting.forEach(tag => matchingTags.push(tag));
      }
    }

    // Max score = 100
    if (score > 100) {
      score = 100;
    }

    if (score >= 40) {
      matches.push({
        item: candidate,
        similarityScore: score,
        matchedFields: {
          category: matchedFieldsList.includes('category'),
          color: matchedFieldsList.includes('color'),
          brand: matchedFieldsList.includes('brand'),
          matchingTags: matchingTags
        }
      });
    }
  }

  // Sort descending
  matches.sort((a, b) => b.similarityScore - a.similarityScore);

  return matches;
};

module.exports = {
  getMatches,
  getMatchById,
  getMatchesByItemId,
  deleteMatch,
  runMatchingForItem,
  getItemMatches
};
