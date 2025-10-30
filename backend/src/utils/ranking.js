// Utilities for ranking and rank change

export function computeRanks(rows) {
  // rows: [{ studentId, name, subject, marks, grade, testName, date }]
  // Returns sorted with rank (1 highest). Handle ties by same marks getting same rank (dense ranking)
  const sorted = [...rows].sort((a, b) => b.marks - a.marks);
  let rank = 0;
  let lastMarks = null;
  let assigned = 0;
  return sorted.map((row) => {
    assigned += 1;
    if (lastMarks === null || row.marks !== lastMarks) {
      rank = assigned;
      lastMarks = row.marks;
    }
    return { ...row, rank };
  });
}

export function rankChange(currentRank, previousRank) {
  if (previousRank == null) return null; // unknown
  const delta = previousRank - currentRank; // positive = improved
  return delta; 
}

export function medalForRank(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}
