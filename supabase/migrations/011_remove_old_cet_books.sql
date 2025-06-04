-- Remove old CET-4 Core and CET-6 Core vocabulary books
-- This migration safely removes the old vocabulary books and all associated data

-- Show the books that will be deleted (for logging)
-- SELECT name, total_words FROM vocabulary_books WHERE name IN ('CET-4 Core', 'CET-6 Core');

-- Step 1: Remove user word progress for words from these books
-- This removes any learning progress users have made on words from these books
DELETE FROM user_word_progress 
WHERE word_id IN (
  SELECT vw.id FROM vocabulary_words vw
  JOIN vocabulary_books vb ON vw.book_id = vb.id
  WHERE vb.name IN ('CET-4 Core', 'CET-6 Core')
);

-- Step 2: Remove user selections for these books
-- This removes any user's selection of these books as their active vocabulary
DELETE FROM user_vocabulary_books 
WHERE book_id IN (
  SELECT id FROM vocabulary_books 
  WHERE name IN ('CET-4 Core', 'CET-6 Core')
);

-- Step 3: Remove all words associated with these books
-- This removes the actual vocabulary words from these books
DELETE FROM vocabulary_words 
WHERE book_id IN (
  SELECT id FROM vocabulary_books 
  WHERE name IN ('CET-4 Core', 'CET-6 Core')
);

-- Step 4: Finally remove the vocabulary books themselves
-- This removes the book entries from the vocabulary_books table
DELETE FROM vocabulary_books 
WHERE name IN ('CET-4 Core', 'CET-6 Core'); 